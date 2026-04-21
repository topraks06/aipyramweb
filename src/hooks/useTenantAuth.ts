'use client';

import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { getTenant, type TenantId, type UserRole } from '@/lib/tenant-config';
import { useState, useEffect, useCallback } from 'react';

export type LicenseStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'none';

interface TenantAuthState {
  user: ReturnType<typeof useAuth>['user'];
  loading: boolean;
  isLicensed: boolean;
  licenseStatus: LicenseStatus;
  role: UserRole;
  permissions: string[];
  tenantId: TenantId;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerMember: (data: { email: string; password: string; name: string; company: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Admin e-posta listesi — environment variables'dan yüklenir
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').filter(Boolean);

/**
 * Universal Tenant Auth Hook
 * 
 * Kullanım:
 *   const auth = useTenantAuth('perde');
 *   const auth = useTenantAuth('hometex');
 *   const auth = useTenantAuth('trtex');
 * 
 * Aynı hook, farklı Firestore koleksiyonu okur (tenant-config'den).
 */
export function useTenantAuth(tenantId: TenantId): TenantAuthState {
  const tenant = getTenant(tenantId);
  const { user, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>('none');
  const [role, setRole] = useState<UserRole>('member');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [licenseLoading, setLicenseLoading] = useState(true);

  // Kullanıcı değiştiğinde Firestore'dan lisans + rol durumunu çek
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLicenseStatus('none');
      setRole('member');
      setPermissions([]);
      setLicenseLoading(false);
      return;
    }

    const checkMembership = async () => {
      try {
        // Admin kontrolü — tüm tenant'larda geçerli
        const isAdmin = ADMIN_EMAILS.includes(user.email || '');

        const memberDoc = await getDoc(doc(db, tenant.memberCollection, user.uid));
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          setLicenseStatus((data.license as LicenseStatus) || 'pending');
          setRole(isAdmin ? 'admin' : (data.role as UserRole) || 'member');
          setPermissions(data.permissions || derivePermissions(isAdmin ? 'admin' : (data.role || 'member')));
        } else {
          // İlk kez giriş yapan kullanıcı → otomatik kayıt oluştur
          const newRole: UserRole = isAdmin ? 'admin' : 'member';
          const newLicense: LicenseStatus = isAdmin ? 'active' : 'pending';
          await setDoc(doc(db, tenant.memberCollection, user.uid), {
            email: user.email,
            name: user.displayName || '',
            company: '',
            license: newLicense,
            role: newRole,
            permissions: derivePermissions(newRole),
            tenantId: tenant.id,
            createdAt: new Date().toISOString(),
            source: 'google_auth',
          });
          setLicenseStatus(newLicense);
          setRole(newRole);
          setPermissions(derivePermissions(newRole));
        }

        // --- Cüzdan Başlatma ---
        if (tenant.walletCollection) {
           fetch('/api/wallet/init', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ uid: user.uid, tenantId: tenant.id })
           }).catch(e => console.error("Wallet init failed", e));
        }
      } catch (err) {
        console.error(`[TENANT_AUTH:${tenant.id}] Üyelik kontrolü hatası:`, err);
        setLicenseStatus('none');
      } finally {
        setLicenseLoading(false);
      }
    };

    checkMembership();
  }, [user, authLoading, tenant.memberCollection, tenant.id]);

  // E-posta ile giriş
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      const code = err.code;
      let message = 'Giriş başarısız.';
      if (code === 'auth/user-not-found') message = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
      if (code === 'auth/wrong-password') message = 'Şifre hatalı.';
      if (code === 'auth/invalid-credential') message = 'E-posta veya şifre hatalı.';
      if (code === 'auth/too-many-requests') message = 'Çok fazla deneme. Lütfen bekleyin.';
      return { success: false, error: message };
    }
  }, []);

  // Üye kayıt
  const registerMember = useCallback(async (data: { email: string; password: string; name: string; company: string }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, tenant.memberCollection, credential.user.uid), {
        email: data.email,
        name: data.name,
        company: data.company,
        license: 'pending',
        role: 'member',
        permissions: derivePermissions('member'),
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
        source: 'email_register',
      });
      return { success: true };
    } catch (err: any) {
      const code = err.code;
      let message = 'Kayıt başarısız.';
      if (code === 'auth/email-already-in-use') message = 'Bu e-posta zaten kayıtlı.';
      if (code === 'auth/weak-password') message = 'Şifre en az 6 karakter olmalı.';
      if (code === 'auth/invalid-email') message = 'Geçersiz e-posta adresi.';
      return { success: false, error: message };
    }
  }, [tenant.memberCollection, tenant.id]);

  return {
    user,
    loading: authLoading || licenseLoading,
    isLicensed: licenseStatus === 'active',
    licenseStatus,
    role,
    permissions,
    tenantId: tenant.id as TenantId,
    loginWithGoogle,
    loginWithEmail,
    registerMember,
    logout,
  };
}

/**
 * Role → Permissions türetme
 * Merkezi yetki tablosu
 */
function derivePermissions(role: UserRole | string): string[] {
  switch (role) {
    case 'admin':
      return ['read', 'write', 'delete', 'manage_members', 'manage_content', 'trigger_cron', 'view_analytics'];
    case 'editor':
      return ['read', 'write', 'manage_content', 'view_analytics'];
    case 'member':
      return ['read', 'view_catalog', 'create_orders'];
    case 'viewer':
      return ['read'];
    default:
      return ['read'];
  }
}

'use client';

import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { getNode, type SovereignNodeId, type UserRole } from '@/lib/sovereign-config';
import { syncSovereignIdentity, type SovereignUser } from '@/lib/auth/SovereignIdentity';
import { useState, useEffect, useCallback } from 'react';

export type LicenseStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'none';

interface SovereignAuthState {
  user: ReturnType<typeof useAuth>['user'];
  loading: boolean;
  isLicensed: boolean;
  licenseStatus: LicenseStatus;
  role: UserRole;
  permissions: string[];
  SovereignNodeId: SovereignNodeId;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  registerMember: (data: { email: string; password: string; name: string; company: string; profession?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Admin e-posta listesi — environment variables'dan yüklenir
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').split(',').filter(Boolean);

/**
 * Universal node Auth Hook
 * 
 * Kullanım:
 *   const auth = useSovereignAuth('perde');
 *   const auth = useSovereignAuth('hometex');
 *   const auth = useSovereignAuth('trtex');
 * 
 * Aynı hook, farklı Firestore koleksiyonu okur (sovereign-config'den).
 */
export function useSovereignAuth(SovereignNodeId: SovereignNodeId): SovereignAuthState {
  const node = getNode(SovereignNodeId);
  const { user, loading: authLoading, loginWithGoogle, logout, loginWithEmail: providerLoginWithEmail } = useAuth();
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
        // Admin kontrolü — tüm node'larda geçerli
        const isAdmin = ADMIN_EMAILS.includes(user.email || '');

        // 1. Sync Universal Sovereign Identity
        await syncSovereignIdentity(user, node.id);

        const memberDoc = await getDoc(doc(db, node.memberCollection, user.uid));
        if (memberDoc.exists()) {
          const data = memberDoc.data();
          setLicenseStatus((data.license as LicenseStatus) || 'pending');
          setRole(isAdmin ? 'admin' : (data.role as UserRole) || 'member');
          setPermissions(data.permissions || derivePermissions(isAdmin ? 'admin' : (data.role || 'member')));
        } else {
          // İlk kez giriş yapan kullanıcı → otomatik kayıt oluştur
          const newRole: UserRole = isAdmin ? 'admin' : 'member';
          const newLicense: LicenseStatus = isAdmin ? 'active' : 'pending';
          await setDoc(doc(db, node.memberCollection, user.uid), {
            email: user.email,
            name: user.displayName || '',
            company: '',
            license: newLicense,
            role: newRole,
            permissions: derivePermissions(newRole),
            SovereignNodeId: node.id,
            createdAt: new Date().toISOString(),
            source: 'google_auth',
          });
          setLicenseStatus(newLicense);
          setRole(newRole);
          setPermissions(derivePermissions(newRole));
        }

        // --- Cüzdan Başlatma ---
        if (node.walletCollection) {
           fetch('/api/wallet/init', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ uid: user.uid, SovereignNodeId: node.id })
           }).catch(e => console.error("Wallet init failed", e));
        }
      } catch (err) {
        console.error(`[node_AUTH:${node.id}] Üyelik kontrolü hatası:`, err);
        setLicenseStatus('none');
      } finally {
        setLicenseLoading(false);
      }
    };

    checkMembership();
  }, [user, authLoading, node.memberCollection, node.id, node.walletCollection]);

  // E-posta ile giriş
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev && password === 'oyaalya123') {
         await providerLoginWithEmail(email, password);
         return { success: true };
      }
      
      await providerLoginWithEmail(email, password);
      // Not: Bypass devreye girmezse Firebase üzerinden login olur, provider error fırlatırsa catch'e düşer.
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
  }, [providerLoginWithEmail]);

  // Üye kayıt
  const registerMember = useCallback(async (data: { email: string; password: string; name: string; company: string; profession?: string }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, node.memberCollection, credential.user.uid), {
        email: data.email,
        name: data.name,
        company: data.company,
        profession: data.profession || 'diger',
        license: 'pending',
        role: 'member',
        permissions: derivePermissions('member'),
        SovereignNodeId: node.id,
        createdAt: new Date().toISOString(),
        source: 'email_register',
        onboardingCompleted: false,
      });
      // E-posta doğrulama linki gönder
      if (credential.user) {
        await sendEmailVerification(credential.user);
      }
      return { success: true };
    } catch (err: any) {
      const code = err.code;
      let message = 'Kayıt başarısız.';
      if (code === 'auth/email-already-in-use') message = 'Bu e-posta zaten kayıtlı.';
      if (code === 'auth/weak-password') message = 'Şifre en az 6 karakter olmalı.';
      if (code === 'auth/invalid-email') message = 'Geçersiz e-posta adresi.';
      return { success: false, error: message };
    }
  }, [node.memberCollection, node.id]);

  return {
    user,
    loading: authLoading || licenseLoading,
    isLicensed: licenseStatus === 'active',
    licenseStatus,
    role,
    permissions,
    SovereignNodeId: node.id as SovereignNodeId,
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

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import type { User } from 'firebase/auth';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN IDENTITY — Unified SSO Kimlik Sistemi
 *  
 *  Google SSO mantığı: Tek hesap, 7 node, sınırsız erişim.
 *  sovereign_users/{uid} = TEK GERÇEK KAYNAK
 *  
 *  7 Ana Node: aipyram, trtex, perde, icmimar, vorhang, hometex, heimtex
 *  Sonradan eklenecek node'lar da otomatik dahil olur.
 * ═══════════════════════════════════════════════════════════════
 */

export interface SovereignPassport {
  passportId: string;           // SVR-2026-HT-001
  issuedAt: string;
  verifiedBadges: string[];     // ['email', 'google', 'phone']
  memberSince: string;
  totalDesigns: number;
  totalOrders: number;
  favoriteNode: string;
}

export type SovereignTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Free';
export type SovereignGlobalRole = 'sovereign' | 'admin' | 'pro' | 'member' | 'free';

export interface SovereignUser {
  uid: string;
  email: string | null;
  name: string;
  photoURL?: string;
  globalRole: SovereignGlobalRole;
  tier: SovereignTier;
  nodes: string[];              // Aktif olduğu node'lar
  unifiedCredits: number;       // TEK cüzdan — tüm node'larda geçerli
  creditUsage: Record<string, number>; // { render: 45, chat: 120 }
  lastActiveNode: string;
  lastActiveAt: string;
  createdAt: string;
  passport: SovereignPassport;
}

// ADMIN email'leri — env'den
const SOVEREIGN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hakantoprak71@gmail.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

/**
 * Pasaport ID oluştur — SVR-YYYY-XX-NNN
 */
function generatePassportId(uid: string): string {
  const year = new Date().getFullYear();
  const hash = uid.substring(0, 3).toUpperCase();
  const seq = Math.abs(uid.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 999) + 1;
  return `SVR-${year}-${hash}-${String(seq).padStart(3, '0')}`;
}

/**
 * Tier hesapla — kullanıcı verilerine göre otomatik
 */
function calculateTier(data: Partial<SovereignUser>): SovereignTier {
  if (SOVEREIGN_EMAILS.includes(data.email?.toLowerCase() || '')) return 'Platinum';
  if (data.globalRole === 'sovereign' || data.globalRole === 'admin') return 'Platinum';
  
  const totalDesigns = data.passport?.totalDesigns || 0;
  const totalOrders = data.passport?.totalOrders || 0;
  const credits = data.unifiedCredits || 0;
  
  if (totalDesigns >= 10 || totalOrders >= 5 || credits >= 100) return 'Gold';
  if (totalDesigns >= 1 || totalOrders >= 1) return 'Silver';
  if (data.passport?.verifiedBadges?.includes('email')) return 'Bronze';
  
  return 'Free';
}

/**
 * Universal Sovereign Identity Manager
 * 
 * Kullanıcı herhangi bir node'a giriş yaptığında:
 * 1. sovereign_users/{uid} varsa → güncelle (node ekle, lastActive)
 * 2. Yoksa → yeni kayıt oluştur (pasaport, tier, başlangıç kredisi)
 * 3. Node-spesifik üyelik kaydını da oluştur/güncelle
 */
export async function syncSovereignIdentity(user: User, activeNode: string): Promise<SovereignUser> {
  const sovereignRef = doc(db, 'sovereign_users', user.uid);
  const snap = await getDoc(sovereignRef);

  const now = new Date().toISOString();
  const isSovereign = SOVEREIGN_EMAILS.includes(user.email?.toLowerCase() || '');

  if (snap.exists()) {
    const data = snap.data() as SovereignUser;
    
    const updates: Record<string, any> = {
      lastActiveAt: now,
      lastActiveNode: activeNode,
    };

    // Node listesine ekle (yoksa)
    if (!data.nodes.includes(activeNode)) {
      updates.nodes = [...data.nodes, activeNode];
    }

    // Tier güncellemesini kontrol et
    const newTier = calculateTier(data);
    if (newTier !== data.tier) {
      updates.tier = newTier;
    }

    // Sovereign rolünü güncelle (admin mail ile giriş yapıyorsa)
    if (isSovereign && data.globalRole !== 'sovereign') {
      updates.globalRole = 'sovereign';
      updates.tier = 'Platinum';
      updates.unifiedCredits = 99999;
    }

    // Badge güncelle
    const badges = [...(data.passport?.verifiedBadges || [])];
    if (user.emailVerified && !badges.includes('email')) badges.push('email');
    if (user.providerData?.some(p => p.providerId === 'google.com') && !badges.includes('google')) badges.push('google');
    if (badges.length !== (data.passport?.verifiedBadges?.length || 0)) {
      updates['passport.verifiedBadges'] = badges;
    }

    await updateDoc(sovereignRef, updates);

    return { ...data, ...updates } as SovereignUser;
  } else {
    // ═══ YENİ KULLANICI ═══
    const globalRole: SovereignGlobalRole = isSovereign ? 'sovereign' : 'free';
    const initialCredits = isSovereign ? 99999 : 5; // Yeni üye = 5 başlangıç kredisi

    const badges: string[] = [];
    if (user.emailVerified) badges.push('email');
    if (user.providerData?.some(p => p.providerId === 'google.com')) badges.push('google');

    const newUser: SovereignUser = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      photoURL: user.photoURL || undefined,
      globalRole,
      tier: isSovereign ? 'Platinum' : (badges.includes('email') ? 'Bronze' : 'Free'),
      nodes: [activeNode],
      unifiedCredits: initialCredits,
      creditUsage: {},
      lastActiveNode: activeNode,
      lastActiveAt: now,
      createdAt: now,
      passport: {
        passportId: generatePassportId(user.uid),
        issuedAt: now,
        verifiedBadges: badges,
        memberSince: now,
        totalDesigns: 0,
        totalOrders: 0,
        favoriteNode: activeNode,
      },
    };

    await setDoc(sovereignRef, newUser);
    console.log(`[SOVEREIGN IDENTITY] 🆕 Yeni Sovereign Passport: ${newUser.passport.passportId} (${user.email})`);
    return newUser;
  }
}

/**
 * Sovereign kullanıcı verilerini çek (read-only)
 */
export async function getSovereignUser(uid: string): Promise<SovereignUser | null> {
  try {
    const snap = await getDoc(doc(db, 'sovereign_users', uid));
    return snap.exists() ? snap.data() as SovereignUser : null;
  } catch {
    return null;
  }
}

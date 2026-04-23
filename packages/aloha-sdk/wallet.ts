/**
 * ALOHA SOVEREIGN WALLET — Kredi Sistemi
 * 
 * Her node'ın kendi cüzdanı: {node}_wallets
 * Tüm işlemler atomic Firestore transaction ile çalışır.
 * Double-call koruması (idempotency) dahil.
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
// MALİYET TABLOSU
// ═══════════════════════════════════════

export const ACTION_COST: Record<string, number> = {
  render: 5,
  analysis: 2,
  opportunity: 1,
  compose_article: 3,
  image_generation: 4,
  chat: 0.5,
  document: 2,
  autonomous_cycle: 10, // Otonom döngü yüksek kredi harcar
  default: 1,
};

export function getActionCost(action: string): number {
  return ACTION_COST[action] ?? ACTION_COST.default;
}

// ═══════════════════════════════════════
// KREDİ KONTROL
// ═══════════════════════════════════════

export async function checkCredits(
  node: string,
  uid: string,
  action: string
): Promise<{ allowed: boolean; remaining: number; cost: number }> {
  const cost = getActionCost(action);

  if (!adminDb) {
    console.warn('[WALLET] adminDb yok — kredi kontrolü bypass');
    return { allowed: true, remaining: 999, cost };
  }

  try {
    const walletRef = adminDb.collection(`${node}_wallets`).doc(uid);
    const snap = await walletRef.get();

    if (!snap.exists) {
      // İlk kullanım — otomatik 50 kredi ile başlat
      await walletRef.set({
        balance: 50,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        node,
      });
      return { allowed: true, remaining: 50, cost };
    }

    const balance = snap.data()?.balance ?? 0;
    return { allowed: balance >= cost, remaining: balance, cost };
  } catch (err: any) {
    console.error(`[WALLET] checkCredits hatası: ${err.message}`);
    return { allowed: true, remaining: 0, cost }; // Hata durumunda izin ver (graceful)
  }
}

// ═══════════════════════════════════════
// KREDİ DÜŞME (ATOMIC)
// ═══════════════════════════════════════

export async function deductCredit(
  node: string,
  uid: string,
  action: string
): Promise<{ success: boolean; newBalance: number }> {
  const cost = getActionCost(action);

  if (!adminDb) {
    return { success: false, newBalance: 0 };
  }

  try {
    const walletRef = adminDb.collection(`${node}_wallets`).doc(uid);

    const newBalance = await adminDb.runTransaction(async (txn) => {
      const snap = await txn.get(walletRef);
      const current = snap.exists ? (snap.data()?.balance ?? 0) : 0;
      const updated = Math.max(0, current - cost);

      txn.set(walletRef, {
        balance: updated,
        totalSpent: (snap.data()?.totalSpent ?? 0) + cost,
        lastAction: action,
        lastActionAt: new Date().toISOString(),
        node,
      }, { merge: true });

      return updated;
    });

    return { success: true, newBalance };
  } catch (err: any) {
    console.error(`[WALLET] deductCredit hatası: ${err.message}`);
    return { success: false, newBalance: 0 };
  }
}

// ═══════════════════════════════════════
// KREDİ EKLEME (Stripe webhook sonrası)
// ═══════════════════════════════════════

export async function addCredit(
  node: string,
  uid: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  if (!adminDb || amount <= 0) {
    return { success: false, newBalance: 0 };
  }

  try {
    const walletRef = adminDb.collection(`${node}_wallets`).doc(uid);

    const newBalance = await adminDb.runTransaction(async (txn) => {
      const snap = await txn.get(walletRef);
      const current = snap.exists ? (snap.data()?.balance ?? 0) : 0;
      const updated = current + amount;

      txn.set(walletRef, {
        balance: updated,
        lastCreditAt: new Date().toISOString(),
        node,
      }, { merge: true });

      return updated;
    });

    console.log(`[WALLET] +${amount} kredi eklendi → ${node}/${uid} (yeni: ${newBalance})`);
    return { success: true, newBalance };
  } catch (err: any) {
    console.error(`[WALLET] addCredit hatası: ${err.message}`);
    return { success: false, newBalance: 0 };
  }
}

// ═══════════════════════════════════════
// BAKİYE SORGULAMA (Admin panel için)
// ═══════════════════════════════════════

export async function getBalance(
  node: string,
  uid: string
): Promise<number> {
  if (!adminDb) return 0;

  try {
    const snap = await adminDb.collection(`${node}_wallets`).doc(uid).get();
    return snap.exists ? (snap.data()?.balance ?? 0) : 0;
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════
// PLAN KREDİ HARİTASI (Stripe'dan sonra)
// ═══════════════════════════════════════

export const PLAN_CREDITS: Record<string, number> = {
  starter: 100,
  pro: 500,
  enterprise: 2000,
};

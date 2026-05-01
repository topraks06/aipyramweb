/**
 * RENDER BUDGET GUARD v2.0 — Maliyet + Adet + Render Tipi Kontrolü
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  icmimar.ai render isteklerini kontrollü şekilde geçirir.    ║
 * ║  Sadece adet DEĞİL, para ($) kontrolü de yapar.             ║
 * ║  Render tipi: curtain/wall/sofa/full_room                   ║
 * ║  → ileride: otomatik fiyat, sipariş, Perde.ai entegrasyonu  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { adminDb } from '@/lib/firebase-admin';
import { 
  checkNodeAuthority, 
  recordNodeRenderUsage, 
  logAudit,
  type ActionType,
  type RenderType 
} from './sovereignAuthority';

// ═══════════════════════════════════════
//  TİP TANIMLARI
// ═══════════════════════════════════════

export interface RenderRequest {
  userId: string;
  userEmail: string;
  nodeId: string;
  prompt: string;
  referenceImageUrl?: string;
  renderType: RenderType;          // 🎯 Zorunlu — curtain/wall/sofa/full_room
  style?: 'modern' | 'classic' | 'minimalist' | 'luxury';
  aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
}

export interface RenderResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  renderCreditsRemaining?: number;
  costUSD?: number;
  renderType?: RenderType;
}

export interface RenderBudgetStatus {
  allowed: boolean;
  reason: string;
  nodeRendersToday: number;
  nodeRenderLimit: number;
  userCreditsRemaining: number;
  estimatedCostUSD: number;
  remainingDailyCostUSD: number;
}

// ═══════════════════════════════════════
//  SOVEREIGN BYPASS
// ═══════════════════════════════════════

const SOVEREIGN_BYPASS_EMAIL = 'hakantoprak71@gmail.com';

// ═══════════════════════════════════════
//  KULLANICI KREDİ KONTROLÜ
// ═══════════════════════════════════════

async function checkUserCredits(userId: string, userEmail: string): Promise<{ hasCredits: boolean; remaining: number }> {
  if (userEmail === SOVEREIGN_BYPASS_EMAIL) {
    return { hasCredits: true, remaining: 99999 };
  }

  if (!adminDb) {
    return { hasCredits: true, remaining: 5 };
  }

  try {
    const userDoc = await adminDb.collection('sovereign_users').doc(userId).get();
    if (!userDoc.exists) {
      return { hasCredits: false, remaining: 0 };
    }

    const data = userDoc.data();
    const credits = data?.unifiedCredits || 0;
    return { hasCredits: credits > 0, remaining: credits };
  } catch {
    return { hasCredits: true, remaining: 5 };
  }
}

async function deductUserCredit(userId: string, nodeId: string, renderType: RenderType): Promise<void> {
  if (!adminDb) return;

  try {
    const userRef = adminDb.collection('sovereign_users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const data = userDoc.data();
      const currentCredits = data?.unifiedCredits || 0;
      
      await userRef.update({
        unifiedCredits: Math.max(0, currentCredits - 1),
        [`creditUsage.${nodeId}`]: (data?.creditUsage?.[nodeId] || 0) + 1,
        [`renderTypeUsage.${renderType}`]: (data?.renderTypeUsage?.[renderType] || 0) + 1,
        lastRenderAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[RENDER_GUARD] Kredi düşüş hatası:', err);
  }
}

// ═══════════════════════════════════════
//  ANA KONTROL FONKSİYONU
// ═══════════════════════════════════════

/**
 * Render isteğinin tüm kontrol katmanlarından geçip geçmediğini doğrula
 * 
 * Kontrol sırası:
 * 1. Global Kill Switch (sovereignAuthority)
 * 2. Action-Level Permission (image_generation yetkisi)
 * 3. Render tipi yetkisi
 * 4. Maliyet ($) kontrolü
 * 5. Kullanıcı kredi bakiyesi
 */
export async function checkRenderBudget(request: RenderRequest): Promise<RenderBudgetStatus> {
  const { nodeId, userId, userEmail, renderType } = request;

  // 1-4. Merkezi yetki kontrolü (action-level + cost + kill switch)
  const nodeAuth = await checkNodeAuthority(nodeId, 'image_generation', userEmail, renderType);
  
  if (!nodeAuth.allowed) {
    return {
      allowed: false,
      reason: nodeAuth.reason,
      nodeRendersToday: 0,
      nodeRenderLimit: 0,
      userCreditsRemaining: 0,
      estimatedCostUSD: 0,
      remainingDailyCostUSD: 0,
    };
  }

  // 5. Kullanıcı kredisi
  const credits = await checkUserCredits(userId, userEmail);
  
  if (!credits.hasCredits) {
    logAudit({
      timestamp: new Date().toISOString(),
      nodeId,
      agentId: 'render_guard',
      action: 'image_generation',
      approved: false,
      reason: 'Kullanıcı kredisi yetersiz',
      renderType,
    });

    return {
      allowed: false,
      reason: `Render krediniz tükendi. Yeni kredi satın alın veya ücretsiz deneme haklarınızı kontrol edin.`,
      nodeRendersToday: 0,
      nodeRenderLimit: nodeAuth.remainingBudget?.renders || 0,
      userCreditsRemaining: 0,
      estimatedCostUSD: 0,
      remainingDailyCostUSD: nodeAuth.remainingBudget?.costUSD || 0,
    };
  }

  // ✅ TÜM KONTROLLERDEN GEÇTİ
  return {
    allowed: true,
    reason: 'OK',
    nodeRendersToday: 0,
    nodeRenderLimit: nodeAuth.remainingBudget?.renders || 10,
    userCreditsRemaining: credits.remaining,
    estimatedCostUSD: 0.04, // Varsayılan render maliyeti
    remainingDailyCostUSD: nodeAuth.remainingBudget?.costUSD || 0,
  };
}

/**
 * Render işlemi sonrası kullanım kayıtlarını güncelle
 */
export async function recordRenderCompletion(request: RenderRequest): Promise<void> {
  const { nodeId, userId, userEmail, renderType } = request;

  // 1. Node render sayacını artır + maliyet kaydet
  recordNodeRenderUsage(nodeId, renderType);

  // 2. Kullanıcı kredisini düş (Sovereign bypass hariç)
  if (userEmail !== SOVEREIGN_BYPASS_EMAIL) {
    await deductUserCredit(userId, nodeId, renderType);
  }

  // 3. Detaylı render log (analytics + gelecek sipariş sistemi için)
  if (adminDb) {
    try {
      await adminDb.collection('icmimar_render_log').add({
        userId,
        userEmail,
        nodeId,
        renderType,                    // 🎯 Render tipi — ileride fiyat + sipariş
        prompt: request.prompt?.substring(0, 200),
        style: request.style || 'modern',
        aspectRatio: request.aspectRatio || '16:9',
        referenceImageProvided: !!request.referenceImageUrl,
        timestamp: new Date().toISOString(),
        success: true,
      });
    } catch { /* fire & forget */ }
  }
}

import { NextResponse } from 'next/server';
import { TenderAgent } from '@/core/aloha/tenderAgent';
import { FinanceMinister } from '@/core/aloha/financeMinister';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Search grounding and multiple calls might take time

/**
 * GET /api/cron/tender-cycle
 * 
 * 48 saatte bir (veya haftalık) çalışması öngörülen Global İhale ve Ticaret Radarı ajanı.
 * Google Search Grounding kullanarak tüm dünyadaki güncel tekstil ihalelerini Firebase'e yazar.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET || 'aloha-cron-sovereign-2026';
  
  // 1. Yetkilendirme
  const authHeader = req.headers.get('authorization');
  const xCronSecret = req.headers.get('x-cron-secret');
  
  const isAuthorized = 
    (authHeader === `Bearer ${cronSecret}`) || 
    (xCronSecret === cronSecret) || 
    (process.env.NODE_ENV === 'development');

  if (!isAuthorized) {
    console.warn('[TENDER CRON] ❌ Yetkisiz erişim denemesi');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[TENDER CRON] 🌐 Global İhale Ajanı (TenderAgent) başlatılıyor...');
    
    // 2. MALIYE BAKANI (BÜTÇE KONTROLÜ)
    // maxBatches=8 -> 8 istek * $0.035 (Gemini Search Grounding Base) = $0.28 USD
    const ESTIMATED_COST = 0.28;
    await FinanceMinister.requestBudget(ESTIMATED_COST, 'TenderAgent Global Hunt');

    // 3. İŞLEM (Google Search Grounding)
    const tenderCount = await TenderAgent.executeGlobalHunt(8);

    // 4. MALIYE BAKANINA FATURA KESİLMESİ
    await FinanceMinister.recordActualSpend(ESTIMATED_COST, 'TenderAgent Global Hunt');

    console.log(`[TENDER CRON] ✅ Tarama tamamlandı. Bulunan fırsat sayısı: ${tenderCount}`);
    
    return NextResponse.json({
      success: true,
      mode: 'tender-hunt',
      tendersFound: tenderCount,
      timestamp: Date.now()
    });

  } catch (err: any) {
    console.error('[TENDER CRON] 💥 Kritik Hata:', err);
    // Bütçe hatası vb. durumlarda JSON dönerek cron'un timeout yemesini engelliyoruz
    return NextResponse.json({ error: err.message }, { status: err.message.includes('MALIYE BAKANI') ? 402 : 500 });
  }
}

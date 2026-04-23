import { adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';
import { sendMessage, enrichOrderMessage } from './WhatsAppAgent';

export interface AbandonedQuote {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Retention Agent — Terk edilmiş teklifleri takip eder.
 * 48 saat içinde onaylanmamış teklifleri bulur ve WhatsApp takip mesajı hazırlar.
 */
export async function checkAbandonedQuotes(SovereignNodeId: string): Promise<AbandonedQuote[]> {
  console.log(`[RetentionAgent] ${SovereignNodeId} için terk edilmiş siparişler taranıyor...`);
  
  const config = getNode(SovereignNodeId);
  const now = new Date();
  // 48 hours ago
  const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
  
  try {
    // Basic query looking for untouched 's1' (Waiting for Quote Approval) items
    const snap = await adminDb.collection(config.projectCollection)
      .where('status', 'in', ['s1'])
      .where('updatedAt', '<', twoDaysAgo.toISOString())
      .limit(20)
      .get();
      
    const abandoned: AbandonedQuote[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AbandonedQuote));
    console.log(`[RetentionAgent] ${SovereignNodeId} -> ${abandoned.length} adet terk edilmiş teklif bulundu.`);
    
    return abandoned;
  } catch (error) {
    console.error(`[RetentionAgent] Hata (${SovereignNodeId}):`, error);
    return [];
  }
}

/**
 * Terk edilmiş teklifler için otomatik takip aksiyonu başlatır.
 * Her terk edilmiş teklif için WhatsApp taslak linki oluşturur.
 */
export async function triggerFollowUp(SovereignNodeId: string): Promise<{ processed: number; results: any[] }> {
  console.log(`[RetentionAgent] ${SovereignNodeId} için otomatik takip başlatılıyor...`);
  
  const abandoned = await checkAbandonedQuotes(SovereignNodeId);
  const results: any[] = [];

  for (const quote of abandoned) {
    if (!quote.customerPhone) {
      results.push({ id: quote.id, status: 'skipped', reason: 'Telefon numarası yok' });
      continue;
    }

    try {
      const followUpMessage = [
        `Merhaba ${quote.customerName || ''},`,
        `Sizin için hazırladığımız teklifi inceleme fırsatınız oldu mu?`,
        `Sorularınız varsa bize ulaşabilirsiniz.`,
        ``,
        `AIPyram B2B Takip Sistemi`
      ].join('\n');

      const waResult = await sendMessage(SovereignNodeId, quote.customerPhone, followUpMessage, quote.id);
      
      // Mark as follow-up sent
      try {
        await adminDb.collection(getNode(SovereignNodeId).projectCollection).doc(quote.id).update({
          retentionFollowUpSentAt: new Date().toISOString(),
          retentionFollowUpLink: waResult.waLink
        });
      } catch { /* non-critical */ }

      results.push({ id: quote.id, status: 'follow_up_sent', waLink: waResult.waLink });
    } catch (err) {
      results.push({ id: quote.id, status: 'error', error: String(err) });
    }
  }

  console.log(`[RetentionAgent] ${SovereignNodeId} -> ${results.length} teklif işlendi.`);
  return { processed: results.length, results };
}

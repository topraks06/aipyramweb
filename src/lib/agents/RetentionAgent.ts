import { adminDb } from '@/lib/firebase-admin';
import { getTenant } from '@/lib/tenant-config';

export async function checkAbandonedQuotes(tenantId: string): Promise<any[]> {
  console.log(`[RetentionAgent] ${tenantId} için terk edilmiş siparişler taranıyor...`);
  
  const config = getTenant(tenantId);
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
      
    const abandoned = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`[RetentionAgent] ${tenantId} -> ${abandoned.length} adet sonuç bulundu.`);
    
    // In a real flow, it would trigger WhatsAppAgent or email to send "Hala ilgileniyor musunuz?" message
    return abandoned;
  } catch (error) {
    console.error(`[RetentionAgent] Hata (${tenantId}):`, error);
    return [];
  }
}

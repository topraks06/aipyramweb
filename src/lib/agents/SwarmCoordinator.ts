import { swarmBus, SwarmEvents } from './EventBus';
import * as PolyglotAgent from './PolyglotAgent';
import * as TrendHarvesterAgent from './TrendHarvesterAgent';
import * as MatchmakerAgent from './MatchmakerAgent';
import { invokeAgent } from '@/lib/aloha/registry';

/**
 * SwarmCoordinator: Tüm ajanların (Agent Swarm) dinleme ve tepki verme
 * kurallarını (Koreografisini) yöneten ana beyin.
 */
export function initializeSwarm() {
  console.log('[Swarm Coordinator] Ajan Sürüsü (Agent Swarm) başlatılıyor...');

  // 1. KURAL: Yeni bir TREND bulunduğunda -> Polyglot Ajanı bunu 7 dile çevirsin
  swarmBus.on(SwarmEvents.TREND_DISCOVERED, async (payload) => {
    console.log(`[Swarm Coordinator] TREND_DISCOVERED olayı yakalandı: "${payload.title}"`);
    console.log(`[Swarm Coordinator] Polyglot Ajanı çeviri için tetikleniyor...`);
    
    try {
      // Örnek olarak 3 dile çeviri isteği atıyoruz
      const translations = await PolyglotAgent.translateContent(payload.description, ['tr', 'de', 'ar']);
      console.log(`[Swarm Coordinator] Polyglot Ajanı çeviriyi tamamladı:`, translations);
      // İleride bu çeviriler Prisma ile veritabanına kaydedilecek
    } catch (error) {
      console.error(`[Swarm Coordinator] Polyglot Ajanı hatası:`, error);
    }
  });

  // 2. KURAL: Yeni bir ALIM TALEBİ (RFQ) oluşturulduğunda -> Matchmaker Ajanı eşleştirme yapsın
  swarmBus.on(SwarmEvents.RFQ_CREATED, async (payload) => {
    console.log(`[Swarm Coordinator] RFQ_CREATED olayı yakalandı: "${payload.productType}"`);
    console.log(`[Swarm Coordinator] Matchmaker Ajanı uygun tedarikçileri bulmak için tetikleniyor...`);
    
    try {
      const matches = await MatchmakerAgent.matchSupplierWithRFQ(payload, []);
      console.log(`[Swarm Coordinator] Matchmaker Ajanı eşleştirmeleri tamamladı. ${matches.length} tedarikçi bulundu.`);
      
      // Eşleşmeler bulunduğunda yeni bir olay fırlat (Örn: Bildirim ajanı için)
      swarmBus.emit(SwarmEvents.MATCHES_FOUND, { rfqId: payload.id, matches });
    } catch (error) {
      console.error(`[Swarm Coordinator] Matchmaker Ajanı hatası:`, error);
    }
  });

  // 3. KURAL: EŞLEŞMELER BULUNDUĞUNDA -> Polyglot Ajanı tedarikçilere kendi dillerinde mesaj hazırlasın
  swarmBus.on(SwarmEvents.MATCHES_FOUND, async (payload) => {
    console.log(`[Swarm Coordinator] MATCHES_FOUND olayı yakalandı. RFQ ID: ${payload.rfqId}`);
    console.log(`[Swarm Coordinator] Polyglot Ajanı tedarikçilere özel bildirimleri çeviriyor...`);
    // Çeviri ve bildirim mantığı buraya eklenecek
  });

  // 4. KURAL: ORDER_CREATED -> DocumentAgent proforma pdf hazırlasın
  swarmBus.on(SwarmEvents.ORDER_CREATED, async (payload) => {
    console.log(`[Swarm Coordinator] ORDER_CREATED yakalandı. PDF üretilecek. ID: ${payload.orderId}`);
    try {
        await invokeAgent({ 
            agentType: 'document', 
            SovereignNodeId: payload.SovereignNodeId, 
            payload: { orderId: payload.orderId, data: payload.data } 
        });
    } catch(e) { console.error(e); }
  });

  // 5. KURAL: DOCUMENT_GENERATED -> WhatsAppAgent gönderimi
  swarmBus.on('AGENT_COMPLETED_DOCUMENT', async (payload) => {
    console.log(`[Swarm Coordinator] PDF Üretildi. WhatsApp tetikleniyor...`);
    // Example: Only send if phone exists in context
    if (payload.payload?.phone) {
        try {
            await invokeAgent({
                agentType: 'whatsapp',
                SovereignNodeId: payload.SovereignNodeId,
                payload: { orderId: payload.payload.orderId, phone: payload.payload.phone, message: "Teklif PDF'iniz hazır." }
            });
        } catch(e) { console.error(e); }
    }
  });

  // 6. KURAL: RENDER_COMPLETED -> Katalog veya Library'e ekle
  swarmBus.on('AGENT_COMPLETED_RENDER', async (payload) => {
      console.log(`[Swarm Coordinator] RENDER başarılı. Katalog kontrolü...`);
  });

  // 7. KURAL: QUOTE_ABANDONED -> RetentionAgent hatırlatma göndersin
  swarmBus.on(SwarmEvents.QUOTE_ABANDONED, async (payload) => {
      console.log(`[Swarm Coordinator] ${payload.abandonedCount} sepet terk tespit edildi. Geri kazanım (Retention) başlıyor.`);
  });

  console.log('[Swarm Coordinator] Tüm ajanlar iletişim ağına (EventBus) bağlandı ve (Sovereign Hub) kuralları yüklendi.');
}

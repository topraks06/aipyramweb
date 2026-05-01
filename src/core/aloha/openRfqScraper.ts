import { alohaAI } from './aiClient';
import { db } from '../../integrations/Firebase/server';

/**
 * ═══════════════════════════════════════════════════════════════
 * TRTex Açık Kaynak İhale & RFQ Radarı (Open Source Intelligence)
 * ═══════════════════════════════════════════════════════════════
 * 
 * KURALLAR (Hakan Bey Talimatı — Kutsal):
 * 1. MOCK VERİ YASAK. Tek bir sahte satır bile sisteme giremez.
 * 2. KALİTE FİLTRESİ: Firma adı, ürün bilgisi veya iletişim yoksa → DİSKALİFİYE.
 * 3. ÖNCELİK: Şeffaf (açık) ihaleler önce. Kapalı devre (PDF arkası) son sırada.
 * 4. EKONOMİK: 3 günde bir çalışır. Gece 02:00-06:00 UTC (API kredisi ucuz).
 * 5. GLOBAL: Tüm dünya — en küçük ülke bile taranır.
 * 6. FİRMALAR BİZDE İLAN VEREBİLİR: Harici + dahili ilan kabul edilir.
 */

export interface QualifiedRFQ {
  id: string;
  title: string;
  description: string;
  buyerName: string;         // ZORUNLU — yoksa sisteme girmez
  location: string;
  estimated_value: string;
  deadline: string;
  products: { name: string; quantity: string; spec: string }[];  // ZORUNLU — en az 1 ürün
  requirements: string[];
  source: string;            // Kaynak adı (Örn: "UNGM", "SAM.gov", "TRTex Kullanıcı İlanı")
  source_url: string;        // Orijinal link
  source_type: 'OPEN' | 'SEMI_OPEN' | 'CLOSED';  // Şeffaflık seviyesi
  contact_hint: string;      // İletişim ipucu (varsa)
  ai_analysis: string;       // AI istihbarat notu
  logistics_hint: string;    // Lojistik/gümrük ipucu
  score: number;             // Fırsat skoru (0-100)
  quality_pass: boolean;     // Kalite filtresinden geçti mi?
  cpv: string;
  createdAt: number;
  updatedAt: number;
}

// ══════════════════════════════════════
// KALİTE FİLTRESİ — Çöp Veri Engelleyici
// ══════════════════════════════════════
const QUALITY_GATE = {
  /** Alıcı/firma adı zorunlu mu? */
  requireBuyerName: true,
  /** En az 1 ürün kalemi zorunlu mu? */
  requireProducts: true,
  /** Minimum fırsat skoru (bunun altındakiler kaydedilmez) */
  minScore: 40,
  /** Kara liste kelimeleri (spam/sahte ilanları filtreler) */
  blacklist: ['test', 'demo', 'sample', 'placeholder', 'lorem ipsum'],
};

export class OpenRfqScraper {
  
  /**
   * Ana çalıştırma döngüsü.
   * Cron/Scheduler tarafından 3 günde bir, gece 02:00–06:00 UTC arasında tetiklenir.
   */
  static async run(): Promise<{ total: number; qualified: number; rejected: number }> {
    console.log('[OPEN-RFQ] 🌐 Global Açık Kaynak Radarı Başlatılıyor...');
    console.log(`[OPEN-RFQ] ⏰ Zaman: ${new Date().toISOString()}`);
    
    // 1. Daha önce çekilmiş mi kontrol et (3 gün kuralı)
    const shouldRun = await this.checkCooldown();
    if (!shouldRun) {
      console.log('[OPEN-RFQ] ⏳ Son tarama 3 günden yeni. Atlanıyor.');
      return { total: 0, qualified: 0, rejected: 0 };
    }

    // 2. Çoklu açık kaynaktan veri çek (Google Search Grounding ile — ekonomik)
    const rawResults = await this.fetchGlobalOpenSources();
    if (!rawResults || rawResults.length === 0) {
      console.log('[OPEN-RFQ] ⚠️ Açık kaynaklardan veri bulunamadı.');
      return { total: 0, qualified: 0, rejected: 0 };
    }

    // 3. Kalite filtresinden geçir
    const qualified = rawResults.filter(rfq => this.qualityGate(rfq));
    const rejected = rawResults.length - qualified.length;
    
    console.log(`[OPEN-RFQ] 📊 Sonuç: ${rawResults.length} bulundu → ${qualified.length} kaliteli, ${rejected} diskalifiye.`);

    // 4. Veritabanına kaydet
    if (qualified.length > 0) {
      await this.saveToDatabase(qualified);
    }

    // 5. Son tarama zamanını güncelle
    await this.updateCooldown();

    return { total: rawResults.length, qualified: qualified.length, rejected };
  }

  /**
   * 3 günlük bekleme süresini kontrol eder.
   * API kredisi tasarrufu için gereksiz tarama yapılmaz.
   */
  private static async checkCooldown(): Promise<boolean> {
    try {
      const metaRef = db.collection('trtex_system').doc('scraper_meta');
      const doc = await metaRef.get();
      if (!doc.exists) return true;
      
      const lastRun = doc.data()?.openRfqLastRun || 0;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      return (Date.now() - lastRun) >= threeDaysMs;
    } catch {
      return true; // Hata durumunda çalıştır
    }
  }

  private static async updateCooldown(): Promise<void> {
    try {
      await db.collection('trtex_system').doc('scraper_meta').set(
        { openRfqLastRun: Date.now() },
        { merge: true }
      );
    } catch (e: any) {
      console.warn('[OPEN-RFQ] Cooldown güncelleme hatası:', e.message);
    }
  }

  /**
   * Google Search Grounding ile global açık kaynaklardan ihale/RFQ arar.
   * TEK BİR API çağrısı ile çoklu kaynak taranır (ekonomik).
   */
  private static async fetchGlobalOpenSources(): Promise<QualifiedRFQ[]> {
    console.log('[OPEN-RFQ] 🔍 Google Search Grounding ile küresel tarama...');
    
    try {
      let { text } = await alohaAI.generate(
        `You are a B2B textile procurement intelligence agent. Search the internet for REAL, CURRENT, ACTIVE textile procurement opportunities, tenders, and RFQs from around the world.

PRIORITY ORDER (search in this order):
1. 🔥 Hotel & Construction Projects (new hotel builds, renovations needing curtains/upholstery/bed linen)
2. 🔥 Interior Design Firms & Architectural Offices seeking textile suppliers
3. ⚡ Open B2B RFQ platforms (UNGM, SAM.gov, government procurement portals)
4. 🧊 Traditional government tenders (EU TED, EKAP, national procurement sites)

SEARCH ALL REGIONS — not just Europe. Include:
- Middle East (Dubai, Saudi Arabia, Qatar)
- Africa (Nigeria, Kenya, South Africa)
- Asia (Vietnam, Indonesia, India)
- Americas (USA, Brazil, Mexico)
- Central Asia (Kazakhstan, Uzbekistan)

MANDATORY FIELDS — if ANY of these are missing, DO NOT include that result:
- buyerName: The company/organization name (REQUIRED)
- products: At least 1 specific product with quantity if available (REQUIRED)
- location: Country and city (REQUIRED)
- source_url: Direct link to the original listing (REQUIRED)

For each valid result, extract:
- title: Turkish translation of the project name
- description: Full Turkish translation of requirements
- buyerName: Exact company/organization name
- location: "🇩🇪 Almanya / Berlin" format
- estimated_value: Budget if stated, otherwise empty string
- deadline: If stated, otherwise empty string
- products: Array of {name, quantity, spec} — EXACT meters, GSM, dimensions
- requirements: Array of certification strings (ISO, OEKO-TEX, FR, etc.)
- source: Name of the source platform
- source_url: Direct URL to the listing
- source_type: "OPEN" if all info visible, "SEMI_OPEN" if registration needed, "CLOSED" if behind paywall
- contact_hint: Contact info if publicly visible, otherwise empty string
- ai_analysis: Your 1-sentence Turkish analysis of this opportunity
- logistics_hint: Turkish logistics/customs tip for Turkish exporters
- score: 0-100 opportunity score
- cpv: CPV code if applicable, otherwise empty string

Find 10-15 REAL opportunities. Return as JSON array ONLY. No markdown.`,
        {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,  // Düşük sıcaklık = daha doğru sonuçlar
          complexity: 'routine'  // Ekonomik model kullan
        },
        'openRfqScraper.fetchGlobalOpenSources'
      );

      // JSON parse
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) {
        console.warn('[OPEN-RFQ] ⚠️ JSON parse edilemedi.');
        return [];
      }
      
      const parsed = JSON.parse(match[0]);
      const items: QualifiedRFQ[] = (Array.isArray(parsed) ? parsed : []).map((item: any) => ({
        id: `rfq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: item.title || '',
        description: item.description || '',
        buyerName: item.buyerName || '',
        location: item.location || '',
        estimated_value: item.estimated_value || '',
        deadline: item.deadline || '',
        products: Array.isArray(item.products) ? item.products : [],
        requirements: Array.isArray(item.requirements) ? item.requirements : [],
        source: item.source || '',
        source_url: item.source_url || '',
        source_type: item.source_type || 'OPEN',
        contact_hint: item.contact_hint || '',
        ai_analysis: item.ai_analysis || '',
        logistics_hint: item.logistics_hint || '',
        score: typeof item.score === 'number' ? item.score : 50,
        quality_pass: false, // Kalite filtresi aşağıda çalışacak
        cpv: item.cpv || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      
      console.log(`[OPEN-RFQ] ✅ ${items.length} adet ham sonuç çekildi.`);
      return items;
      
    } catch (e: any) {
      console.error('[OPEN-RFQ] ❌ Google Grounding hatası:', e.message);
      return [];
    }
  }

  /**
   * KALİTE KAPISI (Quality Gate)
   * Çöp veriyi engeller. Eksik bilgi olan ilanlar sisteme GİRMEZ.
   */
  private static qualityGate(rfq: QualifiedRFQ): boolean {
    // 1. Alıcı adı zorunlu
    if (QUALITY_GATE.requireBuyerName && (!rfq.buyerName || rfq.buyerName.trim().length < 3)) {
      console.log(`[QUALITY] ❌ Diskalifiye (firma adı yok): "${rfq.title?.substring(0, 50)}"`);
      return false;
    }
    
    // 2. En az 1 ürün kalemi zorunlu
    if (QUALITY_GATE.requireProducts && (!rfq.products || rfq.products.length === 0)) {
      console.log(`[QUALITY] ❌ Diskalifiye (ürün bilgisi yok): "${rfq.title?.substring(0, 50)}"`);
      return false;
    }
    
    // 3. Minimum skor
    if (rfq.score < QUALITY_GATE.minScore) {
      console.log(`[QUALITY] ❌ Diskalifiye (skor düşük: ${rfq.score}): "${rfq.title?.substring(0, 50)}"`);
      return false;
    }
    
    // 4. Kara liste kontrolü (spam/sahte ilan)
    const titleLower = (rfq.title || '').toLowerCase();
    const descLower = (rfq.description || '').toLowerCase();
    for (const word of QUALITY_GATE.blacklist) {
      if (titleLower.includes(word) || descLower.includes(word)) {
        console.log(`[QUALITY] ❌ Diskalifiye (kara liste: "${word}"): "${rfq.title?.substring(0, 50)}"`);
        return false;
      }
    }
    
    // 5. Lokasyon zorunlu
    if (!rfq.location || rfq.location.trim().length < 3) {
      console.log(`[QUALITY] ❌ Diskalifiye (lokasyon yok): "${rfq.title?.substring(0, 50)}"`);
      return false;
    }

    rfq.quality_pass = true;
    return true;
  }

  /**
   * Kaliteli RFQ'ları Firestore'a kaydeder.
   * Aynı title+buyerName kombinasyonu varsa günceller (duplicate engeli).
   */
  private static async saveToDatabase(rfqs: QualifiedRFQ[]): Promise<void> {
    console.log(`[OPEN-RFQ] 💾 ${rfqs.length} kaliteli RFQ kaydediliyor...`);
    
    try {
      const batch = db.batch();
      const collectionRef = db.collection('trtex_tenders');
      
      for (const rfq of rfqs) {
        // Duplicate kontrolü: Aynı başlık + alıcı varsa güncelle, yoksa yeni ekle
        const existing = await collectionRef
          .where('title', '==', rfq.title)
          .where('buyerName', '==', rfq.buyerName)
          .limit(1)
          .get();
        
        if (!existing.empty) {
          // Güncelle
          const docRef = existing.docs[0].ref;
          batch.update(docRef, { ...rfq, updatedAt: Date.now() });
          console.log(`[OPEN-RFQ] 🔄 Güncellendi: "${rfq.title.substring(0, 40)}"`);
        } else {
          // Yeni ekle
          const docRef = collectionRef.doc(rfq.id);
          batch.set(docRef, rfq);
          console.log(`[OPEN-RFQ] ➕ Yeni eklendi: "${rfq.title.substring(0, 40)}"`);
        }
      }
      
      await batch.commit();
      console.log('[OPEN-RFQ] ✅ Tüm kayıtlar başarıyla veritabanına yazıldı.');
    } catch (e: any) {
      console.error('[OPEN-RFQ] ❌ Firestore kayıt hatası:', e.message);
    }
  }

  /**
   * Öncelik sıralaması: Şeffaf → Yarı Açık → Kapalı
   * UI'da listeleme sırasını belirler.
   */
  static sortByPriority(rfqs: QualifiedRFQ[]): QualifiedRFQ[] {
    const priority: Record<string, number> = { 'OPEN': 0, 'SEMI_OPEN': 1, 'CLOSED': 2 };
    return rfqs.sort((a, b) => {
      const pDiff = (priority[a.source_type] || 2) - (priority[b.source_type] || 2);
      if (pDiff !== 0) return pDiff;
      return b.score - a.score; // Aynı şeffaflıkta skor yüksek olan önce
    });
  }
}

import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../../lib/firebase-admin';
import { alohaAI } from './aiClient';

/**
 * TENDER AGENT v2.0 — 7 KITA KÜRESEL İHALE AVCISI
 * 
 * Her kıtadaki en küçük ülkeler dahil, tüm tekstil/ev tekstili/otel/hastane
 * ihale ve iş fırsatlarını tarar. Google Search Grounding ile gerçek zamanlı.
 */

// ═══════════════════════════════════════════════════════════════
// KÜRESEL TARAMA HARİTASI — 7 KITA × 3 TİP
// ═══════════════════════════════════════════════════════════════

const GLOBAL_HUNT_QUERIES = [
  // ════════════════════════ AVRUPA ════════════════════════
  { q: "hotel textile procurement tenders 2026 Germany France Italy Spain UK Netherlands Belgium", type: "TENDER" as const, region: "EUROPE" },
  { q: "hospital linen curtain procurement tender 2026 Poland Czech Republic Romania Hungary Slovakia", type: "TENDER" as const, region: "EUROPE" },
  { q: "government building curtain upholstery tender 2026 Greece Portugal Croatia Slovenia Malta Cyprus Estonia Latvia Lithuania", type: "TENDER" as const, region: "EUROPE" },
  { q: "hotel renovation textile Supply contract 2026 Austria Switzerland Sweden Norway Denmark Finland", type: "TENDER" as const, region: "EUROPE" },
  { q: "surplus home textile fabric overstock Europe wholesale 2026", type: "HOT_STOCK" as const, region: "EUROPE" },

  // ════════════════════════ TÜRKİYE ════════════════════════
  { q: "Türkiye kamu ihalesi tekstil perde havlu döşemelik 2026 EKAP", type: "TENDER" as const, region: "TR" },
  { q: "otel projesi perde havlu nevresim tedarik ihalesi İstanbul Antalya Bodrum 2026", type: "TENDER" as const, region: "TR" },
  { q: "hastane tekstili ihale Türkiye sağlık bakanlığı perde yatak çarşafı 2026", type: "TENDER" as const, region: "TR" },
  { q: "ihracat fazlası kumaş stok satışı Bursa Denizli Gaziantep Uşak 2026", type: "HOT_STOCK" as const, region: "TR" },
  { q: "boş dokuma kapasitesi fason üretim Türkiye havlu perde şönil jakarlı 2026", type: "CAPACITY" as const, region: "TR" },

  // ════════════════════════ ORTA DOĞU & KÖRFEZLİKLER ════════════════════════
  { q: "hotel textile tender procurement 2026 UAE Dubai Abu Dhabi Saudi Arabia Qatar Bahrain Oman Kuwait", type: "TENDER" as const, region: "MENA" },
  { q: "mega project hotel curtain linen supply tender 2026 NEOM Riyadh Jeddah Doha", type: "TENDER" as const, region: "MENA" },
  { q: "hospital textile procurement tender Iraq Jordan Lebanon Egypt 2026", type: "TENDER" as const, region: "MENA" },
  { q: "military barracks textile bedlinen procurement Middle East Africa 2026", type: "TENDER" as const, region: "MENA" },

  // ════════════════════════ AFRİKA ════════════════════════
  { q: "textile procurement tender 2026 Nigeria South Africa Kenya Ethiopia Ghana Tanzania", type: "TENDER" as const, region: "AFRICA" },
  { q: "hospital hotel textile supply tender African Development Bank 2026 Morocco Tunisia Algeria Libya", type: "TENDER" as const, region: "AFRICA" },
  { q: "government textile procurement tender 2026 Uganda Rwanda Senegal Cote Ivoire Mozambique Zimbabwe Zambia", type: "TENDER" as const, region: "AFRICA" },
  { q: "UNDP UNICEF textile supply tender Africa 2026 bednet curtain linen blanket", type: "TENDER" as const, region: "AFRICA" },

  // ════════════════════════ ASYA & UZAK DOĞU ════════════════════════
  { q: "hotel textile procurement tender 2026 India Indonesia Malaysia Thailand Vietnam Philippines", type: "TENDER" as const, region: "ASIA" },
  { q: "luxury resort hotel curtain linen supply contract 2026 Maldives Sri Lanka Bali Singapore", type: "TENDER" as const, region: "ASIA" },
  { q: "textile overstock surplus fabric sale 2026 China Bangladesh Pakistan India wholesale", type: "HOT_STOCK" as const, region: "ASIA" },
  { q: "government hospital textile tender 2026 Japan South Korea Taiwan Hong Kong", type: "TENDER" as const, region: "ASIA" },
  { q: "empty textile weaving factory capacity Asia contract manufacturing 2026", type: "CAPACITY" as const, region: "ASIA" },

  // ════════════════════════ TÜRK DEVLETLERİ & BDT ════════════════════════
  { q: "textile procurement tender 2026 Azerbaijan Kazakhstan Uzbekistan Turkmenistan Kyrgyzstan", type: "TENDER" as const, region: "TURKIC" },
  { q: "otel inşaat projesi tekstil tedarik ihalesi 2026 Azerbaycan Kazakistan Özbekistan Türkmenistan", type: "TENDER" as const, region: "TURKIC" },
  { q: "Russia hotel textile procurement tender 2026 Moscow St Petersburg Sochi", type: "TENDER" as const, region: "CIS" },
  { q: "Georgia Armenia Moldova Ukraine textile curtain procurement tender 2026", type: "TENDER" as const, region: "CIS" },

  // ════════════════════════ AMERİKA ════════════════════════
  { q: "hotel textile procurement RFP RFQ 2026 USA hospitality curtain bedding supply", type: "TENDER" as const, region: "AMERICAS" },
  { q: "government textile procurement tender 2026 Canada Mexico Brazil Argentina Chile Colombia", type: "TENDER" as const, region: "AMERICAS" },
  { q: "hotel resort textile supply contract Caribbean Panama Costa Rica Dominican Republic 2026", type: "TENDER" as const, region: "AMERICAS" },
  { q: "textile surplus fabric wholesale opportunity Latin America Peru Ecuador Paraguay Uruguay 2026", type: "HOT_STOCK" as const, region: "AMERICAS" },

  // ════════════════════════ OKYANUSYA ════════════════════════
  { q: "hotel textile procurement tender 2026 Australia New Zealand Fiji Pacific Islands", type: "TENDER" as const, region: "OCEANIA" },

  // ════════════════════════ ULUSLARARASI KURULUŞLAR ════════════════════════
  { q: "UNGM United Nations textile procurement tender 2026 blanket bednet curtain", type: "TENDER" as const, region: "INTL" },
  { q: "World Bank IDB funded hotel hospital construction textile supply tender 2026", type: "TENDER" as const, region: "INTL" },
  { q: "NATO military textile blanket bedlinen procurement tender 2026", type: "TENDER" as const, region: "INTL" },

  // ════════════════════════ BÜYÜK OTEL ZİNCİRLERİ ════════════════════════
  { q: "Marriott International hotel renovation textile procurement curtain bedding 2026 new property opening", type: "TENDER" as const, region: "HOTEL_CHAIN" },
  { q: "Hilton Hotels new resort opening textile supply curtain linen towel 2026 EMEA Asia", type: "TENDER" as const, region: "HOTEL_CHAIN" },
  { q: "Accor Hotels Sofitel Novotel textile procurement curtain upholstery 2026 Africa Middle East", type: "TENDER" as const, region: "HOTEL_CHAIN" },
  { q: "Four Seasons Ritz Carlton St Regis luxury hotel textile procurement 2026 drapes linen", type: "TENDER" as const, region: "HOTEL_CHAIN" },
  { q: "IHG Radisson Hyatt Wyndham hotel renovation FF&E textile procurement 2026", type: "TENDER" as const, region: "HOTEL_CHAIN" },
  { q: "boutique hotel resort opening 2026 2027 textile interior curtain bedding supply contract", type: "TENDER" as const, region: "HOTEL_CHAIN" },

  // ════════════════════════ MEGA PROJELER ════════════════════════
  { q: "NEOM The Line Saudi Arabia hotel textile interior supply 2026 mega project", type: "TENDER" as const, region: "MEGA_PROJECT" },
  { q: "Dubai Expo legacy hotel project textile procurement curtain 2026 2027", type: "TENDER" as const, region: "MEGA_PROJECT" },
  { q: "Qatar World Cup 2022 legacy hotel renovation textile curtain 2026", type: "TENDER" as const, region: "MEGA_PROJECT" },
  { q: "Istanbul new airport hotel shopping mall textile curtain tender 2026", type: "TENDER" as const, region: "MEGA_PROJECT" },
  { q: "Egypt new capital Cairo hotel textile curtain supply 2026", type: "TENDER" as const, region: "MEGA_PROJECT" },
  { q: "Singapore Changi Airport hotel textile resort Sentosa FF&E procurement 2026", type: "TENDER" as const, region: "MEGA_PROJECT" },

  // ════════════════════════ HASTANE & SAĞLIK ════════════════════════
  { q: "hospital textile procurement tender 2026 curtain bedlinen antibacterial FR flame retardant", type: "TENDER" as const, region: "MEDICAL" },
  { q: "healthcare facility textile supply tender Europe USA 2026 privacy curtain cubicle track", type: "TENDER" as const, region: "MEDICAL" },
  { q: "military hospital barracks textile procurement 2026 blanket bedsheet pillow", type: "TENDER" as const, region: "MEDICAL" },
  { q: "nursing home elderly care textile curtain bedding tender 2026 Germany UK France", type: "TENDER" as const, region: "MEDICAL" },

  // ════════════════════════ YAT / CRUISE / DENİZCİLİK ════════════════════════
  { q: "superyacht luxury yacht interior textile upholstery curtain supply 2026 marine fabric", type: "TENDER" as const, region: "MARINE" },
  { q: "cruise ship textile procurement curtain upholstery bedding 2026 MSC Royal Caribbean Carnival", type: "TENDER" as const, region: "MARINE" },
  { q: "mega yacht refit textile interior marine grade fabric UV resistant 2026", type: "TENDER" as const, region: "MARINE" },
  { q: "ferry passenger ship textile curtain seat upholstery procurement tender 2026", type: "TENDER" as const, region: "MARINE" },

  // ════════════════════════ KURUMSAL & KAMU ════════════════════════
  { q: "embassy consulate government office curtain procurement tender 2026 worldwide", type: "TENDER" as const, region: "GOV" },
  { q: "university dormitory student housing textile bedding curtain tender 2026", type: "TENDER" as const, region: "GOV" },
  { q: "prison correctional facility textile blanket bedlinen procurement 2026", type: "TENDER" as const, region: "GOV" },

  // ════════════════════════ SICAK STOK & İPTAL SİPARİŞLER (HOT_STOCK) ════════════════════════
  { q: "bankrupt brand surplus fabric liquidation auction 2026 home textile curtain", type: "HOT_STOCK" as const, region: "GLOBAL_STOCK" },
  { q: "cancelled hotel order deadstock fabric wholesale sale 2026 EU USA", type: "HOT_STOCK" as const, region: "GLOBAL_STOCK" },
  { q: "customs auction seized home textile fabric rolls container sale 2026", type: "HOT_STOCK" as const, region: "GLOBAL_STOCK" },
  { q: "ihracat fazlası gümrük malı iptal sipariş kumaş havlu perde 2026 Türkiye Bursa", type: "HOT_STOCK" as const, region: "GLOBAL_STOCK" },

  // ════════════════════════ BOŞ KAPASİTE & FASON ÜRETİM (CAPACITY) ════════════════════════
  { q: "available weaving capacity jacquard dobby loom home textile manufacturer 2026", type: "CAPACITY" as const, region: "GLOBAL_CAPACITY" },
  { q: "contract manufacturing offering Turkish towel bathrobe factory capacity 2026", type: "CAPACITY" as const, region: "GLOBAL_CAPACITY" },
  { q: "fason dokuma boşa çıkan jakarlı tezgah kapasitesi Bursa Denizli Uşak 2026", type: "CAPACITY" as const, region: "GLOBAL_CAPACITY" },
  { q: "empty line textile finishing dyeing available order slots 2026", type: "CAPACITY" as const, region: "GLOBAL_CAPACITY" }
];

export class TenderAgent {
  /**
   * Performs a grounded search on the given query and structures the response into B2B Tender entries.
   */
  static async searchAndExtractTenders(query: string, tenderType: 'TENDER' | 'HOT_STOCK' | 'CAPACITY', region: string): Promise<any[]> {
    console.log(`[TenderAgent] 🔍 [${region}] ${tenderType}: "${query.substring(0, 60)}..."`);
    
    const prompt = `
You are the TRTEX Global Tender Data Extractor — the world's most elite B2B textile procurement intelligence system.
Search the internet for REAL, CURRENT opportunities matching this query:
"${query}"

Based on REAL data you find, extract 3 to 5 genuine B2B opportunities.
CRITICAL RULES:
1. SECTOR RESTRICTION: ONLY Home Textiles, Curtains, Upholstery, Hospital/Hotel Linens, Towels, Yarns, and Commercial Fabrics.
2. STRICTLY FORBIDDEN: NEVER include "apparel", "clothing", "garments", "fashion", "furniture", "woodwork", "shoes", or "machinery".
3. NO RISKY TENDERS: Do not include erratic, scam, or financially unpredictable tenders. We need solid B2B leads.
4. Each opportunity must include REAL country names, REAL project types, and realistic quantities/values.
5. Even from SMALL countries — a €10.000 hospital curtain order from Malta is highly valuable.
6. Language: ALL output fields MUST BE IN TURKISH.
7. Type MUST BE "${tenderType}".
8. Score 80-99 based on commercial attractiveness (value, urgency, accessibility for Turkish exporters).

Output MUST BE a JSON array. Each object:
{
  "type": "${tenderType}",
  "location": "🇩🇪 Almanya / Otel Renovasyonu" (use flag emoji + Turkish country name + project type),
  "title": "5.000m Blackout Perde Tedariki" (short, punchy Turkish title with quantities),
  "detail_key": "Son Teklif:" or "Fiyat Avantajı:" or "Boş Makine:" etc,
  "detail_value": "15 Haziran 2026" or "-18% Piyasa Altı" or "Jacquard Dokuma" etc,
  "score": 88,
  "action_text": "→ İHALEYİ İNCELE" or "→ SATIN AL" or "→ ORTAKLIK KUR",
  "original_source_url": "https://...",
  "estimated_value": "€150.000",
  "deadline": "2026-06-15",
  "buyer_hint": "Alman Sağlık Bakanlığı" or "Marriott Hotels EMEA"
}

DO NOT wrap in markdown. Return ONLY the JSON array.
`;

    try {
      let { text } = await alohaAI.generate(
        prompt,
        {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
          complexity: 'routine'
        },
        'tenderAgent.searchAndExtractTenders'
      ) || '[]';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      let tenders: any[] = [];
      try {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) tenders = JSON.parse(match[0]);
      } catch (e) {
        console.error(`[TenderAgent] ❌ JSON parse fail for ${region}:`, text.substring(0, 80));
      }

      return tenders.map(t => ({
        ...t,
        id: uuidv4(),
        status: 'LIVE',
        source: 'SEARCH_GROUNDING',
        region,
        createdAt: Date.now()
      }));

    } catch (error: any) {
      console.error(`[TenderAgent] ❌ Error [${region}]:`, error.message);
      return [];
    }
  }

  /**
   * Execute the FULL 7-continent global hunt.
   * Uses batching to respect API quotas.
   */
  static async executeGlobalHunt(maxBatches: number = 8): Promise<number> {
    console.log('[TenderAgent] ═══════════════════════════════════════════════════');
    console.log('[TenderAgent] 🌍 7 KITA KÜRESEL İHALE AVI BAŞLADI');
    console.log(`[TenderAgent] 📊 ${GLOBAL_HUNT_QUERIES.length} sorgu, ${maxBatches} batch limit`);
    console.log('[TenderAgent] ═══════════════════════════════════════════════════');

    let allTenders: any[] = [];
    let batchCount = 0;

    // Shuffle queries for variety across runs (Deterministic)
    const startIndex = new Date().getHours() % GLOBAL_HUNT_QUERIES.length;
    const shuffled = [...GLOBAL_HUNT_QUERIES.slice(startIndex), ...GLOBAL_HUNT_QUERIES.slice(0, startIndex)];

    for (const sq of shuffled) {
      if (batchCount >= maxBatches) {
        console.log(`[TenderAgent] 🛑 Batch limit (${maxBatches}) doldu. Kalan sorgular sonraki döngüde.`);
        break;
      }

      const results = await this.searchAndExtractTenders(sq.q, sq.type, sq.region);
      if (results.length > 0) {
        allTenders = [...allTenders, ...results];
        console.log(`[TenderAgent] ✅ [${sq.region}] ${results.length} fırsat bulundu`);
      }
      batchCount++;

      // Quota protection
      await new Promise(r => setTimeout(r, 4000));
    }

    if (allTenders.length > 0) {
      console.log(`[TenderAgent] 📦 TOPLAM: ${allTenders.length} küresel fırsat. Firestore'a yazılıyor...`);
      await this.saveTendersToFirestore(allTenders);
    }

    console.log('[TenderAgent] ═══════════════════════════════════════════════════');
    console.log(`[TenderAgent] ✅ AV TAMAMLANDI: ${allTenders.length} fırsat, ${batchCount} batch kullanıldı`);
    console.log('[TenderAgent] ═══════════════════════════════════════════════════');

    return allTenders.length;
  }

  /**
   * Save without deleting existing data (NO-DELETE RULE).
   */
  static async saveTendersToFirestore(tenders: any[]) {
    if (!adminDb) return;
    const batch = adminDb.batch();
    
    for (const t of tenders) {
      const docRef = adminDb.collection('trtex_tenders').doc(t.id);
      batch.set(docRef, t);
    }
    
    await batch.commit();
  }
}

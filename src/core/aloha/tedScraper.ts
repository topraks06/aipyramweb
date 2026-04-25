/**
 * TED SCRAPER AGENT — EU Tenders Electronic Daily
 * 
 * AB kamu ihalelerini gerçek zamanlı çeker ve trtex_tenders formatına normalize eder.
 * API: https://api.ted.europa.eu/v3/notices/search (Anonim erişim)
 * 
 * CPV Kodları (Tekstil):
 * 17000000 — Tekstil ürünleri
 * 39500000 — Tekstil ev eşyaları
 * 39510000 — Ev tekstili (perde, havlu, örtü)
 * 39515000 — Perdeler, drapeler
 * 39516000 — Mobilya döşemeleri
 * 39525000 — Çarşaflar, örtüler
 * 55100000 — Otel hizmetleri (otel tekstili ihaleleriyle ilişkili)
 */

import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../../lib/firebase-admin';
import { alohaAI } from './aiClient';

// Tekstil odaklı CPV kodları
const TEXTILE_CPV_CODES = [
  '39500000', // Textile furnishing articles
  '39510000', // Household textile articles  
  '39515000', // Curtains, drapes, pelmets
  '39516000', // Furnishing articles
  '39525000', // Curtain and quilting materials
  '39530000', // Carpets, mats, rugs
  '17000000', // Textiles and textile articles
  '18000000', // Clothing, footwear, luggage (fabric suppliers)
  '55100000', // Hotel services (textile procurement)
];

// TED API Configuration
const TED_API_BASE = 'https://api.ted.europa.eu/v3/notices/search';
const MAX_RESULTS = 20;

interface TEDNotice {
  publicationNumber: string;
  title: string;
  cpv?: string;
  country?: string;
  deadline?: string;
  estimatedValue?: number;
  currency?: string;
  buyerName?: string;
  description?: string;
  publicationDate?: string;
}

interface NormalizedTender {
  id: string;
  type: 'TENDER' | 'HOT_STOCK' | 'CAPACITY';
  location: string;
  title: string;
  detail_key: string;
  detail_value: string;
  score: number;
  action_text: string;
  status: 'LIVE';
  source: 'TED_EU';
  source_id: string;
  source_url: string;
  deadline?: string;
  estimated_value?: string;
  buyer?: string;
  cpv_code?: string;
  createdAt: number;
}

export class TEDScraper {

  /**
   * Build the expert query for TED API using multiple CPV codes
   */
  private static buildQuery(): string {
    // TED API v3 expert query syntax: classification-cpv = CODE
    const cpvQuery = TEXTILE_CPV_CODES
      .map(code => `${code}`)
      .join(' OR ');
    
    return `classification-cpv IN (${cpvQuery})`;
  }

  /**
   * Fetch raw notices from TED API
   */
  static async fetchFromTED(): Promise<any[]> {
    console.log('[TED] 🇪🇺 AB İhale Portalı (TED) taranıyor...');
    
    const query = this.buildQuery();
    console.log(`[TED] 🔍 Expert Query: ${query.substring(0, 80)}...`);
    
    try {
      const response = await fetch(TED_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          fields: [
            'notice-title',
            'publication-number', 
            'cpv',
            'buyer-country',
            'deadline-receipt-request',
            'estimated-value',
            'currency',
            'buyer-name',
            'description',
            'publication-date'
          ],
          limit: MAX_RESULTS,
          page: 1,
          scope: 'active',
          sortField: 'publication-date',
          sortOrder: 'desc'
        }),
      });

      if (!response.ok) {
        console.error(`[TED] ❌ API Error: ${response.status} ${response.statusText}`);
        // Fallback: try with simpler query
        return await this.fetchWithSimpleQuery();
      }

      const data = await response.json();
      console.log(`[TED] ✅ ${data.notices?.length || 0} ham ihale bulundu`);
      return data.notices || [];
      
    } catch (error: any) {
      console.error('[TED] ❌ Fetch error:', error.message);
      // Fallback to Google Search Grounding
      return await this.fetchWithGoogleGrounding();
    }
  }

  /**
   * Simpler query fallback
   */
  private static async fetchWithSimpleQuery(): Promise<any[]> {
    console.log('[TED] 🔄 Basitleştirilmiş sorgu deneniyor...');
    try {
      const response = await fetch(TED_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          query: 'classification-cpv = 39500000',
          limit: 10,
          page: 1,
          scope: 'active'
        }),
      });
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      return data.notices || [];
    } catch (e: any) {
      console.warn('[TED] ⚠️ Simple query de başarısız:', e.message);
      return [];
    }
  }

  /**
   * Fallback: Use Google Search Grounding to find TED notices
   */
  private static async fetchWithGoogleGrounding(): Promise<any[]> {
    console.log('[TED] 🔄 Google Search Grounding ile TED ihaleleri aranıyor...');
    try {
      let text = await alohaAI.generate(
        `Search the EU TED (Tenders Electronic Daily) website ted.europa.eu for the LATEST active procurement notices related to:
- Hotel textile procurement (curtains, bed linen, towels)
- Hospital textile supplies
- Government building curtain/upholstery tenders
- Home textile and furnishing procurement

Find 10 REAL, CURRENT tenders from ted.europa.eu. For each, extract:
- Publication number
- Title/subject
- Buyer country
- Buyer name
- Deadline
- Estimated value if available
- CPV code

Return as JSON array:
[{"publicationNumber":"...","title":"...","country":"...","buyerName":"...","deadline":"...","estimatedValue":"...","cpv":"..."}]`,
        {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
          complexity: 'routine'
        },
        'tedScraper.fetchWithGoogleGrounding'
      );

      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) return [];
      return JSON.parse(match[0]);
    } catch (e: any) {
      console.error('[TED] ❌ Google Grounding fallback failed:', e.message);
      return [];
    }
  }

  /**
   * Normalize TED notices into TRTEX tender format using AI for Turkish translation
   */
  static async normalizeTenders(rawNotices: any[]): Promise<NormalizedTender[]> {
    if (rawNotices.length === 0) return [];
    
    console.log(`[TED] 🔧 ${rawNotices.length} ihale normalize ediliyor...`);
    
    // Use AI to translate and enrich the tender data
    const batchText = rawNotices.slice(0, 15).map((n, i) => 
      `${i+1}. Title: ${n.title || n['notice-title'] || 'N/A'} | Country: ${n.country || n['buyer-country'] || 'EU'} | Buyer: ${n.buyerName || n['buyer-name'] || 'N/A'} | CPV: ${n.cpv || 'N/A'} | Deadline: ${n.deadline || n['deadline-receipt-request'] || 'N/A'} | Value: ${n.estimatedValue || n['estimated-value'] || 'N/A'}`
    ).join('\n');

    try {
      const parsed = await alohaAI.generateJSON(
        `You are the TRTEX Tender Normalizer. Convert these EU procurement notices into the TRTEX Trading Floor format.

CRITICAL SECTOR RESTRICTION: ONLY Home Textiles, Curtains, Upholstery, Hospital/Hotel Linens, Towels, Carpets, and Commercial Fabrics.
STRICTLY REJECT: "apparel", "clothing", "garments", "fashion", "furniture", "woodwork", "metals", "IT services", "military weapons". 
If a raw notice is about these forbidden sectors, or if it is a RISKY/CANCELLED tender, DO NOT output it. Ignore it completely.

RAW DATA:
${batchText}

For each VALID tender, create a JSON object:
- "type": "TENDER" (always)
- "location": "🇩🇪 Almanya / Otel Projesi" format (use flag emojis, country name IN TURKISH, and project type)
- "title": Short, punchy Turkish title (e.g., "20.000 Adet Otel Yastık Kılıfı Alımı" or "5.000m² FR Blackout Perde")
- "detail_key": Most relevant data label (e.g., "Son Teklif:", "Tahmini Değer:", "Teslimat:", "Sertifika:")
- "detail_value": Corresponding value (e.g., "15 Mayıs 2026", "€150.000", "ISO 9001")
- "score": Commercial attractiveness score 80-99 (higher for bigger value, longer deadline = lower urgency)
- "action_text": CTA button text → "İHALEYİ İNCELE"
- "source_id": Original publication number
- "deadline": ISO date if available
- "estimated_value": Value string if available
- "buyer": Buyer name in Turkish if possible
- "cpv_code": CPV code

Return JSON array ONLY. No markdown fences. Turkish language for all user-facing fields.`,
        { temperature: 0.3, complexity: 'routine' },
        'tedScraper.normalizeTenders'
      );

      if (!parsed || !Array.isArray(parsed)) return [];
      
      
      
      return parsed.map((t: any) => ({
        id: uuidv4(),
        type: 'TENDER' as const,
        location: t.location || '🇪🇺 AB / Kamu İhalesi',
        title: t.title || 'Tekstil İhalesi',
        detail_key: t.detail_key || 'Kaynak:',
        detail_value: t.detail_value || 'TED Europa',
        score: Math.min(99, Math.max(80, t.score || 85)),
        action_text: t.action_text || '→ İHALEYİ İNCELE',
        status: 'LIVE' as const,
        source: 'TED_EU' as const,
        source_id: t.source_id || '',
        source_url: t.source_id ? `https://ted.europa.eu/en/notice/-/${t.source_id}` : '',
        deadline: t.deadline || undefined,
        estimated_value: t.estimated_value || undefined,
        buyer: t.buyer || undefined,
        cpv_code: t.cpv_code || undefined,
        createdAt: Date.now(),
      }));

    } catch (e: any) {
      console.error('[TED] ❌ Normalization error:', e.message);
      return [];
    }
  }

  /**
   * Full pipeline: Fetch → Normalize → Save
   */
  static async execute(): Promise<number> {
    console.log('[TED] ═══════════════════════════════════════════');
    console.log('[TED] 🇪🇺 TED SCRAPER: AB İHALE TARAMA BAŞLADI');
    console.log('[TED] ═══════════════════════════════════════════');
    
    // 1. Fetch raw
    const rawNotices = await this.fetchFromTED();
    
    // 2. Normalize
    const normalized = await this.normalizeTenders(rawNotices);
    
    // 3. Save to Firestore
    if (normalized.length > 0 && adminDb) {
      const batch = adminDb.batch();
      for (const tender of normalized) {
        const docRef = adminDb.collection('trtex_tenders').doc(tender.id);
        batch.set(docRef, tender);
      }
      await batch.commit();
      console.log(`[TED] ✅ ${normalized.length} AB ihalesi Firestore'a kaydedildi (trtex_tenders)`);
    }
    
    console.log(`[TED] 📊 Sonuç: ${rawNotices.length} ham → ${normalized.length} normalize`);
    return normalized.length;
  }
}

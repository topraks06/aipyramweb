/**
 * SIGNAL FILTER — "Spam Engelleme Katmanı"
 * 
 * signalCollector'dan gelen ham veriyi filtreler:
 * 1. Duplicate kontrolü (son 48 saat)
 * 2. Kalite skoru < 40 → REJECT
 * 3. Benzerlik kontrolü (title similarity)
 * 4. Günlük limit kontrolü (MAX 6 haber/gün — v2.1 COO mandate)
 * 5. Sektör dışı → REJECT
 * 
 * "Aloha günde 100 haber basıp TRTEX'i çöplüğe çevirmesin"
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
// KONFİGÜRASYON
// ═══════════════════════════════════════

const MAX_DAILY_ARTICLES = 6;          // Günde max 6 (sadece production'da)
const MIN_COMMERCIAL_GRAVITY = 40;     // decision_engine skoru eşiği
const SIMILARITY_THRESHOLD = 0.6;      // Başlık benzerlik eşiği (0-1)
const DEDUP_WINDOW_HOURS = 48;         // Son 48 saatte aynı konu kontrolü

// ═══ SEKTÖR DIŞI / YASAKLI KONULAR ═══
// Bu kelimeler haberde geçerse REJECT — TRTEX ev tekstili platformu, hazır giyim DEĞİL
const BANNED_KEYWORDS = [
  'hazır giyim', 'hazir giyim', 'ready-to-wear', 'readytowear', 'ready to wear',
  'konfeksiyon', 'confection', 'garment', 'apparel',
  'moda', 'fashion', 'haute couture', 'prêt-à-porter',
  'tişört', 't-shirt', 'gömlek', 'pantolon', 'etek', 'elbise', 'ceket',
  'kot', 'denim', 'jean', 'triko', 'knitwear',
  'ayakkabı', 'footwear', 'shoes', 'çanta', 'bag',
  'spor giyim', 'sportswear', 'athleisure',
  'fast fashion', 'zara', 'h&m', 'shein', 'temu',
];

// Sektör kelimeleri — bunlardan en az 1 tanesi haberdeki topic/title'da olmalı
const SECTOR_KEYWORDS = [
  'tekstil', 'textile', 'kumaş', 'fabric', 'perde', 'curtain', 'iplik', 'yarn',
  'pamuk', 'cotton', 'polyester', 'havlu', 'towel', 'nevresim', 'bedding',
  'ev tekstili', 'home textile', 'halı', 'carpet', 'döşemelik', 'upholstery',
  'ihracat', 'export', 'ithalat', 'import', 'fuar', 'fair', 'heimtextil',
  'hometex', 'tedarik', 'supply', 'lojistik', 'logistics', 'navlun', 'freight',
  'gümrük', 'customs', 'dolar', 'euro', 'döviz', 'kur',
  'sürdürülebilir', 'sustainable', 'geri dönüşüm', 'recycl',
  'tül', 'sheer', 'blackout', 'stor', 'masa örtüsü', 'table linen',
  'bornoz', 'bathrobe', 'yatak', 'bed', 'yastık', 'pillow',
  'otel', 'hotel', 'kontrat', 'contract', 'hospitality',
  'sertifik', 'certif', 'oeko-tex', 'gots', 'epr',
  'regülasyon', 'regulation', 'yönetmelik',
];

// ═══════════════════════════════════════
// TİPLER
// ═══════════════════════════════════════

export interface RawSignal {
  topic: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  raw_snippet?: string;
  url?: string;
}

export interface FilterResult {
  decision: 'PASS' | 'REJECT';
  reason: string;
  commercial_gravity?: number;
  trade_matrix?: {
    sellable_asset: string;
    target_market: string;
    why_now: string;
  };
}

// ═══════════════════════════════════════
// 1. ANA FİLTRE FONKSİYONU
// ═══════════════════════════════════════

export async function filterSignal(signal: RawSignal): Promise<FilterResult> {
  const title = (signal.title || signal.topic || '').trim().toLowerCase();
  
  if (!title || title.length < 15) {
    return { decision: 'REJECT', reason: 'Başlık çok kısa veya boş' };
  }

  // ─── KONTROL 1: Sektör Filtresi ───
  const sectorMatch = SECTOR_KEYWORDS.some(kw => 
    title.includes(kw) || (signal.summary || '').toLowerCase().includes(kw)
  );
  if (!sectorMatch) {
    return { decision: 'REJECT', reason: 'Sektör dışı konu' };
  }

  // ─── KONTROL 1.5: YASAKLI KONU FİLTRESİ (hazır giyim/moda YASAK) ───
  const fullText = `${title} ${(signal.summary || '').toLowerCase()}`;
  const bannedMatch = BANNED_KEYWORDS.find(kw => fullText.includes(kw));
  if (bannedMatch) {
    return { decision: 'REJECT', reason: `Yasaklı konu: "${bannedMatch}" — TRTEX sadece ev tekstili/perde yayınlar` };
  }

  // ─── KONTROL 2: Günlük Limit (sadece PRODUCTION'da) ───
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const dailyCheck = await checkDailyLimit();
    if (!dailyCheck.allowed) {
      return { decision: 'REJECT', reason: `Günlük limit doldu (${dailyCheck.count}/${MAX_DAILY_ARTICLES})` };
    }
  }

  // ─── KONTROL 3: Duplicate / Benzerlik ───
  const dupCheck = await checkDuplicate(title);
  if (dupCheck.isDuplicate) {
    return { decision: 'REJECT', reason: `Benzer haber mevcut: "${dupCheck.similarTitle}"` };
  }

  // ─── KONTROL 4: Commercial Gravity (Basit skor) ───
  const gravity = calculateCommercialGravity(signal);
  if (gravity < MIN_COMMERCIAL_GRAVITY) {
    return { decision: 'REJECT', reason: `Ticari yerçekimi düşük (${gravity}/${MIN_COMMERCIAL_GRAVITY})`, commercial_gravity: gravity };
  }

  // ─── Trade Matrix (COO v2.1: her haberde [Sellable Asset], [Target Market], [Why Now]) ───
  const tradeMatrix = extractTradeMatrix(signal);

  return { decision: 'PASS', reason: 'Tüm filtreler geçti', commercial_gravity: gravity, trade_matrix: tradeMatrix };
}

// ═══════════════════════════════════════
// 2. GÜNLÜK LİMİT KONTROLÜ
// ═══════════════════════════════════════

async function checkDailyLimit(): Promise<{ allowed: boolean; count: number }> {
  try {
    if (!adminDb) return { allowed: true, count: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDoc = await adminDb.collection('aloha_daily_stats').doc(
      today.toISOString().split('T')[0]
    ).get();

    const count = todayDoc.exists ? (todayDoc.data()?.articles_created || 0) : 0;
    return { allowed: count < MAX_DAILY_ARTICLES, count };
  } catch {
    return { allowed: true, count: 0 }; // DB erişilemezse devam et ama dikkatli ol
  }
}

/**
 * Günlük sayacı artır — haber üretildikten SONRA çağrılır
 */
export async function incrementDailyCount(): Promise<void> {
  try {
    if (!adminDb) return;
    const today = new Date().toISOString().split('T')[0];
    const ref = adminDb.collection('aloha_daily_stats').doc(today);
    const doc = await ref.get();
    const current = doc.exists ? (doc.data()?.articles_created || 0) : 0;
    await ref.set({
      articles_created: current + 1,
      last_article_at: new Date().toISOString(),
      date: today,
    }, { merge: true });
  } catch (err) {
    console.warn('[SIGNAL FILTER] Günlük sayaç artırma hatası:', err);
  }
}

// ═══════════════════════════════════════
// 3. DUPLICATE / BENZERLİK KONTROLÜ
// ═══════════════════════════════════════

async function checkDuplicate(newTitle: string): Promise<{ isDuplicate: boolean; similarTitle?: string }> {
  try {
    if (!adminDb) return { isDuplicate: false };

    const cutoff = new Date(Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000);
    
    // Son 48 saatteki haberleri tüm proje koleksiyonlarından çek (cross-project dedup)
    const collections = ['trtex_news', 'hometex_news', 'perde_news'];
    const allDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    for (const coll of collections) {
      try {
        const snap = await adminDb.collection(coll)
          .where('created_at', '>=', cutoff.toISOString())
          .limit(30)
          .get();
        allDocs.push(...snap.docs);
      } catch {
        try {
          const snap = await adminDb.collection(coll).limit(50).get();
          allDocs.push(...snap.docs);
        } catch { /* koleksiyon yoksa geç */ }
      }
    }

    for (const doc of allDocs) {
      const data = doc.data();
      const existingTitle = (data.title || data.translations?.TR?.title || '').toLowerCase();
      
      if (!existingTitle) continue;

      // Tam eşleşme
      if (existingTitle === newTitle) {
        return { isDuplicate: true, similarTitle: existingTitle };
      }

      // Benzerlik skoru (Jaccard similarity)
      const similarity = jaccardSimilarity(newTitle, existingTitle);
      if (similarity > SIMILARITY_THRESHOLD) {
        return { isDuplicate: true, similarTitle: existingTitle };
      }
    }

    return { isDuplicate: false };
  } catch {
    return { isDuplicate: false }; // Hata durumunda geç ama logla
  }
}

// Jaccard kelime benzerliği
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/).filter(w => w.length > 2));
  const setB = new Set(b.split(/\s+/).filter(w => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;
  
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

// ═══════════════════════════════════════
// 4. TİCARİ YERÇEKİMİ HESAPLAMA (Basit, hızlı)
// ═══════════════════════════════════════

function calculateCommercialGravity(signal: RawSignal): number {
  const text = `${signal.title} ${signal.summary || ''} ${signal.raw_snippet || ''}`.toLowerCase();
  let score = 0;

  // Fiyat/tedarik bilgisi (Hem başlık hem de rakamı yakalar: $1.5, 1.5$, 100 USD)
  if (/(?:usd|eur|tl|dolar|euro|₺|\$|€)\s*\d+[\.,]?\d*|\d+[\.,]?\d*\s*(?:usd|eur|tl|dolar|euro|₺|\$|€)/i.test(text)) score += 30;
  if (/fiyat|price|maliyet|cost|tarif/i.test(text)) score += 15;

  // Hedef pazar bağlantısı
  const premiumMarkets = ['almanya', 'germany', 'abd', 'usa', 'ingiltere', 'uk', 'polonya', 'poland', 'bae', 'uae', 'suudi', 'saudi'];
  if (premiumMarkets.some(m => text.includes(m))) score += 25;

  // Regülasyon değişikliği
  if (/regülasyon|regulation|yönetmelik|directive|yasa|law|zorunlu|mandatory/i.test(text)) score += 20;

  // Rakip/firma haberi
  if (/menderes|TAÇ|sunvim|luolai|nitori|ikea|zara home/i.test(text)) score += 15;

  // Hammadde fiyat hareketi
  if (/pamuk|cotton|pta|polyester|navlun|freight/i.test(text)) score += 15;

  // Fuar yaklaşması
  if (/fuar|fair|heimtextil|hometex|maison|domotex/i.test(text)) score += 10;

  // Perde çarpanı (ALTIN ALAN)
  if (/perde|curtain|tül|sheer|blackout|stor|window/i.test(text)) {
    score = Math.round(score * 1.3);
  }

  // Makro-ekonomi sinyali (COO v2.1: savaş, lojistik kriz, kur)
  if (/savaş|war|kriz|crisis|ambargo|embargo|yaptırım|sanction/i.test(text)) score += 25;
  
  // AB Yeşil Mutabakat / EPR (COO v2.1)
  if (/green deal|yeşil mutabakat|epr|karbon|carbon|sınırda karbon/i.test(text)) score += 20;
  
  // Yatırım fırsatı (COO v2.1)
  if (/yatırım|investment|fabrika açılış|tesis|capacity|kapasite/i.test(text)) score += 15;

  return Math.min(100, score);
}

// ═══════════════════════════════════════
// 5. TRADE MATRIX — COO v2.1 zorunlu
// ═══════════════════════════════════════

function extractTradeMatrix(signal: RawSignal): { sellable_asset: string; target_market: string; why_now: string } {
  const text = `${signal.title} ${signal.summary || ''}`.toLowerCase();
  
  // Sellable Asset tespiti
  let sellable_asset = 'Ev Tekstili Genel';
  if (/perde|curtain|tül|sheer|blackout/i.test(text)) sellable_asset = 'Perde & Tül';
  else if (/havlu|towel|bornoz|bathrobe/i.test(text)) sellable_asset = 'Havlu & Bornoz';
  else if (/nevresim|bedding|yatak|bed/i.test(text)) sellable_asset = 'Nevresim & Yatak';
  else if (/döşemelik|upholstery|mobilya/i.test(text)) sellable_asset = 'Döşemelik Kumaş';
  else if (/iplik|yarn|pamuk|cotton/i.test(text)) sellable_asset = 'Hammadde & İplik';
  else if (/otel|hotel|kontrat/i.test(text)) sellable_asset = 'Otel & Kontrat Tekstili';
  
  // Target Market tespiti
  let target_market = 'Global';
  const marketMap: Record<string, string> = {
    'almanya': 'Almanya', 'germany': 'Almanya', 'abd': 'ABD', 'usa': 'ABD',
    'ingiltere': 'İngiltere', 'uk': 'İngiltere', 'polonya': 'Polonya',
    'bae': 'BAE', 'uae': 'BAE', 'suudi': 'Suudi Arabistan', 'saudi': 'Suudi Arabistan',
    'rusya': 'Rusya', 'russia': 'Rusya', 'çin': 'Çin', 'china': 'Çin',
    'fransa': 'Fransa', 'france': 'Fransa', 'avrupa': 'AB', 'europe': 'AB',
  };
  for (const [key, val] of Object.entries(marketMap)) {
    if (text.includes(key)) { target_market = val; break; }
  }
  
  // Why Now
  let why_now = 'Sektörel gelişme';
  if (/fuar|fair|heimtextil/i.test(text)) why_now = 'Fuar dönemi yaklaşıyor';
  else if (/regülasyon|regulation|epr/i.test(text)) why_now = 'Yeni regülasyon geliyor';
  else if (/fiyat|price|artış|düşüş/i.test(text)) why_now = 'Fiyat hareketi';
  else if (/kriz|crisis|savaş|war/i.test(text)) why_now = 'Makro-ekonomik şok';
  else if (/yatırım|investment/i.test(text)) why_now = 'Yatırım fırsatı penceresi';
  
  return { sellable_asset, target_market, why_now };
}

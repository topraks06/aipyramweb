/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA NEWS ENGINE v3.0 — Editoryal Çeşitlilik Devrimi       ║
 * ║  Tek dosya. Tek sorumluluk. Sıfır yama.                      ║
 * ╠═══════════════════════════════════════════════════════════════╣
 * ║  Pipeline: Scout(2 aşama) → Publisher(8dil) → Photographer   ║
 * ║  8 Editoryal Açı × Anti-Tekrar Guard × Dinamik Görseller     ║
 * ║  Kelime: 200-700 (açıya göre) — Eski: 800 sabit              ║
 * ║  Görsel ASLA haber kaydını BLOKE ETMEZ                       ║
 * ║  16:9 — yazı genişliğini aşmayan fotoğraflar                 ║
 * ║  Perde & ev tekstili odaklı lüks dergi görselleri            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { adminDb, admin } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';

// ═══════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════

export interface PipelineResult {
  success: boolean;
  articleId?: string;
  title?: string;
  imageCount: number;
  qualityScore: number;
  error?: string;
  durationMs: number;
}

interface ArticleData {
  title: string;
  summary: string;
  content: string;
  category: string;
  intent: 'DISCOVER' | 'ANALYZE' | 'ACT';
  commercial_note: string;
  tags: string[];
}

interface TranslationSet {
  [lang: string]: { title: string; summary: string; content: string };
}

// ═══════════════════════════════════════
//  EDİTORYAL ÇEŞİTLİLİK MOTORU v3.0
//  8 farklı editoryal açı — her pipeline
//  çalışmasında rastgele seçilir
// ═══════════════════════════════════════

interface EditorialAngle {
  id: string;
  tone: string;
  style: string;
  wordMin: number;
  wordMax: number;
  htmlHint: string;
}

const EDITORIAL_ANGLES: EditorialAngle[] = [
  { id: 'investigative', tone: 'Araştırmacı Gazeteci', style: 'Derinlemesine soruşturma — gizli tedarik zinciri verileri, perde arkası bilgiler', wordMin: 450, wordMax: 650, htmlHint: '<h2>, <blockquote>, <p> kullan. "Kaynağımızın aktardığına göre..." tarzı ifadeler' },
  { id: 'trend_flash', tone: 'Trend Editörü', style: 'Kısa ve keskin trend raporu — "Bu Ay Neyi Kaçırma" formatı', wordMin: 200, wordMax: 350, htmlHint: '<h2>, <ul><li> (madde madde), kısa paragraflar. Hızlı okunan format' },
  { id: 'case_study', tone: 'İş Stratejisti', style: 'Gerçek bir firma veya proje başarı hikayesi — Vaka Analizi formatı', wordMin: 400, wordMax: 600, htmlHint: '<h2>Sorun</h2>, <h2>Çözüm</h2>, <h2>Sonuç</h2> yapısı, <table> ile rakamlar' },
  { id: 'market_flash', tone: 'Piyasa Muhabiri', style: 'Son dakika flash haber — 1 kritik gelişme, net ve doğrudan', wordMin: 180, wordMax: 300, htmlHint: 'İlk cümle = en kritik bilgi. Kısa paragraflar. Tablo veya rakam vurgusu' },
  { id: 'expert_voice', tone: 'Sektör Uzmanı', style: 'Uzman görüşü — analiz ve yorum ağırlıklı, derinlikli bakış', wordMin: 350, wordMax: 550, htmlHint: '<blockquote> ile uzman alıntıları, <h2> alt başlıklar, sonuç paragrafı' },
  { id: 'data_story', tone: 'Veri Gazetecisi', style: 'Sayılarla anlatım — tablo, karşılaştırma, yüzde değişimleri', wordMin: 300, wordMax: 500, htmlHint: '<table>, rakamsal <strong> vurgular, yüzdelik değişimler. Grafik açıklamaları' },
  { id: 'fair_coverage', tone: 'Fuar Muhabiri', style: 'Fuar/etkinlik izlenimi — canlı, yerinden aktarım havası', wordMin: 350, wordMax: 550, htmlHint: 'Canlı ses tonu, "standlardan notlar", <blockquote> ile katılımcı yorumları' },
  { id: 'product_review', tone: 'Ürün Editörü', style: 'Kumaş/ürün incelemesi — dokunsal detaylar, teknik analiz, performans puanı', wordMin: 250, wordMax: 450, htmlHint: 'Kumaş gramajı, doku, renk paletiyle başla. <table> ile teknik veriler. Puanlama' },
];

// ═══════════════════════════════════════
//  DİNAMİK GÖRSEL KOMBİNASYON SİSTEMİ
//  5 mood × 6 mekan × 4 kompozisyon = 120
//  Her haberde farklı görsel kimliği
// ═══════════════════════════════════════

const IMAGE_MOODS = [
  'warm golden hour sunlight flooding through',
  'crisp bright daylight with clean shadows',
  'soft morning coastal light filtering through',
  'Mediterranean afternoon sun with terracotta warmth',
  'Scandinavian minimal with cool natural daylight',
];

const IMAGE_SETTINGS = [
  'a luxury penthouse with panoramic city views',
  'a boutique hotel suite with artisan furnishings',
  'an Italian countryside villa with rustic stone walls',
  'a contemporary design studio showroom',
  'a Dubai waterfront luxury apartment',
  'a Parisian heritage apartment with ornate moldings',
  'a Aegean coastal home with whitewashed walls',
  'a Tokyo minimalist apartment with zen gardens visible',
];

const IMAGE_SUBJECTS: Record<string, string[]> = {
  'PERDE': ['floor-to-ceiling sheer linen curtains with beautiful drape', 'layered blackout and voile curtain combination', 'motorized smart curtains in motion', 'hand-pleated silk drapery on decorative rod'],
  'DÖŞEMELİK': ['premium velvet upholstery on a designer armchair', 'bouclé fabric sofa with textural cushions', 'leather and fabric mixed seating arrangement', 'artisan-woven upholstery in earthy tones'],
  'EV TEKSTİLİ': ['Egyptian cotton bedding with embroidered details', 'Turkish hammam towels and bath textiles', 'linen tablecloth and napkin setting for luxury dining', 'hand-loomed throw blankets on daybed'],
  'İSTİHBARAT': ['fabric swatch wall display in a design studio', 'textile trade showroom with labeled sample rolls', 'digital fabric scanner analyzing weave patterns', 'curated fabric library with color-coded sections'],
  'YENİ TEKNOLOJİ': ['automated motorized blinds with app control', 'acoustic fabric panels in modern office', 'smart fabric with temperature-regulating thread', 'sustainable recycled fiber textile samples'],
  'MİMARİ & TREND': ['bold geometric curtain pattern in trending colors', 'biophilic design with natural fiber textiles', 'color-blocked fabric panels as room dividers', 'avant-garde textile art installation'],
  'DEFAULT': ['premium curtains and elegant home textile accessories', 'beautiful draped fabrics with rich texture', 'luxury interior with curated textile elements', 'sophisticated fabric display with natural materials'],
};

const IMAGE_COMPOSITIONS = [
  'Wide-angle establishing shot showing the full room ambiance',
  'Medium shot focusing on fabric texture, drape and fold',
  'Intimate close-up showing weave quality and material detail',
  'Editorial-style vignette with styled accessories',
];

function buildImagePrompt(category: string, title: string, index: number): string {
  const mood = IMAGE_MOODS[Math.floor(Math.random() * IMAGE_MOODS.length)];
  const setting = IMAGE_SETTINGS[Math.floor(Math.random() * IMAGE_SETTINGS.length)];
  const subjects = IMAGE_SUBJECTS[category] || IMAGE_SUBJECTS['DEFAULT'];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const composition = IMAGE_COMPOSITIONS[Math.min(index, IMAGE_COMPOSITIONS.length - 1)];

  return `A masterpiece of high-end interior photography: ${composition} of ${setting} featuring ${subject}. ${mood}. Related to: "${title}". Bright, joyful, magazine-quality. Architectural Digest editorial. 16:9, photorealistic, 85mm lens.`.substring(0, 480);
}

// ═══════════════════════════════════════
//  KATEGORİ TESPİTİ
// ═══════════════════════════════════════

function detectCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.match(/perde|tül|fon perde|curtain|drape|stor/)) return 'PERDE';
  if (t.match(/döşeme|koltuk|mobilya|upholster/)) return 'DÖŞEMELİK';
  if (t.match(/havlu|bornoz|nevresim|yatak|bedding|towel/)) return 'EV TEKSTİLİ';
  if (t.match(/lojistik|navlun|liman|gümrük|kargo/)) return 'GÜMRÜK & LOJİSTİK';
  if (t.match(/ihale|ihracat|ticaret|anlaşma|sözleşme/)) return 'İHALE FIRSATI';
  if (t.match(/dijital|teknoloji|ar-ge|inovasyon|akıllı/)) return 'YENİ TEKNOLOJİ';
  if (t.match(/tasarım|mimari|dekorasyon|trend|renk/)) return 'MİMARİ & TREND';
  if (t.match(/iplik|elyaf|hammadde|pamuk|yarn|cotton/)) return 'HAMMADDE (İPLİK)';
  if (t.match(/fiyat|maliyet|piyasa|borsa/)) return 'İSTİHBARAT';
  return 'İSTİHBARAT';
}

// ═══════════════════════════════════════
//  SLUG ÜRETİMİ (Türkçe uyumlu)
// ═══════════════════════════════════════

function slugify(text: string): string {
  const map: Record<string, string> = { 'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','Ö':'o','Ş':'s','Ü':'u' };
  return text.split('').map(c => map[c] || c).join('')
    .toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80)
    + '-' + Date.now().toString(36);
}

// ═══════════════════════════════════════
//  KALİTE SKORU (v3.0 — kelime aralığına uyum)
// ═══════════════════════════════════════

function calculateQuality(article: ArticleData, translations: TranslationSet, imageCount: number): number {
  let score = 50;
  const wordCount = article.content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount > 200) score += 10;
  if (wordCount > 400) score += 5;
  if (wordCount > 600) score += 5;
  if (article.tags.length >= 5) score += 5;
  if (article.commercial_note && article.commercial_note.length > 50) score += 5;
  if (Object.keys(translations).length >= 6) score += 5;
  if (imageCount >= 3) score += 10;
  else if (imageCount >= 1) score += 5;
  // Bonus: category çevirisi varsa
  if (translations['DE']?.title && translations['EN']?.title) score += 5;
  return Math.min(score, 100);
}

// ═══════════════════════════════════════
//  HAFİF RELEVANCE GUARD
// ═══════════════════════════════════════

function relevanceCheck(text: string): { pass: boolean; reason?: string } {
  const t = text.toLowerCase();
  const forbidden = ['konfeksiyon', 'hazır giyim', 'fashion week', 'moda haftası', 'tişört', 't-shirt', 'hoodie', 'ayakkabı', 'çanta', 'elbise', 'podyum'];
  for (const f of forbidden) {
    if (t.includes(f)) return { pass: false, reason: `Yasaklı konu: "${f}"` };
  }
  const required = ['tekstil', 'perde', 'kumaş', 'fabric', 'textile', 'curtain', 'home textile', 'ev tekstili', 'döşemelik', 'iplik', 'ihracat', 'fuar', 'otel', 'hotel', 'trade', 'tül', 'drapery'];
  const hasRelevance = required.some(r => t.includes(r));
  if (!hasRelevance) return { pass: false, reason: 'Sektör ilgisi bulunamadı' };
  return { pass: true };
}

// ═══════════════════════════════════════
//  ANTİ-TEKRAR GUARD
//  Son 10 haberin başlığını çeker
// ═══════════════════════════════════════

async function getRecentTitles(): Promise<string[]> {
  try {
    const snap = await adminDb.collection('trtex_news')
      .orderBy('createdAt', 'desc').limit(10).get();
    return snap.docs.map(d => (d.data().title || '').substring(0, 80));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════
//  ADIM 1: SCOUT v3.0 — EDİTORYAL ÇEŞİTLİLİK
//  Rastgele editoryal açı + anti-tekrar
// ═══════════════════════════════════════

async function scout(brief: string): Promise<ArticleData> {
  const today = new Date().toISOString().split('T')[0];
  const year = new Date().getFullYear();

  // Rastgele editoryal açı seç
  const angle = EDITORIAL_ANGLES[Math.floor(Math.random() * EDITORIAL_ANGLES.length)];
  console.log(`[SCOUT] 🎭 Editoryal Açı: ${angle.id} (${angle.tone}) | ${angle.wordMin}-${angle.wordMax} kelime`);

  // Anti-tekrar: son 10 haberi al
  const recentTitles = await getRecentTitles();
  const antiRepeatBlock = recentTitles.length > 0
    ? `\n⛔ BUNLARA BENZEME — SON HABERLER:\n${recentTitles.map((t, i) => `${i+1}. "${t}"`).join('\n')}\nYukarıdaki başlıklara benzer konu, kelime, yapı KULLANMA. TAMAMEN FARKLI bir açı bul.`
    : '';

  const systemPrompt = `🎯 ALOHA NEWS ENGINE v3.0 — ${angle.tone.toUpperCase()}
BUGÜN = ${today}, YIL = ${year}

Sen ${angle.tone} rolündesin. Ev tekstili ve perde sektörü için haber üretiyorsun.
Üslubun: ${angle.style}

🔴 MUTLAK YASAKLAR:
- ${year} öncesi yıl referansı → YASAK
- Konfeksiyon, hazır giyim, moda haftası → YASAK  
- Sahte firma/istatistik → YASAK
- "B2B" kelimesini başlıkta KULLANMA
- Aşırı jargon → YASAK. Akıcı, okunabilir, keyifli bir dil kullan
- Her cümlede "tedarik zinciri" veya "ticari" deme

✅ İÇERİK ÇERÇEVESİ:
1. Perde, tül, stor, döşemelik kumaş, otel tekstili, yatak örtüsü
2. Fuar izlenimleri (Heimtextil, Hometex, Domotex), şehir haberleri (Denizli, Bursa, İstanbul)
3. Kumaş dokusu, renk trendleri, akustik/FR kumaşlar, sürdürülebilir üretim
4. Proje haberleri (otel, rezidans, villa, ofis), yeni koleksiyonlar
5. Hammadde fiyatları (pamuk, polyester, iplik), kurlar, navlun
6. Akıllı ev sistemleri, motorlu perde, otomasyon
${antiRepeatBlock}

🎯 FARK YARATAN KURAL: Her haber ÖZGÜN olmalı. Klişe kaçın. Okuyucu "bunu bilmiyordum" demeli.`;

  // AŞAMA 1: Metadata (title, summary, tags, intent) — küçük JSON, parse güvenli
  const meta = await alohaAI.generateJSON<{
    title: string; summary: string; intent: string;
    commercial_note: string; tags: string[];
  }>(`
Brief: "${brief}"
Editoryal Açı: ${angle.tone} — ${angle.style}

Bu brief'i baz alarak ev tekstili haberi için metadata üret.
JSON döndür:
{
  "title": "Haber başlığı (50-90 karakter, Türkçe, çekici ve merak uyandıran. 'B2B' kelimesi KULLANMA)",
  "summary": "2-3 cümlelik kısa özet (max 180 karakter, doğal dil)",
  "intent": "ACT veya ANALYZE veya DISCOVER",
  "commercial_note": "50-100 kelime kısa piyasa analiz yorumu",
  "tags": ["perde", "ev tekstili", "5 dinamik keyword daha"]
}`, { systemInstruction: systemPrompt, temperature: 0.85 }, 'newsEngine.meta');

  // AŞAMA 2: Content (tam HTML makale) — düz metin, JSON yok
  const content = await alohaAI.generate(`
"${meta.title}" başlıklı haber için HTML makale gövdesi yaz.
Özet: ${meta.summary}
Editoryal Açı: ${angle.tone} — ${angle.style}

KRİTİK KURALLAR:
- ${angle.wordMin}-${angle.wordMax} kelime ARASI (AŞMA!)
- ${angle.htmlHint}
- Doğal, akıcı dil — okuyucu sıkılmamalı
- İlk cümle = en ilginç/önemli bilgi
- "B2B" kelimesini metinde minimum kullan (max 1-2 kez)
- Gerçek firma adları, gerçek rakamlar, gerçek şehirler
- Son cümle = kısa, akılda kalan bir kapanış
- SADECE HTML döndür, JSON veya markdown KULLANMA
- Açıklama, yorum, markdown fence EKLEME — saf HTML`, 
  { systemInstruction: systemPrompt, temperature: 0.8 }, 'newsEngine.content');

  // HTML fence temizliği
  let cleanContent = content
    .replace(/```html\s*/gi, '').replace(/```\s*/g, '')
    .replace(/^[\s\S]*?(<[hp])/i, '$1')
    .trim();

  const category = detectCategory(meta.title || '');

  return {
    title: meta.title || 'Başlıksız Haber',
    summary: meta.summary || '',
    content: cleanContent,
    category,
    intent: (meta.intent as any) || 'DISCOVER',
    commercial_note: meta.commercial_note || '',
    tags: Array.isArray(meta.tags) ? meta.tags : ['perde', 'ev tekstili', 'döşemelik'],
  };
}

// ═══════════════════════════════════════
//  ADIM 2: PUBLISHER — 8 Dile Çevir
//  (Sadece title + summary JSON, content düz metin)
// ═══════════════════════════════════════

async function translate(article: ArticleData): Promise<TranslationSet> {
  // title + summary + category çevir (v3.0: category eklendi)
  const headerTranslations = await alohaAI.generateJSON<Record<string, { title: string; summary: string; category: string }>>(`
Bu Türkçe haber başlığı, özetini ve kategorisini 7 dile çevir.

Başlık: ${article.title}
Özet: ${article.summary}
Kategori: ${article.category}

JSON döndür (HER dil için title, summary ve category):
{
  "EN": {"title":"...","summary":"...","category":"..."},
  "DE": {"title":"...","summary":"...","category":"..."},
  "FR": {"title":"...","summary":"...","category":"..."},
  "ES": {"title":"...","summary":"...","category":"..."},
  "AR": {"title":"...","summary":"...","category":"..."},
  "RU": {"title":"...","summary":"...","category":"..."},
  "ZH": {"title":"...","summary":"...","category":"..."}
}

Kategori çevirisi örnekleri: PERDE→CURTAIN/VORHANG, İSTİHBARAT→INTELLIGENCE, EV TEKSTİLİ→HOME TEXTILE/HEIMTEXTIL`, 
  { temperature: 0.3 }, 'newsEngine.translateHeaders');

  // TR'yi doğrudan ekle
  const result: TranslationSet = {
    TR: { title: article.title, summary: article.summary, content: article.content },
  };

  // Diğer dillere çevirileri ekle (category dahil)
  for (const [lang, data] of Object.entries(headerTranslations)) {
    result[lang] = {
      title: data.title || article.title,
      summary: data.summary || article.summary,
      category: (data as any).category || article.category,
      content: article.content,
    } as any;
  }

  return result;
}

// ═══════════════════════════════════════
//  ADIM 3: PHOTOGRAPHER — 3 Görsel Üret
//  16:9 zorunlu, yazı genişliğini aşmaz
//  Perde & ev tekstili odaklı lüks dergi
// ═══════════════════════════════════════

async function photograph(title: string, category: string): Promise<string[]> {
  const negative = 'dark, moody, gloomy, shadows, dimly lit, scary, horror, poorly lit, messy, cluttered, cheap, amateur, watermark, text overlay, typography, logos, people, humans, models, faces, hands';

  const urls: string[] = [];

  let bucket: any;
  try {
    bucket = admin.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aipyram-web.firebasestorage.app');
  } catch {
    console.error('[PHOTOGRAPHER] ❌ Storage bucket erişilemedi');
    return [];
  }

  let imagenClient: any;
  try {
    const { GoogleGenAI } = require('@google/genai');
    imagenClient = new GoogleGenAI({
      vertexai: {
        project: process.env.VERTEX_PROJECT_ID || 'aipyram-web',
        location: process.env.VERTEX_LOCATION || 'europe-west1',
      }
    });
  } catch (e: any) {
    console.error('[PHOTOGRAPHER] ❌ Vertex AI client hatası:', e.message);
    return [];
  }

  for (let i = 0; i < 3; i++) {
    // v3.0: Dinamik prompt — her görsel benzersiz
    const prompt = `${buildImagePrompt(category, title, i)}\nNegative: ${negative}`.substring(0, 480);

    for (let retry = 0; retry < 2; retry++) {
      try {
        const response = await imagenClient.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt,
          config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        });

        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64) throw new Error('Boş görsel');

        const buffer = Buffer.from(base64, 'base64');
        const fileSlug = title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const filename = `trtex-news/${fileSlug}-${Date.now()}-${i + 1}.jpg`;
        const file = bucket.file(filename);

        await file.save(buffer, {
          contentType: 'image/jpeg',
          metadata: { cacheControl: 'public, max-age=31536000' },
        });
        try { await file.makePublic(); } catch {}

        const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        urls.push(url);
        console.log(`[PHOTOGRAPHER] ✅ Görsel ${i + 1}/3 üretildi`);

        if (i < 2) await new Promise(r => setTimeout(r, 5000));
        break;
      } catch (err: any) {
        console.warn(`[PHOTOGRAPHER] ⚠️ Görsel ${i + 1} hata (deneme ${retry + 1}): ${err.message?.substring(0, 60)}`);
        if (retry === 1) console.warn(`[PHOTOGRAPHER] ⚠️ Görsel ${i + 1} atlandı`);
        else await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  return urls.filter(u => u && u.startsWith('http'));
}

// ═══════════════════════════════════════
//  ADIM 4: FIRESTORE'A KAYDET
// ═══════════════════════════════════════

async function saveToFirestore(
  article: ArticleData,
  translations: TranslationSet,
  images: string[],
  qualityScore: number
): Promise<string> {
  const id = crypto.randomUUID();
  const slug = slugify(article.title);
  const now = new Date().toISOString();

  const finalImages = images.length > 0 ? images : [
    '/aloha_images/aloha_fallback_1.png',
    '/aloha_images/aloha_fallback_2.png',
    '/aloha_images/aloha_fallback_3.png',
  ];

  const doc = {
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    slug,
    status: 'published',
    createdAt: now,
    publishedAt: now,
    image_url: finalImages[0] || '',
    images: finalImages,
    mid_image_url: finalImages[1] || '',
    detail_image_url: finalImages[2] || '',
    needs_image: images.length === 0,
    translations,
    intent: article.intent,
    commercial_note: article.commercial_note,
    tags: article.tags,
    quality_score: qualityScore,
    source: 'ALOHA_ENGINE_V3',
    pipeline_version: '3.0',
    editorial_angle: '', // scout() tarafından set edilecek
  };

  await adminDb.collection('trtex_news').doc(id).set(doc);
  console.log(`[SAVE] ✅ Firestore'a yazıldı: ${id} — "${article.title.substring(0, 50)}..."`);

  // ═══ ANA SAYFAYI GÜNCELLE ═══
  // trtex_terminal.current → PremiumB2BHomeLayout bu belgeden okuyor
  try {
    const latestSnap = await adminDb.collection('trtex_news')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(15)
      .get();
    
    const latestArticles = latestSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (latestArticles.length > 0) {
      await adminDb.collection('trtex_terminal').doc('current').set({
        heroArticle: latestArticles[0],
        gridArticles: latestArticles.slice(1, 13),
        haftaninFirsatlari: latestArticles.slice(0, 5),
        academyArticles: latestArticles.slice(1, 3),
        radarStream: {
          risk: latestArticles[1] || null,
          opportunity: latestArticles[2] || null,
          signal: latestArticles[3] || null,
        },
        tickerItems: [],
        todayInsight: {
          market: latestArticles[0]?.commercial_note || '',
          risk: '',
          opportunity: '',
        },
        fairsWithCountdown: [],
        menuConfig: [
          { id: 'haberler', label: 'HABERLER', slug: 'news', subItems: [
            { id: 'guncel', label: 'Son Haberler', slug: 'news' },
            { id: 'radar', label: 'Dünya Radarı', slug: 'radar' },
          ]},
          { id: 'ihaleler', label: 'İHALELER', slug: 'tenders' },
          { id: 'ticaret', label: 'TİCARET', slug: 'trade' },
          { id: 'akademi', label: 'AKADEMİ', slug: 'academy' },
        ],
        hasPremiumReport: true,
        generatedAt: now,
        version: Date.now(),
        cycleId: `engine-v2.1-${id.substring(0, 8)}`,
      }, { merge: false });
      console.log(`[SAVE] ✅ trtex_terminal.current güncellendi (${latestArticles.length} haber)`);
    }
  } catch (e: any) {
    console.warn(`[SAVE] ⚠️ Terminal güncelenemedi: ${e.message}`);
  }

  return id;
}

// ═══════════════════════════════════════
//  ANA PIPELINE
// ═══════════════════════════════════════

export async function runNewsPipeline(brief: string): Promise<PipelineResult> {
  const start = Date.now();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[NEWS ENGINE v3.0] 🚀 Pipeline başladı`);
  console.log(`${'═'.repeat(60)}`);

  try {
    // ADIM 1: Scout — editoryal çeşitlilik + anti-tekrar
    console.log('[1/4] 🕵️ Scout: Haber üretiliyor (editoryal çeşitlilik)...');
    const article = await scout(brief);
    console.log(`[1/4] ✅ "${article.title.substring(0, 50)}..." (${article.category})`);

    // HAFİF GUARD
    const guard = relevanceCheck(article.title + ' ' + article.content.substring(0, 500));
    if (!guard.pass) {
      console.warn(`[GUARD] 🛑 Reddedildi: ${guard.reason}`);
      return { success: false, imageCount: 0, qualityScore: 0, error: guard.reason, durationMs: Date.now() - start };
    }

    // ADIM 2 + 3: PARALEL — çeviri (category dahil) + görsel
    console.log('[2-3/4] 🌍📸 Çeviri + Görsel PARALEL...');
    const [translations, images] = await Promise.all([
      translate(article),
      photograph(article.title, article.category).catch((err) => {
        console.error(`[PHOTOGRAPHER] ❌ Hata (fallback devrede): ${err.message}`);
        return [] as string[];
      }),
    ]);
    console.log(`[2-3/4] ✅ ${Object.keys(translations).length} dil | ${images.length}/3 görsel`);

    const qualityScore = calculateQuality(article, translations, images.length);

    // ADIM 4: Kaydet — HABER HER DURUMDA KAYDEDİLİR
    console.log('[4/4] 💾 Firestore kaydediliyor...');
    const articleId = await saveToFirestore(article, translations, images, qualityScore);

    const duration = Date.now() - start;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[NEWS ENGINE v3.0] ✅ ${Math.round(duration / 1000)}s | ${images.length} görsel | Kalite: ${qualityScore}`);
    console.log(`${'═'.repeat(60)}\n`);

    return { success: true, articleId, title: article.title, imageCount: images.length, qualityScore, durationMs: duration };
  } catch (err: any) {
    console.error(`[NEWS ENGINE v3.0] 🔴 ${err.message}`);
    return { success: false, imageCount: 0, qualityScore: 0, error: err.message, durationMs: Date.now() - start };
  }
}

// ═══════════════════════════════════════
//  ÇOKLU HABER ÜRETİMİ (Batch)
// ═══════════════════════════════════════

export async function runBatchPipeline(briefs: string[]): Promise<PipelineResult[]> {
  const results: PipelineResult[] = [];
  for (let i = 0; i < briefs.length; i++) {
    const result = await runNewsPipeline(briefs[i]);
    results.push(result);
    if (i < briefs.length - 1) await new Promise(r => setTimeout(r, 5000));
  }
  return results;
}

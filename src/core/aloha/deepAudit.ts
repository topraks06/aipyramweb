/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  ALOHA DEEP SITE AUDIT — Otonom Site Denetim Ajanı       ║
 * ║  Tüm projeler için sürdürülebilir kalite kontrol          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * Bu ajan canlı siteyi + Firestore'u denetler ve kapsamlı rapor üretir.
 * Sonra autoRepair ile otonom onarım başlatır.
 */

import { adminDb } from '@/lib/firebase-admin';
import { slugify, normalizeSlug } from '@/core/utils/slugify';

// ═══════════════════════════════════════
//  GÜVENLİ ARAŞTIRMA KAYNAKLARI
//  Aloha sadece bu kurumsal kaynaklardan öğrenir
// ═══════════════════════════════════════
export const TRUSTED_SOURCES: Record<string, string[]> = {
  textile: [
    'https://www.textilegence.com',
    'https://www.hometextilesmag.com',
    'https://www.heimtextil.messefrankfurt.com',
    'https://www.interiorsandsources.com',
    'https://www.textileworld.com',
    'https://www.fibre2fashion.com',
    'https://textilindustrie.de',
    'https://www.itkib.org.tr',
  ],
  market_data: [
    'https://www.investing.com/commodities/us-cotton-no.2',
    'https://tr.tradingeconomics.com/commodity/cotton',
    'https://www.indexmundi.com/commodities/?commodity=cotton',
  ],
  fairs: [
    'https://www.heimtextil.messefrankfurt.com',
    'https://www.hometex.com.tr',
    'https://www.itma.com',
    'https://www.domotex.de',
    'https://www.maison-objet.com',
  ],
};

// ═══════════════════════════════════════
//  PROJELERİN YAPISAL BİLGİLERİ
// ═══════════════════════════════════════
const PROJECT_CONFIG: Record<string, {
  domain: string;
  collection: string;
  mandatoryKeywords: string[];
  minImages: number;
  minBodyLength: number;
  minKeywords: number;
}> = {
  trtex: {
    domain: 'https://trtex.com',
    collection: 'trtex_news',
    mandatoryKeywords: ['perde', 'ev tekstili', 'dekorasyon'],
    minImages: 2,
    minBodyLength: 500,
    minKeywords: 8,
  },
  hometex: {
    domain: 'https://hometex.ai',
    collection: 'hometex_news',
    mandatoryKeywords: ['home textile', 'curtain', 'decoration'],
    minImages: 2,
    minBodyLength: 500,
    minKeywords: 8,
  },
  perde: {
    domain: 'https://perde.ai',
    collection: 'perde_news',
    mandatoryKeywords: ['perde', 'tül', 'tasarım'],
    minImages: 1,
    minBodyLength: 300,
    minKeywords: 5,
  },
};

export interface AuditIssue {
  level: 'critical' | 'warning' | 'info';
  type: string;
  articleId?: string;
  title?: string;
  detail: string;
  action: string;
}

export interface RepairAction {
  action: 'fill_content' | 'replace_image' | 'add_keywords' | 'fix_formatting' | 'add_ai_commentary' | 'add_images' | 'fix_alt_text' | 'fix_slug' | 'rebuild_terminal' | 'targeted_terminal_fix';
  articleId: string;
  title: string;
  reason: string;
  priority: number; // 1 = acil, 5 = düşük
  targetCommand?: string;
}

export interface AuditReport {
  project: string;
  timestamp: string;
  score: number;
  totalArticles: number;
  scores: {
    content: number;
    images: number;
    seo: number;
    diversity: number;
    freshness: number;
  };
  issues: AuditIssue[];
  repairPlan: RepairAction[];
  summary: string;
}

// ═══════════════════════════════════════
//  ANA DENETİM FONKSİYONU
// ═══════════════════════════════════════
export async function deepSiteAudit(project: string): Promise<AuditReport> {
  const config = PROJECT_CONFIG[project];
  if (!config) {
    return {
      project,
      timestamp: new Date().toISOString(),
      score: 0,
      totalArticles: 0,
      scores: { content: 0, images: 0, seo: 0, diversity: 0, freshness: 0 },
      issues: [{ level: 'critical', type: 'config', detail: `Proje "${project}" tanımlı değil`, action: 'Yapılandırma ekle' }],
      repairPlan: [],
      summary: `Proje "${project}" bulunamadı.`,
    };
  }

  console.log(`\n[AUDIT] 🔍 ${project.toUpperCase()} Deep Site Audit başlatılıyor...`);

  const issues: AuditIssue[] = [];
  const repairPlan: RepairAction[] = [];
  let contentScore = 100;
  let imageScore = 100;
  let seoScore = 100;
  let diversityScore = 100;
  let freshnessScore = 100;

  // ═══════════════════════════════════════
  //  1. FİRESTORE DENETİMİ
  // ═══════════════════════════════════════
  
  // 🚨 HESAP SORMA (ACCOUNTABILITY) - 4.2 MASTER CONTROL - SCORE SİSTEMİ
  if (project === 'trtex') {
      try {
          const terminalSnap = await adminDb.collection('trtex_terminal').doc('current').get();
          if (!terminalSnap.exists) {
              issues.push({ level: 'critical', type: 'missing_terminal', detail: 'TRTEX Terminali tamamen yok!', action: 'Tam Yeniden İnşa' });
              repairPlan.push({ action: 'rebuild_terminal', articleId: 'trtex_terminal', title: 'TRTEX FATAL', reason: 'Terminal verisi silinmis', priority: 1 });
              contentScore -= 100;
          } else {
              const payload = terminalSnap.data() as any;
              
              // SCORE BİLEŞENLERİ (Total 100)
              let tScore = { freshness: 20, balance: 20, real_data: 20, images: 20, diversity: 20 };
              let specificAction = '';
              let failReasons: string[] = [];
              
              // 1. Freshness (Tazelik)
              const ageHours = payload.generatedAt ? (Date.now() - new Date(payload.generatedAt).getTime()) / (1000 * 60 * 60) : Infinity;
              if (ageHours > 12) { 
                 tScore.freshness = 0; failReasons.push(`Freshness: BAD (${Math.round(ageHours)} saat eski)`);
                 specificAction = 'forceFreshSignal';
              } else if (ageHours > 6) {
                 tScore.freshness = 10;
              }
              
              // 2. Kategori Kapasitesi (Balance)
              const gridCount = payload.gridArticles?.length || 0;
              if (gridCount < 5 || !payload.heroArticle) {
                 tScore.balance = 0; failReasons.push(`Category Balance: BROKEN (${gridCount}/5 grid)`);
                 specificAction = specificAction || 'forceCategory';
              }
              
              // 3. Image Durumu
              const allArticles = [payload.heroArticle, ...(payload.gridArticles || [])].filter(Boolean);
              const missingImages = allArticles.filter(a => !a.image_url || a.image_url.includes('unsplash') || a.image_url.includes('placeholder'));
              if (missingImages.length > 0) {
                 tScore.images = Math.max(0, 20 - (missingImages.length * 10));
                 if (tScore.images === 0) {
                     failReasons.push(`Images: BAD (${missingImages.length} eksik/stok)`);
                     specificAction = specificAction || 'imageRepairMode';
                 }
              }
              
              const totalTRTEX = tScore.freshness + tScore.balance + tScore.real_data + tScore.images + tScore.diversity;
              
              if (totalTRTEX < 70) {
                 issues.push({ level: 'critical', type: 'low_score', detail: `TRTEX Score: ${totalTRTEX}/100. Failures: ${failReasons.join(', ')}`, action: 'Targeted Fix' });
                 repairPlan.push({ 
                     // @ts-ignore
                     action: 'targeted_terminal_fix', 
                     articleId: 'trtex_terminal', 
                     title: `TRTEX MASTER AUDIT FAIL (${totalTRTEX}/100)`, 
                     reason: failReasons.join(' | '),
                     priority: 1,
                     targetCommand: specificAction 
                 } as any);
                 contentScore -= (100 - totalTRTEX);
              }
          }
      } catch (e: any) {
          issues.push({ level: 'critical', type: 'firestore', detail: `Terminal okunamadı: ${e.message}`, action: 'Terminal Rebuild' });
      }
  }

  let articles: any[] = [];
  try {
    const snap = await adminDb.collection(config.collection).get();
    articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`[AUDIT] 📊 ${articles.length} makale bulundu`);
  } catch (e: any) {
    issues.push({ level: 'critical', type: 'firestore', detail: `Firestore bağlantı hatası: ${e.message}`, action: 'Firebase yapılandırmasını kontrol et' });
    if(project !== 'trtex') contentScore -= 50;
  }

  // Makale bazlı denetim
  const titleSet = new Set<string>();
  const now = Date.now();
  let recentCount = 0; // son 48 saat

  for (const art of articles) {
    const title = art.translations?.TR?.title || art.title || '';
    const body = art.translations?.TR?.content || art.content || art.body || '';
    const img = art.image_url || '';
    const media = art.media?.images || [];
    const keywords = art.seo?.keywords || art.seo_keywords || [];
    const aiCommentary = art.ai_commentary || '';
    const bizOpps = art.business_opportunities || [];
    const publishedAt = art.publishedAt ? new Date(art.publishedAt).getTime() : 0;

    // ─── SLUG DENETİMİ (Türkçe karakter tespiti) ───
    const currentSlug = art.slug || '';
    const properSlug = slugify(title);
    if (currentSlug && currentSlug !== properSlug) {
      // Slug'da Türkçe karakter var mı kontrol et
      const hasTurkish = /[ğüşıöçĞÜŞİÖÇ]/.test(currentSlug);
      if (hasTurkish) {
        issues.push({ level: 'critical', type: 'broken_slug', articleId: art.id, title, detail: `Slug Türkçe karakter içeriyor: "${currentSlug}" → "${properSlug}"`, action: 'Slug düzelt' });
        repairPlan.push({ action: 'fix_slug', articleId: art.id, title, reason: `Türkçe slug: ${currentSlug}`, priority: 1 });
        seoScore -= 2;
      }
    }
    if (!currentSlug) {
      issues.push({ level: 'critical', type: 'missing_slug', articleId: art.id, title, detail: 'Slug alanı boş', action: 'Slug oluştur' });
      repairPlan.push({ action: 'fix_slug', articleId: art.id, title, reason: 'Slug boş', priority: 1 });
      seoScore -= 3;
    }

    // Yenilik kontrolü
    if (now - publishedAt < 48 * 60 * 60 * 1000) recentCount++;

    // ─── İÇERİK DENETİMİ ───
    if (body.length < 50) {
      issues.push({ level: 'critical', type: 'empty_content', articleId: art.id, title, detail: `Body BOŞ (${body.length} chr)`, action: 'İçerik yaz' });
      repairPlan.push({ action: 'fill_content', articleId: art.id, title, reason: 'Boş body', priority: 1 });
      contentScore -= 3;
    } else if (body.length < config.minBodyLength) {
      issues.push({ level: 'warning', type: 'short_content', articleId: art.id, title, detail: `İçerik çok kısa (${body.length} chr, min: ${config.minBodyLength})`, action: 'İçerik genişlet' });
      repairPlan.push({ action: 'fill_content', articleId: art.id, title, reason: `Kısa (${body.length} chr)`, priority: 3 });
      contentScore -= 1;
    }

    // HTML formatting kontrolü
    if (body.length > 200 && !body.includes('<h2') && !body.includes('<h3')) {
      issues.push({ level: 'warning', type: 'no_headings', articleId: art.id, title, detail: 'Alt başlık (h2/h3) yok — okunaklılık düşük', action: 'Formatla' });
      repairPlan.push({ action: 'fix_formatting', articleId: art.id, title, reason: 'Alt başlık eksik', priority: 4 });
      contentScore -= 0.5;
    }

    // ─── GÖRSEL DENETİMİ ───
    if (!img || img.length < 10) {
      issues.push({ level: 'critical', type: 'no_image', articleId: art.id, title, detail: 'Kapak görseli YOK', action: 'Görsel üret' });
      repairPlan.push({ action: 'replace_image', articleId: art.id, title, reason: 'Görsel yok', priority: 1 });
      imageScore -= 3;
    } else if (img.includes('unsplash') || img.includes('picsum') || img.includes('placeholder')) {
      issues.push({ level: 'critical', type: 'stock_image', articleId: art.id, title, detail: `Stok fotoğraf tespit: ${img.substring(0, 60)}`, action: 'AI görsel ile değiştir' });
      repairPlan.push({ action: 'replace_image', articleId: art.id, title, reason: 'Stok fotoğraf', priority: 2 });
      imageScore -= 2;
    }

    // Minimum görsel sayısı
    const totalImages = media.length || (img ? 1 : 0);
    if (totalImages < config.minImages) {
      issues.push({ level: 'warning', type: 'few_images', articleId: art.id, title, detail: `Sadece ${totalImages} görsel (min: ${config.minImages})`, action: 'Ek görsel ekle' });
      repairPlan.push({ action: 'add_images', articleId: art.id, title, reason: `${totalImages} görsel, min ${config.minImages}`, priority: 3 });
      imageScore -= 1;
    }

    // Alt text kontrolü
    for (const m of media) {
      if (!m.alt_text || m.alt_text.length < 10) {
        issues.push({ level: 'info', type: 'missing_alt', articleId: art.id, title, detail: 'Görsel alt text eksik veya çok kısa', action: 'Alt text ekle' });
        repairPlan.push({ action: 'fix_alt_text', articleId: art.id, title, reason: 'Alt text eksik', priority: 5 });
        imageScore -= 0.5;
        break; // Her makale için 1 kez say
      }
    }

    // ─── SEO DENETİMİ ───
    const kwStr = keywords.join(' ').toLowerCase();
    const missingMandatory = config.mandatoryKeywords.filter(mk => !kwStr.includes(mk));
    if (missingMandatory.length > 0) {
      issues.push({ level: 'warning', type: 'missing_mandatory_kw', articleId: art.id, title, detail: `Zorunlu keyword eksik: ${missingMandatory.join(', ')}`, action: 'Keyword ekle' });
      repairPlan.push({ action: 'add_keywords', articleId: art.id, title, reason: `Eksik: ${missingMandatory.join(', ')}`, priority: 2 });
      seoScore -= 1;
    }
    if (keywords.length < config.minKeywords) {
      issues.push({ level: 'info', type: 'few_keywords', articleId: art.id, title, detail: `Sadece ${keywords.length} keyword (min: ${config.minKeywords})`, action: 'Keyword zenginleştir' });
      seoScore -= 0.5;
    }

    // AI Commentary
    if (!aiCommentary || aiCommentary.length < 20) {
      issues.push({ level: 'info', type: 'no_ai_commentary', articleId: art.id, title, detail: 'AI yorum/analiz eksik', action: 'AI yorum ekle' });
      repairPlan.push({ action: 'add_ai_commentary', articleId: art.id, title, reason: 'AI yorum yok', priority: 4 });
      contentScore -= 0.5;
    }

    // ─── ÇEŞİTLİLİK DENETİMİ ───
    const normalizedTitle = title.toLowerCase().substring(0, 40);
    if (titleSet.has(normalizedTitle)) {
      issues.push({ level: 'warning', type: 'duplicate_title', articleId: art.id, title, detail: 'Benzer/tekrar başlık tespit edildi', action: 'Başlık çeşitlendir' });
      diversityScore -= 2;
    }
    titleSet.add(normalizedTitle);
  }

  // ─── TAZELİK DENETİMİ ───
  if (recentCount < 3 && articles.length > 10) {
    issues.push({ level: 'critical', type: 'stale_content', detail: `Son 48 saatte sadece ${recentCount} haber — minimum 6 olmalı`, action: 'Yeni haber üret' });
    freshnessScore -= 20;
  }

  // ═══════════════════════════════════════
  //  2. CANLI SİTE DENETİMİ (HTTP)
  // ═══════════════════════════════════════
  try {
    console.log(`[AUDIT] 🌐 Canlı site kontrolü: ${config.domain}`);
    const siteRes = await fetch(config.domain, { 
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'AlohaAuditBot/1.0' }
    });
    
    if (!siteRes.ok) {
      issues.push({ level: 'critical', type: 'site_down', detail: `Site yanıt vermedi: HTTP ${siteRes.status}`, action: 'Hosting kontrol et' });
      contentScore -= 30;
    } else {
      const html = await siteRes.text();
      
      // Meta tag kontrolü
      if (!html.includes('<meta name="description"') && !html.includes('<meta property="og:description"')) {
        issues.push({ level: 'warning', type: 'missing_meta', detail: 'Ana sayfada meta description eksik', action: 'SEO meta ekle' });
        seoScore -= 5;
      }
      if (!html.includes('<title>') || html.includes('<title></title>')) {
        issues.push({ level: 'warning', type: 'missing_title', detail: 'Ana sayfada title tag eksik veya boş', action: 'Title tag ekle' });
        seoScore -= 5;
      }

      // Kırık görsel kontrolü (basit)
      const imgMatches = html.match(/src="([^"]*\.(jpg|jpeg|png|webp|svg))"/gi) || [];
      console.log(`[AUDIT] 🖼️ ${imgMatches.length} görsel referansı bulundu`);

      // Ticker/fiyat bar kontrolü
      if (html.includes('Bağlantı koptu') || html.includes('eski veriler')) {
        issues.push({ level: 'critical', type: 'broken_ticker', detail: 'Canlı fiyat ticker bağlantısı kopuk', action: 'Ticker veri kaynağını düzelt' });
        contentScore -= 5;
      }
    }
  } catch (e: any) {
    issues.push({ level: 'warning', type: 'site_unreachable', detail: `Site erişilemedi: ${e.message}`, action: 'DNS/hosting kontrol et' });
  }

  // ═══════════════════════════════════════
  //  3. SKOR HESAPLAMA
  // ═══════════════════════════════════════
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const scores = {
    content: clamp(contentScore),
    images: clamp(imageScore),
    seo: clamp(seoScore),
    diversity: clamp(diversityScore),
    freshness: clamp(freshnessScore),
  };
  const totalScore = Math.round(
    scores.content * 0.3 + scores.images * 0.25 + scores.seo * 0.2 + scores.diversity * 0.15 + scores.freshness * 0.1
  );

  // Repair plan'ı öncelik sırasına göre sırala
  repairPlan.sort((a, b) => a.priority - b.priority);

  const criticalCount = issues.filter(i => i.level === 'critical').length;
  const warningCount = issues.filter(i => i.level === 'warning').length;

  const summary = `[${project.toUpperCase()} AUDIT] Skor: ${totalScore}/100 | ` +
    `${articles.length} makale | ${criticalCount} kritik, ${warningCount} uyarı | ` +
    `İçerik: ${scores.content} | Görsel: ${scores.images} | SEO: ${scores.seo} | ` +
    `Çeşitlilik: ${scores.diversity} | Tazelik: ${scores.freshness} | ` +
    `${repairPlan.length} onarım aksiyonu planlandı.`;

  console.log(`[AUDIT] ✅ ${summary}`);

  return {
    project,
    timestamp: new Date().toISOString(),
    score: totalScore,
    totalArticles: articles.length,
    scores,
    issues,
    repairPlan,
    summary,
  };
}

// ═══════════════════════════════════════
//  WEB ARAŞTIRMA (Güvenli kaynaklar)
// ═══════════════════════════════════════
export async function researchFromTrustedSources(
  topic: string, 
  category: keyof typeof TRUSTED_SOURCES = 'textile'
): Promise<string> {
  const sources = TRUSTED_SOURCES[category] || TRUSTED_SOURCES.textile;
  const results: string[] = [];

  console.log(`[RESEARCH] 🔬 "${topic}" araştırılıyor (${sources.length} kaynak)...`);

  for (const url of sources.slice(0, 3)) { // Max 3 kaynak
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'AlohaResearchBot/1.0' }
      });
      if (res.ok) {
        const html = await res.text();
        // Basit metin çıkarma (HTML tag'larını kaldır)
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 2000);
        
        results.push(`[${url}]\n${text.substring(0, 500)}`);
        console.log(`[RESEARCH] ✅ ${url} → ${text.length} chr`);
      }
    } catch {
      console.log(`[RESEARCH] ❌ ${url} erişilemedi`);
    }
  }

  return results.join('\n\n---\n\n') || 'Kaynaklardan veri alınamadı.';
}

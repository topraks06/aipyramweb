/**
 * ALOHA SEO/GEO OPS — Yeni Nesil Arama Motoru Optimizasyonu
 * 
 * SEO: Google Indexing API, Bing Webmaster, Sitemap
 * GEO: Generative Engine Optimization (AI arama motorları: Perplexity, ChatGPT Search, Gemini)
 * 
 * GEO = Yeni nesil SEO. AI chatbotları siteleri "anlayabilmeli".
 * Schema.org, E-E-A-T sinyalleri, yapılandırılmış veri.
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════════════════
// 1. GOOGLE INDEXING API — URL Gönderimi
// ═══════════════════════════════════════════════════

/**
 * Google'a URL indexleme isteği gönder (yeni içerik anında indexlensin)
 */
export async function submitUrlToGoogle(url: string, action: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<{
  success: boolean; error?: string;
}> {
  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/indexing'] });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, type: action }),
    });

    if (!res.ok) {
      return { success: false, error: `Google Indexing (${res.status}): ${(await res.text()).substring(0, 200)}` };
    }

    await logSeoOp('GOOGLE_INDEX', { url, action });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Birden fazla URL'yi toplu indexle
 */
export async function batchIndexUrls(urls: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  
  for (const url of urls.slice(0, 100)) { // Max 100
    const result = await submitUrlToGoogle(url);
    if (result.success) success++;
    else errors.push(`${url}: ${result.error}`);
    
    // Rate limit: 200ms aralık
    await new Promise(r => setTimeout(r, 200));
  }

  return { success, failed: errors.length, errors: errors.slice(0, 5) };
}

// ═══════════════════════════════════════════════════
// 2. BING WEBMASTER — URL Gönderimi
// ═══════════════════════════════════════════════════

export async function submitUrlToBing(siteUrl: string, url: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BING_WEBMASTER_KEY;
  if (!apiKey) return { success: false, error: 'BING_WEBMASTER_KEY tanımlı değil.' };

  try {
    const res = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, url }),
    });

    if (!res.ok) return { success: false, error: `Bing API (${res.status})` };
    await logSeoOp('BING_INDEX', { siteUrl, url });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 3. GEO — Generative Engine Optimization
// ═══════════════════════════════════════════════════

interface GeoAnalysis {
  score: number; // 0-100
  findings: Array<{ category: string; status: 'good' | 'warning' | 'error'; detail: string }>;
  recommendations: string[];
}

/**
 * Sayfanın AI arama motorları tarafından anlaşılabilirliğini analiz et
 * Perplexity, ChatGPT Search, Gemini için optimize edilmiş mi?
 */
export async function analyzeGeoReadiness(url: string): Promise<{ success: boolean; data?: GeoAnalysis; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AIPyram GEO Analyzer/1.0' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return { success: false, error: `Sayfa erişilemedi (${res.status})` };
    const html = await res.text();
    const findings: GeoAnalysis['findings'] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Schema.org JSON-LD kontrolü
    const hasJsonLd = html.includes('application/ld+json');
    findings.push({
      category: 'Schema.org',
      status: hasJsonLd ? 'good' : 'error',
      detail: hasJsonLd ? 'JSON-LD yapılandırılmış veri mevcut' : 'JSON-LD eksik — AI motorların içeriği anlaması zorlaşır',
    });
    if (!hasJsonLd) { score -= 20; recommendations.push('JSON-LD Schema.org ekle (Article, WebPage, Organization)'); }

    // 2. Meta açıklamalar
    const hasDescription = html.includes('meta name="description"') || html.includes("meta name='description'");
    findings.push({
      category: 'Meta Description',
      status: hasDescription ? 'good' : 'warning',
      detail: hasDescription ? 'Meta description mevcut' : 'Meta description eksik',
    });
    if (!hasDescription) { score -= 10; recommendations.push('Her sayfaya benzersiz meta description ekle'); }

    // 3. Open Graph (sosyal medya + AI)
    const hasOG = html.includes('og:title') && html.includes('og:description');
    findings.push({
      category: 'Open Graph',
      status: hasOG ? 'good' : 'warning',
      detail: hasOG ? 'Open Graph etiketleri mevcut' : 'OG etiketleri eksik veya kısmi',
    });
    if (!hasOG) { score -= 10; recommendations.push('og:title, og:description, og:image ekle'); }

    // 4. Heading yapısı
    const h1Count = (html.match(/<h1/gi) || []).length;
    findings.push({
      category: 'Heading (H1)',
      status: h1Count === 1 ? 'good' : h1Count === 0 ? 'error' : 'warning',
      detail: h1Count === 1 ? 'Tek H1 — doğru' : h1Count === 0 ? 'H1 yok!' : `${h1Count} H1 — sadece 1 olmalı`,
    });
    if (h1Count !== 1) { score -= 10; recommendations.push('Her sayfada tam olarak 1 adet H1 kullan'); }

    // 5. Canonical URL
    const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");
    findings.push({
      category: 'Canonical URL',
      status: hasCanonical ? 'good' : 'warning',
      detail: hasCanonical ? 'Canonical URL tanımlı' : 'Canonical eksik — duplicate content riski',
    });
    if (!hasCanonical) { score -= 5; recommendations.push('Canonical URL ekle'); }

    // 6. Hreflang (çok dilli siteler)
    const hasHreflang = html.includes('hreflang');
    findings.push({
      category: 'Hreflang',
      status: hasHreflang ? 'good' : 'warning',
      detail: hasHreflang ? 'Hreflang etiketleri mevcut — çok dilli SEO aktif' : 'Hreflang yok (çok dilli site ise gerekli)',
    });

    // 7. Robots.txt / sitemap referansı
    const hasSitemapRef = html.includes('sitemap');
    findings.push({
      category: 'Sitemap',
      status: hasSitemapRef ? 'good' : 'warning',
      detail: hasSitemapRef ? 'Sitemap referansı var' : 'Sitemap referansı bulunamadı',
    });

    // 8. Sayfa hızı (basit: HTML boyut kontrolü)
    const htmlSize = html.length;
    findings.push({
      category: 'Sayfa Boyutu',
      status: htmlSize < 200000 ? 'good' : htmlSize < 500000 ? 'warning' : 'error',
      detail: `HTML boyutu: ${Math.round(htmlSize / 1024)}KB`,
    });
    if (htmlSize > 500000) { score -= 10; recommendations.push('HTML boyutunu azalt (lazy loading, code splitting)'); }

    // 9. E-E-A-T sinyalleri (yazar, tarih, kaynak)
    const hasAuthor = html.includes('author') || html.includes('byline');
    const hasDate = html.includes('datePublished') || html.includes('publishedAt') || html.includes('article:published_time');
    findings.push({
      category: 'E-E-A-T',
      status: hasAuthor && hasDate ? 'good' : 'warning',
      detail: `Yazar: ${hasAuthor ? '✓' : '✗'} | Tarih: ${hasDate ? '✓' : '✗'}`,
    });
    if (!hasAuthor || !hasDate) { 
      score -= 10; 
      recommendations.push('E-E-A-T: Yazar adı, yayın tarihi, kaynak bilgisi ekle'); 
    }

    await logSeoOp('GEO_ANALYSIS', { url, score, findingsCount: findings.length });

    return {
      success: true,
      data: { score: Math.max(0, score), findings, recommendations },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 4. RAKİP İSTİHBARATI — Competitor Intelligence 🎁
// ═══════════════════════════════════════════════════

export async function analyzeCompetitor(competitorUrl: string): Promise<{
  success: boolean;
  data?: {
    title: string;
    description: string;
    techStack: string[];
    contentSignals: string[];
    seoScore: number;
    opportunities: string[];
  };
  error?: string;
}> {
  try {
    const res = await fetch(competitorUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIPyram/1.0)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return { success: false, error: `Rakip site erişilemedi (${res.status})` };
    const html = await res.text();

    // Temel bilgiler
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const descMatch = html.match(/meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i);

    // Tech stack tespiti
    const techStack: string[] = [];
    if (html.includes('next')) techStack.push('Next.js');
    if (html.includes('react')) techStack.push('React');
    if (html.includes('vue')) techStack.push('Vue.js');
    if (html.includes('tailwind')) techStack.push('TailwindCSS');
    if (html.includes('bootstrap')) techStack.push('Bootstrap');
    if (html.includes('wordpress') || html.includes('wp-content')) techStack.push('WordPress');
    if (html.includes('shopify')) techStack.push('Shopify');
    if (html.includes('analytics')) techStack.push('Google Analytics');

    // İçerik sinyalleri
    const contentSignals: string[] = [];
    const h1s = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    if (h1s.length > 0) contentSignals.push(`H1: ${h1s[0]?.replace(/<[^>]*>/g, '').substring(0, 60) ?? ''}`);
    
    const linkCount = (html.match(/<a\s/gi) || []).length;
    contentSignals.push(`${linkCount} bağlantı`);
    
    const imgCount = (html.match(/<img\s/gi) || []).length;
    contentSignals.push(`${imgCount} görsel`);

    // SEO skoru (basitleştirilmiş)
    let seoScore = 50;
    if (titleMatch) seoScore += 10;
    if (descMatch) seoScore += 10;
    if (html.includes('application/ld+json')) seoScore += 15;
    if (html.includes('og:title')) seoScore += 5;
    if (html.includes('canonical')) seoScore += 5;
    if (html.includes('hreflang')) seoScore += 5;

    // Fırsat analizi
    const opportunities: string[] = [];
    if (!html.includes('application/ld+json')) opportunities.push('Rakipte Schema.org yok — burada öne geçebilirsin');
    if (!html.includes('hreflang')) opportunities.push('Rakipte hreflang yok — çok dilli SEO avantajı');
    if (techStack.includes('WordPress')) opportunities.push('Rakip WordPress kullanıyor — hız avantajın var');
    if (imgCount < 3) opportunities.push('Rakipte görsel az — zengin görsel içerik kullan');

    await logSeoOp('COMPETITOR_ANALYSIS', { url: competitorUrl, seoScore, techStack });

    return {
      success: true,
      data: {
        title: titleMatch?.[1] || 'Başlık bulunamadı',
        description: descMatch?.[1] || 'Açıklama bulunamadı',
        techStack,
        contentSignals,
        seoScore: Math.min(100, seoScore),
        opportunities,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 5. MULTI-SEARCH — Birden Fazla Arama Motoru
// ═══════════════════════════════════════════════════

export async function multiSearch(query: string): Promise<{
  success: boolean;
  results?: Array<{ source: string; title: string; url: string; snippet: string }>;
  error?: string;
}> {
  const results: Array<{ source: string; title: string; url: string; snippet: string }> = [];

  // Google Custom Search
  const googleKey = process.env.GOOGLE_SEARCH_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;
  if (googleKey && googleCx) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&num=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        for (const item of (data.items || []).slice(0, 5)) {
          results.push({ source: 'Google', title: item.title, url: item.link, snippet: item.snippet || '' });
        }
      }
    } catch { /* sessiz */ }
  }

  // Bing Search
  const bingKey = process.env.BING_SEARCH_KEY;
  if (bingKey) {
    try {
      const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`;
      const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': bingKey } });
      if (res.ok) {
        const data = await res.json();
        for (const item of (data.webPages?.value || []).slice(0, 5)) {
          results.push({ source: 'Bing', title: item.name, url: item.url, snippet: item.snippet || '' });
        }
      }
    } catch { /* sessiz */ }
  }

  // Fallback: Eğer hiçbir API yoksa web_search engine kullan
  if (results.length === 0) {
    return { success: false, error: 'Arama API anahtarları tanımlı değil. GOOGLE_SEARCH_KEY veya BING_SEARCH_KEY gerekli.' };
  }

  return { success: true, results };
}

// ═══════════════════════════════════════════════════
// LOGGER
// ═══════════════════════════════════════════════════

async function logSeoOp(operation: string, details: any) {
  try {
    if (adminDb) {
      await adminDb.collection('aloha_operations').add({
        operation: `SEO_${operation}`,
        details,
        timestamp: new Date().toISOString(),
        source: 'aloha_seo_ops',
      });
    }
  } catch { /* sessiz */ }
  console.log(`[🔍 SEO OPS] ${operation}:`, JSON.stringify(details).substring(0, 200));
}

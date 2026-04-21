import { adminDb } from '@/lib/firebase-admin';

/**
 * RELATED NEWS ENGINE — İlgili Haber Eşleştirme Motoru
 * 
 * Her haber için kategori, keyword ve konu benzerliğine göre
 * 3-5 ilgili makale bulur. Internal linking + SEO + dwell time artışı.
 * 
 * Structured Data (JSON-LD) ve Breadcrumb desteği ile tam SEO paketi.
 */

// ═══════════════════════════════════════
// RELATED NEWS — Keyword tabanlı benzerlik
// ═══════════════════════════════════════

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url: string;
  publishedAt: string;
  relevance_score: number;
}

/**
 * Bir makalenin keyword/kategori benzerliğine göre ilgili haberleri bul
 */
export async function findRelatedNews(params: {
  articleId: string;       // Mevcut makale ID'si (kendini hariç tut)
  category: string;
  keywords: string[];
  title: string;
  maxResults?: number;
  collection?: string;
}): Promise<RelatedArticle[]> {
  if (!adminDb) return [];

  const { articleId, category, keywords, title, maxResults = 5, collection = 'trtex_news' } = params;
  const related: RelatedArticle[] = [];

  try {
    // Strateji 1: Aynı kategoriden son haberler
    const categorySnap = await adminDb.collection(collection)
      .where('category', '==', category)
      .orderBy('publishedAt', 'desc')
      .limit(20)
      .get();

    for (const doc of categorySnap.docs) {
      if (doc.id === articleId) continue; // Kendini hariç tut
      const data = doc.data();
      const docTitle = data.translations?.TR?.title || data.title || '';
      const docKeywords = data.seo?.keywords || data.tags || [];
      
      // Keyword benzerlik skoru hesapla
      let score = 0.3; // Aynı kategori = baş puan
      const titleWords = title.toLowerCase().split(/\s+/);
      const docWords = docTitle.toLowerCase().split(/\s+/);
      
      // Başlık kelime eşleşmesi
      for (const tw of titleWords) {
        if (tw.length > 3 && docWords.some((dw: string) => dw.includes(tw) || tw.includes(dw))) {
          score += 0.1;
        }
      }
      
      // Keyword eşleşmesi
      for (const kw of keywords) {
        if (docKeywords.some((dk: string) => 
          dk.toLowerCase().includes(kw.toLowerCase()) || 
          kw.toLowerCase().includes(dk.toLowerCase())
        )) {
          score += 0.15;
        }
      }

      related.push({
        id: doc.id,
        slug: data.slug || doc.id,
        title: docTitle,
        category: data.category || category,
        image_url: data.image_url || '',
        publishedAt: data.publishedAt || data.createdAt || '',
        relevance_score: Math.min(score, 1.0),
      });
    }

    // Strateji 2: Keyword'lerden herhangi biriyle eşleşen haberler (farklı kategoriler)
    if (keywords.length > 0 && related.length < maxResults * 2) {
      // İlk 3 keyword ile tag araması
      for (const kw of keywords.slice(0, 3)) {
        try {
          const tagSnap = await adminDb.collection(collection)
            .where('tags', 'array-contains', kw)
            .limit(5)
            .get();
          
          for (const doc of tagSnap.docs) {
            if (doc.id === articleId) continue;
            if (related.some(r => r.id === doc.id)) continue; // Zaten var
            
            const data = doc.data();
            related.push({
              id: doc.id,
              slug: data.slug || doc.id,
              title: data.translations?.TR?.title || data.title || '',
              category: data.category || '',
              image_url: data.image_url || '',
              publishedAt: data.publishedAt || data.createdAt || '',
              relevance_score: 0.4, // Tag eşleşmesi
            });
          }
        } catch { /* tek tag araması başarısız → devam */ }
      }
    }

    // Score'a göre sırala, en ilgili ilk
    related.sort((a, b) => b.relevance_score - a.relevance_score);

    return related.slice(0, maxResults);
  } catch (err: any) {
    console.warn(`[RELATED NEWS] ⚠️ İlgili haber arama hatası: ${err.message}`);
    return [];
  }
}

// ═══════════════════════════════════════
// SEO STRUCTURED DATA — JSON-LD Şablonları
// ═══════════════════════════════════════

/**
 * Haber makalesi için SEO yapılandırılmış veri (JSON-LD) oluştur
 */
export function buildArticleStructuredData(params: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image_url: string;
  category: string;
  keywords: string[];
  author?: string;
  wordCount?: number;
}): Record<string, any> {
  const { title, description, slug, publishedAt, updatedAt, image_url, category, keywords, wordCount } = params;
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": description,
    "image": image_url ? [image_url] : [],
    "datePublished": publishedAt,
    "dateModified": updatedAt || publishedAt,
    "author": {
      "@type": "Organization",
      "name": "TRTEX B2B Tekstil İstihbarat",
      "url": "https://trtex.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TRTEX",
      "logo": {
        "@type": "ImageObject",
        "url": "https://trtex.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://trtex.com/news/${slug}`
    },
    "articleSection": category,
    "keywords": keywords.join(', '),
    "wordCount": wordCount || 0,
    "inLanguage": "tr-TR",
    "isAccessibleForFree": true,
  };
}

/**
 * Breadcrumb yapılandırılmış verisi oluştur
 */
export function buildBreadcrumbData(params: {
  category: string;
  title: string;
  slug: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "TRTEX",
        "item": "https://trtex.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Haberler",
        "item": "https://trtex.com/news"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": params.category,
        "item": `https://trtex.com/news?category=${encodeURIComponent(params.category)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": params.title.substring(0, 60),
        "item": `https://trtex.com/news/${params.slug}`
      }
    ]
  };
}

// ═══════════════════════════════════════
// MAKALE ZENGİNLEŞTİRME — Toplu SEO + Related
// ═══════════════════════════════════════

/**
 * Mevcut bir makaleyi SEO + Related News ile zenginleştir
 * compose_article sonrasında veya toplu iyileştirme için çağrılır
 */
export async function enrichArticle(params: {
  docId: string;
  collection?: string;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const { docId, collection = 'trtex_news' } = params;

  const doc = await adminDb.collection(collection).doc(docId).get();
  if (!doc.exists) return `[HATA] Makale bulunamadı: ${docId}`;

  const data = doc.data()!;
  const title = data.translations?.TR?.title || data.title || '';
  const category = data.category || 'İstihbarat';
  const keywords = data.seo?.keywords || data.tags || [];
  const slug = data.slug || docId;
  const content = data.content || data.translations?.TR?.content || '';
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;

  const updates: Record<string, any> = {};
  const enrichments: string[] = [];

  // 1. Related News bul ve ekle
  if (!data.related_news || data.related_news.length === 0) {
    const related = await findRelatedNews({
      articleId: docId,
      category,
      keywords,
      title,
      maxResults: 5,
      collection,
    });

    if (related.length > 0) {
      updates.related_news = related.map(r => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        image_url: r.image_url,
        relevance: r.relevance_score,
      }));
      enrichments.push(`📰 ${related.length} ilgili haber bağlandı`);
    }
  }

  // 2. Structured Data (JSON-LD) ekle
  if (!data.structured_data) {
    updates.structured_data = {
      article: buildArticleStructuredData({
        title,
        description: data.seo?.description || data.summary || '',
        slug,
        publishedAt: data.publishedAt || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        image_url: data.image_url || '',
        category,
        keywords,
        wordCount,
      }),
      breadcrumb: buildBreadcrumbData({ category, title, slug }),
    };
    enrichments.push('🏗️ Structured Data (JSON-LD) eklendi');
  }

  // 3. Reading time hesapla
  if (!data.reading_time || data.reading_time === 0) {
    updates.reading_time = Math.max(Math.ceil(wordCount / 200), 1);
    updates.content_word_count = wordCount;
    enrichments.push(`📖 Okuma süresi: ${updates.reading_time} dk`);
  }

  // 4. SEO eksiklerini doldur
  if (!data.seo?.description || data.seo.description.length < 50) {
    const summary = data.summary || title;
    updates['seo.description'] = summary.substring(0, 155);
    enrichments.push('🔍 SEO meta description eklendi');
  }

  if (!data.seo?.keywords || data.seo.keywords.length < 5) {
    // Mevcut tags'leri kullan, yoksa başlıktan çıkar
    const existingKeywords = data.seo?.keywords || data.tags || [];
    if (existingKeywords.length < 8) {
      const titleKeywords = title
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 5);
      const merged = [...new Set([...existingKeywords, ...titleKeywords])];
      updates['seo.keywords'] = merged.slice(0, 12);
      enrichments.push(`🏷️ SEO keywords: ${merged.length} adet`);
    }
  }

  // 5. Güncelle
  if (Object.keys(updates).length > 0) {
    updates.enriched_at = new Date().toISOString();
    updates.enriched_by = 'aloha';
    await adminDb.collection(collection).doc(docId).update(updates);
  }

  if (enrichments.length === 0) {
    return `✅ "${title.substring(0, 40)}..." zaten zenginleştirilmiş`;
  }

  const result = `✅ "${title.substring(0, 40)}..." zenginleştirildi:\n${enrichments.join('\n')}`;
  console.log(`[ENRICH] ${result}`);
  return result;
}

/**
 * Toplu makale zenginleştirme — son N makaleyi SEO + Related ile güçlendir
 */
export async function batchEnrichArticles(params: {
  limit?: number;
  collection?: string;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const { limit = 20, collection = 'trtex_news' } = params;

  // Zenginleştirilmemiş makaleleri bul
  const snap = await adminDb.collection(collection)
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();

  let enriched = 0;
  let skipped = 0;
  const results: string[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    // Zaten zenginleştirilmiş mi?
    if (data.enriched_at && data.related_news?.length > 0 && data.structured_data) {
      skipped++;
      continue;
    }

    try {
      const result = await enrichArticle({ docId: doc.id, collection });
      if (result.includes('zenginleştirildi')) {
        enriched++;
        results.push(result);
      } else {
        skipped++;
      }
    } catch (err: any) {
      console.warn(`[ENRICH] ⚠️ ${doc.id}: ${err.message}`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  return `═══ TOPLU ZENGİNLEŞTİRME RAPORU ═══
📊 Taranan: ${snap.size}
✅ Zenginleştirilen: ${enriched}
⏭️ Atlanan: ${skipped}
${results.length > 0 ? '\nDetay:\n' + results.slice(0, 10).join('\n') : ''}`;
}

import { adminDb } from "@/lib/firebase-admin";
import PremiumArticleLayout from '@/components/news/PremiumArticleLayout';
import GlobalTicker from "@/components/trtex/GlobalTicker";
import { LOCALE_MAP } from '@/i18n/labels';
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";
// revalidate KALDIRILDI — force-dynamic ile çelişiyordu (Anayasa: Zero-Cache)

// SEO — Dinamik haber metadata
export async function generateMetadata({ params, searchParams }: { params: Promise<{ domain: string; slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { domain, slug } = await params;
  const search = await searchParams;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const targetLang = (search?.lang || 'tr').toLowerCase();
  
  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  
  try {
    const doc = await adminDb.collection(`${projectName}_news`).doc(slug).get();
    if (doc.exists) {
      const data = doc.data();
      const title = data?.translations?.[targetLang.toUpperCase()]?.title || data?.title || slug;
      const summary = data?.translations?.[targetLang.toUpperCase()]?.summary || data?.summary || '';
      const imageUrl = data?.images?.[0] || data?.image_url;
      
      const baseUrl = `https://${exactDomain}/news/${slug}`;
      const alternates = {
         canonical: `${baseUrl}?lang=${targetLang}`,
         languages: {
            'tr': `${baseUrl}?lang=tr`,
            'en': `${baseUrl}?lang=en`,
            'de': `${baseUrl}?lang=de`,
            'ru': `${baseUrl}?lang=ru`,
            'zh': `${baseUrl}?lang=zh`,
            'ar': `${baseUrl}?lang=ar`,
            'es': `${baseUrl}?lang=es`,
            'fr': `${baseUrl}?lang=fr`,
            'x-default': `${baseUrl}?lang=tr`
         }
      };

      // 8 Dilde GEO-SEO Tags (Otonom)
      const localKeywords = data?.seo_matrix?.local_keys?.[targetLang.toUpperCase()] || data?.tags || [];
      const keywordsString = localKeywords.join(', ');

      return { 
        title: `${title} — ${brandName}`, 
        description: summary.substring(0, 160), 
        keywords: keywordsString,
        alternates,
        openGraph: { 
          title: `${title} — ${brandName}`, 
          description: summary.substring(0, 160), 
          type: 'article',
          locale: targetLang,
          images: imageUrl ? [{ url: imageUrl }] : undefined
        },
        twitter: {
          card: 'summary_large_image',
          site: '@trtex_com',
          title: `${title} — ${brandName}`,
          description: summary.substring(0, 160),
          images: imageUrl ? [imageUrl] : undefined
        }
      };
    }
  } catch {}
  return { title: `${brandName} — Haber` };
}

interface NewsPageProps {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function NewsDetailPage({ params, searchParams }: NewsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const slug = decodeURIComponent(resolvedParams.slug);
  const lang = resolvedSearch?.lang || "tr";
  const targetLang = lang.toUpperCase();

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  if (exactDomain.includes('perde')) projectName = 'perde';
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  // 1. Önce terminal payload'dan ara (hızlı — güncel haberler)
  let article: any = null;
  try {
    const doc = await adminDb.collection(`${projectName}_terminal`).doc('current').get();
    if (doc.exists) {
      const payload = doc.data();
      const allArticles = [
        payload?.heroArticle,
        ...(payload?.gridArticles || []),
      ].filter(Boolean);
      article = allArticles.find((a: any) => a.slug === slug || a.id === slug);
    }
  } catch (e) {
    console.error('[NEWS DETAIL] Payload okunamadı:', e);
  }

  // 2. Firestore'dan DAIMA tam veri çek (payload'da eksik alanlar var: business_opportunities, ai_commentary vb.)
  try {
    const directDoc = await adminDb.collection(`${projectName}_news`).doc(slug).get();
    if (directDoc.exists) {
      const firestoreData = { id: directDoc.id, ...directDoc.data() };
      // Firestore verisi varsa payload verisini zenginleştir veya yerini al
      article = article ? { ...firestoreData, ...article, ...firestoreData } : firestoreData;
    } else {
      const slugQuery = await adminDb.collection(`${projectName}_news`).where("slug", ">=", slug).where("slug", "<=", slug + '\uf8ff').limit(1).get();
      if (!slugQuery.empty) {
        const firestoreData = { id: slugQuery.docs[0].id, ...slugQuery.docs[0].data() };
        article = article ? { ...article, ...firestoreData } : firestoreData;
      }
    }
  } catch (e) {
    console.error('[NEWS DETAIL] Firestore enrichment hatası:', e);
  }

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#E5E7EB', marginBottom: '1rem' }}>404</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', marginBottom: '1rem' }}>Haber Bulunamadı</h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Aradığınız haber, terminal veri döngüsünde henüz mevcut değil veya arşivlenmiş olabilir.</p>
          <a href={basePath} style={{ display: 'inline-block', background: '#111', color: '#fff', padding: '0.75rem 2rem', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px', borderRadius: '4px' }}>
            ← ANA SAYFA
          </a>
        </div>
      </div>
    );
  }

  // ═══ VERİ ÇIKARIMI (V1.1 + Legacy Uyumlu) ═══
  const title = article.translations?.[targetLang]?.title || article.title;
  const summary = article.translations?.[targetLang]?.summary || article.summary;
  const category = article.translations?.[targetLang]?.category || article.category;
  const content = article.translations?.[targetLang]?.content || article.content || '';
  
  // Opportunity Card — legacy veya V1.1 action_layer'dan
  const oppCard = article.opportunity_card || (article.action_layer ? {
    action: article.action_layer.manufacturer || article.action_layer.retailer || '',
    buyer_type: 'Üretici & İhracatçı',
    urgency: (article.ai_impact_score || article.insight?.market_impact_score || 0) > 65 ? 'YÜKSEK' : 'NORMAL'
  } : null);
  
  // Trade Brief — legacy veya V1.1'den sentez
  const tradeBrief = article.trade_brief || (article.action_layer ? {
    situation: article.insight?.explanation || article.executive_summary || '',
    so_what: article.watch_layer?.reason || '',
    now_what: article.action_layer.manufacturer || '',
    who_wins: [
      article.action_layer.manufacturer ? 'Üreticiler: ' + (article.action_layer.manufacturer).substring(0, 100) : '',
      article.action_layer.investor ? 'Yatırımcılar: ' + (article.action_layer.investor).substring(0, 100) : '',
    ].filter(Boolean),
    who_loses: article.insight?.direction === 'risk' 
      ? ['Fiyat baskısına hazırlıksız firmalar', 'Tedarik zinciri çeşitlendirmesi yapmayan üreticiler']
      : [],
  } : null);
  
  // Executive Summary — legacy veya V1.1 insight'tan
  const executiveSummary = article.executive_summary || article.insight?.explanation || '';
  
  // Action Items — legacy veya V1.1 action_layer'dan
  const actionItems = article.action_items || [
    article.action_layer?.manufacturer,
    article.action_layer?.retailer,
    article.action_layer?.architect,
    article.action_layer?.investor,
  ].filter(Boolean);
  
  // Impact Score
  const aiImpactScore = article.ai_impact_score || article.insight?.market_impact_score || 0;
  
  // Tags — legacy veya SEO matrix'ten
  const tags = article.tags || [
    ...(article.seo_matrix?.core_keys || []),
    ...(article.seo_matrix?.adaptive_keys || []),
  ].slice(0, 8);
  
  const publishedAt = article.publishedAt || article.createdAt;

  // ═══ 3'LÜ GÖRSEL SİSTEMİ ═══
  // images[0] = hero (üst), images[1] = mid (içerik ortası), images[2] = detail (alt)
  const allImages = article.images || [];
  const heroImage = allImages[0] || article.image_url || article.imageUrl;
  const midImage = allImages[1] || article.mid_image_url || null;
  const detailImage = allImages[2] || article.detail_image_url || null;

  // Okuma süresi hesaplama
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 200));

  // İçeriği 2 parçaya böl (mid image yerleştirme için)
  function splitContentForImages(htmlContent: string): { part1: string; part2: string } {
    // H2 sayısını bul
    const h2Matches = htmlContent.match(/<h2[^>]*>/gi) || [];
    if (h2Matches.length >= 2) {
      // 2. H2'den önce böl
      const secondH2Idx = htmlContent.indexOf(h2Matches[1]);
      return {
        part1: htmlContent.substring(0, secondH2Idx),
        part2: htmlContent.substring(secondH2Idx),
      };
    }
    // H2 yoksa paragraf sayısına göre böl
    const midPoint = Math.floor(htmlContent.length * 0.4);
    const nextTag = htmlContent.indexOf('</p>', midPoint);
    if (nextTag > 0) {
      return {
        part1: htmlContent.substring(0, nextTag + 4),
        part2: htmlContent.substring(nextTag + 4),
      };
    }
    return { part1: htmlContent, part2: '' };
  }

  const { part1, part2 } = splitContentForImages(content);

  // Tarih formatlama
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString(LOCALE_MAP[lang] || 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

  // ENTITY GRAPH EXTRATION (Organization, Place, Product)
  const entityData = article.entity_data || { organizations: [], places: [], products: [] };

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title.substring(0, 110),
    "description": summary,
    "image": allImages.length > 0 ? allImages : (heroImage ? [heroImage] : []),
    "datePublished": publishedAt || new Date().toISOString(),
    "dateModified": publishedAt || new Date().toISOString(),
    "author": [{
        "@type": "Organization",
        "name": "TRTEX AI Intelligence",
        "url": `https://${exactDomain}`
    }],
    "publisher": {
        "@type": "Organization",
        "name": "AIPyram GmbH",
        "url": "https://aipyram.com"
    },
    // ENTITY GRAPH INJECTION FOR LLMs (Perplexity/SGE)
    "about": entityData.organizations.map((org: string) => ({
        "@type": "Organization",
        "name": org
    })),
    "mentions": [
        ...entityData.places.map((place: string) => ({
            "@type": "Place",
            "name": place
        })),
        ...entityData.products.map((prod: string) => ({
            "@type": "Product",
            "name": prod
        }))
    ]
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": brandName, "item": `https://${exactDomain}` },
      { "@type": "ListItem", "position": 2, "name": category || "News", "item": `https://${exactDomain}/${category?.toLowerCase() || 'news'}?lang=${targetLang}` }
    ]
  };

  // ═══ İLGİLİ HABERLER ÇEKİMİ (RELATED ARTICLES) ═══
  let relatedArticles: any[] = [];
  try {
    const rawCategoryMap: Record<string, string[]> = {
      'perde': ['PERDE'], 'ev-tekstili': ['EV TEKSTİLİ'], 'dosemelik': ['DÖŞEMELİK'], 'dekorasyon': ['DEKORASYON'], 'iplik': ['İPLİK', 'IP', 'HAMMADDE']
    };
    const mappedCat = article.category && rawCategoryMap[article.category.toLowerCase()] ? rawCategoryMap[article.category.toLowerCase()] : [article.category || 'ANALİZ'];
    
    const relSnap = await adminDb.collection(`${projectName}_news`)
       .where("status", "==", "published")
       .where("category", "in", mappedCat)
       .orderBy("createdAt", "desc")
       .limit(4).get();
    relatedArticles = relSnap.docs.map((d: any) => ({id: d.id, ...d.data()})).filter((a: any) => a.id !== article.id && a.slug !== slug).slice(0, 3);
  } catch(e) {}

  // Fallback: Eğer hiç ilgili haber bulunamadıysa (veya < 3 ise) son haberleri getir
  if (relatedArticles.length < 3) {
    try {
      const fallbackSnap = await adminDb.collection(`${projectName}_news`)
         .where("status", "==", "published")
         .orderBy("createdAt", "desc")
         .limit(4).get();
      const fallbackDocs = fallbackSnap.docs.map((d: any) => ({id: d.id, ...d.data()})).filter((a: any) => a.id !== article.id && a.slug !== slug);
      
      // Eksik olanları tamamla
      for (const doc of fallbackDocs) {
        if (relatedArticles.length >= 3) break;
        if (!relatedArticles.find(r => r.id === doc.id)) {
          relatedArticles.push(doc);
        }
      }
    } catch(e) {}
  }

  // CSS for HTML content rendering
  const articleCSS = `
    .trtex-article h2 { font-size: 1.5rem; font-weight: 800; color: #111; margin: 2rem 0 1rem; letter-spacing: -0.5px; border-bottom: 2px solid #CC0000; padding-bottom: 0.5rem; }
    .trtex-article h3 { font-size: 1.2rem; font-weight: 700; color: #1F2937; margin: 1.5rem 0 0.75rem; }
    .trtex-article h4 { font-size: 1.05rem; font-weight: 700; color: #374151; margin: 1.25rem 0 0.5rem; }
    .trtex-article p { margin-bottom: 1.25rem; line-height: 1.8; }
    .trtex-article ul, .trtex-article ol { margin: 1rem 0 1.5rem 1.5rem; }
    .trtex-article li { margin-bottom: 0.5rem; line-height: 1.7; }
    .trtex-article table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
    .trtex-article th { background: #111; color: #fff; padding: 0.75rem 1rem; text-align: left; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
    .trtex-article td { padding: 0.75rem 1rem; border-bottom: 1px solid #E5E7EB; }
    .trtex-article tr:nth-child(even) td { background: #F9FAFB; }
    .trtex-article blockquote { border-left: 4px solid #CC0000; margin: 1.5rem 0; padding: 1rem 1.5rem; background: #FEF2F2; font-style: italic; color: #374151; }
    .trtex-article strong { font-weight: 700; color: #111; }
    .trtex-article a { color: #CC0000; text-decoration: underline; }
    .trtex-article img { max-width: 100%; height: auto; border-radius: 4px; margin: 1rem 0; }
  `;

  return (
    <PremiumArticleLayout
      article={article}
      lang={lang}
      exactDomain={exactDomain}
      basePath={basePath}
      brandName={brandName}
      targetLang={targetLang}
      part1={part1}
      part2={part2}
      heroImage={heroImage}
      midImage={midImage}
      detailImage={detailImage}
      jsonLd={jsonLd}
      jsonLdBreadcrumb={jsonLdBreadcrumb}
      relatedArticles={relatedArticles}
      readTime={readTime}
      formattedDate={formattedDate}
      ticker={<GlobalTicker />}
    />
  );
}

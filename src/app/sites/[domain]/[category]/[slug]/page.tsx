import { adminDb } from "@/lib/firebase-admin";
import { Metadata } from "next";
import ArticleClient from "./ArticleClient";
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t, LOCALE_MAP } from '@/i18n/labels';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ domain: string; category: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

// ═══ DYNAMIC SEO METADATA ═══
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const p = await params;
  const slug = decodeURIComponent(p.slug);
  const domain = decodeURIComponent(p.domain).split(":")[0];
  let projectName = 'trtex';
  if (domain.includes('hometex')) projectName = 'hometex';

  try {
    let article: any = null;
    const doc = await adminDb.collection(`${projectName}_news`).doc(slug).get();
    if (doc.exists) {
      article = doc.data();
    } else {
      const q = await adminDb.collection(`${projectName}_news`).where("slug", "==", slug).limit(1).get();
      if (!q.empty) article = q.docs[0].data();
    }

    if (article) {
      const seoTitle = article.seo?.title || article.title || '';
      const seoDesc = article.seo?.description || article.summary || '';
      const heroImg = article.image_url || article.media?.images?.[0]?.url || '';

      return {
        title: `${seoTitle} | ${domain.split('.')[0].toUpperCase()}`,
        description: seoDesc.substring(0, 160),
        openGraph: {
          title: seoTitle,
          description: seoDesc.substring(0, 160),
          images: heroImg ? [{ url: heroImg, width: 1200, height: 630 }] : [],
          type: 'article',
          siteName: domain.split('.')[0].toUpperCase(),
        },
        twitter: {
          card: 'summary_large_image',
          title: seoTitle,
          description: seoDesc.substring(0, 160),
          images: heroImg ? [heroImg] : [],
        },
        robots: { index: true, follow: true },
      };
    }
  } catch { /* fallback */ }

  return { title: `Haber | ${domain.split('.')[0].toUpperCase()}` };
}

/**
 * TRTEX HABER DETAY SAYFASI — Karar Terminali
 * 
 * 6 BLOK YAPISI (Sade, CEO-uyumlu, Bloomberg stili):
 * 1. HERO — Başlık + Özet + Impact + Büyük Görsel
 * 2. QUICK INTELLIGENCE — Risk | Fırsat | Aksiyon (3 satır)
 * 3. CONTENT — Yazı + 1-2 görsel
 * 4. DATA BOX — Fiyat/değişim/trend (varsa)
 * 5. EXECUTIVE INTELLIGENCE — CEO Summary + Fırsat + Aksiyon (TEK blok)
 * 6. RELATED — Max 3 haber
 */
export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const category = resolvedParams.category || "haberler";
  const slug = decodeURIComponent(resolvedParams.slug);
  const lang = resolvedSearch?.lang || "tr";

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  if (exactDomain.includes('perde')) projectName = 'perde';
  const brandName = exactDomain.split('.')[0].toUpperCase();

  // ═══ Haberi Çek ═══
  let article: any = null;
  try {
    const doc = await adminDb.collection(`${projectName}_news`).doc(slug).get();
    if (doc.exists) {
      article = { id: doc.id, ...doc.data() };
    } else {
      const slugQuery = await adminDb.collection(`${projectName}_news`).where("slug", "==", slug).limit(1).get();
      if (!slugQuery.empty) {
        const foundDoc = slugQuery.docs[0];
        article = { id: foundDoc.id, ...foundDoc.data() };
      }
    }
  } catch (err) {
    console.error("[ARTICLE] Error finding news:", err);
  }

  // 404
  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#000', letterSpacing: '-3px' }}>404</h1>
          <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>{t('notFound', lang)}</p>
          <a href={`/sites/${exactDomain}/${category}?lang=${lang}`} style={{ color: '#CC0000', marginTop: '1.5rem', display: 'inline-block', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← {category.toUpperCase()} {t('backToArchive', lang)}
          </a>
        </div>
      </div>
    );
  }

  // ═══ İlgili Haberler (Semantik Eşleşme - Max 3) ═══
  let relatedNews: any[] = [];
  try {
    // Önce en güncel 20 haberi çek (Index hatası almamak için)
    const relatedSnap = await adminDb.collection(`${projectName}_news`)
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    let allRecent = relatedSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => doc.id !== article.id);

    // "Neden Related?" Mantığı: Kategori ve Tag Benzerlik Puanlaması
    relatedNews = allRecent.sort((a: any, b: any) => {
      let scoreA = 0; let scoreB = 0;
      if (a.category === article.category) scoreA += 10; // Aynı kategori çok önemli
      if (b.category === article.category) scoreB += 10;
      
      const artTags = article.tags || [];
      scoreA += (a.tags || []).filter((t: string) => artTags.includes(t)).length * 3;
      scoreB += (b.tags || []).filter((t: string) => artTags.includes(t)).length * 3;
      
      return scoreB - scoreA; // Puanı yüksek olan başa
    }).slice(0, 3);
  } catch (err) {
    console.error("[ARTICLE] Error finding related news:", err);
  }

  // Fallback: Eğer hiç ilgili haber bulunamadıysa (veya < 3 ise) son haberleri getir
  if (relatedNews.length < 3) {
    try {
      const fallbackSnap = await adminDb.collection(`${projectName}_news`)
         .where("status", "==", "published")
         .orderBy("createdAt", "desc")
         .limit(4).get();
      const fallbackDocs = fallbackSnap.docs.map((d: any) => ({id: d.id, ...d.data()})).filter((a: any) => a.id !== article.id && a.slug !== slug);
      
      // Eksik olanları tamamla
      for (const doc of fallbackDocs) {
        if (relatedNews.length >= 3) break;
        if (!relatedNews.find(r => r.id === doc.id)) {
          relatedNews.push(doc);
        }
      }
    } catch(e) {}
  }

  // ═══ Terminal Payload üzerinden UI Sözlüğü (ui_labels) ═══
  let ui: any = {
    thirty_sec_summary: "30 SANİYEDE ANLA", meaning_of_news: "BU HABERİN ANLAMI",
    read_time_min: "dk okuma", high_impact: "HIGH IMPACT", moderate_impact: "MODERATE", low_impact: "LOW IMPACT",
    footer_engine: "TRTEX INTELLIGENCE ENGINE", back_to_archive: "ARŞİVİNE DÖN"
  };
  try {
    const terminalDoc = await adminDb.collection(`${projectName}_terminal`).doc('current').get();
    if (terminalDoc.exists) {
      const payload = terminalDoc.data();
      if (payload?.ui_labels) {
        const targetLang = lang.toUpperCase();
        ui = payload.ui_labels[targetLang] || payload.ui_labels['EN'] || ui;
      }
    }
  } catch (err) {
    console.error("[ARTICLE UI] UI çekilirken hata:", err);
  }

  // ═══ Veri Hazırlık ═══
  const dateStr = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  // DİL ÇEVİRİSİ (Omni-Language Fallback)
  const T = article.translations?.[lang.toUpperCase()] || {};
  const T_title = T.title || article.title;
  const T_summary = T.summary || article.summary;
  const T_content = T.content || article.content;
  const T_note = T.commercial_note || article.commercial_note;
  const T_cat = T.category || article.category;
  
  const wordCount = (T_content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Görseller
  const heroImage = article.image_url || article.media?.images?.[0]?.url || '';
  const inlineImages = (article.media?.images || []).slice(1, 3).map((img: any) => ({
    url: img.url || img,
    caption: img.caption || '',
    alt: img.alt_text || T_title || '',
    seoName: article.image_seo_filename || '',
  }));

  // Impact
  const impactScore = article.ai_impact_score || article.ai_ceo_block?.impact_score || (article.quality_score ? Math.round(article.quality_score / 10) : 5);

  const intelligence = article.intelligence_layer || {
    executive_brief: article.executive_summary || article.ai_ceo_block?.executive_summary || [],
    opportunity_map: { action: article.business_opportunities?.[0] || '', level: impactScore * 10 },
    risk_matrix: { reason: article.daily_sentiment?.risk || '', level: impactScore * 10 },
    action_queue: article.action_items || [],
    trade_brief: article.trade_brief || '',
    decision_signal: 'WATCH',
  };

  // Quick Intelligence — 3 satır
  const quickIntel = {
    risk: intelligence.risk_matrix?.reason || '',
    opportunity: intelligence.opportunity_map?.action || '',
    action: intelligence.action_queue?.[0] || '',
  };

  // Executive Intelligence (tek blok)
  const execIntel = {
    summary: intelligence.executive_brief || [],
    opportunities: intelligence.opportunity_map?.action ? [intelligence.opportunity_map.action] : [],
    actions: intelligence.action_queue || [],
    trendPrediction: '',
    confidence: 100 - (intelligence.risk_matrix?.level || 0),
  };

  // Data Box (piyasa verisi varsa)
  const dataBox = article.country_intelligence || null;

  // 1 Cümlelik Karar (CEO Özeti)
  const oneSentenceDecision = intelligence.trade_brief
      ? `${ui.meaning_of_news}: ${intelligence.trade_brief} [Karar: ${intelligence.decision_signal}]` 
      : '';

  // Tags (en az 8)
  const displayTags = (article.seo?.keywords || article.tags || []).slice(0, 10);

  // 1.5 B2B TRADE BRIEF 
  const tradeBrief = article.trade_brief || null;

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": T_title,
    "description": T_summary || '',
    "image": heroImage ? [heroImage] : [],
    "datePublished": article.publishedAt || article.createdAt || '',
    "dateModified": article.updatedAt || article.createdAt || '',
    "author": { "@type": "Organization", "name": "TRTEX Intelligence" },
    "publisher": {
      "@type": "Organization",
      "name": brandName,
      "logo": { "@type": "ImageObject", "url": `https://${exactDomain}/logo.png` }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://${exactDomain}/${category}/${slug}` },
    "keywords": (article.seo?.keywords || article.tags || []).join(', '),
    "articleSection": article.category || category,
    "wordCount": wordCount,
  };

  const breadcrumbItems = [
    { label: brandName, href: `/?lang=${lang}` },
    { label: t(category === 'opportunities' ? 'trade' : category === 'academy' ? 'academy' : category === 'tenders' ? 'liveTenders' : 'news', lang) || category.toUpperCase(), href: `/${category}?lang=${lang}` },
    { label: T_title?.length > 40 ? T_title.substring(0, 40) + '...' : T_title } // Current page
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', color: '#111', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* TICKER & NAVBAR */}
      <GlobalTicker />
      <TrtexNavbar basePath={`/sites/${exactDomain}`} brandName={brandName} lang={lang} activePage={category === 'opportunities' ? 'trade' : category === 'academy' ? 'academy' : category === 'tenders' ? 'tenders' : 'news'} theme="light" />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        <Breadcrumbs items={breadcrumbItems} lang={lang} />

        {/* ═══════════════════════════════════════════
            BLOK 1: HERO — Başlık + Özet + Impact + Görsel
            ═══════════════════════════════════════════ */}
        <div style={{ marginBottom: '2.5rem' }}>

          {/* Üst bar: Kategori + Tarih + Okuma süresi */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {T_cat && (
                <span style={{ fontSize: '0.6rem', letterSpacing: '3px', fontWeight: 800, color: '#CC0000', textTransform: 'uppercase' }}>
                  {T_cat}
                </span>
              )}
              <span style={{
                fontSize: '0.6rem', letterSpacing: '1px', fontWeight: 700,
                color: '#fff', background: '#111', padding: '3px 8px',
              }}>
                ⏱ {readingTime} {ui.read_time_min}
              </span>
            </div>
            <a href={`/sites/${exactDomain}/news?lang=${lang}`} style={{ color: '#666', textDecoration: 'none', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px' }}>{t('news', lang)}</a>
          </div>

          {/* BAŞLIK — CEO kalitesi */}
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.12,
            letterSpacing: '-1.2px', marginBottom: '1rem', color: '#000',
          }}>
            {T_title}
          </h1>

          {/* ÖZET — "30 saniyede anla" */}
          {T_summary && (
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #000' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '3px', color: '#CC0000', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {ui.thirty_sec_summary}
              </div>
              <p style={{
                fontSize: '1.1rem', lineHeight: 1.65, color: '#333',
                fontWeight: 500, margin: 0,
              }}>
                {T_summary}
              </p>
            </div>
          )}

          {/* IMPACT BADGE */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.5rem 1rem', marginBottom: '1.5rem',
            border: `2px solid ${impactScore >= 7 ? '#DC2626' : impactScore >= 5 ? '#D97706' : '#059669'}`,
            background: '#fff',
          }}>
            <span style={{
              fontSize: '1.5rem', fontWeight: 900,
              color: impactScore >= 7 ? '#DC2626' : impactScore >= 5 ? '#D97706' : '#059669',
            }}>
              {impactScore}/10
            </span>
            <span style={{
              fontSize: '0.6rem', letterSpacing: '2px', fontWeight: 800,
              color: impactScore >= 7 ? '#DC2626' : impactScore >= 5 ? '#D97706' : '#059669',
            }}>
              {impactScore >= 7 ? ui.high_impact : impactScore >= 5 ? ui.moderate_impact : ui.low_impact}
            </span>
          </div>
        </div>

        {/* HERO GÖRSEL */}
        <ArticleClient
          heroImage={heroImage}
          heroAlt={article.image_alt_text_tr || T_title || ''}
          heroCaption={article.image_caption_tr || article.media?.images?.[0]?.caption || ''}
          heroSeoName={article.image_seo_filename || ''}
          inlineImages={inlineImages}
          content={T_content || ''}
          quickIntel={quickIntel}
          execIntel={execIntel}
          dataBox={dataBox}
          relatedNews={relatedNews}
          displayTags={displayTags}
          category={category}
          impactScore={impactScore}
          brandName={brandName}
          articleSource={article.source}
          dateStr={dateStr}
          lang={lang}
          oneSentenceDecision={oneSentenceDecision}
          tradeBrief={tradeBrief}
        />

      </main>

      <TrtexFooter basePath={`/sites/${exactDomain}`} brandName={brandName} lang={lang} />
    </div>
  );
}

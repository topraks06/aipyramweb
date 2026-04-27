'use client';
import React, { useState } from 'react';
import { getBaseUrl } from '@/lib/utils';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import ShareButtons from '@/components/trtex/ShareButtons';
export default function PremiumArticleLayout({
  article, lang, exactDomain, basePath, brandName, targetLang,
  part1, part2, heroImage, midImage, detailImage,
  jsonLd, jsonLdBreadcrumb, relatedArticles, readTime, formattedDate,
  ticker // Ticker component passed from server
}: any) {
  
  const title = article.translations?.[targetLang]?.title || article.title;
  const summary = article.translations?.[targetLang]?.summary || article.summary;
  const category = article.translations?.[targetLang]?.category || article.category;
  
  const oppCard = article.opportunity_card || (article.action_layer ? {
    action: article.action_layer.manufacturer || article.action_layer.retailer || '',
    insight: article.insight?.explanation || '',
    buyer_type: 'Üretici & İhracatçı',
    urgency: (article.ai_impact_score || article.insight?.market_impact_score || 0) > 65 ? 'YÜKSEK' : 'NORMAL'
  } : null);
  
  const tradeBrief = article.trade_brief || (article.action_layer ? {
    situation: article.insight?.explanation || '',
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
  
  const executiveSummary = article.executive_summary 
    ? (Array.isArray(article.executive_summary) ? article.executive_summary : [article.executive_summary])
    : (article.insight?.explanation ? [article.insight.explanation] : []);
  
  const actionItems = article.action_items || [
    article.action_layer?.manufacturer,
    article.action_layer?.retailer,
    article.action_layer?.architect,
    article.action_layer?.investor,
  ].filter(Boolean);
  
  const aiImpactScore = article.ai_impact_score || article.insight?.market_impact_score || 0;
  
  const tags = article.tags || [
    ...(article.seo_matrix?.core_keys || []),
    ...(article.seo_matrix?.adaptive_keys || []),
  ].slice(0, 8);

  // Business Opportunities — eğitim dokümanından
  const businessOpps = article.business_opportunities || [];
  
  // AI Commentary — Bloomberg stili analiz
  const aiCommentary = article.commercial_note || article.ai_commentary || '';

  // Commercial CTA - Lead Engine Yakıtı
  const commercialCta = article.commercial_cta || null;

  // Lead Generation & Matchmaking State
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadTarget, setLeadTarget] = useState(''); // e.g. "wholesaler_swatch", "manufacturer_match", "opp_card"
  const [leadData, setLeadData] = useState({ name: '', email: '', role: 'wholesaler', country: '', interest: '' });
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus('loading');
    
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadData.email,
          company: leadData.name,
          role: leadData.role,
          country: leadData.country,
          context_type: 'ARTICLE_LEAD',
          context_title: title,
          source: 'news_article',
          target_intent: leadTarget,
          createdAt: new Date().toISOString()
        })
      });
      setLeadStatus('success');
    } catch (err) {
      console.error('Lead submit error:', err);
      setLeadStatus('idle');
    }
  };

  const articleCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;700;900&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');

    .premium-article { font-family: 'Inter', sans-serif; font-size: 1rem; line-height: 1.85; color: #111; letter-spacing: -0.01em; max-width: 680px; margin: 0 auto; }
    .premium-article h2 { font-family: 'Inter', sans-serif; font-size: 1.6rem; font-weight: 800; color: #111; margin: 3rem 0 1.25rem; letter-spacing: -0.5px; border-bottom: 2px solid #111; padding-bottom: 0.5rem; }
    .premium-article h3 { font-family: 'Inter', sans-serif; font-size: 1.3rem; font-weight: 700; color: #111; margin: 2rem 0 1rem; }
    .premium-article h4 { font-family: 'Inter', sans-serif; font-size: 1.1rem; font-weight: 700; color: #374151; margin: 1.5rem 0 0.75rem; }
    .premium-article p { margin-bottom: 1.5rem; }
    .premium-article ul, .premium-article ol { margin: 1rem 0 2rem 2rem; font-family: 'Inter', sans-serif; font-size: 1.05rem; }
    .premium-article li { margin-bottom: 0.75rem; line-height: 1.6; }
    .premium-article table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-family: 'Inter', sans-serif; font-size: 0.95rem; }
    .premium-article th { background: #F9FAFB; color: #111; padding: 1rem; text-align: left; font-weight: 800; border-bottom: 2px solid #111; }
    .premium-article td { padding: 1rem; border-bottom: 1px solid #E5E7EB; }
    .premium-article blockquote { border-left: 2px solid #111; margin: 2rem 0; padding: 1.2rem 2rem; background: #F9FAFB; font-style: italic; font-size: 1.3rem; color: #374151; }
    .premium-article strong { font-weight: 700; color: #000; }
    .premium-article a { color: #CC0000; text-decoration: underline; text-underline-offset: 4px; }
    
    .ai-insight-box { background: #F9FAFB; border-left: 3px solid #111; padding: 2rem; margin: 2.5rem 0; font-family: 'Inter', sans-serif; font-size: 1rem; color: #111; }
    .sector-action-box { background: #FFFFFF; border: 1px solid #E5E7EB; padding: 2rem; margin: 2.5rem 0; font-family: 'Inter', sans-serif; font-size: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }

    .nav-pill { padding: 0.6rem 1.2rem; background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 99px; font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 700; color: #111; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .nav-pill:hover { background: #111; color: #FFF; border-color: #111; }
  `;

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#111', fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: articleCSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, jsonLdBreadcrumb]) }} />
      
      {/* STICKY NAV — ORTAK NAVBAR */}
      {ticker}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />

      {/* 2. HERO HEADER (Başlık + Meta bilgi) */}
      {heroImage ? (
        <div style={{ position: 'relative', background: '#0B0D0F', borderBottom: '1px solid #222', padding: '4rem 2rem 3rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#111', background: '#FFF', padding: '0.4rem 1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                {category}
              </span>
              {aiImpactScore && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFF', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 1rem', letterSpacing: '1px' }}>
                  IMPACT: {aiImpactScore}/100
                </span>
              )}
            </div>
            
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.2, color: '#FFF', marginBottom: '1.5rem' }}>
              {title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              <span>Yazar: TRTEX Intelligence</span>
              <span style={{ opacity: 0.5 }}>•</span>
              {formattedDate && <span>{formattedDate}</span>}
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{readTime} {lang === 'tr' ? 'dk okuma' : 'min read'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100vw', background: '#0B0D0F', borderBottom: '1px solid #222', padding: '6rem 2rem 4rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#111', background: '#FFF', padding: '0.4rem 1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                {category}
              </span>
              {aiImpactScore && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFF', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 1rem', letterSpacing: '1px' }}>
                  IMPACT: {aiImpactScore}/100
                </span>
              )}
            </div>
            
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.2, color: '#FFF', marginBottom: '1.5rem' }}>
              {title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              <span>Yazar: TRTEX Intelligence</span>
              <span style={{ opacity: 0.5 }}>•</span>
              {formattedDate && <span>{formattedDate}</span>}
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{readTime} {lang === 'tr' ? 'dk okuma' : 'min read'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTENT AREA (720px CENTERED) */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* ═══ HERO IMAGE (16:9, content genişliğinde — ASLA TAŞMAZ) ═══ */}
        {heroImage && (
          <figure style={{ margin: '0 0 1rem 0', overflow: 'hidden', background: '#F3F4F6' }}>
            <img src={heroImage} alt={title} style={{ width: '100%', maxWidth: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
          </figure>
        )}

        {/* ═══ PERDE.AI TELEPORT CTA ═══ */}
        <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a 
            href={`${getBaseUrl()}/sites/perde/studio?inspiration=${encodeURIComponent(title)}`}
            onClick={(e) => {
              // Send telemetry signal in the background
              fetch('/api/system/signals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'TELEPORT_INITIATED',
                  source_node: 'trtex',
                  target_node: 'perde',
                  payload: { title }
                })
              }).catch(() => {});
            }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#111', color: '#FFF', padding: '0.75rem 1.5rem', 
              fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = '#111'}
          >
            ⚡ BU KUMAŞI PERDE.AI'DA TASARLA
          </a>
        </div>
        
        {/* BREADCRUMB */}
        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '2rem', fontFamily: 'var(--m)' }}>
          <a href={basePath} style={{ color: '#111', textDecoration: 'none' }}>HOME</a>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <a href={`${basePath}/news?lang=${lang}`} style={{ color: '#111', textDecoration: 'none', fontWeight: 700 }}>{lang === 'tr' ? 'HABERLER' : 'NEWS'}</a>
        </div>
        
        {/* SUMMARY (Lead Paragraph) */}
        {summary && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.35rem', color: '#111', lineHeight: 1.6, fontWeight: 500, marginBottom: '3rem' }}>
            {summary}
          </p>
        )}

        {/* ═══ AI INSIGHT BOX (Premium Özel Kutu) ═══ */}
        {executiveSummary && Array.isArray(executiveSummary) && executiveSummary.length > 0 && executiveSummary.some((i: string) => i.trim() !== '') && (
          <div className="ai-insight-box">
             <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '1rem', textTransform: 'uppercase', color: '#6B7280' }}>
               AIPyram Insight
             </div>
             <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#111', fontWeight: 500 }}>
               {executiveSummary.map((item: string, i: number) => item.trim() && (
                 <li key={i} style={{ marginBottom: '0.75rem', lineHeight: 1.6 }}>{item}</li>
               ))}
             </ul>
          </div>
        )}

        {/* ═══ TRADE BRIEF ═══ */}
        {tradeBrief && (tradeBrief.situation || tradeBrief.so_what || tradeBrief.now_what) && (
          <div className="ai-insight-box">
             <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '1.5rem', textTransform: 'uppercase', color: '#6B7280' }}>
               Trade Brief (TRTEX Core)
             </div>
            {tradeBrief.situation && (
              <div style={{ marginBottom: '1rem' }}>
                 <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#4B5563', display: 'block', marginBottom: '0.25rem' }}>Situation</strong>
                 <div style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{tradeBrief.situation}</div>
              </div>
            )}
            {tradeBrief.so_what && (
              <div style={{ marginBottom: '1rem' }}>
                 <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#4B5563', display: 'block', marginBottom: '0.25rem' }}>So What?</strong>
                 <div style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{tradeBrief.so_what}</div>
              </div>
            )}
            {tradeBrief.now_what && (
              <div style={{ marginBottom: '0' }}>
                 <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#4B5563', display: 'block', marginBottom: '0.25rem' }}>Now What?</strong>
                 <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#111', fontWeight: 700 }}>{tradeBrief.now_what}</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ARTICLE BODY PART 1 ═══ */}
        <article className="premium-article">
          <div dangerouslySetInnerHTML={{ __html: part1 }} />
        </article>

        {/* ═══ MID IMAGE (16:9, content genişliğinde — ASLA TAŞMAZ) ═══ */}
        {midImage && (
          <figure style={{ margin: '3rem 0', overflow: 'hidden', background: '#F3F4F6' }}>
            <img src={midImage} alt="Market Analysis" style={{ width: '100%', maxWidth: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} loading="lazy" />
          </figure>
        )}

        {/* ═══ ARTICLE BODY PART 2 ═══ */}
        {part2 && (
          <article className="premium-article">
            <div dangerouslySetInnerHTML={{ __html: part2 }} />
          </article>
        )}

        {/* ═══ SEKTÖR AKSİYONU ═══ */}
        {actionItems && actionItems.length > 0 && (
          <div className="sector-action-box">
             <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '1.5rem', textTransform: 'uppercase', color: '#CC0000', borderBottom: '2px solid #111', paddingBottom: '0.5rem', display: 'inline-block' }}>
               Ne Yapmalı? — Aksiyon Planı
             </div>
             {actionItems.map((item: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#111', marginTop: '0.2rem' }}>0{i + 1}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#111', lineHeight: 1.6 }}>{item}</span>
                </div>
             ))}
          </div>
        )}
        
        {/* ═══ DETAIL IMAGE (16:9, content genişliğinde — ASLA TAŞMAZ) ═══ */}
        {detailImage && (
          <figure style={{ margin: '4rem 0 2rem 0', overflow: 'hidden', background: '#F3F4F6' }}>
            <img src={detailImage} alt="Texture Detail" style={{ width: '100%', maxWidth: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} loading="lazy" />
          </figure>
        )}

        {/* ═══ AI BLOOMBERG YORUMU ═══ */}
        {aiCommentary && aiCommentary.length > 30 && (
          <div style={{ marginTop: '3rem', padding: '2rem', background: '#111', color: '#FFF', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', color: '#CC0000', textTransform: 'uppercase' }}>TRTEX AI</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#666', letterSpacing: '1px' }}>BLOOMBERG-STYLE ANALYSIS</span>
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#E5E7EB', margin: 0 }}>{aiCommentary}</p>
            {aiImpactScore > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#666' }}>IMPACT SCORE</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: aiImpactScore > 65 ? '#22C55E' : '#F59E0B' }}>{aiImpactScore}/100</span>
              </div>
            )}
          </div>
        )}

        {/* ═══ B2B İŞ FIRSATLARI & EŞLEŞTİRME (Matchmaking Engine) ═══ */}
        {businessOpps.length > 0 && (
          <div style={{ marginTop: '2.5rem', padding: '2rem', border: '2px solid #111', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', color: '#CC0000', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
              {lang === 'tr' ? '💰 TİCARİ FIRSATLAR (EŞLEŞTİRME)' : '💰 BUSINESS OPPORTUNITIES (MATCHMAKING)'}
            </div>
            {businessOpps.map((opp: string, i: number) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: i !== businessOpps.length - 1 ? '1px dashed #E5E7EB' : 'none' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22C55E', lineHeight: 1 }}>→</span>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#111', lineHeight: 1.6 }}>{opp}</span>
                </div>
                <button 
                  onClick={() => { setLeadTarget(`opp_match_${i}`); setIsLeadModalOpen(true); }}
                  style={{ alignSelf: 'flex-start', marginLeft: '2.5rem', background: '#111', color: '#FFF', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                  {lang === 'tr' ? 'Alıcı/Tedarikçi Bul →' : 'Find Partner →'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ═══ COMMERCIAL CTA (Friction-less Deal Engine) ═══ */}
        {commercialCta && (
           <div style={{ marginTop: '3rem', padding: '3rem 2rem', background: 'linear-gradient(135deg, #0B0D0F 0%, #1A1A1A 100%)', color: '#FFF', textAlign: 'center', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#CC0000', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {commercialCta.target_audience === 'wholesaler' ? 'TOPTANCI AKSİYONU' : commercialCta.target_audience === 'manufacturer' ? 'ÜRETİCİ MATCHMAKING' : 'PERAKENDE B2B'}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>
                {commercialCta.value_proposition}
              </h3>
              
              {/* PRIMARY CTA (Fast Input) */}
              {leadStatus === 'success' ? (
                 <div style={{ marginTop: '1.5rem', background: '#16A34A', color: '#FFF', padding: '1.5rem', fontWeight: 900, borderRadius: '4px', letterSpacing: '1px' }}>
                    ⚡ İLK TEKLİFİNİZ HAZIR! (AUTO-MATCH DEVREDE)
                    <div style={{ fontSize: '0.8rem', fontWeight: 400, marginTop: '0.5rem', opacity: 0.9 }}>
                      Sistem 2 potansiyel üretici buldu. Detaylı rapor WhatsApp/E-posta üzerinden iletilecek.
                    </div>
                 </div>
              ) : (
                <form onSubmit={(e) => {
                  setLeadTarget(commercialCta.target_audience);
                  handleLeadSubmit(e);
                }} style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="İş E-posta veya WhatsApp Numaranız" 
                    required 
                    onChange={e => setLeadData({...leadData, email: e.target.value, name: 'Hızlı İstihbarat Ziyaretçisi'})}
                    style={{ padding: '1rem', minWidth: '300px', border: '1px solid #333', background: '#111', color: '#FFF', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--m)' }}
                  />
                  <button 
                    type="submit"
                    disabled={leadStatus === 'loading'}
                    style={{ background: '#CC0000', color: '#FFF', border: 'none', padding: '1rem 2rem', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase', opacity: leadStatus === 'loading' ? 0.7 : 1 }}>
                    {leadStatus === 'loading' ? 'ALINIYOR...' : 'BU FIRSAT İÇİN TEKLİF AL (2 DK)'}
                  </button>
                </form>
              )}

              {/* SECONDARY CTAS (Static) */}
              {leadStatus !== 'success' && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                   <button onClick={() => { setLeadTarget('register_free'); setIsLeadModalOpen(true); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%', maxWidth: '165px' }}>
                     Ücretsiz Üye Ol
                   </button>
                   <button onClick={() => { setLeadTarget('register_company'); setIsLeadModalOpen(true); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#FFF', padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', width: '100%', maxWidth: '165px' }}>
                     Firma Ekle
                   </button>
                </div>
              )}
           </div>
        )}

        {/* ═══ B2B OPPORTUNITY CARD ═══ */}
        {oppCard && (
           <div style={{ marginTop: '3rem', padding: '2rem', background: '#FAFAFA', border: '1px solid #111' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#111' }}>
                {lang === 'tr' ? 'Fırsat Kartı' : 'Opportunity Card'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
                 <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{lang === 'tr' ? 'İçgörü' : 'Insight'}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>{oppCard.insight}</div>
                 </div>
                 <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{lang === 'tr' ? 'Aksiyon' : 'Action'}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#CC0000' }}>{oppCard.action}</div>
                 </div>
              </div>
           </div>
        )}

        {/* ═══ TAGS / KEYWORDS ═══ */}
        {tags.length > 0 && (
          <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{
                padding: '0.4rem 0.8rem', border: '1px solid #E5E7EB', 
                fontSize: '0.7rem', fontWeight: 700, color: '#4B5563',
                letterSpacing: '0.5px', background: '#FAFAFA', fontFamily: "'Inter', sans-serif",
                textTransform: 'uppercase',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ═══ SHARE + NAV (ShareButtons Bileşeni) ═══ */}
        <ShareButtons 
          title={title} 
          url={`https://${brandName.toLowerCase()}.com/news/${article.slug || article.id}`} 
          lang={lang} 
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
           <a href={`${basePath}/news?lang=${lang}`} className="nav-pill" style={{ background: '#111', color: '#FFF' }}>
             {lang === 'tr' ? 'Tüm Arşiv →' : 'All Archive →'}
           </a>
        </div>

      </main>

      {/* ═══ RELATED ARTICLES (GRID) ═══ */}
      {relatedArticles && relatedArticles.length > 0 && (
         <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: "'Inter', sans-serif", fontWeight: 900, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              {lang === 'tr' ? "İlginizi Çekebilir" : "Related Reading"}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {relatedArticles.map((rel: any) => (
                <a key={rel.id} href={`${basePath}/news/${rel.slug || rel.id}?lang=${lang}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: '#111', transition: 'opacity 0.2s' }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', background: '#F3F4F6', marginBottom: '1rem', overflow: 'hidden' }}>
                    {(rel.images?.[0] || rel.image_url) && (
                      <img src={rel.images?.[0] || rel.image_url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {rel.translations?.[targetLang]?.category || rel.category || 'MARKET'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", fontWeight: 800, lineHeight: 1.3 }}>
                    {rel.translations?.[targetLang]?.title || rel.title}
                  </div>
                </a>
              ))}
            </div>
         </div>
      )}

      {/* FOOTER */}
      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />

      {/* ═══ LEAD CAPTURE & MATCHMAKING MODAL ═══ */}
      {isLeadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#FFF', width: '90%', maxWidth: '500px', padding: '3rem 2rem', borderRadius: '12px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <button onClick={() => { setIsLeadModalOpen(false); setLeadStatus('idle'); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9CA3AF' }}>&times;</button>
            
            {leadStatus === 'success' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Inter', sans-serif", color: '#111' }}>
                  {lang === 'tr' ? 'Kayıt Başarılı. Sıraya Alındınız.' : 'Registration Complete.'}
                </h3>
                <p style={{ color: '#4B5563', margin: '1rem 0 2rem' }}>
                  {lang === 'tr' ? 'VIP Eşleştirme uzmanlarımız en kısa sürede analizleri sağlayacak.' : 'Our VIP matchmaking experts will provide analysis shortly.'}
                </p>
                <button onClick={() => setIsLeadModalOpen(false)} style={{ background: '#111', color: '#FFF', padding: '0.75rem 2rem', border: 'none', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}>
                  {lang === 'tr' ? 'Piyasaya Dön' : 'Return to Market'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#CC0000', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  AIPyram B2B Network
                </div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: "'Inter', sans-serif", fontWeight: 800, color: '#111', marginBottom: '2rem' }}>
                  {lang === 'tr' ? 'Global Tedarik Ağına Katılın' : 'Join Global Supply Network'}
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <input required placeholder={lang === 'tr' ? 'Şirket veya Ad Soyad' : 'Company or Full Name'} onChange={e => setLeadData({...leadData, name: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }} />
                  <input required type="email" placeholder={lang === 'tr' ? 'Kurumsal Email Adresi' : 'Corporate Email'} onChange={e => setLeadData({...leadData, email: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select required onChange={e => setLeadData({...leadData, role: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', background: '#FFF' }}>
                      <option value="wholesaler">{lang === 'tr' ? 'Toptancı (Alıcı)' : 'Wholesaler (Buyer)'}</option>
                      <option value="retailer">{lang === 'tr' ? 'Perakendeci (Zincir)' : 'Retailer (Chain)'}</option>
                      <option value="manufacturer">{lang === 'tr' ? 'Üretici / İhracatçı' : 'Manufacturer'}</option>
                      <option value="architect">{lang === 'tr' ? 'Mimar / Proje' : 'Architect / Contract'}</option>
                    </select>
                    <input required placeholder={lang === 'tr' ? 'Ülke (Örn: Almanya)' : 'Country (e.g. Germany)'} onChange={e => setLeadData({...leadData, country: e.target.value})} style={{ width: '100%', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }} />
                  </div>
                </div>
                
                <button disabled={leadStatus === 'loading'} type="submit" style={{ width: '100%', background: leadStatus === 'loading' ? '#9CA3AF' : '#111', color: '#FFF', border: 'none', padding: '1.2rem', marginTop: '2rem', fontSize: '1rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {leadStatus === 'loading' ? 'İşleniyor...' : (lang === 'tr' ? 'Güvenli Ağ Girişi →' : 'Secure Network Entry →')}
                </button>
                <p style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center' }}>
                  {lang === 'tr' ? 'Verileriniz şifrelenerek yapay zeka eşleştirme havuzuna alınır.' : 'Your data is encrypted and placed in the AI matching pool.'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

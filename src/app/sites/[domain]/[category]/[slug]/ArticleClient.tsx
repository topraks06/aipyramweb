'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShareButtons from '@/components/trtex/ShareButtons';
import StickyCtaBar from '@/components/trtex/StickyCtaBar';

interface ArticleClientProps {
  heroImage: string;
  heroAlt: string;
  heroCaption: string;
  heroSeoName: string;
  inlineImages: { url: string; caption: string; alt: string; seoName: string }[];
  content: string;
  quickIntel: { risk: string; opportunity: string; action: string };
  execIntel: {
    summary: string[];
    opportunities: string[];
    actions: string[];
    trendPrediction: string;
    confidence: number;
  };
  dataBox: any;
  relatedNews: any[];
  displayTags: string[];
  category: string;
  impactScore: number;
  brandName: string;
  articleSource?: string;
  dateStr: string;
  lang: string;
  oneSentenceDecision?: string;
  tradeBrief?: {
    situation: string;
    so_what: string;
    now_what: string;
    who_wins: string[];
    who_loses: string[];
  };
}

export default function ArticleClient({
  heroImage, heroAlt, heroCaption, heroSeoName,
  inlineImages, content,
  quickIntel, execIntel, dataBox,
  relatedNews, displayTags, category,
  impactScore, brandName, articleSource, dateStr, lang, oneSentenceDecision, tradeBrief
}: ArticleClientProps) {

  const T_DICT: Record<string, any> = {
    TR: { expand: 'BÜYÜT', execSummary: 'YÖNETİCİ ÖZETİ', ceoSummary: 'CEO ÖZETİ', opportunities: 'İŞ FIRSATLARI', actions: 'NE YAPILMALI?', trend: '3 AYLIK TAHMİN', market: 'PAZAR', marketSize: 'PAZAR BÜYÜKLÜĞÜ', riskLevel: 'RİSK SEVİYESİ', readMore: 'DEVAMINI OKU', risk: 'RİSK', action: 'AKSİYON', opportunity: 'FIRSAT', actionText: 'HIZLI AKSİYON', source: 'Kaynak:', author: 'YAZAR:', disclaimer: 'YASAL UYARI', disclaimerText: 'TRTEX B2B Tekstil İstihbarat Platformu\'nda yer alan piyasa analizleri kesinlikle yatırım tavsiyesi niteliğinde değildir.' },
    EN: { expand: 'EXPAND', execSummary: 'EXECUTIVE SUMMARY', ceoSummary: 'CEO SUMMARY', opportunities: 'OPPORTUNITIES', actions: 'WHAT TO DO?', trend: '3 MONTH FORECAST', market: 'MARKET', marketSize: 'MARKET SIZE', riskLevel: 'RISK LEVEL', readMore: 'READ MORE', risk: 'RISK', action: 'ACTION', opportunity: 'OPPORTUNITY', actionText: 'QUICK ACTION', source: 'Source:', author: 'AUTHOR:', disclaimer: 'DISCLAIMER', disclaimerText: 'Market analysis provided on TRTEX B2B Textile Intelligence Platform is not investment advice.' },
    RU: { expand: 'УВЕЛИЧИТЬ', execSummary: 'РЕЗЮМЕ РУКОВОДИТЕЛЯ', ceoSummary: 'РЕЗЮМЕ CEO', opportunities: 'БИЗНЕС-ВОЗМОЖНОСТИ', actions: 'ЧТО ДЕЛАТЬ?', trend: 'ПРОГНОЗ НА 3 МЕСЯЦА', market: 'РЫНОК', marketSize: 'ОБЪЕМ РЫНКА', riskLevel: 'УРОВЕНЬ РИСКА', readMore: 'ЧИТАТЬ ДАЛЕЕ', risk: 'РИСК', action: 'ДЕЙСТВИЕ', opportunity: 'ВОЗМОЖНОСТЬ', actionText: 'БЫСТРОЕ ДЕЙСТВИЕ', source: 'Источник:', author: 'АВТОР:', disclaimer: 'ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ', disclaimerText: 'Анализ рынка предоставленный на платформе не является инвестиционным советом.' },
  };
  const L = T_DICT[lang.toUpperCase()] || T_DICT.EN;
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [showSticky, setShowSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ═══ Sticky Action Bar — scroll'da görünür ═══
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(progress);
      setShowSticky(scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ═══ Lightbox ESC kapatma ═══
  const closeLightbox = useCallback(() => {
    setLightboxSrc('');
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    if (lightboxSrc) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [lightboxSrc, closeLightbox]);

  // ═══ İçeriği bölümlere ayır (görsel serpiştirilmesi için) ═══
  const contentSections = splitContent(content, inlineImages.length);

  const hasQuickIntel = quickIntel.risk || quickIntel.opportunity || quickIntel.action;
  const hasExecIntel = execIntel.summary.length > 0 || execIntel.opportunities.length > 0 || execIntel.actions.length > 0;

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO GÖRSEL (Tıkla → Lightbox)
          ═══════════════════════════════════════════ */}
      {heroImage && heroImage.startsWith('http') && (
        <figure
          style={{
            margin: '0 0 2rem 0', cursor: 'zoom-in',
            position: 'relative', overflow: 'hidden',
            border: '1px solid #E5E7EB',
          }}
          onClick={() => setLightboxSrc(heroImage)}
        >
          <img
            src={heroImage} alt={heroAlt}
            style={{
              width: '100%', maxWidth: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover', display: 'block',
              transition: 'transform 0.5s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.015)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
          <div style={{
            position: 'absolute', bottom: '10px', right: '12px',
            background: 'rgba(0,0,0,0.55)', padding: '4px 10px',
            color: '#fff', fontSize: '0.6rem', letterSpacing: '1px',
            fontWeight: 600, backdropFilter: 'blur(4px)', borderRadius: '3px',
          }}>
            🔍 {L.expand}
          </div>
        </figure>
      )}

      {/* Hero caption */}
      {(heroCaption || heroSeoName) && (
        <div style={{
          marginTop: '-1.5rem', marginBottom: '2rem',
          fontSize: '0.7rem', color: '#888', fontStyle: 'italic', lineHeight: 1.4,
        }}>
          {heroCaption && <span>{heroCaption}</span>}
          {heroSeoName && <span style={{ display: 'block', fontSize: '0.6rem', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' }}>📷 {heroSeoName}</span>}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          1 CÜMLELİK KARAR (CEO ÖZETİ)
          ═══════════════════════════════════════════ */}
      {oneSentenceDecision && (
         <div style={{
           margin: '0 0 2.5rem 0', padding: '1.25rem 1.5rem',
           background: '#FEF2F2', borderLeft: '4px solid #DC2626',
           color: '#111', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.5,
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
         }}>
           <span style={{ fontSize: '0.65rem', letterSpacing: '2px', color: '#DC2626', display: 'block', marginBottom: '0.4rem' }}>
             🚀 {L.execSummary}
           </span>
           {oneSentenceDecision}
         </div>
      )}

      {/* ═══════════════════════════════════════════
          B2B TRADE BRIEF EKRANI (Decision Engine)
          ═══════════════════════════════════════════ */}
      {tradeBrief && (
        <div style={{ marginBottom: '3rem', fontFamily: "'Inter', sans-serif" }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1px', background: '#E2E8F0', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            
            {/* SITUATION */}
            <div style={{ background: '#fff', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>SITUATION (NE OLDU?)</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.5 }}>
                {tradeBrief.situation}
              </div>
            </div>

            {/* SO WHAT */}
            <div style={{ background: '#fff', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>SO WHAT (ETKİSİ NE?)</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.5 }}>
                {tradeBrief.so_what}
              </div>
            </div>

            {/* NOW WHAT */}
            <div style={{ background: '#EFF6FF', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#2563EB', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>NOW WHAT (AKSİYON)</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1D4ED8', lineHeight: 1.5 }}>
                {tradeBrief.now_what}
              </div>
            </div>
            
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
             {/* WHO WINS */}
             {tradeBrief.who_wins && tradeBrief.who_wins.length > 0 && (
               <div style={{ borderLeft: '4px solid #22C55E', padding: '1rem', background: '#F0FDF4' }}>
                 <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#16A34A', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>WHO WINS (KAZANANLAR)</div>
                 <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#14532D', fontSize: '0.9rem', fontWeight: 600 }}>
                   {tradeBrief.who_wins.map((w, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{w}</li>)}
                 </ul>
               </div>
             )}

             {/* WHO LOSES */}
             {tradeBrief.who_loses && tradeBrief.who_loses.length > 0 && (
               <div style={{ borderLeft: '4px solid #EF4444', padding: '1rem', background: '#FEF2F2' }}>
                 <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#DC2626', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>WHO LOSES (KAYBEDENLER)</div>
                 <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#7F1D1D', fontSize: '0.9rem', fontWeight: 600 }}>
                   {tradeBrief.who_loses.map((l, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{l}</li>)}
                 </ul>
               </div>
             )}
          </div>
          
        </div>
      )}

      {/* ═══════════════════════════════════════════
          BLOK 2: QUICK INTELLIGENCE — Risk | Fırsat | Aksiyon (3 satır)
          ═══════════════════════════════════════════ */}
      {hasQuickIntel && (
        <div style={{
          margin: '0 0 2.5rem 0',
          border: '2px solid #111', background: '#fff',
        }}>
          <div style={{
            background: '#111', color: '#fff',
            padding: '0.5rem 1rem', fontSize: '0.6rem',
            letterSpacing: '3px', fontWeight: 800,
          }}>
            ⚡ QUICK INTELLIGENCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {/* Risk */}
            <div style={{ padding: '1rem', borderRight: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#DC2626', fontWeight: 800, marginBottom: '0.4rem' }}>
                🔴 {L.risk}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111', fontWeight: 500, lineHeight: 1.5 }}>
                {quickIntel.risk || '—'}
              </div>
            </div>
            {/* Fırsat */}
            <div style={{ padding: '1rem', borderRight: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#059669', fontWeight: 800, marginBottom: '0.4rem' }}>
                🟢 {L.opportunity}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111', fontWeight: 500, lineHeight: 1.5 }}>
                {quickIntel.opportunity || '—'}
              </div>
            </div>
            {/* Aksiyon */}
            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#D97706', fontWeight: 800, marginBottom: '0.4rem' }}>
                🟡 {L.action}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111', fontWeight: 600, lineHeight: 1.5 }}>
                {quickIntel.action || '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          BLOK 3: CONTENT — Yazı + Gövde İçi Görseller
          ═══════════════════════════════════════════ */}
      <article style={{
        fontSize: '1.05rem', lineHeight: 1.85, color: '#1a1a1a',
        background: '#fff', border: '1px solid #E5E7EB',
        padding: '2rem 2.5rem', marginBottom: '2.5rem',
      }}>
        {/* CSS for article content styling */}
        <style>{`
          .trtex-article h2 { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.5px; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #111; color: #000; }
          .trtex-article h3 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #111; }
          .trtex-article p { margin-bottom: 1.15rem; }
          .trtex-article table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
          .trtex-article table th { background: #111; color: #fff; padding: 0.6rem 1rem; text-align: left; font-weight: 700; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; }
          .trtex-article table td { padding: 0.6rem 1rem; border-bottom: 1px solid #E5E7EB; }
          .trtex-article table tr:hover td { background: #FAFAF8; }
          .trtex-article blockquote { border-left: 4px solid #CC0000; padding: 1rem 1.5rem; margin: 1.5rem 0; background: #FAFAF8; font-style: italic; color: #333; }
          .trtex-article ul, .trtex-article ol { padding-left: 1.5rem; margin-bottom: 1rem; }
          .trtex-article li { margin-bottom: 0.5rem; }
          .trtex-article strong { color: #000; }
        `}</style>

        {contentSections.map((section, idx) => (
          <React.Fragment key={idx}>
            <div className="trtex-article" dangerouslySetInnerHTML={{ __html: section }} />
            {/* Bölümler arası inline görsel */}
            {idx < contentSections.length - 1 && inlineImages[idx] && inlineImages[idx].url?.startsWith('http') && (
              <figure
                style={{
                  margin: '2rem 0', cursor: 'zoom-in',
                  position: 'relative', overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                }}
                onClick={() => setLightboxSrc(inlineImages[idx].url)}
              >
                <img
                  src={inlineImages[idx].url}
                  alt={inlineImages[idx].alt}
                  loading="lazy"
                  style={{ width: '100%', maxWidth: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.015)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div style={{
                  position: 'absolute', bottom: '8px', right: '10px',
                  background: 'rgba(0,0,0,0.5)', padding: '3px 8px',
                  color: '#fff', fontSize: '0.55rem', letterSpacing: '1px',
                  fontWeight: 600, backdropFilter: 'blur(4px)', borderRadius: '3px',
                }}>
                  🔍 BÜYÜT
                </div>
              </figure>
            )}
          </React.Fragment>
        ))}
      </article>

      {/* ═══════════════════════════════════════════
          BLOK 4: DATA BOX — Piyasa Verisi (varsa)
          ═══════════════════════════════════════════ */}
      {dataBox && (dataBox.market_size || dataBox.country) && (
        <div style={{
          display: 'flex', gap: '0', marginBottom: '2.5rem',
          border: '2px solid #111', overflow: 'hidden',
        }}>
          <div style={{ background: '#111', color: '#fff', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.3rem' }}>📊 {L.market}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{dataBox.country || '—'}</div>
            </div>
          </div>
          {dataBox.market_size && (
            <div style={{ padding: '1rem', borderRight: '1px solid #E5E7EB', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', letterSpacing: '2px', color: '#888', fontWeight: 700 }}>{L.marketSize}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111', marginTop: '0.3rem' }}>{dataBox.market_size}</div>
            </div>
          )}
          {dataBox.risk_score && (
            <div style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.5rem', letterSpacing: '2px', color: '#888', fontWeight: 700 }}>{L.riskLevel}</div>
              <div style={{
                fontSize: '1rem', fontWeight: 800, marginTop: '0.3rem', textTransform: 'uppercase',
                color: dataBox.risk_score === 'yüksek' || dataBox.risk_score === 'high' ? '#DC2626' : dataBox.risk_score === 'orta' || dataBox.risk_score === 'medium' ? '#D97706' : '#059669',
              }}>
                {dataBox.risk_score}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          BLOK 5: EXECUTIVE INTELLIGENCE (TEK BLOK)
          ═══════════════════════════════════════════ */}
      {hasExecIntel && (
        <div style={{
          marginBottom: '2.5rem',
          border: '2px solid #000',
          background: '#fff',
        }}>
          {/* Başlık bar */}
          <div style={{
            background: '#000', color: '#fff',
            padding: '0.75rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '3px', fontWeight: 800 }}>
              EXECUTIVE INTELLIGENCE
            </span>
            <span style={{
              fontSize: '0.6rem', letterSpacing: '1px',
              color: '#22C55E', fontWeight: 700,
            }}>
              CONFIDENCE: {execIntel.confidence}%
            </span>
          </div>

          <div style={{ padding: '1.5rem 2rem' }}>
            {/* CEO Summary */}
            {execIntel.summary.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#CC0000', fontWeight: 800, marginBottom: '0.75rem' }}>
                  {L.ceoSummary}
                </div>
                {execIntel.summary.map((item, i) => (
                  <p key={i} style={{
                    fontSize: '1rem', fontWeight: 500, lineHeight: 1.6,
                    marginBottom: '0.6rem', paddingLeft: '1rem',
                    borderLeft: '3px solid #CC0000', color: '#111',
                  }}>
                    {item}
                  </p>
                ))}
              </div>
            )}

            {/* Fırsatlar + Aksiyonlar yan yana */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Fırsatlar */}
              {execIntel.opportunities.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#059669', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {L.opportunities}
                  </div>
                  {execIntel.opportunities.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.5rem', marginBottom: '0.5rem',
                      fontSize: '0.9rem', lineHeight: 1.5, color: '#222',
                    }}>
                      <span style={{ color: '#059669', fontWeight: 800, flexShrink: 0 }}>→</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Aksiyonlar */}
              {execIntel.actions.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#D97706', fontWeight: 800, marginBottom: '0.75rem' }}>
                    {L.actions}
                  </div>
                  {execIntel.actions.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.5rem', marginBottom: '0.5rem',
                      fontSize: '0.9rem', lineHeight: 1.5, color: '#222',
                    }}>
                      <span style={{ color: '#D97706', fontWeight: 900, flexShrink: 0 }}>{i + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trend Tahmini */}
            {execIntel.trendPrediction && (
              <div style={{
                marginTop: '1.5rem', padding: '1rem',
                background: '#FFFBEB', borderLeft: '3px solid #F59E0B',
              }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#B45309', fontWeight: 800, marginBottom: '0.3rem' }}>
                  📈 {L.trend}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#111', fontWeight: 500, lineHeight: 1.6 }}>
                  {execIntel.trendPrediction}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags (max 4, sade) */}
      {displayTags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {displayTags.map((tag, i) => (
            <span key={i} style={{
              padding: '0.25rem 0.6rem', border: '1px solid #D1D5DB',
              fontSize: '0.6rem', fontWeight: 600, color: '#666',
              letterSpacing: '0.5px', background: '#fff',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 🔴 DİNAMİK İÇERİK CTA (News -> Trade Bağlantısı) */}
      {displayTags.length > 0 && (
        <a 
          href={`/request-quote?lang=${lang}&product=${encodeURIComponent(displayTags[0])}`}
          style={{
            display: 'block', background: '#CC0000', color: '#fff',
            padding: '1.25rem', textAlign: 'center', fontWeight: 900,
            fontSize: '1.1rem', letterSpacing: '-0.5px', textDecoration: 'none',
            borderRadius: '8px', marginBottom: '3rem',
            boxShadow: '0 10px 25px rgba(204,0,0,0.2)', transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {lang.toUpperCase() === 'TR' ? `${displayTags[0].toUpperCase()} TEDARİKÇİSİ BUL & FİYAT AL →` : `FIND ${displayTags[0].toUpperCase()} SUPPLIERS & FACTORY PRICES →`}
        </a>
      )}

      {/* PAYLAŞIM BUTONLARI */}
      <ShareButtons
        title={displayTags[0] || brandName}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        lang={lang}
      />

      {/* Kaynak & Yazar */}
      <div style={{
        padding: '0.75rem 1rem', background: '#F9FAFB', border: '1px solid #E5E7EB',
        fontSize: '0.65rem', color: '#888', fontFamily: 'monospace',
        marginBottom: '3rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#111', fontWeight: 800, paddingRight: '1rem', borderRight: '1px solid #E5E7EB', marginRight: '1rem' }}>
            📡 {L.author} TRTEX INTELLIGENCE
          </span>
          {articleSource && <span><strong>{L.source}</strong> {articleSource}</span>}
        </div>
        <span>{dateStr}</span>
      </div>

      {/* ═══════════════════════════════════════════
          B2B YASAL UYARI VE SORUMLULUK REDDİ BEYANI
          ═══════════════════════════════════════════ */}
      <div style={{
        marginTop: '2rem', marginBottom: '3rem', padding: '1.5rem',
        background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px',
        color: '#92400E', fontSize: '0.75rem', lineHeight: 1.6,
      }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#B45309' }}>
          ⚠️ {(lang.toUpperCase() === 'TR') ? 'YASAL UYARI (DISCLAIMER)' : L.disclaimer}
        </strong>
        {L.disclaimerText}
      </div>

      {/* ═══════════════════════════════════════════
          BLOK 6: RELATED NEWS (Max 3, kompakt)
          ═══════════════════════════════════════════ */}
      {relatedNews.length > 0 && (
        <section style={{ marginTop: '3rem', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '3px', borderBottom: '3px solid #111',
            paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#111',
          }}>
            DEVAMINI OKU
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {relatedNews.map((news: any) => (
              <a
                key={news.id}
                href={`/${category}/${news.slug || news.id}`}
                style={{
                  textDecoration: 'none', color: 'inherit', display: 'block',
                  background: '#fff', border: '1px solid #E5E7EB',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ width: '100%', height: '120px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                  {(news.images?.[0] || news.image_url) && (
                    <img
                      src={news.images?.[0] || news.image_url}
                      alt={news.title || ''}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.35, color: '#111', margin: 0 }}>
                    {news.title?.length > 55 ? news.title.substring(0, 55) + '…' : news.title}
                  </h4>
                  {news.category && (
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#CC0000', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {news.category}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          STICKY ACTION BAR (Scroll'da sağ alt)
          ═══════════════════════════════════════════ */}
      {quickIntel.action && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#111', color: '#fff',
          padding: '0.75rem 1.25rem',
          border: '2px solid #333',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontSize: '0.75rem', fontWeight: 700,
          maxWidth: '280px', lineHeight: 1.4,
          zIndex: 100,
          transition: 'all 0.3s ease',
          opacity: showSticky ? 1 : 0,
          transform: showSticky ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showSticky ? 'auto' : 'none',
        }}>
          <div style={{ fontSize: '0.5rem', letterSpacing: '2px', color: '#F59E0B', marginBottom: '0.3rem' }}>
            ⚡ {scrollProgress > 0.6 ? L.actionText : 'ACTION'}
          </div>
          {scrollProgress > 0.6 
            ? 'Şimdi fırsatı değerlendirin. Detaylar ve B2B fiyat avantajları için iletişime geçin.' 
            : quickIntel.action}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          LIGHTBOX OVERLAY
          ═══════════════════════════════════════════ */}
      {lightboxSrc && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'lbFadeIn 0.2s ease-out',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: '1.1rem', cursor: 'pointer',
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
            aria-label="Kapat"
          >
            ✕
          </button>
          <img
            src={lightboxSrc} alt="Büyütülmüş görsel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '90vh',
              objectFit: 'contain', cursor: 'default',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'lbScaleIn 0.25s ease-out',
            }}
          />
          <style>{`
            @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lbScaleIn { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}

      {/* STICKY CTA BAR */}
      <StickyCtaBar lang={lang} />
    </>
  );
}

/**
 * İçeriği H2 etiketlerinden bölerek arasına görsel yerleştirmeye uygun hale getirir.
 */
function splitContent(html: string, imageCount: number): string[] {
  if (!html || imageCount <= 0) return [html];

  const parts = html.split(/(?=<h2)/i);
  if (parts.length <= 2) {
    // H2 az → ortadan böl
    const mid = Math.floor(html.length / 2);
    const pClose = html.indexOf('</p>', mid);
    if (pClose > -1 && pClose < mid + 600) {
      return [html.substring(0, pClose + 4), html.substring(pClose + 4)];
    }
    return [html];
  }

  // Eşit bölümlere ayır
  const chunkSize = Math.ceil(parts.length / (imageCount + 1));
  const sections: string[] = [];
  for (let i = 0; i < parts.length; i += chunkSize) {
    sections.push(parts.slice(i, i + chunkSize).join(''));
  }
  return sections;
}

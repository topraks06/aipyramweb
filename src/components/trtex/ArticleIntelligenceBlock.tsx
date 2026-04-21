'use client';

import React, { useState } from 'react';

/**
 * TRTEX Article Intelligence Block
 * 
 * Haber altına eklenen AI istihbarat + lead yakalama bloğu.
 * Firestore'daki article verilerini görselleştirir.
 * 
 * TRTEX dumb client bu bileşeni embed eder veya kopyalar.
 */

interface ArticleIntelligenceProps {
  articleId: string;
  articleTitle: string;
  // Intelligence 360 alanları
  aiImpactScore?: number;
  executiveSummary?: string[];
  actionItems?: string[];
  buyerMindset?: { german_buyer?: string; uae_wholesaler?: string };
  trendPrediction?: string;
  opportunityRadar?: string[];
  businessOpportunities?: string[];
  aiCommentary?: string;
  // Lead data
  leadData?: {
    target_country?: string;
    demand_growth?: string;
    top_products?: string[];
    price_segment?: string;
    lead_cta?: string;
  };
  // Kaynak
  category?: string;
  country?: string;
  tags?: string[];
  ceoPriorityLevel?: string;
}

export default function ArticleIntelligenceBlock(props: ArticleIntelligenceProps) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', company: '', whatsapp: '', email: '',
    role: 'buyer' as string, products: '' as string,
    country: '', product_details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products: formData.products.split(',').map(p => p.trim()).filter(Boolean),
          source_article_id: props.articleId,
          source_article_title: props.articleTitle,
          source_country: props.leadData?.target_country || props.country || '',
          source_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (res.ok) {
        setFormSubmitted(true);
      }
    } catch {
      // Sessiz hata
    } finally {
      setFormLoading(false);
    }
  };

  const impactScore = props.aiImpactScore || 5;
  const impactColor = impactScore >= 8 ? '#ef4444' : impactScore >= 5 ? '#f59e0b' : '#22c55e';
  const impactLabel = impactScore >= 8 ? 'HIGH IMPACT' : impactScore >= 5 ? 'MODERATE' : 'LOW';

  return (
    <div style={{
      marginTop: '3rem',
      border: '2px solid #000',
      background: '#fff',
      padding: '2rem',
      fontFamily: "'Roboto', 'Inter', sans-serif",
    }}>
      {/* ═══ SABİT ÇIPA (DEĞİŞMEZ 4'LÜ) & CEO ÖNEM DERECESİ ═══ */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {props.category && (
          <div style={{
            display: 'inline-block',
            background: '#111', color: '#fff',
            padding: '1rem 2rem',
            fontSize: '1.5rem', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '2px',
            border: '2px solid #000',
            alignSelf: 'flex-start'
          }}>
            {props.category}
          </div>
        )}
        
        {props.ceoPriorityLevel && (
          <div style={{
            background: '#CC0000', color: '#fff',
            padding: '0.75rem 1.5rem',
            fontSize: '1.1rem', fontWeight: 800,
            border: '2px solid #000',
            alignSelf: 'flex-start',
            boxShadow: '4px 4px 0px #111'
          }}>
            SİNYAL: {props.ceoPriorityLevel}
          </div>
        )}
      </div>

      {/* ═══ DİNAMİK CEO ETİKETLERİ ═══ */}
      {props.tags && props.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {props.tags.map((tag, i) => (
            <span key={i} style={{
              background: '#fff',
              color: '#111',
              border: '2px solid #111',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ═══ AI IMPACT SCORE BANNER ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '8px',
          background: `linear-gradient(135deg, ${impactColor}22, ${impactColor}44)`,
          border: `2px solid ${impactColor}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: impactColor }}>{impactScore}</span>
          <span style={{ fontSize: '0.5rem', color: impactColor, letterSpacing: '0.5px' }}>/10</span>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: impactColor, fontWeight: 900 }}>
            {impactLabel}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#111', marginTop: '4px', fontWeight: 600 }}>
            AI Intelligence Score — Ticari Etki Analizi
          </div>
        </div>
      </div>

      {/* ═══ 1. AI INSIGHT: BU HABER NE ANLAMA GELİYOR? ═══ */}
      {props.executiveSummary && props.executiveSummary.length > 0 && (
        <div style={{ padding: '2rem 0', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{
            fontSize: '1.1rem', letterSpacing: '1px', color: '#111',
            fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ width: '12px', height: '12px', background: '#111', display: 'inline-block' }}></span>
            AI INSIGHT: BU HABER NE ANLAMA GELİYOR?
          </div>
          {props.executiveSummary.map((item, i) => (
            <p key={i} style={{ color: '#000', fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '1rem', paddingLeft: '1.5rem', borderLeft: '4px solid #CC0000' }}>
              {item}
            </p>
          ))}
        </div>
      )}

      {/* ═══ 2. TRADE ANGLE: KİM PARA KAZANIR? ═══ */}
      {props.businessOpportunities && props.businessOpportunities.length > 0 && (
        <div style={{ padding: '2rem 0', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{
            fontSize: '1.1rem', letterSpacing: '1px', color: '#CC0000',
            fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ width: '12px', height: '12px', background: '#CC0000', display: 'inline-block' }}></span>
            TRADE ANGLE: KİM PARA KAZANIR?
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '2rem', color: '#111', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>
            {props.businessOpportunities.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.75rem' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══ 3. ACTION: NE YAPILMALI? ═══ */}
      {props.actionItems && props.actionItems.length > 0 && (
        <div style={{ padding: '2rem 0', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{
            fontSize: '1.1rem', letterSpacing: '1px', color: '#111',
            fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ width: '12px', height: '12px', background: '#CC0000', display: 'inline-block' }}></span>
            ACTION PLAN: NE YAPILMALI?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {props.actionItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', background: '#FAFAFA', padding: '1.5rem', borderLeft: '4px solid #111' }}>
                <span style={{
                  color: '#CC0000', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0,
                }}>
                  {i + 1}.
                </span>
                <span style={{ color: '#111', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BUYER MINDSET ═══ */}
      {props.buyerMindset && (props.buyerMindset.german_buyer || props.buyerMindset.uae_wholesaler) && (
        <div style={{ padding: '2rem 0', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{
            fontSize: '1.1rem', letterSpacing: '1px', color: '#111',
            fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ width: '12px', height: '12px', background: '#111', display: 'inline-block' }}></span>
            🧠 BUYER MINDSET (İTHALATÇI GÖZÜNDEN)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
            {props.buyerMindset.german_buyer && (
              <div style={{
                padding: '1.5rem', background: '#FAFAFA',
                border: '1px solid #111', borderRadius: '0',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#CC0000', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  🇩🇪 GERMAN BUYER (Avrupa Segmenti)
                </div>
                <div style={{ fontSize: '1rem', color: '#111', lineHeight: 1.6, fontWeight: 500 }}>
                  {props.buyerMindset.german_buyer}
                </div>
              </div>
            )}
            {props.buyerMindset.uae_wholesaler && (
              <div style={{
                padding: '1.5rem', background: '#FAFAFA',
                border: '1px solid #111', borderRadius: '0',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#CC0000', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  🇦🇪 UAE WHOLESALER (Orta Doğu Segmenti)
                </div>
                <div style={{ fontSize: '1rem', color: '#111', lineHeight: 1.6, fontWeight: 500 }}>
                  {props.buyerMindset.uae_wholesaler}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TREND TAHMİNİ ═══ */}
      {props.trendPrediction && (
        <div style={{ padding: '2rem 0', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'flex-start',
            padding: '1.5rem', background: '#FCF8ED',
            borderLeft: '4px solid #F59E0B',
          }}>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
            <div>
              <div style={{ fontSize: '0.9rem', letterSpacing: '2px', color: '#D97706', fontWeight: 900 }}>
                3 AYLIK TREND TAHMİNİ (PROJECTION)
              </div>
              <div style={{ fontSize: '1.1rem', color: '#111', marginTop: '0.5rem', fontWeight: 600, lineHeight: 1.6 }}>
                {props.trendPrediction}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FIRSAT RADARI ═══ */}
      {/* Not: Action Area veya AI Commentary üzerinden Brutalist stilde gösteriliyor, burası kaldırıldı. */}

      {/* ═══ LEAD YAKALAMA BLOĞU ═══ */}
      {props.leadData && (
        <div style={{
          marginTop: '2rem', padding: '2rem',
          background: '#000', color: '#fff',
          border: '1px solid #111', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1rem', letterSpacing: '2px', color: '#22C55E',
            fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase'
          }}>
            🔥 THIS ARTICLE CAN BRING YOU CUSTOMERS
          </div>

          {/* Fırsat Metrikleri */}
          <div style={{ display: 'flex', gap: '3rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {props.leadData.demand_growth && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                  {props.leadData.demand_growth}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', letterSpacing: '2px', marginTop: '4px' }}>DEMAND GROWTH</div>
              </div>
            )}
            {props.leadData.target_country && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FCD34D' }}>
                  {props.leadData.target_country}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', letterSpacing: '2px', marginTop: '4px' }}>TARGET MARKET</div>
              </div>
            )}
            {props.leadData.price_segment && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                  {props.leadData.price_segment}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', letterSpacing: '2px', marginTop: '4px' }}>SEGMENT</div>
              </div>
            )}
          </div>

          {/* Top Ürünler */}
          {props.leadData.top_products && props.leadData.top_products.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {props.leadData.top_products.map((p, i) => (
                <span key={i} style={{
                  padding: '0.25rem 0.75rem', background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px',
                  fontSize: '0.7rem', color: '#93c5fd',
                }}>
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* CTA Butonu */}
          {!showLeadForm && !formSubmitted && (
            <button
              onClick={() => setShowLeadForm(true)}
              style={{
                width: '100%', padding: '0.85rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {props.leadData.lead_cta || `Connect with ${props.leadData.target_country || 'global'} buyers`}
            </button>
          )}

          {/* Lead Form */}
          {showLeadForm && !formSubmitted && (
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  required placeholder="Your Name *"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={inputStyle}
                />
                <input
                  required placeholder="Company *"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  style={inputStyle}
                />
                <input
                  required placeholder="WhatsApp *"
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  style={inputStyle}
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={inputStyle}
                />
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{...inputStyle, appearance: 'none' as const}}
                >
                  <option value="buyer">I am a Buyer</option>
                  <option value="manufacturer">I am a Manufacturer</option>
                  <option value="wholesaler">I am a Wholesaler</option>
                  <option value="retailer">I am a Retailer</option>
                  <option value="agent">I am an Agent</option>
                </select>
                <input
                  placeholder="Products (curtain, towel...)"
                  value={formData.products}
                  onChange={e => setFormData({...formData, products: e.target.value})}
                  style={inputStyle}
                />
              </div>
              {/* Honeypot */}
              <input type="text" name="_hp_field" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <button
                type="submit"
                disabled={formLoading}
                style={{
                  width: '100%', marginTop: '0.75rem', padding: '0.85rem',
                  background: formLoading ? '#475569' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none', borderRadius: '8px', color: '#fff',
                  fontSize: '0.85rem', fontWeight: 700, cursor: formLoading ? 'wait' : 'pointer',
                }}
              >
                {formLoading ? 'Submitting...' : '🚀 Find My Business Partners'}
              </button>
            </form>
          )}

          {/* Başarılı */}
          {formSubmitted && (
            <div style={{
              textAlign: 'center', padding: '1.5rem',
              background: 'rgba(34,197,94,0.08)', borderRadius: '8px',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>
                Registration Complete!
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Our AI is matching you with relevant partners. We will contact you within 24 hours.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ AI YORUM ═══ */}
      {props.aiCommentary && (
        <div style={{
          marginTop: '1rem', padding: '1rem',
          borderLeft: '3px solid #64748b',
          background: 'rgba(100,116,139,0.05)',
          borderRadius: '0 6px 6px 0',
        }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '2px', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
            🤖 AI COMMENTARY
          </div>
          <div style={{ color: '#333', fontSize: '0.85rem', lineHeight: 1.6, fontStyle: 'italic' }}>
            {props.aiCommentary}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.75rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

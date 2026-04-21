'use client';

import React, { useEffect, useState } from 'react';

/**
 * TRTEX Opportunity Radar Widget
 * 
 * Ana sayfada gösterilecek "Günün Fırsatları" + "Bugün Perdede Ne Oluyor?" paneli.
 * Firestore'dan live data çeker (zero-cache, force-dynamic).
 */

interface OpportunityItem {
  id: string;
  opportunity: string;
  risk: string;
  action: string;
  confidence: number;
  country?: string;
  flag?: string;
  category?: string;
}

interface SentimentData {
  risk: { label: string; detail: string };
  opportunity: { label: string; detail: string };
  watch: { label: string; detail: string };
}

interface RadarProps {
  apiEndpoint?: string; // Varsayılan: /api/aloha/radar
}

export default function OpportunityRadarWidget({ apiEndpoint }: RadarProps) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [curtainNews, setCurtainNews] = useState<{title: string; category: string; slug: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRadarData();
  }, []);

  const loadRadarData = async () => {
    try {
      const res = await fetch(apiEndpoint || '/api/aloha/radar', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
        setSentiment(data.sentiment || null);
        setCurtainNews(data.curtain_news || []);
      }
    } catch {
      // Veri yüklenemezse statik fallback göster
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: '#fff',
      borderRadius: '0',
      border: '1px solid #000',
      overflow: 'hidden',
    }}>
      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: '1rem 1.25rem',
        background: '#FDFBF7',
        borderBottom: '1px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '0.6rem', letterSpacing: '3px', color: '#999', fontWeight: 700 }}>
            TRTEX İSTİHBARAT
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#000', marginTop: '2px' }}>
            Fırsat Radarı
          </div>
        </div>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#22c55e', boxShadow: '0 0 8px #22c55e',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      {/* ═══ GLOBAL SENTIMENT (Risk/Fırsat/Dikkat) ═══ */}
      {sentiment && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid #eee',
        }}>
          <SentimentCell
            emoji="🔴" label="RİSK" color="#ef4444"
            title={sentiment.risk.label} detail={sentiment.risk.detail}
          />
          <SentimentCell
            emoji="🟢" label="FIRSAT" color="#22c55e"
            title={sentiment.opportunity.label} detail={sentiment.opportunity.detail}
            borderX
          />
          <SentimentCell
            emoji="🟡" label="TAKİP" color="#f59e0b"
            title={sentiment.watch.label} detail={sentiment.watch.detail}
          />
        </div>
      )}

      {/* ═══ BUGÜN PERDEDE NE OLUYOR? ═══ */}
      {curtainNews.length > 0 && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eee' }}>
          <div style={{
            fontSize: '0.6rem', letterSpacing: '2px', color: '#a78bfa',
            fontWeight: 700, marginBottom: '0.75rem',
          }}>
            🧭 GÜNLÜK PERDE İSTİHBARATI
          </div>
          {curtainNews.slice(0, 3).map((news, i) => (
            <a
              key={i}
              href={`/news/${news.slug}`}
              style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                padding: '0.5rem 0', textDecoration: 'none',
                borderBottom: i < 2 ? '1px solid #eee' : 'none',
              }}
            >
              <span style={{ color: '#a78bfa', fontSize: '0.7rem' }}>▸</span>
              <span style={{
                color: '#333', fontSize: '0.8rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {news.title}
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: '0.6rem', color: '#999',
                background: '#f5f5f0', padding: '0.15rem 0.4rem',
                borderRadius: '3px', whiteSpace: 'nowrap',
              }}>
                {news.category}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* ═══ FIRSAT LİSTESİ ═══ */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{
          fontSize: '0.6rem', letterSpacing: '2px', color: '#f97316',
          fontWeight: 700, marginBottom: '0.75rem',
        }}>
          🎯 GÜNÜN FIRSATLARI
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
            Radar verileri yükleniyor...
          </div>
        ) : opportunities.length === 0 ? null : (
          <>
            <div style={{ borderBottom: '2px solid #CC0000', paddingBottom: '0.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>Ticari Fırsat Radarı</h2>
              <a href="/radar" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textDecoration: 'none' }}>Tüm Fırsatlar →</a>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem',
            padding: '0.5rem 0'
          }}>
            {opportunities.map((opp, i) => (
              <div key={opp.id || i} style={{
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                padding: '1.25rem',
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}>
                {/* Confidence & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', padding: '0.25rem 0.6rem', background: '#F3F4F6', color: '#4B5563', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {opp.category || 'İSTİHBARAT'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: opp.confidence >= 80 ? '#166534' : '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opp.confidence >= 80 ? '#22c55e' : '#f59e0b', boxShadow: opp.confidence >= 80 ? '0 0 6px #22c55e' : '0 0 6px #f59e0b' }} />
                    GÜVEN: %{opp.confidence || 75}
                  </span>
                </div>
                
                {/* Opportunity */}
                <div style={{ background: '#F0FDF4', borderLeft: '4px solid #22C55E', padding: '0.75rem 1rem', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#166534', marginBottom: '0.35rem', letterSpacing: '1px' }}>FIRSAT</div>
                  <div style={{ fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5, fontWeight: 600 }}>{opp.opportunity || 'Bölgesel fırsat potansiyeli mevcut.'}</div>
                </div>

                {/* Risk */}
                <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '0.75rem 1rem', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#991B1B', marginBottom: '0.35rem', letterSpacing: '1px' }}>RİSK</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.5 }}>{opp.risk || 'Yüksek rekabet veya piyasa oynaklığı.'}</div>
                </div>

                {/* Action */}
                <div style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '0.75rem 1rem', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E40AF', marginBottom: '0.35rem', letterSpacing: '1px' }}>AKSİYON</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5, fontWeight: 700 }}>{opp.action || 'Riskleri gözeterek pazarı izleyin.'}</div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {/* ═══ CTA ═══ */}
      <div style={{
        padding: '1rem 1.25rem',
        background: '#FDFBF7',
        borderTop: '1px solid #000',
        textAlign: 'center',
      }}>
        <a
          href="/opportunities"
          style={{
            color: '#60a5fa', textDecoration: 'none', fontSize: '0.8rem',
            fontWeight: 600, letterSpacing: '0.5px',
          }}
        >
          Tam Fırsat Haritası →
        </a>
      </div>
    </div>
  );
}

// ═══ Alt Bileşenler ═══

function SentimentCell({ emoji, label, color, title, detail, borderX }: {
  emoji: string; label: string; color: string;
  title: string; detail: string; borderX?: boolean;
}) {
  return (
    <div style={{
      padding: '0.75rem 1rem', textAlign: 'center',
      borderLeft: borderX ? '1px solid #eee' : 'none',
      borderRight: borderX ? '1px solid #eee' : 'none',
    }}>
      <div style={{ fontSize: '0.55rem', letterSpacing: '2px', color, fontWeight: 700 }}>
        {emoji} {label}
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000', marginTop: '0.25rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.65rem', color: '#666', marginTop: '2px' }}>
        {detail}
      </div>
    </div>
  );
}

function DemandIndicator({ type }: { type: string }) {
  const config: Record<string, { color: string; label: string; arrow: string }> = {
    rising:    { color: '#22c55e', label: 'RISING', arrow: '↑' },
    stable:    { color: '#f59e0b', label: 'STABLE', arrow: '→' },
    declining: { color: '#ef4444', label: 'DECLINE', arrow: '↓' },
  };
  const c = config[type] || config.stable;

  return (
    <span style={{
      fontSize: '0.55rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
      background: `${c.color}15`, color: c.color, fontWeight: 700,
    }}>
      {c.arrow} {c.label}
    </span>
  );
}

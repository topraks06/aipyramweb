'use client';
import React from 'react';

interface WorldRadarSectionProps {
  radarStream: any;
  uzakDoguRadari: any;
  utils: {
    getLink: (path: string, slug?: string) => string;
    getTitle: (a: any) => string;
  };
}

export default function WorldRadarSection({ radarStream, uzakDoguRadari, utils }: WorldRadarSectionProps) {
  const { getLink, getTitle } = utils;

  return (
    <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '3rem 0' }}>
      <div className="tc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <div className="section-sub">🌍 KÜRESEL İSTİHBARAT</div>
            <h2 className="section-title">Dünya Radarı</h2>
          </div>
          <a href={getLink('radar')} className="link-arrow">Tüm Sinyaller →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '⚠️', label: 'RİSK ANALİZİ', desc: radarStream?.risk ? (getTitle(radarStream.risk) || radarStream.risk.summary || 'Hammadde fiyat dalgalanmaları ve tedarik zinciri riskleri') : 'Hammadde fiyat dalgalanmaları ve tedarik zinciri riskleri', color: '#DC2626', link: radarStream?.risk?.slug },
            { icon: '💡', label: 'FIRSAT RADARI', desc: radarStream?.opportunity ? (getTitle(radarStream.opportunity) || radarStream.opportunity.summary || 'Yeni pazarlar ve büyüyen segmentler') : 'Yeni pazarlar ve büyüyen segmentler', color: '#16A34A', link: radarStream?.opportunity?.slug },
            { icon: '📡', label: 'PİYASA SİNYALLERİ', desc: radarStream?.signal ? (getTitle(radarStream.signal) || radarStream.signal.summary || 'Küresel pazarlardan canlı ticari sinyaller') : 'Küresel pazarlardan canlı ticari sinyaller', color: '#2563EB', link: radarStream?.signal?.slug },
            { icon: '📈', label: 'TREND TAHMİNLERİ', desc: uzakDoguRadari ? (getTitle(uzakDoguRadari) || uzakDoguRadari.summary || '2026/2027 sezon trendleri ve tüketici davranışı analizi') : '2026/2027 sezon trendleri ve tüketici davranışı analizi', color: '#7C3AED', link: uzakDoguRadari?.slug },
          ].map((item, i) => (
            <a href={item.link ? getLink('news', item.link) : getLink('radar')} key={i} className="card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', borderLeft: `3px solid ${item.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: item.color, letterSpacing: '0.1em' }}>{item.label}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>{typeof item.desc === 'string' && item.desc.length > 120 ? item.desc.substring(0, 120) + '…' : item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

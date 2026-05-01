'use client';
import React from 'react';

interface NewsGridSectionProps {
  uniquePool: any[];
  tickerItems: any[];
  utils: {
    getLink: (path: string, slug?: string) => string;
    getImg: (a: any) => string;
    getTitle: (a: any) => string;
  };
}

export default function NewsGridSection({ uniquePool, tickerItems, utils }: NewsGridSectionProps) {
  const { getLink, getImg, getTitle } = utils;

  return (
    <section style={{ padding: '3rem 0' }}>
      <div className="tc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <div className="section-sub">📰 GÜNCEL İSTİHBARAT</div>
            <h2 className="section-title">Son Haberler</h2>
          </div>
          <a href={getLink('news')} className="link-arrow">Tüm Haberler →</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: uniquePool.length > 0 ? '2fr 1fr' : '1fr', gap: '2rem' }}>
          {/* SOL: Haber Kartları */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {uniquePool.length > 0 ? uniquePool.slice(0, 6).map((a: any) => (
              <a href={getLink('news', a.slug || a.id)} key={a.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                <img src={getImg(a)} alt="" style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                    {a.category?.toUpperCase() || 'SEKTÖREL'}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.3rem', color: '#111827' }}>{getTitle(a)}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{a.summary}</p>
                </div>
              </a>
            )) : (
              <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📡</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>İstihbarat Motoru Çalışıyor</h3>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  ALOHA AI motoru küresel ev tekstili kaynaklarını tarayarak size özel haberler üretiyor.
                </p>
                <a href={getLink('news')} style={{ display: 'inline-block', padding: '0.6rem 1.5rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>Haber Arşivine Git →</a>
              </div>
            )}
          </div>

          {/* SAĞ: Sidebar */}
          {uniquePool.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Piyasa Verileri */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '1rem' }}>📊 PİYASA VERİLERİ</div>
              {tickerItems.length > 0 ? tickerItems.filter((t: any) => !t.isBreaking && !t.isCountdown).slice(0, 4).map((t: any, i: number) => {
                const dirColor = t.direction === 'up' ? 'var(--go)' : t.direction === 'down' ? 'var(--re)' : 'var(--wa)';
                const arrow = t.direction === 'up' ? '△' : t.direction === 'down' ? '▽' : '–';
                return (
                  <div key={t.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{t.label}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'var(--m)' }}>
                      {t.change !== undefined && <span style={{ fontSize: '0.7rem', color: dirColor }}>{arrow}{Math.abs(t.change).toFixed(1)}%</span>}
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>{typeof t.value === 'number' ? t.value.toLocaleString('en-US') : t.value}{t.unit ? ` ${t.unit}` : ''}</span>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textAlign: 'center', padding: '1rem 0' }}>Piyasa verileri yükleniyor...</div>
              )}
            </div>

            {/* Trend Haberler */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '1rem' }}>🔥 TREND</div>
              {uniquePool.slice(6, 11).map((a: any, i: number) => (
                <a href={getLink('news', a.slug || a.id)} key={a.id} style={{ display: 'block', padding: '0.5rem 0', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none', textDecoration: 'none' }}>
                  <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#D1D5DB', marginRight: '0.5rem' }}>0{i+1}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>{getTitle(a)}</span>
                </a>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

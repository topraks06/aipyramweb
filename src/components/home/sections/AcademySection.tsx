'use client';
import React from 'react';

interface AcademySectionProps {
  academyArticles: any[];
  uniquePool: any[];
  utils: {
    getLink: (path: string, slug?: string) => string;
    getImg: (a: any) => string;
    getTitle: (a: any) => string;
  };
}

export default function AcademySection({ academyArticles, uniquePool, utils }: AcademySectionProps) {
  const { getLink, getImg, getTitle } = utils;

  return (
    <section style={{ padding: '3rem 0', borderTop: '1px solid #E5E7EB' }}>
      <div className="tc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <div className="section-sub">🎓 SEKTÖR EĞİTİMİ</div>
            <h2 className="section-title">Akademi</h2>
          </div>
          <a href={getLink('academy')} className="link-arrow">Akademi'ye Git →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {(academyArticles.length > 0 ? academyArticles : uniquePool.slice(0, 4)).map((a: any) => (
            <a href={getLink('news', a.slug || a.id)} key={a.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <img src={getImg(a)} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.6rem', color: 'var(--go)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>EĞİTİM</div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3, color: '#111827' }}>{getTitle(a)}</h4>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

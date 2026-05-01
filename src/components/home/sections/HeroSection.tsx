'use client';
import React from 'react';

interface HeroSectionProps {
  heroArticle: any;
  totalTenders: number;
  totalStock: number;
  totalCapacity: number;
  safeLang: string;
  utils: {
    getLink: (path: string, slug?: string) => string;
    getImg: (a: any) => string;
    getTitle: (a: any) => string;
  };
}

export default function HeroSection({
  heroArticle,
  totalTenders,
  totalStock,
  totalCapacity,
  safeLang,
  utils,
}: HeroSectionProps) {
  const { getLink, getTitle, getImg } = utils;

  return (
    <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
      <div className="tc" style={{ padding: '3rem 2rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 55%', minWidth: '300px' }}>
          {heroArticle ? (
            <>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                🔴 {heroArticle.category?.toUpperCase() || 'SON DAKİKA'}
              </div>
              <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, color: '#111827', marginBottom: '1rem' }}>
                {getTitle(heroArticle)}
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#4B5563', marginBottom: '1.5rem', maxWidth: '90%' }}>
                {heroArticle.summary}
              </p>
              <a href={getLink('news', heroArticle.slug || heroArticle.id)} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>
                {safeLang === 'tr' ? 'Haberi Oku →' : 'Read Article →'}
              </a>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                🔴 CANLI İSTİHBARAT TERMİNALİ
              </div>
              <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, color: '#111827', marginBottom: '1rem' }}>
                Ev Tekstili Sektörünün Otonom Beyni
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#4B5563', marginBottom: '1.5rem', maxWidth: '90%' }}>
                TRTEX, yapay zeka ile 7/24 küresel piyasaları tarar — ihaleler, pazar sinyalleri, trend tahminleri ve tedarikçi eşleştirmeleri tek noktadan sunulur.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href={getLink('tenders')} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>Canlı İhaleler →</a>
                <a href={getLink('news')} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#FFF', color: '#111827', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none', border: '1px solid #E5E7EB' }}>Son Haberler →</a>
              </div>
            </>
          )}
        </div>
        <div style={{ flex: '1 1 35%', minWidth: '280px', maxHeight: '320px' }}>
          {heroArticle ? (
            <img src={getImg(heroArticle)} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E5E7EB' }} />
          ) : (
            <div style={{ width: '100%', height: '300px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#FFF', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: '3rem', fontWeight: 900, color: '#CC0000', marginBottom: '0.5rem' }}>TRTEX</div>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#94A3B8', marginBottom: '1.5rem' }}>INTELLIGENCE TERMINAL</div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>{totalTenders + totalStock + totalCapacity || '30+'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Aktif Fırsat</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>8</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Dil</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>24/7</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>AI Motor</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

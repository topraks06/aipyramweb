'use client';
import React from 'react';

interface CtaSectionProps {
  basePath: string;
  safeLang: string;
}

export default function CtaSection({ basePath, safeLang }: CtaSectionProps) {
  return (
    <section style={{ background: 'linear-gradient(135deg, #CC0000 0%, #991B1B 100%)', color: '#FFFFFF', padding: '4rem 0' }}>
      <div className="tc" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Sektörün Nabzını Tutun</h2>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: '550px', margin: '0 auto 2rem', lineHeight: 1.7 }}>Ücretsiz üye olun — AI destekli ihale uyarıları, piyasa raporları ve ticaret fırsatlarını ilk siz görün.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={`${basePath}/register?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', background: '#FFFFFF', color: '#CC0000', fontWeight: 800, fontSize: '0.95rem', borderRadius: '8px', textDecoration: 'none', transition: 'transform 0.2s' }}>Ücretsiz Kayıt →</a>
          <a href={`${basePath}/login?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', background: 'transparent', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', borderRadius: '8px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>Giriş Yap</a>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { num: '30+', label: 'Canlı İhale' },
            { num: '15K+', label: 'Günlük Veri' },
            { num: '8', label: 'Dil Desteği' },
            { num: '24/7', label: 'AI Motor' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900 }}>{s.num}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

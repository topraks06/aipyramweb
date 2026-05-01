'use client';
import React from 'react';

export default function EcosystemSection() {
  return (
    <section style={{ padding: '4rem 0', borderTop: '1px solid #E5E7EB' }}>
      <div className="tc">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="section-sub">🌐 AIPyram EKOSİSTEMİ</div>
          <h2 className="section-title">Küresel Tekstil Ağı</h2>
          <p style={{ fontSize: '0.95rem', color: '#6B7280', maxWidth: '550px', margin: '0.5rem auto 0', lineHeight: 1.6 }}>Türkiye'den dünyaya — 6 platformda entegre ticaret, tasarım ve istihbarat.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'TRTex.com', role: 'İstihbarat Terminali', desc: 'B2B haberler, ihaleler, piyasa', color: '#CC0000', href: '/' },
            { name: 'icmimar.ai', role: 'Tasarım & ERP', desc: 'AI render, B2B tasarım mutfağı', color: '#7C3AED', href: 'https://icmimar.ai' },
            { name: 'Perde.ai', role: 'TR Marketplace', desc: 'Türkiye B2C mağaza', color: '#2563EB', href: 'https://perde.ai' },
            { name: 'Hometex.ai', role: '365 Gün Fuar', desc: 'Sanal fuar & showroom', color: '#16A34A', href: 'https://hometex.ai' },
            { name: 'Heimtex.ai', role: 'Trend & Dergi', desc: 'Pantone, moda vizyonu', color: '#F59E0B', href: 'https://heimtex.ai' },
            { name: 'Vorhang.ai', role: 'DACH Pazarı', desc: 'Almanya/Avusturya/İsviçre', color: '#EC4899', href: 'https://vorhang.ai' },
          ].map((node, i) => (
            <a href={node.href} key={i} className="card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', borderTop: `3px solid ${node.color}` }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#111827', marginBottom: '0.15rem' }}>{node.name}</h4>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', fontWeight: 700, color: node.color, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{node.role.toUpperCase()}</div>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5 }}>{node.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

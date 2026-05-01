'use client';
import React from 'react';

interface FairCalendarSectionProps {
  activeFairs: any[];
  utils: {
    getLink: (path: string, slug?: string) => string;
  };
}

export default function FairCalendarSection({ activeFairs, utils }: FairCalendarSectionProps) {
  const { getLink } = utils;

  return (
    <section style={{ padding: '3rem 0' }}>
      <div className="tc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <div className="section-sub">📅 YAKLAŞAN ETKİNLİKLER</div>
            <h2 className="section-title">Fuar Takvimi</h2>
          </div>
          <a href={getLink('fairs')} className="link-arrow">Tüm Fuarlar →</a>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {activeFairs && activeFairs.length > 0 ? activeFairs.slice(0, 6).map((f: any, i: number) => (
            <div key={i} className="card" style={{ minWidth: '250px', padding: '1.25rem', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, marginBottom: '0.5rem' }}>{f.date || f.startDate || '2026'}</div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.3rem', lineHeight: 1.3 }}>{f.name || f.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{f.location || f.city || ''}</p>
              {f.daysLeft != null && <div style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginTop: '0.5rem' }}>{f.daysLeft} gün kaldı</div>}
            </div>
          )) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '2rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1rem' }}>Fuar takvimi güncelleniyor. En güncel etkinlik listesi için aşağıdaki bağlantıyı ziyaret edin.</p>
              <a href={getLink('fairs')} style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>Fuar Takvimi'ne Git →</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

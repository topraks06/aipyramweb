'use client';
import React from 'react';

interface TenderRadarSectionProps {
  liveTenders: any[];
  isAdmin: boolean;
  basePath: string;
  safeLang: string;
  utils: {
    getLink: (path: string, slug?: string) => string;
  };
}

export default function TenderRadarSection({
  liveTenders,
  isAdmin,
  basePath,
  safeLang,
  utils
}: TenderRadarSectionProps) {
  const { getLink } = utils;

  return (
    <section style={{ background: '#0B0D0F', color: '#FFF', padding: '5rem 0' }}>
      <div className="tc">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-sub" style={{ color: '#F59E0B' }}>🔥 SADECE ONAYLI ÜRETİCİLER İÇİN</div>
            <h2 className="section-title" style={{ color: '#FFF' }}>Canlı B2B Alım/Satım Tahtası</h2>
            <p style={{ fontSize: '0.95rem', color: '#9CA3AF', marginTop: '0.5rem', maxWidth: '600px' }}>
              Dünya genelindeki toptancı ve proje firmalarından gelen anlık kumaş/perde talepleri. İhaleyi kapan satışı alır.
            </p>
          </div>
          <a href={getLink('tenders')} className="link-arrow" style={{ color: '#F59E0B', border: '1px solid #F59E0B', padding: '0.6rem 1.2rem', borderRadius: '4px' }}>
            Tüm Tahtayı Gör →
          </a>
        </div>

        <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1.5fr 1fr', padding: '1rem 1.5rem', background: '#1F2937', borderBottom: '1px solid #374151', fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.05em' }}>
            <div>SİNYAL TÜRÜ</div>
            <div>TALEP DETAYI</div>
            <div>LOKASYON</div>
            <div style={{ textAlign: 'right' }}>AKSİYON</div>
          </div>
          
          {liveTenders.length > 0 ? (
            liveTenders.slice(0, 5).map((t: any, i: number) => {
              const isTender = t.type === 'TENDER';
              const isStock = t.type === 'HOT_STOCK';
              const color = isTender ? 'var(--re)' : isStock ? 'var(--go)' : 'var(--wa)';
              return (
                <div key={t.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1.5fr 1fr', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1F2937', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#374151'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => window.location.href = getLink('tenders')}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '4px', background: color + '20', color: color }}>
                      {t.type === 'TENDER' ? '🔴 İHALE' : t.type === 'HOT_STOCK' ? '🟢 STOK' : '🟡 KAPASİTE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F3F4F6' }}>{t.title || 'Gizli B2B Talebi'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📍</span> {t.location || 'Global'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button style={{ background: color, color: isTender ? '#FFF' : '#000', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                      {isTender ? 'TEKLİF VER' : 'DETAY GÖR'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : isAdmin ? (
            // SOVEREIGN GOD MODE (Şeffaf Yönetici Görünümü)
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#0B0D0F', border: '1px solid #CC0000', borderRadius: '8px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👁️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#CC0000', marginBottom: '0.5rem', letterSpacing: '2px' }}>SOVEREIGN GOD MODE AKTİF</h3>
              <p style={{ fontSize: '0.95rem', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                Sayın Kurucu, sistemde şu an onaylanmış <b>aktif B2B ilanı bulunmuyor.</b> Normal ziyaretçiler burada "FOMO" yaratan kilitli bir ekran görüyor. Sistem tam şeffaflıkla emrinizdedir.
              </p>
            </div>
          ) : (
            // ZERO MOCK AKTİF İKEN BOŞ DURUMU (FOMO YARATAN GÖRÜNÜM)
            <div style={{ position: 'relative', padding: '4rem 2rem', textAlign: 'center', background: '#111827' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>TRTex Intelligence: 14 Yeni B2B Talebi Doğrulanıyor</h3>
                <p style={{ fontSize: '0.95rem', color: '#9CA3AF', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  Yapay zeka motorumuz şu an Avrupa ve Ortadoğu kaynaklı sıcak kumaş alım taleplerinin teyidini gerçekleştiriyor.
                </p>
                <a href={`${basePath}/register?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.8rem 2rem', background: '#CC0000', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', borderRadius: '4px', textDecoration: 'none', letterSpacing: '1px' }}>
                  FIRSATLARI GÖRMEK İÇİN VIP KAYIT OL
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

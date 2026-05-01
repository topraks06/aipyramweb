'use client';
import React from 'react';

export default function ValuePropositionSection() {
  return (
    <section style={{ background: '#111827', color: '#FFFFFF', padding: '4rem 0' }}>
      <div className="tc">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>💎 NEDEN TRTEX?</div>
          <h2 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '0.75rem' }}>Tek Platformda Tüm Sektör İstihbaratı</h2>
          <p style={{ fontSize: '1rem', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>Otonom yapay zeka ile desteklenen TRTEX, ev tekstili sektöründe haber, ihale, pazar analizi ve ticaret fırsatlarını tek noktadan sunar.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📡', title: 'Otonom İstihbarat', desc: '7/24 çalışan AI motorumuz küresel sektör verilerini tarar, analiz eder ve size özel raporlar üretir.', accent: '#3B82F6' },
            { icon: '🔴', title: 'Canlı İhale Radarı', desc: 'Avrupa, Ortadoğu ve Asya\'daki otel, hastane projelerinde aktif ihaleleri anında keşfedin.', accent: '#DC2626' },
            { icon: '📊', title: 'Piyasa Verileri', desc: 'USD/TRY, pamuk, polyester, navlun fiyatlarını anlık takip edin. Alım kararlarını veriye dayalı verin.', accent: '#16A34A' },
            { icon: '🌍', title: '8 Dilde Küresel Erişim', desc: 'Türkçe, İngilizce, Almanca, Rusça, Çince, Arapça, İspanyolca ve Fransızca tam destek.', accent: '#F59E0B' },
            { icon: '🤝', title: 'Tedarikçi Eşleştirme', desc: 'AI destekli matchmaking ile üretici, toptancı ve alıcı arasındaki mesafeyi sıfıra indirin.', accent: '#8B5CF6' },
            { icon: '🔒', title: 'Sovereign Güvenlik', desc: 'Google Cloud altyapısı üzerinde çalışan tam şifreli, KVKK uyumlu B2B veri güvenliği.', accent: '#EC4899' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '10px', padding: '1.5rem', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: item.accent, letterSpacing: '0.08em' }}>{item.title.toUpperCase()}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

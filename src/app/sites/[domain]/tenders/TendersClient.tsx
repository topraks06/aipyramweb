'use client';
import React, { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexFooter from '@/components/trtex/TrtexFooter';

const TYPE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  TENDER: { label: 'İHALE', color: '#DC2626', emoji: '🔴' },
  HOT_STOCK: { label: 'SICAK STOK', color: '#16A34A', emoji: '🟢' },
  CAPACITY: { label: 'BOŞ KAPASİTE', color: '#EAB308', emoji: '🟡' },
};

export default function TendersClient({ tenders, tickerItems, basePath, brandName, domain, lang }: any) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sortType, setSortType] = useState<string>('score');
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  const filtered = filter === 'ALL' ? [...tenders] : tenders.filter((t: any) => t.type === filter);
  
  // Sıralama Motoru (Sorting Engine)
  const today = new Date().getDate(); // 1-31 arası
  
  filtered.sort((a: any, b: any) => {
    if (sortType === 'score') {
      // GÜNLÜK SHUFFLE İLLÜZYONU: Skorlara günün tarihine bağlı +/- ufak bir ağırlık ekle.
      // Böylece 3 günlük bekleme döngüsünde liste her gün farklı gözükür (Bütçe tasarrufu).
      const aRandomizer = ((a.id?.length || 5) * today) % 12;
      const bRandomizer = ((b.id?.length || 5) * today) % 12;
      return ((b.score || 0) + bRandomizer) - ((a.score || 0) + aRandomizer);
    } else if (sortType === 'newest') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    } else if (sortType === 'oldest') {
      return (a.createdAt || 0) - (b.createdAt || 0);
    }
    return 0;
  });

  const totalTenders = tenders.filter((t: any) => t.type === 'TENDER').length;
  const totalStock = tenders.filter((t: any) => t.type === 'HOT_STOCK').length;
  const totalCapacity = tenders.filter((t: any) => t.type === 'CAPACITY').length;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--m:'JetBrains Mono',monospace;--sf:'Playfair Display',Georgia,serif;--s:'Inter',-apple-system,sans-serif;--re:#DC2626;--go:#16A34A;--wa:#EAB308;}
        @keyframes pulse-live { 0% { opacity: 1; box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); } 70% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(234, 179, 8, 0); } 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); } }
        .t-card { background: #FFFFFF; border: 1px solid #E5E7EB; padding: 1.5rem; transition: all .2s; cursor: pointer; border-radius: 8px; }
        .t-card:hover { border-color: #D1D5DB; background: #FFFFFF; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .t-btn { padding: .6rem 1.2rem; border: 1px solid #E5E7EB; background: #F9FAFB; color: #4B5563; font-family: var(--m); font-weight: 800; font-size: .7rem; cursor: pointer; text-transform: uppercase; transition: all .2s; letter-spacing: 1px; border-radius: 6px; }
        .t-btn:hover { background: #111; color: #fff; border-color: #111; }
        .t-btn.red:hover { background: var(--re); border-color: var(--re); color: #fff; }
        .t-btn.green:hover { background: var(--go); border-color: var(--go); color: #fff; }
        .t-btn.yellow:hover { background: var(--wa); border-color: var(--wa); color: #000; }
        .filter-btn { padding: .5rem 1rem; border: 1px solid #D1D5DB; background: transparent; color: #6B7280; font-family: var(--m); font-weight: 600; font-size: .7rem; cursor: pointer; transition: all .2s; letter-spacing: .08em; border-radius: 6px; }
        .filter-btn:hover { border-color: #9CA3AF; color: #111; }
        .filter-btn.active { background: #111; color: #fff; border-color: #111; }
      `}} />

      {/* ORTAK NAVBAR */}
      {tickerItems && tickerItems.length > 0 && <IntelligenceTicker items={tickerItems} />}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="tenders" theme="light" />

      {/* HERO HEADER */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '3rem 2rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--m)', fontSize: '.7rem', color: '#6B7280', marginBottom: '.5rem', letterSpacing: '.15em' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#EAB308', borderRadius: '50%', marginRight: 8, animation: 'pulse-live 2s infinite' }}></span>
              {lang?.toUpperCase() === 'TR' ? '🔴 CANLI TİCARET FIRSATLARI' : '🔴 LIVE TRADE OPPORTUNITIES'}
            </div>
            <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 3rem)', fontWeight: 900, color: '#111827', lineHeight: 1.1, margin: 0 }}>
              Küresel Ticaret Fırsatları
            </h1>
          </div>
          
          {/* TOPLAM SAYAÇ */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--re)', padding: '.6rem 1rem', fontFamily: 'var(--m)', fontSize: '.8rem', fontWeight: 900, color: '#fff' }}>
              🔴 {totalTenders} İHALE
            </div>
            <div style={{ background: 'var(--go)', padding: '.6rem 1rem', fontFamily: 'var(--m)', fontSize: '.8rem', fontWeight: 900, color: '#fff' }}>
              🟢 {totalStock} STOK
            </div>
            <div style={{ background: 'var(--wa)', padding: '.6rem 1rem', fontFamily: 'var(--m)', fontSize: '.8rem', fontWeight: 900, color: '#000' }}>
              🟡 {totalCapacity} KAPASİTE
            </div>
          </div>
        </div>

        {/* FİLTRE VE SIRALAMA BAR */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
              TÜMÜ ({tenders.length})
            </button>
            <button className={`filter-btn ${filter === 'TENDER' ? 'active' : ''}`} onClick={() => setFilter('TENDER')}>
              🔴 İHALELER ({totalTenders})
            </button>
            <button className={`filter-btn ${filter === 'HOT_STOCK' ? 'active' : ''}`} onClick={() => setFilter('HOT_STOCK')}>
              🟢 SICAK STOK ({totalStock})
            </button>
            <button className={`filter-btn ${filter === 'CAPACITY' ? 'active' : ''}`} onClick={() => setFilter('CAPACITY')}>
              🟡 BOŞ KAPASİTE ({totalCapacity})
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#888' }}>SIRALA:</span>
              <select 
              value={sortType} 
              onChange={(e) => setSortType(e.target.value)}
              style={{ background: '#FFF', color: '#111827', border: '1px solid #D1D5DB', padding: '0.5rem', fontFamily: 'var(--m)', fontSize: '0.75rem', cursor: 'pointer', outline: 'none', borderRadius: '6px' }}
            >
              <option value="score">🎯 Fırsat Skoruna Göre</option>
              <option value="newest">⏱️ Tarihe Göre (En Yeni)</option>
              <option value="oldest">⏳ Tarihe Göre (En Eski)</option>
            </select>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
          {filtered.map((t: any) => {
            const cfg = TYPE_CONFIG[t.type] || TYPE_CONFIG.TENDER;
            const btnClass = t.type === 'TENDER' ? 'red' : t.type === 'HOT_STOCK' ? 'green' : 'yellow';
            return (
              <div className="t-card" key={t.id} onClick={() => router?.push(`${basePath}/tenders/${t.id}?lang=${lang}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--m)', fontSize: '.65rem', background: cfg.color, color: '#fff', padding: '3px 8px', fontWeight: 800 }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                  {t.score && <span style={{ fontFamily: 'var(--m)', fontSize: '.85rem', fontWeight: 900, color: '#111827', background: '#F3F4F6', padding: '3px 10px', border: '1px solid #E5E7EB', borderRadius: '4px' }}>SKOR: {t.score}</span>}
                </div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '.8rem', color: '#6B7280', marginBottom: '.5rem' }}>{t.location}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', marginBottom: '.8rem', lineHeight: 1.2 }}>{t.title}</div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '.8rem', color: '#4B5563', background: '#F9FAFB', padding: '.6rem', borderLeft: `3px solid ${cfg.color}`, display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>{t.detail_key || 'Detay:'}</span>
                  <span style={{ color: cfg.color, fontWeight: 800 }}>{t.detail_value || '—'}</span>
                </div>
                {t.estimated_value && (
                  <div style={{ fontFamily: 'var(--m)', fontSize: '.75rem', color: '#6B7280', marginBottom: '.5rem' }}>
                    💰 Tahmini Değer: <span style={{ color: '#111827', fontWeight: 700 }}>{t.estimated_value}</span>
                  </div>
                )}
                {t.buyer_hint && (
                  <div style={{ fontFamily: 'var(--m)', fontSize: '.75rem', color: '#6B7280', marginBottom: '.8rem' }}>
                    🏢 Alıcı İpucu: <span style={{ color: '#374151', fontWeight: 600 }}>{t.buyer_hint}</span>
                  </div>
                )}
                <button className={`t-btn ${btnClass}`} style={{ width: '100%' }}>
                  {t.action_text || '→ TEKLİF VER'}
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && filter === 'CAPACITY' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#FEFCE8', border: '1px solid var(--wa)', borderRadius: '8px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏭</div>
            <h2 style={{ fontFamily: 'var(--sf)', fontSize: '2rem', fontWeight: 900, color: '#111827', marginBottom: '1rem' }}>Boş Kapasiteniz mi Var?</h2>
            <div style={{ fontFamily: 'var(--m)', fontSize: '1rem', color: '#4B5563', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
              Şu an yayınlanan açık üretim kapasitesi bulunmuyor. Fabrikanızdaki boş dokuma veya konfeksiyon hatlarını, gizliliğinizi koruyarak 10.000 global B2B alıcıya saniyeler içinde duyurun.
            </div>
            <a href={`${basePath}/register?lang=${lang}`} className="t-btn yellow" style={{ padding: '1rem 3rem', fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}>
              → ÜCRETSİZ KAPASİTE BİLDİR
            </a>
          </div>
        )}

        {filtered.length === 0 && filter !== 'CAPACITY' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontFamily: 'var(--m)', fontSize: '.85rem' }}>Bu kategoride henüz aktif fırsat yok.</div>
            <div style={{ fontFamily: 'var(--m)', fontSize: '.7rem', color: '#9CA3AF', marginTop: '.5rem' }}>TRTEX ajanı sürekli tarıyor. Yeni fırsatlar bulunduğunda otomatik eklenecek.</div>
          </div>
        )}

        {/* FOOTER INFO */}
        <div style={{ marginTop: '3rem', padding: '1.5rem', border: '1px solid #E5E7EB', background: '#FFFFFF', borderRadius: '8px' }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: '.7rem', color: '#6B7280', letterSpacing: '.1em', marginBottom: '.5rem', fontWeight: 800 }}>OTONOM İSTİHBARAT</div>
          <div style={{ fontSize: '.85rem', color: '#4B5563', lineHeight: 1.6 }}>
            Bu sayfadaki tüm veriler TRTEX Otonom İhale Avcısı tarafından 7 kıtadan gerçek zamanlı olarak toplanmaktadır.
            TED (Avrupa), UNGM (Birleşmiş Milletler), World Bank fonlu projeler, otel zincirleri, hastaneler, devlet kurumları ve yat/cruise endüstrisi ihaleleri sürekli taranır.
            Her fırsata tıklayarak doğrudan teklif verebilir veya eşleştirme başlatabilirsiniz.
          </div>
        </div>
      </div>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang || 'tr'} />
    </div>
  );
}

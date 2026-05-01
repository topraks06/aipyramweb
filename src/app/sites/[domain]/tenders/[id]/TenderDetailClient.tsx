'use client';
import React from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';

const TYPE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  TENDER: { label: 'SATIN ALMA TALEBİ', color: '#1D4ED8', emoji: '📋' },
  HOT_STOCK: { label: 'SICAK STOK', color: '#16A34A', emoji: '🟢' },
  CAPACITY: { label: 'BOŞ KAPASİTE', color: '#EAB308', emoji: '🟡' },
};

export default function TenderDetailClient({ tender, basePath, brandName, lang }: any) {

  if (!tender) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
        <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="tenders" theme="light" />
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#6B7280' }}>Talep Bulunamadı veya Süresi Doldu</h1>
          <a href={`${basePath}/ihaleler?lang=${lang}`} style={{ color: '#1D4ED8', marginTop: '1rem', display: 'inline-block' }}>← Tüm İhalelere Dön</a>
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[tender.type] || TYPE_CONFIG.TENDER;

  // Zero-Mock Policy: Sadece veritabanından gelen gerçek veriyi göster.
  const description = tender.description || tender.content || '';
  const requirements = tender.requirements || tender.certifications || [];
  const products = tender.products || [];
  const buyerName = tender.buyerName || tender.buyer_hint?.split('/')[0] || '';
  const deadline = tender.deadline || '';
  const estimatedValue = tender.estimated_value || '';
  const location = tender.location || '';
  const sourceUrl = tender.source_url || (tender.source_id ? `https://ted.europa.eu/en/notice/-/${tender.source_id}` : '');
  const score = tender.score || 0;
  const publishDate = tender.createdAt ? new Date(tender.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const aiAnalysis = tender.ai_analysis || tender.buyer_hint || '';
  const logisticsHint = tender.logistics_hint || '';

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--m:'JetBrains Mono',monospace;--sf:'Playfair Display',Georgia,serif;--s:'Inter',-apple-system,sans-serif;--bl:#1D4ED8;--go:#16A34A;}
        .t-btn { padding: .8rem 1.5rem; border: 1px solid #E5E7EB; background: #F9FAFB; color: #4B5563; font-family: var(--m); font-weight: 800; font-size: .85rem; cursor: pointer; text-transform: uppercase; transition: all .2s; letter-spacing: 1px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; border-radius: 6px; text-decoration: none; }
        .t-btn.blue { background: var(--bl); border-color: var(--bl); color: #fff; }
        .t-btn.blue:hover { background: #1E40AF; }
        .spec-table { width: 100%; border-collapse: collapse; }
        .spec-table th, .spec-table td { padding: 1rem; border-bottom: 1px solid #E5E7EB; text-align: left; }
        .spec-table th { font-family: var(--m); font-size: 0.7rem; color: '#6B7280'; text-transform: uppercase; font-weight: 700; background: #F9FAFB; }
        .spec-table td { font-size: 0.9rem; color: #111827; }
        .section-title { font-family: var(--m); font-size: 0.8rem; color: #111827; border-bottom: 2px solid #E5E7EB; padding-bottom: 0.5rem; margin-bottom: 1.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .info-row { display: flex; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px dashed #E5E7EB; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 0.82rem; color: #6B7280; }
        .info-value { font-size: 0.85rem; font-weight: 700; color: #111827; text-align: right; max-width: 60%; }
        .hot-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); } 70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}} />

      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="tenders" theme="light" />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2.5rem 2rem' }}>
        
        {/* GERİ BAĞLANTISI */}
        <a href={`${basePath}/ihaleler?lang=${lang}`} style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#6B7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          ← TÜM İHALELER
        </a>

        {/* ÜST BİLGİ BANDI */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: '.7rem', color: '#6B7280', marginBottom: '1rem', letterSpacing: '.15em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ padding: '5px 10px', background: cfg.color, color: '#fff', fontWeight: 800, borderRadius: '4px' }}>
              {cfg.emoji} {cfg.label}
            </span>
            {score >= 85 && (
              <span className="hot-pulse" style={{ padding: '5px 10px', background: '#EF4444', color: '#fff', fontWeight: 900, borderRadius: '4px' }}>
                🔥 YÜKSEK POTANSİYEL
              </span>
            )}
            {publishDate && <span style={{ background: '#F3F4F6', padding: '5px 10px', borderRadius: '4px', fontWeight: 600 }}>{publishDate}</span>}
            {deadline && <span style={{ background: '#FEF3C7', color: '#B45309', padding: '5px 10px', borderRadius: '4px', fontWeight: 700 }}>SON TARİH: {deadline}</span>}
          </div>
          
          <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#111827', lineHeight: 1.2, margin: '0 0 0.75rem 0' }}>
            {tender.title}
          </h1>
          {location && (
            <div style={{ fontSize: '1.05rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              📍 {location}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem' }}>
          
          {/* ═══════════════════════════════════════════ */}
          {/* SOL PANEL — İHALENİN TÜM DETAYLARI */}
          {/* ═══════════════════════════════════════════ */}
          <div>

            {/* AÇIKLAMA */}
            {description && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title">📄 İhale Açıklaması</h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#374151', whiteSpace: 'pre-wrap' }}>
                  {description}
                </p>
              </div>
            )}

            {/* ÜRÜN / METRAJ TABLOSU (Sadece veritabanında varsa gösterilir) */}
            {products.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title">📦 Talep Edilen Ürünler & Metrajlar</h2>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="spec-table">
                    <thead>
                      <tr>
                        <th>Ürün / Kalem</th>
                        <th>Teknik Özellik</th>
                        <th>Miktar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod: any, idx: number) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{prod.name}</td>
                          <td style={{ color: '#4B5563' }}>{prod.spec || '—'}</td>
                          <td style={{ fontWeight: 900, color: '#1D4ED8', fontSize: '1.05rem' }}>{prod.quantity || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SERTİFİKASYON & TEKNİK ŞARTLAR (Sadece veritabanında varsa gösterilir) */}
            {requirements.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title">📑 Zorunlu Sertifikasyon & Standartlar</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {requirements.map((req: string, idx: number) => (
                    <div key={idx} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#1D4ED8', fontSize: '1rem' }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI İSTİHBARAT ANALİZİ (Sadece veritabanında varsa gösterilir) */}
            {aiAnalysis && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title">🤖 Yapay Zeka İstihbarat Analizi</h2>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1.25rem', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#1E40AF', margin: 0 }}>{aiAnalysis}</p>
                </div>
              </div>
            )}

            {/* LOJİSTİK & GÜMRÜK İPUCU (Sadece veritabanında varsa gösterilir) */}
            {logisticsHint && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 className="section-title">🚢 Lojistik & Gümrük İpucu</h2>
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '1.25rem', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#92400E', margin: 0 }}>{logisticsHint}</p>
                </div>
              </div>
            )}

          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* SAĞ PANEL — KÜNYE & KAYNAKLAR */}
          {/* ═══════════════════════════════════════════ */}
          <div>
            <div style={{ position: 'sticky', top: '100px' }}>
              
              {/* PROJE KÜNYESİ */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ background: '#F9FAFB', padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB' }}>
                  <h3 style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#111827', margin: 0, fontWeight: 800, letterSpacing: '0.05em' }}>PROJE KÜNYESİ</h3>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  {buyerName && (
                    <div className="info-row">
                      <span className="info-label">Alıcı / Kurum:</span>
                      <span className="info-value">{buyerName}</span>
                    </div>
                  )}
                  {location && (
                    <div className="info-row">
                      <span className="info-label">Lokasyon:</span>
                      <span className="info-value">{location}</span>
                    </div>
                  )}
                  {estimatedValue && (
                    <div className="info-row">
                      <span className="info-label">Tahmini Bütçe:</span>
                      <span className="info-value" style={{ color: '#16A34A', fontSize: '1rem', fontWeight: 900 }}>{estimatedValue}</span>
                    </div>
                  )}
                  {deadline && (
                    <div className="info-row">
                      <span className="info-label">Son Teklif Tarihi:</span>
                      <span className="info-value" style={{ color: '#DC2626' }}>{deadline}</span>
                    </div>
                  )}
                  {score > 0 && (
                    <div className="info-row">
                      <span className="info-label">Fırsat Skoru:</span>
                      <span className="info-value" style={{ color: score >= 85 ? '#EF4444' : score >= 60 ? '#1D4ED8' : '#6B7280', fontWeight: 900 }}>{score}/100</span>
                    </div>
                  )}
                  {tender.cpv && (
                    <div className="info-row">
                      <span className="info-label">CPV Kodu:</span>
                      <span className="info-value" style={{ fontFamily: 'var(--m)', fontSize: '0.8rem' }}>{tender.cpv}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ORİJİNAL KAYNAK LİNKİ */}
              {sourceUrl && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <a 
                    href={sourceUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="t-btn blue"
                    style={{ width: '100%', padding: '1rem' }}
                  >
                    🔗 ORİJİNAL İHALE KAYNAĞINI AÇ
                  </a>
                </div>
              )}

              {/* TRTex BİLGİ NOTU */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                  <div>
                    <h4 style={{ color: '#166534', margin: '0 0 0.4rem 0', fontWeight: 800, fontSize: '0.85rem' }}>TRTex İstihbarat Servisi</h4>
                    <p style={{ color: '#15803D', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                      Bu ihale/proje fırsatı, TRTex Otonom Yapay Zeka Radarı tarafından tespit edilmiş ve Türkçeye çevrilmiştir. TRTex aracılık yapmaz; doğru fırsatları bulur, üyelerine ücretsiz sunar. Detaylar için orijinal kaynağı ziyaret ediniz.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang || 'tr'} />
    </div>
  );
}

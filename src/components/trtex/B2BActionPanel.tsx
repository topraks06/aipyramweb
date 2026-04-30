'use client';
import React, { useState } from 'react';

export default function B2BActionPanel({ brandName }: { brandName: string }) {
  const [type, setType] = useState<'TENDER' | 'HOT_STOCK' | 'CAPACITY'>('TENDER');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'VIP_ONLY' | 'MATCHED_ONLY'>('PUBLIC');
  const [rawText, setRawText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  
  // Güven Skoru / Kurumsal Alanlar
  const [mobilePhone, setMobilePhone] = useState('');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [annualCapacity, setAnnualCapacity] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [exportImportInfo, setExportImportInfo] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [publishedSlug, setPublishedSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');

    try {
      const res = await fetch('/api/v1/master/trtex/ugc-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, rawText, companyName, country, visibility,
          mobilePhone, website, taxId, annualCapacity, employeeCount, exportImportInfo
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız');
      
      setPublishedSlug(data.slug);
      setStatus('SUCCESS');
      setRawText('');
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  return (
    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', padding: '2rem', color: '#FFF', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#CC0000', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📡</div>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Sovereign B2B İlan Terminali</h2>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>Talebiniz yapay zeka tarafından anında küresel bir habere dönüştürülür.</p>
        </div>
      </div>

      {status === 'SUCCESS' ? (
          <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid #16A34A', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16A34A', marginBottom: '0.5rem' }}>Veriler Analiz Edildi ve Sisteme İşlendi!</h3>
          <p style={{ fontSize: '0.9rem', color: '#D1D5DB', marginBottom: '1rem' }}>
            Aloha AI talebinizi yapısal veriye dönüştürdü. Eşleştirme algoritmaları şu an arka planda çalışıyor.
          </p>
          {publishedSlug && (
            <a href={`/news/${publishedSlug}`} style={{ display: 'inline-block', padding: '0.6rem 1.2rem', background: '#16A34A', color: '#FFF', textDecoration: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
              Haberi Görüntüle →
            </a>
          )}
          {!publishedSlug && (
             <div style={{ display: 'inline-block', padding: '0.6rem 1.2rem', background: '#374151', color: '#9CA3AF', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
               Gizlilik: Sadece Eşleşenlere (Dark Pool)
             </div>
          )}
          <button onClick={() => setStatus('IDLE')} style={{ display: 'block', margin: '1rem auto 0', background: 'transparent', color: '#9CA3AF', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Yeni İşlem Başlat</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>İLAN TÜRÜ</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { val: 'TENDER', label: '🔴 ALIM TALEBİ / İHALE' },
                { val: 'HOT_STOCK', label: '🟢 SICAK STOK SATIŞI' },
                { val: 'CAPACITY', label: '🟡 BOŞ KAPASİTE / FASON' }
              ].map(opt => (
                <button 
                  type="button" 
                  key={opt.val}
                  onClick={() => setType(opt.val as any)}
                  style={{ 
                    flex: 1, padding: '0.75rem', background: type === opt.val ? '#374151' : '#1F2937', 
                    border: '1px solid ' + (type === opt.val ? '#CC0000' : '#4B5563'), 
                    color: type === opt.val ? '#FFF' : '#9CA3AF', 
                    borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>GİZLİLİK VE YAYIN AĞI (DARK POOL)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { val: 'PUBLIC', label: '🌍 HERKESE AÇIK (Haber Olarak Yayınla)' },
                  { val: 'VIP_ONLY', label: '🛡️ SADECE VIP ÜYELER (Kilitli Yayın)' },
                  { val: 'MATCHED_ONLY', label: '🕵️ GİZLİ (Sadece Eşleşen Alıcılara Sinyal)' }
                ].map(opt => (
                  <button 
                    type="button" 
                    key={opt.val}
                    onClick={() => setVisibility(opt.val as any)}
                    style={{ 
                      width: '100%', textAlign: 'left', padding: '0.75rem', background: visibility === opt.val ? '#374151' : '#1F2937', 
                      border: '1px solid ' + (visibility === opt.val ? '#CC0000' : '#4B5563'), 
                      color: visibility === opt.val ? '#FFF' : '#9CA3AF', 
                      borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {visibility === 'MATCHED_ONLY' && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  * Dark Pool Seçildi: Talebiniz haber olarak YAYINLANMAZ. AI, arka planda aradığınız ürüne sahip VIP tedarikçilerle sizi gizlice eşleştirir.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>FİRMA ADI VEYA ÜNVAN (Opsiyonel)</label>
              <input 
                type="text" 
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Örn: X Tekstil A.Ş." 
                style={{ width: '100%', background: '#1F2937', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>LOKASYON (Ülke/Şehir)</label>
              <input 
                type="text" 
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Örn: Türkiye / Bursa" 
                style={{ width: '100%', background: '#1F2937', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} 
              />
            </div>
          </div>

          <div style={{ background: '#1F2937', padding: '1rem', borderRadius: '8px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#F3F4F6' }}>Kurumsal Profil & Güven Skoru Arttırıcı</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9CA3AF' }}>Bu bilgileri doldurmak ilanınızın Otonom olarak saniyesinde onaylanmasını sağlar.</p>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: '#9CA3AF' }}>{showAdvanced ? '▲' : '▼'}</span>
            </div>

            {showAdvanced && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>VERGİ NO / SİCİL NO</label>
                    <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>WEB SİTESİ</label>
                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>MOBİL TELEFON (Değerli Data)</label>
                    <input type="text" value={mobilePhone} onChange={e => setMobilePhone(e.target.value)} placeholder="+90 5XX..." style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>YILLIK KAPASİTE</label>
                    <input type="text" value={annualCapacity} onChange={e => setAnnualCapacity(e.target.value)} placeholder="Örn: 2 Milyon Metre" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>ÇALIŞAN SAYISI / YAŞI</label>
                    <input type="text" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} placeholder="Örn: 150 Çalışan / 20 Yıllık" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>İHRACAT / REFERANSLAR</label>
                    <input type="text" value={exportImportInfo} onChange={e => setExportImportInfo(e.target.value)} placeholder="Örn: 30 Ülke, Marriott Otelleri" style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>TALEBİNİZİ ANLATIN (ALOHA AI BUNU HABERE ÇEVİRECEK)</label>
            <textarea 
              required
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Ne arıyorsunuz veya ne satıyorsunuz? Miktar, özellikler, hedef kitle gibi detayları düz metin olarak yazın..." 
              rows={4}
              style={{ width: '100%', background: '#1F2937', border: '1px solid #374151', padding: '0.75rem', borderRadius: '6px', color: '#FFF', fontSize: '0.9rem', resize: 'vertical' }} 
            />
          </div>

          {status === 'ERROR' && (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600 }}>İlan gönderilirken bir hata oluştu. Lütfen tekrar deneyin.</div>
          )}

          <button 
            type="submit" 
            disabled={status === 'LOADING'}
            style={{ width: '100%', background: '#CC0000', color: '#FFF', border: 'none', padding: '1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem', cursor: status === 'LOADING' ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '0.5rem' }}
          >
            {status === 'LOADING' ? 'ALOHA AI HABERİ YAZIYOR ⏳' : 'TALEBİ KÜRESEL AĞA YAYINLA 🚀'}
          </button>
        </form>
      )}
    </div>
  );
}

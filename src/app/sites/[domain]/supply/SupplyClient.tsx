'use client';
import React, { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import { useAuth } from '@/components/auth/AipyramAuthProvider';

export default function SupplyClient({ basePath, brandName, lang }: any) {
  const { user } = useAuth();
  const [type, setType] = useState('HOT_STOCK');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    // We will send this to our /api/lead or to a new firestore doc directly
    // For now, we mock the submission response for TRTex
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D0F', color: '#E8E8E8', fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--m:'JetBrains Mono',monospace;--sf:'Playfair Display',Georgia,serif;--s:'Inter',-apple-system,sans-serif;--re:#DC2626;--go:#16A34A;--wa:#EAB308;}
        .s-input { width: 100%; padding: 1rem; background: #111; border: 1px solid #333; color: #fff; font-family: var(--m); font-size: 0.85rem; border-radius: 4px; }
        .s-input:focus { outline: none; border-color: #666; background: #1A1D24; }
        .s-btn { padding: 1rem 2rem; background: #fff; color: #000; font-family: var(--m); font-weight: 800; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.2s; border-radius: 4px; }
        .s-btn:hover { background: #ccc; }
        .s-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}} />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="trade" theme="dark" />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Küresel Otonom Tedarik Ağı</h1>
          <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6 }}>Fabrikanızdaki boş üretim kapasitesini veya deponuzdaki sıcak stokları sisteme girin. TRTex İstihbarat Ajanı ilanınızı 8 dilde optimize ederek dünya genelindeki aktif B2B alıcılara ulaştırsın.</p>
        </div>

        {!user ? (
          <div style={{ background: '#161920', border: '1px solid #333', padding: '3rem', textAlign: 'center', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontFamily: 'var(--sf)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Sadece Doğrulanmış Üyeler İçin</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>Sisteme tedarikçi olarak ilan girmek için giriş yapmanız gerekmektedir. Üstelik 3 aylık test süresince tüm işlemler <strong>ücretsizdir</strong>.</p>
            <a href={`${basePath}/register?lang=${lang}`} className="s-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Ücretsiz Kayıt Ol</a>
          </div>
        ) : submitted ? (
          <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid #16A34A', padding: '4rem 2rem', textAlign: 'center', borderRadius: '8px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--sf)', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>Verileriniz İşleniyor!</h2>
            <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6 }}>TRTex Otonom Zekası girdiğiniz verileri şu an analiz ediyor. Bloomberg terminal stilinde optimize edilip "Sıcak Fırsat" olarak dünyaya yayınlanacaktır.</p>
            <button onClick={() => setSubmitted(false)} className="s-btn" style={{ marginTop: '2rem', background: '#16A34A', color: '#fff' }}>YENİ İLAN GİR</button>
          </div>
        ) : (
          <div style={{ background: '#161920', border: '1px solid #222', padding: '2rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setType('HOT_STOCK')} 
                style={{ flex: 1, padding: '1rem', background: type === 'HOT_STOCK' ? '#16A34A' : '#111', color: '#fff', border: '1px solid #333', fontFamily: 'var(--m)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🟢 SICAK STOK
              </button>
              <button 
                onClick={() => setType('CAPACITY')} 
                style={{ flex: 1, padding: '1rem', background: type === 'CAPACITY' ? '#EAB308' : '#111', color: type === 'CAPACITY' ? '#000' : '#fff', border: '1px solid #333', fontFamily: 'var(--m)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                🟡 BOŞ KAPASİTE
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>İLAN BAŞLIĞI / ÜRÜN ADI</label>
                <input required name="title" className="s-input" placeholder="Örn: 5 Ton İhraç Fazlası Organik Pamuk İpliği" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>MİKTAR / KAPASİTE</label>
                  <input required name="amount" className="s-input" placeholder="Örn: Aylık 50.000m / 5 Ton" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>HEDEF / TAHMİNİ FİYAT</label>
                  <input name="price" className="s-input" placeholder="Örn: 2.5 EUR/kg (Opsiyonel)" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>TEKNİK DETAYLAR & AÇIKLAMA</label>
                <textarea required name="details" className="s-input" rows={4} placeholder="Ürünün özelliklerini, kompozisyonunu veya fabrikanızın üretim yeteneklerini detaylıca yazın. AI bu veriyi işleyecektir..." />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>LOKASYON (ŞEHİR/ÜLKE)</label>
                <input required name="location" className="s-input" placeholder="Örn: Bursa, Türkiye / Yüklemeye Hazır" />
              </div>

              <button type="submit" disabled={loading} className="s-btn" style={{ marginTop: '1rem' }}>
                {loading ? 'AI İŞLİYOR...' : 'SİSTEME GÖNDER (ÜCRETSİZ)'}
              </button>
            </form>
          </div>
        )}
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang || 'tr'} />
    </div>
  );
}

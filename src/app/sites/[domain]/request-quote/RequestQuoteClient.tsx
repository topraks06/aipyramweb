// src/app/sites/[domain]/request-quote/RequestQuoteClient.tsx

'use client';

import { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import StickyCtaBar from '@/components/trtex/StickyCtaBar';

export default function RequestQuoteClient({ basePath, brandName, lang }: { basePath: string; brandName: string; lang: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const translations: Record<string, Record<string, string>> = {
    TR: {
      title: 'B2B Alım Talebi Oluştur',
      desc: 'Sistemimiz talebinizi saniyeler içinde yüzlerce doğrulanmış tedarikçiyle eşleştirir.',
      productType: 'Ürün veya Kategori',
      amount: 'Tahmini Miktar',
      amountPh: 'Örn: 10,000 Adet veya 20 Ton',
      country: 'Hedef Teslimat Ülkesi',
      email: 'Kurumsal E-posta',
      budget: 'Tahmini Bütçe (Opsiyonel)',
      button: 'Talebi İlet (Geri Dönüş: 2 Sa)',
      successTitle: 'Talebiniz Alındı!',
      successDesc: 'Otonom eşleştirme motoru şu an 20+ lider üreticiyle iletişime geçiyor. En iyi fiyat teklifleri yakında e-posta kutunuzda olacak.',
    },
    EN: {
      title: 'Create B2B RFQ (Request for Quote)',
      desc: 'Our system matches your request with hundreds of verified suppliers in seconds.',
      productType: 'Product or Category',
      amount: 'Estimated Quantity',
      amountPh: 'e.g., 10,000 Pcs or 20 Tons',
      country: 'Destination Country',
      email: 'Corporate Email',
      budget: 'Estimated Budget (Optional)',
      button: 'Submit Request (Response: 2 Hrs)',
      successTitle: 'Request Received!',
      successDesc: 'Our autonomous matching engine is currently contacting 20+ leading manufacturers. Best price offers will be in your inbox shortly.',
    }
  };

  const L = translations[lang.toUpperCase()] || translations.EN;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const product = formData.get('product') as string;
    const amount = formData.get('amount') as string;
    const country = formData.get('country') as string;
    const budget = formData.get('budget') as string;

    const combinedQuery = `REQUEST_QUOTE | Product: ${product} | Quantity: ${amount} | Destination: ${country} | Budget: ${budget || 'N/A'}`;

    try {
      // trackNodeEvent("lead_created") simülasyonu
      if (typeof window !== 'undefined' && (window as any).trackNodeEvent) {
        (window as any).trackNodeEvent('lead_created', { type: 'quote', product });
      }

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: combinedQuery,
          email: email,
          lang,
          source: window.location.hostname,
          page: '/request-quote',
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg('Submission failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="index" theme="light" />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
         <div style={{ width: '100%', maxWidth: '520px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '3rem 2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', animation: 'bounce 1s ease' }}>🚀</div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111', marginBottom: '1rem', letterSpacing: '-0.5px' }}>{L.successTitle}</h2>
                <p style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1.6, fontWeight: 500 }}>{L.successDesc}</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{L.title}</h1>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.5rem', lineHeight: 1.5 }}>{L.desc}</p>
                </div>

                {errorMsg && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{L.productType}</label>
                      <input name="product" type="text" placeholder="Towels, Upholstery Fabric, Bed linens..." required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   
                   <div style={{ display: 'flex', gap: '1rem' }}>
                     <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{L.amount}</label>
                        <input name="amount" type="text" placeholder={L.amountPh} required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                     </div>
                     <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{L.country}</label>
                        <input name="country" type="text" placeholder="UK, Germany, USA..." required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                     </div>
                   </div>

                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{L.budget}</label>
                      <input name="budget" type="text" placeholder="$50,000" style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>

                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{L.email}</label>
                      <input name="email" type="email" placeholder="buyer@company.com" required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   
                   <button disabled={isSubmitting} type="submit" style={{ marginTop: '1.5rem', background: '#CC0000', color: '#FFF', border: 'none', padding: '1.1rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: isSubmitting ? 0.7 : 1 }}>
                      {isSubmitting ? '...' : L.button}
                   </button>
                </form>
              </>
            )}
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <StickyCtaBar lang={lang} />
    </div>
  );
}

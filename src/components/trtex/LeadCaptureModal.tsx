'use client';
import React, { useState } from 'react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    type: 'TENDER' | 'HOT_STOCK' | 'CAPACITY' | 'BRIEFING' | 'GENERAL';
    title?: string;
    location?: string;
    score?: number;
  };
  brandName?: string;
}

export default function LeadCaptureModal({ isOpen, onClose, context, brandName = 'TRTEX' }: LeadModalProps) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const typeLabels: Record<string, { title: string; sub: string; icon: string; color: string }> = {
    TENDER: { title: 'İHALE TEKLİF FORMU', sub: 'Bu ihaleye ilginizi bildirin. TRTEX AI sizi alıcıyla eşleştirecek.', icon: '🔴', color: '#DC2626' },
    HOT_STOCK: { title: 'STOK SATIN ALMA TALEBİ', sub: 'Bu fırsatla ilgilendiğinizi bildirin. Stok sahiplerine iletilecek.', icon: '🟢', color: '#16A34A' },
    CAPACITY: { title: 'ÜRETİM ORTAKLIĞI BAŞVURUSU', sub: 'Fason/ortaklık talebinizi iletin. AI eşleştirme başlasın.', icon: '🟡', color: '#EAB308' },
    BRIEFING: { title: 'HAFTALIK CEO BRİFİNG', sub: 'Her Pazartesi sabahı sektörün en kritik 3 sinyalini alın.', icon: '📊', color: '#3B82F6' },
    GENERAL: { title: 'İSTİHBARAT ALIMI', sub: 'Bu fırsata ilginizi bildirin.', icon: '🎯', color: '#8B5CF6' },
  };

  const label = typeLabels[context.type] || typeLabels.GENERAL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          phone,
          message,
          context_type: context.type,
          context_title: context.title || '',
          context_location: context.location || '',
          context_score: context.score || 0,
          source: 'trtex_terminal',
          createdAt: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div style={{
        background: '#0A0A0A', border: '1px solid #333', 
        maxWidth: '520px', width: '90%', padding: '0',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div style={{
          background: label.color, padding: '1.2rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--m)', fontSize: '.65rem', opacity: 0.8, letterSpacing: '0.15em' }}>TRTEX TİCARET AĞI</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{label.icon} {label.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 300 }}>×</button>
        </div>

        {submitted ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '.5rem', color: '#fff' }}>TALEBİNİZ ALINDI</div>
            <div style={{ fontSize: '.85rem', color: '#999', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              TRTEX AI sistemi talebinizi işleme aldı. 24 saat içinde eşleştirme sonuçları email adresinize iletilecektir.
            </div>
            <button onClick={onClose} style={{
              background: label.color, border: 'none', color: '#fff',
              padding: '.8rem 2rem', fontWeight: 800, fontSize: '.85rem',
              cursor: 'pointer', letterSpacing: '0.05em',
            }}>KAPAT</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '.8rem', color: '#999', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              {label.sub}
            </div>

            {context.title && (
              <div style={{
                background: '#111', border: '1px solid #333', padding: '.8rem',
                marginBottom: '1.2rem', fontSize: '.8rem',
              }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '.6rem', color: '#666', marginBottom: '.3rem' }}>İLGİLENDİĞİNİZ FIRSAT</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{context.title}</div>
                {context.location && <div style={{ color: '#888', fontSize: '.75rem', marginTop: '.2rem' }}>{context.location}</div>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              <input
                type="email" required placeholder="İş E-posta Adresiniz *"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text" required placeholder="Firma Adı *"
                value={company} onChange={e => setCompany(e.target.value)}
                style={inputStyle}
              />
              <input
                type="tel" placeholder="Telefon (opsiyonel)"
                value={phone} onChange={e => setPhone(e.target.value)}
                style={inputStyle}
              />
              {context.type !== 'BRIEFING' && (
                <textarea
                  placeholder="Mesajınız / Ürün Detayları (opsiyonel)"
                  value={message} onChange={e => setMessage(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              )}
            </div>

            <button type="submit" disabled={submitting} style={{
              width: '100%', marginTop: '1.2rem', padding: '.9rem',
              background: label.color, border: 'none', color: '#fff',
              fontWeight: 900, fontSize: '.9rem', cursor: 'pointer',
              letterSpacing: '0.05em', opacity: submitting ? 0.5 : 1,
            }}>
              {submitting ? 'GÖNDERİLİYOR...' : context.type === 'BRIEFING' ? 'BRİFİNG ALMAYA BAŞLA' : 'TALEBİ GÖNDER'}
            </button>

            <div style={{ fontSize: '.65rem', color: '#555', marginTop: '.8rem', textAlign: 'center', fontFamily: 'var(--m)' }}>
              🔒 Verileriniz KVKK uyumlu şekilde korunur. Üçüncü taraflarla paylaşılmaz.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #333', padding: '.75rem',
  color: '#fff', fontSize: '.85rem', outline: 'none',
  fontFamily: 'inherit',
};

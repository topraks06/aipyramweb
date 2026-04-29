/**
 * ═══════════════════════════════════════════════════════
 * TRTEX STICKY CTA BAR — Para Vanası Bileşeni
 * ═══════════════════════════════════════════════════════
 * Her sayfanın altına yapışır. Tıklanınca lead modal açar.
 */
'use client';

import { useState } from 'react';
import { t } from '@/i18n/labels';

const ctaLabels: Record<string, Record<string, string>> = {
  cta:      { tr: 'B2B TEKSTİL TEDARİK — ÜCRETSİZ DANIŞMANLIK', en: 'B2B TEXTILE SOURCING — FREE CONSULTATION', de: 'B2B TEXTILBESCHAFFUNG — KOSTENLOSE BERATUNG', ru: 'B2B ТЕКСТИЛЬ — БЕСПЛАТНАЯ КОНСУЛЬТАЦИЯ', zh: 'B2B纺织采购 — 免费咨询', ar: 'توريد المنسوجات B2B — استشارة مجانية', es: 'ABASTECIMIENTO TEXTIL B2B — CONSULTA GRATUITA', fr: 'APPROVISIONNEMENT TEXTILE B2B — CONSULTATION GRATUITE' },
  btn:      { tr: 'TEKLİF AL', en: 'GET QUOTE', de: 'ANGEBOT', ru: 'ЗАПРОС', zh: '获取报价', ar: 'طلب عرض', es: 'COTIZACIÓN', fr: 'DEVIS' },
  what:     { tr: 'Ne arıyorsunuz?', en: 'What are you looking for?', de: 'Was suchen Sie?', ru: 'Что вы ищете?', zh: '您在寻找什么？', ar: 'ماذا تبحث عنه؟', es: '¿Qué busca?', fr: 'Que recherchez-vous ?' },
  ph:       { tr: 'Örn: 50.000m perde kumaşı, otel havlusu…', en: 'e.g. 50,000m curtain fabric, hotel towels…', de: 'z.B. 50.000m Gardinenstoff, Hotelhandtücher…', ru: 'Напр: 50 000м ткань для штор, полотенца…', zh: '例如：50,000米窗帘布料，酒店毛巾…', ar: 'مثال: 50,000 متر قماش ستائر، مناشف فندقية…', es: 'Ej: 50.000m tela cortina, toallas hotel…', fr: 'Ex: 50 000m tissu rideau, serviettes hôtel…' },
  email:    { tr: 'E-posta (opsiyonel)', en: 'Email (optional)', de: 'E-Mail (optional)', ru: 'Email (не обязательно)', zh: '邮箱（可选）', ar: 'البريد الإلكتروني (اختياري)', es: 'Email (opcional)', fr: 'Email (optionnel)' },
  send:     { tr: 'GÖNDER', en: 'SEND', de: 'SENDEN', ru: 'ОТПРАВИТЬ', zh: '发送', ar: 'إرسال', es: 'ENVIAR', fr: 'ENVOYER' },
  thanks:   { tr: '✅ Talebiniz alındı! 24 saat içinde dönüş yapılacak.', en: '✅ Request received! We will respond within 24 hours.', de: '✅ Anfrage erhalten! Antwort innerhalb von 24 Stunden.', ru: '✅ Запрос получен! Ответим в течение 24 часов.', zh: '✅ 请求已收到！24小时内回复。', ar: '✅ تم استلام طلبك! سنرد خلال 24 ساعة.', es: '✅ ¡Solicitud recibida! Responderemos en 24 horas.', fr: '✅ Demande reçue ! Réponse sous 24 heures.' },
};

function g(key: string, lang: string): string {
  return ctaLabels[key]?.[lang] || ctaLabels[key]?.en || key;
}

export default function StickyCtaBar({ lang = 'tr' }: { lang?: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          email: email.trim() || null,
          lang,
          source: window.location.hostname,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('API error');
      setSent(true);
    } catch {
      console.error('[StickyCtaBar] Lead gönderimi başarısız');
      setError(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990, background: '#065f46', color: '#fff', padding: '1rem 2rem', textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 700 }}>
        {g('thanks', lang)}
      </div>
    );
  }

  return (
    <>
      {/* MODAL */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ background: '#fff', maxWidth: '480px', width: '100%', borderRadius: '8px', padding: '2.5rem 2rem', position: 'relative' }}>
            <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>×</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '0.5rem', color: '#111' }}>🌍 {g('cta', lang)}</h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>{g('what', lang)}</p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={g('ph', lang)}
              rows={3}
              style={{ width: '100%', padding: '0.8rem', border: '2px solid #E5E7EB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'none', marginBottom: '1rem' }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={g('email', lang)}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit', marginBottom: '1.5rem' }}
            />
            {error && (
              <div style={{ padding: '0.6rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#DC2626', fontWeight: 600, textAlign: 'center' }}>
                ⚠️ Gönderim başarısız. Lütfen tekrar deneyin.
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
              style={{ width: '100%', padding: '1rem', background: loading ? '#999' : '#CC0000', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', letterSpacing: '1px' }}
            >
              {loading ? '...' : g('send', lang)}
            </button>
          </div>
        </div>
      )}

      {/* STICKY BAR */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
        background: 'linear-gradient(90deg, #111 0%, #1a1a1a 100%)',
        color: '#fff', padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
        fontFamily: "'Inter', sans-serif", flexWrap: 'wrap',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', opacity: 0.9 }}>
          🌍 {g('cta', lang)}
        </span>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#CC0000', color: '#fff', border: 'none',
            padding: '0.5rem 1.5rem', borderRadius: '4px',
            fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
            letterSpacing: '1px', transition: 'background 0.2s',
          }}
        >
          {g('btn', lang)}
        </button>
      </div>
    </>
  );
}

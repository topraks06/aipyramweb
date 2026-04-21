/**
 * TRTEX CEO BRIEFING — Haftalık E-posta Yakalama Bileşeni
 * News sayfasına eklenir, email toplar.
 */
'use client';

import { useState } from 'react';

const labels: Record<string, Record<string, string>> = {
  title:  { tr: '📧 HAFTALIK CEO BRİFİNG', en: '📧 WEEKLY CEO BRIEFING', de: '📧 WÖCHENTLICHES CEO BRIEFING', ru: '📧 ЕЖЕНЕДЕЛЬНЫЙ CEO БРИФИНГ', zh: '📧 每周CEO简报', ar: '📧 إحاطة CEO الأسبوعية', es: '📧 BRIEFING CEO SEMANAL', fr: '📧 BRIEFING CEO HEBDOMADAIRE' },
  desc:   { tr: 'Küresel tekstil pazarının haftalık özet raporu — doğrudan kutunuza.', en: 'Weekly summary of global textile market — delivered to your inbox.', de: 'Wöchentliche Zusammenfassung des globalen Textilmarktes.', ru: 'Еженедельный обзор мирового текстильного рынка.', zh: '全球纺织市场每周摘要 — 直达您的收件箱。', ar: 'ملخص أسبوعي لسوق النسيج العالمي — يصل إلى بريدك.', es: 'Resumen semanal del mercado textil global — directo a su bandeja.', fr: 'Résumé hebdomadaire du marché textile mondial — dans votre boîte.' },
  ph:     { tr: 'E-posta adresiniz', en: 'Your email address', de: 'Ihre E-Mail-Adresse', ru: 'Ваш email', zh: '您的邮箱', ar: 'عنوان بريدك الإلكتروني', es: 'Su dirección de email', fr: 'Votre adresse email' },
  btn:    { tr: 'ABONE OL', en: 'SUBSCRIBE', de: 'ABONNIEREN', ru: 'ПОДПИСАТЬСЯ', zh: '订阅', ar: 'اشتراك', es: 'SUSCRIBIRSE', fr: "S'ABONNER" },
  ok:     { tr: '✅ Kayıt başarılı! İlk bülteniniz yakında.', en: '✅ Subscribed! Your first briefing is on the way.', de: '✅ Abonniert! Ihr erstes Briefing kommt bald.', ru: '✅ Подписка оформлена!', zh: '✅ 订阅成功！', ar: '✅ تم الاشتراك بنجاح!', es: '✅ ¡Suscrito! Su primer briefing está en camino.', fr: '✅ Abonné ! Votre premier briefing arrive bientôt.' },
};

function g(key: string, lang: string): string {
  return labels[key]?.[lang] || labels[key]?.en || key;
}

export default function NewsletterCapture({ lang = 'tr' }: { lang?: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'CEO_BRIEFING_SUBSCRIBE',
          email: email.trim(),
          lang,
          source: window.location.hostname,
          page: '/newsletter',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ background: '#065f46', color: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center', fontWeight: 700, margin: '2rem 0' }}>
        {g('ok', lang)}
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
      color: '#fff', padding: '2rem', borderRadius: '8px', margin: '2rem 0',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem' }}>
        {g('title', lang)}
      </div>
      <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.25rem', lineHeight: 1.5 }}>
        {g('desc', lang)}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={g('ph', lang)}
          required
          style={{
            flex: 1, minWidth: '200px', padding: '0.75rem 1rem',
            border: '1px solid #333', borderRadius: '4px',
            background: '#222', color: '#fff', fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem', background: '#CC0000', color: '#fff',
            border: 'none', borderRadius: '4px', fontSize: '0.85rem',
            fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
            letterSpacing: '1px',
          }}
        >
          {loading ? '...' : g('btn', lang)}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import StickyCtaBar from '@/components/trtex/StickyCtaBar';
import { t } from '@/i18n/labels';

const comingSoonLabels: Record<string, Record<string, string>> = {
  title: { tr: 'Kaydınız Alındı!', en: 'Registration Received!', de: 'Registrierung erhalten!', ru: 'Регистрация получена!', zh: '注册已收到！', ar: 'تم استلام التسجيل!', es: '¡Registro recibido!', fr: 'Inscription reçue !' },
  desc: { tr: 'VIP erişiminiz en kısa sürede aktifleştirilecek. Size e-posta ile bildirim yapılacaktır.', en: 'Your VIP access will be activated shortly. You will be notified via email.', de: 'Ihr VIP-Zugang wird in Kürze aktiviert. Sie werden per E-Mail benachrichtigt.', ru: 'Ваш VIP-доступ будет активирован в ближайшее время.', zh: '您的VIP访问将很快激活。我们将通过电子邮件通知您。', ar: 'سيتم تفعيل وصولك VIP قريباً. سيتم إعلامك عبر البريد الإلكتروني.', es: 'Su acceso VIP se activará pronto. Se le notificará por correo.', fr: 'Votre accès VIP sera activé sous peu. Vous serez notifié par email.' },
};

function cs(key: string, lang: string): string {
  return comingSoonLabels[key]?.[lang] || comingSoonLabels[key]?.en || key;
}

export default function RegisterClient({ basePath, brandName, lang }: { basePath: string; brandName: string; lang: string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `VIP_REGISTER: ${name} — ${company}`,
          email: email || null,
          lang,
          source: window.location.hostname,
          page: '/register',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
         <div style={{ width: '100%', maxWidth: '480px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '3rem 2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111', marginBottom: '0.75rem' }}>{cs('title', lang)}</h2>
                <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6 }}>{cs('desc', lang)}</p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111', fontFamily: "'Playfair Display', serif" }}>{t('vipRegister', lang)}</h1>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.5rem' }}>{t('vipRegisterDesc', lang)}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{t('fullName', lang)}</label>
                      <input name="name" type="text" placeholder={t('yourName', lang)} required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{t('corporateEmail', lang)}</label>
                      <input name="email" type="email" placeholder="email@company.com" required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{t('companyName', lang)}</label>
                      <input name="company" type="text" placeholder={t('companyTitle', lang)} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   <button type="submit" style={{ marginTop: '1rem', background: '#CC0000', color: '#FFF', border: 'none', padding: '1rem', borderRadius: '4px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }}>
                      {t('registerNow', lang)}
                   </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#6B7280' }}>
                   {t('hasAccount', lang)} <a href={`${basePath}/login?lang=${lang}`} style={{ color: '#CC0000', fontWeight: 700, textDecoration: 'none' }}>{t('login', lang)}</a>
                </div>
              </>
            )}
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <StickyCtaBar lang={lang} />
    </div>
  );
}

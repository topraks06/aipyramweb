'use client';

import { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import StickyCtaBar from '@/components/trtex/StickyCtaBar';
import { t } from '@/i18n/labels';
import { useAuth } from '@/components/auth/AipyramAuthProvider';

const comingSoonLabels: Record<string, Record<string, string>> = {
  title: { tr: 'Yakında Aktif', en: 'Coming Soon', de: 'Demnächst', ru: 'Скоро', zh: '即将开放', ar: 'قريباً', es: 'Próximamente', fr: 'Bientôt' },
  desc: { tr: 'Terminal erişimi yakında açılacaktır. Bilgileriniz kaydedildi.', en: 'Terminal access launching soon. Your information has been saved.', de: 'Terminal-Zugang kommt bald. Ihre Daten wurden gespeichert.', ru: 'Доступ к терминалу скоро откроется. Данные сохранены.', zh: '终端访问即将开放。您的信息已保存。', ar: 'سيتم فتح الوصول إلى المحطة قريباً. تم حفظ معلوماتك.', es: 'El acceso al terminal se abrirá pronto. Sus datos han sido guardados.', fr: 'L\'accès au terminal sera bientôt disponible. Vos informations ont été enregistrées.' },
};

function cs(key: string, lang: string): string {
  return comingSoonLabels[key]?.[lang] || comingSoonLabels[key]?.en || key;
}

export default function LoginPageClient({ basePath, brandName, lang }: { basePath: string; brandName: string; lang: string }) {
  const { loginWithEmail, loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

  // Eğer kullanıcı zaten giriş yapmışsa yönlendir
  if (user && router) {
    router.push(`${basePath}/tenders?lang=${lang}`);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      router?.push(`${basePath}/tenders?lang=${lang}`);
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      router?.push(`${basePath}/tenders?lang=${lang}`);
    } catch (err: any) {
      setError('Google ile giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '3rem 2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#111', fontFamily: "'Playfair Display', serif" }}>{t('terminalLogin', lang)}</h1>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.5rem' }}>TRTex Global Ticaret Ağına Giriş Yapın</p>
                </div>

                {error && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center', background: '#FEF2F2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>{t('corporateEmail', lang)}</label>
                      <input name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@sirketiniz.com" required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   <div>
                      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.4rem' }}>
                        <span>{t('password', lang)}</span>
                      </label>
                      <input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
                   </div>
                   <button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#111', color: '#FFF', border: 'none', padding: '1rem', borderRadius: '4px', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Giriş Yapılıyor...' : t('accessTradeNet', lang)}
                   </button>
                </form>

                <div style={{ margin: '2rem 0', position: 'relative', textAlign: 'center' }}>
                  <hr style={{ borderTop: '1px solid #E5E7EB' }} />
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '0 10px', color: '#6B7280', fontSize: '0.8rem' }}>veya</span>
                </div>

                <button onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', background: '#FFF', color: '#374151', border: '1px solid #D1D5DB', padding: '0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.2s' }}>
                  <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px', height: '16px' }} />
                  Google ile Devam Et
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: '#6B7280' }}>
                   {t('noAccount', lang)} <a href={`${basePath}/register?lang=${lang}`} style={{ color: '#CC0000', fontWeight: 700, textDecoration: 'none' }}>{t('registerFree', lang)}</a>
                </div>
              </>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <StickyCtaBar lang={lang} />
    </div>
  );
}

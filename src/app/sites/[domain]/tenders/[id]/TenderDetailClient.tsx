'use client';
import React, { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { t } from '@/i18n/labels';

const TYPE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  TENDER: { label: 'İHALE', color: '#DC2626', emoji: '🔴' },
  HOT_STOCK: { label: 'SICAK STOK', color: '#16A34A', emoji: '🟢' },
  CAPACITY: { label: 'BOŞ KAPASİTE', color: '#EAB308', emoji: '🟡' },
};

export default function TenderDetailClient({ tender, basePath, brandName, lang }: any) {
  const { user } = useAuth();
  const [bidding, setBidding] = useState(false);

  if (!tender) {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0D0F', color: '#E8E8E8', fontFamily: "'Inter', sans-serif" }}>
        <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="tenders" theme="dark" />
        <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#888' }}>Fırsat Bulunamadı veya Süresi Doldu</h1>
          <a href={`${basePath}/tenders?lang=${lang}`} style={{ color: '#CC0000', marginTop: '1rem', display: 'inline-block' }}>İhalelere Dön</a>
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[tender.type] || TYPE_CONFIG.TENDER;
  const isUnlocked = !!user;

  return (
    <div style={{ minHeight: '100vh', background: '#0B0D0F', color: '#E8E8E8', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--m:'JetBrains Mono',monospace;--sf:'Playfair Display',Georgia,serif;--s:'Inter',-apple-system,sans-serif;--re:#DC2626;--go:#16A34A;--wa:#EAB308;}
        .t-btn { padding: .8rem 1.5rem; border: 1px solid #333; background: transparent; color: #fff; font-family: var(--m); font-weight: 800; font-size: .9rem; cursor: pointer; text-transform: uppercase; transition: all .2s; letter-spacing: 1px; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .t-btn.red { background: var(--re); border-color: var(--re); }
        .t-btn.red:hover { background: #B91C1C; }
        .t-btn.green { background: var(--go); border-color: var(--go); }
        .t-btn.green:hover { background: #15803D; }
        .blur-wall { filter: blur(8px); user-select: none; pointer-events: none; opacity: 0.6; }
      `}} />

      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang || 'tr'} activePage="tenders" theme="dark" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr lg:350px', gap: '2rem' }}>
          
          {/* SOL PANEL - DETAYLAR */}
          <div>
            <div style={{ fontFamily: 'var(--m)', fontSize: '.7rem', color: '#888', marginBottom: '1rem', letterSpacing: '.15em' }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', background: cfg.color, color: '#fff', fontWeight: 800, marginRight: '1rem' }}>
                {cfg.emoji} {cfg.label}
              </span>
              REF ID: {tender.id.toUpperCase()}
            </div>
            
            <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 1.5rem 0' }}>
              {tender.title}
            </h1>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #222', paddingBottom: '2rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>LOKASYON</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tender.location}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>FIRSAT SKORU</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: cfg.color }}>{tender.score}/100</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>TARİH</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{new Date(tender.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              {!isUnlocked && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(11, 13, 15, 0.6)' }}>
                  <div style={{ background: '#161920', border: '1px solid #333', padding: '3rem', textAlign: 'center', borderRadius: '8px', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                    <h2 style={{ fontFamily: 'var(--sf)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Gizli İstihbarat Raporu</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                      Alıcı bilgileri, tahmini bütçe, lojistik tüyoları ve teklif verme ekranı sadece VIP üyelere açıktır.<br/><br/>
                      <strong style={{ color: '#fff' }}>TRTex Test Yayınında olduğu için ilk 3 ay ücretsiz sınırsız erişim (Golden Pass) kazanın.</strong>
                    </p>
                    <a href={`${basePath}/register?lang=${lang}`} className="t-btn red" style={{ width: '100%', textDecoration: 'none' }}>
                      Ücretsiz Üye Ol & Kilidi Aç
                    </a>
                  </div>
                </div>
              )}

              <div className={isUnlocked ? '' : 'blur-wall'}>
                {/* İSTİHBARAT ZEKASI (TRTEX STYLE) */}
                <h3 style={{ fontFamily: 'var(--m)', fontSize: '1rem', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '2rem' }}>
                  📡 YAPAY ZEKA İSTİHBARAT ANALİZİ
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#161920', padding: '1.5rem', border: '1px solid #222' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>{tender.detail_key || 'Talep Detayı'}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{tender.detail_value || '—'}</div>
                  </div>
                  <div style={{ background: '#161920', padding: '1.5rem', border: '1px solid #222' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>TAHMİNİ İHALE BÜTÇESİ</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16A34A' }}>{tender.estimated_value || 'Gizli'}</div>
                  </div>
                </div>

                {tender.buyer_hint && (
                  <div style={{ background: 'rgba(22, 163, 74, 0.05)', padding: '1.5rem', borderLeft: '4px solid #16A34A', marginBottom: '2rem' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#16A34A', marginBottom: '0.5rem', fontWeight: 800 }}>🏢 ALICI İPUCU & GÜVENİLİRLİK</div>
                    <div style={{ fontSize: '1rem', color: '#ddd', lineHeight: 1.6 }}>{tender.buyer_hint}</div>
                  </div>
                )}

                <div style={{ background: '#111', padding: '1.5rem', border: '1px solid #222', marginBottom: '2rem' }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>GÜMRÜK VE LOJİSTİK TÜYOSU (AI GENERATED)</div>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Bu destinasyona ({tender.location}) yapılacak tekstil ihracatlarında genellikle EUR.1 veya ATR belgesi istenmektedir. Kumaşların yanmazlık (FR) sertifikasyonunun uluslararası standartlara (örn. B1, M1, NFPA 701) uygun olması gümrükten geçişi hızlandırır ve ihale kazanma şansınızı %40 artırır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL - AKSİYON */}
          <div>
            <div style={{ position: 'sticky', top: '100px' }}>
              <div style={{ background: '#161920', border: '1px solid #333', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--m)', fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>
                  {cfg.label} AKSİYON MERKEZİ
                </h3>

                {!isUnlocked ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
                    <div style={{ fontSize: '0.8rem', fontFamily: 'var(--m)' }}>Aksiyon alabilmek için giriş yapmalısınız.</div>
                  </div>
                ) : !user.emailVerified ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                    <h4 style={{ color: '#EAB308', marginBottom: '0.5rem' }}>E-posta Onayı Gerekli</h4>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>Teklif verebilmek için lütfen e-posta adresinizi doğrulayın. (Spam/Gereksiz kutunuzu kontrol ediniz)</p>
                  </div>
                ) : bidding === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Talebiniz İletildi</h4>
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>TRTex Broker ekibi, sizi alıcı ile eşleştirmek için iletişime geçecektir.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                      Bu fırsat için TRTex aracılığıyla kapalı teklif verebilirsiniz. Bilgileriniz alıcıya doğrudan ve gizli bir şekilde iletilecektir.
                    </p>
                    
                    {bidding === 'error' && (
                      <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
                        Bir hata oluştu. Lütfen tekrar deneyin.
                      </div>
                    )}
                    
                    <button 
                      onClick={async () => {
                        setBidding('loading');
                        try {
                          const res = await fetch('/api/leads', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              context_title: `İHALE TEKLİFİ: ${tender.title}`,
                              context_type: 'TENDER_BID',
                              company: user.displayName || 'Anonim Firma',
                              email: user.email,
                              source: 'trtex_terminal',
                              timestamp: new Date().toISOString()
                            })
                          });
                          
                          if (!res.ok) throw new Error('API Error');
                          setBidding('success');
                        } catch (e) {
                          console.error("Bidding error:", e);
                          setBidding('error');
                        }
                      }}
                      disabled={bidding === 'loading'}
                      className={`t-btn ${tender.type === 'TENDER' ? 'red' : 'green'}`} 
                      style={{ width: '100%', padding: '1.2rem', fontSize: '1rem', opacity: bidding === 'loading' ? 0.5 : 1 }}
                    >
                      {bidding === 'loading' ? 'GÖNDERİLİYOR...' : (tender.action_text || 'ŞİMDİ TEKLİF VER')}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#666' }}>
                      🌟 TRTEX_EARLY_BIRD avantajıyla ücretsiz
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang || 'tr'} />
    </div>
  );
}

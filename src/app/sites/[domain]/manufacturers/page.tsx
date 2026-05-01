import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import { Metadata } from 'next';
import { generateHreflang } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { domain } = await params;
  const d = decodeURIComponent(domain).split(':')[0];
  const brand = d.split('.')[0].toUpperCase();
  return {
    title: `Firmalar — ${brand} | B2B Ev Tekstili Firma Dizini`,
    description: `${brand} Firma Dizini — Ev tekstili sektöründe doğrulanmış üretici, toptancı ve tedarikçi firmaları keşfedin. Güven Skoru, kapasite ve uzmanlık alanlarıyla filtrelenebilir B2B firma rehberi.`,
    openGraph: {
      title: `${brand} — Verified B2B Textile Company Directory`,
      description: `Discover verified manufacturers, wholesalers and suppliers in the home textile industry. Trust-scored B2B company directory.`,
      type: 'website',
    },
    alternates: generateHreflang(d, '/firmalar')
  };
}

interface CompanyEntry {
  id: string;
  name: string;
  country: string;
  type: 'member' | 'listing';
  tier?: string;
  trustScore?: number;
  activeListings?: number;
  website?: string;
  capacity?: string;
  expertise?: string[];
  lastActive?: string;
}

async function fetchCompanyDirectory(): Promise<CompanyEntry[]> {
  if (!adminDb) return [];

  const companies: Map<string, CompanyEntry> = new Map();

  try {
    // Kaynak 1: sovereign_users — firma adı olanları çek
    const usersSnap = await adminDb.collection('sovereign_users')
      .limit(200)
      .get();

    usersSnap.forEach(doc => {
      const d = doc.data();
      // companyName veya name alanı olan ve en az Bronze tier'a sahip olanları al
      const companyName = d.companyName || '';
      if (!companyName || companyName.length < 3) return;

      companies.set(doc.id, {
        id: doc.id,
        name: companyName,
        country: d.country || d.location || '',
        type: 'member',
        tier: d.tier || 'Free',
        trustScore: 0,
        activeListings: 0,
        website: d.website || '',
        capacity: d.annualCapacity || '',
        expertise: d.interests || d.industryTags || [],
        lastActive: d.lastActiveAt || d.createdAt || '',
      });
    });
  } catch (err) {
    console.error('[FIRMALAR] sovereign_users sorgu hatası:', err);
  }

  try {
    // Kaynak 2: trtex_b2b_listings — ACTIVE ilanlardan firma verisi
    const listingsSnap = await adminDb.collection('trtex_b2b_listings')
      .where('status', '==', 'ACTIVE')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    listingsSnap.forEach(doc => {
      const d = doc.data();
      const ref = d.companyRef || '';
      if (!ref || ref === 'VIP Network Member' || ref.length < 3) return;

      // Eğer bu firma zaten member olarak varsa, sadece listing sayısını artır
      const existingByName = Array.from(companies.values()).find(c => c.name === ref);
      if (existingByName) {
        existingByName.activeListings = (existingByName.activeListings || 0) + 1;
        existingByName.trustScore = Math.max(existingByName.trustScore || 0, d.trustScore || 0);
        return;
      }

      // Yoksa yeni firma girişi olarak ekle
      const listingId = `listing_${doc.id}`;
      if (!companies.has(listingId)) {
        companies.set(listingId, {
          id: listingId,
          name: ref,
          country: d.country || 'Global',
          type: 'listing',
          trustScore: d.trustScore || 0,
          activeListings: 1,
          website: d.profilingData?.website || '',
          capacity: d.profilingData?.annualCapacity || '',
          expertise: d.structuredData?.product_category ? [d.structuredData.product_category] : [],
          lastActive: d.createdAt || '',
        });
      } else {
        const existing = companies.get(listingId)!;
        existing.activeListings = (existing.activeListings || 0) + 1;
      }
    });
  } catch (err) {
    console.error('[FIRMALAR] trtex_b2b_listings sorgu hatası:', err);
  }

  // Trust Score'a göre sırala (yüksekten düşüğe)
  return Array.from(companies.values()).sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
}

export default async function ManufacturersPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = decodeURIComponent(resolvedParams.domain).split(':')[0];
  const lang = resolvedSearch?.lang || 'tr';
  const basePath = `/sites/${domain}`;
  const brandName = domain.split('.')[0].toUpperCase();

  const companies = await fetchCompanyDirectory();
  const hasCompanies = companies.length > 0;

  // Tier renk ve etiket haritası
  const tierBadge = (tier?: string) => {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      'Platinum': { color: '#818CF8', bg: 'rgba(129,140,248,0.1)', label: '💎 PLATINUM' },
      'Gold': { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: '🥇 GOLD' },
      'Silver': { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', label: '🥈 SILVER' },
      'Bronze': { color: '#D97706', bg: 'rgba(217,119,6,0.1)', label: '🥉 BRONZE' },
    };
    return map[tier || ''] || null;
  };

  // Trust Score rengi
  const trustColor = (score: number) => {
    if (score >= 80) return '#16A34A';
    if (score >= 50) return '#F59E0B';
    return '#9CA3AF';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --sf: 'Playfair Display',Georgia,serif; --s: 'Inter',-apple-system,sans-serif; --m: 'JetBrains Mono',monospace; --accent: #CC0000; }
        .tc { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        .firm-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 1.5rem; transition: all 0.2s; }
        .firm-card:hover { border-color: #D1D5DB; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
      `}} />

      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="manufacturers" />

      <main style={{ padding: '3rem 0 4rem' }}>
        <div className="tc">
          {/* SAYFA BAŞLIĞI */}
          <div style={{ marginBottom: '2.5rem', borderBottom: '4px solid #111827', paddingBottom: '1rem' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
              🏭 B2B FİRMA DİZİNİ
            </div>
            <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, margin: 0 }}>
              Doğrulanmış Firma Rehberi
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#6B7280', marginTop: '0.5rem', maxWidth: '700px', lineHeight: 1.6 }}>
              Ev tekstili sektöründe üretici, toptancı ve tedarikçi firmaları keşfedin. Her firma AI destekli Güven Skoru ile değerlendirilir.
            </p>
          </div>

          {/* İSTATİSTİK BANDI */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'TOPLAM FİRMA', value: companies.length, color: '#111827' },
              { label: 'DOĞRULANMIŞ ÜYE', value: companies.filter(c => c.type === 'member').length, color: '#16A34A' },
              { label: 'AKTİF İLAN SAHİBİ', value: companies.filter(c => (c.activeListings || 0) > 0).length, color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '1rem 1.5rem', minWidth: '180px' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* FİRMA LİSTESİ */}
          {hasCompanies ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              {companies.map(company => {
                const badge = tierBadge(company.tier);
                return (
                  <div key={company.id} className="firm-card">
                    {/* Üst: Firma adı + Tier */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>{company.name}</h3>
                        {company.country && (
                          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>📍 {company.country}</div>
                        )}
                      </div>
                      {badge && (
                        <span style={{ fontFamily: 'var(--m)', fontSize: '0.6rem', fontWeight: 800, color: badge.color, background: badge.bg, padding: '0.3rem 0.6rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      )}
                    </div>

                    {/* Orta: Trust Score + Aktif İlan */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      {company.trustScore != null && company.trustScore > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: trustColor(company.trustScore) }} />
                          <span style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', fontWeight: 700, color: trustColor(company.trustScore) }}>
                            Güven: {company.trustScore}/100
                          </span>
                        </div>
                      )}
                      {(company.activeListings || 0) > 0 && (
                        <div style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B' }}>
                          📋 {company.activeListings} aktif ilan
                        </div>
                      )}
                    </div>

                    {/* Alt: Detaylar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {company.expertise && company.expertise.length > 0 && company.expertise.slice(0, 3).map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', background: '#F3F4F6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {tag}
                        </span>
                      ))}
                      {company.capacity && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          ⚙️ {company.capacity}
                        </span>
                      )}
                    </div>

                    {/* Website linki */}
                    {company.website && (
                      <div style={{ marginTop: '0.75rem', borderTop: '1px solid #F3F4F6', paddingTop: '0.75rem' }}>
                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
                          🌐 {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VERİ YOKSA — KURUMSAL BİLGİLENDİRME */
            <div style={{ padding: '4rem 2rem', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏭</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>B2B Firma Rehberi</h2>
                <p style={{ fontSize: '0.95rem', color: '#6B7280', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  TRTEX Firma Dizini, ev tekstili sektöründeki üretici, toptancı ve tedarikçi firmaları yapay zeka destekli Güven Skoru ile değerlendirerek listeler. 
                  Dizin, kayıtlı üye firmalarımızın profil bilgileri ile otomatik olarak oluşturulmaktadır.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                  <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>FİRMALAR İÇİN</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>Ücretsiz kayıt olun, firmanızı dizine ekleyin ve AI destekli Güven Skoru ile öne çıkın.</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>ALICILAR İÇİN</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>Doğrulanmış firma profillerini inceleyin, kapasite ve uzmanlık alanına göre filtreleyin.</div>
                  </div>
                </div>
                <a href={`${basePath}/register?lang=${lang}`} style={{ display: 'inline-block', background: '#CC0000', color: '#FFF', padding: '0.85rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>
                  FİRMANIZI KAYIT EDİN →
                </a>
              </div>
            </div>
          )}

          {/* ALTTA CTA — FİRMA KAYDI */}
          {hasCompanies && (
            <div style={{ marginTop: '3rem', textAlign: 'center', background: '#111827', color: '#FFFFFF', padding: '3rem 2rem', borderRadius: '12px' }}>
              <h3 style={{ fontFamily: 'var(--sf)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>Firmanız Burada Görünsün</h3>
              <p style={{ fontSize: '0.9rem', color: '#9CA3AF', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Ücretsiz kayıt olun, kurumsal profilinizi doldurun ve AI destekli Güven Skoru ile dizinde öne çıkın.
              </p>
              <a href={`${basePath}/register?lang=${lang}`} style={{ display: 'inline-block', background: '#CC0000', color: '#FFF', padding: '0.85rem 2rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>
                ÜCRETSİZ KAYIT OL →
              </a>
            </div>
          )}
        </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}

import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import PerdeTerms from '@/components/node-perde/PerdeTerms';
import { t } from '@/i18n/labels';
import HometexTerms from '@/components/node-hometex/HometexTerms';
import VorhangTerms from '@/components/node-vorhang/VorhangTerms';

export const dynamic = "force-dynamic";

export default async function TermsPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  if (exactDomain.includes('perde')) {
    return (
      <div className="min-h-screen bg-[#F9F9F6]">
        <PerdeNavbar theme="light" />
        <main>
          <PerdeTerms />
        </main>
        <PerdeFooter />
      </div>
    );
  }

  if (exactDomain.includes('hometex')) {
    return <HometexTerms />;
  }

  if (exactDomain.includes('vorhang')) {
    return <VorhangTerms />;
  }

  if (exactDomain.includes('curtaindesign')) {
    const CurtaindesignTerms = (await import('@/components/node-curtaindesign/CurtaindesignTerms')).default;
    return <CurtaindesignTerms />;
  }

  if (exactDomain.includes('icmimar')) {
    const IcmimarNavbar = (await import('@/components/node-icmimar/IcmimarNavbar')).default;
    const IcmimarFooter = (await import('@/components/node-icmimar/IcmimarFooter')).default;
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
          <h1 className="font-serif text-5xl text-zinc-900 mb-6">Kullanım Koşulları</h1>
          <div className="text-zinc-600 space-y-6">
             <p>İcmimar.ai B2B Master Design Engine kullanım koşulları aşağıda belirtilmiştir.</p>
             <h2 className="font-bold text-lg text-black mt-8">1. Hizmet Kapsamı</h2>
             <p>Platformumuz üzerinden sağlanan tasarım araçları (Visualizer) ve ERP özellikleri, yalnızca kurumsal üyelere ve ticari amaçlarla sunulmaktadır.</p>
             <h2 className="font-bold text-lg text-black mt-8">2. Lisans ve Fikri Mülkiyet</h2>
             <p>Oluşturulan 3D renderlar ve tasarımlar, sistemimize yüklenen doku verileri üzerinden üretilir. Kullanıcılar yükledikleri içeriklerin lisansından kendileri sorumludur.</p>
          </div>
        </main>
        <IcmimarFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="legal" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#CC0000', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>YASAL</div>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
           Kullanım Koşulları
         </h1>
         <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '3rem' }}>Son güncelleme: 1 Mayıs 2026</p>
         
         <div style={{ fontSize: '1rem', lineHeight: 1.9, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              TRTEX Intelligence Terminal&apos;i (&ldquo;Platform&rdquo;) kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Platform, aipyram GmbH tarafından geliştirilmiş ve işletilmektedir.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>1. Hizmet Kapsamı</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              TRTEX, ev tekstili sektörüne yönelik yapay zeka destekli B2B istihbarat hizmetleri sunar. Bu hizmetler; sektörel haber analizi, ihale ve satın alma talebi takibi, fuar takvimi, firma dizini ve pazar sinyalleri içerir. Platform bilgi amaçlıdır ve yatırım tavsiyesi niteliği taşımaz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>2. Üyelik ve Hesap</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Platformun belirli özelliklerine erişmek için üye kaydı gerekebilir. Kayıt sırasında verilen bilgilerin doğruluğundan kullanıcı sorumludur. Hesap güvenliğinin sağlanması kullanıcının yükümlülüğündedir. Şüpheli aktivite tespit edilmesi halinde aipyram GmbH hesabı askıya alma hakkını saklı tutar.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>3. İçerik ve Fikri Mülkiyet</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Platformdaki tüm içerikler (yapay zeka tarafından üretilen analizler, haberler, görsel materyaller, yazılım kodu) aipyram GmbH&apos;nin fikri mülkiyetindedir. İçeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır. Haber ve analiz içerikleri kaynak gösterilmeden yeniden yayınlanamaz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>4. Yapay Zeka İçerik Uyarısı</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              TRTEX&apos;teki haber analizleri, ihale özetleri ve pazar sinyalleri büyük dil modelleri (Gemini AI) tarafından otomatik olarak üretilmektedir. Bu içerikler bilgilendirme amaçlıdır ve %100 doğruluk garantisi verilmez. Ticari kararlarınızı vermeden önce orijinal kaynakları doğrulamanızı öneriyoruz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>5. Kullanım Kısıtlamaları</h2>
            <p style={{ marginBottom: '1rem' }}>Aşağıdaki davranışlar kesinlikle yasaktır:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Platformun otomatik araçlarla (bot, scraper) taranması.</li>
              <li style={{ marginBottom: '0.5rem' }}>Diğer kullanıcıların verilerine yetkisiz erişim girişimleri.</li>
              <li style={{ marginBottom: '0.5rem' }}>Platformun altyapısına zarar verecek faaliyetlerde bulunulması.</li>
              <li style={{ marginBottom: '0.5rem' }}>Yanıltıcı, sahte veya spam niteliğinde içerik paylaşılması.</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>6. Sorumluluk Sınırı</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              aipyram GmbH, platformda yayınlanan bilgilerin doğruluğu, güncelliği ve eksiksizliği konusunda garanti vermez. Kullanıcıların platform üzerinden elde ettiği bilgilere dayanarak aldıkları ticari kararlardan doğan zararlardan aipyram GmbH sorumlu tutulamaz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>7. Uygulanacak Hukuk</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Bu kullanım koşulları Almanya Federal Cumhuriyeti hukukuna tabidir. Uyuşmazlıkların çözümünde Almanya mahkemeleri yetkilidir.
            </p>

            <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F3F4F6', borderRadius: '8px', fontSize: '0.85rem', color: '#6B7280' }}>
              <strong style={{ color: '#111827' }}>Hizmet Sağlayıcı:</strong> aipyram GmbH<br />
              <strong style={{ color: '#111827' }}>İletişim:</strong> info@aipyram.com
            </div>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}

import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import PerdePrivacy from '@/components/node-perde/PerdePrivacy';
import { t } from '@/i18n/labels';
import HometexPrivacy from '@/components/node-hometex/HometexPrivacy';
import VorhangPrivacy from '@/components/node-vorhang/VorhangPrivacy';

export const dynamic = "force-dynamic";

export default async function PrivacyPage({ params, searchParams }: any) {
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
          <PerdePrivacy />
        </main>
        <PerdeFooter />
      </div>
    );
  }

  if (exactDomain.includes('hometex')) {
    return <HometexPrivacy />;
  }

  if (exactDomain.includes('vorhang')) {
    return <VorhangPrivacy />;
  }

  if (exactDomain.includes('curtaindesign')) {
    const CurtaindesignPrivacy = (await import('@/components/node-curtaindesign/CurtaindesignPrivacy')).default;
    return <CurtaindesignPrivacy />;
  }

  if (exactDomain.includes('icmimar')) {
    const IcmimarNavbar = (await import('@/components/node-icmimar/IcmimarNavbar')).default;
    const IcmimarFooter = (await import('@/components/node-icmimar/IcmimarFooter')).default;
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
          <h1 className="font-serif text-5xl text-zinc-900 mb-6">Gizlilik Politikası</h1>
          <div className="text-zinc-600 space-y-6">
             <p>İcmimar.ai olarak, kişisel verilerinizin güvenliğine ve gizliliğine büyük önem veriyoruz.</p>
             <h2 className="font-bold text-lg text-black mt-8">1. Toplanan Veriler</h2>
             <p>Hizmetlerimizi kullanırken, hesap bilgileri, yüklenen referans görseller ve kullanım verileri toplanmaktadır.</p>
             <h2 className="font-bold text-lg text-black mt-8">2. Veri Kullanımı</h2>
             <p>Toplanan veriler, otonom tasarım motorumuzun (Visualizer) size daha iyi sonuçlar üretmesi ve B2B işlemlerin ERP üzerinden sorunsuz yürütülmesi amacıyla kullanılır.</p>
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
           Gizlilik Politikası
         </h1>
         <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '3rem' }}>Son güncelleme: 1 Mayıs 2026</p>
         
         <div style={{ fontSize: '1rem', lineHeight: 1.9, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              TRTEX Intelligence Terminal (&ldquo;Platform&rdquo;), aipyram GmbH tarafından işletilmektedir. Bu gizlilik politikası, platformumuzu kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır. Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hareket ediyoruz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>1. Toplanan Veriler</h2>
            <p style={{ marginBottom: '1rem' }}>Platformumuzu kullanırken aşağıdaki veriler toplanabilir:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, firma adı, ülke bilgisi (kayıt sırasında).</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Kullanım Verileri:</strong> Ziyaret edilen sayfalar, tıklama verileri, oturum süreleri.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Cihaz Bilgileri:</strong> Tarayıcı türü, IP adresi, işletim sistemi (anonim olarak).</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ticari Tercihler:</strong> İlgi duyulan ihale kategorileri, fuar takipleri, ürün filtreleri.</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>2. Verilerin Kullanım Amacı</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Toplanan veriler; platformun işlevselliğini sağlamak, kişiselleştirilmiş B2B istihbarat sunmak, ihale eşleştirme algoritmamızı iyileştirmek ve yasal yükümlülüklerimizi yerine getirmek amacıyla kullanılır. Verileriniz üçüncü taraf reklam ağlarıyla paylaşılmaz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>3. Çerezler (Cookies)</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Platformumuz, oturum yönetimi ve kullanıcı tercihlerinin hatırlanması için teknik çerezler kullanır. Analitik çerezler (Google Analytics) anonim kullanım istatistikleri toplamak amacıyla kullanılabilir. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>4. Üçüncü Taraf Hizmetler</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Platformumuz Google Cloud (Firebase) altyapısı üzerinde çalışmaktadır. Kimlik doğrulama için Firebase Authentication, veri depolama için Google Cloud Firestore kullanılmaktadır. Bu hizmetler GDPR uyumlu veri işleme anlaşmaları (DPA) kapsamındadır.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>5. Haklarınız</h2>
            <p style={{ marginBottom: '1rem' }}>GDPR ve KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Verilerinize erişim talep etme hakkı</li>
              <li style={{ marginBottom: '0.5rem' }}>Verilerinizin düzeltilmesini veya silinmesini isteme hakkı</li>
              <li style={{ marginBottom: '0.5rem' }}>Veri işleme faaliyetlerine itiraz etme hakkı</li>
              <li style={{ marginBottom: '0.5rem' }}>Verilerinizin taşınabilirliğini talep etme hakkı</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>6. Veri Saklama ve Güvenlik</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Verileriniz Google Cloud altyapısında, endüstri standartlarında şifreleme (TLS 1.3, AES-256) ile korunmaktadır. Hesap silme talebinden itibaren 30 gün içinde tüm kişisel veriler kalıcı olarak silinir.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>7. İletişim</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Gizlilik politikamızla ilgili sorularınız için <strong>info@aipyram.com</strong> adresinden bize ulaşabilirsiniz.
            </p>

            <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F3F4F6', borderRadius: '8px', fontSize: '0.85rem', color: '#6B7280' }}>
              <strong style={{ color: '#111827' }}>Veri Sorumlusu:</strong> aipyram GmbH<br />
              Bu politika, yasal düzenlemelerdeki değişikliklere bağlı olarak güncellenebilir.
            </div>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}

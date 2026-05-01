import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';

export const dynamic = "force-dynamic";

export default async function KvkkPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="legal" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#CC0000', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>YASAL</div>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
           KVKK / GDPR Aydınlatma Metni
         </h1>
         <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '3rem' }}>Son güncelleme: 1 Mayıs 2026</p>
         
         <div style={{ fontSize: '1rem', lineHeight: 1.9, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (&ldquo;GDPR&rdquo;) kapsamında, TRTEX Intelligence Terminal kullanıcılarını kişisel verilerinin işlenmesi hakkında bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>1. Veri Sorumlusu</h2>
            <div style={{ padding: '1.25rem', background: '#F3F4F6', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>Unvan:</strong> aipyram GmbH<br />
                <strong>İletişim:</strong> info@aipyram.com<br />
                <strong>Web:</strong> trtex.com
              </p>
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>2. İşlenen Kişisel Veriler</h2>
            <p style={{ marginBottom: '1rem' }}>Platformumuz aşağıdaki kişisel veri kategorilerini işlemektedir:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Kimlik Verileri:</strong> Ad, soyad, kullanıcı adı</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>İletişim Verileri:</strong> E-posta adresi, telefon (opsiyonel)</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Kurumsal Veriler:</strong> Firma adı, ülke, faaliyet alanı</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>İşlem Güvenliği Verileri:</strong> IP adresi, oturum bilgileri, çerez verileri</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Ticari Tercih Verileri:</strong> İhale takipleri, ilgi alanları, arama geçmişi</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>3. Veri İşleme Amaçları</h2>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Üyelik işlemlerinin yürütülmesi ve kimlik doğrulama</li>
              <li style={{ marginBottom: '0.5rem' }}>Kişiselleştirilmiş B2B istihbarat hizmetinin sunulması</li>
              <li style={{ marginBottom: '0.5rem' }}>İhale eşleştirme ve bildirim hizmetlerinin sağlanması</li>
              <li style={{ marginBottom: '0.5rem' }}>Platform güvenliğinin ve veri bütünlüğünün korunması</li>
              <li style={{ marginBottom: '0.5rem' }}>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>4. Veri İşleme Hukuki Sebepleri</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Kişisel verileriniz; açık rızanız, bir sözleşmenin kurulması veya ifası, hukuki yükümlülüklerin yerine getirilmesi ve meşru menfaatlerimiz kapsamında KVKK m.5 ve GDPR m.6 çerçevesinde işlenmektedir.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>5. Veri Aktarımı</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Kişisel verileriniz; hizmet sağlayıcılarımıza (Google Cloud / Firebase — GDPR uyumlu DPA kapsamında), yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına aktarılabilir. Verileriniz üçüncü taraf pazarlama şirketleriyle kesinlikle paylaşılmaz.
            </p>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>6. İlgili Kişi Hakları</h2>
            <p style={{ marginBottom: '1rem' }}>KVKK m.11 ve GDPR m.15-22 kapsamında aşağıdaki haklarınız bulunmaktadır:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li style={{ marginBottom: '0.5rem' }}>İşlenmiş ise buna ilişkin bilgi talep etme</li>
              <li style={{ marginBottom: '0.5rem' }}>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
              <li style={{ marginBottom: '0.5rem' }}>Yurt içinde veya yurt dışında aktarılan üçüncü kişileri bilme</li>
              <li style={{ marginBottom: '0.5rem' }}>Verilerin eksik veya yanlış işlenmesi halinde düzeltilmesini isteme</li>
              <li style={{ marginBottom: '0.5rem' }}>KVKK m.7 kapsamında verilerin silinmesini veya yok edilmesini isteme</li>
              <li style={{ marginBottom: '0.5rem' }}>Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            </ul>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2.5rem', marginBottom: '1rem' }}>7. Başvuru Yöntemi</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Yukarıda belirtilen haklarınızı kullanmak için <strong>info@aipyram.com</strong> adresine yazılı başvuruda bulunabilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.
            </p>

            <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#F3F4F6', borderRadius: '8px', fontSize: '0.85rem', color: '#6B7280' }}>
              <strong style={{ color: '#111827' }}>Veri Sorumlusu:</strong> aipyram GmbH<br />
              <strong style={{ color: '#111827' }}>Kanuni Dayanak:</strong> 6698 sayılı KVKK | AB 2016/679 GDPR
            </div>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}

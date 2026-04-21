# ==============================================================================
# AIPYRAM MASTER SKILL FILE (THE HOLY GRAIL OF EVENTS AND ARCHITECTURE)
# ==============================================================================

Bu belge, Aipyram B2B/B2C Holding ekosisteminin KALBİDİR. Sistemdeki tüm tenantların, agentların ve Global ERP'nin birbirleriyle konuşma dilini (Event Dictionary) ve görev sınırlarını belirler.

## 1. MİMARİ KARAR (TEK REPO / MONOREPO STRATEJİSİ)
Sistem **ASLA** `trtex.com` ayrı klasör, `perde.ai` ayrı klasör şeklinde çalışmayacaktır.
Tüm sistem **TEK BİR KOD TABANINDA (aipyramweb)** yaşar. (TRTEX'i bozmamak için bu projeden hemen `.zip` yedeği alınacak, geliştirmeler tek repo üzerinden devam edecektir).
- **Core (Çekirdek):** `Home Textile Engine` + `Global ERP`
- **Skin (Kabuk):** Kullanıcının tarayıcıya yazdığı domain (trtex, perde vb.) Next.js tarafından algılanır ve sadece o domainin renkleri, dili ve vizyonu (skin) render edilir. Veritabanı ve zeka Aipyram'da ortaktır.

## 2. GLOBAL ERP CORE (TÜM SEKTÖRLERİN KALBİ)
🚨 **Karar:** ERP, `Perde.ai` veya `TRTEX` içine gömülmez. **%100 AYRI VE GLOBALDİR.**
- Neden? Çünkü bugün tekstil satışı yapılan sistemden, yarın Rent (Kiralama) veya Travel (Seyahat) tahsilatı da yapılacaktır.
- Aipyram'a bağlı olan tüm tenantlar işi gücü toparlar ve son faturayı "Aipyram Global ERP" modülüne yollar. Stok düşümü, kurye/kargo tetiklemesi, finansal komisyon kısımlarını ERP yapar.

## 3. PERDE.AI HİBRİT SİSTEMİ (KARAR MERKEZİ)
Perakendeci ve Toptancı için Çift Yönlü Motor:
- **Senaryo A (Perakendeci):** Oda Yükler ➔ Aipyram'daki ortak veritabanından Toptancı Kartelasını (Desenini) Seçer ➔ AI bu deseni Müşterinin Odasına Giydirir.
- **Senaryo B (Toptancı):** Dünyada ilk defa ürettiği 3D Kumaş Kartelasını yükler ➔ AI otomatik olarak 5 farklı lüks "Demo Oda" renderlar (Kataloğa çevirir).

## 4. EVENT SÖZLÜĞÜ (ALOHA SİNİR SİSTEMİ MESAJLARI)
Ajanların birbiriyle anlaştığı Event Bus (Mesaj) Komutları:

- `trtex_material_detected` : TRTEX pazarda yeni bir iplik/kumaş haberi yayınladı.
- `trtex_b2b_interest_detected` : Bir tedarikçi bu hammaddeye yorum/ihale teklifi bıraktı.
- `perde_blueprint_requested` : Kartela veya Oda fotoğrafı yüklendi, ALOHA Image Agent uyanıyor.
- `perde_design_generated` : Dergi kalitesinde render çıktı.
- `hometex_booth_ready` : Üretilen yüksek kaliteli tasarım, B2B sanal fuardaki standa yerleştirildi.
- `vorhang_b2c_ready` : Fuar onayından geçen ürün, Global Satış (Vorhang vb. 8 farklı dilde domain) sepetine atıldı.
- `erp_invoice_issued` : Vorhang'da müşteri kredi kartıyla siparişi geçti, ERP faturayı ve tedarik zincirini başlattı.
- `aloha_commission_cut` : Sistem bu B2B2C satış zincirinden %5 komisyonunu `Aipyram M-Wallet` (Cüzdan) hesabına aktardı.

## 5. RENDER KALİTESİ VE SABİT MALİYET/GÜVENLİK KURALLARI (ASLA ESNETİLEMEZ)
- **Görsel Çıktı Sınırı:** Asla 8K çözünürlükte resim üretilmeyecektir! B2C/B2B (Perde.ai / Hometex) görsel çıktı sınırımız **maksimum 4K**'dır.
- **TRTEX Haber Sınırı:** Piyasaya hızla basılacak B2B Text / Haber terminali resimleri **sadece 2K** olacaktır.
- **Dosya Güvenliği:** Sistematik hiçbir işlemde (Onay alınmadıkça veya Master Admin emretmedikçe) "Dosya Silmek" YASAKTIR. Dosya adları izole edilir, arşivlenir ama çöpe atılmaz. Askeri kuralların hiçbir şekilde dışına çıkılmaz.

## 6. DOSYA VE ESKİ PROJE GÜVENLİĞİ
Masadaki (Masaüstü/projeler zip) eski projeler, Aipyram'ın geçmiş versiyon kalıntılarıdır. Karışıklığı engellemek için arşivde dokunulmadan bekler. Yeni sistemin tek patronu `aipyramweb` klasörü olacaktır. İlk faza `perde.ai` arayüzü kontrol edilerek başlanır.

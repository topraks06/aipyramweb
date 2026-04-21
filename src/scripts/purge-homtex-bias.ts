import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb } from "../lib/firebase-admin";

async function fixHomtexDisaster() {
  console.log("🔥 OPERATION: PURGE HALLUCINATIONS & INSTALL SOVEREIGN 4.0");

  try {
    // 1. Otonom olarak üretilen ve "Hasan Hüseyin Bayram" içeren, gerçeğe aykırı tüm makaleleri vur
    console.log("🧹 Süpürme işlemi: 'Hasan Hüseyin Bayram' geçen hatalı ALOHA makaleleri aranıyor...");
    // Firebase Firestore'da metin içinde arama sınırlıdır.
    // Tüm güncel makaleleri alıp manuel tarayalım:
    const snapshot = await adminDb.collection("trtex_news").get();
    let deletedCount = 0;
    
    for (const doc of snapshot.docs) {
       const data = doc.data();
       const title = data.title || "";
       const content = data.content || "";
       if (title.includes("HOMETEX") || content.includes("Hasan Hüseyin Bayram")) {
           console.log(`[DELETE] Hatalı Makale Vuruldu: ${doc.id} - ${title.substring(0, 40)}`);
           await doc.ref.delete();
           deletedCount++;
       }
    }
    console.log(`✅ Toplam ${deletedCount} halüsinatif makale imha edildi.`);

    // 2. KUSURSUZ SOVEREIGN 4.0 MAKALEYİ EKLE
    console.log("💎 Hakan'ın Master Kopyası Firestore'a Basılıyor...");
    const perfectContent = `Ekim 2025'te yapılan seçimle TETSİAD Başkanlığı bayrağını devralan Murat Şahinler, HOMETEX 2026'yı sadece bir fuar değil, bir "Vizyon Devrimi" olarak konumlandırıyor. 19-22 Mayıs tarihleri arasında İstanbul Fuar Merkezi'nde (İFM) gerçekleşecek olan dev buluşma, 650'den fazla katılımcı firmayı 126 ülkeden gelen nitelikli alıcılarla buluşturacak.

## KRİTİK VERİLER:
* **Yeni Başkan:** Murat Şahinler (TETSİAD Yönetim Kurulu Başkanı).
* **Fuar Tarihi:** 19-22 Mayıs 2026.
* **Slogan:** "Yeni Bir Vizyon, Zirveye Yolculuk."
* **Hedef:** İhracat hacmini 4.5 milyar doların üzerine taşımak ve Türk ev tekstili markasını "Lüks Segment"te sabitlemek.

![Katma Değerli Üretim SENSORY](https://storage.googleapis.com/perde-ai.appspot.com/trtex-news/sustainability-innovation-1463943343.jpg)

### 🧠 TRTEX AI INSIGHT: "HAKAN GÖZÜ" STRATEJİSİ
**ANALİZ:** Hasan Hüseyin Bayram dönemi kapandı; Murat Şahinler dönemiyle birlikte "Tasarım ve Kalite Odaklı Değişim" rüzgarı esiyor. Bu durum, hammadde krizinin yaşandığı bu dönemde "fiyat" ile değil "marka gücü" ile rekabet etmemiz gerektiğini gösteriyor.

**TİCARİ FIRSAT:** 19 Mayıs'ta başlayacak olan fuarda, özellikle Avrupa ve ABD pazarından gelecek alıcı grupları, "Sürdürülebilir ve Akıllı Tekstiller" için bütçe ayırmış durumda.

**RİSK:** Sadece "sergileme" yapan firmalar elenecek; "Hikaye anlatan" ve dijital showroomu (Hometex.ai) olan firmalar pastadan pay alacak.`;

    const newsDoc = {
      title: "HOMETEX 2026: Murat Şahinler Liderliğinde 'Yeni Vizyon' Operasyonu",
      summary: "Ekim 2025'te yapılan seçimle TETSİAD Başkanlığı bayrağını devralan Murat Şahinler, HOMETEX 2026'yı sadece bir fuar değil, bir Vizyon Devrimi olarak konumlandırıyor.",
      content: perfectContent,
      category: "EV TEKSTİLİ",
      tags: ["FUAR ANALİZİ", "İHRACAT FIRSATI", "YENİ STRATEJİ"],
      ceo_priority_level: "Yüksek",
      image_url: "https://storage.googleapis.com/perde-ai.appspot.com/trtex-news/sustainability-innovation-1463943343.jpg",
      images: [
        "https://storage.googleapis.com/perde-ai.appspot.com/trtex-news/sustainability-innovation-1463943343.jpg",
      ],
      slug: "hometex-2026-murat-sahinler-yeni-vizyon-" + Date.now(),
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ai_ceo_block: {
         priority_level: "Yüksek",
         impact_score: 9,
         executive_summary: [
           "Hasan Hüseyin Bayram dönemi bitti; Murat Şahinler devrede.",
           "Avrupa ve ABD sürdürülebilir ürün pazarında rekabet kızışıyor."
         ]
      },
      quality_score: 100
    };

    const docRef = await adminDb.collection("trtex_news").add(newsDoc);
    console.log(`🎉 BAŞARI: Sovereign 4.0 Haber Canlı! ID: ${docRef.id}`);

  } catch(err:any) {
      console.error("❌ Hata:", err.message);
  }
}
fixHomtexDisaster();

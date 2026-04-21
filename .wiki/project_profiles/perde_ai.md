# PERDE.AI — Proje Profili

## Kimlik
- **Ad:** Perde.ai (AI-Powered Curtain Design Studio)
- **URL:** https://perde.ai
- **Tür:** B2C AI Perde Tasarım Platformu
- **Dil:** TR öncelikli, EN desteği
- **Hedef:** Yapay zeka ile kişiye özel perde tasarımı ve sipariş

## Veritabanı
- **Koleksiyonlar:** `perde_designs`, `perde_products`, `perde_orders`
- **Ajan sayısı:** 33 ajan (Neural Swarm v7.5)

## Platform Özellikleri

### AI Tasarım Stüdyosu
- Kullanıcı oda fotoğrafı yükler
- AI (Gemini + Imagen) oda için perde önerisi üretir
- Kumaş, renk, desen seçimi
- Fiyat hesaplama + sipariş

### Ajan Hiyerarşisi (33 Ajan)
| Seviye | Ajan | Görev |
|:------:|------|-------|
| L1 | Intent Guard | Giriş kapısı, model yönlendirme |
| L2 | Master Core | Orchestrator, güven skorlama |
| L3 | Logic Layer | Yapısal bütünlük, görsel koruma |
| L4 | Environment | Oda analizi, ışık tespiti |
| L5 | Physics | Kumaş fiziği simülasyonu |
| L6 | Business | Fiyatlandırma, stok, sipariş |

### Görsel Üretim Kuralları (KRİTİK)
- **Modern Sanayi Hayranlığı** estetiği
- Negatif prompt zorunlu (karanlık, kirli vb. YASAK)
- Kamera DNA: Profesyonel iç mekan fotoğrafçılığı
- Işık: Doğal pencere ışığı, yumuşak gölgeler
- Renk: Pastel, nötr, toprak tonları öncelikli

### Keten Kuralı (Tekrar!)
> Bu platformda "keten perde" ürünleri var. BUNLARIN HEPSİ %100 polyester keten görünümlü kumaştır.
> Ürün açıklamalarında "doğal keten hissi" veya "keten dokusu" yazılabilir ama "%100 keten" YAZILAMAZ.

## Ticari Model
- Freemium: Ücretsiz tasarım, ücretli sipariş
- Üretici network: Bursa/Denizli üreticileri
- Kargo: Türkiye geneli

## Teknik Notlar
- Next.js + Firebase + Gemini 2.5
- Imagen 3 (görsel render)
- Stripe entegrasyonu (ödeme)
- "Acemi" (Beginner) UX — teknik bilgisi olmayan kullanıcıya hitap

## Sağlık Durumu
- Landing page: ✅ Premium (Step 1 Cila tamamlandı)
- Studio: 🟡 Geliştiriliyor
- Üretim pipeline: 🔴 Henüz başlamadı

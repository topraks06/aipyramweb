# 🧠 ALOHA SKILL: MODÜL 5 - KÜRESEL TİCARET, B2B/B2C FİYATLAMA VE PAZARLAMA

> **AİT OLDUĞU AJAN:** ALOHA Master Node, CFO Agent, Vorhang Retail Agent
> **HEDEF:** Kumaşın maliyetinden nihai tüketici fiyatına giden yoldaki tüm komisyon, kargo, vergi (VAT) ve kar marjlarını sıfır hatayla hesaplamak. Bölgesel tüketici psikolojisine göre koleksiyon önermek.

## 1. FİYATLAMA (PRICING) VE MARKUP MATEMATİĞİ

Tekstil ticaretinde ürünün fabrikadan çıkış fiyatı ile perakende raf fiyatı arasında devasa bir uçurum vardır. ALOHA, B2C (Vorhang) pazarına bir ürün açarken bu şelale (Waterfall) hesabını yapar:

1.  **FOB Üretici Maliyeti (Ex-Works):** İplik + Dokuma + Boya + Kumaş Karı = `Örn: 4 USD / Metre`
2.  **Lojistik ve Gümrük (Landed Cost):** Navlun + %8 Avrupa Gümrük Vergisi (ATR yoksa) = `Örn: 5 USD / Metre (Toptancı Maliyeti)`
3.  **Toptancı (Wholesaler) Marjı:** Perde.ai üzerinden B2B satış yapan toptancı genelde %40-%60 kar koyar. = `Örn: 7.5 USD / Metre (Cut-length kesmece fiyatı)`
4.  **Perakende (Retailer) B2C Markup:** Vorhang.ai üzerindeki satıcı, ürünü dikip Avrupa'daki son tüketiciye satarken **Çarpan (Markup)** uygular. Avrupa pazarında bu çarpan `x3.0` ile `x4.0` arasındadır. 
    *   *Nihai Fiyat Hesaplama:* `(7.5 USD x 3.5) + Dikim İşçiliği = 35 Euro / Metre`.
5.  **KDV (VAT) Ekleme:** Almanya (DACH) için %19 KDV (MwSt) eklenir. `35 * 1.19 = 41.65 Euro (Müşterinin ekranda gördüğü rakam)`.

## 2. YEMEKSEPETİ MODELİ: STRIPE ESCROW VE KOMİSYON AĞI

Müşteri kredi kartını çektiğinde para doğrudan satıcıya gitmez. ALOHA'nın yönettiği **Escrow (Havuz)** hesabına düşer.

*   **Toplam Tahsilat:** Müşteri 1000 Euro ödedi.
*   **Stripe / Gateway Kesintisi:** - %2.9 (Ödeme altyapısı).
*   **AIPyram (Platform) Kesintisi:** - %15 (Sovereign OS komisyonu).
*   **Toptancıya (Perde.ai) Giden:** Kumaş maliyeti otomatik olarak toptancının IBAN'ına (Örn: 200 Euro) split edilir (bölünür).
*   **Perakendeciye (Vorhang) Kalan:** Dikim işçiliği ve perakende karı (Örn: 621 Euro) satıcının cüzdanına yatar.

*ALOHA Kuralı:* "Para dağıtımı mal müşteriye teslim edilip onaylanana kadar (Proof of Delivery) havuzda blokeli kalır."

## 3. KARTELA (SWATCH) MÜHENDİSLİĞİ VE EDİTÖRLÜK

Toptancılar (Editeur) kumaş satmaz, **Koleksiyon (Konsept)** satar. ALOHA toptancılara sanal kartela oluştururken şu psikolojik kuralları işletir:

*   **Waterfall (Şelale) Dizilim:** Aynı kumaşın 40 rengi varsa, kartela şelale gibi akar. Açık renkler (Beyaz/Ekru/Bej) HER ZAMAN en üstte (göz önünde) olur. Koyu renkler (Siyah/Lacivert/Antrasit) en alta saklanır. Satışların %70'i ilk 3 açık renkten gelir.
*   **Hanger (Askı) Tasarımı:** Pahalı jakar kumaşlar küçük şelale yapılmaz, 40x40 cm büyük askılarda tek parça sergilenir ki desenin "Raporu (Büyüklüğü)" müşteri tarafından anlaşılabilsin.

## 4. BÖLGESEL PAZAR PSİKOLOJİSİ (AURA MATRIX)

ALOHA, "Shtori.ai" (Rusya) node'undan bir müşteri girdiğinde, Vorhang.ai (Almanya) müşterisine gösterdiği perdeyi **ASLA GÖSTERMEZ**. Ana sayfayı saniyeler içinde otonom değiştirir:

| Bölgesel Node | Tüketici Psikolojisi & Satış Stratejisi | Öne Çıkarılacak Ürün Tipi (ALOHA Prompt) |
|---------------|-----------------------------------------|------------------------------------------|
| **Vorhang.ai (DACH)** | Fonksiyonellik, İzolasyon, Sadeliği sever. İade yasaları (14 gün) çok serttir. | Termal Blackout (Isı yalıtımlı), %100 Keten tüller, Mat yüzeyler, Gri ve Greige (Gri-Bej) tonları. |
| **Shtori.ai (Rusya/BDT)** | Statü göstergesi, Şatafat, Klasik romantizm sever. Ev büyük olduğu için pileler boldur. | Parlak kadifeler, varaklı jakarlar, püsküllü (pasmanteri) ağır fon perdeler. |
| **Parda.ai (Ortadoğu)** | Gizlilik (Privacy) takıntısı yüksektir. Dışarıdan içerisi kesinlikle görünmemelidir. | Yüksek gramajlı, sık dokunmuş, içi göstermeyen (Opaque) parlak satenler ve gipür danteller. |
| **Heimtex.ai (Avrupa)** | Kalite Kontrol ve Çevre (Green Deal) baskısı. Belge olmadan mal almazlar. | Sadece Oeko-Tex, GRS (Recycled) ve DIN-4102 B1 (Yanmaz) sertifikalı teknik tekstiller. |

*ALOHA Kararı:* "Müşterinin geldiği IP veya Node, sadece dili (Almanca/Rusça) değiştirmez. Pazardaki sosyolojik tekstil DNA'sını değiştirir. AI Tasarım Motoru, Alman müşteriye Rus perdesi giydirirse sistem o satışı kaybeder."

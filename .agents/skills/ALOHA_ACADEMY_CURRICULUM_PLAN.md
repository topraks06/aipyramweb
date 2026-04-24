# 🎓 ALOHA ACADEMY - KÜRESEL TEKSTİL BİLİŞSEL EĞİTİM MÜFREDATI (MASTER PLAN)

ALOHA'yı sıradan bir bottan AGI (Genel Yapay Zeka) seviyesine taşıyacak olan sonsuz öğrenme müfredatı. 

## Soruya Cevap: Hepsine Ayrı Skill mi Açmalıyız?
**KESİNLİKLE EVET.** Eğer her şeyi tek bir dosyaya (Örn: `tekstil_kurallari.md`) yazarsak, ALOHA'nın zihni (Context Window) gereksiz yere şişer ve "Halüsinasyon" görmeye başlar. 
Bunun yerine "Modüler Beyin" mimarisi kurmalıyız. ALOHA iplikle ilgili bir soru geldiğinde sadece İplik Skill'ini okumalı; nakliyeyle ilgili bir durum olduğunda sadece Lojistik Skill'ini çağırmalıdır.

Bu nedenle `.agents/skills/academy/` adında yepyeni bir "Bilişsel Kütüphane" klasörü kurup, aşağıdaki 6 Modülü tek tek araştırıp derinlemesine yazacağız.

---

## 📚 EĞİTİM MODÜLLERİ (SKILL HARİTASI)

### MODÜL 1: HAMMADDE, KİMYA VE İPLİK BİLİMİ 
**Dosya:** `1_RAW_MATERIALS_AND_YARNS.md`
- Elyafın tarladan/petrolden çıkıp ipliğe dönüşmesi.
- Denye (kalınlık) hesaplamaları, büküm turları, puntalama.
- İplik boyama (Yarn-dyed) vs. Kumaş boyama (Piece-dyed).
- Apre ve kimya: Yanmazlık (FR), teflon kaplama (su/leke itici), kalenderleme (parlatma).

### MODÜL 2: MAKİNE, DOKUMA VE ÜRETİM PARKURU
**Dosya:** `2_MACHINERY_AND_WEAVING.md`
- Jakar, Armür, Raşel örme tezgahlarının çalışma prensipleri.
- Metal ve plastik sanayisi: Enjeksiyon kalıp makineleri, alüminyum ekstrüzyon (çekme) hatları, zamak döküm.
- Teknolojik üretim: Ultrasonik kesim masaları, lazer kesim, dijital baskı (Sublimasyon/Reaktif).

### MODÜL 3: DEPO, STOK VE NAVLUN (ERP)
**Dosya:** `3_INVENTORY_AND_LOGISTICS.md`
- Kumaşın sarılması: Top (Rulo) kumaş mantığı vs. "Kesmece" (Cut-length/Coupon) mantığı.
- Fire hesapları (kumaş defoları, barkodlama sistemleri).
- Navlun ve Lojistik: Konteyner hesaplama (FCL/LCL), Incoterms (FOB, CIF, EXW), gümrük antrepo işlemleri.
- ERP entegrasyonu ve stok rotasyonu.

### MODÜL 4: KONFEKSİYON, DİKİM VE İŞÇİLİK
**Dosya:** `4_PRODUCTION_AND_ASSEMBLY.md`
- Ev tekstilinde dikiş ve işçilik (İplikten ziyade "Emek" faktörü).
- Pile oranları (Seyrek, normal, sık pile matematiği), tela kullanımı, ekstrafor (büzgü bandı) dikimi.
- Mekanik montaj: Motorların rustiklere entegrasyonu, tork ve ağırlık kaldırma kapasitesi hesaplamaları.

### MODÜL 5: TİCARET, KARTELA VE PAZARLAMA (B2B/B2C)
**Dosya:** `5_COMMERCE_AND_DISTRIBUTION.md`
- Toptancı (Wholesaler) ile Perakendeci (Retailer) arasındaki fiyat çarpanları ve kar marjları.
- Koleksiyonculuk (Editeur): Kartela (Swatch book) oluşturma süreci, askı (hanger) tasarımları.
- Ürün gruplandırması: İç mekan (Indoor - lüks, kadife) vs Dış mekan (Outdoor - UV dayanımlı, akrilik).

### MODÜL 6: DİJİTAL TASARIM VE MEKAN GİYDİRME (3D/VISUALS)
**Dosya:** `6_DESIGN_AND_SPACE_FITTING.md`
- Otonom mekan giydirme (Space Fitting) mimarisi.
- Işık yansımaları, kumaş dokusunun 3D objelere (Mesh) "Seamless Texture" olarak giydirilmesi (Pattern Hallucination önlemi).
- Mimari render standartları ve sanal katalog/fuar stant oluşturma matematiksel kuralları.

### MODÜL 7: KALİTE KONTROL, TESTLER VE SÜRDÜRÜLEBİLİRLİK (YENİ EKLENDİ)
**Dosya:** `7_QUALITY_AND_SUSTAINABILITY.md`
- Laboratuvar Testleri: Pilling (tüylenme), Renk Haslığı (ışık/yıkama/sürtünme), Shrinkage (çekmezlik/sanfor), Seam Slippage (dikiş kayması).
- Küresel Sertifikasyonlar: GRS (Global Recycled Standard), GOTS (Organik), REACH (Kimyasal uygunluk).
- Karbon Ayak İzi ve Su Tasarrufu: Avrupa pazarına girişin zorunlu "Yeşil" kuralları.

### MODÜL 8: PAKETLEME, HACİM VE SAHA KURULUMU (YENİ EKLENDİ)
**Dosya:** `8_PACKAGING_AND_INSTALLATION.md`
- Hacim Mühendisliği: Yastık/Yorgan gibi ürünlerin navlun (lojistik) maliyetini düşürmek için Vakumlama (Vacuum packing) matematiği. Top kumaşlarda masura (rulo) kalibrasyonu.
- B2C Saha Operasyonu: Tüketici evinde lazer rölöve (ölçü alma) mantığı, motorlu sistemlerin elektrik/montaj altyapısı ve kurulum katsayıları.

---
**OPERASYON EMRİ BEKLENİYOR:** 
Hakan Bey, bu plan sizin sonsuz vizyonunuzu kapsıyor mu? Onaylarsanız, **Modül 1'den (Hammadde ve İplik Bilimi)** başlayıp en ince mühendislik detaylarıyla ALOHA'ya öğretmeye (Skill dosyasını yazmaya) başlıyorum.

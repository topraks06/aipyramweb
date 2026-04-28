# 🔴 GEMİNİ GÖREV EMRİ — ORGAN MİGRASYONU & TAMAMLAMA
> **TARİH:** 28 Nisan 2026
> **VEREN:** Hakan Bey (Kurucu) + Claude Opus (Denetçi)
> **ALAN:** Gemini (Kodlama Ajanı)
> **DURUM:** ⬜ YÜRÜTME BEKLİYOR
> **KURAL:** Bu dosya SİLİNEMEZ. Sadece checkbox güncellenebilir (`⬜` → `✅`).

---

## ⛔ MUTLAK YASALAR

1. **ÖNCE OKU:** `sovereign-config.ts` dosyasını oku — yeni mimari orada tanımlı.
2. **MİMARİ DEĞİŞTİ!** Eski planları unutt — güncel organ rolleri:
   - **icmimar.ai** = Tasarım Motoru + ERP (B2B profesyoneller)
   - **Perde.ai** = Türkiye B2C Satış Mağazası (tasarım motoru DEĞİL)
   - **Vorhang.ai** = DACH B2C Satış Mağazası
   - **Curtaindesign.ai** = Global B2C Satış Mağazası (YENİ — config'te tanımlı)
   - **Hometex.ai** = SADECE Sanal Fuar (dergi/magazine YOK — Heimtex'e taşındı)
   - **Heimtex.ai** = Dijital Vogue / Moda Trend / Magazine / Pantone
   - **TRTex.com** = İstihbarat Radarı (değişmedi)
3. **HER ADIM SONRASI:** `pnpm run build` → Exit code: 0 OLMALI
4. **HER ADIM SONRASI:** `git commit -m "feat(G-X): açıklama"`
5. **SIFIR MOCK:** Math.random ile sahte veri YASAK. TODO yorumu YASAK.
6. **DOSYA SİLME YASAK:** Gereksiz dosyalar `_archive/` altına taşınır.

---

## ✅ ZATEN YAPILDI (Claude tamamladı — tekrar yapma)

- [x] sovereign-config.ts → Tüm organ rolleri güncellendi
- [x] middleware.ts → heimtex + curtaindesign routing eklendi
- [x] Kök dizin hijyeni → 15 dosya _archive/'a taşındı
- [x] Build → Exit code: 0 doğrulandı

---

## 📋 GEMİNİ GÖREVLERİ (SIRASIYLA YAP)

### G1. ALOHA Derin Mimari Tamamlama ⬜
**Öncelik:** 🔴 KRİTİK | **Tahmini:** 1-2 saat

**G1.1** `deployGuard.ts` satır 34 → `Math.random()` kullanımını `crypto.getRandomValues()` ile değiştir
- Dosya: `src/core/aloha/deployGuard.ts`
- Kanıt: Satır numarası + değişen kod

**G1.2** `fabric-memory/route.ts` satır 46 → `Math.random()` ile sahte GSM değeri
- Dosya: `src/app/api/brain/v1/fabric-memory/route.ts`
- Çözüm: GSM'yi `0` veya `"unknown"` olarak ayarla, yorum ekle: "Gerçek analiz Gemini Vision ile yapılacak"

**G1.3** `LogisticsWorkflow.ts` satır 60 → `Math.random()` ile sahte kargo no
- Dosya: `src/lib/aloha/workflows/LogisticsWorkflow.ts`
- Çözüm: `crypto.randomUUID()` kullan

**G1.4** `/api/cron/self-improve` endpoint'ini doğrula
- `src/core/aloha/selfImprovement.ts` çağrılıyor mu kontrol et
- Yoksa oluştur

**G1.5** `aloha_visitor_profiles` → localStorage'dan Firestore'a taşı
- `src/components/ConciergeWidget.tsx` içindeki localStorage okuma/yazma → Firestore

```
pnpm run build && git commit -am "feat(G1): ALOHA derin mimari tamamlama"
```

---

### G2. Sovereign Audit P0 Kapatma ⬜
**Öncelik:** 🔴 KRİTİK | **Tahmini:** 1-2 saat

**G2.1** SearchInput placeholder fix
- Dosya: `src/i18n/labels.ts`
- Görev: `searchPlaceholder` key'ini 8 dilde ekle (tr, en, de, es, fr, ru, zh, ar)

**G2.2** ShareButtons → PremiumArticleLayout entegrasyonu
- Dosya: `src/components/trtex/PremiumArticleLayout.tsx`
- Görev: `ShareButtons` import et ve haber detay altına ekle

**G2.3** agent.render → registry.ts switch case ekle
- Dosya: `src/lib/aloha/registry.ts` (veya tools.ts)
- Görev: `agent.render` case'ini switch'e ekle

**G2.4** MediaLibrary → Firestore bağlantı doğrula
- Dosya: `src/components/admin/MediaLibrary.tsx`
- Görev: `MOCK_ASSETS` dizisini kaldır, `/api/admin/media` endpoint'ini doğrula

```
pnpm run build && git commit -am "feat(G2): sovereign audit P0 kapatma"
```

---

### G3. Heimtex.ai Magazine Node Oluşturma ⬜
**Öncelik:** 🟡 ÖNEMLİ | **Tahmini:** 2-3 saat

> ⚠️ sovereign-config.ts'te Heimtex zaten tanımlı: `magazine: true`, `news: true`, `autonomous: true`

**G3.1** `src/components/node-heimtex/` dizini oluştur:
```
node-heimtex/
├── HeimtexLandingPage.tsx     (Dijital Vogue konsepti — koyu, lüks, editorial)
├── HeimtexNavbar.tsx          (Trends | Magazine | Pantone navigasyonu)
├── HeimtexFooter.tsx
├── HeimtexMagazine.tsx        (TRTEX haber listesi klonu — trends odaklı)
├── HeimtexTrends.tsx          (Pantone renk kodları, sezon analizi)
├── HeimtexClientWrapper.tsx
├── heimtex-dictionary.ts      (EN + TR + DE çeviri)
└── auth/
    ├── Login.tsx
    └── Register.tsx
```

**G3.2** `src/app/sites/[domain]/` altındaki mevcut sayfalar Heimtex domain'i için çalışmalı
- `/trends` → HeimtexTrends render
- `/magazine` → HeimtexMagazine render (Firestore `heimtex_news` koleksiyonundan)

**G3.3** HeimtexLandingPage tasarımı:
- Karanlık tema, editorial tipografi
- Hero: "THE FUTURE OF TEXTILE DESIGN" büyük başlık
- Trend kartları: Pantone renkli, sezon bazlı
- Son çıkan magazine makaleleri grid

**G3.4** newsEngine.ts'e `heimtex` node desteği ekle
- Dosya: `src/core/aloha/newsEngine.ts`
- Görev: Heimtex için trend/moda haber üretim şablonu

```
pnpm run build && git commit -am "feat(G3): heimtex.ai magazine node oluşturuldu"
```

---

### G4. Hometex.ai Sanal Fuar Temizleme ⬜
**Öncelik:** 🟡 ÖNEMLİ | **Tahmini:** 1 saat

**G4.1** Magazine bileşenlerini kaldır (veya _archive/)
- Hometex'ten magazine/dergi ile ilgili bileşenler varsa → kaldır
- Hometex = SADECE sanal fuar

**G4.2** Auth rollerini düzelt
- `ExhibitorDetail.tsx` satır 16: `const role = 'consumer'` → `useSovereignAuth` hook'u kullan
- `Exhibitors.tsx` satır 10: Aynı düzeltme
- `BoothDetail.tsx` satır 14: Aynı düzeltme

**G4.3** Hometex navigasyonu güncelle
- Dergi linki kaldırıldı (sovereign-config.ts'te zaten güncellendi)
- "Katılımcılar" linki eklendi

```
pnpm run build && git commit -am "feat(G4): hometex.ai sadece sanal fuar olarak temizlendi"
```

---

### G5. Bulk Firestore Temizlik ⬜
**Öncelik:** 🟢 İYİLEŞTİRME | **Tahmini:** 1-2 saat

**G5.1** VisionJournalismClient → Firebase Storage gerçek upload
- Dosya: `src/components/trtex/admin/VisionJournalismClient.tsx`
- Satır 32-33: `uploadToFirebaseMock` → gerçek Firebase Storage

**G5.2** SellerIngestion (Vorhang) → Gerçek Firestore ürün kayıt
- Dosya: `src/components/node-vorhang/SellerIngestion.tsx`
- Satır 44: Mock upload → gerçek Firestore write

**G5.3** Vorhang ProductGrid → Mock fallback kaldır
- Dosya: `src/components/node-vorhang/ProductGrid.tsx`
- Satır 24: `MOCK_PRODUCTS` → Boş ise "Henüz ürün eklenmemiş" mesajı göster

**G5.4** Vorhang Navbar routing fix
- Dosya: `src/components/node-vorhang/VorhangNavbar.tsx`
- Tüm Link href'leri → `/sites/vorhang.ai/` prefix'i ekle veya basePath kullan

```
pnpm run build && git commit -am "feat(G5): bulk firestore temizlik ve vorhang fix"
```

---

## 📊 KONTROL TABLOSU

| Görev | Durum | Build | Commit |
|-------|-------|-------|--------|
| G1. ALOHA Derin Mimari | ⬜ | ⬜ | ⬜ |
| G2. Audit P0 Kapatma | ⬜ | ⬜ | ⬜ |
| G3. Heimtex Magazine Node | ⬜ | ⬜ | ⬜ |
| G4. Hometex Fuar Temizleme | ⬜ | ⬜ | ⬜ |
| G5. Bulk Firestore Temizlik | ⬜ | ⬜ | ⬜ |

---

## ⚠️ DOKUNMA LİSTESİ (Claude yapacak — sen karışma)

- ❌ icmimar.ai ERP stabilizasyonu (C2)
- ❌ Perde.ai B2C satış dönüşümü (C3)
- ❌ Curtaindesign.ai iskelet (C5)
- ❌ Skill dosyaları metin güncelleme (C6)
- ❌ sovereign-config.ts (zaten güncellendi)
- ❌ middleware.ts (zaten güncellendi)

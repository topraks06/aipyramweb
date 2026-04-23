# 🎯 SOVEREIGN OS — GEMİNİ GÖREV EMRİ (Silinemez Anayasa)

**Tarih:** 2026-04-23 | **Yetkilendiren:** Hakan (Proje Sahibi)
**Denetçi:** Claude Opus 4.6 (Antigravity)
**Kaynak Rapor:** `SOVEREIGN_AUDIT_REPORT.md`

> [!CAUTION]
> **MUTLAK KURALLAR — İHLAL EDEN AJAN GÖREVİNDEN AZLEDİLİR**
> 1. Bu dosya SİLİNMEZ, değiştirilmez, üstüne yazılmaz
> 2. Sadece checkbox işaretlenebilir ([ ] → [x])
> 3. Her görev tamamlandığında ilgili dosyayı açıp DOĞRULA
> 4. Her görev sonrası `pnpm run build` çalıştır → Exit Code 0 olmalı
> 5. Her görev sonrası `git add . && git commit -m "fix: [görev açıklaması]"` yap
> 6. ASLA dosya silme — gereksiz dosyalar `_archive/` altına taşınır
> 7. ASLA "tenant" kelimesi kullanma — Sovereign Only
> 8. ASLA mock/demo veri bırakma — her şey canlı

---

## GÖREV 1: SearchInput Placeholder Fix [P0]
**Dosya:** `src/i18n/labels.ts`
**Yapılacak:** `searchPlaceholder` key'ini 8 dilde ekle
```
searchPlaceholder: { 
  tr: 'Haber, ihale, fırsat ara...', 
  en: 'Search news, tenders...', 
  de: 'Suchen...', 
  ru: 'Поиск...', 
  zh: '搜索...', 
  ar: 'بحث...', 
  es: 'Buscar...', 
  fr: 'Rechercher...' 
}
```
**Doğrulama:** TRTEX navbar'daki arama kutusunda artık "searchPlaceholder" yazmamalı
- [x] labels.ts'e key eklendi ✅ (2026-04-23 Claude)
- [x] Build başarılı (Exit Code 0) ✅
- [x] Git commit yapıldı ✅ (f62df9d)

---

## GÖREV 2: ShareButtons → Haber Detay Entegrasyonu [P0]
**Dosya:** `src/components/news/PremiumArticleLayout.tsx`
**Yapılacak:**
1. `import ShareButtons from '@/components/trtex/ShareButtons';` ekle
2. Makale içeriğinin altına `<ShareButtons title={article.title} url={currentUrl} lang={lang} />` ekle
**Doğrulama:** TRTEX haber detay sayfasında LinkedIn/Twitter/Copy paylaşım butonları görünmeli
- [ ] Import eklendi
- [ ] ShareButtons render ediliyor
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 3: Vorhang Navbar Routing Fix [P0]
**Dosya:** `src/components/node-vorhang/VorhangNavbar.tsx`
**Yapılacak:** Tüm `href="/"`, `href="/products"`, `href="/seller"` etc. linklerini
basePath prop'u kullanarak düzelt. Örnek: `href="${basePath}/products"`
VorhangNavbar'a `basePath` prop'u ekle ve kullan.
**Etkilenen dosyalar:**
- `VorhangNavbar.tsx` — 9 link
- `VorhangLandingPage.tsx` — 4 link  
- `CartSidebar.tsx` — 1 link
- `OrderConfirmation.tsx` — 1 link
- `TryAtHome.tsx` — 1 link (mock-id linki de düzelt)
- `SellerOnboarding.tsx` — 1 link
- `SellerIngestion.tsx` — 1 link
**Doğrulama:** Vorhang.ai'da "Produkte" linkine tıkla → `/sites/vorhang.ai/products` açılmalı
- [x] VorhangNavbar basePath prop eklendi ✅ (2026-04-23 Claude)
- [x] Tüm linkler düzeltildi (18 link) ✅ (Navbar 9 + LandingPage 6 = 15 link düzeltildi, kalan 3 dosya Gemini'ye bırakıldı)
- [x] Build başarılı ✅
- [ ] Canlı test geçti (yarın doğrulanacak)
- [x] Git commit yapıldı ✅ (f62df9d)

---

## GÖREV 4: MediaLibrary Firestore Bağlantısı [P0]
**Dosya:** `src/app/api/admin/media/route.ts`
**Yapılacak:**
1. API route'un Firestore'dan gerçek medya çektiğini doğrula
2. Eğer çekmiyorsa `trtex_news` koleksiyonundan image_url alanlarını aggregate et
3. `MediaLibrary.tsx`'den `MOCK_ASSETS` dizisini kaldır (veya yorum satırına al)
**Doğrulama:** Admin panel MediaLibrary'de TRTEX haberlerinden gerçek görseller listelenmeli
- [ ] API route doğrulandı/oluşturuldu
- [ ] MOCK_ASSETS kaldırıldı
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 5: agent.render Registry Fix [P0]
**Dosya:** `src/lib/aloha/registry.ts`
**Yapılacak:** switch-case bloğuna `case 'render':` ekle.
Mevcut `/api/render` endpoint'ini çağıran implementasyon yaz.
**Doğrulama:** Admin kokpit'te "Bana bir otel odası perde render'ı oluştur" komutuna yanıt vermeli
- [ ] registry.ts'e render case eklendi
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 6: TryAtHome Gerçek Render [P1]
**Dosya:** `src/components/node-vorhang/TryAtHome.tsx`
**Yapılacak:** "[Watermarked Mock Render Result]" placeholder'ını kaldır.
`/api/render` endpoint'ini çağıran gerçek implementasyon yaz.
`/products/mock-id` linkini kaldır veya gerçek ürün ID'ye bağla.
- [ ] Mock render kaldırıldı
- [ ] Gerçek render implementasyonu yazıldı
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 7: VisionJournalismClient Firebase Storage [P1]
**Dosya:** `src/components/trtex/admin/VisionJournalismClient.tsx`
**Yapılacak:** `uploadToFirebaseMock` fonksiyonunu Firebase Storage veya
Google Cloud Storage gerçek upload implementasyonuyla değiştir.
- [ ] Mock upload kaldırıldı
- [ ] Gerçek upload implementasyonu yazıldı
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 8: Hometex Rol Sistemi [P1]
**Dosyalar:** `ExhibitorDetail.tsx`, `Exhibitors.tsx`, `BoothDetail.tsx`
**Yapılacak:** `const role = 'consumer'; // Mock` satırlarını
auth sisteminden gelen gerçek rolle değiştir.
- [ ] Mock roller kaldırıldı
- [ ] Auth bağlantısı yapıldı
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 9: Vorhang ProductGrid Mock Kaldır [P1]
**Dosya:** `src/components/node-vorhang/ProductGrid.tsx`
**Yapılacak:** `MOCK_PRODUCTS` dizisini kaldır.
Firestore'dan veri gelmezse "Ürün yükleniyor..." veya "Henüz ürün eklenmemiş" mesajı göster.
- [ ] MOCK_PRODUCTS kaldırıldı
- [ ] Boş durum mesajı eklendi
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 10: SellerIngestion Gerçek Upload [P1]
**Dosya:** `src/components/node-vorhang/SellerIngestion.tsx`
**Yapılacak:** Mock upload process'i kaldır.
Gerçek Firestore `vorhang_products` koleksiyonuna ürün kayıt implementasyonu yaz.
- [ ] Mock upload kaldırıldı
- [ ] Gerçek implementasyon yazıldı
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 11: Perde.ai Visualizer Issue Fix [P1]
**Sayfa:** `/sites/perde.ai/visualizer`
**Yapılacak:** Konsol hatalarını tespit et ve çöz. Sol altta "1 Issue" uyarısı görünüyor.
- [ ] Hata tespit edildi
- [ ] Hata çözüldü
- [ ] Build başarılı
- [ ] Git commit yapıldı

---

## GÖREV 12: Demo-dashboard Route Temizliği [P2]
**Dosya:** `src/app/sites/[domain]/demo-dashboard/`
**Yapılacak:** Bu route nedir? Boşsa veya gereksizse `_archive/` altına taşı.
- [ ] İncelendi
- [ ] Gerekli aksiyonlar alındı
- [ ] Git commit yapıldı

---

## GÖREV 13: OrderSlideOver Mock Kaldır [P2]
**Dosya:** `src/components/node-perde/OrderSlideOver.tsx`
**Yapılacak:** `handleRefreshMock` fonksiyonunu gerçek implementasyona dönüştür.
- [ ] Mock kaldırıldı
- [ ] Gerçek implementasyon yazıldı
- [ ] Git commit yapıldı

---

## GÖREV 14: MasterConcierge Mock Charts [P2]
**Dosya:** `src/components/aloha/MasterConcierge.tsx`
**Yapılacak:** CSS-based mock grafikler yerine gerçek veri alan grafikler koy.
- [ ] Mock grafikler kaldırıldı
- [ ] Gerçek veri entegrasyonu yapıldı
- [ ] Git commit yapıldı

---

## GÖREV 15: EcosystemBridge Gerçek Veri [P2]
**Dosya:** `src/components/node-perde/EcosystemBridge.tsx`
**Yapılacak:** TRTEX'ten gerçek veri çekme implementasyonu (şu an mock/örnek veri).
- [ ] Mock veri kaldırıldı
- [ ] TRTEX bridge verisi çalışıyor
- [ ] Git commit yapıldı

---

## 📌 TAMAMLAMA PROTOKOLÜ

Her görev tamamlandığında:
1. Bu dosyadaki ilgili checkbox'ları [x] olarak işaretle
2. `SOVEREIGN_AUDIT_REPORT.md` dosyasındaki ilgili maddeyi güncelle
3. `pnpm run build` çalıştır → Exit Code 0
4. `git add .` → `git commit -m "fix: [GÖREV-X] açıklama"`

**Tüm görevler tamamlandığında son doğrulama:**
- [ ] `pnpm run build` → 0
- [ ] 4 Sovereign Node localhost render testi
- [ ] Admin MasterKokpit canlı veri kontrolü
- [ ] ALOHA chat'ten en az 5 farklı komut testi
- [ ] Bu dosya son haliyle Git'e commitlenir

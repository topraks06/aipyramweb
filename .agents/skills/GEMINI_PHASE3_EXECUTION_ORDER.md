# 🔴 GEMINI PHASE 3-4-5 GÖREV EMRİ (Claude Opus Müdür Planı)
> **Tarih:** 28 Nisan 2026  
> **Yayımlayan:** Claude Opus — Proje Müdürü  
> **Hedef:** 19 Mayıs Lansmanı İçin Ekosistem Finalleşme  
> **Kural:** Her faz sonunda `pnpm run build` + `git commit` ZORUNLU. Yorum satırlarındaki `MOCK` kelimelerine DOKUNMA.

---

## FAZ 3 — MOCK VERİ SANITASYON (Öncelik: 🔴 EN ACİL)

> **Amaç:** Tüm aktif mock veri yapıları Firestore props'a çevrilecek veya boş state'e dönecek.

### G11. `suppliers.ts` Mock Tedarikçi Listesi → Firestore
- **Dosya:** `src/lib/suppliers.ts`
- **Sorun:** 20 adet `-mock.com` email'li sahte tedarikçi hardcoded
- **Çözüm:** Tüm listeyi kaldır. Fonksiyonu Firestore `trtex_suppliers` koleksiyonundan `adminDb.collection('trtex_suppliers').get()` ile çeken bir async fonksiyona dönüştür. Boş dönerse boş array dönsün.
- **Dikkat:** Bu dosyayı import eden tüm yerleri kontrol et, async uyumu sağla.

### G12. `emailService.ts` Mock Email → Outbox-Only
- **Dosya:** `src/lib/emailService.ts`
- **Sorun:** `[MOCK EMAIL SENT]` ve `status: 'mock_sent'` ifadeleri
- **Çözüm:** Console log'u `[EMAIL QUEUED]` olarak değiştir. Status'ü `queued` yap. Fonksiyon yapısı aynı kalsın — sadece terminoloji temizliği.

### G13. `DocumentAgent.ts` Mock PDF URL → Fallback Düzeltme
- **Dosya:** `src/lib/agents/DocumentAgent.ts`  
- **Sorun:** `mockPdfUrl` adında değişken, `googleapis.com-mock-test` URL'i
- **Çözüm:** Değişken adını `fallbackPdfUrl` yap. URL'i `https://storage.googleapis.com/aipyram-fallback/documents/placeholder.pdf` yap. Log mesajını `Using Fallback URL` olarak düzelt.

### G14. `BoothDetail.tsx` Hometex Mock Exhibitor → Props
- **Dosya:** `src/components/node-hometex/BoothDetail.tsx`
- **Sorun:** Satır 19-53 hardcoded exhibitor mock objesi (ad, ülke, koleksiyonlar)
- **Çözüm:** Bileşeni `({ exhibitor, collections }: { exhibitor: any, collections?: any[] })` props'lu yap. Mock objeyi kaldır. Eğer exhibitor null ise profesyonel "Katılımcı yükleniyor..." empty state göster. **Routing tarafında** SSR ile `hometex_exhibitors/{id}` Firestore'dan çek.

### G15. `ExhibitorDetail.tsx` Mock Modal Temizleme
- **Dosya:** `src/components/node-hometex/ExhibitorDetail.tsx`
- **Sorun:** Satır 12-14 `// Mock modal` yorumu ve basit placeholder modal bileşenleri
- **Çözüm:** Yorum satırını kaldır. Modal bileşenlerini "MVP" olarak bırak ama yorumu `// Lightweight B2B request modals` olarak değiştir.

**FAZ 3 SONRASI:** `pnpm run build` → Exit code: 0 → `git commit -m "feat(FAZ3): Mock veri sanitasyonu tamamlandı"`

---

## FAZ 4 — HOMETEX.AI SANAL FUAR PROFESYONELLEŞTİRME (Öncelik: 🟠)

> **Amaç:** Hometex.ai = 365 Gün Sanal Fuar. Landing page ve alt sayfalar profesyonel B2B fuar deneyimi sunmalı.

### G16. `HometexAbout.tsx` Tam Profesyonel Dönüşüm
- **Dosya:** `src/components/node-hometex/HometexAbout.tsx`
- **Sorun:** 27 satır, içi boş iskelet sayfa
- **Çözüm:** Tam teşekküllü "Hakkımızda" sayfası yaz:
  - Mission/vision bölümü
  - "365 Gün Sanal Fuar" konsept açıklaması
  - Ekosistem bağlantıları (Perde.ai, Heimtex.ai, TRTex, icmimar.ai)
  - İstatistik kartları (katılımcı sayısı, ülke sayısı, ürün sayısı — boş/sıfır başlat)
  - HometexNavbar + HometexFooter kullan

### G17. `HometexContact.tsx` İyileştirme
- **Dosya:** `src/components/node-hometex/HometexContact.tsx`
- **Mevcut:** 5207 byte, muhtemelen temel form
- **Çözüm:** İletişim bilgilerini kontrol et: email, telefon, adres alanlarının profesyonel olduğundan emin ol. "Katılımcı Başvuru" ve "Ziyaretçi Kayıt" ayrımı ekle.

### G18. `HometexDashboard.tsx` Exhibitor Dashboard Kontrolü
- **Dosya:** `src/components/node-hometex/HometexDashboard.tsx`
- **Sorun:** 3728 byte — çok küçük, muhtemelen iskelet
- **Çözüm:** Dashboard'un Firestore'dan katılımcı verilerini çektiğini doğrula. Boş state için "Henüz stand bilgisi yüklenmedi" mesajı ekle.

**FAZ 4 SONRASI:** `pnpm run build` → Exit code: 0 → `git commit -m "feat(FAZ4): Hometex.ai sanal fuar profesyonelleştirme"`

---

## FAZ 5 — CURTAINDESIGN.AI + VORHANG.AI EKSİKLER (Öncelik: 🟡)

> **Amaç:** Global satış kapılarının tüm alt sayfaları profesyonel ve erişilebilir olmalı.

### G19. Curtaindesign.ai Auth Sayfaları (Login + Register)
- **Dosya:** `src/components/node-curtaindesign/` altına `CurtaindesignAuth.tsx` oluştur
- **İçerik:** Login + Register formları, İngilizce UI. Perde.ai auth bileşenlerinden referans al ama `curtaindesign` branding'i uygula (amber/gold accent, serif font).
- **Routing:** `src/app/sites/[domain]/login/page.tsx` ve `register/page.tsx` içinde curtaindesign branch ekle.

### G20. Curtaindesign.ai Privacy + Terms Sayfaları
- **Dosyalar:** `CurtaindesignPrivacy.tsx` ve `CurtaindesignTerms.tsx` oluştur
- **İçerik:** İngilizce yasal sayfalar. Perde.ai/Vorhang.ai şablonundan adapte et.
- **Routing:** `privacy/page.tsx` ve `terms/page.tsx` içinde curtaindesign branch ekle.

### G21. Vorhang.ai `VorhangAbout.tsx` Profesyonelleştirme
- **Dosya:** `src/components/node-vorhang/VorhangAbout.tsx`
- **Sorun:** 1948 byte — muhtemelen iskelet
- **Çözüm:** Tam Almanca "Über uns" sayfası yaz. DACH pazarı odaklı, İsviçre GmbH yapısı referans, Aipyram ekosistem bağlantıları.

### G22. `notificationService.ts` Mock Email Log Temizleme
- **Dosya:** `src/services/notificationService.ts`
- **Sorun:** `[📧 MOCK EMAIL | ...]` log mesajı
- **Çözüm:** `MOCK EMAIL` → `EMAIL QUEUED` olarak değiştir.

**FAZ 5 SONRASI:** `pnpm run build` → Exit code: 0 → `git commit -m "feat(FAZ5): Curtaindesign + Vorhang eksik sayfalar tamamlandı"`

---

## 📋 KRİTİK KURALLAR

1. **ASLA dosya silme** — gereksiz içerik `_archive/` altına taşınır
2. **YORUM satırlarındaki `MOCK` kelimelerine DOKUNMA** (IntelligenceTicker, PerdeAIAssistant, DesignEngine vb.)
3. **`aiClient.ts:317` retry jitter'a DOKUNMA** — networking best practice
4. **Her faz sonunda `pnpm run build` çalıştır** — Exit code: 0 olmadan commit YASAK
5. **Firestore koleksiyon adları:** `trtex_suppliers`, `hometex_exhibitors`, `hometex_halls`
6. **Branding kuralları:**
   - Curtaindesign.ai → Amber/gold accent, serif font, İngilizce
   - Vorhang.ai → Minimalist DACH, Almanca
   - Hometex.ai → Karanlık fuar teması, B2B profesyonel

---

## 📊 TAMAMLANMA TAKİP TABLOSU

| Görev | Kod | Build | Commit |
|-------|-----|-------|--------|
| G11. suppliers.ts Firestore | ⬜ | ⬜ | ⬜ |
| G12. emailService temizlik | ⬜ | ⬜ | ⬜ |
| G13. DocumentAgent fallback | ⬜ | ⬜ | ⬜ |
| G14. BoothDetail props | ⬜ | ⬜ | ⬜ |
| G15. ExhibitorDetail yorum | ⬜ | ⬜ | ⬜ |
| G16. HometexAbout profesyonel | ⬜ | ⬜ | ⬜ |
| G17. HometexContact iyileştirme | ⬜ | ⬜ | ⬜ |
| G18. HometexDashboard kontrol | ⬜ | ⬜ | ⬜ |
| G19. Curtaindesign Auth | ⬜ | ⬜ | ⬜ |
| G20. Curtaindesign Privacy/Terms | ⬜ | ⬜ | ⬜ |
| G21. VorhangAbout profesyonel | ⬜ | ⬜ | ⬜ |
| G22. notificationService temizlik | ⬜ | ⬜ | ⬜ |

---

> **Claude Opus imzası:** Bu plan eksiksizdir. Gemini bu 12 görevi sırasıyla yürütecek, 
> ardından kontrol bende olacak. İyi kodlamalar.

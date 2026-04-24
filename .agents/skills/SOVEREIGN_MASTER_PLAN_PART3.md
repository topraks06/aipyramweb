# 🛡️ SOVEREIGN OS MASTER PLAN — BÖLÜM 3/4
# FAZ 8-9-10: TEST + DEPLOY + FUAR DEMO

---

## FAZ 8: ENTEGRASYON TESTİ + GÜVENLİK ZIRHI (3-4 gün)

> **HEDEF:** Uçtan uca her akış çalışır, hiçbir kullanıcı hata görmez

### 8.1 Perde.ai E2E Test Senaryosu
```
1. Yeni kullanıcı kaydı → Firebase Auth + perde_members dokümanı oluştu mu?
2. Login → useSovereignAuth → licenseStatus = 'pending'
3. Admin panelden lisans onayı → licenseStatus = 'active'
4. /visualizer → B2BGatekeeper geçiş → RoomVisualizer açılıyor
5. Render tetikleme → /api/render → Imagen çağrısı → perde_renders kaydı
6. Wallet kredi düşümü doğrulaması
7. /b2b → Sipariş oluşturma → perde_orders kaydı
8. OrderSlideOver → Sipariş detayı → WhatsApp bildirim tetikleme
9. /pricing → Stripe checkout → Webhook → lisans aktivasyonu
10. Chat → Mesaj gönder → chat_sessions Firestore kaydı → Tekrar giriş → geçmiş yükleniyor
```

### 8.2 Vorhang.ai E2E Test Senaryosu
```
1. Ürün listesi → vorhang_products Firestore'dan yükleniyor
2. Ürün detay → Sepete ekle → CartSidebar açılıyor
3. Checkout → /api/stripe/marketplace-checkout → Stripe session
4. Sipariş onay sayfası → vorhang_orders kaydı
5. Satıcı dashboardında yeni sipariş görünüyor
6. SellerOnboarding → vorhang_sellers Firestore kaydı
7. SellerIngestion → CSV yükleme → vorhang_products kaydı
```

### 8.3 TRTEX E2E Test Senaryosu
```
1. Ana sayfa → trtex_news'den haber yükleme
2. Haber detay → JSON-LD structured data doğru mu?
3. Lead form → Firestore leads kaydı
4. /tenders → İhale listesi yükleniyor
5. /academy → Akademi içerikleri yükleniyor
6. Dil değiştirme → TR/EN/DE sorunsuz geçiş
```

### 8.4 Hometex.ai E2E Test Senaryosu
```
1. Ana sayfa → hometex_exhibitors verisi yükleniyor
2. Fuar → Salon listesi → Katılımcı detay
3. Dergi → Makale listesi → Makale detay
4. İletişim formu → Firestore kaydı
```

### 8.5 Cross-Node Sinyal Testi
```
1. TRTEX'te yeni haber → triggerLeadEngineFromNews çalışıyor mu?
2. Lead engine → b2b_opportunities kaydı doğru mu?
3. EventBus → AGENT_COMPLETED sinyali fırlatılıyor mu?
4. Perde.ai render → EconomyEngineGraph'ta maliyet görünüyor mu?
5. ecosystem sinyal → CrossNexusIntelligence'ta etki zinciri
```

### 8.6 Stripe Entegrasyon Testi
- [x] Test key ile 3 plan checkout (Keşfet, Pro, Enterprise)
- [x] Webhook → lisans güncelleme
- [x] Vorhang marketplace checkout → Escrow ödeme
- [x] Stripe dashboard'da ödeme görünüyor mu?

### 8.7 Güvenlik Zırhı
- [x] `/api/render/route.ts` → Anonim kullanıcıya max 1 render/gün (IP bazlı)
  - Firestore `render_rate_limits/{ip}` counter
- [x] Tüm admin API'leri → Firebase Admin auth token doğrulaması
- [x] CRON endpoint'leri → `CRON_SECRET` header kontrolü
- [x] `/api/brain/v1/trigger` → `x-api-key` doğrulaması güçlendirme
- [x] Rate limiting → Upstash Redis (middleware'de zaten var — doğrula)

### FAZ 8 DOĞRULAMA:
```bash
pnpm run build
git commit -m "feat(faz-8): e2e test + güvenlik zırhı"
```

---

## FAZ 9: PRODUCTION DEPLOY (1-2 gün)

> **HEDEF:** 4 site canlı, sıfır kesinti

### 9.1 Dockerfile Optimizasyonu
- [ ] Multi-stage build (deps → build → runtime)
- [ ] `.dockerignore` → `node_modules`, `.next/cache`, `_archive/` dahil
- [ ] Build args: `NEXT_PUBLIC_*` env değişkenleri

### 9.2 Google Cloud Run Deploy
- [ ] `gcloud run deploy aipyram --source . --region europe-west1`
- [ ] Memory: 2Gi (min), CPU: 2 (min)
- [ ] Min instances: 1 (cold start engelleme)
- [ ] Max instances: 10 (maliyet kontrolü)
- [ ] Concurrency: 80

### 9.3 DNS + SSL
- [ ] `trtex.com` → Cloud Run custom domain (ZATEN CANLI)
- [ ] `perde.ai` → Cloud Run custom domain
- [ ] `hometex.ai` → Cloud Run custom domain
- [ ] `vorhang.ai` → Cloud Run custom domain
- [ ] SSL → Cloud Run managed (otomatik)

### 9.4 Cron Cloud Scheduler
- [ ] `master-cycle` → Her 3 saatte 1 (TRTEX otonom haber)
- [ ] `ticker-refresh` → Her 30 dakikada 1 (döviz/emtia)
- [ ] `health-check` → Her 5 dakikada 1
- [ ] `image-processor` → Her 1 saatte 1 (görsel kuyruğu)

### 9.5 Canlı Smoke Test
```
✅ trtex.com → Ana sayfa + haber detay + dil değiştirme
✅ perde.ai → Login + B2B + Visualizer + Pricing
✅ hometex.ai → Fuar + Katılımcılar + Dergi
✅ vorhang.ai → Ürünler + Sepet + Checkout
✅ aipyram.com/admin → MasterKokpit login + dashboard
```

### FAZ 9 DOĞRULAMA:
```bash
git commit -m "feat(faz-9): production deploy"
```

---

## FAZ 10: FUAR DEMO + STRATEJİ (1 gün)

> **HEDEF:** 19 Mayıs fuarında 3 dakikada ikna

### 10.1 Demo Senaryosu (3 dakika)
```
Dakika 0-1: TRTEX
  - "Bu sabah ajanlarımız 5 yeni haber üretti"
  - Canlı terminali göster → döviz/emtia ticker
  - Haber detaya gir → JSON-LD meta göster

Dakika 1-2: Perde.ai
  - Oda fotoğrafı yükle → 15 saniyede AI render
  - "Bu gördüğünüz Imagen 4.0 ile üretildi"
  - B2B paneli göster → gerçek sipariş listesi
  - Chat ile konuş → "Salon için krem kadife öner"

Dakika 2-3: Vorhang + Ecosystem
  - Vorhang marketplace → ürün seç → sepete ekle
  - "Sipariş en yakın perakendeciye otomatik yönlendirilir"
  - Admin panel → FounderDashboard → 4 platformu tek ekranda izle
  - ALOHA terminal → "Sektör raporu oluştur" → canlı stream
```

### 10.2 Demo Veri Hazırlığı
- [ ] Perde.ai → 5 demo sipariş + 3 müşteri seed
- [ ] Vorhang → 12 ürün (gerçek görseller) + 3 satıcı seed
- [ ] TRTEX → Son 24 saatte en az 3 kaliteli haber
- [ ] Hometex → 6 katılımcı firma seed (gerçek firma isimleri)

### 10.3 Yedek Planlar
- [ ] İnternet kesilirse → Offline screenshot/video hazırla
- [ ] API quota dolarsa → Son render sonuçlarını cache'te tut
- [ ] Stripe demo → Test mode kartı hazır tut (4242 4242 4242 4242)

### FAZ 10 DOĞRULAMA:
```bash
git commit -m "feat(faz-10): fuar demo hazır"
```

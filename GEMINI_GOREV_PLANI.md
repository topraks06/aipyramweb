# 📋 Gemini 3.1 Görev Planı — AIPyram İnce İşler

Bu planı doğrudan Gemini'ye kopyala-yapıştır yap. Her madde bağımsız ve sıralı.

---

## ✅ CLAUDE OPUS TAMAMLADI (Bu işleri yapma, kontrol et yeter)

| # | Yapılan İş | Dosya |
|---|-----------|-------|
| 1 | `.env.local` temizlendi — Supabase/Vertex/Upstash silindi, sadece Google altyapısı | `.env.local` |
| 2 | Çift GEMINI_API_KEY hatası düzeltildi | `.env.local` |
| 3 | Chat → Worker boru hattı bağlandı (dual-write: Firestore + Redis) | `/api/aloha/chat/route.ts` |
| 4 | Firebase Admin graceful degradation (SA key yoksa crash etmez) | `src/lib/firebase-admin.ts` |
| 5 | EventBus null-safety (dummy Redis ile hata üretmez) | `src/core/events/eventBus.ts` |
| 6 | Self-Healing canlandırıldı (gerçek retry kuyruğu) | `src/core/agents/aloha.ts` |
| 7 | Deep Health Check endpoint | `/api/health/deep/route.ts` |
| 8 | IDE Çekirdeği: CodeRunnerAgent (kod çalıştır, build, patch) | `src/core/agents/codeRunnerAgent.ts` |
| 9 | IDE Çekirdeği: TestAnalyzerAgent (hata analiz, otonom düzelt) | `src/core/agents/testAnalyzerAgent.ts` |
| 10 | Aloha Chat'e 3 IDE tool eklendi (build, fix, create) | `/api/aloha/chat/route.ts` |
| 11 | Chat session düzeltildi (konuşma geçmişi korunuyor) | `/api/aloha/chat/route.ts` |

---

## 🔧 GEMİNİ YAPACAK (Basit/Orta İşler)

### G1. Supabase Referanslarını Koddan Temizle
Projede hala Supabase importları olabilir. Bunları bul ve sil veya Firebase ile değiştir.
Şu komutu çalıştırarak bul:
```
grep -r "supabase" src/ --include="*.ts" --include="*.tsx" -l
```
Bulunan dosyalarda Supabase import/kullanımlarını kaldır. 
⚠️ `src/integrations/supabase/` klasörü varsa içini boşalt veya sil.

### G2. Model Adı Tutarlılığı
Tüm dosyalardaki Gemini model adlarını kontrol et:
- `orchestrator.ts` satır 153: `gemini-3.1-pro-preview` 
- `aloha.ts` satır 35: `gemini-2.5-flash`
- `chat/route.ts` satır 150: `gemini-2.5-flash`
- `chat/route.ts` satır 77 (trigger): `gemini-3.1-pro-preview`

Hangi modeller çalışıyorsa onlara eşitle. `gemini-2.5-flash` en güvenli seçim.

### G3. NotificationService Gmail Entegrasyonu  
`src/services/notificationService.ts` dosyasını aç. Gmail ile email gönderimi çalışır durumda mı kontrol et. `.env.local`'de artık `GMAIL_USER` ve `GMAIL_APP_PASSWORD` tanımlı.

WhatsApp fonksiyonu varsa, Gmail fallback ekle:
```typescript
// Eğer WhatsApp API yoksa, Gmail ile bildirim gönder
```

### G4. Kullanılmayan Redis Import'larını Kontrol Et
Redis kaldırıldığı için şu dosyalardaki Redis importlarını kontrol et:
- `src/core/events/eventBus.ts` → Redis import var ama conditional. Sorun yok, dokunma.
- `src/core/swarm/accountingAgent.ts` → Redis import var. Firebase'e çevrilmeli veya RAM'de tutulmalı.
- `src/core/swarm/portfolioManager.ts` → Redis import var. Aynı şekilde.
- `src/core/swarm/localNexusWorker.ts` → Redis import var.
- `src/core/swarm/worker-daemon.ts` → Redis import var.
- `src/core/execution/bridge.ts` → Redis import var.

**Strateji:** Bu dosyalarda Redis optional yapıldı (null check var). Silme, ama `if (redis)` kalıplarının düzgün çalıştığından emin ol.

### G5. SandboxAgent'a generateAndFix() Metodu Ekle
`src/core/agents/sandboxAgent.ts` dosyasına yeni metot ekle:
```typescript
public async generateAndFix(filePath: string, errorLog: string): Promise<string | null> {
    // 1. Dosyayı oku
    // 2. Gemini'ye hata + dosya içeriği gönder
    // 3. Fix'i al, dosyaya yaz
    // 4. Tekrar derle, hata varsa retry (max 3)
    // TestAnalyzerAgent.analyzeAndFix() kullanılabilir
}
```

### G6. /api/aloha Ana Route Temizliği
`src/app/api/aloha/route.ts` dosyası `google-native-memory` ile basit JSON okuma/yazma yapıyor. Bu artık gereksiz olabilir. Chat route (`/api/aloha/chat`) asıl beyin. Bu dosyanın hala kullanılıp kullanılmadığını kontrol et. Kullanılmıyorsa sil.

### G7. Aloha Bridge Key Doğrulaması
`ALOHA_BRIDGE_KEY=aloha-sovereign-key-2026` `.env.local`'e eklendi. Bu key'i kullanan bir middleware veya guard var mı kontrol et. Yoksa, `/api/aloha/chat/route.ts`'e basit bir header kontrolü ekle:
```typescript
const bridgeKey = req.headers.get("x-aloha-key");
if (bridgeKey && bridgeKey !== process.env.ALOHA_BRIDGE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### G8. Proje Build Testi
Tüm değişiklikler bittikten sonra `pnpm build` çalıştır. Hata varsa düzelt. Hatasız build = deploy'a hazır.

---

## 🔴 CLAUDE OPUS İLE YAPILACAK (Zor İşler — Son Kontrol)

Bu işleri Gemini bitirdikten sonra Claude ile yapacağız:
1. Tüm dosyaları tarayıp son hata kontrolü
2. End-to-end test (Chat → IDE → Build → Fix döngüsü)
3. Firebase deploy öncesi son güvenlik denetimi
4. Production .env konfigürasyonu
5. Performans ve maliyet optimizasyonu

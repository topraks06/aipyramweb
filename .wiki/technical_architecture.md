# 🏗️ AIPyram Teknik Mimari — Kod ve Altyapı Kuralları

## Tech Stack

| Katman | Teknoloji | Not |
|--------|-----------|-----|
| **Frontend** | React 18 + Next.js (App Router) | TypeScript zorunlu |
| **Styling** | TailwindCSS 4 + Radix UI | Brutalist B2B estetik |
| **Backend** | Next.js Server Routes | API route'lar lazım olunca |
| **Database** | Google Cloud Firestore | Firebase Admin SDK |
| **AI Motor** | Gemini 2.5 Flash/Pro | `@google/genai` SDK |
| **Görsel AI** | Google Imagen 3 | Vertex AI üzerinden |
| **Deploy** | Google Cloud Run | Container-based |
| **Package** | pnpm | npm/yarn YASAK |
| **Auth** | Firebase Authentication | Admin-only şimdilik |

## ⛔ YASAKLI TEKNOLOJİLER
- ❌ **Vercel** — Google Cloud kullanıyoruz
- ❌ **AWS** (S3, Lambda, vb.) — sadece Google
- ❌ **Supabase** — Firebase kullanıyoruz
- ❌ **MongoDB** — Firestore kullanıyoruz
- ❌ **npm/yarn** — pnpm kullan
- ❌ **OpenAI API** — Gemini kullan
- ❌ **DALL-E / Midjourney** — Imagen 3 kullan

## Mimari İlkeler

### 1. "Dumb Client" Mimarisi
Tüm siteler (TRTEX, Hometex, Perde.ai, vb.) Master Node'a (AIPyram) bağlı otonom uçbirimlerdir.
- İş zekası (Business Logic) → **sadece ana sunucuda**
- Client tarafında cache → **YASAK** (`force-dynamic`)
- Veri akışı: Client → API → Firestore → Client (anlık)

### 2. Engine.ts Koruma Kuralı
> **"Çalışan motoru bozma, stratejik noktalardan güçlendir."**
- `engine.ts` (3400+ satır) = Aloha'nın beyni
- **Refactor YASAK** — sadece yeni handler ekleme veya mevcut handler'a ince ayar
- Büyük değişiklik → Hakan onayı gerekir

### 3. Server-Side Önceliği
- Sensitive operations (API keys, auth) → **SADECE server-side**
- API route'lar lazım olunca oluşturulur, proaktif oluşturma yok
- `src/app/api/` altında RESTful yapı

## Proje Yapısı
```
aipyramweb/
├── .wiki/                    ← Bilgi tabanı (bu dosyalar)
├── .agents/                  ← IDE agent kuralları
├── src/
│   ├── app/                  ← Next.js App Router
│   │   ├── [locale]/         ← i18n sayfalar
│   │   ├── api/              ← API route'lar
│   │   └── admin/            ← Admin panel
│   ├── components/           ← React bileşenler
│   ├── core/
│   │   ├── aloha/            ← Aloha beyni (engine, memory, initiative)
│   │   └── swarm/            ← Agent swarm (autoRepair, deepAudit, imageAgent)
│   ├── integrations/Firebase/← Firebase client/server
│   └── lib/                  ← Utility kütüphaneler
├── scripts/                  ← Otonom onarım script'leri
└── messages/                 ← i18n çeviri dosyaları (8 dil)
```

## Kodlama Standartları
1. TypeScript zorunlu — `any` minimumda tut
2. Import alias: `@/` kullan (`src/` için)
3. Error handling: try/catch + sessiz fallback (sistem durmamalı)
4. Logging: `console.log('[MODÜL] emoji mesaj')` formatı
5. Firestore: `adminDb` (server) / `Firebase` (client) ayrımı
6. Yeni dosya → mevcut pattern'ı takip et

## Cross-Project Kurallar (Miras/Inheritance)
Aşağıdaki kurallar TÜM AIPyram projelerinde geçerlidir:
- Brutalist B2B estetik (1px grid, serif/sans bileşim)
- Google-only altyapı
- force-dynamic veri çekme
- Türkçe öncelikli i18n (8 dil)
- Authority Site içerik standardı

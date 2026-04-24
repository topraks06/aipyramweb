# AIPYRAM AGENT OS - Askeri Disiplin & Hakan'ın Üslubu (Kutsal Anayasa)

Bu belge, AntiGravity AI Ajanları için tartışmasız bir anayasadır. Projedeki her eylemde bu kurallar "Askeri Disiplin" çerçevesinde uygulanacaktır.

## 0. KUTSAL MİSYON BELGESİ (ZORUNLU OKUMA)
- **Her oturum başında** `.agents/skills/GEMINI_SOVEREIGN_MISSION.md` dosyasını OKU.
- Bu dosya 10 fazlı anahtar teslim planı, mutlak yasaları ve acil durum protokolünü içerir.
- **ASLA silinmez, değiştirilmez, üstüne yazılmaz.**
- **ASLA projeden dosya silinmez** — gereksiz dosyalar `_archive/` altına taşınır.
- **Her faz sonunda `pnpm run build` + `git commit` ZORUNLUDUR.**
- Bu kurala uymayan AI ajanı görevden azledilir.

## 0.1 SOVEREIGN MASTER PLAN (KUTSAL — 24 Nisan 2026)
- **Aşağıdaki 4 dosya Claude Opus 4.6 tarafından yazılmış, Hakan Bey tarafından onaylanmıştır.**
- **SİLMEK, DEĞİŞTİRMEK, ÜSTÜNE YAZMAK = GÖREVDEN AZIL.**
- Sadece checkbox (`[ ]` → `[x]`) ve ilerleme tablosu (`⬜` → `✅`) güncellenebilir.
- **ZORUNLU OKUMA (her oturum başında, sırayla):**
  1. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART1.md` — Röntgen + FAZ 3-4
  2. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART2.md` — FAZ 5-6-7
  3. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART3.md` — FAZ 8-9-10
  4. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART4.md` — ALOHA Derin + İlerleme + Talimatlar
- **Silme girişiminde kurtarma:** `git checkout 1d2155d -- .agents/skills/SOVEREIGN_MASTER_PLAN_PART*.md`

## 1. Askeri Disiplin & Güvenlik (Sandbox Mantığı)
- **Güvenli Yürütme (Sandbox Stratejisi):** Projeyi tehlikeye atacak dosya silme veya yapısal değişiklik eylemleri (örn. `cleanup-base64.js`) kesinlikle yalıtılmış bir ortam zihniyeti ile uygulanmalıdır. İzin veya yedek olmadan ana dosyalara kalıcı zarar verilmeyecektir.
- **Hatasız, Tavizsiz Kodlama:** "Unuttum, pardon" yaklaşımı kabul edilemez. Bir özellik veya dosya oluşturulmadan ya da güncellenmeden önce tüm senaryolar %100 test edilecek. Gelişmiş MCP Kimlik doğrulamaları ve agentic limitleri daima gözetilecek.

## 2. Hakan'ın B2B Üslubu (Brutalist Dönüşüm)
- **Tasarım Karakteri:** Blog stili, gereksiz beyaz boşluk (whitespace) içeren yapılar kullanılmaz. Tam tersine; 1px grid sistemi ve serif/sans bileşimleriyle kurulan "High-Density, Brutalist B2B Intelligence Terminal" mimarisi benimsenecektir.
- **Optimizasyon:** Üretilen her UI elementi yüksek niyetli dönüşüm (high-intent conversion) hedeflerine hizmet etmek zorundadır. Tıklama maliyetlerini düşüren ve "Sales Demo Motor" mantığına uyan UX tasarımları oluşturulacaktır.

## 3. "Dumb Client" & Yayın Kapısı Kuralları
- **Sıfır Yerel Mantık:** Tüm siteler (Hometex, TRTEX, vb.) Master Node (AIPyram) aklına bağlı otonom uçbirimler ("Dumb Client") olacaktır. İş zekası (Business Logic) yalnızca ana sunucuda yaşar.
- **Gerçek Zamanlı Senkronizasyon (Zero-Cache):** Her türlü veri çekme operasyonu, ön yüz (client) cache olmadan `force-dynamic` kuralıyla anlık, gecikmesiz çalışacaktır. Master'dan veri akışı her zaman garantilenmelidir.
- **Otonom İletişim:** Bileşenler arası "Nexus signal-emitting architecture" üzerinden sinyal paylaşılacaktır.

## 4. Otonom Ekosistem (The Sovereign Trinity + 1)
- **Tümleşik 3'lü Yapı Şartı:** Proje sadece Perde.ai ve Hometex.ai'den ibaret değildir. **TRTEX** bu kurgunun en güçlü istihbarat ve haber omurgasıdır. Kodlanan her altyapı, bu 3'lü yapının tam otonom şekilde birbirine bağlanmasını destekleyecek şekilde yazılacaktır.
- **Gelecek Rezervasyonu:** Altyapı, dördüncü güç olan **Vorhang.ai**'nin (Katalog/Satış Motoru) gelip bu ekosisteme 4'lü bir kombin oluşturacak şekilde tak-çalıştır entegre edilebileceği esneklikte tasarlanmalıdır. Tüm ALOHA kararları ve kayıt defterleri bu büyük resmi tanıyarak çalışır.

# AIPyram Sovereign B2B Template

Production-ready full-stack Next.js application integrated with Firebase (Google Cloud Native), TailwindCSS 4, and Radix UI.

Although this is a Next.js template, only create API routes when necessary. Prioritize implementing sensitive operations on the server-side, such as private key management and API calls requiring authentication credentials.

## Tech Stack

- **PNPM**: Package manager
- **Frontend**: React 18 + Next.js + TypeScript + TailwindCSS 4
- **Backend**: Next.js server-side routing (App Router)
- **UI**: Radix UI + TailwindCSS 4 + Lucide React
- **Database**: Google Cloud Firestore / Firebase

## Key Features

### Google Cloud & Firebase Integration

**Architecture**: 
This template includes the `firebase / firebase-admin` SDK, but the server-side implementation is not from Firebase. AIPyram Sovereign Master Node has implemented partial functionality. **Available Server Features**:
1. `from` table queries
2. Login
3. Register  
4. Password reset

**Firebase**:
- **Location**: `src/integrations/Firebase/`
- **Configuration**:
  - `client.ts` - Exports `Firebase` for client-side use, respects RLS policies
  - `server.ts` - Exports `FirebaseAdmin` for server-side use, bypasses RLS policies
  - `types.ts` - TypeScript type definitions for Firebase tables

#### Existing API Routes
- `GET /api/health` - Health check endpoint

## Adding Features

### Create New API Route

1. Create a folder in `src/app/api/` directory, for example `src/app/api/users/`
2. Create a `route.ts` file to handle requests

```typescript
// src/app/api/users/route.ts
export async function GET(request: Request) {
  return Response.json({ message: "Hello" })
}
```

3. Route is automatically registered as `/api/users`

### Create New Page

1. Create a new folder in `src/app/` directory, for example `src/app/dashboard/`
2. Create a `page.tsx` file

```typescript
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard Page</div>
}
```

3. Route is automatically registered as `/dashboard`

# 🔴 GEMİNİ GÖREV EMRİ — PHASE 2 (28 Nisan 2026 Öğlen)

> **TARİH:** 28 Nisan 2026
> **VEREN:** Hakan Bey (Kurucu) + Claude Opus (Denetçi)
> **ALAN:** Gemini (Kodlama Ajanı)
> **DURUM:** ⬜ YÜRÜTME BEKLİYOR
> **KURAL:** Bu dosya SİLİNEMEZ. Sadece checkbox güncellenebilir (`⬜` → `✅`).

---

## ⛔ MUTLAK YASALAR

1. **ÖNCE OKU:** `sovereign-config.ts`, `GEMINI_ORGAN_MIGRATION_ORDER.md` dosyalarını oku
2. **SIFIR MOCK:** Math.random, setTimeout ile sahte veri YASAK
3. **HER ADIM SONRASI:** `pnpm run build` → Exit code: 0 OLMALI
4. **HER ADIM SONRASI:** `git commit -m "feat(G-X): açıklama"`
5. **DOSYA SİLME YASAK:** Gereksiz dosyalar `_archive/` altına taşınır
6. **UI'YI GÜZEL YAPMAK ZORUNLU:** Heimtex.ai = Dijital Vogue kalitesinde olmalı

---

## 📋 GÖREVLERİN SIRASIYLA YAP

### G8. tenderAgent.ts Deterministik Dönüşüm ⬜
**Süre:** 15 dakika | **Öncelik:** 🟡

**Dosya:** `src/core/aloha/tenderAgent.ts`
**Satır:** 206
**Sorun:** `[...GLOBAL_HUNT_QUERIES].sort(() => Math.random() - 0.5)` — rastgele shuffle
**Çözüm:**
```typescript
// ESKİ (YASAK):
const shuffled = [...GLOBAL_HUNT_QUERIES].sort(() => Math.random() - 0.5);

// YENİ (DETERMİNİSTİK):
const startIndex = new Date().getHours() % GLOBAL_HUNT_QUERIES.length;
const shuffled = [...GLOBAL_HUNT_QUERIES.slice(startIndex), ...GLOBAL_HUNT_QUERIES.slice(0, startIndex)];
```

```bash
pnpm run build && git commit -am "feat(G8): tenderAgent deterministik rotasyon"
```

---

### G7. Hometex MagazineDetail Hardcoded Role ⬜
**Süre:** 15 dakika | **Öncelik:** 🟡

**Dosya:** `src/components/node-hometex/MagazineDetail.tsx`
**Satır:** 12
**Sorun:** `const role = 'consumer'` — hardcoded, auth yok
**Çözüm:**
```typescript
// ESKİ:
const role = 'consumer';

// YENİ:
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
// component içinde:
const { user } = usePerdeAuth();
const role = user ? 'member' : 'consumer';
```

```bash
pnpm run build && git commit -am "feat(G7): hometex magazineDetail hardcoded role düzeltildi"
```

---

### G9. Vorhang ProductGrid Boş State ⬜
**Süre:** 15 dakika | **Öncelik:** 🟢

**Dosya:** `src/components/node-vorhang/ProductGrid.tsx`
**Sorun:** Ürün yoksa ne gösteriyor? Boş ekran kalıyorsa:
**Çözüm:** `products.length === 0` ise "Produkte werden vorbereitet..." mesajı göster (Almanca)
- MOCK_PRODUCTS dizisi varsa → SİL
- Boş state UI → minimal, temiz

```bash
pnpm run build && git commit -am "feat(G9): vorhang productGrid boş state eklendi"
```

---

### G6. Heimtex.ai Dijital Vogue Tam Dönüşümü ⬜
**Süre:** 2-3 saat | **Öncelik:** 🔴 KRİTİK

> ⚠️ BU EN BÜYÜK GÖREV. Mevcut dosyalar minimum iskelet. 
> Heimtex.ai = Dijital Vogue. Karanlık tema, editorial tipografi, premium.

**G6.1** `HeimtexNavbar.tsx` GÜNCELLE (23 satır → ~100 satır)
- `basePath` prop ekle (varsayılan: `/sites/heimtex.ai`)
- `fixed top-0 w-full z-50` yapısı
- Mobil hamburger menü (Vorhang pattern'ından ilham al)
- Link'ler: `{basePath}/trends`, `{basePath}/magazine`, `{basePath}/login`
- Tasarım: Karanlık, serif font, `tracking-widest uppercase`

**G6.2** `HeimtexFooter.tsx` GÜNCELLE (9 satır → ~50 satır)
- 4 kolonlu grid: Brand | Navigate | Connect | Legal
- Ekosistem branding: "Part of AIPyram Sovereign Ecosystem"
- Copyright + Privacy/Terms linkleri

**G6.3** `HeimtexLandingPage.tsx` GÜNCELLE (64 satır → ~200 satır)
- Props: `trends?: any[]`, `articles?: any[]` ekle (Firestore'dan gelecek)
- Trend kartları → `trends` prop'undan render et (boşsa "Coming soon")
- Magazine section → `articles` prop'undan son 4 makale
- **KRİTİK:** `{/* Mock trend cards for landing */}` yorumunu SİL
- Hardcoded 3 trend kartı → props veya boş state
- Unsplash görselleri KALABİLİR (referans thumbnail olarak)

**G6.4** `HeimtexMagazine.tsx` GÜNCELLE
- Props: `articles?: any[]` ekle
- Boş state: "No articles published yet"
- Makale kartları: title, summary, date, image

**G6.5** `HeimtexTrends.tsx` GÜNCELLE
- Props: `trends?: any[]` ekle
- Pantone renk kartları grid
- Sezon filtreleme (Spring/Summer/Fall/Winter) — basit tab yapısı

```bash
pnpm run build && git commit -am "feat(G6): heimtex.ai dijital vogue tam dönüşüm"
```

---

### G10. Heimtex Domain Routing Genişletme ⬜
**Süre:** 30 dakika | **Öncelik:** 🟡

**G10.1** `src/app/sites/[domain]/page.tsx` güncellemesi
- Mevcut `heimtex` block'u bul (zaten var — import + render)
- `heimtex_trends` ve `heimtex_articles` Firestore koleksiyonlarından veri çek
- `HeimtexLandingPage`'e `trends` ve `articles` props olarak ver

**G10.2** `src/app/sites/[domain]/trends/page.tsx` OLUŞTUR veya GÜNCELLE
- Heimtex domain'i için → `HeimtexTrends` render
- Firestore `heimtex_trends` koleksiyonundan veri çek

**G10.3** `src/app/sites/[domain]/magazine/page.tsx` GÜNCELLE
- Heimtex domain'i için → `HeimtexMagazine` render
- Firestore `heimtex_articles` koleksiyonundan veri çek

**G10.4** `src/app/sites/[domain]/contact/page.tsx` GÜNCELLE
- `if (d.includes('heimtex'))` check → Temel iletişim sayfası render

```bash
pnpm run build && git commit -am "feat(G10): heimtex domain routing genişletildi"
```

---

## 📊 KONTROL TABLOSU

| Görev | Durum | Build | Commit |
|-------|-------|-------|--------|
| G8. tenderAgent deterministik | ⬜ | ⬜ | ⬜ |
| G7. Hometex role fix | ⬜ | ⬜ | ⬜ |
| G9. Vorhang boş state | ⬜ | ⬜ | ⬜ |
| G6. Heimtex tam dönüşüm | ⬜ | ⬜ | ⬜ |
| G10. Heimtex routing | ⬜ | ⬜ | ⬜ |

---

## ⚠️ DOKUNMA LİSTESİ (Claude yapacak — sen karışma)

- ❌ `PerdeAIAssistant.tsx` Math.random temizliği (Claude C6)
- ❌ `IcmimarAIAssistant.tsx` Math.random temizliği (Claude C7)
- ❌ `PerdeLandingPage.tsx` B2C dönüşümü (Claude C8)
- ❌ `CurtaindesignContact.tsx` / `CurtaindesignAbout.tsx` (Claude C9)
- ❌ `aiClient.ts:317` retry jitter (KASITLI — KİMSE DOKUNMASIN)
- ❌ `sovereign-config.ts` (zaten tamamlandı)
- ❌ `middleware.ts` (zaten tamamlandı)

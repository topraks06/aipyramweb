# SKILL: Perde.ai Canlıya Geçiş Planı & ALOHA Sovereign Brain
**DURUM:** AKTİF | **TARİH:** 19 Nisan 2026
**KURAL:** TRTEX otonom pipeline'ına DOKUNULMAZ. Hiçbir değişiklik TRTEX'i bozamaz.

---

## TAMAMLANAN İŞLER (19 Nisan 2026)

### 1. Perde.ai Auth — Mock → Gerçek Firebase Auth

| # | Dosya | Değişiklik | Durum |
|---|-------|-----------|-------|
| 1 | `src/hooks/usePerdeAuth.ts` | **YENİ** — Firebase Auth + Firestore `perde_members` lisans hook'u | ✅ |
| 2 | `src/components/auth/B2BGatekeeper.tsx` | localStorage mock → `usePerdeAuth()` hook | ✅ |
| 3 | `src/components/tenant-perde/PerdeNavbar.tsx` | localStorage mock → `usePerdeAuth()` hook + logout | ✅ |
| 4 | `src/components/tenant-perde/auth/Login.tsx` | Mock → `signInWithEmailAndPassword` + `signInWithPopup` (Google) | ✅ |
| 5 | `src/components/tenant-perde/auth/Register.tsx` | Mock → `createUserWithEmailAndPassword` + Firestore kaydı | ✅ |
| 6 | `src/app/sites/[domain]/register/RegisterClient.tsx` | SİLİNDİ (öksüz dosya) | ✅ |
| 7 | `src/app/sites/[domain]/pricing/page.tsx` | Unused import kaldırıldı | ✅ |

**Yeni Akış:**
```
Kayıt → Firebase Auth + Firestore perde_members/{uid} (license: 'pending')
Giriş → Firebase Auth doğrulama + Firestore lisans kontrolü
B2B Erişim → isLicensed === true ise geç → 'pending' ise "Onay Bekliyor" → giriş yoksa "Erişim Reddedildi"
```

**Lisans Durumları:** `active`, `pending`, `rejected`, `suspended`, `none`

### 2. ALOHA Sovereign Brain — Mock → Gemini-Destekli Gerçek

| # | Dosya | Değişiklik | Durum |
|---|-------|-----------|-------|
| 1 | `src/lib/aloha/tools.ts` | **YENİ** — Gerçek Firestore araçları (üyelik, sağlık, cron tetikleme) | ✅ |
| 2 | `src/app/api/aloha/command/route.ts` | if/else mock → Gemini 2.0 Flash intent resolver + tool executor | ✅ |

**ALOHA Araç Listesi:**
```
member.list     → Tüm tenant bayileri listele (perde/trtex/hometex)
member.approve  → Bayi lisansını aktif et
member.reject   → Bayi lisansını reddet
member.suspend  → Bayi lisansını askıya al
system.health   → Tüm tenant + altyapı sağlık kontrolü
content.stats   → İçerik istatistikleri
cron.trigger    → master-cycle, ticker-refresh, translation vb. tetikle
```

**Komut Örnekleri (The Void'dan):**
```
"bekleyen perde başvuruları"          → member.list (tenant: perde, filter: pending)
"ali@firma.com perde lisansını onayla" → member.approve (tenant: perde, email: ali@...)
"sistem durumu"                        → system.health
"trtex haberleri tetikle"              → cron.trigger (cronName: master-cycle)
```

---

## DOKUNULMAMIŞ / KORUNMUŞ DOSYALAR (TRTEX GÜVENLİĞİ)

Bu oturumda aşağıdaki TRTEX dosyalarına **DOKUNULMADI:**
- `src/core/aloha/` — Tüm 35+ dosya aynen duruyor
- `src/core/cron/masterCron.ts` — Aynen
- `src/app/sites/[domain]/page.tsx` — Aynen (TRTEX rendering)
- `src/components/trtex/` — Tüm 12+ bileşen aynen
- `src/app/api/cron/` — Tüm 14 cron endpoint aynen
- `src/lib/firebase-admin.ts` — Aynen
- `src/middleware.ts` — Aynen

**KANIT:** Build exit code 0, tüm TRTEX rotaları render ediyor.

---

## KALAN GÖREVLER (SONRAKİ OTURUMLAR)

### Perde.ai
- [ ] Dev sunucuda test (perde.localhost:3000 ile giriş/kayıt test)
- [ ] Cloud Run'a deploy edip perde.ai domain mapping
- [ ] SSL sertifikası & DNS yönlendirme
- [ ] Perde.ai için içerik pipeline'ı (trtex_news gibi perde_articles?)

### ALOHA Sovereign
- [ ] DynamicCanvas'ı yeni widgetType'lara (`memberList`) uyarla
- [ ] The Void paneline tenant seçici dashboard ekle
- [ ] ALOHA'ya daha fazla araç: haber oluştur, görsel üret, SEO analizi
- [ ] Admin panelinde Gemini chat modu (serbest sohbet)

### Hometex.ai (Sonra)
- [ ] Merkezi navbar
- [ ] Auth sistemi (usePerdeAuth gibi useHometexAuth)
- [ ] Firestore veri bağlantısı (mock'ları kaldır)
- [ ] Footer

### Vorhang.ai (Gelecek — 4. Güç)
- [ ] Tak-çalıştır mimari hazırlığı
- [ ] Tenant routing ekleme
- [ ] Katalog/Satış motoru

---

## MUTLAK YASAKLAR

1. **TRTEX src/core/aloha/ dosyalarına DOKUNMA** — Otonom pipeline çalışıyor
2. **TRTEX Firestore koleksiyonlarını değiştirme** — trtex_news, trtex_terminal
3. **masterCron.ts'i bozma** — Cloud Scheduler bu endpointle çalışıyor
4. **middleware.ts tenant routing'ini bozma** — 3 site + admin bu üzerinden akıyor
5. **firebase-admin.ts init akışını değiştirme** — 3 kademeli fallback sağlam

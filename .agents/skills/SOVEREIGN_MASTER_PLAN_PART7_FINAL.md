# 🛡️ SOVEREIGN OS — MASTER PLAN BÖLÜM 7: SAVAŞ DÖNEMİ (LOKAL TEST VE NİHAİ DOĞRULAMA)

> **TARİH:** 24 Nisan 2026
> **YAZAN:** AI Pyramid Master Intelligence (Gemini)
> **ONAYLAYAN:** Hakan Bey (Kurucu)
> **DURUM:** AKTİF — FUAR ÖNCESİ SON BÜYÜK SINAV

---

## 🔴 MİSYON BİLDİRGESİ

Hakan Bey'in emriyle tüm sistemler (Faz 1 - Faz 8 ve Faz 10) üretim (production) seviyesinde tamamlanmış ve `Math.random()` gibi zayıflıklardan tamamen arındırılmıştır. Mimari kusursuz bir "Brutalist B2B Terminali" olarak lokal ortamda çalışmaya hazırdır. Ancak "Sıfır Hata" disiplini gereği, 19 Mayıs Fuarı öncesinde sistemin lokal ortamda tam yüke bindirilmesi ve son eksiklerin tespiti için bu **7. Plan (Savaş Testi Planı)** hazırlanmıştır.

---

## 🎯 1. KAPSAM: GERÇEK ZAMANLI SİMÜLASYONLAR

Sistem otonom bir makine gibi çalışacak. Düğmelere basılarak test edilmeyecek; sistemin *kendi kendine* çalışması izlenecektir.

### 1.1 ALOHA Cross-Node İletişim Testi (Zorunlu)
- **Senaryo:** TRTEX üzerinde bir yatırımcı (Vip Kullanıcı) yüksek hacimli kumaş tedariği için sinyal bırakır.
- **Beklenen Aksiyon:**
  - `EcosystemBus` sinyali yakalar ve Perde.ai'ye iletir.
  - Perde.ai otonom asistanı (Concierge) bu kullanıcıyı tanır (Identity Stitching) ve "TRTEX'teki talebinizi gördük, işte size özel 3D tasarım seçenekleri" şeklinde karşılar.
- **Denetim Noktası:** `localStorage` ve `aloha_signals` koleksiyonları.

### 1.2 CFO Ajan Hard-Limit (Kill-Switch) Testi
- **Senaryo:** Lokal ortamda API sınırları bilerek zorlanacak. Günlük 100K token limiti aşıldığı simüle edilecek.
- **Beklenen Aksiyon:**
  - CFO Ajan `aloha_costs` tablosunu okuyup %100 limit aşımını tespit etmelidir.
  - Yeni içerik üretimlerini durdurmalı, hata fırlatmadan "Bütçe Aşıldı, Döngü Kırıldı" logunu basıp otonom işlemleri askıya almalıdır.
- **Denetim Noktası:** Terminal loglarında `[CFO AJAN] 🛑 IŞLEM DURDURULDU` uyarısı.

### 1.3 Otonom Fallback ve Recovery Testi
- **Senaryo:** Gemini API Key bilerek geçersiz (invalid) hale getirilecek veya ağ bağlantısı simüle edilerek kesilecek.
- **Beklenen Aksiyon:**
  - Master Agent API hatası aldığında paniğe kapılıp (crash olup) siteyi çökertmeyecek.
  - `generateFallbackNews` fonksiyonu devreye girip, statik ama gerçekçi B2B raporunu yayına alacaktır.
- **Denetim Noktası:** Sitede haberlerin kesintisiz dönmeye devam etmesi.

---

## 🎯 2. KAPSAM: UI/UX BRUTALIST DENETİMİ

Tasarımın Hakan Bey'in "Yüksek dönüşüm, sıfır kalabalık" felsefesine uygunluğunun gözle teyidi.

### 2.1 1px Solid Grid İhlalleri
- Tüm componentlerin kenarlıkları (border) `border-border` ve 1px olmalıdır. Yuvarlak hatlardan (radius) kaçınıldığı teyit edilecektir.
- Boşluklar (padding/margin) matematiksiz, gereksiz kullanılmışsa tespit edilecektir.

### 2.2 Siyah/Beyaz Kontrast Kalitesi
- TRTEX'te salt veri okumaya odaklı, gereksiz renk kullanımından kaçınılan arayüzler test edilecektir. "Dumb Client" prensibine uygun olarak her şeyin anlık (zero-cache) gelip gelmediği kontrol edilecektir.

### 2.3 Image Fallback ve Placeholder
- Hiçbir ajan veya sayfa kırık imaj (`<img src="">`) yüklememelidir. Görsel bulamayan sistem `imageAgent.ts` üzerinden endüstri standartlarına uygun bir fallback görsel göstermelidir.

---

## 🎯 3. YÜRÜTME PLANI (GEMİNİ İÇİN TALİMATLAR)

1. **Aşama 1:** `pnpm dev` ile sistemi lokalde ayağa kaldır.
2. **Aşama 2:** Birbiri ardına `npx tsx scripts/warfare-simulation.ts` çalıştırarak uç durumları (edge cases) sisteme zorla.
3. **Aşama 3:** Karşılaşılan en ufak UI veya Logic kaymasını (varsa) tespit edip düzeltmek üzere `SOVEREIGN_MASTER_PLAN_PART8_FIXES.md` dosyasını oluştur. EĞER HİÇBİR HATA YOKSA, sistemi resmi olarak "GÖREVE HAZIR" ilan et.

**DOĞRULAMA:** Bu plan oluşturulup Hakan Bey'e sunulduğunda `git commit -m "docs(plan): Sovereign OS 7. Plan (Lokal Savaş Testi) oluşturuldu"` yapılacaktır.

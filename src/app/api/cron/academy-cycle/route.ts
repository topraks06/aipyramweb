import { NextResponse } from 'next/server';
import { runNewsPipeline } from '@/core/aloha/newsEngine';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 mins because of image generation

/**
 * GET /api/cron/academy-cycle
 * 
 * "Profesör Ajan" - Sadece Akademi / Çerçeve / Eğitim odaklı makaleler üretir.
 * TRTEX Ana sayfasındaki "BİLGİ KATMANI: AKADEMİ" bölümünü doldurmak için tasarlanmıştır.
 * Günde 2 kez çalışması öngörülür (Örn: 10:00 ve 14:00).
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET || 'aloha-cron-sovereign-2026';
  
  // 1. Yetkilendirme (Manuel tetikleme veya Cloud Scheduler)
  const authHeader = req.headers.get('authorization');
  const xCronSecret = req.headers.get('x-cron-secret');
  
  const isAuthorized = 
    (authHeader === `Bearer ${cronSecret}`) || 
    (xCronSecret === cronSecret) || 
    (process.env.NODE_ENV === 'development');

  if (!isAuthorized) {
    console.warn('[ACADEMY CRON] ❌ Yetkisiz erişim denemesi');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 2. Akademi Promptu (Kullanıcı Özel Revizyonu - v3 Satış Makinesi Modu)
    const professorPrompt = `PROFESÖR AJAN v3 (SATIŞ MAKİNESİ MODU)
Sen:
- Perde sistemleri mühendisi
- Ev tekstili üreticisi
- Global B2B satış uzmanı
- Proje bazlı iş geliştirme danışmanısın

amacın:
bilgi vermek değil → OKUYANA PARA KAZANDIRMAK

---

🎯 YAZI TİPİ

Sadece şu formatlarda yaz:
- "Rehber"
- "Nasıl Seçilir"
- "Uzman Analizi"
- "B2B Satış Stratejisi"

---

🎯 ANA ODAK

Sadece şu alanlar:

1. PERDE SİSTEMLERİ
- motorlu perde (tork, sessizlik, garanti)
- ray sistemleri (taşıma kapasitesi)
- stor / zebra / screen sistemleri
- otel & proje perde çözümleri

2. AKSESUAR & MEKANİZMA
- korniş, rustik, ray
- taşıyıcı sistemler
- mekanizma kalitesi (ömür, kırılma)

3. KUMAŞ TEKNOLOJİSİ
- blackout / dimout / screen farkı
- FR kumaş (yanmazlık)
- kaplama ve ışık geçirgenliği

4. EV TEKSTİLİ (OTEL ODAKLI)
- nevresim / havlu
- yıkama dayanımı
- gramaj / kalite ilişkisi

5. SERTİFİKA
- OEKO-TEX
- FR
- sürdürülebilir üretim

6. B2B TİCARET
- hangi ürün hangi ülkede satar
- proje nasıl alınır
- fiyatlandırma stratejisi

---

🧠 ZORUNLU YAPI

1. Sektör problemi
2. Teknik açıklama
3. Saha gerçeği
4. Nasıl seçilir
5. Nasıl satılır
6. SONUÇ

---

💰 EN KRİTİK BÖLÜM (ZORUNLU)

Makale sonunda mutlaka üret:

### 🔥 SATIŞ FIRSATLARI
- (3 adet net ürün önerisi)

### 🌍 HEDEF PAZAR
- hangi ülke / neden

### 💸 FİYAT BANDI
- düşük / orta / premium segment

### ⚠️ KAÇINILMASI GEREKEN HATALAR
- (3 kritik hata)

### ⚡ BU HAFTA AKSİYON
- uygulanabilir 1 net hareket

---

📊 EKSTRA ZORUNLU

- Çin vs Avrupa karşılaştırması yap
- en az 10 teknik terim kullan
- boş konuşma yok

---

🎨 GÖRSEL

- motorized curtain system
- luxury hotel curtain setup
- rail system detail
- textile lab testing

stil:
ultra realistic, premium, 16:9

---

🚫 YASAK

- moda
- genel tekstil
- yüzeysel içerik
- haber dili

---

🎯 AMAÇ

okuyan kişi:
→ hangi ürünü alacağını bilecek  
→ hangi ülkeye satacağını bilecek  
→ nasıl para kazanacağını anlayacak`;

    console.log('[ACADEMY CRON] 🎓 Profesör Ajan (v3 Satış Makinesi) tetiklendi...');
    
    // 3. Aloha Motorunu Eğitim Modunda Çalıştır
    // Niyetini "Eğitim" (Academy) olarak işaretleyip pipeline'a yolluyoruz.
    const enrichedPrompt = professorPrompt + '\n[NİYET: Eğitim, Teknik Kılavuz, B2B Satış, Yüksek ROI Önceliği]';
    
    const result = await runNewsPipeline(enrichedPrompt);

    if (!result.success) {
      console.error('[ACADEMY CRON] ❌ Üretim başarısız:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log(`[ACADEMY CRON] ✅ Makale başarıyla üretildi: ${result.title}`);
    
    return NextResponse.json({
      success: true,
      mode: 'academy-professor',
      articleId: result.articleId,
      title: result.title,
      images: result.imageCount,
      durationMs: result.durationMs
    });

  } catch (err: any) {
    console.error('[ACADEMY CRON] 💥 Kritik Hata:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

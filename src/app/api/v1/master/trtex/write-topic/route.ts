import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Removed raw ai client
/**
 * POST /api/v1/master/trtex/write-topic
 * 
 * TRTEX Baş Ajan — Konu Bazlı Haber Üretici
 * 
 * Hakan'ın istediği konuda GERÇEK haber üretir:
 * - Konu alır
 * - Gemini ile B2B analiz haberi yazar
 * - 8 dile çevirir (TR öncelikli)
 * - Firestore'a yazar
 * - Görsel üretimini tetikler
 * 
 * Kullanım:
 *   POST body: { "topic": "Hometex Istanbul 2026 fuar analizi" }
 *   veya GET: ?topic=Hometex+Istanbul+2026
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const topic = url.searchParams.get('topic');
  if (!topic) {
    return NextResponse.json({ 
      error: 'topic parametresi gerekli',
      usage: '/api/v1/master/trtex/write-topic?topic=Hometex+Istanbul+fuar+analizi'
    }, { status: 400 });
  }
  return handleTopicWrite(topic);
}

export async function POST(req: Request) {
  const body = await req.json();
  const topic = body.topic;
  if (!topic && !(body.imageUrls && body.imageUrls.length > 0)) {
    return NextResponse.json({ error: 'topic veya resim alanı gerekli' }, { status: 400 });
  }
  return handleTopicWrite(topic || "Saha Raporu", body.category, body.imageUrls);
}

async function handleTopicWrite(topic: string, category?: string, imageUrls?: string[]) {
  const startTime = Date.now();
  
  console.log(`[TRTEX-TOPIC] 📝 Konu bazlı haber üretimi: "${topic}"`);
  
  try {
    // 1. Gemini ile B2B haber üret
    const article = await generateArticleFromTopic(topic, category, imageUrls);
    
    if (!article) {
      return NextResponse.json({ error: 'Haber üretilemedi' }, { status: 500 });
    }

    // 2. Firestore'a yaz
    const slug = generateSlug(article.title);
    const docRef = adminDb.collection('trtex_news').doc(slug);
    
    const newsData = {
      title: article.title,
      slug: slug,
      summary: article.summary,
      content: article.content,
      category: article.category || category || 'İstihbarat',
      status: 'published',
      source: 'trtex-topic-command',
      topic_command: topic,
      quality_score: article.quality_score || 85,
      impact_score: article.impact_score || 85,
      confidence_score: article.confidence_score || 85,
      translations: article.translations || {},
      opportunity_card: article.opportunity_card || null,
      ai_block: {
        action: article.action_signal || 'ANALIZ ET',
        reasoning: article.reasoning || '',
      },
      tags: article.tags || [],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      image_generated: false,
    };
    
    await docRef.set(newsData);
    console.log(`[TRTEX-TOPIC] ✅ Haber yazıldı: ${slug}`);
    
    // 3. 🔒 GÖRSEL ÜRETİM TAMAMEN KAPALI — Hakan Bey emri (30/04/2026)
    // Maliyet kilidi: Aylık $20 bütçe. Görsel üretim 1.989 CHF harcadı.
    // Kullanıcı kendi resmini yüklediyse onu kullan, yoksa görselsiz bırak.
    if (imageUrls && imageUrls.length > 0) {
        console.log(`[TRTEX-TOPIC] 📸 ${imageUrls.length} KULLANICI GÖRSELİ kullanılıyor.`);
        await docRef.update({
          image_url: imageUrls[0],
          images: imageUrls,
          image_generated: false,
        });
    } else {
      console.log(`[TRTEX-TOPIC] 🔒 Görsel üretim KAPALI (maliyet kilidi). Manuel yükleme bekliyor.`);
      await docRef.update({
        image_generated: false,
        needs_manual_image: true,
        image_status: 'awaiting_manual',
      });
    }
    
    // 4. Terminal payload'u güncelle
    try {
      const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
      await buildTerminalPayload();
      console.log(`[TRTEX-TOPIC] 🔄 Terminal payload güncellendi`);
    } catch (payloadErr: any) {
      console.warn(`[TRTEX-TOPIC] ⚠️ Payload güncellenemedi: ${payloadErr.message}`);
    }
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      slug: slug,
      title: article.title,
      category: article.category,
      duration_ms: duration,
      image_generated: newsData.image_generated,
      url: `/sites/trtex.com/news/${slug}?lang=tr`,
      message: `✅ "${article.title}" başarıyla üretildi ve yayınlandı.`
    });
    
  } catch (err: any) {
    console.error(`[TRTEX-TOPIC] ❌ Hata: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function generateArticleFromTopic(topic: string, category?: string, imageUrls?: string[]) {
  let prompt = `Sen TRTEX.com B2B ev tekstili istihbarat terminali için profesyonel sektör analisti/editörsün.

GÖREV: Aşağıdaki konuda detaylı B2B istihbarat haberi yaz.

KONU: ${topic}
${category ? `KATEGORİ: ${category}` : ''}`;

  if (imageUrls && imageUrls.length > 0) {
    prompt += `\n\nEK GÖREV (GÖRSEL GAZETECİLİK): Sana verilen EKLİ GÖRSELLERİ dikkatlice YZ (Vision) yeteneğinle analiz et. Resimdeki stant, kumaş, mekan, kişiler veya ürün detaylarını OKU ve haberin senaryosunu, firmayı ve analizini DİREKT olarak bu fotoğraflarda gördüğün gerçek dünya verileri etrafında şekillendir! Fotoğraflarda gördüğün nesneleri haberde tasvir et (Örn: 'mavi jakar kumaşlardan oluşan stant ziyaretçi akınına uğradı' vb.)`;
  }

  prompt += `\n\nKURALLAR:
1. Haber GERÇEK sektör bilgisine dayanmalı — uydurma YASAK (Fakat ekte resimler varsa resimleri doğru oku)
2. En az 3 somut rakam/veri içermeli (pazar büyüklüğü, ihracat değeri, katılımcı sayısı vb.)
3. En az 1 gerçek firma/kurum adı içermeli
4. B2B alıcı/tedarikçi perspektifinden yazılmalı
5. "Önemli gelişme", "kritik süreç" gibi boş klişeler YASAK
6. Konu ev tekstili, perde, döşemelik, fuar, hammadde, teknoloji alanlarından olmalı
7. İçerik HTML formatında olmalı (<h2>, <p>, <ul>, <li>, <table> kullan)

JSON olarak dön:
{
  "title": "Türkçe başlık (max 80 karakter)",
  "summary": "Türkçe özet (2-3 cümle, ticari etki vurgusu)",
  "content": "HTML formatında detaylı haber içeriği (en az 500 kelime)",
  "category": "Kategori (Fuar/Perde/Ev Tekstili/Döşemelik/Hammadde/Teknoloji/Regülasyon/Pazar)",
  "tags": ["etiket1", "etiket2", "etiket3"],
  "quality_score": 85,
  "impact_score": 85,
  "confidence_score": 85,
  "action_signal": "AL/SAT/BEKLE/ANALIZ ET",
  "reasoning": "Neden bu sinyal?",
  "opportunity_card": {
    "title": "Fırsat başlığı",
    "description": "Fırsat açıklaması",
    "action": "Yapılması gereken"
  },
  "translations": {
    "EN": {
      "title": "English title",
      "summary": "English summary",
      "content": "English HTML content (shorter version)"
    },
    "DE": {
      "title": "German title",
      "summary": "German summary"  
    },
    "TR": {
      "title": "Türkçe başlık (aynı)",
      "summary": "Türkçe özet (aynı)",
      "content": "Türkçe HTML içerik (aynı)"
    }
  }
}`;

  let contents: any[] = [prompt];

  // Resimleri Base64 Buffer'a çevirip Prompt'a 'inlineData' olarak ekleme (Vision Modu)
  if (imageUrls && imageUrls.length > 0) {
    console.log(`[TRTEX-VISION] GEMINI FLASH VISION EKLENTISI - ${imageUrls.length} Resim okunuyor...`);
    for (const url of imageUrls) {
      try {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        contents.push({
          inlineData: {
            data: Buffer.from(arr).toString('base64'),
            mimeType: res.headers.get('content-type') || 'image/jpeg'
          }
        });
      } catch (err: any) {
         console.warn(`[TRTEX-VISION] Resim alınamadı ve atlandı: ${url} - ${err.message}`);
      }
    }
  }

  try {
    const jsonResult = await alohaAI.generateJSON(contents, {
      temperature: 0.7,
      complexity: 'routine'
    }, 'trtex.write-topic.generateArticle');
    return jsonResult;
  } catch (err: any) {
    throw new Error('Gemini JSON döndüremedi: ' + err.message);
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/-$/, '');
}

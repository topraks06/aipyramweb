import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const ai = alohaAI.getClient();

/**
 * POST /api/v1/master/hometex/ingest-product
 * 
 * Hometex.ai Otonom Ürün Ingestion Motoru
 * Fotoğrafı analiz eder, kumaş özelliklerini çıkarır, 8 dilde katalog kaydı oluşturur.
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { imageUrl, productName } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Resim URLsi gerekli' }, { status: 400 });
    }

    console.log(`[HOMETEX-INGEST] 📦 Yeni ürün analiz ediliyor: "${productName || 'İsimsiz Ürün'}"`);

    // 1. Resmi Buffer'a çevir
    let inlineData = null;
    try {
      const isBase64 = imageUrl.startsWith('data:image/');
      if (isBase64) {
        const matches = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
        if (matches && matches.length === 3) {
           inlineData = {
              data: matches[2],
              mimeType: matches[1]
           };
        }
      } else {
        const res = await fetch(imageUrl);
        const arr = await res.arrayBuffer();
        inlineData = {
          data: Buffer.from(arr).toString('base64'),
          mimeType: res.headers.get('content-type') || 'image/jpeg'
        };
      }
    } catch (err: any) {
      console.warn(`[HOMETEX-INGEST] Resim işlenemedi: ${err.message}`);
      return NextResponse.json({ error: 'Resim okunamadı' }, { status: 400 });
    }

    if (!inlineData) {
      return NextResponse.json({ error: 'Resim verisi eksik' }, { status: 400 });
    }

    // 2. Gemini 2.5 Flash Vision ile Analiz
    const prompt = `Sen Hometex.ai B2B Ev Tekstili Platformu için "Autonomous Catalog Engineer" (Otonom Katalog Mühendisi) ajansın.
Ekli görseldeki ev tekstili / kumaş ürününü DİKKATLİCE ANALİZ ET.

ÜRÜN REFERANSI: ${productName || 'Belirtilmedi'}

GÖREV:
Görseldeki ürünün materyalini, rengini, dokusunu ve olası kullanım alanını tespit et. 
Bu ürünü uluslararası B2B pazarında (toptancılar, oteller, mimarlar) satmak için SEO uyumlu ve son derece profesyonel bir ürün listelemesi oluştur.

ZORUNLU DİLLER: TR, EN, DE, RU, ZH, AR, ES, FR

JSON FORMATINDA YANIT VER:
{
  "product": {
    "title_tr": "Türkçe başlık",
    "description_tr": "Türkçe detaylı pazarlama açıklaması (2-3 cümle)",
    "title_en": "English title",
    "description_en": "English description",
    "title_de": "Almanca başlık",
    "description_de": "Almanca açıklama",
    "title_ru": "Rusça başlık...",
    "title_zh": "Çince...",
    "title_ar": "Arapça...",
    "title_es": "İspanyolca...",
    "title_fr": "Fransızca...",
    "material": "Örn: %100 Keten, Jakarlı Polyester, Blackout vs.",
    "color": "Ana Renk (Örn: Bej)",
    "color_hex": "Renk hex kodu (Örn: #E5E4E2)",
    "pattern": "Desen tipi (Düz, Çizgili, Damask vs.)",
    "usage": ["Otel", "Konut", "Ofis"],
    "tags": ["blackout", "hotel curtain", "luxury fabric"]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, { inlineData }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text || '';
    let parsedProduct;
    try {
      parsedProduct = JSON.parse(text).product;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsedProduct = JSON.parse(jsonMatch[0]).product;
      else throw new Error('Gemini JSON formatında yanıt veremedi');
    }

    if (!parsedProduct) throw new Error('Ürün analizi başarısız');

    // 3. Firestore'a Kaydet
    const slug = (parsedProduct.title_en || productName || "product")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60)
      .replace(/-$/, '') + '-' + Date.now().toString().slice(-4);

    const docData = {
      ...parsedProduct,
      originalName: productName,
      image_url: imageUrl,
      slug,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await adminDb.collection('hometex_products').doc(slug).set(docData);
    
    // Cross-tenant bridge: Add to local user library so it can be seen in Visualizer
    try {
      await adminDb.collection('perde_library').add({
         url_1k: imageUrl,
         url_2k: imageUrl,
         category: 'hometex_catalog',
         tags: parsedProduct.tags || [],
         style: parsedProduct.pattern || 'modern',
         roomType: 'all',
         color: parsedProduct.color || 'mixed',
         productType: 'hometex',
         source: 'hometex_ingestion',
         tenant: 'hometex',
         usageCount: 0,
         createdAt: new Date().toISOString()
      });
    } catch(e) {
      console.warn('Cross-tenant bridge sync failed', e);
    }

    console.log(`[HOMETEX-INGEST] ✅ Başarıyla eklendi: ${slug}`);

    const duration = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      duration_ms: duration,
      product: docData
    });

  } catch (err: any) {
    console.error(`[HOMETEX-INGEST] ❌ Hata: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

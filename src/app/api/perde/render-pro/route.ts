import { NextRequest, NextResponse } from "next/server";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — RENDER-PRO (Proxy to unified /api/perde/render)
 *  
 *  Bu route, plan belgelerinde (PERDE_AI_ZERO_MOCK, TURNKEY_BLUEPRINT)
 *  referans verilen /api/perde/render-pro endpoint'idir.
 *  
 *  Mevcut /api/perde/render zaten tam profesyonel Img2Img motoru olduğundan,
 *  bu route isteği oraya yönlendirir ve SovereignNodeId'yi 'perde' olarak sabitler.
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // SovereignNodeId'yi perde olarak sabitle
    body.SovereignNodeId = body.SovereignNodeId || 'perde';

    // Img2ImgVisualizer'dan gelen formatı render API'nin beklediği formata dönüştür
    const renderPayload: any = {
      SovereignNodeId: body.SovereignNodeId,
      userPrompt: body.prompt || body.userPrompt || '',
      studioSettings: body.studioSettings || {},
      variationCount: body.variationCount || 1,
      aspectRatio: body.aspectRatio || 'auto',
    };

    // Mekan görseli
    if (body.spaceImage) {
      renderPayload.spaceImage = body.spaceImage;
    } else if (body.spaceBase64) {
      renderPayload.spaceImage = {
        data: body.spaceBase64,
        mimeType: 'image/jpeg',
      };
    }

    // Kumaş/ürün görselleri
    if (body.products) {
      renderPayload.products = body.products;
    } else if (body.fabricBase64) {
      // Img2ImgVisualizer'dan gelen tek kumaş formatı
      renderPayload.products = {
        'Fon Kumaşı': {
          data: body.fabricBase64,
          mimeType: 'image/jpeg',
        }
      };
    }

    // Referans model
    if (body.referenceModel) {
      renderPayload.referenceModel = body.referenceModel;
    }

    // Dahili render API'sini çağır
    const origin = req.nextUrl.origin;
    const renderResponse = await fetch(`${origin}/api/perde/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
      },
      body: JSON.stringify(renderPayload),
    });

    const data = await renderResponse.json();

    if (!renderResponse.ok) {
      return NextResponse.json(data, { status: renderResponse.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[RENDER-PRO] Proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Render-Pro hatası" },
      { status: 500 }
    );
  }
}

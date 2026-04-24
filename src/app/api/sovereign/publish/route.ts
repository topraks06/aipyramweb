/**
 * SOVEREIGN PUBLISH API
 * 
 * ALOHA'nın otonom ürün yayınlama uç noktası.
 * Tek bir POST isteğiyle kumaş bilgisini alır ve
 * TRTex → Hometex → Vorhang döngüsünü başlatır.
 */

import { NextResponse } from 'next/server';
import { executeGlobalPublish, ProductIngestionPayload } from '@/lib/aloha/workflows/GlobalPublishWorkflow';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Gemini Vision + 3 Firestore yazma = max 60sn

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zorunlu alan kontrolü
    if (!body.technicalSpecs) {
      return NextResponse.json(
        { error: 'technicalSpecs alanı zorunludur' },
        { status: 400 }
      );
    }
    if (!body.fabricCostPerMeter || body.fabricCostPerMeter <= 0) {
      return NextResponse.json(
        { error: 'fabricCostPerMeter alanı zorunludur ve 0\'dan büyük olmalıdır' },
        { status: 400 }
      );
    }

    const payload: ProductIngestionPayload = {
      imageBase64: body.imageBase64,
      imageUrl: body.imageUrl,
      technicalSpecs: body.technicalSpecs,
      fabricCostPerMeter: body.fabricCostPerMeter,
      gsm: body.gsm,
      widthCm: body.widthCm,
      composition: body.composition,
      collectionName: body.collectionName,
      patternType: body.patternType,
    };

    const result = await executeGlobalPublish(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün 3 platforma otonom olarak yayınlandı',
      trtex: {
        collection: 'trtex_news',
        id: result.trtexNewsId,
        status: result.trtexNewsId ? 'published' : 'skipped',
      },
      hometex: {
        collection: 'hometex_products',
        id: result.hometexProductId,
        status: result.hometexProductId ? 'published' : 'skipped',
      },
      vorhang: {
        collection: 'vorhang_products',
        id: result.vorhangProductId,
        status: result.vorhangProductId ? 'published' : 'skipped',
      },
      pricing: result.pricing,
      analysis: result.analysis,
    });
  } catch (error: any) {
    console.error('[Sovereign Publish API] Hata:', error);
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
}

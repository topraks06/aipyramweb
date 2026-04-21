import { NextResponse } from 'next/server';
import { masterCron } from '@/core/cron/masterCron';

// Dışarıdan Tetiklenebilen Sunucu Uyandırma Noktası (Serverless Dæmon Wake)
// Google Cloud Scheduler veya Firebase Pub/Sub üzerinden burası vurulacak.
export async function GET(request: Request) {
  try {
    // API çağrıldığında otonom beyin sistemi ilk kez başlatılmamışsa başlatır.
    masterCron.initSystem();

    // Ardından manuel olarak tek seferlik "Pulse" (Sinyal Atımı) yapar.
    // Bu sayede Serverless ortam uyumuş olsa bile anında canlanıp ajana görev yaptırır.
    const result = masterCron.triggerPulse();

    return NextResponse.json({
      success: true,
      message: "SYSTEM PULSED BY EXTERNAL TRIGGER. SWARM AWAKENED.",
      data: result,
      timestamp: Date.now()
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "SWARM CRASHED DURING PULSE",
      details: err.message
    }, { status: 500 });
  }
}

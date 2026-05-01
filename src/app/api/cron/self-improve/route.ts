import { NextRequest, NextResponse } from "next/server";
import { runSelfImprovement } from "@/core/aloha/selfImprovement";

// Herhangi bir anda maksimum 300 saniye (5 dk) çalışmasına izin ver
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/self-improve
 * ALOHA'nın son 24 saati analiz edip "Kazanılan Stratejiler" ve "Öğrenilen Dersler"
 * listesini oluşturduğu otonom evrim sürecini tetikler.
 * Google Cloud Scheduler üzerinden çağrılmalıdır.
 */
export async function GET(req: NextRequest) {
  try {
    // Güvenlik Zırhı: Sadece yetkili cron servislerinin veya adminin tetiklemesine izin ver
    const authHeader = req.headers.get("authorization");
    
    // Basit bir bearer token kontrolü (process.env.CRON_SECRET)
    // Eğer ortam değişkeni yoksa uyarı ver, güvenlik için fallback
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret) {
      if (authHeader !== `Bearer ${expectedSecret}`) {
        console.warn(`[CRON] Yetkisiz self-improve tetiklemesi engellendi. IP: ${req.headers.get('x-forwarded-for')}`);
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn(`[CRON] CRON_SECRET çevre değişkeni bulunamadı. Herkese açık cron tehlikesi!`);
      // Eğer geliştirme aşamasındaysak ve secret yoksa devam et, ama prod'da bu log izlenmeli.
    }

    const result = await runSelfImprovement();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Otonom evrim süreci başarıyla tamamlandı.",
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || result.reason || "Evrim başarısız"
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error(`[CRON] Evrim endpoint hatası:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

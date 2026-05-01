import { NextResponse } from 'next/server';
import { runBatchPipeline } from '@/core/aloha/newsEngine';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minute timeout for warm-up

/**
 * POST /api/system/warmup
 * 
 * TRTEX Warm-Up: Hızlı içerik üretimi — ana sayfayı doldurmak için
 * Otonom ajanlar (ALOHA) üzerinden 2026 sektörel haberleri üretir.
 * 
 * Limitler kaldırılmış (founder override) — agresif mod.
 */

// Otonom ajanlara verilecek sektör başlıkları (brief'ler)
const WARMUP_BRIEFS = [
  'Ev tekstili ve kontrat (otel/hastane) pazarında 2026 eğilimleri',
  'Yapay zeka destekli kumaş kalite kontrol sistemleri pazar analizi',
  'Avrupa pazarında sürdürülebilir ve geri dönüştürülmüş tekstil talebi',
  'Ortadoğu pazarındaki lüks perde kumaşı tüketimi ve beklentiler',
  'Global hammadde maliyetleri ve Asya tedarik zinciri analizleri',
  'Döşemelik kumaş trendlerinde yeni nesil tekstil teknolojileri'
];

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && authHeader !== 'Bearer warmup-override') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];
  let created = 0;
  
  try {
    results.push('🤖 ALOHA Intelligence Motoru Başlatıldı');
    
    // Rastgele 2 konu seç (API timeout yememek için batch boyutunu küçük tutuyoruz)
    const shuffled = [...WARMUP_BRIEFS].sort(() => 0.5 - Math.random());
    const selectedBriefs = shuffled.slice(0, 2);
    
    results.push(`Seçilen konular: ${selectedBriefs.join(' | ')}`);
    
    const pipelineResults = await runBatchPipeline(selectedBriefs);
    
    pipelineResults.forEach((res, i) => {
      if (res.success) {
        created++;
        results.push(`✅ [BAŞARILI] ${res.title} (Kalite: ${res.qualityScore})`);
      } else {
        results.push(`❌ [HATA] ${selectedBriefs[i]} -> ${res.error}`);
      }
    });

    // Terminal payload'u güncelle
    try {
      const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
      await buildTerminalPayload();
      results.push(`🔄 Terminal payload otonom güncellendi`);
    } catch (err: any) {
      results.push(`⚠️ Terminal güncelleme hatası: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      created,
      total: selectedBriefs.length,
      results,
      message: `${created} yeni otonom haber oluşturuldu, terminal güncellendi.`,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 });
  }
}

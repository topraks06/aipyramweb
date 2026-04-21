/**
 * TRTEX İçerik Yapısı Onarım Script — AŞAMA 1B
 * Sadece fix_formatting (heading ekleme) ve add_keywords odaklı
 * Görsel üretimi YOK — Imagen API rate limit'e takılmaz
 * Kullanım: npx tsx scripts/trtex-content-repair.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import '@/lib/firebase-admin';

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('📝 TRTEX İÇERİK YAPI ONARIMI — AŞAMA 1B');
  console.log('═══════════════════════════════════════════');
  console.log('🎯 Hedef: fix_formatting + add_keywords (görsel YOK)\n');

  const { adminDb } = await import('@/lib/firebase-admin');
  const { autoRepair } = await import('@/core/swarm/autoRepair');
  const { deepSiteAudit } = await import('@/core/swarm/deepAudit');

  // ADIM 1: Audit — sadece repair plan'ı al
  console.log('[1/3] 🔍 Audit çalıştırılıyor...');
  const report = await deepSiteAudit('trtex');
  console.log(`📊 Skor: ${report.score}/100 | Toplam aksiyon: ${report.repairPlan.length}`);

  // ADIM 2: Sadece heading fix + keyword aksiyonlarını filtrele
  const contentActions = report.repairPlan.filter(
    (a: any) => a.action === 'fix_formatting' || a.action === 'add_keywords' || a.action === 'add_ai_commentary'
  );
  
  console.log(`\n📋 Filtrelenen aksiyonlar:`);
  console.log(`  - fix_formatting: ${contentActions.filter((a: any) => a.action === 'fix_formatting').length}`);
  console.log(`  - add_keywords: ${contentActions.filter((a: any) => a.action === 'add_keywords').length}`);
  console.log(`  - add_ai_commentary: ${contentActions.filter((a: any) => a.action === 'add_ai_commentary').length}`);
  console.log(`  🚫 Atlanan (görsel): ${report.repairPlan.length - contentActions.length}`);

  if (contentActions.length === 0) {
    console.log('\n✅ İçerik onarımı gerektiren aksiyon yok!');
    process.exit(0);
  }

  // ADIM 3: Onarım çalıştır (max 30, görsel-dışı)
  console.log(`\n[2/3] 🔧 İçerik onarımı başlatılıyor (${Math.min(contentActions.length, 30)} aksiyon)...`);
  const result = await autoRepair('trtex', contentActions, false, 30, process.env.GEMINI_API_KEY);

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`📊 ONARIM SONUCU:`);
  console.log(`  ✅ Düzeltilen: ${result.fixed}`);
  console.log(`  ⏭️ Atlanan: ${result.skipped}`);
  console.log(`  ❌ Hata: ${result.errors}`);
  console.log(`═══════════════════════════════════════════`);

  // Detaylar
  for (const d of result.details) {
    const icon = d.status === 'fixed' ? '✅' : d.status === 'error' ? '❌' : '⏭️';
    console.log(`  ${icon} ${d.action} → ${d.detail}`);
  }

  // ADIM 4: Re-Audit
  console.log('\n[3/3] 🔍 Re-Audit (skor doğrulama)...');
  const reAudit = await deepSiteAudit('trtex');
  
  console.log(`\n═══════════════════════════════════════════`);
  console.log(`📊 SKOR DEĞİŞİMİ: ${report.score}/100 → ${reAudit.score}/100`);
  console.log(`  📝 İçerik: ${report.scores.content} → ${reAudit.scores.content}`);
  console.log(`  🖼️ Görsel: ${report.scores.images} → ${reAudit.scores.images}`);
  console.log(`  🔍 SEO: ${report.scores.seo} → ${reAudit.scores.seo}`);
  console.log(`  🎨 Çeşitlilik: ${report.scores.diversity} → ${reAudit.scores.diversity}`);
  console.log(`  ⏰ Tazelik: ${report.scores.freshness} → ${reAudit.scores.freshness}`);
  console.log(`═══════════════════════════════════════════\n`);

  process.exit(0);
}

main().catch(e => {
  console.error('❌ FATAL:', e.message);
  process.exit(1);
});

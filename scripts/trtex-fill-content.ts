/**
 * TRTEX Fill Content — AŞAMA 2
 * Boş/zayıf içerikli makalelere Gemini ile authority content yazma
 * fix_formatting zaten yapıldı → şimdi fill_content + kalan fix_formatting
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import '@/lib/firebase-admin';

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('📝 TRTEX AŞAMA 2 — FILL CONTENT + FIX_FORMATTING');
  console.log('═══════════════════════════════════════════\n');

  const { autoRepair } = await import('@/core/swarm/autoRepair');
  const { deepSiteAudit } = await import('@/core/swarm/deepAudit');

  // ADIM 1: Audit
  console.log('[1/4] 🔍 Audit çalıştırılıyor...');
  const report = await deepSiteAudit('trtex');
  console.log(`📊 Skor: ${report.score}/100 | Toplam aksiyon: ${report.repairPlan.length}`);
  console.log(`   İçerik: ${report.scores.content} | Görsel: ${report.scores.images} | SEO: ${report.scores.seo}\n`);

  // ADIM 2: Öncelik sırasıyla filtrele (GPT stratejisi)
  // 1. fill_content (en yüksek etki — boş makaleler)
  // 2. fix_formatting (kalan heading eksikleri)  
  // 3. add_keywords + add_ai_commentary
  // ❌ Görsel: ATLANIYOR (Imagen rate limit)
  
  const fillContent = report.repairPlan.filter((a: any) => a.action === 'fill_content');
  const fixFormatting = report.repairPlan.filter((a: any) => a.action === 'fix_formatting');
  const addKeywords = report.repairPlan.filter((a: any) => a.action === 'add_keywords');
  const addCommentary = report.repairPlan.filter((a: any) => a.action === 'add_ai_commentary');

  console.log(`📋 Onarım planı dağılımı:`);
  console.log(`  🔴 fill_content: ${fillContent.length} (EN ÖNCELİKLİ)`);
  console.log(`  🟡 fix_formatting: ${fixFormatting.length}`);
  console.log(`  🟢 add_keywords: ${addKeywords.length}`);
  console.log(`  🔵 add_ai_commentary: ${addCommentary.length}`);

  // Öncelikli sıralama: fill_content → fix_formatting → add_keywords → add_ai_commentary
  const prioritizedActions = [
    ...fillContent,
    ...fixFormatting,
    ...addKeywords,
    ...addCommentary,
  ];

  if (prioritizedActions.length === 0) {
    console.log('\n✅ İçerik onarımı gerektiren aksiyon yok!');
    process.exit(0);
  }

  // ADIM 3: Batch çalıştır (max 30 — güvenli limit)
  const batchSize = 30;
  console.log(`\n[2/4] 🔧 Batch onarım: ${Math.min(prioritizedActions.length, batchSize)} aksiyon...`);
  const result = await autoRepair('trtex', prioritizedActions, false, batchSize, process.env.GEMINI_API_KEY);

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`📊 BATCH SONUCU:`);
  console.log(`  ✅ Düzeltilen: ${result.fixed}`);
  console.log(`  ⏭️ Atlanan: ${result.skipped}`);
  console.log(`  ❌ Hata: ${result.errors}`);
  console.log(`═══════════════════════════════════════════`);

  for (const d of result.details) {
    const icon = d.status === 'fixed' ? '✅' : d.status === 'error' ? '❌' : '⏭️';
    console.log(`  ${icon} ${d.action} → ${d.detail}`);
  }

  // ADIM 4: Re-Audit
  console.log('\n[3/4] 🔍 Re-Audit...');
  const reAudit = await deepSiteAudit('trtex');

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`📊 SKOR DEĞİŞİMİ: ${report.score}/100 → ${reAudit.score}/100`);
  console.log(`  📝 İçerik: ${report.scores.content} → ${reAudit.scores.content}`);
  console.log(`  🖼️ Görsel: ${report.scores.images} → ${reAudit.scores.images}`);
  console.log(`  🔍 SEO: ${report.scores.seo} → ${reAudit.scores.seo}`);
  console.log(`  🎨 Çeşitlilik: ${report.scores.diversity} → ${reAudit.scores.diversity}`);
  console.log(`  ⏰ Tazelik: ${report.scores.freshness} → ${reAudit.scores.freshness}`);
  console.log(`  ⚠️ Uyarılar: ${report.issues.length} → ${reAudit.issues.length}`);
  console.log(`  🔧 Kalan: ${reAudit.repairPlan.length} aksiyon`);
  console.log(`═══════════════════════════════════════════\n`);

  // Sıradaki turda ne yapılacağını göster
  const nextFill = reAudit.repairPlan.filter((a: any) => a.action === 'fill_content').length;
  const nextFix = reAudit.repairPlan.filter((a: any) => a.action === 'fix_formatting').length;
  if (nextFill + nextFix > 0) {
    console.log(`[4/4] 📋 Sıradaki tur için: ${nextFill} fill_content + ${nextFix} fix_formatting kaldı`);
  } else {
    console.log(`[4/4] ✅ İçerik onarımı tamamlandı!`);
  }

  process.exit(0);
}

main().catch(e => {
  console.error('❌ FATAL:', e.message);
  process.exit(1);
});

/**
 * TRTEX Kontrollü Onarım Script — AŞAMA 1
 * Standalone: doğrudan engine.ts tool'larını çağırır
 * Kullanım: npx tsx scripts/trtex-repair.ts
 */

// .env yükle (Next.js dışı standalone script)
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

// Firebase Admin init
import '@/lib/firebase-admin';

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🔧 TRTEX KONTROLLÜ ONARIM — AŞAMA 1');
  console.log('═══════════════════════════════════════════\n');
  
  const { executeToolCall } = await import('@/core/aloha/engine');

  // ADIM 1: Deep Site Audit
  console.log('[1/3] 🔍 Deep Site Audit başlatılıyor...');
  const auditResult = await executeToolCall({
    name: 'deep_site_audit',
    args: { project: 'trtex' }
  });
  console.log(auditResult);

  // ADIM 2: Kontrollü Onarım (maxActions=30, dryRun=false)
  console.log('\n[2/3] 🔧 Auto Repair başlatılıyor (max 30 aksiyon)...');
  const repairResult = await executeToolCall({
    name: 'auto_repair_project',
    args: { project: 'trtex', dryRun: false, maxActions: 30 }
  });
  console.log(repairResult);

  // ADIM 3: Re-Audit (skor doğrulama)
  console.log('\n[3/3] 🔍 Re-Audit (skor doğrulama)...');
  const reAuditResult = await executeToolCall({
    name: 'deep_site_audit',
    args: { project: 'trtex' }
  });
  console.log(reAuditResult);

  console.log('\n═══════════════════════════════════════════');
  console.log('✅ TRTEX AŞAMA 1 TAMAMLANDI');
  console.log('═══════════════════════════════════════════\n');
  
  process.exit(0);
}

main().catch(e => {
  console.error('❌ FATAL:', e.message);
  process.exit(1);
});

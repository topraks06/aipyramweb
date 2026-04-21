/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA CHAIN EXECUTOR — Otonom Zincir Düşünme Motoru         ║
 * ║  Bir görevi baştan sona kendi parçalayarak çözer              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * AKIŞ:
 *   audit → sorunları grupla → plan oluştur → batch repair →
 *   tekrar audit → rapor → memory'ye yaz
 * 
 * ÖZELLİKLER:
 *   - Step queue (max 20 adım)
 *   - Retry logic (3 deneme)
 *   - Tool chaining (önceki sonuç → sonraki girdi)
 *   - Circuit breaker (ardışık 3 hata → dur)
 *   - Zaman limiti (max 10 dk)
 *   - Memory entegrasyonu
 */

import { executeToolCall } from './engine';
import { alohaMemory } from './memory';
import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
//  TİPLER
// ═══════════════════════════════════════

export interface ChainStep {
  id: string;
  tool: string;
  args: any;
  description: string;
  dependsOn?: string;        // Önceki adımın ID'si
  transformInput?: (prevResult: string) => any;  // Önceki sonucu -> yeni args
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  result?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ChainPlan {
  id: string;
  name: string;
  project: string;
  steps: ChainStep[];
  status: 'pending' | 'running' | 'done' | 'failed' | 'partial';
  createdAt: string;
  completedAt?: string;
  summary?: string;
  stats: {
    total: number;
    done: number;
    failed: number;
    skipped: number;
  };
}

export interface ChainResult {
  plan: ChainPlan;
  duration: number;
  success: boolean;
}

// ═══════════════════════════════════════
//  CHAIN BUILDER — Hazır zincir planları
// ═══════════════════════════════════════

/**
 * Tam site onarım zinciri:
 * audit → slug fix → repair → re-audit → rapor
 */
export function buildFullRepairChain(project: string): ChainStep[] {
  return [
    {
      id: 'audit',
      tool: 'deep_site_audit',
      args: { project },
      description: `${project} tam site denetimi`,
      retryCount: 0,
      maxRetries: 2,
      status: 'pending',
    },
    {
      id: 'repair',
      tool: 'auto_repair_project',
      args: { project, dryRun: false, maxActions: 30 },
      description: `${project} otonom onarım (audit sonuçlarına göre)`,
      dependsOn: 'audit',
      retryCount: 0,
      maxRetries: 1,
      status: 'pending',
    },
    {
      id: 'content_refresh',
      tool: 'trigger_trtex_master_feed',
      args: {},
      description: `${project} taze içerik üretimi`,
      dependsOn: 'repair',
      retryCount: 0,
      maxRetries: 2,
      status: 'pending',
    },
    {
      id: 'image_scan',
      tool: 'scan_missing_images',
      args: { collection: `${project}_news`, limit: 15, dryRun: false },
      description: `${project} görselsiz haberlere AI görsel üret`,
      dependsOn: 'content_refresh',
      retryCount: 0,
      maxRetries: 1,
      status: 'pending',
    },
    {
      id: 're_audit',
      tool: 'deep_site_audit',
      args: { project },
      description: `${project} onarım sonrası doğrulama denetimi`,
      dependsOn: 'image_scan',
      retryCount: 0,
      maxRetries: 1,
      status: 'pending',
    },
  ];
}

/**
 * Hızlı sağlık kontrolü zinciri (5 dk)
 */
export function buildHealthCheckChain(project: string): ChainStep[] {
  return [
    {
      id: 'analyze',
      tool: 'analyze_project',
      args: { projectName: project },
      description: `${project} hızlı analiz`,
      retryCount: 0,
      maxRetries: 2,
      status: 'pending',
    },
    {
      id: 'audit',
      tool: 'deep_site_audit',
      args: { project },
      description: `${project} deep audit`,
      dependsOn: 'analyze',
      retryCount: 0,
      maxRetries: 1,
      status: 'pending',
    },
  ];
}

/**
 * İçerik üretim zinciri
 */
export function buildContentChain(project: string): ChainStep[] {
  return [
    {
      id: 'research',
      tool: 'research_industry',
      args: { topic: 'ev tekstili perde dekorasyon trendleri', category: 'textile' },
      description: 'Sektör araştırması',
      retryCount: 0,
      maxRetries: 2,
      status: 'pending',
    },
    {
      id: 'produce',
      tool: 'trigger_trtex_master_feed',
      args: {},
      description: `${project} yeni içerik üret`,
      dependsOn: 'research',
      retryCount: 0,
      maxRetries: 2,
      status: 'pending',
    },
    {
      id: 'images',
      tool: 'scan_missing_images',
      args: { collection: `${project}_news`, limit: 10, dryRun: false },
      description: 'Görselsiz haberlere görsel üret',
      dependsOn: 'produce',
      retryCount: 0,
      maxRetries: 1,
      status: 'pending',
    },
  ];
}

// ═══════════════════════════════════════
//  CHAIN EXECUTOR — Zincir çalıştırıcı
// ═══════════════════════════════════════

const MAX_CHAIN_DURATION = 10 * 60 * 1000; // 10 dakika
const CIRCUIT_BREAKER_THRESHOLD = 3;       // 3 ardışık hata = dur

export async function executeChain(
  name: string,
  project: string,
  steps: ChainStep[]
): Promise<ChainResult> {
  const startTime = Date.now();
  
  const plan: ChainPlan = {
    id: `chain_${Date.now()}`,
    name,
    project,
    steps: [...steps],
    status: 'running',
    createdAt: new Date().toISOString(),
    stats: { total: steps.length, done: 0, failed: 0, skipped: 0 },
  };

  console.log(`\n[⛓️ CHAIN] ═══════════════════════════════════════`);
  console.log(`[⛓️ CHAIN] ${name} — ${project.toUpperCase()}`);
  console.log(`[⛓️ CHAIN] ${steps.length} adım planlandı`);
  console.log(`[⛓️ CHAIN] ═══════════════════════════════════════\n`);

  let consecutiveErrors = 0;
  let previousResult = '';

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    
    // Zaman limiti kontrolü
    if (Date.now() - startTime > MAX_CHAIN_DURATION) {
      console.log(`[⛓️ CHAIN] ⏰ ZAMAN LİMİTİ AŞILDI (${Math.round((Date.now() - startTime) / 60000)} dk)`);
      step.status = 'skipped';
      plan.stats.skipped++;
      continue;
    }

    // Circuit breaker kontrolü
    if (consecutiveErrors >= CIRCUIT_BREAKER_THRESHOLD) {
      console.log(`[⛓️ CHAIN] 🔴 CIRCUIT BREAKER: ${consecutiveErrors} ardışık hata — zincir durduruluyor`);
      step.status = 'skipped';
      plan.stats.skipped++;
      continue;
    }

    // Dependency kontrolü
    if (step.dependsOn) {
      const dep = plan.steps.find(s => s.id === step.dependsOn);
      if (dep && dep.status === 'failed') {
        console.log(`[⛓️ CHAIN] ⏭️ [${i + 1}/${plan.steps.length}] ${step.description} → SKIP (bağımlılık başarısız: ${step.dependsOn})`);
        step.status = 'skipped';
        plan.stats.skipped++;
        continue;
      }
    }

    // Adımı çalıştır
    console.log(`[⛓️ CHAIN] 🔄 [${i + 1}/${plan.steps.length}] ${step.description}...`);
    step.status = 'running';
    step.startTime = Date.now();

    let success = false;
    let lastError = '';

    for (let attempt = 0; attempt <= step.maxRetries; attempt++) {
      try {
        // Önceki sonuçla args'ı güncelle (varsa)
        let finalArgs = step.args;
        if (step.transformInput && previousResult) {
          finalArgs = step.transformInput(previousResult);
        }

        const result = await executeToolCall({
          name: step.tool,
          args: finalArgs,
        });

        // Başarı kontrolü
        const isError = result.includes('[HATA]') || result.includes('[TOOL HATA]') || result.includes('izin listesinde yok');
        
        if (isError) {
          lastError = result.substring(0, 200);
          if (attempt < step.maxRetries) {
            console.log(`[⛓️ CHAIN] ⚠️ Retry ${attempt + 1}/${step.maxRetries}: ${step.tool}`);
            await new Promise(r => setTimeout(r, 3000)); // 3 sn bekle
            continue;
          }
        } else {
          step.result = result;
          previousResult = result;
          step.status = 'done';
          step.endTime = Date.now();
          plan.stats.done++;
          consecutiveErrors = 0;
          success = true;
          
          console.log(`[⛓️ CHAIN] ✅ [${i + 1}/${plan.steps.length}] ${step.description} — ${Math.round((step.endTime - step.startTime!) / 1000)}s`);
          break;
        }
      } catch (err: any) {
        lastError = err.message || 'Bilinmeyen hata';
        if (attempt < step.maxRetries) {
          console.log(`[⛓️ CHAIN] ⚠️ Retry ${attempt + 1}/${step.maxRetries}: ${lastError.substring(0, 100)}`);
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    }

    if (!success) {
      step.status = 'failed';
      step.error = lastError;
      step.endTime = Date.now();
      plan.stats.failed++;
      consecutiveErrors++;
      console.log(`[⛓️ CHAIN] ❌ [${i + 1}/${plan.steps.length}] ${step.description} — FAILED: ${lastError.substring(0, 100)}`);
    }
  }

  // Sonuç hesapla
  const duration = Date.now() - startTime;
  plan.completedAt = new Date().toISOString();
  plan.status = plan.stats.failed === 0 && plan.stats.skipped === 0 ? 'done'
    : plan.stats.done === 0 ? 'failed'
    : 'partial';

  plan.summary = `[${project.toUpperCase()} ${name}] ` +
    `✅ ${plan.stats.done}/${plan.stats.total} başarılı | ` +
    `❌ ${plan.stats.failed} hata | ⏭️ ${plan.stats.skipped} atlandı | ` +
    `⏱️ ${Math.round(duration / 1000)}s`;

  console.log(`\n[⛓️ CHAIN] ═══════════════════════════════════════`);
  console.log(`[⛓️ CHAIN] ${plan.summary}`);
  console.log(`[⛓️ CHAIN] ═══════════════════════════════════════\n`);

  // Memory'ye yaz
  try {
    await alohaMemory.addMemory('assistant', `chain:${name}`, {
      type: 'chain_execution',
      project,
      result: plan.summary,
      success: plan.status === 'done',
      stats: plan.stats,
      duration,
      steps: plan.steps.map(s => ({
        id: s.id,
        tool: s.tool,
        status: s.status,
        duration: s.endTime && s.startTime ? s.endTime - s.startTime : 0,
      })),
    });
  } catch { /* sessiz */ }

  // Firestore'a rapor yaz
  try {
    await adminDb.collection('aloha_chain_logs').add({
      ...plan,
      duration,
    });
  } catch { /* sessiz */ }

  return { plan, duration, success: plan.status === 'done' || plan.status === 'partial' };
}

// ═══════════════════════════════════════
//  HAZIR ZİNCİRLER (Tek çağrıyla çalıştır)
// ═══════════════════════════════════════

/** Tam site onarım zinciri */
export async function runFullRepair(project: string): Promise<ChainResult> {
  return executeChain('Full Repair', project, buildFullRepairChain(project));
}

/** Hızlı sağlık kontrolü */
export async function runHealthCheck(project: string): Promise<ChainResult> {
  return executeChain('Health Check', project, buildHealthCheckChain(project));
}

/** İçerik üretim zinciri */
export async function runContentGeneration(project: string): Promise<ChainResult> {
  return executeChain('Content Generation', project, buildContentChain(project));
}

/** Tüm projeler için sıralı tam onarım */
export async function runFullEcosystemRepair(): Promise<ChainResult[]> {
  const results: ChainResult[] = [];
  const projects = ['trtex', 'hometex', 'perde'];
  
  for (const project of projects) {
    console.log(`\n[🌍 ECOSYSTEM] ═══ ${project.toUpperCase()} başlıyor ═══\n`);
    const result = await runFullRepair(project);
    results.push(result);
    
    // Projeler arası 30 sn bekleme (API limitleri)
    if (project !== projects[projects.length - 1]) {
      console.log(`[🌍 ECOSYSTEM] ⏳ 30 sn bekleniyor...`);
      await new Promise(r => setTimeout(r, 30000));
    }
  }
  
  return results;
}

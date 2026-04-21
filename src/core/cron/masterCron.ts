import { EventBus } from '../events/eventBus';
import { proposalQueue } from '../aloha/proposalQueue';
import { executeToolCall } from '../aloha/engine';
import * as fs from 'fs';
import * as path from 'path';

/**
 * MASTER CRON v2.0 — GERÇEK İŞ YAPAN OTONOM BEYİN
 * 
 * Tüm projeleri dinamik olarak tarar (projeler zip + aipyramweb).
 * Sorunları tespit eder, teklif kuyruğuna yazar, onaylanmışları yürütür.
 */

const PROJECTS_BASE_DIR = "C:/Users/MSI/Desktop/projeler zip";

function getAllProjects(): string[] {
  const projects = ['aipyramweb']; // Her zaman dahil
  try {
    if (fs.existsSync(PROJECTS_BASE_DIR)) {
      const items = fs.readdirSync(PROJECTS_BASE_DIR, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'domains' && item.name !== 'server') {
          projects.push(item.name.replace('.com', '').replace('.ai', '').replace('.net', ''));
        }
      }
    }
  } catch { /* dizin okunamadı */ }
  // Duplikatları temizle
  return [...new Set(projects)];
}

const SCAN_INTERVAL_MS = 30 * 60 * 1000; // 30 dakika
const APPROVED_CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 dakika

class MasterCron {
  private isInitialized = false;

  constructor() {
    console.log(`[⏰ CRON v2.0] Master Brain Otonom Modunda Hazırlanıyor...`);
    this.setupGlobalCrashShield();
  }

  private setupGlobalCrashShield() {
    process.on('uncaughtException', (err) => {
      console.error('🚨 [CRITICAL SHIELD] Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 [CRITICAL SHIELD] Unhandled Rejection:', reason);
    });
  }

  public initSystem() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[⏰ CRON v2.0] 🔥 OTONOM SİSTEM AYAĞA KALKIYOR');
    
    // İlk taramayı 2 dakika sonra başlat (sunucu tam ayağa kalksın)
    setTimeout(() => {
      this.runFullScan();
    }, 120000);

    // Periyodik tam tarama (30 dakikada bir)
    setInterval(() => {
      this.runFullScan();
    }, SCAN_INTERVAL_MS);

    // Onaylanan teklifleri kontrol et (2 dakikada bir)
    setInterval(() => {
      this.executeApprovedProposals();
    }, APPROVED_CHECK_INTERVAL_MS);

    // Sistem sağlık sinyali (5 dakikada bir)
    setInterval(() => {
      this.triggerPulse();
    }, 300000);
  }

  public triggerPulse() {
    EventBus.emit({
      type: 'SYSTEM_HEALTH_CHECK',
      source: 'master_cron_v2',
      payload: {
        timestamp: Date.now(),
        checkType: 'periodic_pulse'
      }
    });
    return { status: "Health Check Fired" };
  }

  /**
   * TÜM PROJELERİ TARA — Sorunları tespit et ve teklif kuyruğuna yaz
   */
  public async runFullScan() {
    console.log(`\n[⏰ CRON v2.0] ═══════════════════════════════════════`);
    console.log(`[⏰ CRON v2.0] 🔍 OTONOM TAM TARAMA BAŞLATILIYOR (${new Date().toISOString()})`);
    console.log(`[⏰ CRON v2.0] ═══════════════════════════════════════\n`);

    const allProjects = getAllProjects();
    console.log(`[⏰ CRON v2.0] 🌐 ${allProjects.length} proje taranacak: ${allProjects.join(', ')}\n`);

    for (const project of allProjects) {
      try {
        console.log(`[⏰ CRON v2.0] 📋 Taranıyor: ${project.toUpperCase()}`);
        
        // Gerçek analiz çalıştır
        const analysisResult = await executeToolCall({
          name: 'analyze_project',
          args: { projectName: project }
        });

        // Sorunları parse et ve teklif kuyruğuna yaz
        await this.detectAndProposeIssues(project, analysisResult);

      } catch (err: any) {
        console.error(`[⏰ CRON v2.0] ❌ ${project} taranamadı:`, err.message);
      }
    }

    console.log(`[⏰ CRON v2.0] ✅ Tarama tamamlandı.\n`);
  }

  /**
   * Analiz sonucundan sorunları çıkar ve teklif oluştur
   */
  private async detectAndProposeIssues(project: string, analysisResult: string) {
    // Cache kontrolü — aynı sorunu tekrar teklif etme
    const cacheResult = analysisResult.includes('[⚡ CACHE HIT]');
    if (cacheResult) return;

    // BAYAT İÇERİK TESPİTİ (confidence: 0.85 - yüksek, yenileme genelde güvenli)
    if (analysisResult.includes('⚠️ BAYAT') || analysisResult.includes('BAYAT')) {
      const hoursMatch = analysisResult.match(/(\d+) saat önce/);
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      // Ne kadar bayatsa o kadar emin
      const confidence = hours > 48 ? 0.95 : hours > 24 ? 0.85 : 0.65;

      await proposalQueue.addProposal({
        project,
        issueType: 'stale_content',
        severity: hours > 48 ? 'critical' : 'warning',
        confidence,
        title: `${project.toUpperCase()} içeriği bayat (${hours} saat)`,
        description: `Son içerik ${hours} saat önce yayınlanmış. Yenileme gerekli.`,
        proposedAction: `trigger_${project === 'trtex' ? 'trtex_master_feed' : 'project_content'} ile yeni içerik üret`,
        toolToCall: project === 'trtex' ? 'trigger_trtex_master_feed' : 'trigger_project_content',
        toolArgs: project === 'trtex' ? {} : { projectName: project, contentType: 'news' },
      });
    }

    // BOŞ FIREBASE KOLEKSİYONU (confidence: 0.95 - çok emin, veri yok)
    if (analysisResult.includes('❌ FIREBASE') && analysisResult.includes('BOŞ')) {
      await proposalQueue.addProposal({
        project,
        issueType: 'missing_file',
        severity: 'critical',
        confidence: 0.95,
        title: `${project.toUpperCase()} Firebase koleksiyonu BOŞ!`,
        description: 'Veritabanında hiç veri yok. İçerik üretim motoru çalıştırılmalı.',
        proposedAction: 'İçerik üretim motorunu tetikle',
        toolToCall: 'trigger_project_content',
        toolArgs: { projectName: project, contentType: 'news' },
      });
    }

    // BUILD HATASI TESPİTİ (confidence: 0.7 - orta, analiz gerekebilir)
    if (analysisResult.includes('BUILD') && analysisResult.includes('HATA')) {
      await proposalQueue.addProposal({
        project,
        issueType: 'build_error',
        severity: 'critical',
        confidence: 0.7,
        title: `${project.toUpperCase()} build hatası tespit edildi`,
        description: 'Projenin derlenmesinde sorun var. İnceleme ve müdahale gerekli.',
        proposedAction: 'Build loglarını incele ve hatayı düzelt',
        toolToCall: 'analyze_project',
        toolArgs: { projectName: project },
      });
    }

    // package.json OKUNAMIYOR (confidence: 0.9 - yüksek, dizin yolu yanlış)
    if (analysisResult.includes('package.json okunamadı')) {
      await proposalQueue.addProposal({
        project,
        issueType: 'missing_file',
        severity: 'critical',
        confidence: 0.9,
        title: `${project.toUpperCase()} package.json bulunamıyor`,
        description: 'Projenin temel yapılandırma dosyası okunamıyor. Dizin yolu kontrol edilmeli.',
        proposedAction: 'Proje dizinini doğrula',
      });
    }
  }

  /**
   * ONAYLANMIŞ TEKLİFLERİ YÜRÜT — Cloud Scheduler'dan da çağrılabilir
   */
  public async runApprovedExecutions() {
    return this.executeApprovedProposals();
  }

  private async executeApprovedProposals() {
    try {
      const approved = await proposalQueue.getApprovedProposals();
      if (approved.length === 0) return;

      console.log(`[⏰ CRON v2.0] 🎯 ${approved.length} onaylı teklif yürütülecek...`);

      for (const proposal of approved) {
        // GUARD: Zaten yürütülmüş? Atla.
        if (proposal.status === 'executed' || proposal.status === 'failed') continue;

        // COOLDOWN: 60 saniyeden yeni oluşturulmuş? Sabret.
        if (Date.now() - proposal.detectedAt < 60000) {
          console.log(`[⏰ CRON v2.0] ⏳ Cooldown: "${proposal.title}" — henüz 60sn dolmadı.`);
          continue;
        }

        if (!proposal.toolToCall || !proposal.id) {
          await proposalQueue.markExecuted(proposal.id!, 'Araç tanımsız — atlanıyor', false);
          continue;
        }

        try {
          // DRY-RUN MODE: Önce simülasyon yap, sonucu göster
          if (proposal.status === 'dry-run' || proposal.mode === 'dry-run') {
            console.log(`[⏰ CRON v2.0] 🧪 DRY-RUN: ${proposal.title} (${proposal.toolToCall})`);
            
            // Dry-run: Sadece analiz yap, değişiklik yapma
            const dryResult = `[🧪 DRY-RUN SONUCU]\nAraç: ${proposal.toolToCall}\nParametreler: ${JSON.stringify(proposal.toolArgs || {})}\nGüven: ${proposal.confidence || '?'}\nBu işlem onaylandığında çalıştırılacak komut yukarıdakidir. Gerçek execute için ONAYLA butonuna tekrar basın (execute modunda).`;
            
            await proposalQueue.markDryRunDone(proposal.id!, dryResult);
            console.log(`[⏰ CRON v2.0] 🧪 Dry-run sonucu kaydedildi.`);
            continue;
          }

          // EXECUTE MODE: Gerçek yürütme
          console.log(`[⏰ CRON v2.0] 🔧 EXECUTE: ${proposal.title} (${proposal.toolToCall})`);
          
          const result = await executeToolCall({
            name: proposal.toolToCall,
            args: proposal.toolArgs || {},
          });

          const success = !result.includes('[HATA]') && !result.includes('[TOOL HATA]') && !result.includes('[RATE LIMIT]');
          await proposalQueue.markExecuted(proposal.id!, result, success);
          
          console.log(`[⏰ CRON v2.0] ${success ? '✅' : '❌'} Sonuç: ${result.substring(0, 200)}`);
        } catch (err: any) {
          await proposalQueue.markExecuted(proposal.id!, `Exception: ${err.message}`, false);
          console.error(`[⏰ CRON v2.0] ❌ Yürütme hatası:`, err.message);
        }
      }
    } catch (err: any) {
      // Firestore erişim hatası — sessizce geç
    }
  }
}

const globalForCron = global as unknown as { masterCron: MasterCron };
export const masterCron = globalForCron.masterCron || new MasterCron();

if (process.env.NODE_ENV !== 'production') {
  globalForCron.masterCron = masterCron;
}

import { executeToolCall } from './engine';
import { proposalQueue } from './proposalQueue';
import { shouldAutoExecute } from './toolPermissions';
import { alohaMemory } from './memory';
import { evaluateInitiative, calculateHealthScore, getPendingLongTasks } from './initiative';
import { adminDb } from '@/lib/firebase-admin';
import { dlq } from './dlq';
import { alohaAI } from './aiClient';
import { safeParseLLM, schemas } from './schemaGuard';
import { recoverCycleState, endCycle } from './controlTower';
import { recoverSafeModeState } from './strategicDecisionEngine';
import type { AlohaDirective } from './aloha-directive-protocol';

/**
 * READ NORMALIZATION — Firestore dokümanından tarih alanını güvenli oku
 * Eski dokümanlar sadece createdAt, yeniler created_at + createdAt taşır
 * Bu helper her durumda çalışır.
 */
function getDocTimestamp(doc: any): string {
  const data = typeof doc.data === 'function' ? doc.data() : doc;
  return data.created_at || data.createdAt || data.publishedAt || data.published_at || '';
}

/**
 * ALOHA AUTO RUNNER — Otonom Operatör Döngüsü
 * 
 * Chatbot DEĞİL → Operatör Agent
 * 
 * Her döngüde:
 * 1. Projeyi analiz et
 * 2. Karar ver (ne eksik, ne bayat, ne kırık)
 * 3. İçerik üret
 * 4. Firebase'e yaz
 * 5. Log bas
 * 
 * Öncelik sırası: TRTEX → Hometex → Perde → Diğerleri
 */

// TEK TABANCA: TRTEX önce mükemmel çalışsın. Diğerleri ileride açılacak.
// const PRIORITY_PROJECTS = ['trtex', 'hometex', 'perde'];
const PRIORITY_PROJECTS = ['trtex'];

export interface CycleResult {
  project: string;
  actionsPerformed: string[];
  errors: string[];
  duration: number;
  timestamp: number;
}

/**
 * Tek proje için otonom döngü çalıştır
 */
export async function runAlohaCycle(projectName: string): Promise<CycleResult> {
  const startTime = Date.now();
  const result: CycleResult = {
    project: projectName,
    actionsPerformed: [],
    errors: [],
    duration: 0,
    timestamp: startTime,
  };

  console.log(`\n[🔥 ALOHA OPERATOR] ═══════════════════════════════════`);
  console.log(`[🔥 ALOHA OPERATOR] Proje: ${projectName.toUpperCase()} — Otonom Döngü Başladı`);
  console.log(`[🔥 ALOHA OPERATOR] ═══════════════════════════════════\n`);

  // ═══════════════════════════════════════
  // CRON LOCK — Firestore Transaction ile ATOMİK (TOCTOU fix)
  // İki container aynı anda çalışamaz — race condition engellendi
  // ═══════════════════════════════════════
  try {
    if (adminDb) {
      const lockRef = adminDb.collection('system_state').doc(`feed_lock_${projectName}`);
      const cooldownMs = 5 * 60 * 1000; // 5 dakika
      const staleLockMs = 15 * 60 * 1000; // 15 dk — orphan lock otomatik serbest bırakma

      const lockAcquired = await adminDb.runTransaction(async (transaction) => {
        const lockSnap = await transaction.get(lockRef);

        if (lockSnap.exists) {
          const lockData = lockSnap.data();
          const lastRun = lockData?.last_run ? new Date(lockData.last_run).getTime() : 0;
          const elapsed = Date.now() - lastRun;

          // Aktif ve cooldown içinde → SKIP
          if (elapsed < cooldownMs && lockData?.status === 'running') {
            return false; // Lock alınamadı
          }

          // Stale lock kontrolü — 15 dk'dan eski "running" lock → orphan, serbest bırak
          if (elapsed > staleLockMs && lockData?.status === 'running') {
            console.warn(`[ALOHA] ⚠️ STALE LOCK: ${projectName} ${Math.round(elapsed / 60000)} dk önce kilitlenmiş ama bitmemiş — serbest bırakılıyor`);
          }
        }

        // Atomik lock alma — başka transaction aynı anda burayı göremez
        transaction.set(lockRef, {
          last_run: new Date().toISOString(),
          status: 'running',
          project: projectName,
          container_id: process.env.K_REVISION || 'local',
        });
        return true; // Lock alındı
      });

      if (!lockAcquired) {
        console.log(`[ALOHA] ⏸️ CRON LOCK (ATOMIC): ${projectName} başka container tarafından çalıştırılıyor. SKIP.`);
        result.actionsPerformed.push('SKIPPED:cron_lock_atomic');
        result.duration = Date.now() - startTime;
        return result;
      }
    }
  } catch (lockErr) {
    await dlq.record(lockErr, 'autoRunner', projectName, 'cron_lock_acquisition');
  }

  // ═══════════════════════════════════════
  // GÜVENLİK ADIMI: COST GUARD (Bütçe & Loop Kalkanı)
  // ═══════════════════════════════════════
  try {
    const { checkCostParams } = await import('./costGuard');
    const costStatus = await checkCostParams(projectName);
    if (!costStatus.safe) {
      console.warn(`[ALOHA] 🛑 IŞLEM DURDURULDU (COST GUARD) -> ${costStatus.reason}`);
      result.actionsPerformed.push(`BLOCKED:cost_guard`);
      result.errors.push(costStatus.reason || 'Cost Limit Reached');
      result.duration = Date.now() - startTime;
      return result;
    }
    console.log(`[ALOHA] 🟢 CostGuard Aktif: Tüm limitler güvenli (Saatte ${costStatus.metrics.runsThisHour} döngü, Bugün ${costStatus.metrics.articlesToday} makale).`);
  } catch (costErr: any) {
    console.warn(`[ALOHA] ⚠️ Cost Guard okunamadı, devam ediliyor:`, costErr.message);
  }

  // ═══════════════════════════════════════
  // CFO AJAN (Bütçe Koruması - USD Bazlı)
  // ═══════════════════════════════════════
  try {
    const { dailyBudget } = await import('@/lib/sovereign-config');
    const limitUsd = dailyBudget[projectName as keyof typeof dailyBudget] || 2;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const costsSnap = await adminDb.collection('aloha_costs')
      .where('node', '==', projectName)
      .where('timestamp', '>=', todayStart)
      .get();

    let totalSpentUsd = 0;
    costsSnap.forEach(doc => { totalSpentUsd += (doc.data().estimatedCost || 0); });

    if (totalSpentUsd >= limitUsd) {
      console.error(`[CFO AJAN] 🛑 HARD LIMIT AŞILDI: ${projectName} için günlük bütçe (${limitUsd} USD) doldu. Harcanan: ${totalSpentUsd.toFixed(3)} USD. KILL SWITCH AKTİF.`);
      result.actionsPerformed.push(`BLOCKED:cfo_hard_limit`);
      result.errors.push(`CFO Budget Exceeded: ${totalSpentUsd.toFixed(3)} / ${limitUsd} USD`);
      result.duration = Date.now() - startTime;
      return result;
    } else if (totalSpentUsd >= limitUsd * 0.8) {
      console.warn(`[CFO AJAN] ⚠️ SOFT LIMIT UYARISI: ${projectName} bütçesinin %80'ini aştı. (${totalSpentUsd.toFixed(3)} / ${limitUsd} USD). Döngü yavaşlatılıyor...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Hız yavaşlatma (5 saniye ceza)
    } else {
      console.log(`[CFO AJAN] 💵 Bütçe Durumu: ${totalSpentUsd.toFixed(3)} / ${limitUsd} USD harcandı. Güvenli.`);
    }
  } catch (cfoErr: any) {
    console.warn(`[CFO AJAN] ⚠️ CFO denetimi başarısız:`, cfoErr.message);
  }

  try {
    // ═══════════════════════════════════════
    // TRTEX MASTER OVERRIDE
    // TRTEX operasyonu tamamen kendi Baş Ajanı'na devredilir.
    // ═══════════════════════════════════════
    if (projectName === 'trtex') {
      console.log(`[ALOHA STRATEGY] 🧠 ALOHA CEO olarak Stratejik Karar (Directive) oluşturuyor...`);
      
      const currentStrategy: AlohaDirective = {
         id: `DIR-${Date.now()}`,
         project: 'TRTEX',
         focus: 'SUPPLY_CHAIN', // CEO'nun o anki pazar kararı (Örn: navlun arttı, tedarik zinciri odaklan)
         targetMarkets: ['ABD', 'Almanya', 'AB'],
         forbiddenTopics: ['hazır giyim', 'moda', 'trend'],
         requiredSignalCount: 5,
         timestamp: new Date().toISOString(),
         strictMode: true
      };
      console.log(`[ALOHA STRATEGY] 📜 Emir (Directive): ${currentStrategy.focus} - ${currentStrategy.targetMarkets.join(', ')}`);

      console.log(`[ALOHA ORCHESTRATION] 🚨 Emir TRTEX Baş Ajanına (GM) devrediliyor...`);
      const { TrtexLeadAgent } = await import('../aloha/trtex/trtex-lead-agent');
      const leadAgent = new TrtexLeadAgent();
      
      // GM'e emri ver ve otonom döngüsünü başlat
      await leadAgent.runCycle({ directive: currentStrategy });
      
      result.actionsPerformed.push('trtex_lead_agent_override_with_directive');
      result.duration = Date.now() - startTime;
      
      // Kilidi kaldır
      try {
        const lockRef = adminDb?.collection('system_state').doc(`feed_lock_${projectName}`);
        if (lockRef) await lockRef.update({ status: 'completed' });
      } catch(e) {}
      
      return result; // Diğer genel işçileri TRTEX için çalıştırma!
    }

    // ═══════════════════════════════════════
    // ADIM -1: ENV GUARD (Çevre Değişkeni Doğrulama)
    // "Bir daha key eksik diye çökmeyecek"
    // ═══════════════════════════════════════
    try {
      const { validateEnvironment } = await import('./envGuard');
      const envCheck = validateEnvironment();
      if (envCheck.status === 'critical') {
        console.error(`[ALOHA] 🔴 ENV KRİTİK: ${envCheck.missing.filter(m => m.includes('KRİTİK')).length} zorunlu key eksik!`);
        result.actionsPerformed.push(`env_guard:CRITICAL`);
      } else if (envCheck.status === 'degraded') {
        result.actionsPerformed.push(`env_guard:DEGRADED(${envCheck.available.length}/${envCheck.available.length + envCheck.missing.length})`);
      } else {
        result.actionsPerformed.push(`env_guard:OK(${envCheck.available.length})`);
      }
    } catch (envErr: any) {
      console.warn(`[ALOHA] ⚠️ Env Guard hatası:`, envErr.message);
    }

    // ═══════════════════════════════════════
    // ADIM 0.05: SİNYAL TOPLAMA (Dış Dünya → Beyin)
    // "Önce olta denize atılır, sonra sepetteki balıklar işlenir"
    // MAX 3 haber/cycle, 90s timeout, günlük MAX 6 haber (COO v2.1)
    // TÜM PROJELER: trtex, hometex, perde
    // ═══════════════════════════════════════
    try {
      const { collectSignals } = await import('./signalCollector');
      const signalResult = await collectSignals(projectName);
      if (signalResult.articlesCreated > 0) {
        console.log(`[ALOHA] 🎣 SİNYAL ${projectName}: ${signalResult.signalsFound} sinyal → ${signalResult.articlesCreated} yeni haber (${signalResult.signalsFiltered} filtrelendi)`);
        result.actionsPerformed.push(`signal_collector:${signalResult.articlesCreated}new/${signalResult.signalsFiltered}filtered`);
        // 🧠 HAFIZA: Başarılı üretimi kalıcı derse dönüştür
        await alohaMemory.addLesson({
          type: 'pattern',
          content: `[${projectName}] ${signalResult.articlesCreated} haber üretildi (${signalResult.signalsFiltered} filtrelendi). Başarılı sinyal konuları: aktif pazar.`,
          project: projectName,
          importance: 'medium',
          tags: ['signal_collector', 'production', 'success'],
          learned_from: `signal_collector_${new Date().toISOString().split('T')[0]}`,
        });
      } else {
        console.log(`[ALOHA] 🎣 SİNYAL ${projectName}: ${signalResult.signalsFound} sinyal bulundu, ${signalResult.signalsFiltered} filtrelendi, 0 haber üretildi`);
        result.actionsPerformed.push('signal_collector:0new');
      }
    } catch (signalErr: any) {
      console.warn(`[ALOHA] ⚠️ Signal Collector hatası (${projectName}):`, signalErr.message);
    }

    // ═══════════════════════════════════════
    // ADIM 0.1: TİCARET PIPELINE (PARA ÖNCE!)
    // "Haber = içerik değil, ticaret sinyali"
    // ═══════════════════════════════════════
    try {
      const { runTradePipeline } = await import('./tradePipeline');
      const tradeResult = await runTradePipeline(projectName);
      if (tradeResult.opportunitiesFound > 0) {
        console.log(`[ALOHA] 💰 TİCARET: ${tradeResult.opportunitiesFound} fırsat, ${tradeResult.landingPagesGenerated} sayfa`);
        result.actionsPerformed.push(`trade_pipeline:${tradeResult.opportunitiesFound}opp/${tradeResult.landingPagesGenerated}pages`);
      }
    } catch (tradeErr: any) {
      console.warn(`[ALOHA] ⚠️ Trade Pipeline hatası:`, tradeErr.message);
    }

    // ═══════════════════════════════════════
    // ADIM 0: HAFIZA YÜKLE (Memory-Aware Decision)
    // ═══════════════════════════════════════
    const lessons = await alohaMemory.getLessonsForProject(projectName, 10);
    const recentMemory = await alohaMemory.getRecentMemory(5);
    if (lessons.length > 0) {
      console.log(`[ALOHA] 🧠 ${lessons.length} ders yüklendi (${projectName})`);
    }

    // ═══════════════════════════════════════
    // ADIM 0.5: OTONOM İSTİHBARAT DÖNGÜSÜ (Intelligence Cycle)
    // ═══════════════════════════════════════
    if (projectName === 'trtex') {
      try {
        // 🏗️ CONTROL TOWER — döngü başlat + limitler aktif
        const { startCycle, gateCheck, mergeRelatedActions, getCycleState } = await import('./controlTower');
        startCycle();

        // 1. Ticker verilerini güncelle (döviz — ücretsiz API)
        const tickerGate = gateCheck('ticker_update', 0, 0.9, 'system');
        if (tickerGate.allowed) {
          const { refreshTickerData } = await import('./tickerDataFetcher');
          const tickerResult = await refreshTickerData();
          console.log(`[ALOHA] 📊 Ticker güncellendi: ${tickerResult}`);
          result.actionsPerformed.push('ticker_refresh');
        }

        // 2. Piyasa kurallarını çalıştır → aksiyon kartı üret
        const { evaluateMarketRules } = await import('./marketRuleEngine');
        const { getTickerSnapshot } = await import('./tickerDataFetcher');
        const tickerSnapshot = await getTickerSnapshot();
        let ruleCardCount = 0;
        if (tickerSnapshot) {
          const ruleCards = await evaluateMarketRules(tickerSnapshot as any);
          ruleCardCount = ruleCards.length;
          if (ruleCardCount > 0) {
            console.log(`[ALOHA] 🧠 ${ruleCardCount} aksiyon kartı üretildi`);
            result.actionsPerformed.push(`action_cards:${ruleCardCount}`);
          }
        }

        // 3. Conflict Resolution — net etki skoru hesapla
        const { resolveConflicts, predictMarketOutlook } = await import('./decisionEngine');
        if (tickerSnapshot) {
          const signals: any[] = [];
          if (tickerSnapshot.forex?.usd_try) {
            signals.push({
              metric: 'usd_try', change: tickerSnapshot.forex.usd_try.change_24h || 0,
              direction: tickerSnapshot.forex.usd_try.direction || 'stable',
              impact_category: 'fx', business_impact: 0.95,
            });
          }
          if (tickerSnapshot.commodities) {
            for (const [key, val] of Object.entries(tickerSnapshot.commodities) as [string, any][]) {
              if (val?.value) {
                signals.push({
                  metric: key, change: val.change_30d || 0,
                  direction: val.direction || 'stable',
                  impact_category: 'commodity', business_impact: 0.8,
                });
              }
            }
          }
          if (tickerSnapshot.logistics) {
            for (const [key, val] of Object.entries(tickerSnapshot.logistics) as [string, any][]) {
              if (val?.value) {
                signals.push({
                  metric: key, change: val.change_30d || 0,
                  direction: val.direction || 'stable',
                  impact_category: 'logistics', business_impact: 0.85,
                });
              }
            }
          }

          if (signals.length >= 2) {
            const impact = resolveConflicts(signals);
            console.log(`[ALOHA] 🎯 Net etki: ${impact.score} (${impact.verdict})`);
            result.actionsPerformed.push(`net_impact:${impact.verdict}`);

            // Firestore'a yaz — dashboard için
            if (adminDb) {
              await adminDb.collection('trtex_intelligence').doc('ticker_live').set({
                net_impact: impact,
                last_intelligence_cycle: new Date().toISOString(),
              }, { merge: true });
            }

            // 4. EXECUTIVE LAYER — CEO beyni (CONTROL TOWER ile korumalı)
            const {
              evaluateAutoActions, makeExecutiveDecision,
              getRelevantLearnings, recordTaskOutcome,
            } = await import('./executiveLayer');

            // Geçmiş öğrenmeleri yükle
            const learnings = await getRelevantLearnings('intelligence_cycle', 10);

            // Self-Triggered Actions — Control Tower filtreli
            let autoActions = await evaluateAutoActions(tickerSnapshot as any, learnings);
            // Dedup: aynı trigger'dan birden fazla aksiyon → birleştir
            autoActions = mergeRelatedActions(autoActions);
            // Gate: her aksiyon Control Tower'dan geçmeli
            autoActions = autoActions.filter(a => {
              const gate = gateCheck('auto_action', a.confidence, a.confidence, a.trigger);
              if (!gate.allowed && gate.requiresApproval) {
                // İnsan onayı gereken kararları kaydet
                import('./controlTower').then(ct =>
                  ct.requestApproval?.({ action: a.action, reason: gate.reason, impact_score: a.confidence, confidence: a.confidence, details: a.params })
                ).catch(() => {});
              }
              return gate.allowed;
            });
            if (autoActions.length > 0) {
              result.actionsPerformed.push(`auto_actions:${autoActions.length}`);
            }

            // CEO Brief üret
            const brief = await makeExecutiveDecision(
              impact,
              ruleCardCount,
              autoActions,
              learnings
            );
            result.actionsPerformed.push(`ceo_brief:${brief.market_state}`);

            // Bu döngüyü öğrenme olarak kaydet
            await recordTaskOutcome({
              task: 'intelligence_cycle',
              timestamp: new Date().toISOString(),
              input_context: `signals:${signals.length} impact:${impact.score}`,
              result: `rules:${ruleCardCount} actions:${autoActions.length}`,
              outcome: brief.daily_brief.headline,
              learning: `Net etki ${impact.score} → ${impact.verdict}. ${autoActions.length} otomatik aksiyon.`,
              confidence: brief.confidence_avg,
              should_repeat: brief.confidence_avg > 0.6,
            });
          }
        }

        // ═══════════════════════════════════════
        // ADIM 0.55: OTONOM ARAŞTIRMA + SITE AUDIT (Yeni Güçler)
        // Textile Researcher → haftada 1 (sektörel bilgi toplama)
        // Site Auditor → günde 1 (sadece raporlar, düzeltme YAPMAZ)
        // ═══════════════════════════════════════
        try {
          // Textile Researcher — Aloha'nın sektörel bilgi bankası (haftalık)
          const { runDeepResearch } = await import('./textileResearcher');
          const researchResult = await runDeepResearch();
          if (!researchResult.includes('Haftada 1 kez')) {
            console.log(`[ALOHA] 🔬 ${researchResult.substring(0, 200)}`);
            result.actionsPerformed.push('textile_researcher:completed');
          }
        } catch (researchErr: any) {
          console.warn(`[ALOHA] ⚠️ Textile Researcher hatası:`, researchErr.message);
        }

        try {
          // Site Auditor — TRTEX canlı site sağlık taraması (günlük)
          const { fullAudit } = await import('./siteAuditor');
          const auditResult = await fullAudit();
          if (!auditResult.includes('Günde 1 kez')) {
            console.log(`[ALOHA] 🔍 ${auditResult.substring(0, 300)}`);
            result.actionsPerformed.push('site_audit:completed');
          }
        } catch (auditErr: any) {
          console.warn(`[ALOHA] ⚠️ Site Auditor hatası:`, auditErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.6: OTONOM EKOSİSTEM DENETİMİ (Tüm Projeler)
        // Brand Wall + Linen-Look + Content Guard — proje bağımsız
        // ═══════════════════════════════════════
        try {
          const { brandWallScan, linenCostAudit, validateContent } = await import('./contentGuard');
          const auditResults: string[] = [];

          // Tüm ekosistem koleksiyonları — Aloha hepsini denetler
          const ECOSYSTEM_COLLECTIONS = [
            { collection: 'trtex_news', project: 'TRTEX', titleField: 'title_tr', contentField: 'content_tr', summaryField: 'summary_tr' },
            { collection: 'hometex_news', project: 'HOMETEX', titleField: 'title_tr', contentField: 'content_tr', summaryField: 'summary_tr' },
            { collection: 'perde_news', project: 'PERDE', titleField: 'title_tr', contentField: 'content_tr', summaryField: 'summary_tr' },
            { collection: 'didimemlak_listings', project: 'DIDIMEMLAK', titleField: 'title', contentField: 'description', summaryField: 'summary' },
            { collection: 'fethiye_listings', project: 'FETHIYE', titleField: 'title', contentField: 'description', summaryField: 'summary' },
            { collection: 'aipyram_blog', project: 'aipyram', titleField: 'title', contentField: 'content', summaryField: 'summary' },
          ];

          if (adminDb) {
            let totalBreaches = 0;
            let totalLinenWarnings = 0;
            let totalContentViolations = 0;
            const projectResults: string[] = [];

            for (const eco of ECOSYSTEM_COLLECTIONS) {
              try {
                const snap = await adminDb.collection(eco.collection)
                  .orderBy('createdAt', 'desc').limit(10).get();

                if (snap.empty) continue;

                let projBreaches = 0;
                let projLinenWarn = 0;
                let projContentViol = 0;

                for (const doc of snap.docs) {
                  const data = doc.data();
                  const text = `${data[eco.titleField] || ''} ${data[eco.contentField] || ''} ${data[eco.summaryField] || ''}`;

                  // Brand Wall scan — tüm projeler için geçerli
                  const bw = brandWallScan(text);
                  if (!bw.clean) {
                    projBreaches += bw.breaches.length;
                    const { recordTaskOutcome } = await import('./executiveLayer');
                    await recordTaskOutcome({
                      task: 'brand_wall_audit',
                      timestamp: new Date().toISOString(),
                      input_context: `${eco.project}:${doc.id}`,
                      result: `${bw.breaches.length} sızıntı: ${bw.breaches.map(b => b.term).join(', ')}`,
                      outcome: 'brand_wall_breach',
                      learning: `${eco.project} içerik üretiminde dış platform isimleri filtrelenmeli.`,
                      confidence: 0,
                      should_repeat: false,
                    });
                  }

                  // Linen-Look — tekstil projeleri için anlamlı
                  if (['TRTEX', 'HOMETEX', 'PERDE'].includes(eco.project)) {
                    const la = linenCostAudit(text);
                    if (!la.valid) projLinenWarn += la.warnings.length;
                  }

                  // Content Guard — tüm projeler
                  const cv = validateContent(text, 'article');
                  if (!cv.valid) projContentViol += cv.violations.length;
                }

                totalBreaches += projBreaches;
                totalLinenWarnings += projLinenWarn;
                totalContentViolations += projContentViol;

                if (projBreaches + projLinenWarn + projContentViol > 0) {
                  projectResults.push(`${eco.project}:BW${projBreaches}/LN${projLinenWarn}/CG${projContentViol}`);
                }
              } catch { /* koleksiyon yoksa → sessiz geç */ }
            }

            if (totalBreaches > 0) auditResults.push(`brand_wall:${totalBreaches}_breach`);
            if (totalLinenWarnings > 0) auditResults.push(`linen_cost:${totalLinenWarnings}_warning`);
            if (totalContentViolations > 0) auditResults.push(`content:${totalContentViolations}_violation`);

            if (auditResults.length === 0) {
              auditResults.push('ecosystem_audit_clean');
            }

            const summary = projectResults.length > 0 ? ` [${projectResults.join(' | ')}]` : '';
            console.log(`[ALOHA] 🛡️ Ecosystem Audit: ${auditResults.join(', ')}${summary}`);
            result.actionsPerformed.push(`ecosystem_audit:${auditResults.join(',')}${summary}`);
          }
        } catch (auditErr: any) {
          console.warn(`[ALOHA] ⚠️ Ecosystem audit hatası (devam ediliyor):`, auditErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.65: OTONOM ONARIM (Deep Audit Auto-Repair)
        // Kritik hatalar varsa ZORLA onar (max 5/cycle)
        // ═══════════════════════════════════════
        try {
          if (adminDb) {
            const recentAudits = await adminDb.collection('aloha_site_audits')
              .orderBy('timestamp', 'desc')
              .limit(1)
              .get();
              
            if (!recentAudits.empty) {
              const audit = recentAudits.docs[0].data();
              const auditAge = (Date.now() - new Date(audit.timestamp).getTime()) / (1000 * 60 * 60);
              
              if (auditAge < 24 && audit.critical > 0) {
                console.log(`[ALOHA] 🔧 DEEP AUDIT REPAIR: ${audit.critical} kritik hata bulundu, onarım zinciri başlatılıyor...`);
                
                const repairResult = await executeToolCall({
                  name: 'run_full_repair',
                  args: { project: projectName }
                });
                
                result.actionsPerformed.push(`deep_audit_repair_triggered`);
                console.log(`[ALOHA] 🔧 Onarım sonucu: ${repairResult.substring(0, 100)}`);
              }
            }
          }
        } catch (repairErr: any) {
          console.warn(`[ALOHA] ⚠️ Otonom Onarım hatası:`, repairErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.66: IQ ALARM KONTROLÜ
        // Son 3 cycle IQ < 60 ise alarm ver
        // ═══════════════════════════════════════
        try {
          if (adminDb) {
            const iqSnap = await adminDb.collection('trtex_iq_history')
              .orderBy('date', 'desc')
              .limit(3)
              .get();
              
            if (iqSnap.size === 3) {
              const iqs = iqSnap.docs.map(d => d.data().iq);
              if (iqs.every(iq => iq < 60)) {
                console.warn(`[ALOHA] 🚨 IQ ALARM: Son 3 cycle zeka seviyesi 60'ın altında! (${iqs.join(', ')})`);
                result.actionsPerformed.push('iq_alarm_triggered');
                
                // Alarmı executive history'e kaydet
                const { recordTaskOutcome } = await import('./executiveLayer');
                await recordTaskOutcome({
                  task: 'iq_tracking_alarm',
                  timestamp: new Date().toISOString(),
                  input_context: `iq_history`,
                  result: `Son 3 döngü IQ: ${iqs.join(', ')}`,
                  outcome: 'critical_iq_drop',
                  learning: 'Sistemin içerik ve sinyal kalitesi sürekli düşük kalıyor, acil müdahale gereklidir.',
                  confidence: 1,
                  should_repeat: false,
                });
              } else {
                result.actionsPerformed.push('iq_tracking:stable');
              }
            }
          }
        } catch (iqErr: any) {
          console.warn(`[ALOHA] ⚠️ IQ Alarm kontrolü hatası:`, iqErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.7: PROAKTİF REGRESSION GUARD
        // "Önce geçmiş hataları kontrol et, sonra yeni iş yap"
        // ═══════════════════════════════════════
        try {
          if (adminDb) {
            const prevErrors = await adminDb.collection('trtex_task_memory')
              .where('outcome', 'in', ['brand_wall_breach', 'linen_violation', 'content_violation', 'ui_integrity_fail'])
              .orderBy('timestamp', 'desc')
              .limit(20)
              .get();

            if (!prevErrors.empty) {
              let regressionCount = 0;
              const checkedContexts: string[] = [];

              for (const errDoc of prevErrors.docs) {
                const err = errDoc.data();
                const ctx = err.input_context || '';
                // Aynı kaynağı tekrar kontrol et
                const [project, docId] = ctx.split(':');
                if (!project || !docId || checkedContexts.includes(ctx)) continue;
                checkedContexts.push(ctx);

                // Koleksiyon mapping
                const collMap: Record<string, string> = {
                  'TRTEX': 'trtex_news', 'HOMETEX': 'hometex_news',
                  'PERDE': 'perde_news', 'DIDIMEMLAK': 'didimemlak_listings',
                  'FETHIYE': 'fethiye_listings', 'aipyram': 'aipyram_blog',
                  'news': 'trtex_news', // eski format uyumluluğu
                };
                const coll = collMap[project];
                if (!coll) continue;

                try {
                  const recheck = await adminDb.collection(coll).doc(docId).get();
                  if (recheck.exists) {
                    const data = recheck.data()!;
                    const text = `${data.title_tr || data.title || ''} ${data.content_tr || data.content || ''}`;
                    const { brandWallScan } = await import('./contentGuard');
                    const bw = brandWallScan(text);
                    if (!bw.clean) {
                      regressionCount++;
                      console.warn(`[ALOHA] 🔁 REGRESSION: ${ctx} hâlâ Brand Wall ihlali!`);
                    }
                  }
                } catch { /* doc silinmiş olabilir */ }
              }

              if (regressionCount > 0) {
                result.actionsPerformed.push(`regression_guard:${regressionCount}_recurring`);
                console.warn(`[ALOHA] ⚠️ ${regressionCount} tekrarlayan hata tespit edildi!`);
              } else {
                result.actionsPerformed.push('regression_guard:clean');
                console.log(`[ALOHA] ✅ Regression Guard: Önceki hatalar tekrar etmiyor.`);
              }
            }
          }
        } catch (rgErr: any) {
          console.warn(`[ALOHA] ⚠️ Regression Guard hatası:`, rgErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.8: REVENUE FLOW CHECK
        // Veri → Sinyal → Action Card zincir bütünlüğü
        // ═══════════════════════════════════════
        try {
          if (adminDb) {
            // Son 24 saatte üretilen action card sayısı
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const actionCards = await adminDb.collection('trtex_action_cards')
              .where('createdAt', '>=', oneDayAgo)
              .get();

            // Son 24 saatte üretilen sinyal/haber sayısı
            const recentNews = await adminDb.collection('trtex_news')
              .where('createdAt', '>=', oneDayAgo)
              .get();

            const newsCount = recentNews.size;
            const cardCount = actionCards.size;

            // Zincir kırıklığı: Haber var ama action card yok → veri akışı kopuk
            if (newsCount > 0 && cardCount === 0) {
              console.warn(`[ALOHA] ⚠️ Revenue Flow KOPUK: ${newsCount} haber var ama 0 action card!`);
              result.actionsPerformed.push(`revenue_flow:BROKEN(${newsCount}news→0cards)`);

              // taskMemory'ye kaydet
              const { recordTaskOutcome } = await import('./executiveLayer');
              await recordTaskOutcome({
                task: 'revenue_flow_check',
                timestamp: new Date().toISOString(),
                input_context: `last_24h`,
                result: `${newsCount} haber üretildi ama 0 action card çıktı`,
                outcome: 'revenue_chain_broken',
                learning: 'Haber→Sinyal→ActionCard zinciri kopuk. Sinyal üretim motoru kontrol edilmeli.',
                confidence: 0,
                should_repeat: false,
              });
            } else {
              const ratio = newsCount > 0 ? (cardCount / newsCount).toFixed(1) : 'N/A';
              console.log(`[ALOHA] 💰 Revenue Flow: ${newsCount} haber → ${cardCount} action card (oran: ${ratio})`);
              result.actionsPerformed.push(`revenue_flow:OK(${newsCount}→${cardCount})`);
            }
          }
        } catch (rfErr: any) {
          console.warn(`[ALOHA] ⚠️ Revenue Flow Check hatası:`, rfErr.message);
        }
        // ═══════════════════════════════════════
        // ADIM 0.85: SİNYAL TARAMA (Signal Engine)
        // Pazar sinyalleri topla: ülke büyüme, fiyat, rakip, trend
        // ═══════════════════════════════════════
        try {
          const { runSignalScan, formatSignalReport } = await import('./signalEngine');
          const scanResult = await runSignalScan(projectName);
          if (scanResult.signals.length > 0) {
            console.log(`[ALOHA] 📡 Signal Scan: ${scanResult.signals.length} sinyal, ${scanResult.actionable} actionable`);
            result.actionsPerformed.push(`signal_scan:${scanResult.signals.length}(${scanResult.actionable}_actionable)`);
          } else {
            result.actionsPerformed.push('signal_scan:0');
          }
        } catch (sigErr: any) {
          console.warn(`[ALOHA] ⚠️ Signal Scan hatası:`, sigErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.86: FIRSAT TESPİT (Opportunity Engine)
        // Sinyalleri → somut iş fırsatlarına çevir
        // ═══════════════════════════════════════
        try {
          const { detectOpportunities, formatOpportunityReport } = await import('./opportunityEngine');
          const oppResult = await detectOpportunities(projectName);
          if (oppResult.opportunities.length > 0) {
            console.log(`[ALOHA] 💎 Opportunity Detect: ${oppResult.opportunities.length} fırsat, ${oppResult.processedSignals} sinyal işlendi`);
            result.actionsPerformed.push(`opportunity_detect:${oppResult.opportunities.length}`);
          } else {
            result.actionsPerformed.push('opportunity_detect:0');
          }
        } catch (oppErr: any) {
          console.warn(`[ALOHA] ⚠️ Opportunity Engine hatası:`, oppErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.87: STRATEJİK KARAR (Decision Engine)
        // Fırsatları değerle → risk analizi → uygula veya onay iste
        // ═══════════════════════════════════════
        try {
          const { checkSafeMode, makeStrategicDecision, executeApprovedDecisions, reportSuccess, reportError } = await import('./strategicDecisionEngine');
          
          // Safe mode kontrolü
          const safeCheck = checkSafeMode();
          if (safeCheck.allowed) {
            const decisions = await makeStrategicDecision(
              { context: `autoRunner döngüsü — ${projectName}` },
              projectName,
            );
            
            if (decisions.length > 0) {
              const approved = decisions.filter(d => d.status === 'approved');
              const proposed = decisions.filter(d => d.status === 'proposed');
              
              if (approved.length > 0) {
                const execResults = await executeApprovedDecisions(approved, executeToolCall);
                const success = execResults.filter(r => r.success).length;
                console.log(`[ALOHA] 🧠 Decision: ${approved.length} approved → ${success} başarılı`);
                result.actionsPerformed.push(`decisions:${approved.length}approved_${success}executed`);
              }
              if (proposed.length > 0) {
                console.log(`[ALOHA] ⚠️ ${proposed.length} HIGH RISK karar Hakan onayı bekliyor`);
                result.actionsPerformed.push(`decisions:${proposed.length}pending_approval`);
              }
            }
          } else {
            console.warn(`[ALOHA] 🛑 SAFE MODE: Karar motoru devre dışı`);
            result.actionsPerformed.push('decision_engine:SAFE_MODE');
          }
        } catch (decErr: any) {
          console.warn(`[ALOHA] ⚠️ Decision Engine hatası:`, decErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 0.88: ZAMANLI GÖREV KONTROLÜ (Scheduler)
        // Planlanmış görevleri kontrol et ve çalıştır
        // ═══════════════════════════════════════
        try {
          const { checkScheduledTasks } = await import('./scheduler');
          const schedResult = await checkScheduledTasks(executeToolCall);
          if (schedResult.executed > 0) {
            console.log(`[ALOHA] 📅 Scheduler: ${schedResult.executed} görev çalıştırıldı`);
            result.actionsPerformed.push(`scheduled_tasks:${schedResult.executed}_executed`);
          }
        } catch (schedErr: any) {
          console.warn(`[ALOHA] ⚠️ Scheduler hatası:`, schedErr.message);
        }

        // "Hakan, bugün sistemi denetledim..."
        // ═══════════════════════════════════════
        try {
          if (adminDb) {
            const briefData = {
              date: new Date().toISOString(),
              cycle_id: `cycle_${Date.now()}`,
              actions_performed: result.actionsPerformed,
              ecosystem_health: {
                brand_wall: result.actionsPerformed.find(a => a.includes('brand_wall')) ? 'İHLAL' : 'TEMİZ',
                linen_look: result.actionsPerformed.find(a => a.includes('linen_cost')) ? 'UYARI' : 'TEMİZ',
                content_guard: result.actionsPerformed.find(a => a.includes('content:')) ? 'İHLAL' : 'TEMİZ',
                regression: result.actionsPerformed.find(a => a.includes('recurring')) ? 'TEKRAR' : 'TEMİZ',
                revenue_flow: result.actionsPerformed.find(a => a.includes('BROKEN')) ? 'KOPUK' : 'AKTIF',
              },
              summary: `Aloha otonom denetim: ${result.actionsPerformed.length} aksiyon gerçekleştirildi.`,
              generated_by: 'aloha_autoRunner',
            };

            // CEO Brief'i Firestore'a kaydet
            await adminDb.collection('trtex_executive_history').add(briefData);
            console.log(`[ALOHA] 📋 CEO Executive Brief kaydedildi.`);
            result.actionsPerformed.push('ceo_executive_brief:generated');
          }
        } catch (ceoErr: any) {
          console.warn(`[ALOHA] ⚠️ CEO Brief hatası:`, ceoErr.message);
        }

      } catch (intErr: any) {
        console.warn(`[ALOHA] ⚠️ İstihbarat döngüsü hatası (devam ediliyor):`, intErr.message);
      }
    }


    // ═══════════════════════════════════════
    // ADIM 1: ANALİZ ET
    // ═══════════════════════════════════════
    console.log(`[ALOHA] 📊 Adım 1: ${projectName} analiz ediliyor...`);
    const analysis = await executeToolCall({
      name: 'analyze_project',
      args: { projectName },
    });
    result.actionsPerformed.push('analyze_project');

    // ═══════════════════════════════════════
    // ADIM 2: YAPILANDIRILMIŞ KARAR VER (HEALTH_JSON parse)
    // ═══════════════════════════════════════
    console.log(`[ALOHA] 🧠 Adım 2: Yapılandırılmış analiz yapılıyor...`);
    const actions: Array<{ tool: string; args: any; confidence: number; reason: string }> = [];

    // HEALTH_JSON bloğunu parse et (verifyProjectHealth çıktısından)
    type HealthStatus = 'healthy' | 'stale' | 'empty' | 'error';
    interface HealthJSON {
      ok: boolean; status: HealthStatus; docCount: number;
      staleHours: number; imagelessCount: number; newestTitle: string;
      errors: string[]; warnings: string[];
    }

    let health: HealthJSON = {
      ok: true, status: 'healthy', docCount: 0, staleHours: 0,
      imagelessCount: 0, newestTitle: '', errors: [], warnings: [],
    };

    // HEALTH_JSON bloğunu çıktıdan çek
    const jsonMatch = analysis.match(/\[HEALTH_JSON\]([\s\S]*?)\[\/HEALTH_JSON\]/);
    if (jsonMatch) {
      try {
        health = JSON.parse(jsonMatch[1]);
        console.log(`[ALOHA] 📊 Health JSON parsed:`, JSON.stringify(health));
      } catch (e) {
        console.warn(`[ALOHA] ⚠️ HEALTH_JSON parse hatası, fallback kullanılıyor`);
        // Fallback: eski string matching (geçiş dönemi güvenliği)
        if (analysis.includes('BOŞ') || analysis.includes('0 doküman')) health.status = 'empty';
        else if (analysis.includes('BAYAT')) health.status = 'stale';
        const staleMatch = analysis.match(/(\d+)\s*saat\s*önce/i);
        if (staleMatch) health.staleHours = parseInt(staleMatch[1]);
        const countMatch = analysis.match(/(\d+)\s*(?:doküman|haber)/i);
        if (countMatch) health.docCount = parseInt(countMatch[1]);
      }
    } else {
      // HEALTH_JSON yoksa eski format — fallback parse
      console.warn(`[ALOHA] ⚠️ HEALTH_JSON bloğu bulunamadı, fallback parse`);
      if (analysis.includes('BOŞ') || analysis.includes('0 doküman') || analysis.includes('0 haber')) health.status = 'empty';
      else if (analysis.includes('BAYAT')) health.status = 'stale';
      const staleMatch = analysis.match(/(\d+)\s*saat\s*önce/i);
      if (staleMatch) { health.staleHours = parseInt(staleMatch[1]); if (health.staleHours > 24) health.status = 'stale'; }
      const countMatch = analysis.match(/(\d+)\s*(?:doküman|haber)/i);
      if (countMatch) health.docCount = parseInt(countMatch[1]);
      const imgMatch = analysis.match(/(\d+)\/\d+\s*haber\s*görselsiz/i);
      if (imgMatch) health.imagelessCount = parseInt(imgMatch[1]);
    }

    // KARAR MOTORU — yapılandırılmış veriye dayalı
    if (health.status === 'empty' || health.docCount === 0) {
      actions.push({
        tool: projectName === 'trtex' ? 'trigger_trtex_master_feed' : 'trigger_project_content',
        args: projectName === 'trtex' ? {} : { projectName, contentType: 'initial_content' },
        confidence: 0.95,
        reason: `${projectName} veritabanı BOŞ — acil içerik gerekiyor`,
      });
    } else if (health.status === 'stale') {
      if (projectName === 'trtex') {
        actions.push({
          tool: 'trigger_trtex_master_feed',
          args: {},
          confidence: Math.min(0.95, 0.7 + health.staleHours * 0.005),
          reason: `TRTEX içeriği ${health.staleHours}h bayat — yeni haber üretilecek`,
        });
      } else {
        actions.push({
          tool: 'trigger_project_content',
          args: { projectName, contentType: 'news' },
          confidence: 0.88,
          reason: `${projectName} içeriği ${health.staleHours}h bayat — yeni içerik üretilecek`,
        });
      }
    }

    // Görselsiz haberler varsa ek aksiyon
    if (health.imagelessCount > 0) {
      actions.push({
        tool: 'scan_missing_images',
        args: { collection: `${projectName === 'trtex' ? 'trtex' : projectName}_news`, limit: Math.min(health.imagelessCount, 10), dryRun: false },
        confidence: 0.90,
        reason: `${health.imagelessCount} haber görselsiz — AI görsel üretilecek`,
      });
    }

    // ═══════════════════════════════════════
    // 🔥 FORCED PRODUCTION GUARANTEE
    // knowledge.md'deki "günde 5 haber" kuralının KOD karşılığı
    // Beyin (knowledge) tek başına yetmez → kas (TypeScript) zorunlu
    // ═══════════════════════════════════════
    if (projectName === 'trtex' && adminDb) {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        // DUAL-QUERY: Hem snake_case hem camelCase dene (publisher uyumsuzluğu koruma)
        let todayPublished = 0;
        try {
          const snap1 = await adminDb.collection('trtex_news')
            .where('created_at', '>=', todayISO)
            .get();
          todayPublished = snap1.size;
        } catch {
          // created_at index yoksa createdAt dene
          try {
            const snap2 = await adminDb.collection('trtex_news')
              .where('createdAt', '>=', todayISO)
              .get();
            todayPublished = snap2.size;
          } catch { /* her ikisi de yoksa 0 kalır */ }
        }
        const currentHour = new Date().getHours();
        const MIN_DAILY_ARTICLES = 5;

        // 🔴 EMERGENCY MODE: Öğlen oldu, hâlâ 0 haber
        const isEmergency = todayPublished === 0 && currentHour >= 12;

        // 🟡 PRODUCTION GAP: 5'ten az haber var
        const hasProductionGap = todayPublished < MIN_DAILY_ARTICLES;

        if (isEmergency) {
          console.log(`[ALOHA] 🚨 EMERGENCY MODE: Saat ${currentHour}:00 ve bugün 0 haber! ZORLA ÜRETİM!`);
          // Emergency'de 3 haber birden üret — confidence override
          const emergencyCount = Math.min(3, MIN_DAILY_ARTICLES);
          for (let i = 0; i < emergencyCount; i++) {
            const alreadyQueued = actions.some(a => a.tool === 'trigger_trtex_master_feed');
            if (!alreadyQueued || i > 0) {
              actions.push({
                tool: 'trigger_trtex_master_feed',
                args: { forced: true, emergency: true, batch_index: i },
                confidence: 0.95,
                reason: `[EMERGENCY] Bugün 0 haber — zorla üretim (${i + 1}/${emergencyCount})`,
              });
            }
          }
          result.actionsPerformed.push(`forced_production:EMERGENCY(0→${emergencyCount})`);
        } else if (hasProductionGap) {
          const needed = MIN_DAILY_ARTICLES - todayPublished;
          // Confidence check: akıllı zorla, kör basma değil
          const baseConfidence = 0.6 + (currentHour / 24) * 0.3; // Akşama doğru confidence artar
          if (baseConfidence > 0.6) {
            console.log(`[ALOHA] 📈 Production Gap: Bugün ${todayPublished}/${MIN_DAILY_ARTICLES} haber. ${needed} daha gerekiyor.`);
            // Gap'i kapatmak için 1 haber üret (her cron'da 1 tane, spam değil)
            const alreadyQueued = actions.some(a => a.tool === 'trigger_trtex_master_feed');
            if (!alreadyQueued) {
              actions.push({
                tool: 'trigger_trtex_master_feed',
                args: { forced: true, gap_fill: true, today_count: todayPublished },
                confidence: baseConfidence,
                reason: `[FORCED] Günlük hedef ${todayPublished}/${MIN_DAILY_ARTICLES} — ${needed} haber daha gerekiyor`,
              });
            }
            result.actionsPerformed.push(`forced_production:GAP(${todayPublished}→${MIN_DAILY_ARTICLES})`);
          }
        } else {
          console.log(`[ALOHA] ✅ Günlük üretim hedefi tutturuldu: ${todayPublished}/${MIN_DAILY_ARTICLES}`);
          result.actionsPerformed.push(`daily_target:MET(${todayPublished})`);
        }
      } catch (fpErr: any) {
        console.warn(`[ALOHA] ⚠️ Forced Production kontrol hatası:`, fpErr.message);
      }
    }

    // ═══════════════════════════════════════
    // ADIM 2.3: HAFTALIK DERGİ UPGRADE (Visual Commerce Intelligence)
    // Her 7 günde 1 → upgrade_all_articles → eski haberler lüks kaliteye yükseltilir
    // ═══════════════════════════════════════
    if (projectName === 'trtex' && adminDb) {
      try {
        const upgradeStateRef = adminDb.collection('system_state').doc('last_article_upgrade');
        const upgradeStateSnap = await upgradeStateRef.get();
        const lastUpgrade = upgradeStateSnap.exists ? upgradeStateSnap.data()?.timestamp : null;
        const daysSinceUpgrade = lastUpgrade
          ? (Date.now() - new Date(lastUpgrade).getTime()) / (1000 * 60 * 60 * 24)
          : 999; // İlk kez — hemen çalıştır

        if (daysSinceUpgrade >= 7) {
          console.log(`[ALOHA] 🎨 DERGİ UPGRADE: Son upgrade ${Math.round(daysSinceUpgrade)} gün önce — yeniden çalıştırılıyor`);
          actions.push({
            tool: 'upgrade_all_articles',
            args: { project: 'trtex', batchSize: 10 },
            confidence: 0.92,
            reason: `[WEEKLY] ${Math.round(daysSinceUpgrade)} gün oldu — VisualDNA + MasterPhotographer ile toplu yükseltme`,
          });
          // Timestamp güncelle
          await upgradeStateRef.set({
            timestamp: new Date().toISOString(),
            triggered_by: 'autoRunner_weekly',
          });
          result.actionsPerformed.push(`weekly_upgrade:TRIGGERED(${Math.round(daysSinceUpgrade)}d)`);
        } else {
          result.actionsPerformed.push(`weekly_upgrade:SKIP(${Math.round(daysSinceUpgrade)}d<7d)`);
        }
      } catch (upgradeErr: any) {
        console.warn(`[ALOHA] ⚠️ Weekly upgrade kontrol hatası:`, upgradeErr.message);
      }
    }

    // ═══════════════════════════════════════
    // ADIM 2.5: INITIATIVE ENGINE — Proaktif Karar
    // ═══════════════════════════════════════
    const initiative = await evaluateInitiative(projectName, health);
    const healthScore = calculateHealthScore(health);
    console.log(`[ALOHA] 🧠 Sağlık Skoru: ${healthScore.total}/100 (içerik:${healthScore.content} taze:${healthScore.freshness} görsel:${healthScore.images} hata:${healthScore.errors})`);
    
    // ═══════════════════════════════════════
    // GÖREV 6 (Parça B): SELF-IMPROVEMENT LOOP (IQ DÜŞÜŞ ALARMI)
    // ═══════════════════════════════════════
    if (adminDb && projectName === 'trtex') {
      try {
        const iqHistory = await adminDb.collection('trtex_iq_history').orderBy('date', 'desc').limit(3).get();
        if (iqHistory.size === 3) {
          const avgIQ = iqHistory.docs.reduce((sum: number, d: any) => sum + (d.data().iq || 0), 0) / 3;
          if (avgIQ < 60) {
            console.warn(`[ALOHA] 🚨 IQ DÜŞÜŞ ALARMI: Son 3 periyot ortalaması ${Math.round(avgIQ)}/100! Acil kurtarma eylemi tetikleniyor...`);
            // Eğer zeka/kalite puanı 60 altına inmişse, zorunlu olarak çok yüksek kaliteli bir makale üret
            actions.push({
              tool: 'compose_article',
              args: { 
                topic: 'Yeni Dönem B2B Ticaret Verileri ve Küresel Hazır Giyim Rekabeti', 
                target_audience: 'Büyük Üreticiler ve İhracatçılar' 
              },
              confidence: 0.99,
              reason: `[IQ ALARM] Zeka kalitesi (${Math.round(avgIQ)}) eşik değerin altında. Sistemi dengelemek için kritik üretim.`,
            });
          }
        }
      } catch (iqErr: any) {
        console.warn(`[ALOHA] ⚠️ IQ hafızası okuma hatası:`, iqErr.message);
      }
    }

    if (initiative.shouldAct) {
      console.log(`[ALOHA] 💡 INITIATIVE: ${initiative.reasoning}`);
      for (const initAction of initiative.actions) {
        // Mevcut aksiyonlarda yoksa ekle (duplicate engelle)
        const alreadyQueued = actions.some(a => a.tool === initAction.tool);
        if (!alreadyQueued) {
          actions.push({
            tool: initAction.tool,
            args: initAction.args,
            confidence: initAction.priority === 'critical' ? 0.95 : 0.85,
            reason: `[INITIATIVE] ${initAction.reason}`,
          });
        }
      }
    }

    // ═══════════════════════════════════════
    // ADIM 2.6: OTONOM BAKIM DÖNGÜSÜ — "Balık Tutmayı Bilme"
    // ═══════════════════════════════════════
    // Her cron döngüsünde skor < 90 ise TÜM projeler için:
    //   1. İçerik onarımı (fix_formatting, add_ai_commentary)
    //   2. Görsel onarımı (eksik görsellere AI image)
    //   3. Content Guard (yasaklı terim temizliği)
    // Döngü başına max 10 aksiyon — sistemi yormaz, sürekli iyileştirir

    if (healthScore.total < 90) {
      console.log(`[ALOHA] 🔧 ${projectName} sağlık skoru ${healthScore.total}/100 (hedef: 90+) — otonom bakım başlatılıyor...`);

      // ── A. İÇERİK ONARIMI ──
      try {
        const { deepSiteAudit } = require('@/core/aloha/deepAudit');

        // audit koleksiyon adını projeden çıkar
        const collectionMap: Record<string, string> = {
          trtex: 'trtex_news',
          hometex: 'hometex_news',
          perde: 'perde_news',
        };
        const collection = collectionMap[projectName] || `${projectName}_news`;

        const auditResult = await deepSiteAudit(projectName);
        if (auditResult?.repairPlan?.length > 0) {
          // 1. Kritik onarımları filtrele (priority 1-2)
          const criticalRepairs = auditResult.repairPlan.filter((r: any) => r.priority <= 2);
          
          for (const repair of criticalRepairs.slice(0, 5)) { // Max 5 döngü limitli
            try {
              if (repair.action === 'replace_image' || repair.action === 'add_images') {
                // Görselsiz habere yapay zekadan bizzat görsel üret komutu gönder
                const { executeToolCall } = require('@/core/aloha/aiClient'); // Lazy load
                await executeToolCall({
                  name: 'scan_missing_images',
                  args: { collection: collection, articleId: repair.articleId, limit: 1, dryRun: false }
                });
                console.log(`[ALOHA] 🔧 Otonom Onarım: Görsel Üretimi Tetiklendi -> ${repair.articleId}`);
              } else if (repair.action === 'fix_slug' && repair.title) {
                // Kendi kendine yeten ufak slugify metodu (Türkçe harf uyumlu)
                const newSlug = repair.title.toLowerCase()
                  .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                
                await adminDb.collection(collection).doc(repair.articleId).update({ slug: newSlug });
                console.log(`[ALOHA] 🔧 Otonom Onarım: Bozuk Slug Düzeltildi -> ${newSlug}`);
              }
            } catch (repairErr: any) {
              console.warn(`[ALOHA] ⚠️ Otonom Onarım Hatası (${repair.action}): ${repairErr.message}`);
            }
          }

          const miniActions = auditResult.repairPlan.slice(0, 10);
          console.log(`[ALOHA] 🔧 [${projectName}] ${miniActions.length}/${auditResult.repairPlan.length} onarım aksiyonu tespit edildi (skor: ${auditResult.score}/100)`);
          result.actionsPerformed.push(`content_audit:${auditResult.score}/100_${auditResult.repairPlan.length}issues`);
          console.log(`[ALOHA] ✅ [${projectName}] Deep Audit tamamlandı: ${auditResult.summary}`);
        }
      } catch (repairErr: any) {
        console.warn(`[ALOHA] ⚠️ [${projectName}] İçerik onarımı atlandı: ${repairErr.message}`);
      }
    } // healthScore < 90 bloğu kapandı

    // ═══════════════════════════════════════
    // ADIM 2.7: HOMEPAGE BRAIN — Tek tool, tüm ana sayfa (Health Score'dan BAĞIMSIZ!)
    // ═══════════════════════════════════════
    if (projectName === 'trtex' && adminDb) {
      try {
        const brainDoc = await adminDb.collection('trtex_intelligence').doc('homepage_brain').get();
        const brainData = brainDoc.exists ? brainDoc.data() : null;
        const lastUpdate = brainData?.updatedAt ? new Date(brainData.updatedAt).getTime() : 0;
        const sixHoursAgo = Date.now() - 6 * 3600 * 1000;

        const needsUpdate = !brainData 
          || lastUpdate < sixHoursAgo 
          || !brainData.opportunities || brainData.opportunities.length < 3
          || !brainData.dailyInsight;

        if (needsUpdate) {
          console.log(`[ALOHA] 🧠 [trtex] Homepage Brain bayat — tek seferde güncelleniyor...`);

          let webContext = '';
          try {
            webContext = await executeToolCall({
              name: 'web_search',
              args: { query: 'textile trade opportunities 2026 home textile import export market SCFI freight China capacity curtain bedding towel' }
            });
          } catch { webContext = ''; }

          const promptStr = `Sen TRTEX B2B istihbarat analisti. Web verilerinden TRTEX ana sayfası için güncel içerik üret.

WEB VERİLERİ:
${(webContext || '').substring(0, 3000)}

JSON döndür (Türkçe):
{
  "daily_headline": "BÜYÜK HARF GÜNLÜK BAŞLIK",
  "daily_summary": "2-3 cümle veri odaklı özet",
  "daily_questions": [{"q":"Soru","a":"Cevap"},{"q":"Soru","a":"Cevap"},{"q":"Soru","a":"Cevap"}],
  "daily_risk_level": "ORTA",
  "daily_opportunity_level": "YÜKSEK",
  "daily_affected_countries": "Türkiye,Çin,Almanya,AB",
  "daily_comment": "Kısa TRTEX AI yorumu",
  "opportunities": [
    {"name":"CONFIDENTIAL","flag":"🇩🇪","country":"ALMANYA","iq_score":88,"trend":"rising","risk_flag":"low","sub":"PERDE","reason":"Somut fırsat açıklaması"},
    {"name":"CONFIDENTIAL","flag":"🇦🇪","country":"BAE","iq_score":85,"trend":"rising","risk_flag":"low","sub":"EV TEKSTİLİ","reason":"Somut fırsat"},
    {"name":"CONFIDENTIAL","flag":"🇬🇧","country":"İNGİLTERE","iq_score":82,"trend":"stable","risk_flag":"medium","sub":"NEVRESİM","reason":"Somut fırsat"},
    {"name":"CONFIDENTIAL","flag":"🇺🇸","country":"ABD","iq_score":79,"trend":"rising","risk_flag":"low","sub":"HAVLU","reason":"Somut fırsat"},
    {"name":"CONFIDENTIAL","flag":"🇸🇦","country":"S.ARABİSTAN","iq_score":76,"trend":"rising","risk_flag":"low","sub":"OTELCİLİK","reason":"Somut fırsat"}
  ],
  "sector_pulse_summary": "Sektör özeti",
  "sector_pulse_signals": [
    {"tag":"ÇİN","risk":"KRİTİK","text":"Kısa uyarı"},
    {"tag":"AB","risk":"DÜŞÜK","text":"Kısa uyarı"},
    {"tag":"HİNDİSTAN","risk":"ORTA","text":"Kısa uyarı"},
    {"tag":"KIZILDENİZ","risk":"YÜKSEK","text":"Kısa uyarı"}
  ],
  "hero_headline": "HOT LEAD BAŞLIĞI",
  "hero_opportunity": "Fırsat açıklaması",
  "hero_country": "Ülke",
  "hero_flag": "🇩🇪"
}

KURALLAR:
- Fırsatlar SOMUT olmalı (genel cümleler YASAK)
- Her opportunity farklı ülke ve ürün kategorisi`;

          const jsonResult = await alohaAI.generateJSON(promptStr, {
            temperature: 0.3,
            complexity: 'routine'
          }, 'autoRunner.brain');

          let parsed: any = {};
          if (jsonResult) {
            parsed = jsonResult;
          }

          if (parsed.daily_headline) {
            await executeToolCall({
              name: 'update_homepage_brain',
              args: {
                daily_headline: parsed.daily_headline,
                daily_summary: parsed.daily_summary || '',
                daily_questions: JSON.stringify(parsed.daily_questions || []),
                daily_risk_level: parsed.daily_risk_level || 'ORTA',
                daily_opportunity_level: parsed.daily_opportunity_level || 'YÜKSEK',
                daily_affected_countries: parsed.daily_affected_countries || 'Türkiye,Çin,AB',
                daily_comment: parsed.daily_comment || '',
                opportunities: JSON.stringify(parsed.opportunities || []),
                sector_pulse_summary: parsed.sector_pulse_summary || '',
                sector_pulse_signals: JSON.stringify(parsed.sector_pulse_signals || []),
              }
            });
            result.actionsPerformed.push('homepage_brain:updated');

            if (parsed.hero_headline) {
              await executeToolCall({
                name: 'update_intelligence_dashboard',
                args: {
                  hero_headline: parsed.hero_headline,
                  hero_opportunity: parsed.hero_opportunity || '',
                  hero_country: parsed.hero_country || 'Global',
                  hero_flag: parsed.hero_flag || '🌍',
                }
              });
            }
          }
        } else {
          console.log(`[ALOHA] ✅ [trtex] Homepage Brain güncel (skor: ${brainData?.intelligenceScore || '?'}) — atlanıyor`);
        }
      } catch (brainErr: any) {
        console.warn(`[ALOHA] ⚠️ Homepage Brain atlandı: ${brainErr.message}`);
      }

      // ── RADAR ALERT (24h — haber üretimi) ──
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const radarSnap = await adminDb.collection('trtex_news')
          .where('category', '==', 'Radar Alert')
          .where('createdAt', '>', oneDayAgo)
          .limit(1).get();

        if (radarSnap.empty) {
          console.log(`[ALOHA] 🔴 [trtex] RADAR bayat (>24h) — otonom gündem taraması yapılıyor...`);
          let radarTopics: string[] = [];
          try {
            const searchRes = await executeToolCall({ name: 'web_search', args: { query: 'today breaking news global textile market supply chain freight materials' } });
            const { text: resText } = await alohaAI.generate(
               `Asagidaki guncel haber ozetinden TRTEX B2B Radar icin 3 carpici stratejik uyari/haber basligi cikar. Sadece basliklari dondur (her satira bir tane, numarasiz).\n\n${searchRes.substring(0, 3000)}`,
               { complexity: 'routine' },
               'autoRunner.radarTopics'
            );
            radarTopics = (resText || '').split('\n').filter(t => t.trim().length > 15).map(t => t.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '').trim()).slice(0, 3);
          } catch (e: any) {
            console.warn(`[ALOHA] ⚠️ Dinamik konu cekimi basarisiz, API/Search arizali: ${e.message}`);
          }
          
          if (radarTopics.length < 3) {
            radarTopics = [
              'Kuresel Tekstil Tedarik Zinciri ve Guncel Navlun Analizi',
              'Uretim Kapasitesi ve Hammadde Piyasalarindaki Son Gelismeler',
              'B2B Tekstil Ihracatinda Yeni Hedef Pazarlar ve Riskler'
            ];
          }

          for (const topic of radarTopics) {
            try {
              await executeToolCall({ name: 'compose_article', args: { topic, project: 'trtex', category: 'Radar Alert', word_count: 400, image_count: 1 } });
              result.actionsPerformed.push('radar_alert:generated');
            } catch { result.actionsPerformed.push('radar_alert:failed'); }
          }
        }
      } catch (radarErr: any) {
        console.warn(`[ALOHA] ⚠️ Radar: ${radarErr.message}`);
      }

      // ═══════════════════════════════════════
      // ADIM 2.8: TRTEX SİTE YAPISAL DENETİM — Otonom Site Yapıcı
      // ═══════════════════════════════════════
      try {
        const { trtexSiteAudit, trtexBootstrapSite, trtexGetSiteState } = await import('./trtexSiteManager');
        
        // Site config var mı kontrol et — yoksa bootstrap
        if (adminDb) {
          const configDoc = await adminDb.collection('trtex_site_config').doc('main').get();
          if (!configDoc.exists) {
            console.log(`[ALOHA] 🏗️ [trtex] Site config bulunamadı — BOOTSTRAP başlatılıyor...`);
            const bootstrapResult = await trtexBootstrapSite();
            result.actionsPerformed.push('trtex_bootstrap:completed');
            console.log(`[ALOHA] ✅ [trtex] Bootstrap tamamlandı`);
          } else {
            // Config var — önce STATE oku, sonra yapısal denetim yap
            const siteState = await trtexGetSiteState();
            console.log(`[ALOHA] 📋 [trtex] Site durumu okundu`);
            
            const auditReport = await trtexSiteAudit();
            const scoreMatch = auditReport.match(/Skor: (\d+)\/100/);
            const siteScore = scoreMatch ? parseInt(scoreMatch[1]) : 100;
            
            if (siteScore < 80) {
              console.log(`[ALOHA] 🔧 [trtex] Site skoru ${siteScore}/100 — otomatik düzeltme başlatılıyor`);
              result.actionsPerformed.push(`trtex_site_audit:${siteScore}`);
              
              // Eksik sayfaları tespit et ve oluştur
              const missingPages = auditReport.match(/Zorunlu sayfa eksik: (\/\w+)/g);
              if (missingPages && missingPages.length > 0) {
                try {
                  const { trtexCreatePage } = await import('./trtexSiteManager');
                  for (const match of missingPages.slice(0, 2)) { // Max 2 sayfa oto-oluştur
                    const slug = match.replace('Zorunlu sayfa eksik: /', '');
                    const templateMap: Record<string, string> = {
                      'news': 'news_list', 'markets': 'category', 
                      'about': 'about', 'contact': 'contact'
                    };
                    await trtexCreatePage({
                      slug,
                      title_tr: slug.charAt(0).toUpperCase() + slug.slice(1),
                      template: (templateMap[slug] || 'static') as any,
                    });
                    result.actionsPerformed.push(`trtex_auto_fix:created_${slug}`);
                  }
                } catch (fixErr: any) {
                  console.warn(`[ALOHA] ⚠️ Oto-fix başarısız: ${fixErr.message}`);
                }
              }
            } else {
              console.log(`[ALOHA] ✅ [trtex] Site yapısı sağlıklı (${siteScore}/100)`);
            }
          }
        }
      } catch (siteErr: any) {
        console.warn(`[ALOHA] ⚠️ Site denetimi atlandı: ${siteErr.message}`);
      }
    }


    // ── B. GÖRSEL ONARIMI (429 Backoff korumalı) ──
    if (healthScore.total < 90 && health.imagelessCount > 0) {
        try {
          // 429 Rate Limit Backoff — son 1 saat içinde quota hatası varsa atla
          let shouldSkipImages = false;
          if (adminDb) {
            try {
              const recentImageErrors = await adminDb.collection('aloha_metrics')
                .where('project', '==', projectName)
                .orderBy('created_at', 'desc')
                .limit(1)
                .get();
              if (!recentImageErrors.empty) {
                const lastEntry = recentImageErrors.docs[0].data();
                const lastAction = lastEntry.top_error || '';
                const lastTime = new Date(lastEntry.created_at).getTime();
                if (lastAction.includes('429') || lastAction.includes('RESOURCE_EXHAUSTED')) {
                  const hourAgo = Date.now() - 3600000;
                  if (lastTime > hourAgo) {
                    shouldSkipImages = true;
                    console.log(`[ALOHA] 🖼️ [${projectName}] Imagen API cooldown — son 429 hatası ${Math.round((Date.now() - lastTime) / 60000)}dk önce, 1 saat bekle`);
                  }
                }
              }
            } catch { /* backoff check hata verirse devam et */ }
          }

          if (!shouldSkipImages) {
            const imgLimit = Math.min(health.imagelessCount, 2); // Döngü başına max 2 (quota koruması)
            console.log(`[ALOHA] 🖼️ [${projectName}] ${health.imagelessCount} görselsiz makale — ${imgLimit} tanesine görsel üretiliyor...`);
            
            const imgResult = await executeToolCall({
              name: 'scan_missing_images',
              args: { collection: `${projectName === 'trtex' ? 'trtex' : projectName}_news`, limit: imgLimit, dryRun: false },
            });

            const imgSuccess = !imgResult.includes('[HATA]') && !imgResult.includes('429');
            result.actionsPerformed.push(`image_repair:${imgSuccess ? 'OK' : 'FAIL'}`);
            console.log(`[ALOHA] ${imgSuccess ? '✅' : '⚠️'} [${projectName}] Görsel onarımı: ${imgResult.substring(0, 100)}`);
          } else {
            result.actionsPerformed.push('image_repair:COOLDOWN');
          }
        } catch (imgErr: any) {
          console.warn(`[ALOHA] ⚠️ [${projectName}] Görsel onarımı atlandı: ${imgErr.message}`);
        }
      }

      // ── C. CONTENT GUARD — Yasaklı Terim Temizliği ──
      try {
        const { validateContent, sanitizeContent } = require('./contentGuard');
        const collName = `${projectName === 'trtex' ? 'trtex' : projectName}_news`;
        
        if (adminDb) {
          const snap = await adminDb.collection(collName).orderBy('created_at', 'desc').limit(20).get();
          let cleaned = 0;
          
          for (const doc of snap.docs) {
            const data = doc.data();
            const content = data.content || data.body || '';
            if (!content) continue;
            
            const check = validateContent(content, 'article');
            if (!check.valid) {
              const { cleaned: fixedContent } = sanitizeContent(content, 'article');
              await doc.ref.update({ content: fixedContent });
              cleaned++;
            }
          }
          
          if (cleaned > 0) {
            result.actionsPerformed.push(`content_guard:${cleaned}_cleaned`);
            console.log(`[ALOHA] 🛡️ [${projectName}] Content Guard: ${cleaned} makalede yasaklı terim temizlendi`);
          }
        }
      } catch (guardErr: any) {
        console.warn(`[ALOHA] ⚠️ [${projectName}] Content Guard atlandı: ${guardErr.message}`);
      }

    // ═══════════════════════════════════════
    // ADIM 2.7: OTONOM ÖĞRENME DÖNGÜSÜ — "Her Gün Gelişme"
    // ═══════════════════════════════════════
    // Her döngüde:
    //   1. Son hataları analiz et → lesson'a dönüştür
    //   2. Wiki feedback kuyruğunu kontrol et → kuralları güncelle
    //   3. Başarı oranını takip et → strateji değiştir

    try {
      // ── A. SON HATALARI ÖĞREN ──
      if (adminDb) {
        const recentErrors = await adminDb.collection('aloha_metrics')
          .where('project', '==', projectName)
          .where('success', '==', false)
          .orderBy('created_at', 'desc')
          .limit(5)
          .get();

        if (!recentErrors.empty) {
          const errorPatterns: Record<string, number> = {};
          recentErrors.forEach(doc => {
            const err = doc.data().top_error || 'unknown';
            const key = err.substring(0, 80);
            errorPatterns[key] = (errorPatterns[key] || 0) + 1;
          });

          // Tekrar eden hata → lesson olarak kaydet
          for (const [pattern, count] of Object.entries(errorPatterns)) {
            if (count >= 2) {
              const lessonId = `lesson_${projectName}_${Date.now()}`;
              await adminDb.collection('aloha_lessons').doc(lessonId).set({
                project: projectName,
                pattern,
                count,
                learned_at: new Date().toISOString(),
                type: 'error_pattern',
                status: 'active',
              });
              console.log(`[ALOHA] 🧠 [${projectName}] Yeni lesson öğrenildi: "${pattern.substring(0, 50)}..." (${count}x tekrar)`);
              result.actionsPerformed.push(`learned:${pattern.substring(0, 30)}`);
            }
          }
        }
      }

      // ── B. BAŞARI ORANI TAKİBİ ──
      if (adminDb) {
        const last10 = await adminDb.collection('aloha_metrics')
          .where('project', '==', projectName)
          .orderBy('created_at', 'desc')
          .limit(10)
          .get();

        if (!last10.empty) {
          const successRate = last10.docs.filter(d => d.data().success).length / last10.size;
          if (successRate < 0.5) {
            console.warn(`[ALOHA] ⚠️ [${projectName}] Başarı oranı düşük: ${(successRate * 100).toFixed(0)}% — strateji değişikliği gerekebilir`);
          } else {
            console.log(`[ALOHA] 📊 [${projectName}] Başarı oranı: ${(successRate * 100).toFixed(0)}%`);
          }
        }
      }
    } catch (learnErr: any) {
      console.warn(`[ALOHA] ⚠️ Öğrenme döngüsü atlandı: ${learnErr.message}`);
    }

    // Uzun vadeli görevleri kontrol et
    try {
      const pendingTasks = await getPendingLongTasks(projectName, 3);
      if (pendingTasks.length > 0) {
        console.log(`[ALOHA] 📋 ${pendingTasks.length} bekleyen uzun vadeli görev (${projectName})`);
      }
    } catch { /* sessiz */ }

    // Aksiyon yoksa → Sağlıklı
    if (actions.length === 0) {
      console.log(`[ALOHA] ✅ ${projectName} sağlıklı (skor: ${healthScore.total}/100) — aksiyon gerekmiyor.`);
      result.actionsPerformed.push('no_action_needed');
      result.duration = Date.now() - startTime;
      return result;
    }

    // ═══════════════════════════════════════
    // ADIM 3: UYGULA
    // ═══════════════════════════════════════
    console.log(`[ALOHA] ⚡ Adım 3: ${actions.length} aksiyon uygulanacak...`);

    for (const action of actions) {
      const decision = shouldAutoExecute(action.tool, action.confidence);
      
      if (decision === 'auto') {
        console.log(`[ALOHA] 🟢 AUTO EXECUTE: ${action.tool} (güven: ${action.confidence}) — ${action.reason}`);
        
        const toolResult = await executeToolCall({
          name: action.tool,
          args: action.args,
        });

        const success = !toolResult.includes('[HATA]') && !toolResult.includes('[TOOL HATA]');
        result.actionsPerformed.push(`${action.tool}:${success ? 'OK' : 'FAIL'}`);
        
        if (!success) {
          result.errors.push(`${action.tool}: ${toolResult.substring(0, 200)}`);
        }

        console.log(`[ALOHA] ${success ? '✅' : '❌'} ${action.tool} — ${toolResult.substring(0, 100)}`);
      } else {
        console.log(`[ALOHA] 🟡 PROPOSAL: ${action.tool} (güven: ${action.confidence}) — onay beklenecek`);
        
        await proposalQueue.addProposal({
          project: projectName,
          issueType: 'stale_content',
          severity: action.confidence > 0.8 ? 'warning' : 'info',
          confidence: action.confidence,
          title: action.reason,
          description: `Otonom döngü tespit etti. Araç: ${action.tool}`,
          proposedAction: action.reason,
          toolToCall: action.tool,
          toolArgs: action.args,
        });

        result.actionsPerformed.push(`${action.tool}:PROPOSED`);
      }
    }

    // ═══════════════════════════════════════
    // ADIM 4: DOĞRULAMA (ZORUNLU! — JSON tabanlı)
    // ═══════════════════════════════════════
    console.log(`[ALOHA] 🔍 Adım 4: Doğrulama başlatılıyor...`);
    try {
      const verifyResult = await executeToolCall({
        name: 'verify_project_health',
        args: { projectName },
      });
      result.actionsPerformed.push('verify_project_health');
      
      // HEALTH_JSON'dan doğrulama sonucunu çek
      const vJsonMatch = verifyResult.match(/\[HEALTH_JSON\]([\s\S]*?)\[\/HEALTH_JSON\]/);
      if (vJsonMatch) {
        try {
          const vHealth = JSON.parse(vJsonMatch[1]);
          if (!vHealth.ok || vHealth.errors.length > 0) {
            console.log(`[ALOHA] ⚠️ Doğrulama sorunları:`, vHealth.errors);
            result.errors.push(`DOĞRULAMA: ${vHealth.errors.join(', ')}`);
          } else {
            console.log(`[ALOHA] ✅ Doğrulama geçti: ${vHealth.docCount} doküman, ${vHealth.status}`);
          }
        } catch { /* parse fail — sessiz */ }
      } else if (verifyResult.includes('❌') || verifyResult.includes('HATA')) {
        result.errors.push(`DOĞRULAMA: ${verifyResult.substring(0, 300)}`);
      } else {
        console.log(`[ALOHA] ✅ Doğrulama geçti`);
      }
    } catch (verifyErr: any) {
      console.warn(`[ALOHA] ⚠️ Doğrulama başarısız: ${verifyErr.message}`);
    }
    // ═══════════════════════════════════════
    // ADIM 4.5: TERMINAL PAYLOAD BUILDER — TEK BEYİN TEK ÇIKTI
    // "Frontend'e HİÇBİR şey bırakma. Her şeyi sen hazırla."
    // GPT haklı: "Sistem parça parça zeki, ama bütün olarak kör."
    // Bu adım o körlüğü bitirir.
    // ═══════════════════════════════════════
    if (projectName === 'trtex') {
      try {
        const { buildTerminalPayload } = await import('./terminalPayloadBuilder');
        const payloadResult = await buildTerminalPayload();
        console.log(`[ALOHA] 📦 Terminal Payload yazıldı: v${payloadResult.version}, IQ ${payloadResult.intelligenceScore}/100`);
        result.actionsPerformed.push(`terminal_payload:v${payloadResult.version}_IQ${payloadResult.intelligenceScore}`);
        
        // IQ TRACKING ALARM
        if (payloadResult.intelligenceScore < 60) {
          console.warn(`[ALOHA] 🚨 IQ ALARM: Terminal IQ skoru çok düşük (${payloadResult.intelligenceScore}/100)`);
          
          if (adminDb) {
            // Son 3 döngünün IQ skorunu kontrol et (bunu basite indirgeyip sadece alert ekliyoruz, karmaşık array yerine event tabanlı alarm)
            await adminDb.collection('aloha_alerts').add({
              type: 'IQ_DROP_CRITICAL',
              message: `TRTEX Intelligence IQ skoru ${payloadResult.intelligenceScore}/100 seviyesine düştü. Sinyal motoru körleşmiş olabilir.`,
              severity: 'critical',
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }
      } catch (payloadErr: any) {
        console.warn(`[ALOHA] ⚠️ Terminal Payload hatası:`, payloadErr.message);
        await dlq.record(payloadErr, 'autoRunner', 'trtex', 'terminal_payload_build_failed');
      }
    }

  } catch (err: any) {
    console.error(`[ALOHA] ❌ Döngü hatası:`, err.message);
    result.errors.push(err.message);
  }

  result.duration = Date.now() - startTime;

  // Cron lock'u serbest bırak
  try {
    if (adminDb) {
      await adminDb.collection('system_state').doc(`feed_lock_${projectName}`).set({
        last_run: new Date().toISOString(),
        status: 'completed',
        project: projectName,
        duration_ms: result.duration,
        error_count: result.errors.length,
      });
    }
  } catch (metricErr) { await dlq.recordSilent(metricErr, 'autoRunner', projectName); }
  
  // ═══════════════════════════════════════
  // ADIM 5: HAFIZAYA YAZ (Self-Learning Loop)
  // ═══════════════════════════════════════
  try {
    if (adminDb) {
      // Döngü logunu kaydet
      await adminDb.collection('aloha_cycles').add({
        ...result,
        actionsPerformed: result.actionsPerformed,
        errorCount: result.errors.length,
      });

      // 📊 METRİK KAYDI — monitoring dashboard için
      await adminDb.collection('aloha_metrics').add({
        project: projectName,
        success: result.errors.length === 0,
        actions: result.actionsPerformed.length,
        errors: result.errors.length,
        duration_ms: result.duration,
        top_error: result.errors[0]?.substring(0, 200) || null,
        created_at: new Date().toISOString(),
      });

      // Her aksiyon için memory write
      if (result.errors.length > 0) {
        await alohaMemory.addMemory('assistant', 'cycle_error', {
          project: projectName,
          errors: result.errors,
          actions: result.actionsPerformed,
          duration: result.duration,
        });
        // Tekrar eden hata → lesson'a dönüştür
        for (const err of result.errors) {
          await alohaMemory.addLesson({
            type: 'bug_fix',
            content: `[${projectName}] Otonom döngü hatası: ${err.substring(0, 200)}`,
            project: projectName,
            importance: 'high',
            tags: ['auto_cycle', 'error'],
            learned_from: `autoRunner_cycle_${Date.now()}`,
          });
        }
      } else if (result.actionsPerformed.length > 1) {
        // Başarılı döngü
        await alohaMemory.addMemory('assistant', 'cycle_success', {
          project: projectName,
          actions: result.actionsPerformed,
          duration: result.duration,
        });
      }
    }
  } catch (memErr) { await dlq.recordSilent(memErr, 'autoRunner', projectName); }

  // ═══════════════════════════════════════
  // ADIM 6: ESKİ HAFIZA TEMİZLİĞİ (purgeOldMemory)
  // 30 günden eski low-importance kayıtları sil — Firestore büyümesini engelle
  // ═══════════════════════════════════════
  try {
    const purgeResult = await alohaMemory.purgeOldMemory();
    if (purgeResult.deleted > 0) {
      console.log(`[ALOHA] 🧹 Hafıza temizliği: ${purgeResult.deleted} eski kayıt silindi`);
      result.actionsPerformed.push(`memory_purge:${purgeResult.deleted}`);
    }
  } catch (purgeErr) { await dlq.recordSilent(purgeErr, 'autoRunner.purge', projectName); }

  console.log(`[🔥 ALOHA OPERATOR] ${projectName.toUpperCase()} döngüsü tamamlandı (${result.duration}ms, ${result.actionsPerformed.length} aksiyon, ${result.errors.length} hata)\n`);
  
  return result;
}

/**
 * TÜM ÖNCELİKLİ PROJELERİ DÖNGÜYE AL
 */
export async function runFullAutonomousCycle(): Promise<CycleResult[]> {
  // ═══ BOOTSTRAP: Firestore State Recovery (Container restart sonrasi) ═══
  // Bu satirlar MUTLAKA ilk is olarak calisir.
  // Aksi takdirde controlTower limitleri ve safe mode state'i kaybolur.
  try {
    await recoverCycleState();
    await recoverSafeModeState();
    console.log('[ALOHA BOOTSTRAP] Firestore state recovery tamamlandi');
  } catch (recoveryErr) {
    await dlq.record(recoveryErr, 'autoRunner.bootstrap', 'system', 'state_recovery_failed');
    console.error('[ALOHA BOOTSTRAP] State recovery basarisiz — varsayilan degerlerle devam');
  }

  console.log('\n[ALOHA OPERATOR] ======================================================');
  console.log('[ALOHA OPERATOR] TAM OTONOM DONGU — ' + new Date().toISOString());
  console.log('[ALOHA OPERATOR] Oncelik: ' + PRIORITY_PROJECTS.join(' -> '));
  console.log('[ALOHA OPERATOR] ======================================================\n');

  const results: CycleResult[] = [];

  for (const project of PRIORITY_PROJECTS) {
    const result = await runAlohaCycle(project);
    results.push(result);
  }

  // ═══ HAFTALIK GOOGLE TECH SCAN (Tum projeler bittikten sonra) ═══
  try {
    await maybeRunWeeklyTechScan();
  } catch (scanErr) { await dlq.recordSilent(scanErr, 'autoRunner', 'system'); }

  const totalActions = results.reduce((s, r) => s + r.actionsPerformed.length, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);
  console.log('\n[ALOHA OPERATOR] ======================================================');
  console.log('[ALOHA OPERATOR] TAM DONGU TAMAMLANDI: ' + totalActions + ' aksiyon, ' + totalErrors + ' hata');
  console.log('[ALOHA OPERATOR] ======================================================\n');

  // ═══ CYCLE SONLANDIRMA: State'i Firestore'a kaydet ═══
  try {
    await endCycle();
    console.log('[ALOHA BOOTSTRAP] Cycle state Firestore\'a kaydedildi');
  } catch (endErr) {
    await dlq.recordSilent(endErr, 'autoRunner.endCycle', 'system');
  }

  return results;
}

/**
 * HAFTALIK GOOGLE TECH SCAN — Cron tetiklemeli
 * runFullAutonomousCycle sonrasında çağrılır.
 * Haftada 1'den fazla çalışmaz (Firestore lock).
 */
export async function maybeRunWeeklyTechScan(): Promise<boolean> {
  try {
    if (!adminDb) return false;

    // Son tarama tarihini kontrol et
    const lastScanSnap = await adminDb
      .collection('aloha_tech_intel')
      .orderBy('scannedAt', 'desc')
      .limit(1)
      .get();

    if (!lastScanSnap.empty) {
      const lastScan = lastScanSnap.docs[0].data();
      const daysSince = (Date.now() - new Date(lastScan.scannedAt).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince < 7) {
        console.log(`[TECH SCAN] ⏸️ Son tarama ${daysSince.toFixed(1)} gün önce — henüz erken (7 gün bekleniyor)`);
        return false;
      }
    }

    // 7+ gün geçmiş → taramayı başlat
    console.log(`[TECH SCAN] 🔬 Haftalık Google altyapı taraması tetiklendi...`);
    const { weeklyGoogleTechScan } = await import('./initiative');
    const result = await weeklyGoogleTechScan();
    
    console.log(`[TECH SCAN] ✅ Tarama tamamlandı: ${result.scanned} konu, ${result.relevant} ilgili, ${result.critical} kritik`);
    return true;
  } catch (e: any) {
    console.warn(`[TECH SCAN] ⚠️ Haftalık tarama hatası: ${e.message}`);
    return false;
  }
}

import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';
import { AlohaDirective, WorkerTask } from '../aloha-directive-protocol';

// SINGLETON ZORLAMA — Maliye Bakanı v2
// Kaçak GoogleGenAI instance KALDIRILDI. 
// Lead Agent kendi API çağrısı yapmaz, ALOHA pipeline delegasyonunu kullanır.
// Eğer ileride doğrudan AI çağrısı gerekirse: import { alohaAI } from '../aloha/aiClient';

/**
 * ═══════════════════════════════════════════════════════
 * TRTEX BAŞ AJAN — TRTEX.com Genel Müdürü
 * ═══════════════════════════════════════════════════════
 * 
 * MİMARİ POZİSYON:
 * - ALOHA (İkiz, CEO) → TrtexLeadAgent (TRTEX GM) → İşçi Ajanlar
 * - Bu ajan TRTEX.com'un TÜM operasyonlarından sorumludur
 * - ALOHA'nın pipeline bileşenlerini kullanır, kendi mock veri ÜRETMEZ
 * - İleride HometexLeadAgent, PerdeLeadAgent aynı yapıda kurulacak
 * 
 * SORUMLULUKLAR:
 * 1. Sinyal toplama (ALOHA signalCollector delegasyonu)
 * 2. Görsel üretim (ALOHA imageAgent delegasyonu)
 * 3. Terminal Payload oluşturma (ALOHA terminalPayloadBuilder delegasyonu)
 * 4. Kalite kontrolü (Entity Validation, Content Guard)
 * 5. ALOHA'ya rapor verme
 */

export const B2B_MASTER_BRANDS = [
  "JAB", "Zimmer + Rohde", "Vanelli", "Christian Fischbacher", "Küçükçalık", 
  "Persan", "Elvin", "Coulisse", "Kivanc", "Aydin", "Broderi Narin",
  "English Home", "Karaca", "Madame Coco", "IKEA", "Zara Home", "H&M Home",
  "LCW Home", "Taç", "Linens", "Özdilek", "Boyner Evde", "Doğanay", 
  "Bella Maison", "Chakra", "Bernardo"
];

// 6 farklı kategoriden en az 6 haber basmak için garanti liste.
const CATEGORY_FLOW = [
  "CURTAIN",       
  "HOME_TEXTILE",  
  "UPHOLSTERY",    
  "FAIR",          
  "RAW_MATERIAL",  
  "TECH"          
];

export class TrtexLeadAgent {
    public projectId = "TRTEX";
    public rank = "General Manager TRTEX.com (ALOHA Pipeline Delegasyonu)";
    
    constructor() {
        console.log("[TRTEX-LEAD] 👔 TRTEX Baş Ajanı v3.0 devrede. ALOHA Pipeline Delegasyonu Aktif.");
    }


    /**
     * ═══════════════════════════════════════
     * ANA DÖNGÜ — ALOHA Pipeline Orkestrasyon
     * ═══════════════════════════════════════
     * 
     * TrtexLeadAgent asla kendi stratejisini belirlemez. ALOHA'nın (CEO) Emrine uyar!
     */
    public async runCycle(options?: { targetedCommand?: string, directive?: AlohaDirective }) {
        const cycleStart = Date.now();
        console.log(`[TRTEX-LEAD] ════════════════════════════════════════`);
        console.log(`[TRTEX-LEAD] 🔄 TRTEX Baş Ajan Döngüsü Başladı`);
        console.log(`[TRTEX-LEAD] 📋 Komut: ${options?.targetedCommand || 'FULL_CYCLE'}`);
        console.log(`[TRTEX-LEAD] ════════════════════════════════════════`);

        const cycleReport = {
            signalsCollected: 0,
            articlesCreated: 0,
            imagesGenerated: 0,
            payloadVersion: '',
            intelligenceScore: 0,
            errors: [] as string[],
            warnings: [] as string[],
        };

        // ═══════════════════════════════════════
        // ADIM 1: SİNYAL TOPLAMA (ALOHA signalCollector - WORKER KATMANI)
        // ALOHA'NIN EMRİNE (DIRECTIVE) GÖRE KISITLANDIRIŞLMIŞ İCRAAT (Execution Only)
        // ═══════════════════════════════════════
        try {
            console.log(`[TRTEX-LEAD] 🎣 ADIM 1: Sinyal toplama başlatılıyor...`);

            // Sovereign Limit Mührü
            let workerLock: WorkerTask | undefined;
            if (options?.directive) {
                console.log(`[TRTEX-LEAD - SOVEREIGN LOCK] ALOHA'nın Stratejik Emri İcra Ediliyor! Odak: ${options.directive.focus}`);
                workerLock = {
                    directiveId: options.directive.id,
                    taskType: 'SCRAPE_SIGNALS',
                    focus: options.directive.focus,
                    targetMarkets: options.directive.targetMarkets,
                    strictMode: options.directive.strictMode
                };
            }

            const { collectSignals } = await import('@/core/aloha/signalCollector');
            // Worker'ı "Sovereign Directive Lock" ile çağır
            const signalResult = await collectSignals('trtex', workerLock);
            
            cycleReport.signalsCollected = signalResult.signalsFound;
            cycleReport.articlesCreated = signalResult.articlesCreated;
            
            if (signalResult.articlesCreated > 0) {
                console.log(`[TRTEX-LEAD] ✅ ${signalResult.signalsFound} sinyal → ${signalResult.articlesCreated} haber üretildi (${signalResult.signalsFiltered} filtrelendi)`);
            } else {
                console.log(`[TRTEX-LEAD] ℹ️ ${signalResult.signalsFound} sinyal bulundu, ${signalResult.signalsFiltered} filtrelendi, yeni haber üretilmedi (mevcut içerik yeterli)`);
            }
        } catch (signalErr: any) {
            const msg = `Sinyal toplama hatası: ${signalErr.message}`;
            console.warn(`[TRTEX-LEAD] ⚠️ ${msg}`);
            cycleReport.errors.push(msg);
        }

        // ═══════════════════════════════════════
        // ADIM 2: GÖRSEL TARAMA & ÜRETİM (ALOHA imageAgent)
        // Google-native Imagen → Pexels fallback
        // ═══════════════════════════════════════
        if (options?.targetedCommand !== 'signalOnly') {
            try {
                console.log(`[TRTEX-LEAD] 📸 ADIM 2: Görselsiz haberlere görsel üretiliyor...`);
                const { scanAndGenerateImages } = await import('@/core/aloha/missing-image-scanner');
                const imageResult = await scanAndGenerateImages('trtex_news', 10);
                
                cycleReport.imagesGenerated = imageResult.generated || 0;
                
                if (imageResult.generated > 0) {
                    console.log(`[TRTEX-LEAD] ✅ ${imageResult.generated} görsel üretildi (${imageResult.skipped || 0} atlandı)`);
                } else {
                    console.log(`[TRTEX-LEAD] ℹ️ Tüm haberlerin görseli mevcut.`);
                }
            } catch (imgErr: any) {
                const msg = `Görsel üretim hatası: ${imgErr.message}`;
                console.warn(`[TRTEX-LEAD] ⚠️ ${msg}`);
                cycleReport.warnings.push(msg);
                // Görsel hatası döngüyü durdurmaz — payload görselsiz de oluşabilir
            }
        }

        // ═══════════════════════════════════════
        // ADIM 3: TERMİNAL PAYLOAD OLUŞTUR (TEK BEYİN)
        // terminalPayloadBuilder → trtex_terminal/current'a atomik yazar
        // ═══════════════════════════════════════
        try {
            console.log(`[TRTEX-LEAD] 📦 ADIM 3: Terminal Payload oluşturuluyor (TEK BEYİN)...`);
            const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
            const payload = await buildTerminalPayload();
            
            cycleReport.payloadVersion = payload.version?.toString() || 'unknown';
            cycleReport.intelligenceScore = payload.intelligenceScore || 0;
            
            console.log(`[TRTEX-LEAD] ✅ Payload v${payload.version} | IQ: ${payload.intelligenceScore}/100`);
            console.log(`[TRTEX-LEAD] 📊 Hero: ${payload.heroArticle?.title?.substring(0, 50) || 'YOK'}...`);
            console.log(`[TRTEX-LEAD] 📊 Grid: ${payload.gridArticles?.length || 0} haber`);
            console.log(`[TRTEX-LEAD] 📊 Ticker: ${payload.tickerItems?.length || 0} veri noktası`);
        } catch (payloadErr: any) {
            const msg = `Terminal Payload hatası: ${payloadErr.message}`;
            console.error(`[TRTEX-LEAD] ❌ ${msg}`);
            cycleReport.errors.push(msg);
        }

        // ═══════════════════════════════════════
        // ADIM 4: KALİTE KONTROLÜ (Entity Validation)
        // ═══════════════════════════════════════
        try {
            if (adminDb) {
                const terminalDoc = await adminDb.collection('trtex_terminal').doc('current').get();
                if (terminalDoc.exists) {
                    const data = terminalDoc.data();
                    const allArticles = [data?.heroArticle, ...(data?.gridArticles || [])].filter(Boolean);
                    
                    let totalQuality = 0;
                    let verifiedCount = 0;
                    let unverifiedCount = 0;
                    
                    for (const art of allArticles) {
                        const qs = Number(art.quality_score || art.confidence_score || 0);
                        totalQuality += isNaN(qs) ? 0 : qs;
                        
                        if (art.is_verified) verifiedCount++;
                        else unverifiedCount++;
                    }
                    
                    const avgQuality = allArticles.length > 0 ? Math.round(totalQuality / allArticles.length) : 0;
                    console.log(`[TRTEX-LEAD] 🔍 Kalite Kontrol: Ortalama: ${avgQuality}/100 | Doğrulanmış: ${verifiedCount} | Doğrulanmamış: ${unverifiedCount}`);
                    
                    if (avgQuality < 60) {
                        cycleReport.warnings.push(`Düşük kalite ortalaması: ${avgQuality}/100`);
                        console.warn(`[TRTEX-LEAD] ⚠️ KALİTE UYARISI: Ortalama ${avgQuality}/100 — iyileştirme gerekiyor`);
                    }
                }
            }
        } catch (qualityErr: any) {
            console.warn(`[TRTEX-LEAD] ⚠️ Kalite kontrol hatası:`, qualityErr.message);
        }

        // ═══════════════════════════════════════
        // ADIM 5: ALOHA'YA RAPOR VER
        // ═══════════════════════════════════════
        const cycleDuration = Date.now() - cycleStart;
        const durationSec = (cycleDuration / 1000).toFixed(1);

        try {
            if (adminDb) {
                await adminDb.collection('trtex_lead_reports').add({
                    timestamp: new Date().toISOString(),
                    cycle_duration_ms: cycleDuration,
                    signals_collected: cycleReport.signalsCollected,
                    articles_created: cycleReport.articlesCreated,
                    images_generated: cycleReport.imagesGenerated,
                    payload_version: cycleReport.payloadVersion,
                    intelligence_score: cycleReport.intelligenceScore,
                    errors: cycleReport.errors,
                    warnings: cycleReport.warnings,
                    status: cycleReport.errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
                    agent_version: 'v3.0-pipeline',
                    command: options?.targetedCommand || 'FULL_CYCLE',
                });
            }
        } catch (reportErr: any) {
            console.warn(`[TRTEX-LEAD] ⚠️ Rapor kayıt hatası:`, reportErr.message);
        }

        console.log(`\n[TRTEX-LEAD] ════════════════════════════════════════`);
        console.log(`[TRTEX-LEAD] ✅ TRTEX Döngüsü Tamamlandı (${durationSec}s)`);
        console.log(`[TRTEX-LEAD]    Sinyaller: ${cycleReport.signalsCollected} | Haberler: ${cycleReport.articlesCreated}`);
        console.log(`[TRTEX-LEAD]    Görseller: ${cycleReport.imagesGenerated} | IQ: ${cycleReport.intelligenceScore}/100`);
        console.log(`[TRTEX-LEAD]    Hatalar: ${cycleReport.errors.length} | Uyarılar: ${cycleReport.warnings.length}`);
        console.log(`[TRTEX-LEAD]    Durum: ${cycleReport.errors.length === 0 ? '🟢 BAŞARILI' : '🟡 KISMİ'}`);
        console.log(`[TRTEX-LEAD] ════════════════════════════════════════\n`);
    }
}
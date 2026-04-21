import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA COST GUARD v2.0 (Bütçe + Loop + Pattern Kalkanı)
 * 
 * 3 katmanlı koruma:
 * 1. Loop Guard: Saatte max 6 döngü
 * 2. Budget Guard: Günde max 15 haber  
 * 3. Pattern Guard: Aynı hata 3 kez → dur, spam algılama
 */

const MAX_CYCLES_PER_HOUR = 2;     // LIMIT DÜŞÜRÜLDÜ: Saatte max 2 döngü (Eski: 6)
const MAX_ARTICLES_PER_DAY = 5;      // LIMIT DÜŞÜRÜLDÜ: Günde max 5 haber (Eski: 15)
const MAX_SAME_ERROR_COUNT = 3;    // Aynı hata 3 kez → panic
const MAX_SAME_CATEGORY_PER_DAY = 3; // Aynı kategoriden max 3 haber (spam engeli - Eski: 5)
const EMERGENCY_LOCK_KEY = "aloha_emergency_lock";

export interface CostGuardStatus {
    safe: boolean;
    reason?: string;
    metrics: {
        runsThisHour: number;
        articlesToday: number;
        patternWarning?: string;
    }
}

export async function checkCostParams(project: string): Promise<CostGuardStatus> {
    if (!adminDb) return { safe: true, metrics: { runsThisHour: 0, articlesToday: 0 } };

    try {
        // 1. Manuel Kilit Kontrolü
        const lockDoc = await adminDb.collection("system_state").doc(EMERGENCY_LOCK_KEY).get();
        if (lockDoc.exists && lockDoc.data()?.is_locked) {
            return {
                safe: false,
                reason: `🚨 Sistem kilitli! Sebep: ${lockDoc.data()?.reason || 'Bilinmiyor'}. Yetkili onayı gerekiyor.`,
                metrics: { runsThisHour: 0, articlesToday: 0 }
            };
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // 2. Loop Guard
        const runsQuery = await adminDb.collection("aloha_signal_runs")
            .where("timestamp", ">=", oneHourAgo)
            .get();
        const runsThisHour = runsQuery.size;

        if (runsThisHour >= MAX_CYCLES_PER_HOUR) {
            await triggerEmergencyLock(`Saatte ${MAX_CYCLES_PER_HOUR} döngü sınırı aşıldı!`);
            return {
                safe: false,
                reason: `🚨 RUNAWAY: 1 saatte ${runsThisHour} döngü. Sistem kilitlendi.`,
                metrics: { runsThisHour, articlesToday: 0 }
            };
        }

        // 3. Budget Guard
        const articlesQuery = await adminDb.collection(`${project}_news`)
            .where("createdAt", ">=", todayStart)
            .get();
        const articlesToday = articlesQuery.size;

        if (articlesToday >= MAX_ARTICLES_PER_DAY) {
            return {
                safe: false,
                reason: `⚠️ BÜTÇE LİMİTİ: ${articlesToday}/${MAX_ARTICLES_PER_DAY} haber. Yarına kadar durduruldu.`,
                metrics: { runsThisHour, articlesToday }
            };
        }

        // 4. Pattern Guard — Aynı hata 3 kez = panic
        let patternWarning: string | undefined;
        try {
            const errorsQuery = await adminDb.collection("aloha_errors")
                .where("timestamp", ">=", oneHourAgo)
                .orderBy("timestamp", "desc")
                .limit(10)
                .get();

            if (!errorsQuery.empty) {
                const errors = errorsQuery.docs.map(d => d.data().error_type || d.data().message || '');
                const errorCounts: Record<string, number> = {};
                for (const err of errors) {
                    const key = err.substring(0, 50);
                    errorCounts[key] = (errorCounts[key] || 0) + 1;
                }
                for (const [errorType, count] of Object.entries(errorCounts)) {
                    if (count >= MAX_SAME_ERROR_COUNT) {
                        await triggerEmergencyLock(`Aynı hata ${count} kez tekrarlandı: "${errorType}"`);
                        return {
                            safe: false,
                            reason: `🚨 PATTERN PANIC: "${errorType}" ${count} kez. Sistem donduruldu.`,
                            metrics: { runsThisHour, articlesToday, patternWarning: errorType }
                        };
                    }
                }
            }
        } catch { /* pattern check başarısız → devam et */ }

        // 5. Spam Guard — Aynı kategoriden çok fazla haber
        try {
            const categoryMap: Record<string, number> = {};
            for (const doc of articlesQuery.docs) {
                const cat = doc.data().category || 'Bilinmiyor';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            }
            for (const [cat, count] of Object.entries(categoryMap)) {
                if (count >= MAX_SAME_CATEGORY_PER_DAY) {
                    patternWarning = `${cat} kategorisinde ${count} haber (max ${MAX_SAME_CATEGORY_PER_DAY})`;
                }
            }
        } catch { /* spam check başarısız → devam et */ }

        return { safe: true, metrics: { runsThisHour, articlesToday, patternWarning } };

    } catch (err: any) {
        console.error("[COST_GUARD] Error:", err);
        return { safe: true, metrics: { runsThisHour: 0, articlesToday: 0 } };
    }
}

/** Hata kaydet — pattern detection için */
export async function logError(errorType: string, message: string, project: string = 'trtex') {
    if (!adminDb) return;
    try {
        await adminDb.collection("aloha_errors").add({
            error_type: errorType,
            message,
            project,
            timestamp: new Date().toISOString(),
        });
    } catch { /* sessiz */ }
}

/** Sistemi kilitler — admin açana kadar Aloha felç */
export async function triggerEmergencyLock(reason: string) {
    if (!adminDb) return;
    try {
        await adminDb.collection("system_state").doc(EMERGENCY_LOCK_KEY).set({
            is_locked: true,
            reason: reason,
            locked_at: new Date().toISOString()
        });
        console.error(`[COST_GUARD] 🔴 KİLİTLENDİ: ${reason}`);
    } catch (err) {
        console.error("[COST_GUARD] Kilitlenemedi:", err);
    }
}

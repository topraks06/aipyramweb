import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA SELF-IMPROVEMENT ENGINE (V1.0)
 * Günlük olarak çalışan ve ajanların performans verilerini analiz edip
 * "Öğrenilen Dersler" ve "Kazanılan Stratejiler" olarak hafızaya yazan modül.
 */

export async function runSelfImprovement() {
  console.log(`[🧠 SELF-IMPROVEMENT] Otonom evrim süreci başlatılıyor...`);

  if (!adminDb) {
    console.warn(`[🧠 SELF-IMPROVEMENT] adminDb yok. Evrim iptal edildi.`);
    return { success: false, reason: 'no_db' };
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // Son 24 saatin performans loglarını getir
    const snapshot = await adminDb.collection('aloha_agent_performance')
      .where('timestamp', '>=', twentyFourHoursAgo)
      .get();

    if (snapshot.empty) {
      console.log(`[🧠 SELF-IMPROVEMENT] Son 24 saatte değerlendirilecek ajan eylemi bulunamadı.`);
      return { success: true, processed: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const node = data.node || 'global';
      const action = data.action || 'unknown';
      const success = data.success === true;
      const context = data.context || '';
      const reason = data.reason || '';

      if (success) {
        successCount++;
        const knowledgeRef = adminDb.collection('aloha_knowledge').doc();
        batch.set(knowledgeRef, {
          node,
          action,
          strategy: context,
          confidence: 0.8,
          source: 'self_improvement',
          learnedAt: new Date().toISOString()
        });
      } else {
        failCount++;
        const lessonRef = adminDb.collection('aloha_lessons_learned').doc();
        batch.set(lessonRef, {
          node,
          action,
          failedStrategy: context,
          errorReason: reason,
          severity: 'high',
          source: 'self_improvement',
          learnedAt: new Date().toISOString()
        });
      }
    });

    await batch.commit();

    console.log(`[🧠 SELF-IMPROVEMENT] Evrim Tamamlandı! ${successCount} Yeni Strateji, ${failCount} Alınan Ders eklendi.`);
    return { success: true, processed: snapshot.docs.length, newStrategies: successCount, lessonsLearned: failCount };
  } catch (error: any) {
    console.error(`[🧠 SELF-IMPROVEMENT] Evrim sırasında hata: ${error.message}`);
    return { success: false, error: error.message };
  }
}

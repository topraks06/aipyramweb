import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA SCHEDULER — Zamanlı Görev Planlama ve Priority Kuyruk
 * 
 * Koleksiyon: aloha_scheduled_tasks
 * 
 * Priority sistemi:
 *   high   → sıranın başına ekle, hemen çalıştır
 *   normal → sıraya ekle, zamanı gelince çalıştır
 *   low    → boşta kalınca çalıştır (idle mode)
 * 
 * autoRunner her döngüde checkScheduledTasks() çağırır
 */

// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface ScheduledTask {
  id?: string;
  action: string;            // Tool adı (compose_article, trtex_create_page, vb.)
  args: Record<string, any>; // Tool argümanları
  priority: 'high' | 'normal' | 'low';
  executeAt: string;         // ISO timestamp — ne zaman çalıştırılacak
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  executedAt?: string;
  result?: string;
  retryCount: number;
  maxRetries: number;
  createdBy: 'aloha' | 'manual' | 'decision_engine';
  description?: string;      // İnsan-okunur açıklama
}

// ═══════════════════════════════════════
// GÖREV EKLEME
// ═══════════════════════════════════════

/**
 * Yeni zamanlı görev oluştur
 * "Yarın sabah 8'de bu konuda haber üret"
 */
export async function scheduleTask(params: {
  action: string;
  args: Record<string, any>;
  executeAt: string;
  priority?: 'high' | 'normal' | 'low';
  description?: string;
  createdBy?: ScheduledTask['createdBy'];
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase bağlantısı yok';

  // Validasyon
  const executeDate = new Date(params.executeAt);
  if (isNaN(executeDate.getTime())) {
    return '[HATA] Geçersiz tarih formatı. ISO format kullan: 2026-04-12T08:00:00Z';
  }

  // Geçmiş tarih kontrolü
  if (executeDate.getTime() < Date.now() - 5 * 60 * 1000) {
    return '[HATA] Geçmiş bir tarih belirtildi. Gelecek bir tarih girin.';
  }

  // Günlük limit: max 20 zamanlanmış görev
  const today = new Date().toISOString().split('T')[0];
  const todaySnap = await adminDb.collection('aloha_scheduled_tasks')
    .where('status', '==', 'pending')
    .limit(50).get();
  if (todaySnap.size >= 50) {
    return '[GUARDRAIL] Bekleyen görev sayısı 50\'yi aştı. Önce mevcut görevleri tamamla.';
  }

  const task: Omit<ScheduledTask, 'id'> = {
    action: params.action,
    args: params.args,
    priority: params.priority || 'normal',
    executeAt: params.executeAt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 2,
    createdBy: params.createdBy || 'aloha',
    description: params.description,
  };

  const ref = await adminDb.collection('aloha_scheduled_tasks').add(task);
  console.log(`[📅 SCHEDULER] Görev planlandı: ${params.action} → ${params.executeAt} (${ref.id})`);

  return `✅ Görev planlandı!\n` +
    `📋 Aksiyon: ${params.action}\n` +
    `⏰ Zaman: ${params.executeAt}\n` +
    `🔥 Öncelik: ${task.priority}\n` +
    `📝 Açıklama: ${params.description || '-'}\n` +
    `🆔 ID: ${ref.id}`;
}

// ═══════════════════════════════════════
// GÖREV KONTROLÜ (autoRunner çağırır)
// ═══════════════════════════════════════

/**
 * Zamanı gelmiş görevleri bul ve çalıştır
 * @returns Çalıştırılan görev sayısı
 */
export async function checkScheduledTasks(
  toolExecutor: (call: { name: string; args: Record<string, any> }) => Promise<string>,
): Promise<{ executed: number; results: string[] }> {
  if (!adminDb) return { executed: 0, results: ['Firebase yok'] };

  const now = new Date().toISOString();
  const results: string[] = [];
  let executed = 0;

  try {
    // 1. High priority → hemen çalıştır
    const highSnap = await adminDb.collection('aloha_scheduled_tasks')
      .where('status', '==', 'pending')
      .where('priority', '==', 'high')
      .where('executeAt', '<=', now)
      .orderBy('executeAt', 'asc')
      .limit(5)
      .get();

    // 2. Normal priority → zamanı gelmiş olanlar
    const normalSnap = await adminDb.collection('aloha_scheduled_tasks')
      .where('status', '==', 'pending')
      .where('priority', '==', 'normal')
      .where('executeAt', '<=', now)
      .orderBy('executeAt', 'asc')
      .limit(3)
      .get();

    // 3. Low priority → sadece kuyruk boşsa
    let lowSnap: any = { docs: [] };
    if (highSnap.empty && normalSnap.empty) {
      lowSnap = await adminDb.collection('aloha_scheduled_tasks')
        .where('status', '==', 'pending')
        .where('priority', '==', 'low')
        .where('executeAt', '<=', now)
        .orderBy('executeAt', 'asc')
        .limit(2)
        .get();
    }

    const allTasks = [...highSnap.docs, ...normalSnap.docs, ...lowSnap.docs];

    for (const doc of allTasks) {
      const task = doc.data() as ScheduledTask;

      // Durumu güncelle
      await doc.ref.update({ status: 'executing' });

      try {
        console.log(`[📅 SCHEDULER] ▶️ Çalıştırılıyor: ${task.action} (${task.priority})`);
        const result = await toolExecutor({ name: task.action, args: task.args });
        const success = !result.includes('[HATA]') && !result.includes('[TOOL HATA]');

        await doc.ref.update({
          status: success ? 'completed' : 'failed',
          executedAt: new Date().toISOString(),
          result: result.substring(0, 1000),
          retryCount: task.retryCount + 1,
        });

        results.push(`${success ? '✅' : '❌'} ${task.action}: ${result.substring(0, 200)}`);
        if (success) executed++;
      } catch (e: any) {
        await doc.ref.update({
          status: task.retryCount < task.maxRetries ? 'pending' : 'failed',
          retryCount: task.retryCount + 1,
          result: `Hata: ${e.message}`,
        });
        results.push(`❌ ${task.action}: ${e.message}`);
      }
    }
  } catch (e: any) {
    results.push(`[SCHEDULER HATA] ${e.message}`);
  }

  if (executed > 0) {
    console.log(`[📅 SCHEDULER] ${executed} görev tamamlandı`);
  }

  return { executed, results };
}

// ═══════════════════════════════════════
// GÖREV LİSTELEME
// ═══════════════════════════════════════

export async function listScheduledTasks(status?: string): Promise<string> {
  if (!adminDb) return '[HATA] Firebase bağlantısı yok';

  try {
    let query = adminDb.collection('aloha_scheduled_tasks')
      .orderBy('executeAt', 'asc')
      .limit(20);

    if (status) {
      query = adminDb.collection('aloha_scheduled_tasks')
        .where('status', '==', status)
        .orderBy('executeAt', 'asc')
        .limit(20);
    }

    const snap = await query.get();
    if (snap.empty) return `📅 ${status ? `${status} durumunda` : 'Toplam'} görev bulunamadı.`;

    let report = `═══ ZAMANLI GÖREVLER ═══\n`;
    const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() as ScheduledTask }));

    const priorityIcon = { high: '🔥', normal: '📋', low: '💤' };
    const statusIcon = { pending: '⏳', executing: '▶️', completed: '✅', failed: '❌', cancelled: '🚫' };

    for (const t of tasks) {
      const pIcon = priorityIcon[t.priority] || '📋';
      const sIcon = statusIcon[t.status] || '❓';
      const timeStr = new Date(t.executeAt).toLocaleString('tr-TR');
      report += `${sIcon} ${pIcon} ${t.action} → ${timeStr} [${t.status}]\n`;
      if (t.description) report += `   📝 ${t.description}\n`;
    }

    report += `\nToplam: ${tasks.length} görev`;
    return report;
  } catch (e: any) {
    return `[HATA] ${e.message}`;
  }
}

/**
 * Görev iptal et
 */
export async function cancelScheduledTask(taskId: string): Promise<string> {
  if (!adminDb) return '[HATA] Firebase bağlantısı yok';

  try {
    const ref = adminDb.collection('aloha_scheduled_tasks').doc(taskId);
    const doc = await ref.get();
    if (!doc.exists) return `[HATA] Görev bulunamadı: ${taskId}`;

    const task = doc.data() as ScheduledTask;
    if (task.status !== 'pending') {
      return `[HATA] Sadece 'pending' görevler iptal edilebilir. Mevcut durum: ${task.status}`;
    }

    await ref.update({ status: 'cancelled', executedAt: new Date().toISOString() });
    return `✅ Görev iptal edildi: ${task.action} (${taskId})`;
  } catch (e: any) {
    return `[HATA] ${e.message}`;
  }
}

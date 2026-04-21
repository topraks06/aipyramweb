import { adminDb } from "@/lib/firebase-admin";

// ═══════════════════════════════════════════════════
// ALOHA PERSISTENT MEMORY SYSTEM
// Cloud Run cold start'a dayanıklı — Firestore tabanlı
// ═══════════════════════════════════════════════════

export interface MemoryEntry {
  role: 'assistant' | 'user';
  action: string;
  payload: string;
  timestamp: number;
}

export interface Lesson {
  id?: string;
  type: 'lesson' | 'bug_fix' | 'optimization' | 'warning' | 'pattern';
  content: string;
  project: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  learned_from: string; // Hangi görevden öğrenildi
  created_at: string;
  times_applied: number; // Kaç kez kullanıldı
}

export class AlohaMemory {
  private colName = "aloha_memory";
  private lessonsCol = "aloha_lessons";
  private sessionId = "global_memory";

  // ─── HAFIZA (SESSION LOG) ───

  public async getRecentMemory(limitCount: number = 10): Promise<MemoryEntry[]> {
    if (!adminDb) return [];
    try {
      const snap = await adminDb
        .collection(this.colName)
        .where('sessionId', '==', this.sessionId)
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();
      if (snap.empty) return [];
      const results: MemoryEntry[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        results.push({
          role: data.role || 'assistant',
          action: data.action || '',
          payload: data.payload || '',
          timestamp: data.timestamp || 0
        });
      });
      return results.reverse();
    } catch (e) {
      console.error("[AlohaMemory Error] getting memory:", e);
      return [];
    }
  }

  public async addMemory(role: 'user' | 'assistant', action: string, payload: any): Promise<void> {
    if (!adminDb) return;
    try {
      await adminDb.collection(this.colName).add({
        sessionId: this.sessionId,
        role,
        action,
        payload: typeof payload === "string" ? payload : JSON.stringify(payload),
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("[AlohaMemory Error] adding memory:", e);
    }
  }

  // ─── LESSONS (KALICI DERSLER — cold start dayanıklı) ───

  /**
   * Yeni ders kaydet — ALOHA bir şey öğrendiğinde
   */
  public async addLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'times_applied'>): Promise<string | null> {
    if (!adminDb) return null;
    try {
      // Aynı ders zaten var mı kontrol (duplicate prevention)
      const existing = await adminDb.collection(this.lessonsCol)
        .where('content', '==', lesson.content)
        .limit(1)
        .get();
      
      if (!existing.empty) {
        // Zaten var — times_applied artır
        const docRef = existing.docs[0].ref;
        const current = existing.docs[0].data();
        await docRef.update({ times_applied: (current.times_applied || 0) + 1 });
        return existing.docs[0].id;
      }
      
      const ref = await adminDb.collection(this.lessonsCol).add({
        ...lesson,
        created_at: new Date().toISOString(),
        times_applied: 0,
      });
      return ref.id;
    } catch (e) {
      console.error("[AlohaMemory] Ders kaydedilemedi:", e);
      return null;
    }
  }

  /**
   * Projeye ait dersleri getir — ALOHA görev öncesi hafızasını yükler
   */
  public async getLessonsForProject(project: string, limit: number = 20): Promise<Lesson[]> {
    if (!adminDb) return [];
    try {
      const snap = await adminDb.collection(this.lessonsCol)
        .where('project', 'in', [project, 'global'])
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();
      
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
    } catch (e) {
      console.error("[AlohaMemory] Dersler alınamadı:", e);
      return [];
    }
  }

  /**
   * Kritik ve yüksek öncelikli tüm dersleri getir — system prompt'a enjekte edilir
   */
  public async getCriticalLessons(limit: number = 10): Promise<Lesson[]> {
    if (!adminDb) return [];
    try {
      const snap = await adminDb.collection(this.lessonsCol)
        .where('importance', 'in', ['critical', 'high'])
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get();
      
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
    } catch (e) {
      console.error("[AlohaMemory] Kritik dersler alınamadı:", e);
      return [];
    }
  }

  /**
   * Dersleri insan-okunabilir formata çevir (system prompt için)
   */
  public formatLessonsForPrompt(lessons: Lesson[]): string {
    if (lessons.length === 0) return '';
    
    const lines = [
      '\n## 🧠 ALOHA HAFIZASI (ÖĞRENİLMİŞ DERSLER — ASLA UNUT!):',
    ];
    
    lessons.forEach(l => {
      const icon = l.importance === 'critical' ? '🔴' : l.importance === 'high' ? '🟠' : '🟡';
      lines.push(`${icon} [${l.project}] ${l.content}`);
    });
    
    return lines.join('\n');
  }

  // ─── LEARNING LOOP — Görev sonrası otomatik öğrenme ───

  /**
   * Plan tamamlandığında çağrılır — ne öğrenildi kaydeder
   */
  public async learnFromPlanExecution(
    planGoal: string,
    project: string,
    completedSteps: number, 
    totalSteps: number,
    failedStep?: { title: string; reason: string },
    successfulInsights?: string[]
  ): Promise<void> {
    // Başarılı tamamlama dersi
    if (completedSteps === totalSteps) {
      await this.addLesson({
        type: 'pattern',
        content: `"${planGoal}" görevi ${totalSteps} adımda başarıyla tamamlandı. Bu yaklaşım çalışıyor.`,
        project,
        importance: 'medium',
        tags: ['success', 'pattern'],
        learned_from: planGoal,
      });
    }
    
    // Başarısızlık dersi — EN DEĞERLİ DERS!
    if (failedStep) {
      await this.addLesson({
        type: 'bug_fix',
        content: `"${failedStep.title}" adımı başarısız oldu: ${failedStep.reason}. Bu hatayı tekrarlama!`,
        project,
        importance: 'high',
        tags: ['failure', 'avoid'],
        learned_from: planGoal,
      });
    }
    
    // Spesifik öğrenimler
    if (successfulInsights) {
      for (const insight of successfulInsights) {
        await this.addLesson({
          type: 'lesson',
          content: insight,
          project,
          importance: 'medium',
          tags: ['insight'],
          learned_from: planGoal,
        });
      }
    }
  }
  /**
   * Eski ve düşük önemli memory kayıtlarını temizle
   * 30 günden eski + low/medium importance = silinir
   * Lessons ve critical/high importance = KORUNUR
   */
  public async purgeOldMemory(): Promise<{ deleted: number; kept: number }> {
    if (!adminDb) return { deleted: 0, kept: 0 };
    
    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      
      // Eski memory kayıtlarını sil (aloha_memory — session logs)
      const oldMemory = await adminDb.collection(this.colName)
        .where('timestamp', '<', thirtyDaysAgo)
        .limit(100)
        .get();
      
      let deletedCount = 0;
      const batch = adminDb.batch();
      for (const doc of oldMemory.docs) {
        batch.delete(doc.ref);
        deletedCount++;
      }
      
      if (deletedCount > 0) {
        await batch.commit();
      }
      
      // Eski lessons'ı sil — SADECE low importance olanları
      const oldLessons = await adminDb.collection(this.lessonsCol)
        .where('importance', '==', 'low')
        .limit(50)
        .get();
      
      const lessonBatch = adminDb.batch();
      let lessonDeleted = 0;
      for (const doc of oldLessons.docs) {
        const data = doc.data();
        const createdAt = data.created_at ? new Date(data.created_at).getTime() : 0;
        if (createdAt < thirtyDaysAgo) {
          lessonBatch.delete(doc.ref);
          lessonDeleted++;
        }
      }
      
      if (lessonDeleted > 0) {
        await lessonBatch.commit();
      }
      
      const totalDeleted = deletedCount + lessonDeleted;
      console.log(`[AlohaMemory] Purge: ${totalDeleted} eski kayıt silindi (memory: ${deletedCount}, lessons: ${lessonDeleted})`);
      
      return { deleted: totalDeleted, kept: oldMemory.size - deletedCount + oldLessons.size - lessonDeleted };
    } catch (e) {
      console.error("[AlohaMemory] Purge hatası:", e);
      return { deleted: 0, kept: 0 };
    }
  }

  // ═══════════════════════════════════════════════════
  // AKILLI HAFIZA — Otomatik analiz, dedup, konsolidasyon
  // ═══════════════════════════════════════════════════

  /**
   * Bilgiyi analiz edip önemine göre sakla
   * Sıradan/tekrarlı → low, atılacak
   * Önemli karar/hata/pattern → high/critical, kalıcı
   */
  public async analyzeAndStore(info: {
    content: string;
    project: string;
    context: string; // Hangi işlem sırasında
  }): Promise<{ stored: boolean; importance: string; reason: string }> {
    if (!adminDb) return { stored: false, importance: 'none', reason: 'DB yok' };

    const content = info.content.toLowerCase();
    
    // ─── ÖNEM ANALİZİ ───
    let importance: 'critical' | 'high' | 'medium' | 'low' = 'low';
    let reason = 'Rutin bilgi';
    let type: Lesson['type'] = 'lesson';

    // CRITICAL: Hata, güvenlik, veri kaybı
    if (content.includes('hata') || content.includes('error') || content.includes('fail') || content.includes('crash')) {
      importance = 'critical';
      reason = 'Hata/hata paterni tespit edildi';
      type = 'bug_fix';
    }
    // HIGH: Performans, strateji, büyük karar
    else if (content.includes('başarı') || content.includes('success') || content.includes('strateji') || content.includes('karar') || content.includes('önemli')) {
      importance = 'high';
      reason = 'Stratejik bilgi veya başarılı sonuç';
      type = 'pattern';
    }
    // MEDIUM: İç görü, değişiklik, optimizasyon
    else if (content.includes('optimiz') || content.includes('iyileştir') || content.includes('değiştir') || content.includes('güncelle')) {
      importance = 'medium';
      reason = 'Optimizasyon veya değişiklik bilgisi';
      type = 'optimization';
    }
    // LOW: Rutin log, sıradan bilgi
    else {
      importance = 'low';
      reason = 'Rutin operasyon bilgisi';
    }

    // ─── DEDUP KONTROLÜ ───
    // Benzer içerik son 24 saat içinde var mı?
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
      const existing = await adminDb.collection(this.lessonsCol)
        .where('project', '==', info.project)
        .where('created_at', '>=', oneDayAgo)
        .limit(20)
        .get();

      for (const doc of existing.docs) {
        const existingContent = (doc.data().content || '').toLowerCase();
        // Basit benzerlik: %60 kelime kesişimi
        const existingWords = new Set(existingContent.split(/\s+/));
        const newWords = content.split(/\s+/);
        const overlap = newWords.filter(w => existingWords.has(w)).length;
        const similarity = overlap / Math.max(newWords.length, 1);
        
        if (similarity > 0.6) {
          // Aynı bilgi zaten var — sadece times_applied artır
          await doc.ref.update({ times_applied: (doc.data().times_applied || 0) + 1 });
          return { stored: false, importance, reason: 'Benzer kayıt zaten mevcut — tekrar sayısı artırıldı' };
        }
      }
    } catch { /* dedup hatası — devam et */ }

    // ─── KAYDET ───
    // Low importance ise sadece memory'ye yaz (kısa vadeli)
    if (importance === 'low') {
      await this.addMemory('assistant', info.context, info.content.substring(0, 500));
      return { stored: true, importance, reason: `Kısa vadeli hafızaya kaydedildi: ${reason}` };
    }

    // Medium+ ise lesson'a yaz (uzun vadeli)
    await this.addLesson({
      type,
      content: info.content.substring(0, 2000),
      project: info.project,
      importance,
      tags: [info.project, type],
      learned_from: info.context,
    });

    return { stored: true, importance, reason: `Uzun vadeli hafızaya kaydedildi: ${reason}` };
  }

  /**
   * Hafızayı konsolide et — dağınık bilgileri özetle
   * Her proje için son 30 bilgiyi al, AI'ya özetlet, tek kayıt yap
   */
  public async consolidateInsights(project: string): Promise<{ consolidated: number; summary: string }> {
    if (!adminDb) return { consolidated: 0, summary: '' };

    try {
      // Son 30 medium+ lesson
      const lessons = await adminDb.collection(this.lessonsCol)
        .where('project', '==', project)
        .where('importance', 'in', ['medium', 'high'])
        .orderBy('created_at', 'desc')
        .limit(30)
        .get();

      if (lessons.size < 5) return { consolidated: 0, summary: 'Konsolide etmek için yeterli veri yok' };

      // Özet oluştur — en önemli 5 bilgiyi seç
      const topInsights = lessons.docs
        .map(d => d.data())
        .sort((a, b) => {
          const impOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (impOrder[a.importance] || 3) - (impOrder[b.importance] || 3);
        })
        .slice(0, 5)
        .map((d, i) => `${i+1}. [${d.importance}] ${(d.content || '').substring(0, 100)}`)
        .join('\n');

      const summary = `[${project}] ${lessons.size} hafıza kaydı konsolide edildi. En önemli 5:\n${topInsights}`;

      // Konsolide insider olarak kaydet
      await this.addLesson({
        type: 'pattern',
        content: summary,
        project,
        importance: 'high',
        tags: [project, 'consolidated', 'insight'],
        learned_from: 'memory_consolidation',
      });

      console.log(`[AlohaMemory] Konsolidasyon: ${project} — ${lessons.size} kayıttan özet oluşturuldu`);
      return { consolidated: lessons.size, summary };
    } catch (e) {
      console.error("[AlohaMemory] Konsolidasyon hatası:", e);
      return { consolidated: 0, summary: '' };
    }
  }
}

export const alohaMemory = new AlohaMemory();

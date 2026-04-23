import { alohaAI } from '@/core/aloha/aiClient';
import { adminDb } from '@/lib/firebase-admin';

export interface ArchivalTask {
  node: string;
  collection: string;
  olderThanDays: number;
}

export class ArchivistAgent {
  private aiClient: any;

  constructor() {
    this.aiClient = alohaAI.getClient();
  }

  /**
   * Runs the archival process. Never deletes data.
   * Compresses old news or events and moves them to an `_archive` collection for SEO/Index.
   */
  async runArchival(task: ArchivalTask): Promise<{ archivedCount: number, status: string }> {
    if (!adminDb) return { archivedCount: 0, status: "No DB" };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - task.olderThanDays);

      const ref = adminDb.collection(task.collection);
      // Simplified query for demonstration. In production, requires composite index.
      const snapshot = await ref.where('createdAt', '<', cutoffDate.toISOString()).limit(50).get();

      if (snapshot.empty) {
        return { archivedCount: 0, status: "No items to archive" };
      }

      let count = 0;
      const batch = adminDb.batch();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Summarize long content using AI to save space in the hot archive
        let summary = data.content;
        if (data.content && data.content.length > 1000) {
          const prompt = `Lütfen şu B2B metnini SEO uyumlu, arşivlik 3 cümlelik bir özete çevir (Asla bilgi kaybetme, sadece sıkıştır):\n${data.content}`;
          try {
             // Using the Singleton Aloha AI Client
             summary = await alohaAI.generate(prompt, { temperature: 0.2 }, 'ArchivistAgent');
          } catch (e) {
             // fallback to original if AI fails
             summary = data.content.substring(0, 500) + "...";
          }
        }

        const archivedData = {
          ...data,
          archivedAt: new Date().toISOString(),
          originalId: doc.id,
          compressedSummary: summary,
          status: 'archived'
        };

        // 1. Move to Archive Collection
        const archiveRef = adminDb.collection(`${task.collection}_archive`).doc(doc.id);
        batch.set(archiveRef, archivedData);

        // 2. We do NOT delete the original per "Sovereign Expansion Policy: Asla Silme".
        // Instead, we just mark it as "archived_hidden" so the main queries skip it, 
        // but it still exists in the original collection.
        batch.update(doc.ref, { status: 'archived_hidden' });
        
        count++;
      }

      await batch.commit();

      return {
        archivedCount: count,
        status: `Successfully archived ${count} items from ${task.collection}`
      };

    } catch (error: any) {
      console.error("[ArchivistAgent] Error during archival:", error);
      throw error;
    }
  }
}

export const archivistAgent = new ArchivistAgent();

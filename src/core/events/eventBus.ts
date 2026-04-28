import { aipyramEvent, EventCallback, EventType } from './eventTypes';

// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE EventBus — Upstash/Redis TAMAMEN KALDIRILDI
// Anayasa: Sadece Google altyapısı (Firebase/Firestore).
// In-memory pub/sub + Firestore persistence (fallback).
// ═══════════════════════════════════════════════════

class aipyramEventBus {
  private listeners: Map<EventType, EventCallback[]> = new Map();

  constructor() {
    console.log('[🧠 aipyram EventBus] Google-Native v10.0 — Firestore + In-Memory.');
  }

  public subscribe(eventType: EventType, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
    console.log(`[📡 EventBus Subscribe] Ajan kanalı dinliyor: '${eventType}'`);
  }

  /**
   * Event yayınla — önce local callback'ler, sonra Firestore'a kaydet.
   */
  public async emit(event: aipyramEvent) {
    if (!event.id) event.id = crypto.randomUUID();
    if (!event.node_id) event.node_id = "master-nexus";
    event.timestamp = event.timestamp || Date.now();
    
    console.log(`[🔥 EventBus EMIT] Sinyal: ${event.type} | Node: ${event.node_id} | ID: ${event.id}`);
    
    // 1. Local Sync Execution (In-Memory)
    this.executeLocally(event);

    // 2. Firestore Persistence (Google-Native kalıcı kayıt)
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb.collection("event_signals").add({
        event_id: event.id,
        type: event.type,
        source: event.source,
        node_id: event.node_id,
        payload: JSON.stringify(event.payload || {}),
        createdAt: Date.now(),
      });
    } catch(e) {
      // Firestore yazılamazsa sessizce geç — in-memory zaten çalıştı
    }
  }

  private executeLocally(event: aipyramEvent) {
    const callbacks = this.listeners.get(event.type);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(cb => {
         try {
           cb(event);
         } catch (e) {
           console.error(`[Local Execution Error] ${event.type}:`, e);
         }
      });
    }
  }

  /**
   * Distributed Lock — Firestore transaction ile
   */
  public async acquireLock(resourceId: string, ttlMs: number = 5000): Promise<boolean> {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      const lockRef = adminDb.collection("system_locks").doc(resourceId);
      
      const result = await adminDb.runTransaction(async (tx) => {
        const doc = await tx.get(lockRef);
        if (doc.exists) {
          const data = doc.data();
          // TTL süresi dolmuşsa kilidi yeniden al
          if (data?.expiresAt && Date.now() > data.expiresAt) {
            tx.set(lockRef, { locked: true, expiresAt: Date.now() + ttlMs, createdAt: Date.now() });
            return true;
          }
          return false; // Kilit aktif
        }
        tx.set(lockRef, { locked: true, expiresAt: Date.now() + ttlMs, createdAt: Date.now() });
        return true;
      });
      
      return result;
    } catch (e) {
      return true; // Firestore yoksa geç — deadlock'u önle
    }
  }

  public async releaseLock(resourceId: string): Promise<void> {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb.collection("system_locks").doc(resourceId).delete();
    } catch(e) {}
  }
}

const globalForEventBus = global as unknown as { eventBus: aipyramEventBus };
export const EventBus = globalForEventBus.eventBus || new aipyramEventBus();
if (process.env.NODE_ENV !== 'production') {
  globalForEventBus.eventBus = EventBus;
}

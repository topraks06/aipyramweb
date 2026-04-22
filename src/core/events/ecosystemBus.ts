import { EcosystemSignal, EcosystemSignalType, SignalSubscription } from './signalTypes';

// ═══════════════════════════════════════════════════
// AIPYRAM Ecosystem Bus — Cross-Tenant Event Communication
// Google-Native (Firestore + In-Memory)
// ═══════════════════════════════════════════════════

class AIPyramEcosystemBus {
  private subscribers: Map<EcosystemSignalType, SignalSubscription[]> = new Map();

  constructor() {
    console.log('[🧠 EcosystemBus] Google-Native v1.0 — Firestore + In-Memory Başlatıldı.');
  }

  public subscribe(tenant: string, signalTypes: EcosystemSignalType[], handler: (signal: EcosystemSignal) => Promise<void>) {
    for (const type of signalTypes) {
      if (!this.subscribers.has(type)) {
        this.subscribers.set(type, []);
      }
      this.subscribers.get(type)?.push({ tenant, signalTypes, handler });
      console.log(`[📡 EcosystemBus Subscribe] Tenant '${tenant}' dinliyor: '${type}'`);
    }
  }

  /**
   * Sinyal yayınla — in-memory tetikle + Firestore kaydet
   */
  public async emit(signal: EcosystemSignal) {
    if (!signal.id) signal.id = crypto.randomUUID();
    signal.timestamp = signal.timestamp || new Date().toISOString();
    signal.processed = false;

    console.log(`[🔥 EcosystemBus EMIT] Type: ${signal.type} | Source: ${signal.source_tenant} | Target: ${signal.target_tenant} | ID: ${signal.id}`);

    // 1. Local execution
    this.executeLocally(signal);

    // 2. Firestore persistence
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      if (adminDb) {
        await adminDb.collection("ecosystem_signals").add({
          id: signal.id,
          type: signal.type,
          source_tenant: signal.source_tenant,
          target_tenant: signal.target_tenant,
          payload: JSON.stringify(signal.payload || {}),
          priority: signal.priority,
          timestamp: signal.timestamp,
          processed: true, // we processed it locally, so set to true in DB for tracking
          createdAt: Date.now(),
        });
      } else {
        console.warn('[EcosystemBus] Firestore adminDb null, sinyal loglanmadı');
      }
    } catch (e) {
      console.error('[EcosystemBus] Firestore yazma hatası:', e);
    }
  }

  private async executeLocally(signal: EcosystemSignal) {
    const subs = this.subscribers.get(signal.type);
    if (subs && subs.length > 0) {
      for (const sub of subs) {
        // Hedef tenant kontrolü ('all' ise herkese, yoksa sadece hedefe VEYA hedeflenmiş bir gruba)
        if (signal.target_tenant === 'all' || signal.target_tenant === sub.tenant) {
          try {
            await sub.handler(signal);
          } catch (e) {
            console.error(`[EcosystemBus] Local Execution Error for tenant ${sub.tenant} on signal ${signal.type}:`, e);
          }
        }
      }
    }
  }

  public async getRecentSignals(tenant: string, limitCount: number = 20): Promise<EcosystemSignal[]> {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      if (!adminDb) return [];
      
      let query = adminDb.collection("ecosystem_signals")
        .orderBy("createdAt", "desc")
        .limit(limitCount);
        
      if (tenant !== 'master' && tenant !== 'all') {
        // Bu sorgu Firestore index gerektirebilir, dikkatli kullanılmalı
        query = query.where("target_tenant", "in", [tenant, "all"]);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          type: data.type as EcosystemSignalType,
          source_tenant: data.source_tenant as EcosystemSignal['source_tenant'],
          target_tenant: data.target_tenant as EcosystemSignal['target_tenant'],
          payload: JSON.parse(data.payload || '{}'),
          priority: data.priority as EcosystemSignal['priority'],
          timestamp: data.timestamp,
          processed: data.processed
        };
      });
    } catch (e) {
      console.error('[EcosystemBus] getRecentSignals hatası:', e);
      return [];
    }
  }
}

const globalForEcosystemBus = global as unknown as { ecosystemBus: AIPyramEcosystemBus };
export const ecosystemBus = globalForEcosystemBus.ecosystemBus || new AIPyramEcosystemBus();
if (process.env.NODE_ENV !== 'production') {
  globalForEcosystemBus.ecosystemBus = ecosystemBus;
}

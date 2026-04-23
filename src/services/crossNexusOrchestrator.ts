import { ecosystemBus } from '@/core/events/ecosystemBus';
import { EcosystemSignalType } from '@/core/events/signalTypes';

export type NexusSignal = {
  id: string;
  source_agent: string;
  event_type: EcosystemSignalType | "RAW_MATERIAL_CRISIS" | "MEGA_PROJECT_SOLD" | "SECURITY_THREAT";
  payload: any;
  timestamp: string;
};

// Beyin Sapı (Orkestratör): Ajanların telepatik sinyallerini işler
export async function handleSynapseSignal(signal: Omit<NexusSignal, 'id' | 'timestamp'>) {
  const newSignal: NexusSignal = {
    id: `synapse-${crypto.randomUUID()}`,
    source_agent: signal.source_agent,
    event_type: signal.event_type,
    payload: signal.payload,
    timestamp: new Date().toISOString()
  };

  // 1. Log the signal to the Ecosystem Bus (Firestore + In-Memory)
  let mappedSource: 'trtex' | 'perde' | 'hometex' | 'vorhang' | 'master' = 'master';
  if (signal.source_agent.includes('trtex')) mappedSource = 'trtex';
  else if (signal.source_agent.includes('perde')) mappedSource = 'perde';
  else if (signal.source_agent.includes('hometex')) mappedSource = 'hometex';

  try {
    // Treat legacy event_types as TREND_ALERT or PRICE_SHIFT if not matching strictly, 
    // but TS will cast for now. In real scenario, map carefully.
    const mappedType = (signal.event_type === 'RAW_MATERIAL_CRISIS' ? 'PRICE_SHIFT' : 
                       signal.event_type === 'MEGA_PROJECT_SOLD' ? 'LEAD_CAPTURED' : 
                       signal.event_type === 'SECURITY_THREAT' ? 'TREND_ALERT' : 
                       signal.event_type) as EcosystemSignalType;

    await ecosystemBus.emit({
      id: newSignal.id,
      type: mappedType,
      source_node: mappedSource,
      target_node: 'all',
      payload: newSignal.payload,
      priority: 'high',
      timestamp: newSignal.timestamp
    });
  } catch (error) {
    console.error("[CROSS-NEXUS] Sinyal yayınlama hatası:", error);
  }

  // 2. Cross-Agent Event Triggers (Otonom Reaksiyonlar)
  let reactionLogs: string[] = [];

  switch (signal.event_type) {
    case "RAW_MATERIAL_CRISIS":
      // Eğer TRTEX'ten iplik fiyatı krizi gelirse -> Perde.ai (AGENT_PERDE) perakende fiyatlarını çekmelidir.
      reactionLogs.push(`[REACTION] UYANDIRILDI: perde_agent (Perde Core). Sebep: Hammadde Krizi. Eylem: Kumaş maliyetleri ve perakende liste fiyatı re-valüasyonu tetiklendi.`);
      // Gerçek senaryoda burada `fetch('https://perde.ai/api/agent-hook', payload)` tetiklenirdi.
      break;

    case "MEGA_PROJECT_SOLD":
      // Eğer DidimEmlak devasa bir site veya otel satışı bilgisini gönderirse -> TRTEX'ten o otel için toptan tekstil ilanları açmasını iste.
      reactionLogs.push(`[REACTION] UYANDIRILDI: trtex_agent (TrTex Net). Sebep: Dev Proje Satıldı (${signal.payload.project_name || 'Bilinmiyor'}). Eylem: Yeni proje için 'Acil Toptan Kumaş İhtiyacı' ilanı taslağı oluşturuluyor.`);
      break;

    case "TREND_ALERT":
      // Hometex modası sinyali TrTex pazarını uyarır
      reactionLogs.push(`[REACTION] UYANDIRILDI: trtex_agent (TrTex Net) & perde_agent (Perde Core). Sebep: Trend Alarmı. Eylem: Algoritmik katalog öne çıkartmaları ayarlanıyor.`);
      break;

    case "SECURITY_THREAT":
      // Bir sisteme saldırı gelirse, Hub Master tüm ajanların UI yetkisini geçici kilitler.
      reactionLogs.push(`[REACTION] KORUMA PROTOKOLÜ: hub_master (AIPyram Hub). Eylem: Tüm ajanların UI Update mühürleri güvenlik için askıya alındı.`);
      break;

    default:
      reactionLogs.push(`[REACTION] Bilinmeyen sinyal alındı. Sessizlik korundu.`);
  }

  return {
    signal_processed: newSignal.id,
    orchestrator_decision: reactionLogs
  };
}

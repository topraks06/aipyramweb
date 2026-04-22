// ═══════════════════════════════════════════════════════════════
// AIPYRAM Master Brain — Core Event (Sinyal) Türleri V2.0
// Revenue-First + Cost Control + Trust Layer
// ═══════════════════════════════════════════════════════════════

export type EventType =
  // Existing signals
  | 'NEW_TREND_DETECTED'
  | 'NEW_PRODUCT_CREATED'
  | 'NEW_COLLECTION_ADDED'
  | 'MARKET_DATA_CHANGED'
  | 'FORCE_RECALCULATE'
  | 'AGENT_IDEA_PROPOSAL'
  | 'INFRASTRUCTURE_REQUEST'
  | 'APOLLON_FINANCIAL_VETO'
  // Cross-domain communication
  | 'CROSS_NEXUS_SIGNAL'
  // 💰 Revenue Engine Events (FAZ 1 & 4.1 A2A)
  | 'RFQ_SUBMITTED'            // A2A Pipeline Tetikleyici İlksel Sinyal
  | 'RFQ_CREATED'              // Yeni alım talebi geldi
  | 'RFQ_MATCHED'              // Tedarikçi eşleşmesi bulundu
  | 'SUPPLIER_MATCHED'         // A2A Pipeline: Fabrika eşleşti, sonraki adım bekleniyor
  | 'DEAL_READY'               // A2A Pipeline: Tam Otonom anlaşma onay bekliyor
  | 'RFQ_EXPIRED'              // Talep süresi doldu
  | 'DEAL_INITIATED'           // Anlaşma başlatıldı
  | 'DEAL_COMPLETED'           // Anlaşma tamamlandı
  | 'VORHANG_ORDER_PAID'       // Vorhang.ai ihracat siparişi ödendi
  | 'DEAL_FAILED'              // Anlaşma İptal Edildi (Negative Learning Signal)
  | 'QUOTATION_REJECTED'       // Teklif Reddedildi (Negative Learning Signal)
  | 'COMMISSION_EARNED'        // Komisyon kazanıldı
  // 🛡️ Trust Layer Events (FAZ 2)
  | 'TRUST_SCORE_UPDATED'      // Güven puanı güncellendi
  | 'SUPPLIER_VERIFIED'        // Tedarikçi onaylandı
  | 'SUPPLIER_FLAGGED'         // Tedarikçi kırmızı bayrak aldı
  | 'CERTIFICATE_EXPIRED'      // Sertifika süresi doldu
  // ⚠️ Cost Control Events
  | 'BUDGET_WARNING'           // Bütçe limiti yaklaşıyor
  | 'BUDGET_EXCEEDED'          // Bütçe aşıldı — kill switch
  | 'AGENT_KILL_SWITCH'        // Ajan acil durdurma
  // 📝 HITL Events
  | 'APPROVAL_REQUIRED'        // İnsan onayı gerekli ($10K+)
  | 'APPROVAL_GRANTED'         // Onay verildi
  | 'APPROVAL_REJECTED'        // Onay reddedildi
  // ⚙️ Execution Engine Events (FAZ 10/11)
  | 'TASK_FINISHED'
  | 'TASK_FAILED'
  | 'GCS_UPLOAD'
  | 'SYSTEM_HEALTH_CHECK';

export type EventSource =
  | 'trtex' | 'perde' | 'hometex' | 'didimemlak'
  | 'master_cron' | 'command_tower' | 'cloud_worker'
  | 'apollon_overseer'
  | 'matchmaker' | 'polyglot' | 'trendsetter'
  | 'auditor' | 'virtual_rep' | 'domain_master'
  | string;  // Dinamik agent ID'ler için

export interface AIPyramEvent {
  id?: string;              // UUID for Idempotency (Auto-injected by Bus if missing)
  tenant_id?: string;       // Mutli-tenant B2B isolation (Auto-injected by Bus if missing)
  type: EventType;
  source: EventSource;
  payload: any;
  timestamp?: number;
  costUSD?: number;        // Maliyet takibi
  agentRole?: string;      // Hangi ajan tetikledi
}

export type EventCallback = (event: AIPyramEvent) => void;

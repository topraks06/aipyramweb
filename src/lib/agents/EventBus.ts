import { EventEmitter } from 'events';

// Ajanların kendi aralarında haberleşmesini sağlayan Merkezi İletişim Veriyolu
class AgentEventBus extends EventEmitter {}

export const swarmBus = new AgentEventBus();

// Sistemdeki tüm otonom olayların (Event) tanımları
export const SwarmEvents = {
  TREND_DISCOVERED: 'TREND_DISCOVERED',     // Trendsetter yeni bir trend bulduğunda
  NEW_PRODUCT_ADDED: 'NEW_PRODUCT_ADDED',   // Sisteme yeni bir ürün eklendiğinde
  RFQ_CREATED: 'RFQ_CREATED',               // Alıcı yeni bir talep oluşturduğunda
  MATCHES_FOUND: 'MATCHES_FOUND',           // Matchmaker uygun tedarikçileri bulduğunda
  VISITOR_ACTION: 'VISITOR_ACTION',         // Bir ziyaretçi standda işlem yaptığında
  CERTIFICATE_UPLOADED: 'CERTIFICATE_UPLOADED', // Tedarikçi yeni sertifika yüklediğinde
  // ── YENİ (Sovereign Agent Sinyalleri) ──
  RENDER_COMPLETED: 'RENDER_COMPLETED',
  ORDER_CREATED: 'ORDER_CREATED',
  DOCUMENT_GENERATED: 'DOCUMENT_GENERATED',
  WHATSAPP_SENT: 'WHATSAPP_SENT',
  FABRIC_ANALYZED: 'FABRIC_ANALYZED',
  AGENT_INVOKED: 'AGENT_INVOKED',
  QUOTE_ABANDONED: 'QUOTE_ABANDONED',
  CREDIT_LOW: 'CREDIT_LOW',
};

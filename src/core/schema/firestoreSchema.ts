// ═══════════════════════════════════════════════════════════════
// aipyram FIRESTORE SCHEMA — B2B Revenue Engine Collections
// ═══════════════════════════════════════════════════════════════
//
// Bu dosya Firestore'daki koleksiyonların yapısını belgeliyor.
// Firestore schema-less olduğu için bu dosya referans/doküman niteliğindedir.
//
// ═══════════════════════════════════════════════════════════════

/**
 * COLLECTION: rfqs
 * Gelen alım talepleri (Request for Quotation)
 */
export interface FirestoreRFQ {
  id: string;
  node_id: string;            // Multi-domain support ("trtex", "hometex", "perde.ai")
  buyerRegion: string;          // "DACH", "Nordics", "Middle-East", "North-America" vb.
  buyerType: string;            // "Hotel Chain", "Retailer", "Wholesaler", "Boutique"
  product: string;              // "Sheer curtain fabric, 280cm width"
  quantity: string;             // "100,000 meters"
  requirements: string[];       // ["OEKO-TEX Standard 100", "Trevira CS", "Fire-retardant"]
  urgency: "High" | "Medium" | "Low";
  targetPrice?: string;         // "$3.50/meter"
  leadScore: number;            // 0-100 (Lead kalitesi)
  buyerIntent: "TEST" | "LOW_INTENT" | "HIGH_INTENT" | "VERIFIED";
  status: "open" | "matched" | "in_progress" | "completed" | "expired";
  createdAt: number;            // Unix timestamp
  expiresAt?: number;           // Unix timestamp
  matchedSupplierIds?: string[];
}

/**
 * COLLECTION: suppliers
 * Kayıtlı tedarikçiler
 */
export interface FirestoreSupplier {
  id: string;
  node_id: string;
  companyName: string;
  region: string;               // "Turkey", "Germany", "China"
  products: string[];           // ["Curtain fabrics", "Upholstery", "Bedding"]
  certifications: string[];     // ["OEKO-TEX", "ISO 9001", "GOTS"]
  moq: string;                  // "5,000 meters"
  leadTime: string;             // "3-4 weeks"
  trustScore: number;           // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  contactEmail?: string;
  yearsInBusiness: number;
  totalDeals: number;
  successRate: number;          // 0-100 (%)
  createdAt: number;
  lastAuditAt?: number;
}

/**
 * COLLECTION: matches
 * RFQ-Tedarikçi eşleşme kayıtları
 */
export interface FirestoreMatch {
  id: string;
  node_id: string;
  rfqId: string;
  supplierId: string;
  matchScore: number;           // 0-100
  reasons: string[];            // Neden eşleştirildiği
  estimatedPrice?: string;
  deliveryEstimate?: string;
  status: "proposed" | "accepted" | "rejected" | "expired";
  commissionRate?: number;      // 0.01 - 0.05 (1%-5%)
  dealValueUSD?: number;
  commissionUSD?: number;
  requiresApproval: boolean;    // HITL: $10K+ ise true
  createdAt: number;
}

/**
 * COLLECTION: deals
 * Aktif ticari anlaşmalar
 */
export interface FirestoreDeal {
  id: string;
  node_id: string;
  rfqId: string;
  matchId: string;
  buyerId: string;
  supplierId: string;
  status: "negotiation" | "agreement" | "payment_pending" | "in_production" | "shipped" | "delivered" | "completed" | "disputed";
  totalValueUSD: number;
  commissionUSD: number;
  createdAt: number;
  completedAt?: number;
  milestones: DealMilestone[];
}

export interface DealMilestone {
  name: string;                 // "Agreement Signed", "50% Payment", "Production Started" vb.
  status: "pending" | "completed";
  completedAt?: number;
}

/**
 * COLLECTION: trust_scores
 * Tedarikçi güven puanı geçmişi
 */
export interface FirestoreTrustRecord {
  id: string;
  node_id: string;
  supplierId: string;
  score: number;
  explanation: string;          // Explainable Trust Score (Neden 72?)
  riskLevel: string;
  certificationStatus: Array<{
    name: string;
    status: "VALID" | "EXPIRED" | "SUSPICIOUS" | "NOT_FOUND";
  }>;
  auditedBy: "AUDITOR_AGENT" | "MANUAL";
  createdAt: number;
}

/**
 * COLLECTION: agent_logs
 * Ajan maliyet, metrik ve detaylı log takibi (Observability)
 */
export interface FirestoreAgentLog {
  id: string;
  node_id: string;
  agentRole: string;
  taskType: string;
  tokensUsed: number;
  costUSD: number;
  durationMs: number;
  success: boolean;
  createdAt: number;
}

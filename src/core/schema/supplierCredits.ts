export interface SupplierCreditBalance {
  id: string; // genelde supplierId ile aynıdır
  node_id: string;
  supplierId: string;
  balanceTokens: number; // Örn: 1 Token = 1 Lead Reveal
  lifetimeTokensPurchased: number;
  lastPurchaseAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SupplierCreditTransaction {
  id: string;
  node_id: string;
  supplierId: string;
  amount: number;       // +10 (satın alma) veya -1 (lead açma)
  type: "PURCHASE" | "SPEND" | "REFUND" | "BONUS";
  description: string;  // Örn: "$49 için 10 token yüklendi" veya "RFQ-1234 açıldı"
  stripeSessionId?: string;
  createdAt: number;
}

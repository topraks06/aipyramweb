/**
 * @aipyram/shared-types — Sovereign Ecosystem Types
 * 
 * Tüm proje genelinde kullanılacak TypeScript arayüzleri.
 */

// ═══════════════════════════════════════
// SOVEREIGN NODE
// ═══════════════════════════════════════

export type SovereignNodeId = 'trtex' | 'perde' | 'hometex' | 'vorhang';

// ═══════════════════════════════════════
// WALLET & ECONOMY
// ═══════════════════════════════════════

export interface WalletEntry {
  balance: number;
  totalSpent: number;
  lastAction?: string;
  lastActionAt?: string;
  lastCreditAt?: string;
  node: SovereignNodeId;
  createdAt: string;
}

// ═══════════════════════════════════════
// AGENT LOGGING
// ═══════════════════════════════════════

export interface AgentLog {
  node: SovereignNodeId;
  action: string;
  uid: string;
  payload: Record<string, any>;
  result: Record<string, any>;
  duration_ms: number;
  cost: number;
  success: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════
// COMMERCE CORE (Perde, Vorhang, Hometex)
// ═══════════════════════════════════════

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  node: SovereignNodeId;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    metadata?: Record<string, any>;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  node: SovereignNodeId;
  title: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  inventory: number;
  images: string[];
  attributes: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  node: SovereignNodeId;
  email: string;
  displayName: string;
  phone?: string;
  companyName?: string;
  billingAddress?: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

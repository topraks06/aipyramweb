/**
 * AIPyram Sovereign Tenant Configuration
 * 
 * TEK KAYNAK (SSoT) — Tüm tenant bilgileri buradan okunur.
 * ALOHA, auth, middleware, UI hepsi bu config'i kullanır.
 * 
 * Yeni tenant eklemek = bu dosyaya 1 obje eklemek.
 */

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type TenantId = 'trtex' | 'perde' | 'hometex' | 'vorhang';
export type UserRole = 'admin' | 'editor' | 'member' | 'viewer';

export interface TenantFeatures {
  b2b: boolean;          // B2B ERP paneli
  catalog: boolean;      // Ürün kataloğu
  news: boolean;         // Haber/makale sistemi
  autonomous: boolean;   // Otonom içerik pipeline (core/aloha)
  visualizer: boolean;   // AI tasarım motoru
  expo: boolean;         // Sanal fuar
  magazine: boolean;     // Dijital dergi
  salesEngine: boolean;  // Satış/teklif motoru
  // ── YENİ AJAN FLAGLERİ ──
  whatsapp: boolean;       // WhatsApp bildirim ajanı
  documents: boolean;      // PDF/Proforma ajan
  fabricAnalysis: boolean; // Kumaş tanıma ajanı
  retention: boolean;      // CRM sadakat ajanı
}

export interface TenantNavLink {
  name: string;
  href: string;
  gated: boolean;       // Lisanslı üyelere özel mi?
  requiredRole?: UserRole;
}

export interface TenantConfig {
  id: TenantId;
  domain: string;
  name: string;
  shortName: string;
  memberCollection: string;
  newsCollection: string;
  projectCollection: string;  // Her tenant'ın sipariş/proje koleksiyonu
  walletCollection: string;   // Kredi/cüzdan koleksiyonu
  theme: 'dark' | 'light';
  locale: string;
  features: TenantFeatures;
  publicNavLinks: TenantNavLink[];
  privateNavLinks: TenantNavLink[];
  roles: UserRole[];
}

// ═══════════════════════════════════════════════════
// TENANT REGISTRY
// ═══════════════════════════════════════════════════

export const TENANTS: Record<TenantId, TenantConfig> = {

  // ─── TRTEX ───────────────────────────────────────
  // CANLI - OTONOM - DOKUNMA
  trtex: {
    id: 'trtex',
    domain: 'trtex.com',
    name: 'TRTEX Intelligence Terminal',
    shortName: 'TRTEX',
    memberCollection: 'trtex_members',
    newsCollection: 'trtex_news',
    projectCollection: 'trtex_leads',
    walletCollection: 'trtex_wallets',
    theme: 'dark',
    locale: 'tr',
    features: {
      b2b: false,
      catalog: false,
      news: true,
      autonomous: true,    // core/aloha pipeline AKTİF
      visualizer: false,
      expo: false,
      magazine: false,
      salesEngine: false,
      whatsapp: false,
      documents: false,
      fabricAnalysis: false,
      retention: false,
    },
    publicNavLinks: [
      { name: 'Haberler', href: '/news', gated: false },
      { name: 'İhaleler', href: '/tenders', gated: false },
      { name: 'Akademi', href: '/academy', gated: false },
    ],
    privateNavLinks: [],
    roles: ['admin', 'member'],
  },

  // ─── PERDE.AI ────────────────────────────────────
  // AUTH HAZIR - DEPLOY BEKLİYOR
  perde: {
    id: 'perde',
    domain: 'perde.ai',
    name: 'Perde.AI B2B Ecosystem',
    shortName: 'PERDE.AI',
    memberCollection: 'perde_members',
    newsCollection: 'perde_news',
    projectCollection: 'projects',
    walletCollection: 'wallets',
    theme: 'light',
    locale: 'tr',
    features: {
      b2b: true,
      catalog: true,
      news: false,
      autonomous: false,
      visualizer: true,
      expo: false,
      magazine: false,
      salesEngine: false,
      whatsapp: true,
      documents: true,
      fabricAnalysis: true,
      retention: true,
    },
    publicNavLinks: [
      { name: 'Kurumsal Üyelik', href: '/pricing', gated: false },
      { name: 'İletişim', href: '/contact', gated: false },
    ],
    privateNavLinks: [
      { name: 'Tasarım Stüdyosu', href: '/visualizer', gated: true },
      { name: 'B2B ERP', href: '/b2b', gated: true },
      { name: 'Katalog Stoku', href: '/catalog', gated: true },
      { name: 'Ekosistem Sinyali', href: '/ecosystem', gated: true },
    ],
    roles: ['admin', 'editor', 'member'],
  },

  // ─── HOMETEX.AI ──────────────────────────────────
  // İSKELET AŞAMASI
  hometex: {
    id: 'hometex',
    domain: 'hometex.ai',
    name: 'Hometex AI Trade Intelligence',
    shortName: 'HOMETEX',
    memberCollection: 'hometex_members',
    newsCollection: 'hometex_news',
    projectCollection: 'hometex_orders',
    walletCollection: 'hometex_wallets',
    theme: 'dark',
    locale: 'tr',
    features: {
      b2b: true,
      catalog: false,
      news: true,
      autonomous: false,
      visualizer: false,
      expo: true,
      magazine: true,
      salesEngine: false,
      whatsapp: true,
      documents: true,
      fabricAnalysis: false,
      retention: true,
    },
    publicNavLinks: [
      { name: 'Sanal Fuar', href: '/expo', gated: false },
      { name: 'Dergi', href: '/magazine', gated: false },
    ],
    privateNavLinks: [
      { name: 'B2B Toptan', href: '/b2b', gated: true },
    ],
    roles: ['admin', 'editor', 'member'],
  },

  // ─── VORHANG.AI ──────────────────────────────────
  // GELECEK - TAK-ÇALIŞTIR HAZIRLIĞI
  vorhang: {
    id: 'vorhang',
    domain: 'vorhang.ai',
    name: 'Vorhang AI Katalog & Satış',
    shortName: 'VORHANG',
    memberCollection: 'vorhang_members',
    newsCollection: 'vorhang_news',
    projectCollection: 'vorhang_orders',
    walletCollection: 'vorhang_wallets',
    theme: 'dark',
    locale: 'de',
    features: {
      b2b: true,
      catalog: true,
      news: false,
      autonomous: false,
      visualizer: false,
      expo: false,
      magazine: false,
      salesEngine: true,
      whatsapp: true,
      documents: true,
      fabricAnalysis: false,
      retention: true,
    },
    publicNavLinks: [
      { name: 'Katalog', href: '/catalog', gated: false },
    ],
    privateNavLinks: [
      { name: 'Bestellung', href: '/orders', gated: true },
    ],
    roles: ['admin', 'member'],
  },
};

// ═══════════════════════════════════════════════════
// RESOLVER — Hostname'den tenant çöz
// ═══════════════════════════════════════════════════

/**
 * Hostname → TenantConfig
 * Middleware, ALOHA, auth hepsi aynı kaynaktan beslenir.
 * 20 domain olsa bile if/else cehennemi yok.
 */
export function resolveTenantFromHost(host: string): TenantConfig {
  const cleanHost = host.split(':')[0].toLowerCase();
  const match = Object.values(TENANTS).find(t => cleanHost.includes(t.domain.split('.')[0]));
  return match || TENANTS.trtex;  // fallback: TRTEX
}

/**
 * Tenant ID → TenantConfig
 */
export function getTenant(id: string): TenantConfig {
  const normalized = id.toLowerCase().replace('.ai', '').replace('.com', '');
  return TENANTS[normalized as TenantId] || TENANTS.trtex;
}

/**
 * Domain string → TenantConfig  
 * page.tsx'deki [domain] parametresinden çözümler
 */
export function resolveTenantFromDomain(domain: string): TenantConfig {
  const decoded = decodeURIComponent(domain).split(':')[0].toLowerCase();
  const match = Object.values(TENANTS).find(t => decoded.includes(t.domain.split('.')[0]));
  return match || TENANTS.trtex;
}

/**
 * Tüm aktif tenant ID'leri
 */
export function getAllTenantIds(): TenantId[] {
  return Object.keys(TENANTS) as TenantId[];
}

/**
 * Feature flag kontrolü — ALOHA tools bunu kullanır
 */
export function tenantHasFeature(tenantId: string, feature: keyof TenantFeatures): boolean {
  const tenant = getTenant(tenantId);
  return tenant.features[feature] || false;
}

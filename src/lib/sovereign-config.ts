/**
 * AIPyram Sovereign node Configuration
 * 
 * TEK KAYNAK (SSoT) — Tüm node bilgileri buradan okunur.
 * ALOHA, auth, middleware, UI hepsi bu config'i kullanır.
 * 
 * Yeni node eklemek = bu dosyaya 1 obje eklemek.
 */

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type SovereignNodeId = 'trtex' | 'perde' | 'hometex' | 'vorhang' | 'shtori' | 'parda' | 'donoithat' | 'perabot' | 'heimtex';
export type UserRole = 'admin' | 'editor' | 'member' | 'viewer';

export interface SovereignNodeFeatures {
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

export interface SovereignNavLink {
  name: string;
  href: string;
  gated: boolean;       // Lisanslı üyelere özel mi?
  requiredRole?: UserRole;
}

export interface SovereignNodeConfig {
  id: SovereignNodeId;
  domain: string;
  name: string;
  shortName: string;
  memberCollection: string;
  newsCollection: string;
  projectCollection: string;  // Her node'ın sipariş/proje koleksiyonu
  walletCollection: string;   // Kredi/cüzdan koleksiyonu
  customerCollection?: string; // Müşteri CRM koleksiyonu (Sovereign)
  productCollection?: string;  // Ürün/Katalog koleksiyonu (Sovereign)
  renderCollection?: string;   // AI Render geçmişi (Sovereign)
  theme: 'dark' | 'light';
  locale: string;
  features: SovereignNodeFeatures;
  publicNavLinks: SovereignNavLink[];
  privateNavLinks: SovereignNavLink[];
  roles: UserRole[];
}

// ═══════════════════════════════════════════════════
// node REGISTRY
// ═══════════════════════════════════════════════════

export const SOVEREIGN_NODES: Record<SovereignNodeId, SovereignNodeConfig> = {

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
    projectCollection: 'perde_orders',
    walletCollection: 'perde_wallets',
    customerCollection: 'perde_customers',
    productCollection: 'perde_products',
    renderCollection: 'perde_renders',
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

  // ─── SHTORI.AI (Rusya / BDT) ──────────────────────
  shtori: {
    id: 'shtori',
    domain: 'shtori.ai',
    name: 'Shtori AI Россия',
    shortName: 'SHTORI',
    memberCollection: 'shtori_members',
    newsCollection: 'shtori_news',
    projectCollection: 'shtori_orders',
    walletCollection: 'shtori_wallets',
    theme: 'dark',
    locale: 'ru',
    features: {
      b2b: true, catalog: true, news: false, autonomous: false,
      visualizer: false, expo: false, magazine: false, salesEngine: true,
      whatsapp: true, documents: true, fabricAnalysis: false, retention: true,
    },
    publicNavLinks: [{ name: 'Каталог', href: '/catalog', gated: false }],
    privateNavLinks: [{ name: 'Заказы', href: '/orders', gated: true }],
    roles: ['admin', 'member'],
  },

  // ─── PARDA.AI (Farsça / Urduca) ───────────────────
  parda: {
    id: 'parda',
    domain: 'parda.ai',
    name: 'Parda AI ایران',
    shortName: 'PARDA',
    memberCollection: 'parda_members',
    newsCollection: 'parda_news',
    projectCollection: 'parda_orders',
    walletCollection: 'parda_wallets',
    theme: 'light',
    locale: 'fa',
    features: {
      b2b: true, catalog: true, news: false, autonomous: false,
      visualizer: false, expo: false, magazine: false, salesEngine: true,
      whatsapp: true, documents: true, fabricAnalysis: false, retention: true,
    },
    publicNavLinks: [{ name: 'کاتالوگ', href: '/catalog', gated: false }],
    privateNavLinks: [{ name: 'سفارشات', href: '/orders', gated: true }],
    roles: ['admin', 'member'],
  },

  // ─── DONOITHAT.AI (Vietnam) ───────────────────────
  donoithat: {
    id: 'donoithat',
    domain: 'donoithat.ai',
    name: 'Đồ Nội Thất AI',
    shortName: 'DONOITHAT',
    memberCollection: 'donoithat_members',
    newsCollection: 'donoithat_news',
    projectCollection: 'donoithat_orders',
    walletCollection: 'donoithat_wallets',
    theme: 'light',
    locale: 'vi',
    features: {
      b2b: true, catalog: true, news: false, autonomous: false,
      visualizer: false, expo: false, magazine: false, salesEngine: true,
      whatsapp: true, documents: true, fabricAnalysis: false, retention: true,
    },
    publicNavLinks: [{ name: 'Danh mục', href: '/catalog', gated: false }],
    privateNavLinks: [{ name: 'Đơn hàng', href: '/orders', gated: true }],
    roles: ['admin', 'member'],
  },

  // ─── PERABOT.AI (Endonezya) ───────────────────────
  perabot: {
    id: 'perabot',
    domain: 'perabot.ai',
    name: 'Perabot AI Indonesia',
    shortName: 'PERABOT',
    memberCollection: 'perabot_members',
    newsCollection: 'perabot_news',
    projectCollection: 'perabot_orders',
    walletCollection: 'perabot_wallets',
    theme: 'light',
    locale: 'id',
    features: {
      b2b: true, catalog: true, news: false, autonomous: false,
      visualizer: false, expo: false, magazine: false, salesEngine: true,
      whatsapp: true, documents: true, fabricAnalysis: false, retention: true,
    },
    publicNavLinks: [{ name: 'Katalog', href: '/catalog', gated: false }],
    privateNavLinks: [{ name: 'Pesanan', href: '/orders', gated: true }],
    roles: ['admin', 'member'],
  },

  // ─── HEIMTEX.AI (Avrupa Sertifika Kalkanı) ────────
  heimtex: {
    id: 'heimtex',
    domain: 'heimtex.ai',
    name: 'Heimtex Certification Shield',
    shortName: 'HEIMTEX',
    memberCollection: 'heimtex_members',
    newsCollection: 'heimtex_news',
    projectCollection: 'heimtex_certifications',
    walletCollection: 'heimtex_wallets',
    theme: 'dark',
    locale: 'en',
    features: {
      b2b: true, catalog: false, news: false, autonomous: true,
      visualizer: false, expo: false, magazine: false, salesEngine: false,
      whatsapp: true, documents: true, fabricAnalysis: true, retention: false,
    },
    publicNavLinks: [{ name: 'Verify Cert', href: '/verify', gated: false }],
    privateNavLinks: [{ name: 'Laboratory', href: '/lab', gated: true }],
    roles: ['admin', 'member'],
  },
};

// ═══════════════════════════════════════════════════
// RESOLVER — Hostname'den node çöz
// ═══════════════════════════════════════════════════

/**
 * Hostname → SovereignNodeConfig
 * Middleware, ALOHA, auth hepsi aynı kaynaktan beslenir.
 * 20 domain olsa bile if/else cehennemi yok.
 */
export function resolveNodeFromHost(host: string): SovereignNodeConfig {
  const cleanHost = host.split(':')[0].toLowerCase();
  const match = Object.values(SOVEREIGN_NODES).find(t => cleanHost.includes(t.domain.split('.')[0]));
  return match || SOVEREIGN_NODES.trtex;  // fallback: TRTEX
}

/**
 * node ID → SovereignNodeConfig
 */
export function getNode(id?: string): SovereignNodeConfig {
  if (!id) return SOVEREIGN_NODES.perde;
  const normalized = id.toLowerCase().replace('.ai', '').replace('.com', '');
  return SOVEREIGN_NODES[normalized as SovereignNodeId] || SOVEREIGN_NODES.trtex;
}

/**
 * Domain string → SovereignNodeConfig  
 * page.tsx'deki [domain] parametresinden çözümler
 */
export function resolveNodeFromDomain(domain: string): SovereignNodeConfig {
  const decoded = decodeURIComponent(domain).split(':')[0].toLowerCase();
  const match = Object.values(SOVEREIGN_NODES).find(t => decoded.includes(t.domain.split('.')[0]));
  return match || SOVEREIGN_NODES.trtex;
}

/**
 * Tüm aktif node ID'leri
 */
export function getAllSovereignNodeIds(): SovereignNodeId[] {
  return Object.keys(SOVEREIGN_NODES) as SovereignNodeId[];
}

/**
 * Feature flag kontrolü — ALOHA tools bunu kullanır
 */
export function nodeHasFeature(SovereignNodeId: string, feature: keyof SovereignNodeFeatures): boolean {
  const node = getNode(SovereignNodeId);
  return node.features[feature] || false;
}

// ═══════════════════════════════════════════════════
// GLOBAL BUDGET CONFIG (CFO Ajan için)
// ═══════════════════════════════════════════════════
export const dailyBudget = { trtex: 5, perde: 10, hometex: 2, vorhang: 3, shtori: 2, parda: 2, donoithat: 2, perabot: 2, heimtex: 3 }; // USD

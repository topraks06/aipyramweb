/**
 * AIPyram Sovereign Tenant Configuration Registry (SSoT)
 * 
 * Bu dosya tüm tenant yapılandırmalarının tek kaynağıdır.
 * Middleware, layout, SEO ve bileşen routing kararları buradan beslenir.
 * 
 * KURAL: Yeni tenant eklerken SADECE bu dosyayı güncelle.
 * Dördüncü güç (Vorhang.ai) tak-çalıştır entegre edildi.
 */

export interface TenantConfig {
  /** Tenant tanımlayıcı adı */
  name: string;
  /** Gösterim markası */
  brand: string;
  /** Tema modu */
  theme: 'dark' | 'light';
  /** Ana marka rengi */
  primaryColor: string;
  /** Varsayılan dil */
  locale: string;
  /** Desteklenen diller */
  supportedLocales: string[];
  /** Navbar menü öğeleri */
  navItems: string[];
  /** Aktif özellikler */
  features: string[];
  /** SEO metadata */
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  /** Firestore koleksiyon prefix'i (varsa) */
  firestorePrefix?: string;
  /** Yasal sayfalar */
  legalPages: string[];
}

export const TENANT_CONFIG: Record<string, TenantConfig> = {
  'trtex.com': {
    name: 'TRTEX',
    brand: 'TRTEX.COM',
    theme: 'dark',
    primaryColor: '#dc2626',
    locale: 'tr',
    supportedLocales: ['tr', 'en'],
    navItems: ['news', 'tenders', 'academy'],
    features: ['news', 'tenders', 'opportunities', 'academy', 'radar', 'supply'],
    seo: {
      title: 'TRTEX — Sovereign B2B Textile Intelligence Terminal',
      description: 'Türk tekstil sektörünün yapay zeka destekli otonom istihbarat platformu. Anlık haber, ihale takibi ve ticaret radarı.',
      ogImage: '/assets/trtex/og-image.jpg',
    },
    legalPages: ['about', 'contact', 'privacy', 'terms'],
  },

  'perde.ai': {
    name: 'PERDE.AI',
    brand: 'PERDE.AI',
    theme: 'light',
    primaryColor: '#b8860b',
    locale: 'tr',
    supportedLocales: ['tr', 'en', 'de', 'fr', 'ru', 'ar', 'es', 'zh'],
    navItems: ['studio', 'visualizer', 'b2b', 'catalog', 'pricing'],
    features: ['visualizer', 'studio', 'b2b', 'pricing', 'catalog', 'projects', 'accounting'],
    seo: {
      title: 'Perde.ai — AI-Powered Curtain Design & B2B Platform',
      description: 'Yapay zeka ile perde tasarla, anında görselleştir, B2B toptan satış yap. Dünyanın ilk otonom perde tasarım platformu.',
      ogImage: '/assets/perde/og-image.jpg',
    },
    legalPages: ['about', 'contact', 'privacy', 'terms'],
  },

  'hometex.ai': {
    name: 'HOMETEX.AI',
    brand: 'HOMETEX.AI',
    theme: 'dark',
    primaryColor: '#ffffff',
    locale: 'tr',
    supportedLocales: ['tr', 'en', 'de', 'fr', 'ru', 'ar', 'es', 'zh'],
    navItems: ['expo', 'magazine', 'trends', 'exhibitors'],
    features: ['expo', 'magazine', 'trends', 'exhibitors'],
    seo: {
      title: 'Hometex.ai — Global Home Textile Digital Fair & Intelligence',
      description: 'Ev tekstili sektörünün dijital fuar ve istihbarat platformu. Küresel üretici ağı, trend analizi ve yapay zeka eşleştirme.',
      ogImage: '/assets/hometex/og-image.jpg',
    },
    legalPages: ['about', 'contact', 'privacy', 'terms'],
  },

  'vorhang.ai': {
    name: 'VORHANG.AI',
    brand: 'VORHANG.AI',
    theme: 'light',
    primaryColor: '#D4AF37',
    locale: 'de',
    supportedLocales: ['de', 'en', 'tr'],
    navItems: ['products', 'try-at-home', 'seller'],
    features: ['products', 'cart', 'checkout', 'seller', 'try-at-home'],
    seo: {
      title: 'Vorhang.ai — Der KI-gesteuerte B2B-Marktplatz für Vorhänge',
      description: 'Entdecken Sie den weltweit ersten KI-gesteuerten B2B-Marktplatz für Vorhänge. Visualisieren Sie in Echtzeit, kaufen Sie direkt beim Hersteller.',
      ogImage: '/assets/vorhang/og-image.jpg',
    },
    firestorePrefix: 'vorhang_',
    legalPages: ['about', 'contact', 'privacy', 'terms', 'impressum'],
  },
};

/**
 * Domain string'inden tenant config al.
 * Middleware rewrite sonrası `[domain]` parametresinden çağrılır.
 */
export function getTenantConfig(domain: string): TenantConfig | null {
  const d = decodeURIComponent(domain).split(':')[0]; // port'u at
  
  for (const [key, config] of Object.entries(TENANT_CONFIG)) {
    if (d.includes(key.split('.')[0])) {
      return config;
    }
  }
  
  // Fallback: perde.ai
  return TENANT_CONFIG['perde.ai'];
}

/**
 * Domain string'inden tenant adını al (projectName).
 */
export function getTenantName(domain: string): string {
  const d = decodeURIComponent(domain).split(':')[0];
  
  if (d.includes('trtex'))   return 'trtex';
  if (d.includes('perde'))   return 'perde';
  if (d.includes('hometex')) return 'hometex';
  if (d.includes('vorhang')) return 'vorhang';
  
  return 'perde'; // default
}

/**
 * Tüm tenant domain'lerini listele.
 */
export function getAllTenantDomains(): string[] {
  return Object.keys(TENANT_CONFIG);
}

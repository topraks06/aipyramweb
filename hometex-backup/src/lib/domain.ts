
export type DomainKey = 'hometex' | 'heimtex';

export interface DomainConfig {
  key: DomainKey;
  name: string;
  tagline: Record<string, string>;
  supportedLanguages: string[];
  defaultLanguage: string;
  primaryColor: string;
  logoLetter: string;
  excludeLanguages?: string[];
}

export const DOMAIN_CONFIGS: Record<DomainKey, DomainConfig> = {
  hometex: {
    key: 'hometex',
    name: 'Hometex.ai',
    tagline: {
      tr: 'Global Ev Tekstili Sanal Fuarı',
      en: 'Global Home Textile Virtual Fair',
      ar: 'معرض المنسوجات المنزلية العالمي الافتراضي',
      ru: 'Глобальная виртуальная ярмарка домашнего текстиля',
    },
    supportedLanguages: ['tr', 'en', 'ar', 'ru'],
    defaultLanguage: 'tr',
    primaryColor: '#D4AF37',
    logoLetter: 'H',
  },
  heimtex: {
    key: 'heimtex',
    name: 'Heimtex.ai',
    tagline: {
      de: 'Globale Virtuelle Heimtextilmesse',
      en: 'Global Home Textile Virtual Fair',
      tr: 'Global Ev Tekstili Sanal Fuarı',
    },
    supportedLanguages: ['de', 'en', 'tr'],
    defaultLanguage: 'de',
    primaryColor: '#D4AF37',
    logoLetter: 'H',
    excludeLanguages: [],
  },
};

export function detectDomain(hostname?: string): DomainKey {
  if (!hostname) return 'hometex';
  if (hostname.includes('heimtex')) return 'heimtex';
  return 'hometex';
}

export function getDomainConfig(domain: DomainKey): DomainConfig {
  return DOMAIN_CONFIGS[domain];
}

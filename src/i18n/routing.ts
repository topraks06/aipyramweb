import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['tr', 'en', 'de', 'es', 'fr', 'zh', 'ar', 'ru'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed',
    pathnames: {
        '/about': { tr: '/hakkimizda', en: '/about', de: '/about', es: '/about', fr: '/about', zh: '/about', ar: '/about', ru: '/about' },
        '/projects': { tr: '/projeler', en: '/projects', de: '/projects', es: '/projects', fr: '/projects', zh: '/projects', ar: '/projects', ru: '/projects' },
        '/sectors': { tr: '/sektorler', en: '/sectors', de: '/sectors', es: '/sectors', fr: '/sectors', zh: '/sectors', ar: '/sectors', ru: '/sectors' },
        '/domains': { tr: '/dijital-varliklar', en: '/domains', de: '/domains', es: '/domains', fr: '/domains', zh: '/domains', ar: '/domains', ru: '/domains' },
        '/investor': { tr: '/yatirimci', en: '/investor', de: '/investor', es: '/investor', fr: '/investor', zh: '/investor', ar: '/investor', ru: '/investor' },
        '/ecosystem': { tr: '/ekosistem', en: '/ecosystem', de: '/ecosystem', es: '/ecosystem', fr: '/ecosystem', zh: '/ecosystem', ar: '/ecosystem', ru: '/ecosystem' },
        '/contact': { tr: '/iletisim', en: '/contact', de: '/contact', es: '/contact', fr: '/contact', zh: '/contact', ar: '/contact', ru: '/contact' },
        '/impressum': { tr: '/kunye', en: '/impressum', de: '/impressum', es: '/impressum', fr: '/impressum', zh: '/impressum', ar: '/impressum', ru: '/impressum' },
        '/privacy': { tr: '/gizlilik', en: '/privacy', de: '/privacy', es: '/privacy', fr: '/privacy', zh: '/privacy', ar: '/privacy', ru: '/privacy' },
        '/terms': { tr: '/sartlar', en: '/terms', de: '/terms', es: '/terms', fr: '/terms', zh: '/terms', ar: '/terms', ru: '/terms' },
        '/sponsor': { tr: '/sponsor', en: '/sponsor', de: '/sponsor', es: '/sponsor', fr: '/sponsor', zh: '/sponsor', ar: '/sponsor', ru: '/sponsor' },
    }
});

export type Pathnames = keyof typeof routing.pathnames;

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);

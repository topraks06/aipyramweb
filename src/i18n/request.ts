import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate locale — tüm 8 dil desteklenmeli (TRTEX Otonom 8-Dil Politikası)
    if (!locale || !routing.locales.includes(locale as Locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});

export const heimtexDict: Record<string, Record<string, string>> = {
  magazine: { tr: 'Dergi', en: 'Magazine', de: 'Magazin' },
  trends: { tr: 'Trendler', en: 'Trends', de: 'Trends' },
  fashion: { tr: 'Moda', en: 'Fashion', de: 'Mode' },
  latest: { tr: 'En Yeni', en: 'Latest', de: 'Neueste' },
  the_future: { tr: 'TEKSTİL TASARIMININ GELECEĞİ', en: 'THE FUTURE OF TEXTILE DESIGN', de: 'DIE ZUKUNFT DES TEXTILDESIGNS' }
};

export function t(key: string, lang: string = 'en'): string {
  if (!heimtexDict[key]) return key;
  return heimtexDict[key][lang] || heimtexDict[key]['en'];
}

export const heimtexDict: Record<string, Record<string, string>> = {
  magazine: { tr: 'Dergi', en: 'Magazine', de: 'Magazin' },
  trends: { tr: 'Trendler', en: 'Trends', de: 'Trends' },
  fashion: { tr: 'Moda', en: 'Fashion', de: 'Mode' },
  latest: { tr: 'En Yeni', en: 'Latest', de: 'Neueste' },
  the_future: { tr: 'TEKSTİL TASARIMININ GELECEĞİ', en: 'THE FUTURE OF TEXTILE DESIGN', de: 'DIE ZUKUNFT DES TEXTILDESIGNS' },
  // B2B TEXTILE TERMS
  curtain: { tr: 'Perde', en: 'Curtain', de: 'Vorhang' },
  upholstery: { tr: 'Döşemelik', en: 'Upholstery', de: 'Polsterstoff' },
  yarn: { tr: 'İplik', en: 'Yarn', de: 'Garn' },
  fabrics: { tr: 'Kumaşlar', en: 'Fabrics', de: 'Stoffe' },
  exhibitor: { tr: 'Katılımcı', en: 'Exhibitor', de: 'Aussteller' },
  buyer: { tr: 'Alıcı', en: 'Buyer', de: 'Käufer' },
  collection: { tr: 'Koleksiyon', en: 'Collection', de: 'Kollektion' },
  sustainability: { tr: 'Sürdürülebilirlik', en: 'Sustainability', de: 'Nachhaltigkeit' },
  smart_textiles: { tr: 'Akıllı Tekstiller', en: 'Smart Textiles', de: 'Intelligente Textilien' },
  color_palette: { tr: 'Renk Paleti', en: 'Color Palette', de: 'Farbpalette' },
  texture: { tr: 'Doku', en: 'Texture', de: 'Textur' },
  wholesale: { tr: 'Toptan', en: 'Wholesale', de: 'Großhandel' },
  retail: { tr: 'Perakende', en: 'Retail', de: 'Einzelhandel' }
};

export function t(key: string, lang: string = 'en'): string {
  if (!heimtexDict[key]) return key;
  return heimtexDict[key][lang] || heimtexDict[key]['en'];
}

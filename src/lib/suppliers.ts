// src/lib/suppliers.ts

export type Supplier = {
  id: string;
  name: string;
  country: string;
  city: string;
  products: string[];
  email: string;
  trustScore: number; // 0-100
};

export const SUPPLIERS_DB: Supplier[] = [
  // HAVLU GRUBU (Denizli)
  { id: 'S001', name: 'Denizli Premium Towels', country: 'Turkey', city: 'Denizli', products: ['towel', 'bathrobe', 'cotton'], email: 'info@denizli-ornek-tekstil.com', trustScore: 95 },
  { id: 'S002', name: 'Ege Cotton Co.', country: 'Turkey', city: 'Denizli', products: ['towel', 'hotel', 'spa'], email: 'export@egecotton-mock.com', trustScore: 88 },
  { id: 'S003', name: 'Pamukkale Weaving Ltd.', country: 'Turkey', city: 'Denizli', products: ['towel', 'peshtemal', 'cotton'], email: 'sales@pamukkaleweaving-mock.net', trustScore: 92 },
  { id: 'S004', name: 'Aegean Towel Mills', country: 'Turkey', city: 'Denizli', products: ['towel', 'bathrobe', 'terry'], email: 'hello@aegeantowels-mock.com', trustScore: 85 },
  { id: 'S005', name: 'Grand Denizli Tekstil', country: 'Turkey', city: 'Denizli', products: ['towel', 'linens', 'hotel'], email: 'b2b@granddenizli-mock.com.tr', trustScore: 90 },

  // KUMAŞ / PERDELİK GRUBU (Bursa)
  { id: 'S006', name: 'Bursa Fabric Masters', country: 'Turkey', city: 'Bursa', products: ['fabric', 'curtain', 'polyester', 'jacquard'], email: 'export@bursafabric-mock.com', trustScore: 96 },
  { id: 'S007', name: 'Silk Road Textiles', country: 'Turkey', city: 'Bursa', products: ['fabric', 'silk', 'curtain', 'upholstery'], email: 'info@silkroad-mock.com.tr', trustScore: 94 },
  { id: 'S008', name: 'Marmara Weavers', country: 'Turkey', city: 'Bursa', products: ['fabric', 'curtain', 'sheer'], email: 'sales@marmaraweavers-mock.com', trustScore: 89 },
  { id: 'S009', name: 'Uludag Velvet Co.', country: 'Turkey', city: 'Bursa', products: ['fabric', 'velvet', 'upholstery'], email: 'contact@uludagvelvet-mock.net', trustScore: 87 },
  { id: 'S010', name: 'Anatolian Drape', country: 'Turkey', city: 'Bursa', products: ['fabric', 'curtain', 'blackout'], email: 'b2b@anatolian-mock-drape.com', trustScore: 91 },

  // GENEL EV TEKSTİLİ / YATAK / LİNEN (Istanbul & Diğer)
  { id: 'S011', name: 'Istanbul Bedding Co.', country: 'Turkey', city: 'Istanbul', products: ['bedding', 'linen', 'cotton', 'hotel'], email: 'export@istanbulbedding-mock.com', trustScore: 93 },
  { id: 'S012', name: 'Bosphorus Home', country: 'Turkey', city: 'Istanbul', products: ['bedding', 'pillow', 'quilt'], email: 'sales@bosphorushome-mock.com', trustScore: 85 },
  { id: 'S013', name: 'Golden Horn Textiles', country: 'Turkey', city: 'Istanbul', products: ['bedding', 'linen', 'home textile'], email: 'hello@goldenhorn-mock.com.tr', trustScore: 88 },
  { id: 'S014', name: 'Majestic Linens', country: 'Turkey', city: 'Istanbul', products: ['bedding', 'cotton', 'duvet cover'], email: 'contact@majesticlinens-mock.com', trustScore: 92 },
  { id: 'S015', name: 'Galata Home Decor', country: 'Turkey', city: 'Istanbul', products: ['cushion', 'throw', 'blanket'], email: 'info@galatahome-mock.com', trustScore: 86 },

  // İPLİK & HAMMADDE (Gaziantep / Kahramanmaraş vb.)
  { id: 'S016', name: 'Sanko Mock Yarns', country: 'Turkey', city: 'Gaziantep', products: ['yarn', 'cotton', 'polyester'], email: 'export@sankomock-yarns.com', trustScore: 98 },
  { id: 'S017', name: 'Maras Spinning Mills', country: 'Turkey', city: 'Kahramanmaras', products: ['yarn', 'cotton', 'viscose'], email: 'sales@marasspinning-mock.net', trustScore: 95 },
  { id: 'S018', name: 'Anatolia Threads', country: 'Turkey', city: 'Gaziantep', products: ['yarn', 'acrylic', 'blend'], email: 'info@anatoliathreads-mock.com', trustScore: 89 },
  
  // ÖRME / GİYİM LİSANSLI (Tekirdağ / Çorlu)
  { id: 'S019', name: 'Trakya Knitting', country: 'Turkey', city: 'Corlu', products: ['knitting', 'jersey', 'cotton', 'fabric'], email: 'export@trakyaknit-mock.com', trustScore: 90 },
  { id: 'S020', name: 'Corlu Dyehouse Ltd.', country: 'Turkey', city: 'Corlu', products: ['dyeing', 'finishing', 'fabric'], email: 'b2b@corludye-mock.com.tr', trustScore: 87 }
];

/**
 * Lead query/keywords tabanlı tedarikçi eşleştirme.
 * Basit in-memory search. Gerçek senaryoda Vector DB / Algolia kullanılacaktır.
 */
export function findSuppliersForLead(queryOrKeywords: string, limit: number = 5): Supplier[] {
  const qObj = queryOrKeywords.toLowerCase();
  
  // Ürün tipine göre puanlama yapalım
  const scoredSuppliers = SUPPLIERS_DB.map(sup => {
    let score = 0;
    for (const prod of sup.products) {
      if (qObj.includes(prod.toLowerCase())) {
        score += 50;
      }
    }
    // Ülke veya şehir geçiyorsa
    if (qObj.includes(sup.city.toLowerCase())) score += 20;
    
    return { supplier: sup, score };
  });

  // Skoru > 0 olanları filtrele, puana göre (veya trustScore'a göre) sırala
  const matched = scoredSuppliers
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || b.supplier.trustScore - a.supplier.trustScore)
    .map(s => s.supplier);

  // Eğer açık eşleşme yoksa (Sıfır skor), genel 'home textile' bazlı en yüksek trust score olan 5'i yolla
  if (matched.length === 0) {
    return SUPPLIERS_DB
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, limit);
  }

  return matched.slice(0, limit);
}

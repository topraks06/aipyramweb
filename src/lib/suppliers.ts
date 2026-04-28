// src/lib/suppliers.ts

import { adminDb } from '@/lib/firebase-admin';

export type Supplier = {
  id: string;
  name: string;
  country: string;
  city: string;
  products: string[];
  email: string;
  trustScore: number; // 0-100
};

/**
 * Lead query/keywords tabanlı tedarikçi eşleştirme.
 * Firestore 'trtex_suppliers' koleksiyonundan veri çeker.
 * Basit in-memory search. Gerçek senaryoda Vector DB / Algolia kullanılacaktır.
 */
export async function findSuppliersForLead(queryOrKeywords: string, limit: number = 5): Promise<Supplier[]> {
  try {
    const querySnapshot = await adminDb.collection('trtex_suppliers').get();
    if (querySnapshot.empty) {
      return [];
    }

    const suppliersDB: Supplier[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      suppliersDB.push({
        id: doc.id,
        name: data.name || '',
        country: data.country || '',
        city: data.city || '',
        products: data.products || [],
        email: data.email || '',
        trustScore: data.trustScore || 0,
      });
    });

    const qObj = queryOrKeywords.toLowerCase();
    
    // Ürün tipine göre puanlama yapalım
    const scoredSuppliers = suppliersDB.map(sup => {
      let score = 0;
      if (sup.products && Array.isArray(sup.products)) {
        for (const prod of sup.products) {
          if (qObj.includes(prod.toLowerCase())) {
            score += 50;
          }
        }
      }
      // Ülke veya şehir geçiyorsa
      if (sup.city && qObj.includes(sup.city.toLowerCase())) score += 20;
      
      return { supplier: sup, score };
    });

    // Skoru > 0 olanları filtrele, puana göre (veya trustScore'a göre) sırala
    const matched = scoredSuppliers
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || b.supplier.trustScore - a.supplier.trustScore)
      .map(s => s.supplier);

    // Eğer açık eşleşme yoksa (Sıfır skor), genel 'home textile' bazlı en yüksek trust score olan limit kadar yolla
    if (matched.length === 0) {
      return suppliersDB
        .sort((a, b) => b.trustScore - a.trustScore)
        .slice(0, limit);
    }

    return matched.slice(0, limit);
  } catch (error) {
    console.error('[Suppliers API] Error fetching from Firestore:', error);
    return [];
  }
}

import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/emailService';

export interface StructuredData {
  product_category?: string;
  material_details?: string;
  volume_amount?: string | number;
  volume_unit?: string;
  market_tier?: string;
  estimated_price_band?: string;
}

export interface ListingData {
  id: string;
  type: string;
  visibility: string;
  structuredData: StructuredData;
  country: string;
  companyRef?: string;
}

/**
 * Sovereign Matchmaker Engine
 * Asıl B2B İstihbaratının paraya/ticarete dönüştüğü Otonom Eşleşme Motoru.
 */
export class MatchmakerEngine {
  
  /**
   * İlan yayınlandığında veya "Dark Pool"a eklendiğinde tetiklenir.
   */
  static async executeMatchmaking(listing: ListingData) {
    try {
      console.log(`[MATCHMAKER] Eşleşme Motoru Başlatıldı. İlan: ${listing.id}`);
      
      const category = (listing.structuredData?.product_category || '').toLowerCase();
      const material = (listing.structuredData?.material_details || '').toLowerCase();
      
      if (!category && !material) {
        console.warn(`[MATCHMAKER] Yeterli veri yok, eşleştirme iptal edildi.`);
        return;
      }

      // 1. Hedef Alıcı/Satıcı Havuzunu Çek
      // Performans: Sadece ilgi alanı olan (interests dizisi boş olmayan) üyeleri çekiyoruz
      // ve maksimum 200 ile sınırlıyoruz ki bellek/maliyet patlaması olmasın.
      const usersSnap = await adminDb.collection('sovereign_users')
        .limit(200)
        .get();
      const matchedUsers: any[] = [];

      usersSnap.forEach(doc => {
        const user = doc.data();
        if (!user.email) return;

        // Üyenin ilgi alanları veya firma tipi var mı?
        const interests: string[] = user.interests || user.industryTags || [];
        const combinedInterests = interests.join(' ').toLowerCase();

        // Basit Eşleşme Mantığı (Keyword Match)
        let isMatch = false;
        
        // Eğer ilan kategorisi kullanıcının ilgi alanında geçiyorsa
        if (category && combinedInterests.includes(category)) isMatch = true;
        
        // Veya "kumaş, iplik" gibi spesifik kelimeler geçiyorsa
        if (material && combinedInterests.includes(material)) isMatch = true;

        // VIP/Premium filtrelemesi eklenebilir
        // if (user.tier === 'FREE') isMatch = false; // Şimdilik herkesi tarayalım

        if (isMatch) {
          // Gerçek Eşleşme Skoru: Kaç keyword eşleşti + profil doluluğu
          let score = 70; // Taban skor (eşleşti = en az %70 uyumlu)
          if (category && combinedInterests.includes(category)) score += 15;
          if (material && combinedInterests.includes(material)) score += 10;
          if (user.tier === 'GOLD' || user.tier === 'PLATINUM') score += 5;
          score = Math.min(score, 99);

          matchedUsers.push({
            id: doc.id,
            email: user.email,
            companyName: user.companyName || user.displayName || 'Sayın Üye',
            tier: user.tier || 'STANDARD',
            matchScore: score
          });
        }
      });

      console.log(`[MATCHMAKER] ${matchedUsers.length} adet uygun eşleşme bulundu.`);

      // 2. Eşleşmeleri Veritabanına Yaz ve E-posta Gönder
      const batch = adminDb.batch();

      for (const match of matchedUsers) {
        const matchRef = adminDb.collection('trtex_b2b_matches').doc();
        batch.set(matchRef, {
          listingId: listing.id,
          matchedUserId: match.id,
          matchedUserEmail: match.email,
          status: 'NOTIFIED',
          matchScore: match.matchScore || 70,
          createdAt: new Date().toISOString()
        });

        // 3. Sovereign Alert (Otonom İstihbarat E-postası)
        await sendEmail({
          to: [match.email],
          subject: `🚨 TRTex B2B Fırsatı: ${listing.structuredData.product_category || 'Yeni Talep'}`,
          body: `
            Merhaba ${match.companyName},
            
            İlgi alanlarınıza uygun yeni bir B2B talebi (veya stok) sisteme düştü.
            
            DETAYLAR:
            Tür: ${listing.type}
            Ürün: ${listing.structuredData.product_category} (${listing.structuredData.material_details})
            Miktar: ${listing.structuredData.volume_amount} ${listing.structuredData.volume_unit}
            Lokasyon: ${listing.country}
            
            Müşteri Segmenti: ${listing.structuredData.market_tier || 'Belirtilmedi'}
            Fiyat Beklentisi: ${listing.structuredData.estimated_price_band || 'Piyasa'}
            
            Gizlilik Seviyesi: ${listing.visibility === 'MATCHED_ONLY' ? 'DARK POOL (Sadece Size Özel)' : 'Herkese Açık'}
            
            Hemen teklif vermek veya detayları görmek için TRTex Terminaline giriş yapın.
            
            Sovereign B2B Network
          `
        });
      }

      await batch.commit();
      console.log(`[MATCHMAKER] Eşleşmeler sisteme işlendi ve uyarılar gönderildi.`);

    } catch (error) {
      console.error('[MATCHMAKER] Kritik Hata:', error);
    }
  }
}

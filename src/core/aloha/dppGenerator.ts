import * as crypto from "crypto";

/**
 * 🏛️ V9.6 THE PASSPORT AUTHORITY (Dijital Ürün Pasaportu - DPP)
 * İşlevi: AB ve Türkiye ticaret regülasyonlarına uygun olarak B2B tekstil (Perde.ai) 
 * ve Gayrimenkul (Didimemlak) ürünleri için Otonom JSON Sertifika (Pasaport) üretir.
 * Trtex bu DPP'lerin "Doğrulama Merkezi" (Authority) rolünü üstlenir.
 */

export interface ProductDetails {
    projectId: "perde" | "didimemlak" | "trtex";
    name: string;
    description: string;
    materials?: Record<string, number>; // Örn: { "Linen": 30, "Polyester": 70 }
    manufacturingOrigin?: string;       // Örn: "Bursa, TR"
    energyClass?: "A" | "B" | "C" | "D"; // Emlak veya Üretim için
}

export interface DigitalProductPassport {
    uid: string;
    issuer: string;
    timestamp: string;
    project: string;
    productName: string;
    specifications: any;
    ecoScore: number;         // 1-100 (Sürdürülebilirlik Puanı)
    complianceStatus: string; // Örn: "EU_2026_COMPLIANT"
    qrPayloadData: string;    // Barkod veya doğrulama adresi URL'si
}

export class DppGenerator {

  /**
   * Bir ürün için otonom AB standartlarında Dijital Ürün Pasaportu oluşturur ve mühürler.
   */
  public static generatePassport(product: ProductDetails): DigitalProductPassport {
      const timestamp = new Date().toISOString();
      const rawPayload = `${product.projectId}-${product.name}-${timestamp}`;
      const uid = crypto.createHash("sha256").update(rawPayload).digest("hex").substring(0, 16).toUpperCase();

      const ecoScore = this.calculateEcoScore(product);

      const dpp: DigitalProductPassport = {
          uid: `DPP-${uid}`,
          issuer: "AIPYRAM_GMBH_AUTHORITY",
          timestamp,
          project: product.projectId,
          productName: product.name,
          specifications: {
              materials: product.materials || "N/A",
              origin: product.manufacturingOrigin || "TR",
              energy: product.energyClass || "N/A"
          },
          ecoScore,
          complianceStatus: ecoScore >= 50 ? "EU_2026_COMPLIANT" : "NEEDS_IMPROVEMENT",
          qrPayloadData: `https://trtex.com/verify/dpp-${uid}` // Trtex bir doğrulama Authority'si olur
      };

      console.log(`[📜 DPP AUTHORITY] Pasaport Üretildi: ${dpp.productName} (EcoScore: ${dpp.ecoScore}/100) -> UID: ${dpp.uid}`);
      return dpp;
  }

  /**
   * Otonom Sürdürülebilirlik (EcoScore) Puanlaması (Mock/Basit Algoritma)
   */
  private static calculateEcoScore(product: ProductDetails): number {
      let score = 50; // Base score

      if (product.materials) {
          // Keten, Pamuk gibi doğal materyaller puan artırır
          const naturalMats = ["Linen", "Cotton", "Silk", "Wool"];
          for (const [mat, percent] of Object.entries(product.materials)) {
              if (naturalMats.includes(mat)) {
                  score += (percent * 0.4); 
              } else if (mat === "Polyester" || mat === "Acrylic") {
                  score -= (percent * 0.2);
              }
          }
      }

      if (product.energyClass === "A") score += 20;
      if (product.energyClass === "B") score += 10;
      if (product.energyClass === "C") score -= 10;

      // Sınırlar
      if (score > 100) score = 100;
      if (score < 10) score = 10;

      return Math.round(score);
  }
}

import { EventBus } from "@/core/events/eventBus";
import { aipyramEvent } from "@/core/events/eventTypes";
import { matchSupplierWithRFQ, RFQData, SupplierData } from "@/core/agents/matchmakerAgent";
import { auditSupplier } from "@/core/agents/auditorAgent";
import { adminDb } from "@/lib/firebase-admin";

/**
 * FAZ 4.1: Otonom Ajan Zinciri (A2A Pipeline)
 * Bu modül, EventBus üzerindeki belirli sinyalleri dinleyerek ajanları domino taşı gibi tetikler.
 */

// 1. RFQ_SUBMITTED geldiğinde Matchmaker çalışır
EventBus.subscribe("RFQ_SUBMITTED", async (event: aipyramEvent) => {
  const rfq = event.payload as RFQData;
  console.log(`[🚀 PIPELINE] RFQ alındı (${rfq.id}). Matchmaker uyanıyor...`);

  // Redlock koruması: Çift işlemeyi engelle
  const lockId = `rfq_match_${rfq.id}`;
  const hasLock = await EventBus.acquireLock(lockId, 30000); // 30 saniye kilitli
  if (!hasLock) {
    console.log(`[🔒 PİPELİNE RİSKİ ÖNLENDİ] RFQ ${rfq.id} zaten başka bir ajan/node tarafından işleniyor.`);
    return;
  }

  try {
    // Tüm tedarikçileri çek
    const suppliersSnap = await adminDb.collection("suppliers").get();
    const suppliers: SupplierData[] = suppliersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupplierData));

    const result = await matchSupplierWithRFQ(rfq, suppliers);
    if (!result || !result.result) throw new Error("Matchmaker sonucu boş.");

    const parsed = JSON.parse(result.result);

    if (parsed.status === "MATCHED" && parsed.matches && parsed.matches.length > 0) {
      // Siparişi en iyi skoru alan fabrikaya fırlat
      const bestMatch = parsed.matches[0];
      
      // Sinyali Polyglot (veya Auditor) aşamasına at: SUPPLIER_MATCHED
      await EventBus.emit({
        type: "SUPPLIER_MATCHED",
        source: "MATCHMAKER_AGENT",
        node_id: event.node_id,
        payload: {
          rfqId: rfq.id,
          rfqData: rfq,
          supplierId: bestMatch.supplierId,
          companyName: bestMatch.companyName,
          matchScore: bestMatch.matchScore,
          estimatedPrice: bestMatch.estimatedPrice
        }
      });
      console.log(`[✅ PIPELINE] Eşleşme bulundu: ${bestMatch.companyName}. Polyglot/Auditor tetiklendi.`);
    } else {
       console.log(`[❌ PIPELINE] RFQ ${rfq.id} için uygun fabrika bulunamadı (NO_MATCH).`);
       // Burada Admin Panele (Task veya Deal Dashboard) bildiri geçilebilir
    }
  } catch (error) {
    console.error(`[🚨 PIPELINE ERROR] Matchmaker çöktü:`, error);
  } finally {
    await EventBus.releaseLock(lockId);
  }
});

// 2. SUPPLIER_MATCHED geldiğinde Auditor çalışır ve fabrikanın son durumunu kontrol eder
EventBus.subscribe("SUPPLIER_MATCHED", async (event: aipyramEvent) => {
  const payload = event.payload;
  console.log(`[🕵️ PIPELINE] Eşleşen Fabrika (${payload.companyName}) Auditor tarafından inceleniyor...`);

  try {
     const supplierRef = adminDb.collection("suppliers").doc(payload.supplierId);
     const docSnap = await supplierRef.get();
     if (!docSnap.exists) throw new Error("Tedarikçi Kütükte Yok!");

     const supplier = docSnap.data();

     const auditInput = {
       supplierId: payload.supplierId,
       companyName: supplier?.companyName,
       certifications: supplier?.certifications || [],
       yearsInBusiness: supplier?.yearsInBusiness || 0,
     };

     const auditResult = await auditSupplier(auditInput);
     const resultData = JSON.parse(auditResult.result);

     if (resultData.trustScore >= 80) {
        // Güvenliyse, Deal zincirini son onaya (HITL) hazırla
        await EventBus.emit({
          type: "DEAL_READY", // HITL (Human In The Loop) bekleyen finale geçiş
          source: "AUDITOR_AGENT",
          node_id: event.node_id,
          payload: {
             ...payload,
             trustScore: resultData.trustScore,
             riskLevel: resultData.riskLevel,
             status: "AWAITING_MASTER_APPROVAL"
          }
        });
        console.log(`[⚖️ PIPELINE] FİRMA GÜVENİLİR ONAYI ALDI (${resultData.trustScore}/100). DEAL_READY Atıldı.`);
     } else {
        console.warn(`[🛑 PIPELINE] FİRMA RİSKLİ BULUNDU (${resultData.trustScore}/100). Zincir KIRILDI.`);
     }

  } catch (err) {
     console.error("[🚨 PIPELINE ERROR] Auditor çöktü:", err);
  }
});

import { NotificationService } from "@/services/notificationService";
import { KnowledgeFlywheel } from "@/core/memory/knowledgeFlywheel";

// Sadece modülü tetiklemek için dummy init. Gerçek hayatta NextJS startup'ta require edilir.
export const initializePipeline = () => {
   NotificationService.initialize();
   KnowledgeFlywheel.initialize();
   console.log("[A2A PIPELINE] Tam Otonom Ajan Zinciri Motoru (V8.3) Kuruldu.");
};

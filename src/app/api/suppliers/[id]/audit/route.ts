import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { auditSupplier } from "@/core/agents/auditorAgent";

/**
 * POST /api/suppliers/[id]/audit
 * AuditorAgent'i tetikleyerek Trust Score hesaplar ve veritabanını günceller.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const docRef = adminDb.collection("suppliers").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: "Tedarikçi bulunamadı." }, { status: 404 });
    }
    
    const supplier = docSnap.data();

    // AuditorAgent'a gidecek input verisi
    const auditInput = {
      supplierId: id,
      companyName: supplier?.companyName,
      certifications: supplier?.certifications || [],
      yearsInBusiness: supplier?.yearsInBusiness || 0,
    };

    // Agent'i çalıştır
    const auditResult = await auditSupplier(auditInput);
    
    // Güvenlik: limit aşıldıysa boş döner
    if (!auditResult.result || auditResult.result === "{}") {
        return NextResponse.json({ success: false, error: "Denetçi ajan kilitlendi veya bütçe aşıldı." }, { status: 429 });
    }

    const resultData = JSON.parse(auditResult.result);

    // trust_scores koleksiyonuna kayıt at
    const trustRecord = {
      tenant_id: supplier?.tenant_id || "aipyram-core",
      supplierId: id,
      score: resultData.trustScore,
      explanation: resultData.explanation || "Agent Explanation Unavailable.",
      riskLevel: resultData.riskLevel,
      certificationStatus: resultData.certificationStatus,
      auditedBy: "AUDITOR_AGENT",
      createdAt: Date.now()
    };
    
    await adminDb.collection("trust_scores").add(trustRecord);

    const { recordMemory } = await import("@/core/memory/knowledgeFlywheel");
    await recordMemory({
      tenant_id: supplier?.tenant_id || "aipyram-core",
      source: "Supplier_Audit",
      text: `Supplier ${supplier?.companyName} scored ${resultData.trustScore}. Reason: ${resultData.explanation}`,
      agentId: "AUDITOR"
    });

    // suppliers koleksiyonunu güncelle
    await docRef.update({
      trustScore: resultData.trustScore,
      riskLevel: resultData.riskLevel,
      lastAuditAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: "Tedarikçi başarıyla denetlendi.",
      trustScore: resultData.trustScore,
      riskLevel: resultData.riskLevel,
      explanation: resultData.explanation
    });

  } catch (error: any) {
    console.error(`[SUPPLIERS_AUDIT] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

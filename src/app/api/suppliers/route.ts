import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FirestoreSupplier } from "@/core/schema/firestoreSchema";

/**
 * GET /api/suppliers
 * List all suppliers
 */
export async function GET() {
  try {
    const suppliersSnap = await adminDb.collection("suppliers").get();
    const suppliers = suppliersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    console.error("[SUPPLIERS_GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/suppliers
 * Register a new supplier
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const {
      tenant_id = "aipyram-core", // Default tenant
      companyName,
      region,
      products = [],
      certifications = [],
      moq = "N/A",
      leadTime = "N/A",
      contactEmail,
      yearsInBusiness = 0
    } = body;

    if (!companyName || !region) {
      return NextResponse.json({ success: false, error: "companyName and region are required" }, { status: 400 });
    }

    const newSupplier: Omit<FirestoreSupplier, "id"> = {
      tenant_id,
      companyName,
      region,
      products,
      certifications,
      moq,
      leadTime,
      trustScore: 0, // Starts at 0 until audited
      riskLevel: "MEDIUM", // Default risk before audit
      contactEmail,
      yearsInBusiness,
      totalDeals: 0,
      successRate: 0,
      createdAt: Date.now()
    };

    const docRef = await adminDb.collection("suppliers").add(newSupplier);

    return NextResponse.json({
      success: true,
      message: "Tedarikçi başarıyla kaydedildi, denetim (audit) bekleniyor.",
      data: { id: docRef.id, ...newSupplier }
    });

  } catch (error: any) {
    console.error("[SUPPLIERS_POST] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

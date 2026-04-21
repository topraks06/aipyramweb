import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/suppliers/[id]
 * Get single supplier details
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const docRef = adminDb.collection("suppliers").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: "Tedarikçi bulunamadı." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
  } catch (error: any) {
    console.error(`[SUPPLIERS_GET_${params}] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════
 *  PERDE.AI MARKETPLACE — SATICI (ESNAF) API'si
 *  Koleksiyon: perde_marketplace_sellers
 * ═══════════════════════════════════════════════════════
 */

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    let uid: string;

    if (isDev) {
      uid = 'dev-bypass-user';
    } else {
      const sessionCookie = req.cookies.get("session");
      if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
      }
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;
    }

    const body = await req.json();
    const {
      companyName, contactName, phone, address, city,
      taxId, iban, categories = [], mode = 'basic',
    } = body;

    if (!companyName || !contactName) {
      return NextResponse.json({ error: "Firma adı ve yetkili kişi zorunlu" }, { status: 400 });
    }

    // Daha önce kayıt olmuş mu kontrol et
    const existing = await adminDb.collection('perde_marketplace_sellers')
      .where('uid', '==', uid).limit(1).get();

    if (!existing.empty) {
      return NextResponse.json({ 
        error: "Zaten kayıtlı bir satıcı hesabınız var",
        sellerId: existing.docs[0].id 
      }, { status: 409 });
    }

    const newSeller = {
      uid,
      companyName,
      contactName,
      phone: phone || '',
      address: address || '',
      city: city || '',
      taxId: taxId || '',
      iban: iban || '',
      stripeConnectAccountId: null,
      isVerified: false,
      rating: 0,
      totalSales: 0,
      totalProducts: 0,
      commissionRate: 0.10,
      categories,
      mode, // 'basic' = esnaf, 'professional' = fabrika
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const docRef = await adminDb.collection('perde_marketplace_sellers').add(newSeller);

    console.log(`[PERDE-MARKETPLACE] ✅ Satıcı kaydı: ${docRef.id} - ${companyName}`);

    return NextResponse.json({
      success: true,
      sellerId: docRef.id,
      seller: { id: docRef.id, ...newSeller },
    });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Sellers POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('id');
    const uid = searchParams.get('uid');

    if (sellerId) {
      const doc = await adminDb.collection('perde_marketplace_sellers').doc(sellerId).get();
      if (!doc.exists) return NextResponse.json({ error: "Satıcı bulunamadı" }, { status: 404 });
      return NextResponse.json({ seller: { id: doc.id, ...doc.data() } });
    }

    if (uid) {
      const snapshot = await adminDb.collection('perde_marketplace_sellers')
        .where('uid', '==', uid).limit(1).get();
      if (snapshot.empty) return NextResponse.json({ seller: null });
      const doc = snapshot.docs[0];
      return NextResponse.json({ seller: { id: doc.id, ...doc.data() } });
    }

    // Onaylı satıcılar listesi (public)
    const snapshot = await adminDb.collection('perde_marketplace_sellers')
      .where('status', '==', 'active')
      .orderBy('totalSales', 'desc')
      .limit(50)
      .get();

    const sellers = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ sellers });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Sellers GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

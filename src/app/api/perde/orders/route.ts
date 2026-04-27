import { NextRequest, NextResponse } from 'next/server';
import { admin, adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';
import { calculateItemPrice, type PriceCalcInput } from '@/services/perdePricingEngine';

export const dynamic = 'force-dynamic';

// GET /api/perde/orders
// Returns all orders for a specific user (or all if admin)
export async function GET(req: NextRequest) {
  try {
    if (!adminDb) throw new Error("Firebase Admin not ready");

    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    const uid = decoded.uid;

    const SovereignNodeConfig = getNode('perde');

    const ordersSnap = await adminDb
      .collection(SovereignNodeConfig.projectCollection)
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('[/api/perde/orders GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/perde/orders
// Create a new order
export async function POST(req: NextRequest) {
  try {
    if (!adminDb) throw new Error("Firebase Admin not ready");

    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    const uid = decoded.uid;

    const body = await req.json();
    const { customerName, customerPhone, items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler.' }, { status: 400 });
    }

    const SovereignNodeConfig = getNode('perde');
    let totalAmount = 0;

    // Fiyat hesaplama
    const enrichedItems = items.map((item: any) => {
      const price = calculateItemPrice({
        width_cm: item.width_cm,
        height_cm: item.height_cm,
        fabricType: item.fabricType,
        quantity: item.quantity || 1
      });
      totalAmount += price;

      return {
        ...item,
        price,
        status: 'pending'
      };
    });

    const newOrder = {
      uid,
      customerName: customerName || 'İsimsiz Müşteri',
      customerPhone: customerPhone || '',
      items: enrichedItems,
      amount: totalAmount,
      status: 's1', // Teklif İletildi / Onay Bekleniyor
      createdAt: new Date(), // Firestore Timestamp instead of string can be handled directly with FieldValue.serverTimestamp() but new Date() is fine
    };

    const docRef = await adminDb.collection(SovereignNodeConfig.projectCollection).add(newOrder);

    // Optional: Call invokeAgent('document') here to generate a PDF for the order.
    // fetch('.../api/agent/invoke', { method: 'POST', body: JSON.stringify({ node: 'perde', action: 'document', uid, payload: { orderId: docRef.id } })})
    // For now, we just create the order.

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newOrder } 
    });
  } catch (error: any) {
    console.error('[/api/perde/orders POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

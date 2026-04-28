import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════
 *  PERDE.AI MARKETPLACE — SİPARİŞ API'si
 *  Koleksiyon: perde_marketplace_orders
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
        return NextResponse.json({ error: "Sipariş vermek için giriş yapın" }, { status: 401 });
      }
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;
    }

    const body = await req.json();
    const { items, buyerName, buyerAddress, buyerPhone, buyerEmail, stripePaymentId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
    }

    // Toplam hesapla ve satıcı bazlı ayır
    let totalAmount = 0;
    const sellerPayouts: any[] = [];
    const sellerMap = new Map<string, number>();

    for (const item of items) {
      const amount = item.price * item.quantity;
      totalAmount += amount;
      const current = sellerMap.get(item.sellerId) || 0;
      sellerMap.set(item.sellerId, current + amount);
    }

    // Komisyon hesapla (%10 default)
    const COMMISSION_RATE = 0.10;
    for (const [sellerId, amount] of sellerMap) {
      const commission = amount * COMMISSION_RATE;
      sellerPayouts.push({
        sellerId,
        grossAmount: amount,
        commission,
        netAmount: amount - commission,
        status: 'pending',
      });
    }

    const newOrder = {
      buyerUid: uid,
      buyerName: buyerName || '',
      buyerAddress: buyerAddress || {},
      buyerPhone: buyerPhone || '',
      buyerEmail: buyerEmail || '',
      items,
      totalAmount,
      currency: 'TRY',
      status: 'pending',
      trackingCode: null,
      cargoCompany: null,
      stripePaymentId: stripePaymentId || null,
      sellerPayouts,
      commissionRate: COMMISSION_RATE,
      platformFee: totalAmount * COMMISSION_RATE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('perde_marketplace_orders').add(newOrder);

    // Satıcıya bildirim (ileride push notification eklenecek)
    console.log(`[PERDE-MARKETPLACE] ✅ Sipariş oluşturuldu: #${docRef.id}, Toplam: ${totalAmount} TL`);

    // Stok düşür
    for (const item of items) {
      if (item.productId) {
        const prodRef = adminDb.collection('perde_marketplace_products').doc(item.productId);
        const prodDoc = await prodRef.get();
        if (prodDoc.exists) {
          const currentStock = prodDoc.data()?.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await prodRef.update({ 
            stock: newStock, 
            salesCount: (prodDoc.data()?.salesCount || 0) + item.quantity,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: docRef.id,
      order: { id: docRef.id, ...newOrder },
    });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Orders POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'buyer'; // buyer | seller
    const orderId = searchParams.get('id');

    // Tek sipariş
    if (orderId) {
      const doc = await adminDb.collection('perde_marketplace_orders').doc(orderId).get();
      if (!doc.exists) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
      return NextResponse.json({ order: { id: doc.id, ...doc.data() } });
    }

    // Liste
    let query: any;
    if (role === 'seller') {
      // Satıcı: items içinde sellerId eşleşen siparişler
      // Firestore array-contains sınırı nedeniyle tüm siparişleri çekip filtreliyoruz
      query = adminDb.collection('perde_marketplace_orders')
        .orderBy('createdAt', 'desc')
        .limit(100);
    } else {
      query = adminDb.collection('perde_marketplace_orders')
        .where('buyerUid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(50);
    }

    const snapshot = await query.get();
    let orders = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Satıcı filtresi (client-side)
    if (role === 'seller') {
      orders = orders.filter((o: any) => 
        o.items?.some((item: any) => item.sellerId === uid) ||
        o.sellerPayouts?.some((p: any) => p.sellerId === uid)
      );
    }

    return NextResponse.json({ orders });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Orders GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT: Sipariş Durumu Güncelle (Satıcı: onay/kargo) ──
export async function PUT(req: NextRequest) {
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
    const { orderId, status, trackingCode, cargoCompany } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId ve status zorunlu" }, { status: 400 });
    }

    const validStatuses = ['confirmed', 'preparing', 'shipped', 'delivered', 'returned', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Geçersiz status. Geçerli: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const updates: any = { status, updatedAt: new Date().toISOString() };
    if (trackingCode) updates.trackingCode = trackingCode;
    if (cargoCompany) updates.cargoCompany = cargoCompany;

    await adminDb.collection('perde_marketplace_orders').doc(orderId).update(updates);

    console.log(`[PERDE-MARKETPLACE] Sipariş #${orderId} durumu: ${status}`);

    return NextResponse.json({ success: true, orderId, status });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Orders PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

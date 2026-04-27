import { NextRequest, NextResponse } from 'next/server';
import { admin, adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';

export const dynamic = 'force-dynamic';

// GET /api/perde/customers
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

    if (!SovereignNodeConfig.customerCollection) {
      return NextResponse.json({ success: false, error: 'Customer collection tanımlanmamış.' }, { status: 500 });
    }

    const customersSnap = await adminDb
      .collection(SovereignNodeConfig.customerCollection)
      .where('dealerUid', '==', uid) // Bayinin kendi müşterileri
      .orderBy('createdAt', 'desc')
      .get();

    const customers = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('[/api/perde/customers GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/perde/customers
// Create a new customer
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
    const { name, phone, email, address, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'name zorunlu.' }, { status: 400 });
    }

    const SovereignNodeConfig = getNode('perde');
    if (!SovereignNodeConfig.customerCollection) {
      throw new Error("Customer collection missing in config");
    }

    const newCustomer = {
      dealerUid: uid,
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
      notes: notes || '',
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection(SovereignNodeConfig.customerCollection).add(newCustomer);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newCustomer } 
    });
  } catch (error: any) {
    console.error('[/api/perde/customers POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

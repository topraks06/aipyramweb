import { NextResponse } from 'next/server';
import { adminDb } from '@aipyram/firebase';
import { getTenant } from '@/lib/tenant-config';

export const dynamic = 'force-dynamic';

// GET /api/perde/customers
export async function GET(req: Request) {
  try {
    if (!adminDb) throw new Error("Firebase Admin not ready");

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid'); 
    const tenantConfig = getTenant('perde');

    if (!uid) {
      return NextResponse.json({ success: false, error: 'Kullanıcı kimliği (uid) gerekli.' }, { status: 400 });
    }

    if (!tenantConfig.customerCollection) {
      return NextResponse.json({ success: false, error: 'Customer collection tanımlanmamış.' }, { status: 500 });
    }

    const customersSnap = await adminDb
      .collection(tenantConfig.customerCollection)
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
export async function POST(req: Request) {
  try {
    if (!adminDb) throw new Error("Firebase Admin not ready");

    const body = await req.json();
    const { uid, name, phone, email, address, notes } = body;

    if (!uid || !name) {
      return NextResponse.json({ success: false, error: 'uid ve name zorunlu.' }, { status: 400 });
    }

    const tenantConfig = getTenant('perde');
    if (!tenantConfig.customerCollection) {
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

    const docRef = await adminDb.collection(tenantConfig.customerCollection).add(newCustomer);

    return NextResponse.json({ 
      success: true, 
      data: { id: docRef.id, ...newCustomer } 
    });
  } catch (error: any) {
    console.error('[/api/perde/customers POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

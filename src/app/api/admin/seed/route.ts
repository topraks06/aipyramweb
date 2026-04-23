import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');

  if (secret !== 'hometex-demo-2026') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!adminDb) throw new Error("Firebase Admin not ready");

    // 1. Seed Perde Orders
    const perdeOrdersRef = adminDb.collection('perde_orders');
    const demoOrders = [
      {
        uid: 'demo-dealer-1',
        customerName: 'Hilton İstanbul',
        customerPhone: '+90 555 111 2233',
        amount: 14500,
        status: 's2',
        createdAt: new Date(),
        items: [
          { name: 'Blackout Motorlu Sahne Perdesi', width_cm: 600, height_cm: 300, fabricType: 'blackout', price: 10000, quantity: 1 },
          { name: 'Premium Fon Perde', width_cm: 300, height_cm: 300, fabricType: 'fon', price: 4500, quantity: 2 }
        ]
      },
      {
        uid: 'demo-dealer-1',
        customerName: 'Ağaoğlu MyWorld',
        customerPhone: '+90 555 999 8877',
        amount: 2800,
        status: 's1',
        createdAt: new Date(),
        items: [
          { name: 'Salon Zebra Store', width_cm: 200, height_cm: 250, fabricType: 'zebra', price: 2800, quantity: 1 }
        ]
      }
    ];

    for (const order of demoOrders) {
      await perdeOrdersRef.add(order);
    }

    // 2. Seed Wallets
    await adminDb.collection('perde_wallets').doc('demo-dealer-1').set({
      balance: 1500,
      totalSpent: 450,
      tenant: 'perde',
      createdAt: new Date().toISOString()
    }, { merge: true });

    await adminDb.collection('trtex_wallets').doc('auto-runner').set({
      balance: 5000,
      totalSpent: 120,
      tenant: 'trtex',
      createdAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'Fuar 19 Mayıs Demo verileri başarıyla yüklendi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

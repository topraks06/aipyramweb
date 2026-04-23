import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Gerçek Sovereign cüzdan verilerini çek
    const walletsSnap = await adminDb.collection('sovereign_wallets').get();
    let currentWallets: Record<string, number> = { trtex: 0, perde: 0, hometex: 0, vorhang: 0 };
    
    walletsSnap.forEach(doc => {
      const data = doc.data();
      const node = doc.id; // trtex, perde, vs.
      if (node in currentWallets) {
        currentWallets[node] = data.consumed_credits || 0;
      }
    });

    // Anlık tabloyu simüle et (Zaman serisi olmadığı için tek/son nokta olarak gönderiyoruz)
    // Gerçek sistemde bu "daily_cost" tablolarından map edilecektir.
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const data: any[] = [
      {
        time: timeStr,
        trtex: currentWallets.trtex,
        perde: currentWallets.perde,
        hometex: currentWallets.hometex,
        vorhang: currentWallets.vorhang
      }
    ];

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: any) {
    console.error('[AdminEconomy API] Error fetching history:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

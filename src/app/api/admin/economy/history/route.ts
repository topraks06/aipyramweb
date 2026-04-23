import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Gerçek bir senaryoda bu veri 'wallet_transactions' koleksiyonundan zaman serisi olarak çekilir
    // Şimdilik, veritabanı yapımızda zaman serisi tutulmuyorsa anlık totalSpent'i gösterelim
    // Veya Firebase'den geçmiş 24 saatin transaction'larını çekelim
    
    // Fallback: Return empty array for now since we don't have historical data seeded.
    // DUMB CLIENT: Asla mock gönderme. Veri yoksa boş array gönder.
    const data: any[] = [];

    // Örnek Firestore okuma (Eğer 'economy_history' diye bir tablo olsaydı):
    /*
    const historySnap = await adminDb.collection('economy_history').orderBy('timestamp', 'asc').limit(24).get();
    historySnap.forEach(doc => {
      data.push(doc.data());
    });
    */

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: any) {
    console.error('[AdminEconomy API] Error fetching history:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

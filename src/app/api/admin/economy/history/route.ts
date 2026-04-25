import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Get the start of today in local time
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 2. Fetch aloha_costs for today
    const costsSnap = await adminDb.collection('aloha_costs')
      .where('timestamp', '>=', startOfToday)
      .orderBy('timestamp', 'asc')
      .get();

    // 3. Initialize hourly buckets from 0 to current hour
    const currentHour = now.getHours();
    const hourlyData: Record<number, { trtex: number, perde: number, hometex: number, vorhang: number }> = {};
    
    for (let h = 0; h <= currentHour; h++) {
      hourlyData[h] = { trtex: 0, perde: 0, hometex: 0, vorhang: 0 };
    }

    // 4. Aggregate costs into buckets (not cumulative yet)
    costsSnap.forEach(doc => {
      const data = doc.data();
      const node = data.node || 'global';
      const cost = data.estimatedCost || 0;
      const timestamp = data.timestamp.toDate();
      const hour = timestamp.getHours();

      if (hour <= currentHour && hourlyData[hour]) {
        if (node === 'trtex' || node === 'perde' || node === 'hometex' || node === 'vorhang') {
          hourlyData[hour][node] += cost;
        } else {
          // If global or other, we could optionally spread it or just log it
        }
      }
    });

    // 5. Convert to cumulative sum array for Recharts
    const data: any[] = [];
    let cumTrtex = 0;
    let cumPerde = 0;
    let cumHometex = 0;
    let cumVorhang = 0;

    for (let h = 0; h <= currentHour; h++) {
      cumTrtex += hourlyData[h].trtex;
      cumPerde += hourlyData[h].perde;
      cumHometex += hourlyData[h].hometex;
      cumVorhang += hourlyData[h].vorhang;
      
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      
      data.push({
        time: timeStr,
        trtex: cumTrtex,
        perde: cumPerde,
        hometex: cumHometex,
        vorhang: cumVorhang
      });
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: any) {
    console.error('[AdminEconomy API] Error fetching history:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

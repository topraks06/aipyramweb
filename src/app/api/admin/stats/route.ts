import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Total Domains / Tenants
    const totalDomains = 0; // Gerçek veritabanı eklenecek
    const activeAgents = 0; // Gerçek Sovereign Swarm verisi eklenecek
    const totalSectors = 0; // Gerçek veri eklenecek

    // 2. Fetch User Stats (Mocking or aggregating for now)
    const perdeMembersSnap = await adminDb.collection('perde_members').count().get();
    const hometexMembersSnap = await adminDb.collection('exhibitors').count().get(); // Example
    const totalUsers = perdeMembersSnap.data().count + hometexMembersSnap.data().count;

    // 3. Fetch Signals (Ecosystem Bus Activity)
    const signalsSnap = await adminDb.collection('ecosystem_signals').count().get();
    const pendingTasks = signalsSnap.data().count;

    // 4. Tasks/Logs (Sovereign)
    const logsSnap = await adminDb.collection('aloha_sovereign_logs').count().get();
    const completedTasks = logsSnap.data().count;
    
    // DLQ errors (Real data)
    const dlqSnap = await adminDb.collection('aloha_sovereign_dlq').where('resolved', '==', false).count().get();
    const failedTasks = dlqSnap.data().count;
    
    // Wallets snapshot (Total spent across all active tenants)
    let totalSpent = 0;
    const tenants = ['perde', 'trtex', 'hometex', 'vorhang'];
    for (const tenant of tenants) {
      try {
        const walletsSnap = await adminDb.collection(`${tenant}_wallets`).get();
        walletsSnap.forEach(doc => {
          totalSpent += doc.data()?.totalSpent || 0;
        });
      } catch (e) {
         // Collection might not exist yet
      }
    }
    
    const automationRules = 0; // Gerçek veri eklenecek

    return NextResponse.json({
      success: true,
      data: {
        totalDomains,
        totalAgents: activeAgents,
        activeAgents,
        pendingTasks,
        completedTasks,
        failedTasks,
        totalSectors,
        automationRules,
        totalUsers,
        totalCreditsSpent: totalSpent
      }
    });

  } catch (error: any) {
    console.error('[AdminStats API] Error fetching stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Total Domains / Tenants (Hardcoded based on config for now, or just return 4)
    const totalDomains = 4;
    const activeAgents = 33; // Sovereign Swarm
    const totalSectors = 3; // Textile, Curtain, E-commerce

    // 2. Fetch User Stats (Mocking or aggregating for now)
    const perdeMembersSnap = await adminDb.collection('perde_members').count().get();
    const hometexMembersSnap = await adminDb.collection('exhibitors').count().get(); // Example
    const totalUsers = perdeMembersSnap.data().count + hometexMembersSnap.data().count;

    // 3. Fetch Signals (Ecosystem Bus Activity)
    const signalsSnap = await adminDb.collection('ecosystem_signals').count().get();
    const pendingTasks = signalsSnap.data().count;

    // 4. Tasks/Logs
    const logsSnap = await adminDb.collection('aloha_agent_logs').count().get();
    const completedTasks = logsSnap.data().count;
    
    // We can simulate some failed tasks based on logs or default to 0
    const failedTasks = 0;
    
    const automationRules = 15; // Example count of active rules

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
        totalUsers
      }
    });

  } catch (error: any) {
    console.error('[AdminStats API] Error fetching stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

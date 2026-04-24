import { NextResponse } from 'next/server';
import os from 'os';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // 1. CPU
    const cpus = os.cpus();
    const cpuCount = cpus.length;
    let totalIdle = 0;
    let totalTick = 0;

    for (let i = 0, len = cpus.length; i < len; i++) {
        const cpu = cpus[i];
        for (const type in cpu.times) {
            totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
    }
    const idlePercentage = totalIdle / totalTick;
    const cpuUsage = Math.round((1 - idlePercentage) * 100);

    // 2. RAM
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const activeRamGb = (usedMem / (1024 * 1024 * 1024)).toFixed(1);
    
    // 3. Network (Mock/Simulated 10-35ms)
    // Server'dan Firestore'a (ping) var sayarsak 
    const netLatency = Math.floor(Math.random() * 25) + 10;

    // 4. Financial Pulse (CHF, EUR from TCMB or fallback)
    let eurUsd = "1.080";
    let chfTry = "36.50";
    let poyTexture = "42.0";

    try {
       const terminalDoc = await adminDb.collection('trtex_terminal').doc('current').get();
       if (terminalDoc.exists) {
           const data = terminalDoc.data();
           if (data?.market) {
               eurUsd = data.market.eurUsd?.toFixed(3) || eurUsd;
               chfTry = data.market.chfTry?.toFixed(2) || chfTry;
               poyTexture = data.market.poyTexture?.toFixed(1) || poyTexture;
           }
       }
    } catch (e) {
       console.error("Firestore market pulse error", e);
    }

    return NextResponse.json({
       cpu: cpuUsage,
       ramGb: activeRamGb,
       netMs: netLatency,
       market: {
          eurUsd,
          chfTry,
          poyTexture
       }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

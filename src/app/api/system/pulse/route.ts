import { NextResponse } from 'next/server';
import os from 'os';

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
    // In a real prod environment we would cache TCMB responses. We'll use semi-static data with slight random fluctuation for visual "pulse" if no API.
    // For now we simulate an active TR market pulse for POY.
    const eurUsd = (1.08 + (Math.random() * 0.02)).toFixed(3);
    const chfTry = (36.50 + (Math.random() * 0.40)).toFixed(2);
    const poyTexture = (42.0 + (Math.random() * 1.5)).toFixed(1);

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

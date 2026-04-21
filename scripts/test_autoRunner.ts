import 'dotenv/config';
import { runAlohaCycle } from '../src/core/aloha/autoRunner';

async function main() {
    console.log("=== OTONOM SOVEREIGN SWARM TESTİ BAŞLIYOR (TRTEX) ===");
    try {
        const result = await runAlohaCycle('trtex');
        console.log("\n=== TEST SONUCU ===");
        console.log(JSON.stringify(result, null, 2));
    } catch(e: any) {
        console.error("Test Hatası:", e);
    }
}

main().catch(console.error);

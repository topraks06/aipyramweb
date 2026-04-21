import 'dotenv/config';
import { collectSignals } from '../src/core/aloha/signalCollector';

async function testCollector() {
  console.log('[TEST] Otonom Sinyal Toplama (Market Impact & Commercial Trigger Test) başlıyor...');
  const result = await collectSignals('trtex');
  
  console.log('--- TEST SONUCU ---');
  console.log(JSON.stringify(result, null, 2));
}

testCollector().catch(console.error);

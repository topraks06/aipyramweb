import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';

async function check() {
  const cutoff = new Date(Date.now() - 10 * 60000).toISOString();
  for(let i=0; i<15; i++) {
    const snap = await adminDb.collection('trtex_news').where('createdAt', '>=', cutoff).orderBy('createdAt', 'desc').get();
    for (const doc of snap.docs) {
      const data = doc.data();
      if ((data.routing_signals && data.routing_signals.academy_value >= 0.6) || data.category === 'Akademi' || data.title.includes('Rehber') || data.title.includes('Nasýl')) {
         console.log('BULUNDU: ' + data.title);
         process.exit(0);
      }
    }
    console.log('Bekleniyor...');
    await new Promise(r => setTimeout(r, 10000));
  }
  console.log('Bulunamadi');
}
check().catch(console.error);

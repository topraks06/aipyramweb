import 'dotenv/config';
import { executeToolCall } from './src/core/aloha/engine';
import { adminDb } from './src/lib/firebase-admin';

async function main() {
  console.log('Running compose_article...');
  try {
    const res = await executeToolCall({
      name: 'compose_article',
      args: {
        topic: 'Hometex Istanbul 2025: TETSIAD Organizasyonunda Turk Ev Tekstili Sektorunun Kuresel Bulusmasi',
        project: 'trtex',
        category: 'Fuar Istihbarat',
        word_count: 1500,
        image_count: 3
      }
    });
    console.log('Result:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
main();

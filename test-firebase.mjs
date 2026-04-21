import admin from 'firebase-admin';
import fs from 'fs';

// SA Key
const keyPath = './firebase-sa-key.json';
let initialized = false;
if (fs.existsSync(keyPath)) {
  const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  console.log('[OK] Firebase initialized with local SA key');
  initialized = true;
} 

if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  console.log('[OK] Firebase initialized with env SA key');
  initialized = true;
}

if (!initialized) {
  console.log('[SKIP] No SA key found, trying applicationDefault');
  admin.initializeApp();
}

const db = admin.firestore();
console.log('db type:', typeof db);
console.log('collection type:', typeof db.collection);

const col = db.collection('trtex_news');
console.log('col type:', typeof col);
console.log('col.limit type:', typeof col.limit);
console.log('col.where type:', typeof col.where);
console.log('col.get type:', typeof col.get);

// Try actual read
try {
  const snap = await col.limit(3).get();
  console.log(`[SUCCESS] Got ${snap.size} docs from trtex_news`);
  snap.forEach(doc => {
    const d = doc.data();
    console.log(`  - ${doc.id}: ${d.title || d.translations?.TR?.title || 'no title'}`);
  });
} catch (e) {
  console.log(`[ERROR] ${e.message}`);
}

process.exit(0);

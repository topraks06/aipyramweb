import admin from 'firebase-admin';
import fs from 'fs';
const sa = JSON.parse(fs.readFileSync('./firebase-sa-key.json','utf8'));
if (!admin.apps.length) admin.initializeApp({credential:admin.credential.cert(sa)});
const db = admin.firestore();
const snap = await db.collection('trtex_news').get();
let empty=0,short=0,ok=0,noKw=0;
for (const doc of snap.docs) {
  const d = doc.data();
  const body = d.translations?.TR?.content || d.content || d.body || '';
  const kw = d.seo?.keywords || d.seo_keywords || [];
  if (body.length < 50) empty++;
  else if (body.length < 500) short++;
  else ok++;
  const kwStr = kw.join(' ').toLowerCase();
  if (!kwStr.includes('perde') || !kwStr.includes('ev tekstili')) noKw++;
}
console.log(`Total: ${snap.size} | Empty: ${empty} | Short: ${short} | OK: ${ok} | NoMandatoryKw: ${noKw}`);
process.exit(0);

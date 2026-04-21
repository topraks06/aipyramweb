import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 1. Düzeltme Kodunu (Aloha'nın üreteceği Shell payloadu temsil eder) temp dosyaya yazar
const fixScript = `
const fs = require('fs');
const path = require('path');
const file = path.resolve('C:/Users/MSI/Desktop/projeler zip/trtex.com/src/components/home/NewsGrid10.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. unstable_cache bagini kes ve kaldir
content = content.replace(/import { unstable_cache } from 'next\\/cache';\\n/g, '');

// 2. getSiteBrainData fonksiyonunu tamamen rewrite et
const badFunctionMatch = /const getSiteBrainData = unstable_cache\\([\\s\\S]*?\\);/m;
const newFunction = \`export const dynamic = 'force-dynamic';\\n\\nasync function getSiteBrainData() {\\n  const localNews = await getPublishedNews();\\n  return localNews || [];\\n}\`;
content = content.replace(badFunctionMatch, newFunction);

fs.writeFileSync(file, content, 'utf8');
console.log("[ALOHA-AUTONOMOUS-FIX] TRTEX NewsGrid10.tsx başarıyla düzeltildi! Cache silindi, Local CMS aktif edildi.");
`;

const fixPath = path.resolve('C:/Users/MSI/Desktop/projeler zip/trtex.com/scripts/aloha_fix_newsgrid.js');
fs.writeFileSync(fixPath, fixScript, 'utf8');

// 2. Otonom Kuyruğa İşi At

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      admin.initializeApp({
         credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      });
    } else {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
}

async function emitSignal() {
  const db = admin.firestore();
  console.log("➡️ [ALOHA MASTER] Otonom Onarım Emri Kuyruğa Gönderiliyor...");

  const targetCmd = `cd "C:/Users/MSI/Desktop/projeler zip/trtex.com" && node scripts/aloha_fix_newsgrid.js`;
  
  const jobRef = await db.collection("aloha_jobs").add({
    taskId: "repair_trtex_" + Date.now(),
    actionType: 'SHELL_COMMAND',
    payload: { command: targetCmd },
    status: 'queued',
    createdAt: Date.now(),
  });

  console.log(`✅ [ALOHA MASTER] İş ID'si: ${jobRef.id}`);
  process.exit(0);
}

emitSignal();

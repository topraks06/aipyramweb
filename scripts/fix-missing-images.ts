import { scanAndGenerateImages } from '../src/core/aloha/missing-image-scanner';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Starting missing image scanner for trtex_news...");
  try {
    const result = await scanAndGenerateImages('trtex_news', 10, false); // limit 10 to be safe
    console.log("Scanner completed successfully!");
  } catch (e) {
    console.error("Scanner failed:", e);
  }
  process.exit(0);
}

run();

/**
 * TRTEX Fuar Seed Data — 2026 Gerçek Fuarlar
 * Tek seferlik çalıştırılır: tsx scripts/seed-fairs.ts
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { adminDb } from '../src/lib/firebase-admin';

const FAIRS_2026 = [
  {
    name: "Heimtextil 2026",
    location: "Frankfurt, Germany",
    continent: "Europe",
    date: "2026-01-13",
    dates: "13–16 Ocak 2026",
    attendees: "60,000+",
    link: "https://heimtextil.messefrankfurt.com",
    status: "active",
    category: "ev_tekstili",
  },
  {
    name: "Texworld Paris",
    location: "Paris, France",
    continent: "Europe",
    date: "2026-02-09",
    dates: "9–11 Şubat 2026",
    attendees: "20,000+",
    link: "https://texworld-paris.fr.messefrankfurt.com",
    status: "active",
    category: "kumaş",
  },
  {
    name: "Hometex İstanbul",
    location: "İstanbul, Türkiye",
    continent: "Europe",
    date: "2026-05-13",
    dates: "13–16 Mayıs 2026",
    attendees: "45,000+",
    link: "https://www.hometex.com.tr",
    status: "active",
    category: "ev_tekstili",
  },
  {
    name: "Intertextile Shanghai",
    location: "Shanghai, China",
    continent: "Asia",
    date: "2026-03-24",
    dates: "24–26 Mart 2026",
    attendees: "80,000+",
    link: "https://intertextile-shanghai-hometextiles.hk.messefrankfurt.com",
    status: "active",
    category: "ev_tekstili",
  },
  {
    name: "Maison & Objet",
    location: "Paris, France",
    continent: "Europe",
    date: "2026-01-22",
    dates: "22–26 Ocak 2026",
    attendees: "75,000+",
    link: "https://www.maison-objet.com",
    status: "active",
    category: "dekorasyon",
  },
  {
    name: "DOMOTEX Hannover",
    location: "Hannover, Germany",
    continent: "Europe",
    date: "2026-01-16",
    dates: "16–19 Ocak 2026",
    attendees: "35,000+",
    link: "https://www.domotex.de",
    status: "active",
    category: "halı",
  },
  {
    name: "ITMA Asia + CITME",
    location: "Shanghai, China",
    continent: "Asia",
    date: "2026-10-20",
    dates: "20–24 Ekim 2026",
    attendees: "100,000+",
    link: "https://www.itmaasia.com",
    status: "active",
    category: "makine",
  },
  {
    name: "R+T Stuttgart",
    location: "Stuttgart, Germany",
    continent: "Europe",
    date: "2027-02-22",
    dates: "22–26 Şubat 2027",
    attendees: "50,000+",
    link: "https://www.messe-stuttgart.de/r-t",
    status: "active",
    category: "perde_aksesuar",
  },
];

async function seedFairs() {
  console.log('[SEED] 🏛️ Fuar verileri Firestore\'a yazılıyor...');
  
  const batch = adminDb.batch();
  
  for (const fair of FAIRS_2026) {
    const docId = fair.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    batch.set(adminDb.collection('trtex_fairs').doc(docId), fair);
    console.log(`  → ${fair.name} (${fair.date})`);
  }
  
  await batch.commit();
  console.log(`[SEED] ✅ ${FAIRS_2026.length} fuar yazıldı.`);
  process.exit(0);
}

seedFairs().catch(err => {
  console.error('[SEED] ❌ Hata:', err);
  process.exit(1);
});

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';

if (existsSync('.env.local')) {
  const envConfig = dotenv.parse(readFileSync('.env.local'))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (err) {
  console.error("No service account found in env");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

const fairs = [
  {
    name: 'Heimtextil 2026',
    location: 'Frankfurt, Almanya',
    continent: 'Avrupa',
    date: '2026-01-13T09:00:00Z',
    attendees: 'B2B İthalatçı',
    link: 'https://heimtextil.messefrankfurt.com',
    status: 'active'
  },
  {
    name: 'Hometex 2026',
    location: 'İstanbul, Türkiye',
    continent: 'Avrupa',
    date: '2026-05-20T09:00:00Z',
    attendees: 'Üretici, İhracatçı, Alım Heyetleri',
    link: 'https://hometex.com.tr',
    status: 'active'
  },
  {
    name: 'Proposte 2026',
    location: 'Como, İtalya',
    continent: 'Avrupa',
    date: '2026-05-02T09:00:00Z',
    attendees: 'Premium Üreticiler',
    link: 'https://www.propostefair.it',
    status: 'active'
  },
  {
    name: 'Intertextile Shanghai Home 2026',
    location: 'Shanghai, Çin',
    continent: 'Asya',
    date: '2026-08-15T09:00:00Z',
    attendees: 'Küresel Tedarikçiler',
    link: 'https://intertextile-shanghai-hometextiles-autumn.hk.messefrankfurt.com',
    status: 'active'
  }
];

async function seed() {
  const batch = db.batch();
  for (const fair of fairs) {
    const slug = fair.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ref = db.collection('trtex_fairs').doc(slug);
    batch.set(ref, fair);
  }
  await batch.commit();
  console.log("Fairs seeded!");
  process.exit(0);
}

seed();

import { adminDb } from '../src/lib/firebase-admin';

async function main() {
  try {
    const colls = await adminDb.listCollections();
    console.log("Koleksiyon Listesi:");
    console.log(colls.map(c => c.id).join(', '));
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

main();

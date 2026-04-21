import { adminDb } from './src/lib/firebase-admin';

async function check() {
   const d = await adminDb.collection("trtex_terminal").doc("current").get();
   const data = d.data();
   console.log("Hero Article:", data.heroArticle.id, data.heroArticle.slug, data.heroArticle.images);
   console.log("Translations:", data.heroArticle.translations);
   console.log("Radar:", data.radarStream);
   console.log("Haftanin Firsatlari:", data.haftaninFirsatlari);
   process.exit(0);
}
check().catch(console.error);

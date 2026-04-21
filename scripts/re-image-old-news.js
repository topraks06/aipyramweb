const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// INIT API
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

// INIT FIREBASE
let adminApp;
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "perde-ai.firebasestorage.app"
  });
} else {
  adminApp = getApps()[0];
}
const db = getFirestore(adminApp);

const PROMPT = `Sen Sovereign Editorial 4.0 sisteminin Image Agent'ısın.
Aşağıda verilen haber metnine göre, Sovereign 4.0 kurallarına %100 uyarak İNGİLİZCE "image_prompts" dizisi üret:

1- MİKRO (85mm - SOUL): Kumaşın/ürünün/hammadenin ultra-yakın detayı. Dramatik ışık, siyah fon. "Bu kalite premium" hissi.
2- MEZO (50mm - TRADE): Ticaret/Fuar sahnesi. Anlaşma hissi, showroom, lüks B2B estetiği.
3- MAKRO (24-35mm - DREAM): Architectural Digest kalitesinde, güneş ışığı alan final lüks bir dekorasyon. (Haber ne olursa olsun son görsel lüks bir mekan olmalı).

DİNAMİK ADAPTASYON:
- %80 Ticaret: Eğer haber satış/ihracat ise ticaret vurgulu.
- %10 Lojistik: Konteyner YASAK, sunset cinematic liman serbest.
- %10 Hammadde: Tarla YASAK, mücevher gibi iplik makro.

YASAK: Manifaturacı, dağınık kaotik dükkan, eski depo, pis laboratuvar.

JSON formatında döndür:
{
  "image_prompts": ["hero: wide shot", "mid: texture shot", "detail: room decorative shot"]
}
`;

async function run() {
  console.log('🔄 B2B Master Regeneration Script BAŞLIYOR... (TÜMÜ)');
  
  const snapshot = await db.collection('trtex_news')
                           .orderBy('published_at', 'asc')
                           .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      const textToAnalyze = `BAŞLIK: ${data.title}\nÖZET: ${data.summary}\n`;
      const response = await model.generateContent(PROMPT + '\n\n' + textToAnalyze);
      
      const txt = response.response.text();
      const match = txt.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.image_prompts && parsed.image_prompts.length === 3) {
          
          await doc.ref.update({
             image_url: '',
             mid_image_url: '',
             detail_image_url: '',
             image_status: 'pending',
             needs_image: true,
             image_prompts: parsed.image_prompts
          });

          await db.collection('trtex_image_queue').add({
             articleId: doc.id,
             project: 'trtex',
             heroPrompt: parsed.image_prompts[0],
             midPrompt: parsed.image_prompts[1],
             detailPrompt: parsed.image_prompts[2],
             status: 'pending',
             retryCount: 0,
             pendingRoles: ['hero', 'mid', 'detail'],
             createdAt: new Date().toISOString()
          });

          console.log(`✅ ${doc.id} -> Kuyruğa eklendi!`);
        }
      }
    } catch(e) {
      console.error(`❌ HATA (${doc.id}):`, e.message);
    }
  }
}

run();

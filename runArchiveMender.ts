import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb } from './src/lib/firebase-admin';
import { alohaAI } from './src/core/aloha/aiClient';
import { generateTripleImagePrompts } from './src/core/aloha/visualDNA';

const ai = alohaAI.getClient();

async function run() {
  console.log('--- SOVEREIGN ARCHIVE MENDER V2 ---');
  console.log('AI Audit enabled for Commercial Gravity Check');
  
  const snapshot = await adminDb.collection('trtex_news').get();
  console.log(`Found ${snapshot.size} articles.`);
  
  let processed = 0;
  let archived = 0;
  let imgQueues = 0;
  let transQueues = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    processed++;
    
    // Check if recently audited
    if (data.visual_dna_version === '2.1') {
       continue;
    }

    const title = data.title || data.TR?.title || '';
    const content = data.content || data.body || '';
    
    // 1. AI GRAVITY AUDIT
    let gravity = data.quality_score;
    let isB2B = true;
    
    if (!gravity || gravity < 50) {
        try {
            const prompt = `Lütfen aşağıdaki haber metnini B2B tekstil ticaret değeri (Gravity) açısından değerlendir. Moda, magazin, tüketici haberi ise 0 ver. Somut ticaret, hammadde, ihracat bağlantısı varsa yüksek ver.
HABER: ${title}
${content.substring(0,400)}

SADECE JSON döndür:
{ "gravity_score": 0-100, "is_b2b": true|false }`;
            const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
            if (res.text) {
                const parsed = JSON.parse(res.text);
                gravity = parsed.gravity_score;
                isB2B = parsed.is_b2b;
            }
        } catch(e) {
            console.log(`Audit failed for ${doc.id}`);
            gravity = 50; 
        }
    }
    
    let status = 'published';
    if (!isB2B || gravity < 40) {
       status = 'archived';
       archived++;
       console.log(`[ARCHIVED] ${title.substring(0,40)} (Gravity: ${gravity})`);
    }

    // 2. IMAGE ENFORCEMENT
    let heroPrompt = '';
    let midPrompt = '';
    let detailPrompt = '';
    const hasValidHero = data.image_url && !data.image_url.includes('placeholder') && !data.image_url.includes('unsplash');
    
    if (!hasValidHero && status === 'published') {
       const tags = data.tags || data.seo?.keywords || [];
       const triple = generateTripleImagePrompts(title || 'Tekstil Haber', data.category || 'Pazar', tags);
       
       await adminDb.collection('trtex_image_queue').doc(doc.id).set({
           articleId: doc.id,
           heroPrompt: triple.hero.prompt,
           midPrompt: triple.mid.prompt,
           detailPrompt: triple.detail.prompt,
           status: 'pending',
           retryCount: 0,
           pendingRoles: ['hero', 'mid', 'detail'],
           createdAt: new Date().toISOString()
       }, { merge: true });
       imgQueues++;
    }
    
    // 3. TRANSLATION CHECK (ZH, EN missing?)
    const hasTranslations = data.translations && data.translations.EN && data.translations.ZH;
    if (!hasTranslations && status === 'published') {
       await adminDb.collection('trtex_translation_queue').doc(doc.id).set({
           articleId: doc.id,
           status: 'pending',
           targets: ['EN', 'ZH', 'RU', 'AR', 'DE', 'FR', 'ES', 'IT'],
           createdAt: new Date().toISOString() // Wait for a translator worker or just mark it
       }, { merge: true });
       transQueues++;
    }
    
    await doc.ref.update({
       status,
       quality_score: Math.max(gravity || 50, 50),
       visual_dna_version: '2.1'
    });
    
    if (processed % 10 === 0) console.log(`Processed ${processed}/${snapshot.size} ...`);
  }
  
  console.log('--- COMPLETED ---');
  console.log(`Archived (Low Gravity): ${archived}`);
  console.log(`Image Queued: ${imgQueues}`);
  console.log(`Translation Queued: ${transQueues}`);
}

run().catch(console.error);

const { adminDb } = require('./src/lib/firebase-admin');
async function run() {
  const c = await adminDb.collection('trtex_news').limit(1).orderBy('created_at', 'desc').get();
  const a = c.docs[0];
  const d = a.data();
  console.log('Article:', d.title);
  
  if (d.image_prompts && d.image_prompts.length > 0) {
    const qDoc = {
       articleId: a.id,
       heroPrompt: d.image_prompts[0],
       midPrompt: d.image_prompts[1] || d.image_prompts[0],
       detailPrompt: d.image_prompts[2] || d.image_prompts[0],
       status: 'pending',
       retryCount: 0,
       pendingRoles: ['hero', 'mid', 'detail']
    };
    await adminDb.collection('trtex_image_queue').add(qDoc);
    console.log('Added to queue');
  }
}
run().catch(console.error);

import admin from 'firebase-admin';
import fs from 'fs';

const sa = JSON.parse(fs.readFileSync('./firebase-sa-key.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const snap = await db.collection('trtex_news').limit(200).get();
console.log(`Total: ${snap.size} articles\n`);

const all = [];
for (const doc of snap.docs) {
  const d = doc.data();
  const title = d.translations?.TR?.title || d.title || 'NO TITLE';
  const body = d.translations?.TR?.body || d.body || '';
  const img = d.image_url || d.imageUrl || '';
  const keywords = d.seo_keywords || d.keywords || [];
  const aiComment = d.ai_commentary || '';
  const pubDate = d.publishedAt || d.published_at || d.createdAt || '';
  
  // Image quality checks
  const hasImg = img && img.length > 10;
  const isUnsplash = img.includes('unsplash');
  const isPlaceholder = img.includes('placeholder') || img.includes('picsum');
  const isBase64 = img.startsWith('data:');
  const isFirebaseStorage = img.includes('firebasestorage');
  const isEmpty = !hasImg;
  
  // Content quality checks
  const bodyLength = body.length;
  const hasKeywords = keywords.length >= 8;
  const hasAiComment = aiComment.length > 20;
  const titleLength = title.length;
  
  // Issues
  const issues = [];
  if (isEmpty) issues.push('❌ GÖRSEL YOK');
  if (isUnsplash) issues.push('⚠️ UNSPLASH (stok)');
  if (isPlaceholder) issues.push('❌ PLACEHOLDER');
  if (isBase64) issues.push('⚠️ BASE64');
  if (bodyLength < 200) issues.push('❌ İÇERİK ÇOK KISA');
  if (bodyLength < 500 && bodyLength >= 200) issues.push('⚠️ İÇERİK KISA');
  if (!hasKeywords) issues.push(`⚠️ KEYWORD AZ (${keywords.length})`);
  if (!hasAiComment) issues.push('⚠️ AI YORUM YOK');
  if (titleLength < 20) issues.push('⚠️ BAŞLIK KISA');
  
  all.push({
    id: doc.id,
    title: title.substring(0, 90),
    img: img ? img.substring(0, 100) : 'EMPTY',
    imgType: isEmpty ? 'EMPTY' : isUnsplash ? 'UNSPLASH' : isFirebaseStorage ? 'FIREBASE' : isBase64 ? 'BASE64' : 'OTHER',
    bodyLen: bodyLength,
    keywordCount: keywords.length,
    hasAiComment,
    pubDate: pubDate.substring(0, 10),
    issues,
    issueCount: issues.length
  });
}

// Sort by issue count (worst first)
all.sort((a, b) => b.issueCount - a.issueCount);

console.log('═══════════════════════════════════════════════');
console.log('  TRTEX HABER KALİTE RAPORU');
console.log('═══════════════════════════════════════════════\n');

// Stats
const empty = all.filter(a => a.imgType === 'EMPTY').length;
const unsplash = all.filter(a => a.imgType === 'UNSPLASH').length;
const firebase = all.filter(a => a.imgType === 'FIREBASE').length;
const shortContent = all.filter(a => a.bodyLen < 500).length;
const noKeywords = all.filter(a => a.keywordCount < 8).length;
const noAi = all.filter(a => !a.hasAiComment).length;

console.log(`📊 ÖZET:`);
console.log(`  Toplam: ${all.length}`);
console.log(`  ❌ Görselsiz: ${empty}`);
console.log(`  ⚠️ Unsplash stok: ${unsplash}`);
console.log(`  ✅ Firebase (AI): ${firebase}`);
console.log(`  ❌ İçerik kısa (<500): ${shortContent}`);
console.log(`  ⚠️ Keyword az (<8): ${noKeywords}`);
console.log(`  ⚠️ AI yorum yok: ${noAi}\n`);

console.log('═══════════════════════════════════════════════');
console.log('  SORUNLU HABERLER (WORST FIRST)');
console.log('═══════════════════════════════════════════════\n');

for (const item of all.filter(a => a.issueCount > 0)) {
  console.log(`[${item.id}]`);
  console.log(`  📰 ${item.title}`);
  console.log(`  📅 ${item.pubDate} | 📝 ${item.bodyLen} chr | 🏷️ ${item.keywordCount} kw | 🖼️ ${item.imgType}`);
  console.log(`  ⚠️ ${item.issues.join(' | ')}`);
  console.log('');
}

process.exit(0);

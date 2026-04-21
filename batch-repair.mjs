import admin from 'firebase-admin';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

// ═══════════════════════════════════════════════════
//  TRTEX HABER BATCH REPAİR SCRİPT
//  Faz 1: Keyword düzeltme (tüm haberler)
//  Faz 2: Boş body'li haberler için içerik üretme
//  Faz 3: Unsplash görselleri AI ile değiştirme
// ═══════════════════════════════════════════════════

const sa = JSON.parse(fs.readFileSync('./firebase-sa-key.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Zorunlu keywordler — her haberde olmalı
const MANDATORY_KEYWORDS = ['perde', 'ev tekstili', 'dekorasyon'];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════
//  FAZ 1: KEYWORD DÜZELTME (hızlı, API yok)
// ═══════════════════════════════════════
async function fixKeywords() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  FAZ 1: KEYWORD DÜZELTME             ║');
  console.log('╚══════════════════════════════════════╝\n');
  
  const snap = await db.collection('trtex_news').get();
  let fixed = 0;
  
  for (const doc of snap.docs) {
    const d = doc.data();
    const title = d.translations?.TR?.title || d.title || '';
    const existingKw = d.seo?.keywords || d.seo_keywords || [];
    
    // Zorunlu keywordleri kontrol et
    const missing = MANDATORY_KEYWORDS.filter(mk => 
      !existingKw.some(k => k.toLowerCase().includes(mk))
    );
    
    if (missing.length > 0 || existingKw.length < 8) {
      // Başlıktan 5 ek keyword çıkar
      const titleWords = title.split(/\s+/).filter(w => w.length > 3);
      const extraKw = titleWords.slice(0, 5).map(w => w.toLowerCase().replace(/[^a-züçşğöı]/g, ''));
      
      const newKeywords = [
        ...new Set([
          ...MANDATORY_KEYWORDS,
          ...existingKw.map(k => k.toLowerCase()),
          ...extraKw,
          'türk tekstil', 'ev tekstili ihracat'
        ])
      ].filter(k => k.length > 2).slice(0, 15);
      
      await doc.ref.update({
        'seo.keywords': newKeywords,
        'seo_keywords': newKeywords,
      });
      fixed++;
      if (fixed % 10 === 0) console.log(`  ✅ ${fixed} haber keyword düzeltildi...`);
    }
  }
  console.log(`\n  📊 Toplam ${fixed}/${snap.size} haber keyword düzeltildi.\n`);
  return fixed;
}

// ═══════════════════════════════════════
//  FAZ 2: BOŞ BODY DÜZELTME (Gemini API)
// ═══════════════════════════════════════
async function fixEmptyBodies() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  FAZ 2: BOŞ İÇERİK DÜZELTME         ║');
  console.log('╚══════════════════════════════════════╝\n');
  
  const snap = await db.collection('trtex_news').get();
  const emptyDocs = snap.docs.filter(doc => {
    const d = doc.data();
    const body = d.translations?.TR?.content || d.content || d.body || '';
    return body.length < 100;
  });
  
  console.log(`  📋 ${emptyDocs.length} haber boş/kısa body tespit edildi.\n`);
  
  let fixed = 0;
  for (const doc of emptyDocs) {
    const d = doc.data();
    const title = d.translations?.TR?.title || d.title || '';
    const summary = d.translations?.TR?.summary || d.summary || '';
    
    if (!title) continue;
    
    console.log(`  📝 [${fixed + 1}/${emptyDocs.length}] "${title.substring(0, 60)}..."`);
    
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Sen profesyonel bir ev tekstili sektör gazetecisisin. Aşağıdaki başlık ve özet için kapsamlı haber içeriği yaz.

BAŞLIK: ${title}
ÖZET: ${summary}

KURALLAR:
- Minimum 800 karakter, tercihen 1500+
- HTML formatında: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote> kullan
- Her paragraf max 3-4 cümle
- H2 başlıklardan sonra boşluk bırak
- Görseller araya girecek, onlar için <br/> ile boşluk bırak
- E-E-A-T: kaynak, veri, uzman görüşü ekle
- Türk ev tekstili pazarına özel perspektif
- Profesyonel B2B tonu

AYRICA ÜRETMELİSİN:
- ai_commentary: 2-3 cümle AI analiz (📊 ile başlasın)
- business_opportunities: 3 somut iş fırsatı
- seo_keywords: 10+ keyword (mutlaka "perde", "ev tekstili", "dekorasyon" dahil, geri kalan 7+ başlıktan)

JSON döndür:
{
  "content": "HTML içerik",
  "ai_commentary": "AI analiz",
  "business_opportunities": ["fırsat1", "fırsat2", "fırsat3"],
  "seo_keywords": ["keyword1", "keyword2", ...]
}`,
        config: { responseMimeType: 'application/json', temperature: 0.7 }
      });
      
      if (!response.text) continue;
      const article = JSON.parse(response.text);
      
      // Keyword'lere zorunlu olanları ekle
      const keywords = [...new Set([
        ...MANDATORY_KEYWORDS,
        ...(article.seo_keywords || []),
        'türk tekstil', 'ev tekstili ihracat'
      ])].slice(0, 15);
      
      const updateData = {
        content: article.content,
        'translations.TR.content': article.content,
        ai_commentary: article.ai_commentary || '',
        business_opportunities: article.business_opportunities || [],
        'seo.keywords': keywords,
        seo_keywords: keywords,
        qualityScore: 85,
      };
      
      await doc.ref.update(updateData);
      fixed++;
      console.log(`    ✅ İçerik yazıldı (${article.content.length} chr) + ${keywords.length} keyword`);
      
      // API rate limit koruma
      await sleep(2000);
    } catch (e) {
      console.error(`    ❌ Hata: ${e.message}`);
      await sleep(1000);
    }
  }
  
  console.log(`\n  📊 Toplam ${fixed}/${emptyDocs.length} haber içerik düzeltildi.\n`);
  return fixed;
}

// ═══════════════════════════════════════
//  FAZ 3: UNSPLASH GÖRSELLER DEĞİŞTİRME
// ═══════════════════════════════════════
async function fixUnsplashImages() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  FAZ 3: UNSPLASH → AI GÖRSEL         ║');
  console.log('╚══════════════════════════════════════╝\n');
  
  const snap = await db.collection('trtex_news').get();
  const unsplashDocs = snap.docs.filter(doc => {
    const d = doc.data();
    const img = d.image_url || '';
    return img.includes('unsplash') || img.includes('placeholder') || img.includes('picsum');
  });
  
  console.log(`  📋 ${unsplashDocs.length} haber Unsplash/stok görsel tespit edildi.`);
  console.log(`  ⚠️ Bu faz Imagen 3 API kullanır — her biri için 2 görsel üretilecek.\n`);
  
  // Bu fazı ayrı çalıştırmalıyız — API maliyeti yüksek
  // Şimdilik sadece listeliyor, --execute parametresi ile çalıştırılacak
  const execute = process.argv.includes('--fix-images');
  
  if (!execute) {
    console.log('  ⏭️ Görsel düzeltme atlandı. Çalıştırmak için: --fix-images parametresi ekle\n');
    unsplashDocs.forEach((doc, i) => {
      const d = doc.data();
      const title = d.translations?.TR?.title || d.title || '';
      const img = d.image_url || '';
      console.log(`  ${i + 1}. ${title.substring(0, 60)}`);
      console.log(`     🖼️ ${img.substring(0, 80)}`);
    });
    return 0;
  }
  
  // Görsel üretme kodu (Aloha API'si üzerinden)
  let fixed = 0;
  for (const doc of unsplashDocs) {
    const d = doc.data();
    const title = d.translations?.TR?.title || d.title || '';
    console.log(`  🖼️ [${fixed + 1}/${unsplashDocs.length}] "${title.substring(0, 50)}..."`);
    
    try {
      // Aloha API üzerinden update_article_image çağır
      const res = await fetch('http://localhost:3000/api/aloha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `update_article_image aracini kullan. slug: "${doc.id}", project: "trtex". Haber basligi: "${title}". Konuya uygun dekorasyon goerseli uret.`
        }),
        signal: AbortSignal.timeout(120000)
      });
      
      if (res.ok) {
        fixed++;
        console.log(`    ✅ Görsel güncellendi`);
      }
      await sleep(5000); // API rate limit
    } catch (e) {
      console.error(`    ❌ Hata: ${e.message}`);
    }
  }
  
  console.log(`\n  📊 Toplam ${fixed}/${unsplashDocs.length} görsel değiştirildi.\n`);
  return fixed;
}

// ═══════════════════════════════════════
//  ANA AKIŞ
// ═══════════════════════════════════════
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  TRTEX HABER BATCH REPAİR v1.0');
  console.log('  Toplam 3 faz çalışacak');
  console.log('═══════════════════════════════════════════\n');
  
  const kwFixed = await fixKeywords();
  const bodyFixed = await fixEmptyBodies();
  const imgFixed = await fixUnsplashImages();
  
  console.log('\n═══════════════════════════════════════════');
  console.log('  SONUÇ RAPORU');
  console.log('═══════════════════════════════════════════');
  console.log(`  ✅ Keyword düzeltme: ${kwFixed} haber`);
  console.log(`  ✅ İçerik düzeltme: ${bodyFixed} haber`);
  console.log(`  ✅ Görsel düzeltme: ${imgFixed} haber`);
  console.log('═══════════════════════════════════════════\n');
  
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });

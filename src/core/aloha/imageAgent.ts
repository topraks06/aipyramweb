import { admin, adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════
// 🌟 UNIFIED VISUAL AGENT (MASTER PHOTOGRAPHER)
// ═══════════════════════════════════════════════════════
// Hakan's Laws (Anayasa):
// 1. Her haberde KESİN 3 görsel. 1.si Ana (16:9), 2 ve 3 değişken (1:1, 9:16).
// 2. KESİNLİKLE bitmiş ürün (Lüks villa, otel, dergi kapağı).
// 3. Fabrika/Hammadde max %10 ihtimalle çıkar, geneli estetik olacak.
// 4. Karanlık "dark shadows, gloomy" vb. ASLA yasak! 
//    Bol ışık, parlak, keyifli, Architectural Digest kalitesi. Yaratıcı (dalgalar, deniz kenarı vb.)
// 5. Üretim 2K kalitesinde olacak. Silmek KESİNLİKLE yasak, kütüphanede kalacak.
// ═══════════════════════════════════════════════════════

export type Category = 
  | 'curtain_modern' | 'curtain_sheer' | 'curtain_blackout' | 'curtain_store'
  | 'bedding_set' | 'bedding_luxury' | 'baby_bedding'
  | 'towel_set' | 'towel_bath' | 'bathrobe'
  | 'table_runner' | 'table_linen'
  | 'decorative_pillow' | 'throw_blanket' | 'pouf'
  | 'upholstery' | 'sofa_fabric'
  | 'kilim' | 'carpet_traditional' | 'carpet_modern'
  | 'raw_cotton' | 'raw_linen' | 'yarn'
  | 'trend_color' | 'trend_pattern' | 'sustainability' | 'smart_textile'
  | 'factory_modern' | 'fair_booth' | 'general';

export interface VisualSEOMetadata {
  filename: string;
  alt_text_tr: string;
  alt_text_en: string;
  caption_tr: string;
  caption_en: string;
  detected_category: Category;
  confidence_score: number;
  color_keywords: string[];
  image_hash?: string;
}

export interface CategoryDetectionResult {
  category: Category;
  confidence: number;
  keywords: string[];
  color_context: string;
  scene_type: 'product' | 'fair' | 'factory' | 'market' | 'general';
}

// ═══════════════════════════════════════
// 1. KATEGORİ, RENK VE SEO MOTORU
// ═══════════════════════════════════════

const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; category: Category; weight: number }> = {
  fuar: { keywords: ['fuar', 'fair', 'exhibition', 'heimtextil', 'maison', 'itma', 'hometex', 'stant', 'booth'], category: 'fair_booth', weight: 0.8 },
  fabrika: { keywords: ['fabrika', 'factory', 'tezgah', 'üretim hattı', 'production', 'loom'], category: 'factory_modern', weight: 0.7 },
  perde_sheer: { keywords: ['tül', 'sheer', 'voile', 'transparan'], category: 'curtain_sheer', weight: 0.9 },
  perde_blackout: { keywords: ['blackout', 'karartma', 'ışık geçirmez'], category: 'curtain_blackout', weight: 0.9 },
  perde_genel: { keywords: ['perde', 'curtain', 'drape', 'perdeli', 'perdeler'], category: 'curtain_modern', weight: 0.85 },
  nevresim: { keywords: ['nevresim', 'yatak', 'çarşaf', 'bedding', 'pike'], category: 'bedding_set', weight: 0.85 },
  bebek: { keywords: ['bebek', 'çocuk', 'baby', 'child', 'nursery', 'beşik', 'kids'], category: 'baby_bedding', weight: 0.95 },
  havlu: { keywords: ['havlu', 'towel', 'banyo', 'bornoz', 'bath'], category: 'towel_set', weight: 0.85 },
  hali: { keywords: ['halı', 'carpet', 'rug', 'kilim'], category: 'carpet_modern', weight: 0.8 },
  dekorasyon: { keywords: ['dekorasyon', 'renk', 'trend', 'moda', 'koleksiyon', 'desen', 'stil', 'tasarım'], category: 'trend_color', weight: 0.85 },
  aydinlatma: { keywords: ['aydınlatma', 'lamba', 'avize', 'lighting'], category: 'decorative_pillow', weight: 0.75 },
  doseme: { keywords: ['döşeme', 'döşemelik', 'koltuk', 'kanepe', 'upholstery', 'sofa'], category: 'upholstery', weight: 0.85 },
  ihracat: { keywords: ['ihracat', 'export', 'import', 'ithalat', 'ticaret', 'pazar'], category: 'general', weight: 0.6 },
  surdurulebilir: { keywords: ['sürdürülebilir', 'organik', 'geri dönüşüm', 'eco', 'yeşil'], category: 'sustainability', weight: 0.8 },
};

export function detectVisualCategory(articleTitle: string, articleContent?: string): CategoryDetectionResult {
  const text = `${articleTitle} ${(articleContent || '').substring(0, 500)}`.toLowerCase();
  
  let bestMatch: { category: Category; confidence: number; keywords: string[] } = {
    category: 'curtain_modern', // %40 kuralı gereği varsayılan her zaman Perde
    confidence: 0.3,
    keywords: [],
  };

  for (const [, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let matchCount = 0;
    const matched: string[] = [];
    for (const kw of config.keywords) {
      if (text.includes(kw)) { matchCount++; matched.push(kw); }
    }
    if (matchCount > 0) {
      const rawScore = (matchCount / config.keywords.length) * config.weight;
      const confidence = Math.min(rawScore * 2, 1.0);
      if (confidence > bestMatch.confidence) {
        bestMatch = { category: config.category, confidence, keywords: matched };
      }
    }
  }

  // 🔴 STRICT 10% FACTORY RULE (Hakan's Law)
  // Sadece fabrika/hammadde kategorileri override edilir.
  // "general" ve "ihracat" haberleri kendi kategorilerinde kalır — rastgele lüks ürüne çevrilmez.
  if (['factory_modern', 'raw_cotton', 'raw_linen', 'yarn'].includes(bestMatch.category)) {
    if (Math.random() > 0.10) { // %90 ihtimal
       const luksAlternatifler: Category[] = ['curtain_modern', 'bedding_luxury', 'upholstery', 'decorative_pillow'];
       bestMatch.category = luksAlternatifler[Math.floor(Math.random() * luksAlternatifler.length)];
       bestMatch.confidence = 0.99;
    }
  }

  const colorMap: Record<string,string> = {
    'antrasit': 'antrasit', 'bordo': 'bordo', 'krem': 'krem', 'beyaz': 'beyaz', 'lacivert': 'lacivert', 
    'gri': 'gri', 'yeşil': 'yeşil', 'mavi': 'mavi', 'bej': 'bej', 'gold': 'altın'
  };
  let detectedColor = 'neutral';
  for (const [key, value] of Object.entries(colorMap)) {
    if (text.includes(key)) { detectedColor = value; break; }
  }

  const sceneType = bestMatch.category.includes('fair') ? 'fair' : bestMatch.category.includes('factory') ? 'factory' : 'product';

  return {
    category: bestMatch.category,
    confidence: bestMatch.confidence,
    keywords: bestMatch.keywords,
    color_context: detectedColor,
    scene_type: sceneType,
  };
}

function slugify(text: string): string {
  const turkishMap: Record<string,string> = {'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u','Ç':'c','Ğ':'g','İ':'i','Ö':'o','Ş':'s','Ü':'u'};
  return text.split('').map(c => turkishMap[c] || c).join('').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
}

export function generateSEOFilename(title: string, category: CategoryDetectionResult, index: number = 0): string {
  const year = new Date().getFullYear();
  const slugTitle = slugify(title).substring(0, 40);
  const color = category.color_context !== 'neutral' ? `-${category.color_context}` : '';
  const catSlug = category.category.replace(/_/g, '-');
  return `${slugTitle}${color}-${catSlug}-${year}-${index+1}.jpg`;
}

// ═══════════════════════════════════════
// 2. IMAGE HASH & DEDUP (Asla silmeden sakla)
// ═══════════════════════════════════════

export function computeImageHash(base64Data: string): string {
  return crypto.createHash('sha256').update(base64Data.substring(0, 10000)).digest('hex').substring(0, 16);
}

export async function checkImageDuplicate(newHash: string): Promise<{isDuplicate: boolean}> {
  if (!adminDb) return { isDuplicate: false };
  try {
    const snaps = await adminDb.collection('trtex_image_hashes').orderBy('createdAt', 'desc').limit(50).get();
    for (const doc of snaps.docs) {
      const existingHash = doc.data().hash;
      if (existingHash && newHash.substring(0, 8) === existingHash.substring(0, 8)) {
        return { isDuplicate: true };
      }
    }
    return { isDuplicate: false };
  } catch { return { isDuplicate: false }; }
}

export async function saveImageHash(hash: string, filename: string, titleSlug: string): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb.collection('trtex_image_hashes').add({
      hash, filename, titleSlug, url: `https://storage.googleapis.com/aipyram-web.firebasestorage.app/${filename}`,
      createdAt: new Date().toISOString()
    });
  } catch {}
}

const BUCKET_NAME = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aipyram-web.firebasestorage.app';

async function getBucket() {
  let bucket = admin.storage().bucket(BUCKET_NAME);
  try {
     let [exists] = await bucket.exists();
     if (!exists) bucket = admin.storage().bucket('aipyram-web.appspot.com');
     return bucket;
  } catch(e) { return null; }
}

// ═══════════════════════════════════════
// 3. THE MASTER PHOTOGRAPHER PROMPT BUILDER
// Karanlık, moody YASAK. Parlak, estetik, 2K ZORUNLU.
// ═══════════════════════════════════════

let lastSceneType = '';

function detectMainProductScene(category: string, title: string, content: string): string {
  const txt = `${category} ${title} ${content}`.toLowerCase();
  
  if (txt.includes('bebek') || txt.includes('çocuk') || txt.includes('baby') || txt.includes('nursery')) {
    return 'Ultra-bright luxury nursery or children bedroom with soft pastel curtains, natural wood crib, and playful but elegant textiles, flooded with warm sunlight';
  } else if (txt.includes('yatak') || txt.includes('nevresim') || txt.includes('bedding') || txt.includes('havlu')) {
    return 'Luxury hotel suite bedroom (bright, fresh, white dominant)';
  } else if (txt.includes('motor') || txt.includes('mekanizma') || txt.includes('sistem')) {
    return 'Modern smart home interior or high-end penthouse with wide glass facade';
  } else if (txt.includes('döşeme') || txt.includes('koltuk') || txt.includes('upholstery')) {
    return 'Designer living room with premium sofa focus';
  } else if (txt.includes('fuar') || txt.includes('exhibition') || txt.includes('stand')) {
    return 'Maison&Objet style luxury exhibition booth, bright and spacious';
  } else if (txt.includes('dış mekan') || txt.includes('teras') || txt.includes('outdoor') || txt.includes('güneşten')) {
    return 'Luxury seaside terrace, villa garden, or poolside area with sunlight';
  } else if (txt.includes('dekorasyon') || txt.includes('renk') || txt.includes('trend') || txt.includes('koleksiyon')) {
    return 'Ultra-bright Scandinavian-inspired luxury living room with colorful textile accents, stylish curtains, and modern decor accessories';
  } else if (txt.includes('ihracat') || txt.includes('export') || txt.includes('pazar') || txt.includes('rekoru')) {
    return 'Bright luxury textile showroom with premium curtain and fabric displays, sunlit exhibition-style presentation';
  }
  return ''; // Default fallback
}

function getRandomScene(): string {
  const scenes = [
    { type: 'Luxury living room or villa salon', weight: 40 },
    { type: 'Luxury bedroom or hotel bed setup', weight: 20 },
    { type: 'Luxury hotel suite or contract project', weight: 15 },
    { type: 'Luxury outdoor living, seaside terrace or bright garden', weight: 15 },
    { type: 'International trade fair stand (Maison&Objet style)', weight: 10 }
  ];
  
  // Weights array
  const rand = Math.random() * 100;
  let sum = 0;
  let selected = scenes[0].type;
  
  for (let s of scenes) {
    sum += s.weight;
    if (rand <= sum) {
      selected = s.type;
      break;
    }
  }
  
  if (selected === lastSceneType) {
    // Avoid repetition softly
    selected = scenes.find(s => s.type !== lastSceneType)?.type || selected;
  }
  
  lastSceneType = selected;
  return selected;
}

function buildPrompt(category: string, title: string, contentSnippet: string, index: number, angle: 'wide'|'medium'|'detail') {
  const baseCategoryText = category.replace(/_/g, ' ');
  
  const productSceneMatch = detectMainProductScene(category, title, contentSnippet);
  const finalScene = productSceneMatch || getRandomScene();
  
  // ═══ CONTENT ENTITY EXTRACTION ═══
  // Haber içeriğinden anahtar entityleri çıkar ve prompt'a enjekte et
  const fullText = `${title} ${contentSnippet}`.toLowerCase();
  const entityHints: string[] = [];
  
  // Ülke/bölge tespiti → sahne detayı
  const countryMap: Record<string, string> = {
    'almanya': 'German', 'japonya': 'Japanese', 'italya': 'Italian', 'fransa': 'French',
    'çin': 'Chinese', 'hindistan': 'Indian', 'amerika': 'American', 'ingiltere': 'British',
    'avrupa': 'European', 'ortadoğu': 'Middle Eastern', 'mena': 'Middle Eastern',
    'asya': 'Asian', 'kuzey afrika': 'North African', 'suudi': 'Saudi Arabian',
    'germany': 'German', 'japan': 'Japanese', 'china': 'Chinese', 'india': 'Indian',
  };
  for (const [key, adj] of Object.entries(countryMap)) {
    if (fullText.includes(key)) { entityHints.push(`${adj}-inspired luxury interior design`); break; }
  }
  
  // Ürün tespiti → odak detayı
  const productMap: Record<string, string> = {
    'blackout': 'blackout curtains', 'tül': 'sheer voile curtains', 'döşemelik': 'upholstery fabric',
    'havlu': 'premium towels', 'nevresim': 'luxury bedding sets', 'halı': 'designer carpet',
    'perde': 'elegant curtains and drapes', 'branda': 'technical outdoor fabric',
    'sürdürülebilir': 'eco-friendly sustainable textiles', 'akıllı': 'smart home textiles',
    'otel': 'luxury hotel textile project', 'villa': 'luxury villa interior',
    'tedarik': 'premium textile showroom with supply chain display',
  };
  for (const [key, desc] of Object.entries(productMap)) {
    if (fullText.includes(key)) { entityHints.push(`featuring ${desc}`); break; }
  }
  
  const entityContext = entityHints.length > 0 ? `\nCONTENT CONTEXT: ${entityHints.join('. ')}.` : '';
  
  const includeHuman = Math.random() < 0.25; // 25% chance
  const humanPrompt = includeHuman 
    ? "Include a single ultra-realistic, natural lifestyle human (e.g. elegant woman adjusting curtain, or candid relaxation). NO posing, no direct eye contact, candid movement like a Netflix interior scene. " 
    : "";

  const negative = `dark, moody, low light, shadowy, dramatic lighting, studio black background, night scene, harsh contrast, artificial spotlight, messy, crowded, cheap, amateur, text, watermark, logo, typography, people looking at camera, AI-looking fake faces, plastic skin`;

  // VARIANT SİSTEMİ: Her açı tamamen farklı bir fotoğraf üretmeli
  let shotType = '';
  let compositionRule = '';
  let humanOverride = humanPrompt;
  
  if (angle === 'wide') {
    shotType = `Editorial interior photography, ultra wide-angle architectural shot. Full room visible, symmetrical composition, ceiling and floor both in frame.`;
    compositionRule = `Show the ENTIRE room from corner to corner. The product is part of the complete scene, not the center focus.`;
  } else if (angle === 'medium') {
    shotType = `Lifestyle product photography with natural human interaction. Medium shot, 50mm lens feel.`;
    compositionRule = `Focus on the product being USED or TOUCHED by a person. Completely different angle and framing from a wide shot.`;
    humanOverride = "Include a single ultra-realistic, natural lifestyle human interacting with the textile product (touching fabric, adjusting curtain, sitting on bed). Candid, NOT posed. ";
  } else {
    shotType = `Extreme macro textile detail photography. 100mm macro lens. Very shallow depth of field.`;
    compositionRule = `ONLY show fabric texture, weave pattern, or material surface in ultra-sharp focus. Background must be completely blurred (bokeh). NO room, NO furniture visible. Just the material.`;
    humanOverride = '';
  }

  const prompt = `
A Masterpiece of Ultra-Bright Luxury Editorial Photography for a Premium B2B Home Textile Magazine.
IMPORTANT: This image must have a COMPLETELY DIFFERENT composition from other images of the same article.

SUBJECT: High-end ${baseCategoryText} in a luxury setting. NOT an isolated product cutout.
Context: "${title}".${entityContext}

SCENE: ${finalScene}.
${humanOverride}

COMPOSITION RULE: ${compositionRule}

STYLE: Modern, minimal, elegant. Soft neutral palette (beige, cream, warm white). Premium and pristine.

LIGHTING: Bright natural daylight, soft diffused sunlight, high exposure, clean whites, commercial photography. Sun-filled luxury showroom at noon.

SHOT TYPE: ${shotType}

NEGATIVE PROMPT: ${negative}
  `.trim();

  return prompt;
}

// ═══════════════════════════════════════
// 4. MAIN EXECUTOR — PROCESS MULTIPLE IMAGES
// ═══════════════════════════════════════

export async function processMultipleImages(
  categoryRaw: string,
  title: string,
  content: string,
  maxImages: number = 3 // HER ZAMAN 3 resim
): Promise<string[]> {
  console.log(`[IMAGE_AGENT] 📸 Başlıyor: "${title}" (Kural: Google Vertex AI / Imagen 3.0 ZORUNLU)`);

  const bucket = await getBucket();
  if (!bucket) {
    console.error('[IMAGE_AGENT] ❌ Storage Bucket bulunamadı!');
    return [];
  }

  const generatedUrls: string[] = [];
  const catDetection = detectVisualCategory(title, content);

  // Görsel açılar: 1. Wide (Hero), 2. Medium (Metin içi), 3. Detail (Metin içi)
  const shotPlan: Array<{ rule: string, aspect: '1:1' | '3:4' | '4:3' | '16:9' | '9:16' }> = [
    { rule: 'wide', aspect: '16:9' },
    { rule: 'medium', aspect: Math.random() < 0.80 ? '16:9' : (Math.random() < 0.5 ? '1:1' : '9:16') },
    { rule: 'detail', aspect: Math.random() < 0.80 ? '16:9' : (Math.random() < 0.5 ? '1:1' : '9:16') },
  ];

  const { alohaAI } = require('@/core/aloha/aiClient');
  const client = alohaAI.getClient();

  for (let i = 0; i < 3; i++) {
    const plan = shotPlan[i];
    let promptText = buildPrompt(catDetection.category, title, content, i, plan.rule as any);

    // KURAL: İnsan faktörüne sadece çok nadir (ara sıra) izin veriyoruz. Yoksa robotik hissettitir diye şikayet geldi.
    // Ancak kullanıcı "sadece ürün göster, manken nadir olsun" diyor.
    // Eğer şans %15 ise, mankenli premium çekime izin ver. Diğer durumlarda insanları negative prompt'a al.
    const allowHumans = Math.random() < 0.15;
    if (allowHumans && plan.rule !== 'detail') {
        promptText = promptText.replace('people, humans, models', '');
        promptText += ' Include an elegant, highly realistic human model subtly interacting with the product in a natural, candid B2B environment.';
    }

    for (let retry = 1; retry <= 3; retry++) {
      try {
        console.log(`[IMAGE_AGENT] 🎨 Çiziliyor [${i+1}/3] Aspect: ${plan.aspect} (Model: İzinli? ${allowHumans}) (Deneme: ${retry})...`);
        const response = await client.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: promptText.substring(0, 1800), // 480 TOKEN ≈ 1800 karakter (eski 480 char limiti YANLIŞTI)
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: plan.aspect
          }
        });

        const base64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (!base64) throw new Error("Boş döndü");

        const hash = computeImageHash(base64);
        const dedup = await checkImageDuplicate(hash);
        if (dedup.isDuplicate) {
          console.warn(`[IMAGE_AGENT] 🚫 Benzer (Duplicate) bulundu. Yeni seed deneniyor...`);
          continue;
        }

        const buffer = Buffer.from(base64, 'base64');
        const filename = `trtex-news/${generateSEOFilename(title, catDetection, i)}`;
        const file = bucket.file(filename);

        await file.save(buffer, {
          contentType: 'image/jpeg',
          metadata: { cacheControl: 'public, max-age=31536000' }
        });

        try { await file.makePublic(); } catch { /* IAM izinleri */ }
        
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        generatedUrls.push(publicUrl);
        
        await saveImageHash(hash, filename, title);
        console.log(`[IMAGE_AGENT] ✅ Üretildi: ${publicUrl}`);
        
        if (i < 2) await new Promise(r => setTimeout(r, 15000));
        break; 
      } catch (err: any) {
        console.error(`[IMAGE_AGENT] ❌ Resim ${i+1} Hata: ${err.message?.substring(0,60)}`);
        if (retry === 3) {
          generatedUrls.push('');
        } else {
          await new Promise(r => setTimeout(r, 5000)); 
        }
      }
    }
  }

  return generatedUrls;
}

// ═══════════════════════════════════════
// GERİ DÖNÜK UYUMLULUK EXPORTS
// ═══════════════════════════════════════
export async function buildVisualSEOPackage(t: string, c: string, i: number=0) {
  return { 
    filename: generateSEOFilename(t, detectVisualCategory(t, c), i),
    alt_text_tr: t, alt_text_en: t, caption_tr: t, caption_en: t,
    detected_category: 'curtain_modern', confidence_score: 1, color_keywords: []
  };
}

export async function processImageForContent(
  type: string, 
  categoryRaw: string, 
  title: string, 
  existingUrl?: string,
  angle: 'wide' | 'medium' | 'detail' | 'macro' = 'wide'
): Promise<string> {
  const urls = await processMultipleImages(categoryRaw, title, title, 1);
  return urls[0] || '';
}

export const COLOR_CONSTITUTION = { negative_colors: ['dark'], promptInjection: 'bright sunlight' };

export function getImageCount(htmlContent: string): number {
  const imgTags = (htmlContent.match(/<img/gi) || []).length;
  const brGroups = (htmlContent.match(/<br\s*\/?>\s*<br\s*\/?>/gi) || []).length;
  return Math.max(3, imgTags + Math.floor(brGroups / 2));
}

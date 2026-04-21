import { adminDb } from '@/lib/firebase-admin';
import { slugify } from '@/core/utils/slugify';

// ─── EDİTÖR GUARD (Yayın Öncesi Filtre) ─────────
interface NewsPayload {
  translations?: {
    TR?: { title?: string; summary?: string; content?: string };
    EN?: { title?: string; summary?: string; content?: string };
    [key: string]: any;
  };
  category?: string;
  tags?: string[];
  image_url?: string;
  [key: string]: any;
}

interface GuardResult {
  passed: boolean;
  reason?: string;
  score: number;
}

// Basit Jaccard benzerlik hesabı
function calculateSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

async function editorialGuard(payload: NewsPayload, collection: string): Promise<GuardResult> {
  let score = 0;
  const maxScore = 100;

  const tr = payload.translations?.TR || payload;
  const en = payload.translations?.EN;

  if (!tr?.title || !tr?.content) {
    return { passed: false, reason: 'TR alanları eksik (title/content)', score: 0 };
  }
  score += 30;

  const wordCount = (tr.content || '').split(/\s+/).length;
  if (wordCount < 50) {
    return { passed: false, reason: `İçerik çok kısa: ${wordCount} kelime`, score };
  }
  score += 20;

  if (payload.image_url && payload.image_url.startsWith('http')) score += 20;

  // Duplicate Check
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const existing = await adminDb.collection(collection)
      .where('publishedAt', '>=', oneDayAgo)
      .orderBy('publishedAt', 'desc')
      .limit(10)
      .get();

    const existingTitles = existing.docs.map(d => (d.data().translations?.TR?.title || d.data().title || '').toLowerCase());
    const newTitle = (tr.title || '').toLowerCase();

    for (const existingTitle of existingTitles) {
      if (!existingTitle) continue;
      const similarity = calculateSimilarity(newTitle, existingTitle);
      if (similarity > 0.7) {
        return { passed: false, reason: `Duplicate tespit edildi: "${existingTitle}" ile %${Math.round(similarity * 100)} benzer`, score };
      }
    }
  } catch (err) { }

  return { passed: score >= 40, reason: score >= 40 ? undefined : `Kalitede eksiklik. Skor: ${score}`, score };
}

// ─── EVRENSEL PUBLISHER ─────────
export const PROJECT_FIREBASE_MAP: Record<string, string> = {
  // Tekstil Grubu
  trtex: 'trtex_news',
  hometex: 'hometex_content',
  perde: 'perde_content',
  
  // Emlak Grubu
  didimemlak: 'didimemlak_listings',
  fethiye: 'fethiye_listings',
  satilik: 'satilik_content',
  kalkan: 'kalkan_listings',
  immobiliens: 'immobiliens_listings',
  ultrarent: 'ultrarent_listings',

  // Diğer (Kurumsal, Ana, Mobilya vs)
  aipyram: 'aipyram_blog',
  mobilya: 'mobilya_content',
  didimde: 'didimde_content',
};

// Geriye dönük uyumluluk
export async function publishToTRTEX(data: { type: string; payload: any }): Promise<{ success: boolean; docId?: string; error?: any; guardResult?: GuardResult }> {
  return publishToProject('trtex', data);
}

export async function publishToProject(projectName: string, data: {
  type: string;
  payload: any;
}): Promise<{ success: boolean; docId?: string; error?: any; guardResult?: GuardResult }> {
  
  const normProject = projectName.toLowerCase()
    .replace('.com','')
    .replace('.ai','')
    .replace('.net','');

  const collectionName = PROJECT_FIREBASE_MAP[normProject];
  if (!collectionName) {
    return { success: false, error: `Bilinmeyen proje için koleksiyon yok: ${projectName}` };
  }

  // Haber veya İçerik ise Editorial Guard devreye girsin. Emlak ilanlarında gerek yok.
  if (data.type === 'news' || data.type === 'content') {
    const guardResult = await editorialGuard(data.payload, collectionName);
    console.log(`[Editorial Guard - ${normProject}] Skor: ${guardResult.score}/100 | Geçti: ${guardResult.passed}`);
    if (!guardResult.passed) {
      return { success: false, error: guardResult.reason, guardResult };
    }

    // 🔒 IMAGE GUARD: Görselsiz haber uyarısı — pipeline kırılmaz ama loglanır
    const imageUrl = data.payload.image_url || data.payload.cover_image || '';
    if (!imageUrl || imageUrl.trim() === '') {
      console.warn(`[UNIVERSAL Publisher] ⚠️ GÖRSEL EKSİK: "${data.payload.title || 'Başlıksız'}" — scan_missing_images ile düzeltilecek`);
      // Firestore'da flag bırak — autoRunner görselsiz haberi tespit edecek
      data.payload._needs_image = true;
    }
  }

  try {
    // Slug oluştur (eğer yoksa)
    let payload = { ...data.payload };
    if (!payload.slug) {
      const title = payload.translations?.TR?.title || payload.title || '';
      payload.slug = slugify(title) || `${normProject}-${Date.now()}`;
    } else {
      // Mevcut slug'ı da normalize et (eski Türkçe karakterli slug'ları düzelt)
      payload.slug = slugify(payload.slug);
    }

    const now = new Date().toISOString();
    const docRef = await adminDb.collection(collectionName).add({
      ...payload,
      // ZORUNLU ALANLAR — Firestore orderBy sorgularının çalışması için garanti
      // DUAL-WRITE: Hem camelCase hem snake_case — autoRunner + publisher uyumu
      publishedAt: payload.publishedAt || now,
      published_at: payload.published_at || payload.publishedAt || now,
      createdAt: payload.createdAt || now,
      created_at: payload.created_at || payload.createdAt || now,
      type: data.type,
      source: 'aipyram-universal-publisher',
      status: payload.status || 'published',
    });
    
    console.log(`[UNIVERSAL Publisher] ✅ ${normProject} -> ${collectionName} yayınlandı: ${docRef.id}`);
    return { success: true, docId: docRef.id };
  } catch (err) {
    console.error(`[UNIVERSAL Publisher] ❌ Yayın hatası:`, err);
    return { success: false, error: err };
  }
}

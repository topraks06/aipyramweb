import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const assets: any[] = [];
    
    // Fetch from image_library collection.
    const mediaSnap = await adminDb.collection('image_library').orderBy('createdAt', 'desc').limit(50).get();
    
    mediaSnap.forEach(doc => {
      assets.push({ id: doc.id, ...doc.data() });
    });

    // Aggregate image_url from trtex_news collection
    try {
      const newsSnap = await adminDb.collection('trtex_news').orderBy('createdAt', 'desc').limit(20).get();
      newsSnap.forEach(doc => {
        const data = doc.data();
        if (data.image_url || data.image) {
          assets.push({
            id: `news_${doc.id}`,
            title: data.title || "Haber Görseli",
            url: data.image_url || data.image,
            thumbnailUrl: data.image_url || data.image,
            node: "trtex",
            type: "news",
            source: "trtex_article",
            resolution: "1K",
            status: "published",
            createdAt: data.createdAt || new Date().toISOString(),
            tags: ["haber", ...(data.tags || [])]
          });
        }
      });
    } catch (e) {
      console.error('[AdminMedia API] Error fetching news aggregate:', e);
    }

    // Sort combined assets by createdAt
    assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    console.error('[AdminMedia API] Error fetching media:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

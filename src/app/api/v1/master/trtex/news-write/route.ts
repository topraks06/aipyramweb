import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { triggerLeadEngineFromNews } from '@/core/aloha/lead-engine/trigger';

const DEFAULT_NEWS_IMAGE = '/images/curtain-fabric-display.png';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/master/trtex/news-write
 * 
 * Firestore'a haber yazar (TRTEX admin panel + Aloha)
 * Body: { title, summary, content, category, slug, image_url, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Başlık zorunlu' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const id = body.id || `${today}_${Date.now()}`;

    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
      .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    const newsItem = {
      title: body.title,
      title_tr: body.title,
      summary: body.summary || '',
      summary_tr: body.summary || '',
      content: body.content || '',
      category: body.category || 'Trend',
      slug,
      image_url: body.image_url || DEFAULT_NEWS_IMAGE || '/images/curtain-fabric-display.png',
      tags: body.tags || [],
      ai_insight: body.ai_insight || null,
      ai_action: body.ai_action || null,
      related_company: body.related_company || null,
      source_urls: body.source_urls || [],
      reading_time: body.reading_time || 3,
      published_at: body.published_at || today,
      status: body.status || 'draft',
      created_at: new Date().toISOString(),
      pipeline_version: body.pipeline_version || 'admin',
      translations: body.translations || {},
    };

    await adminDb.collection('trtex_news').doc(id).set(newsItem, { merge: true });

    // Asenkron olarak Lead Target sistemini tetikle:
    triggerLeadEngineFromNews(newsItem.title, newsItem.content, newsItem.category).catch(console.error);

    return NextResponse.json({ success: true, id, slug, article: newsItem }, { status: 201 });
  } catch (err: any) {
    console.error('[news-write POST]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/master/trtex/news-write
 * 
 * Haber günceller (durum değiştirme, içerik düzenleme)
 * Body: { slug, status?, title?, summary?, ... }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, id: docId, ...updates } = body;

    if (!slug && !docId) {
      return NextResponse.json({ error: 'slug veya id gerekli' }, { status: 400 });
    }

    // ID varsa direkt güncelle
    if (docId) {
      await adminDb.collection('trtex_news').doc(docId).update(updates);
      return NextResponse.json({ success: true, id: docId });
    }

    // Slug ile bul
    const snapshot = await adminDb.collection('trtex_news')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: `"${slug}" bulunamadı` }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    
    // published durumuna geçişte published_at ata
    if (updates.status === 'published' && !doc.data().published_at) {
      updates.published_at = new Date().toISOString();
    }

    await doc.ref.update(updates);
    return NextResponse.json({ success: true, id: doc.id, title: doc.data().title });
  } catch (err: any) {
    console.error('[news-write PATCH]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/master/trtex/news-write
 * 
 * Haber siler
 * Query: ?slug=xxx veya ?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const docId = request.nextUrl.searchParams.get('id');

    if (!slug && !docId) {
      return NextResponse.json({ error: 'slug veya id gerekli' }, { status: 400 });
    }

    if (docId) {
      await adminDb.collection('trtex_news').doc(docId).update({ status: 'archived', deleted_at: new Date().toISOString() });
      return NextResponse.json({ success: true, deleted: docId });
    }

    const snapshot = await adminDb.collection('trtex_news')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: `"${slug}" bulunamadı` }, { status: 404 });
    }

    await snapshot.docs[0].ref.update({ status: 'archived', deleted_at: new Date().toISOString() });
    return NextResponse.json({ success: true, deleted: snapshot.docs[0].data().title || slug });
  } catch (err: any) {
    console.error('[news-write DELETE]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

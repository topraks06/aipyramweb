import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/master/trtex/articles
 * Tüm TRTEX haberlerini listele (admin panel için)
 */
export async function GET() {
  try {
    const snap = await adminDb.collection('trtex_news')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const articles = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title || '',
        summary: (d.summary || '').substring(0, 150),
        category: d.category || 'Bilinmiyor',
        status: d.status || 'published',
        image_url: d.image_url || null,
        images: d.images || [],
        image_generated: d.image_generated || false,
        quality_score: d.quality_score || 0,
        impact_score: d.impact_score || 0,
        source: d.source || 'unknown',
        createdAt: d.createdAt || d.created_at || '',
        slug: d.slug || doc.id,
        tags: d.tags || [],
      };
    });

    // Özet istatistikler
    const stats = {
      total: articles.length,
      withImages: articles.filter(a => a.image_generated || (a.images && a.images.length > 0)).length,
      withoutImages: articles.filter(a => !a.image_generated && (!a.images || a.images.length === 0)).length,
      categories: {} as Record<string, number>,
      todayCount: 0,
    };

    const today = new Date().toISOString().split('T')[0];
    articles.forEach(a => {
      stats.categories[a.category] = (stats.categories[a.category] || 0) + 1;
      if (a.createdAt && a.createdAt.startsWith(today)) stats.todayCount++;
    });

    return NextResponse.json({ articles, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/v1/master/trtex/articles
 * Haber güncelle (title, summary, category, status)
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, summary, category, status } = body;

    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 });

    const updates: any = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (summary !== undefined) updates.summary = summary;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;

    await adminDb.collection('trtex_news').doc(id).update(updates);

    // Payload güncelle
    try {
      const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
      await buildTerminalPayload();
    } catch {}

    return NextResponse.json({ success: true, id, updated: Object.keys(updates) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/master/trtex/articles
 * Haberi sil
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id parametresi gerekli' }, { status: 400 });

    await adminDb.collection('trtex_news').doc(id).update({ status: 'archived', deletedAt: new Date().toISOString() });

    // Payload güncelle
    try {
      const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
      await buildTerminalPayload();
    } catch {}

    return NextResponse.json({ success: true, deleted: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

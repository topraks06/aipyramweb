import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const node = searchParams.get('node') || 'all';
    const type = searchParams.get('type') || 'all';

    let query: FirebaseFirestore.Query = adminDb.collection('sovereign_cms');
    
    if (node !== 'all') {
      query = query.where('targetNode', '==', node);
    }
    if (type !== 'all') {
      query = query.where('contentType', '==', type);
    }

    // orderBy might require composite indexes, so we just order client-side or use a basic order
    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('[CMS API GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetNode, contentType, title, content, mediaUrl, isActive = true, meta = {} } = body;

    if (!targetNode || !contentType || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newDoc = {
      targetNode,
      contentType, // 'news', 'hero_image', 'announcement', 'slogan'
      title,
      content: content || '',
      mediaUrl: mediaUrl || '',
      isActive,
      meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('sovereign_cms').add(newDoc);

    return NextResponse.json({ success: true, id: docRef.id, data: newDoc });
  } catch (error: any) {
    console.error('[CMS API POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing document ID' }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    await adminDb.collection('sovereign_cms').doc(id).update(updates);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[CMS API PUT] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing document ID' }, { status: 400 });
    }

    await adminDb.collection('sovereign_cms').doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[CMS API DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

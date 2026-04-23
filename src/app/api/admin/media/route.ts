import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const assets: any[] = [];
    
    // We fetch from image_library if it exists, otherwise we can aggregate from nodes.
    // For now, let's fetch from image_library collection.
    const mediaSnap = await adminDb.collection('image_library').orderBy('createdAt', 'desc').limit(50).get();
    
    mediaSnap.forEach(doc => {
      assets.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    console.error('[AdminMedia API] Error fetching media:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

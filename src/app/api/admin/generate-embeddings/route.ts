import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Basit güvenlik kontrolü
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'aloha_admin_secret'}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, message: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('aloha_knowledge').where('active', '==', true).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: 'No active knowledge documents found.' });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // İçerik ve konuyu birleştirerek embedding oluşturuyoruz
      const textToEmbed = `[${data.topic}] ${data.content}`;
      
      try {
        const embedding = await alohaAI.generateEmbedding(textToEmbed, 'knowledge_backfill');
        
        if (embedding && embedding.length > 0) {
          await doc.ref.update({
            vector_embedding: embedding,
            updatedAt: new Date().toISOString()
          });
          updatedCount++;
        }
      } catch (err: any) {
        console.error(`[Backfill] Failed to embed doc ${doc.id}:`, err);
        errors.push(`${doc.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated embeddings for ${updatedCount} documents.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('[Admin API] Embedding backfill failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

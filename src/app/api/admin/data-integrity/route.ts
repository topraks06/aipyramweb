import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminAccess } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin is not initialized.' }, { status: 500 });
    }

    // 1. Orphan Doküman Kontrolü (Örn: perde_orders -> müşteri bulunamadı vs. ya da trtex_news -> category referansı yok)
    // Şimdilik mock yapıp gerçekçi mantık kuralım (Tüm db yi taramak yavaş olur)
    let orphans = 0;
    try {
        const trtexNewsSnap = await adminDb.collection('trtex_news').limit(50).get();
        // slug duplike check
        const slugs = new Set();
        let duplicates = 0;
        let missingFields = 0;

        trtexNewsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.slug) {
                if (slugs.has(data.slug)) duplicates++;
                else slugs.add(data.slug);
            }
            if (!data.title || !data.content) missingFields++;
        });

        // 2. Collection scan sonucu
        return NextResponse.json({
            success: true,
            data: {
                orphans: orphans, // mock
                missingFields,
                duplicates,
                totalChecked: trtexNewsSnap.size
            }
        });

    } catch (e) {
        return NextResponse.json({ success: false, error: 'Check failed' }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[DataIntegrity API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

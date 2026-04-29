import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const limitStr = url.searchParams.get('limit') || '50';
        const limitCount = parseInt(limitStr, 10);
        const category = url.searchParams.get('category');
        const node = url.searchParams.get('node');

        let query: FirebaseFirestore.Query = adminDb.collection('image_library');

        if (category) {
            query = query.where('category', '==', category);
        }
        if (node) {
            query = query.where('node', '==', node);
        }

        // Apply ordering and limit
        query = query.orderBy('createdAt', 'desc').limit(limitCount);

        const snapshot = await query.get();
        const images = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            success: true,
            count: images.length,
            images
        });

    } catch (error: any) {
        console.error("Vault API GET Error:", error);
        return NextResponse.json({ success: false, error: "Kasa görselleri getirilirken hata oluştu." }, { status: 500 });
    }
}

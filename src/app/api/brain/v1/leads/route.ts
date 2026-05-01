import { NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { collection = 'leads', ...data } = body; 
        
        // Firebase Firestore Sovereign Kasa'ya kaydediyoruz
        const docRef = await adminDb.collection(collection).add({
            ...data,
            createdAt: new Date().toISOString()
        });
        
        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error: any) {
        console.error("[Leads API] Sovereign Kasa Kayıt Hatası:", error);
        return NextResponse.json({ success: false, error: "Merkezi Kasa Kayıt Hatası" }, { status: 500 });
    }
}

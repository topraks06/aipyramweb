import { NextResponse } from "next/server";
import { saveToGoogleNativeMemory } from "@/core/aloha/publishers/google-native-memory";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { collection = 'leads', ...data } = body; 
        
        // Firebase Firestore Sovereign Kasa'ya kaydediyoruz
        const node = await saveToGoogleNativeMemory(collection, data);
        
        return NextResponse.json({ success: true, node });
    } catch (error: any) {
        console.error("[Leads API] Sovereign Kasa Kayıt Hatası:", error);
        return NextResponse.json({ success: false, error: "Merkezi Kasa Kayıt Hatası" }, { status: 500 });
    }
}

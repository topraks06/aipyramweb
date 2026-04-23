import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";
import { getNode } from "@/lib/sovereign-config";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, SovereignNodeId = 'perde' } = body;

        if (!uid) {
            return NextResponse.json({ error: "Kullanıcı ID (uid) gereklidir." }, { status: 400 });
        }

        // Token security (Session verification should be here, but for now we trust the client to some extent as it requires auth on frontend)
        // More strict production environments would verify session token on headers.

        const config = getNode(SovereignNodeId);
        if (!config.walletCollection) {
            return NextResponse.json({ message: "Bu projede (node) cüzdan sistemi aktif değil." });
        }

        const walletRef = adminDb.collection(config.walletCollection).doc(uid);
        const walletDoc = await walletRef.get();

        if (walletDoc.exists) {
            return NextResponse.json({ message: "Cüzdan zaten mevcut." });
        }

        // Initialize wallet with 10 free credits
        await walletRef.set({
            ownerId: uid,
            node: SovereignNodeId,
            agentCredits: 10,
            renderCredits: 0, // Legacy fallback
            totalSpent: 0,
            tier: 'Starter',
            createdAt: new Date().toISOString(),
            lastRefillAt: new Date().toISOString()
        });

        console.log(`[WalletSystem] ${uid} için başlangıç cüzdanı oluşturuldu (10 Kredi).`);
        return NextResponse.json({ success: true, message: "Başlangıç cüzdanı tanımlandı.", initialCredits: 10 });
        
    } catch (e: any) {
        console.error("Wallet init hatası:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

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

        // Icmimar B2B tasarım platformudur, e-postası onaylanmış (veya Google Login) kullanıcılara 5 hediye verilir.
        // Diğer platformlarda (veya ücretsiz olanlarda) 10 kredi olabilir, ancak perde'de kredi sistemi artık yoktur.
        let initialCredits = (SovereignNodeId === 'icmimar') ? 0 : 10;
        if (SovereignNodeId === 'perde') initialCredits = 0; // Perde B2C'dir, agent kullanmaz.

        let welcomeBonusClaimed = false;

        try {
            // LOCALHOST BYPASS KONTROLÜ
            const isDev = process.env.NODE_ENV === 'development';
            let isEmailVerified = false;

            if (isDev && (uid === 'admin-local-bypass' || uid.includes('bypass') || uid.includes('mock'))) {
                isEmailVerified = true;
            } else {
                const userRecord = await admin.auth().getUser(uid);
                isEmailVerified = userRecord.emailVerified || isDev;
            }
            
            if (isEmailVerified) {
                if (SovereignNodeId === 'icmimar') {
                    initialCredits = 5;
                    welcomeBonusClaimed = true;
                }
            }
        } catch (e) {
            console.warn("Wallet init email kontrolü yapılamadı:", e);
        }

        await walletRef.set({
            ownerId: uid,
            node: SovereignNodeId,
            agentCredits: initialCredits,
            renderCredits: 0, // Legacy fallback
            totalSpent: 0,
            tier: initialCredits > 0 ? 'Starter' : 'Pending',
            createdAt: new Date().toISOString(),
            lastRefillAt: new Date().toISOString(),
            welcomeBonusClaimed
        });

        console.log(`[WalletSystem] ${uid} için başlangıç cüzdanı oluşturuldu (${initialCredits} Kredi). Node: ${SovereignNodeId}`);
        return NextResponse.json({ success: true, message: "Başlangıç cüzdanı tanımlandı.", initialCredits });
        
    } catch (e: any) {
        console.error("Wallet init hatası:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

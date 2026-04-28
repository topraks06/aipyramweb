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

        const config = getNode(SovereignNodeId);
        if (!config.walletCollection) {
            return NextResponse.json({ message: "Bu projede (node) cüzdan sistemi aktif değil." });
        }

        const userRecord = await admin.auth().getUser(uid);
        const isDev = process.env.NODE_ENV === 'development';
        
        if (!userRecord.emailVerified && !isDev) {
            return NextResponse.json({ error: "E-posta adresi henüz doğrulanmamış." }, { status: 403 });
        }

        const walletRef = adminDb.collection(config.walletCollection).doc(uid);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            return NextResponse.json({ error: "Cüzdan bulunamadı." }, { status: 404 });
        }

        const data = walletDoc.data();
        if (data?.welcomeBonusClaimed) {
            return NextResponse.json({ message: "Bonus daha önce alınmış.", bonusAdded: false });
        }

        // Sadece icmimar ise 5 kredi yükle
        let bonusAmount = 0;
        if (SovereignNodeId === 'icmimar') {
            bonusAmount = 5;
        }

        if (bonusAmount > 0) {
            await walletRef.update({
                agentCredits: admin.firestore.FieldValue.increment(bonusAmount),
                welcomeBonusClaimed: true,
                tier: 'Starter'
            });
            console.log(`[WalletSystem] ${uid} için e-posta doğrulama bonusu (${bonusAmount} Kredi) tanımlandı.`);
            return NextResponse.json({ success: true, message: `E-posta onaylandı, ${bonusAmount} tasarım hakkı eklendi!`, bonusAdded: true, bonusAmount });
        } else {
            // Eğer ücretsiz platformsa zaten başlangıçta 10 kredi alıyor
            await walletRef.update({ welcomeBonusClaimed: true });
            return NextResponse.json({ success: true, message: "Onaylandı.", bonusAdded: false });
        }
        
    } catch (e: any) {
        console.error("Wallet claim bonus hatası:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

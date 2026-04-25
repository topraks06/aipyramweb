import { NextRequest, NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/vision-analyzer";
import { analyzeFabric } from "@/lib/agents/FabricRecognitionAgent";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { generateMultiResolution, addImage } from "@/lib/image-library";
/* ─── Rate Limiter (handled by middleware and firestore) ─── */
import { adminDb, admin } from "@/lib/firebase-admin";
import { checkCredits, deductCredit, logSovereignAction } from "@aipyram/aloha-sdk";
import { getNode } from "@/lib/sovereign-config";

const ai = alohaAI.getClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64, prompt, attachments, SovereignNodeId = 'perde' } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: "Görsel gereklidir" }, { status: 400 });
        }

        // IP based rate-limit is handled by Firestore and Middleware
        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

        // Authentication & Wallet Check (If session exists)
        const sessionCookie = req.cookies.get('session');
        let uid = null;
        if (sessionCookie?.value) {
            try {
                const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value, true);
                uid = decodedToken.uid;
                
                // Kredi Kontrolü Merkezi Servisle (Sovereign Hub)
                const walletCheck = await checkCredits(SovereignNodeId, uid, 'render');
                if (!walletCheck.allowed) {
                    return NextResponse.json({ error: "Yeterli render krediniz bulunmuyor (402 Payment Required)." }, { status: 402 });
                }
            } catch (authErr) {
                console.error("Auth session invalid", authErr);
            }
        } else {
            // 🛡️ Anonim Kullanıcı Kontrolü: Günde 1 Render (IP bazlı Firestore)
            if (adminDb) {
                const clientIp = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
                // IP adresinden '.' veya ':' gibi karakterleri güvenli document ID'ye çevir
                const safeIp = clientIp.replace(/[\.:]/g, '_'); 
                const today = new Date().toISOString().split('T')[0];
                const ipDocId = `${safeIp}_${today}`;
                
                const ipRef = adminDb.collection('anon_renders').doc(ipDocId);
                const ipSnap = await ipRef.get();
                
                if (ipSnap.exists && (ipSnap.data()?.count >= 1)) {
                    return NextResponse.json({ error: "Günlük ücretsiz render hakkınızı doldurdunuz. Sınırsız render için lütfen üye olun." }, { status: 429 });
                }
                
                // Hakkı var, sayacı artır
                await ipRef.set({
                    count: admin.firestore.FieldValue.increment(1),
                    ip: clientIp,
                    date: today,
                    lastAt: new Date().toISOString()
                }, { merge: true });
            }
        }

        // 1. Analyze room
        // Extract plain base64 if it has data url scheme
        const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const analysis = await analyzeRoom(cleanedBase64, SovereignNodeId);

        // 1.5 Analyze attachments (Fabrics)
        let fabricInjections = "";
        let baseFabricStyle = analysis.suggestedStyles[0] || 'beautiful';
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
             const fabricPromises = attachments.map(async (b64: string) => {
                 return analyzeFabric(b64, SovereignNodeId);
             });
             const fabricAnalyses = await Promise.all(fabricPromises);
             const fabricDescriptions = fabricAnalyses.map(f => `${f.composition} ${f.weaveType} in ${f.weightEstimate} weight`).join(" and ");
             fabricInjections = ` The curtains MUST specifically be made of the following fabrics: ${fabricDescriptions}. Ensure the texture and pattern of these specific fabrics are visible on the curtains.`;
             baseFabricStyle = "custom specified";
        }

        // 2. Generate render using Imagen 3.0 (or 4.0 depending on availability)
        const renderPrompt = prompt || `A highly photorealistic interior design render of a ${analysis.roomType} with ${analysis.windowType} windows, featuring ${baseFabricStyle} style curtains matching a ${analysis.colorPalette.join(", ")} color palette.${fabricInjections} Soft, natural ${analysis.lightLevel} lighting. 4K resolution, architectural photography.`;

        let renderUrlUrl = "";
        try {
            const res = await ai.models.generateImages({
                model: alohaAI.getImageModel(),
                prompt: renderPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
            });

            const base64Output = res.generatedImages?.[0]?.image?.imageBytes;
            if (base64Output) {
                renderUrlUrl = `data:image/jpeg;base64,${base64Output}`;
                
                // Kredi Düş (Merkezi Servis)
                if (uid) {
                    await deductCredit(SovereignNodeId, uid, 'render');
                }

                // Add to library
                try {
                    const multiRes = await generateMultiResolution(renderUrlUrl);
                    await addImage({
                        url_1k: multiRes.url_1k,
                        url_2k: multiRes.url_2k,
                        url_4k: multiRes.url_4k,
                        category: "user_render",
                        tags: [...analysis.colorPalette, analysis.roomType, analysis.windowType, analysis.suggestedStyles[0] || 'modern'],
                        style: analysis.suggestedStyles[0] || 'modern',
                        roomType: analysis.roomType,
                        color: analysis.colorPalette[0] || 'bej',
                        productType: getNode(SovereignNodeId).shortName.toLowerCase(),
                        source: 'imagen',
                        node: SovereignNodeId
                    });
                    
                    // Sovereign Log
                    await logSovereignAction({ node: SovereignNodeId, action: 'render', payload: { roomType: analysis.roomType }, result: { success: true } as any, duration: 0, cost: 0 });

                    // Save to node's render collection
                    if (uid) {
                        const config = getNode(SovereignNodeId);
                        if (config.renderCollection) {
                            await adminDb.collection(config.renderCollection).add({
                                authorId: uid,
                                SovereignNodeId,
                                urls: [multiRes.url_1k, multiRes.url_2k].filter(Boolean),
                                prompt: renderPrompt,
                                roomType: analysis.roomType,
                                style: analysis.suggestedStyles[0] || 'modern',
                                createdAt: new Date().toISOString()
                            });
                        }
                    }

                } catch (libErr) {
                    console.error("Library save failed (ignoring for response):", libErr);
                }
            }

        } catch (imgErr) {
            console.error("Imagen failed, skipping render:", imgErr);
        }

        return NextResponse.json({
            renderUrl: renderUrlUrl,
            analysis,
            suggestions: analysis.suggestedFabrics
        });

    } catch (error) {
        console.error("Render API error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

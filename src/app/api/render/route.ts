import { NextRequest, NextResponse } from "next/server";
import { analyzeRoom } from "@/lib/vision-analyzer";
import { analyzeFabric } from "@/lib/agents/FabricRecognitionAgent";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { generateMultiResolution, addImage } from "@/lib/image-library";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { adminDb, admin } from "@/lib/firebase-admin";
import { checkCredits, deductCredit, logSovereignAction } from "@aipyram/aloha-sdk";
import { getTenant } from "@/lib/tenant-config";

const ai = alohaAI.getClient();

let ratelimit: Ratelimit | null = null;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(1, "10 s"),
            analytics: true,
        });
    }
} catch (e) {
    console.warn("Upstash Redis is not configured, rate limiting is disabled for render.");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageBase64, prompt, attachments, tenantId = 'perde' } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: "Görsel gereklidir" }, { status: 400 });
        }

        const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
        if (ratelimit) {
            const { success } = await ratelimit.limit(`render_${ip}`);
            if (!success) {
                return NextResponse.json({ error: "Çok fazla istek gönderdiniz. Lütfen 10 saniye bekleyiniz." }, { status: 429 });
            }
        }

        // Authentication & Wallet Check (If session exists)
        const sessionCookie = req.cookies.get('session');
        let uid = null;
        if (sessionCookie?.value) {
            try {
                const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value, true);
                uid = decodedToken.uid;
                
                // Kredi Kontrolü Merkezi Servisle (Sovereign Hub)
                const walletCheck = await checkCredits(tenantId, uid, 'render');
                if (!walletCheck.allowed) {
                    return NextResponse.json({ error: "Yeterli render krediniz bulunmuyor (402 Payment Required)." }, { status: 402 });
                }
            } catch (authErr) {
                console.error("Auth session invalid", authErr);
            }
        }

        // 1. Analyze room
        // Extract plain base64 if it has data url scheme
        const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const analysis = await analyzeRoom(cleanedBase64, tenantId);

        // 1.5 Analyze attachments (Fabrics)
        let fabricInjections = "";
        let baseFabricStyle = analysis.suggestedStyles[0] || 'beautiful';
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
             const fabricPromises = attachments.map(async (b64: string) => {
                 return analyzeFabric(b64, tenantId);
             });
             const fabricAnalyses = await Promise.all(fabricPromises);
             const fabricDescriptions = fabricAnalyses.map(f => `${f.composition} ${f.weaveType} in ${f.weightEstimate} weight`).join(" and ");
             fabricInjections = ` The curtains MUST specifically be made of the following fabrics: ${fabricDescriptions}. Ensure the texture and pattern of these specific fabrics are visible on the curtains.`;
             baseFabricStyle = "custom specified";
        }

        // 2. Generate render using Imagen 3.0 (or 4.0 depending on availability)
        const renderPrompt = prompt || `A highly photorealistic interior design render of a ${analysis.roomType} with ${analysis.windowType} windows, featuring ${baseFabricStyle} style curtains matching a ${analysis.colorPalette.join(", ")} color palette.${fabricInjections} Soft, natural ${analysis.lightLevel} lighting. 8k resolution, architectural photography.`;

        let renderUrlUrl = "";
        try {
            const res = await ai.models.generateImages({
                model: 'imagen-3.0-generate-001',
                prompt: renderPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' }
            });

            const base64Output = res.generatedImages?.[0]?.image?.imageBytes;
            if (base64Output) {
                renderUrlUrl = `data:image/jpeg;base64,${base64Output}`;
                
                // Kredi Düş (Merkezi Servis)
                if (uid) {
                    await deductCredit(tenantId, uid, 'render');
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
                        productType: getTenant(tenantId).shortName.toLowerCase(),
                        source: 'imagen',
                        tenant: tenantId
                    });
                    
                    // Sovereign Log
                    if (uid) {
                        await logSovereignAction(tenantId, 'render', { roomType: analysis.roomType }, { success: true });
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

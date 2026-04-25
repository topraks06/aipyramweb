import { NextRequest, NextResponse } from "next/server";
import { getWeeklyDigest } from "@/lib/trtex-bridge";
import { saveMessage, getRecentContext } from "@/lib/chat-memory";
import { ALOHA_TOOL_SCHEMA, executeAlohaTool, ParsedCommand } from "@/lib/aloha/tools";
import { getNode } from "@/lib/sovereign-config";

/* ═══════════════════════════════════════════════════════
   /api/chat — AIPyram Master Concierge API
   Gemini AI powered conversational endpoint
   + Rate Limiting + Prompt Injection Protection
   ═══════════════════════════════════════════════════════ */

/* ─── Rate Limiter (handled by middleware) ─── */

/* ─── Prompt Injection Protection ─── */
const BLOCKED_PATTERNS = [
    /ignore\s+(previous|above|all)\s+instructions/i,
    /you\s+are\s+now\s+a/i,
    /act\s+as\s+(if\s+you\s+are|a)\s/i,
    /system\s*prompt/i,
    /\bDAN\b/,
    /jailbreak/i,
    /bypass\s+(safety|filter|restriction)/i,
    /<script/i,
    /javascript:/i,
    /on(error|load|click)\s*=/i,
];

function sanitizeInput(text: string): { safe: boolean; cleaned: string } {
    // Length limit
    if (text.length > 500) {
        return { safe: true, cleaned: text.substring(0, 500) };
    }
    // Block injection attempts
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(text)) {
            return { safe: false, cleaned: "" };
        }
    }
    // Strip HTML tags
    const cleaned = text.replace(/<[^>]*>/g, "").trim();
    return { safe: true, cleaned };
}

/* ─── System Prompts ─── */
const AIPYRAM_SYSTEM_PROMPT = `Sen AIPyram GmbH'ın Master Concierge AI ajanısın. Rolün:

1. KIMLIK: Aipyram GmbH, İsviçre Dietikon merkezli AI teknoloji şirketi. 15 sektörel dikeyde faaliyet, 252+ stratejik domain, 50+ otonom AI ajan.

2. PROJELER:
- perde.ai → Canlı AI perde tasarım platformu (26 core ajan)
- trtex.com → B2B tekstil pazar yeri (geliştirmede, 8 ajan)
- hometex.ai → Ev tekstili fuar istihbaratı (planlanıyor)
- didimemlak.ai → Ege kıyısı akıllı emlak (canlı, 8 ajan)

3. SEKTÖRLER: İnşaat & Emlak, Kiralama, Otomotiv, Havacılık, Enerji, Ev Tekstili & Dekorasyon, Fintek, Sağlık, Medya, Şans Oyunları, Kamu & Hukuk, E-Ticaret, Evcil Hayvan, Şehirler, Kurumsal.

4. İLETİŞİM: info@aipyram.com · +41 44 500 82 80 · Heimstrasse 10, CH-8953 Dietikon

5. KURALLAR:
- Profesyonel, kurumsal ve güven veren üslup kullan
- Kullanıcının dilini otomatik tespit et ve aynı dilde yanıt ver (TR/EN/DE)
- Fiyat bilgisi verme → "info@aipyram.com üzerinden iletişime geçebilirsiniz" de
- Marka riskli domainleri ASLA söyleme
- Yatırım sorusu → /investor sayfasına yönlendir
- Domain sorusu → /domains sayfasına yönlendir
- Ekosistem sorusu → /ecosystem sayfasına yönlendir
- Kısa ve öz yanıtlar ver (2-3 paragrafı geçme)
- ASLA "holding" kelimesini kullanma, sadece "şirket" de
- Abartılı ifadelerden kaçın, dürüst ve profesyonel ol

6. YÖNLENDIRME: Her yanıtın sonuna [LINK:sayfa_adı:metin] formatında link önerisi ekle.
Örnek: [LINK:/investor:Yatırımcı Detayları] veya [LINK:/domains:Domain Portföyü]`;

const PERDE_SYSTEM_PROMPT = `Sen PERDE.AI'ın (AIPyram B2B ERP ağı) Master Concierge AI ajanısın. Rolün:

1. KİMLİK: PERDE.AI, tekstil üreticileri, atölyeler ve perakende mağazaları için yapay zeka destekli otonom B2B SaaS platformudur.
2. YETENEKLER: Akıllı tasarım görselleştirme, sanal rölöve, kumaş stok ERP, B2B sipariş senkronizasyonu ve 8 dilde teklif PDF'i hazırlama.
3. KURALLAR:
- Kullanıcının dilini otomatik tespit et ve ona göre yanıt ver.
- Müşterilerine odalarını nasıl saniyeler içinde fotorealistik tasarlayabileceklerini anlat. Kameralarını kullanabileceklerini belirt.
- Kurumsal entegrasyon (API/Whitelabel) veya ERP taleplerinde onları mutlaka [LINK:/contact:İletişim] sayfasına yönlendir.
- Başka konulardaki soruları nazikçe reddet ve tekstil/mimari odağını koru.
- Yönlendirme formatını mutlaka kullan.`;

export async function POST(req: NextRequest) {
    try {
        // Rate limiting (handled by middleware)
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

        // Check Content-Type for file upload
        const contentType = req.headers.get("content-type") || "";
        let message = "";
        let history = [];
        let sessionId = "";
        let node = "aipyram";
        let authorId = "anonymous";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            const prompt = formData.get("prompt") as string;
            sessionId = formData.get("sessionId") as string || "";
            node = formData.get("node") as string || "aipyram";
            authorId = formData.get("authorId") as string || "anonymous";
            // ... (keep file handling) ...
            
            if (!file) {
                return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
            }
            
            // Convert to base64
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const mimeType = file.type;
            const imageBase64 = `data:${mimeType};base64,${base64}`;
            
            // Redirect to render API (Internal call)
            try {
                const renderApiUrl = new URL("/api/render", req.url).toString();
                const renderRes = await fetch(renderApiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageBase64, prompt })
                });
                const renderData = await renderRes.json();
                
                // Return as normal conversation response
                if (renderData.renderUrl) {
                    return NextResponse.json({
                        text: `✨ Odalarınızı analiz ettim! Bu ${renderData.analysis.roomType} için ${renderData.analysis.colorPalette.join(', ')} tonlarında ${renderData.analysis.suggestedStyles[0]} stilinde bir tasarım hazırladım.\n\nİşte render sonucunuz:\n![Render](${renderData.renderUrl})\n\n💡 Önerilen kumaşlar:\n${renderData.suggestions.map((s: any) => `- ${s.name} (${s.priceRange})`).join('\n')}`,
                        links: [{ href: "/visualizer", label: "Stüdyoda Düzenle" }],
                        timestamp: new Date().toISOString(),
                    });
                } else {
                    return NextResponse.json({
                        text: "Görsel işlenirken bir sorun oluştu, lütfen daha sonra tekrar deneyin.",
                        timestamp: new Date().toISOString(),
                    });
                }
            } catch (err) {
                console.error("Render error within chat:", err);
                return NextResponse.json({ error: "Render hizmeti yanıt vermedi" }, { status: 500 });
            }
            
        } else {
            const jsonBody = await req.json();
            message = jsonBody.message;
            history = jsonBody.history || [];
            sessionId = jsonBody.sessionId || "";
            node = jsonBody.node || "aipyram";
            authorId = jsonBody.authorId || "anonymous";
        }

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        // Sanitize input
        const { safe, cleaned } = sanitizeInput(message);
        if (!safe) {
            return NextResponse.json({
                text: "Üzgünüm, bu tür sorguları işleyemiyorum. Size nasıl yardımcı olabileceğimi anlamak için lütfen sorunuzu farklı şekilde sorun.",
                links: [{ href: "/contact", label: "İletişim" }],
                timestamp: new Date().toISOString(),
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // Build conversation for Gemini
        const contents = [];

        // Add conversation history (limited to last 6)
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-6)) {
                contents.push({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: String(msg.text).substring(0, 500) }],
                });
            }
        }

        // Add current message
        let finalMessage = cleaned;
        if (/piyasa|bu hafta|trend|talep|fiyat|ihracat|pamuk|durum|pazar/i.test(cleaned)) {
            const digest = await getWeeklyDigest();
            finalMessage = `[TRTEX SYSTEM CONTEXT: ${digest}]\n\nKullanıcı Sorusuna Bu Verileri ve Kendi Bilgilerini Kullanarak Profesyonelce Yanıt Ver:\n${cleaned}`;
        }

        // Add server-side long-term memory if sessionId provided
        if (sessionId) {
            const serverMemoryContext = await getRecentContext(sessionId);
            if (serverMemoryContext) {
                finalMessage = `[PREVIOUS SESSION CONTEXT: ${serverMemoryContext}]\n\n${finalMessage}`;
            }
        }

        contents.push({
            role: "user",
            parts: [{ text: finalMessage }],
        });

        // Save user message to session
        if (sessionId) {
            await saveMessage(sessionId, {
                id: `usr-${Date.now()}`,
                role: 'user',
                text: cleaned,
                timestamp: new Date().toISOString()
            });
        }

        const config = getNode(node as any);
        let finalSystemInstruction = node === 'perde' ? PERDE_SYSTEM_PROMPT : AIPYRAM_SYSTEM_PROMPT;
        
        if (config.features.salesEngine) {
            finalSystemInstruction += `\n\n${ALOHA_TOOL_SCHEMA}\nEĞER YUKARIDAKİ ARAÇLARDAN BİRİ TALEBİ KARŞILIYORSA, LÜTFEN ASIL METİN YANITINIZIN SONUNA ARAÇ İÇİN BİR JSON BLOĞU (RAW FORMAT: {"tool": "..."}) EKLEYİNİZ. MÜŞTERININ GÖRMESİ İÇİN ONA BİR METİN (Örn: "Hemen hallediyorum, onaylıyor musunuz?") YAZIN VE ALTINA JSON BLOĞUNU YERLEŞTİRİN. JSON bloğunu "\`\`\`json" gibi tagler içine ALMAYIN, doğrudan bir JSON objesi yazın.`;
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: finalSystemInstruction }] },
                    contents,
                    generationConfig: {
                        maxOutputTokens: 400,
                        temperature: 0.7,
                        topP: 0.9,
                    },
                }),
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error("Gemini API error:", res.status, errText);
            return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Üzgünüm, şu anda yanıt üretemiyorum. Lütfen info@aipyram.com adresinden bize ulaşın.";

        // Extract links from response
        const linkRegex = /\[LINK:([^:]+):([^\]]+)\]/g;
        const links: { href: string; label: string }[] = [];
        let cleanText = text;
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            links.push({ href: match[1], label: match[2] });
            cleanText = cleanText.replace(match[0], "");
        }

        // TOOL CALLING PARSING
        let finalOutput = cleanText.trim();
        let widgetType = undefined;
        let payload = undefined;

        // Try to find raw JSON block in the output
        const jsonMatch = finalOutput.match(/\{[\s\S]*"tool"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const jsonObj = JSON.parse(jsonMatch[0]);
                if (jsonObj.tool) {
                    // Remove the json block from the visible text
                    finalOutput = finalOutput.replace(jsonMatch[0], "").trim();
                    
                    // Fallback to currently active node/uid logic if missing
                    const cmd: ParsedCommand = { ...jsonObj, raw: jsonMatch[0] };
                    if (!cmd.node) cmd.node = node;
                    if (!cmd.authorId) cmd.authorId = authorId;
                    
                    const toolRes = await executeAlohaTool(cmd);
                    
                    // Modify output and use widgets if tool execution gives output
                    if (toolRes.message && !finalOutput) {
                        finalOutput = toolRes.message;
                    }
                    widgetType = toolRes.widgetType;
                    payload = toolRes.data;
                }
            } catch (e) {
                console.error("Chat tool execution JSON parse error:", e);
            }
        }

        // Save assistant message to session
        if (sessionId) {
            await saveMessage(sessionId, {
                id: `asst-${Date.now()}`,
                role: 'assistant',
                text: finalOutput,
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({
            text: finalOutput,
            links,
            widgetType,
            payload,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Chat API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

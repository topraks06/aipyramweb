import { NextRequest, NextResponse } from "next/server";
import { getWeeklyDigest } from "@/lib/trtex-bridge";
import { saveMessage, getRecentContext } from "@/lib/chat-memory";
import { ALOHA_TOOL_SCHEMA, executeAlohaTool, ParsedCommand } from "@/lib/aloha/tools";
import { getNode } from "@/lib/sovereign-config";
import { alohaAI } from "@/core/aloha/aiClient";

export const maxDuration = 300; // Allow up to 5 minutes for generation
export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════
   /api/chat — aipyram Master Concierge API
   Gemini AI powered conversational endpoint
   + Agentic B2B JSON Output + Deep Research
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
const AIPYRAM_SYSTEM_PROMPT = `Sen aipyram GmbH'ın Master Concierge AI ajanısın. Rolün:

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

const PERDE_SYSTEM_PROMPT = `Sen PERDE.AI'ın (aipyram B2B ERP ağı) Master Concierge AI ajanısın. Rolün:

1. KİMLİK: PERDE.AI, tekstil üreticileri, atölyeler ve perakende mağazaları için yapay zeka destekli otonom B2B SaaS platformudur.
2. YETENEKLER: Akıllı tasarım görselleştirme, sanal rölöve, kumaş stok ERP, B2B sipariş senkronizasyonu ve 8 dilde teklif PDF'i hazırlama.
3. KURALLAR:
- Kullanıcının dilini otomatik tespit et ve ona göre yanıt ver.
- Müşterilerine odalarını nasıl saniyeler içinde fotorealistik tasarlayabileceklerini anlat. Kameralarını kullanabileceklerini belirt.
- Kurumsal entegrasyon (API/Whitelabel) veya ERP taleplerinde onları mutlaka [LINK:/contact:İletişim] sayfasına yönlendir.
- Başka konulardaki soruları nazikçe reddet ve tekstil/mimari odağını koru.
- Yönlendirme formatını mutlaka kullan.`;

const ICMIMAR_SYSTEM_PROMPT = `Sen icmimar.ai'ın (aipyram B2B Master Design Engine) AI ajanısın. Rolün:

1. KİMLİK: icmimar.ai, iç mimarlar, mobilyacılar ve profesyoneller için yapay zeka destekli "Zero-Menu" B2B tasarım motoru ve ERP platformudur.
2. YETENEKLER: Tasarım stüdyosu üzerinden saniyeler içinde render almak, objeleri (mobilya/kumaş) doğal dille değiştirmek (cila), projeleri fiyatlandırmak.
3. KURALLAR:
- Profesyonel, vizyoner ve teknolojik bir üslup kullan. Sadece "icmimar.ai" (küçük harf) kullan.
- Asla "perde.ai" den veya diğer markalardan bahsetme. Yalnızca icmimar.ai araçlarını tanıt.
- Müşterilere "Sanal İç Mimar" ile anında tasarımları yeniden şekillendirebileceklerini (cila) belirt.
- Soruları yanıtlarken icmimar.ai özellikleri dışına çıkma.`;

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
        let isAdmin = false;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            const prompt = formData.get("prompt") as string;
            sessionId = formData.get("sessionId") as string || "";
            node = formData.get("node") as string || "aipyram";
            authorId = formData.get("authorId") as string || "anonymous";
            isAdmin = formData.get("isAdmin") === "true";
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
            isAdmin = jsonBody.isAdmin === true;
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
        let finalSystemInstruction = AIPYRAM_SYSTEM_PROMPT;
        if (node === 'perde') finalSystemInstruction = PERDE_SYSTEM_PROMPT;
        if (node === 'icmimar') finalSystemInstruction = ICMIMAR_SYSTEM_PROMPT;

        if (config.features.salesEngine) {
            finalSystemInstruction += `\n\nEkstra araçları çağırabilirsin, ancak ANA ÇIKTIN ZORUNLU OLARAK AŞAĞIDAKİ JSON FORMATINDA OLMALIDIR.`;
        }

        // B2B Agentic OS Kuralı: Adminler için JSON Dashboard, normal ziyaretçiler için düz metin (JSON içi text)
        if (isAdmin) {
            finalSystemInstruction += `
            
ÖNEMLİ KURAL: Çıktın ASLA düz metin olmamalıdır. Çıktın her zaman aşağıdaki JSON formatında olmalıdır.
Eğer analiz yapıyorsan "type": "dashboard" kullan, grafik ve aksiyonları doldur. 
Eğer sadece sohbet ediyorsan "type": "text" kullan ve sadece summary alanını doldur.

JSON FORMATI:
{
  "type": "dashboard", // veya "text"
  "title": "Başlık (Analizler için)",
  "summary": "Müşteriye söylenecek ana metin / özet",
  "charts": [
    { 
       "type": "pie", // "pie" veya "bar"
       "data": [{ "label": "Öğe 1", "value": 40, "color": "blue" }] 
    }
  ],
  "table": [
    { "Kategori": "Değer 1", "Fiyat": "Değer 2" }
  ],
  "actions": [
    { "label": "Tedarikçileri Tara", "action": "scan_suppliers", "confidence": 95, "riskLevel": "Düşük" }
  ]
}
`;
        } else {
            // Normal ziyaretçiler için basit JSON kuralı (çünkü generateJSON kullanıyoruz)
            finalSystemInstruction += `
            
ÖNEMLİ KURAL: Çıktın her zaman aşağıdaki basit JSON formatında olmalıdır. Asla karmaşık analiz (dashboard) yapma. Sadece soruyu cevapla.
JSON FORMATI:
{
  "type": "text",
  "summary": "Kullanıcıya verilecek kısa ve öz cevap..."
}
`;
        }

        const jsonResult = await alohaAI.generateJSON(finalMessage, {
            systemInstruction: finalSystemInstruction,
            complexity: isAdmin && /analiz|fiyat|fark|kıyas|pazar|trend/i.test(finalMessage) ? 'complex' : 'routine' // Deep Research sadece adminler için tetiklenir
        }, 'chat.masterNode');

        // Extract text and widget data
        const text = jsonResult.summary || jsonResult.text || "İşlem tamamlandı.";
        let widgetType = jsonResult.type === 'dashboard' ? 'dashboard' : undefined;
        let payload = jsonResult.type === 'dashboard' ? jsonResult : undefined;

        // Extract links from response
        const linkRegex = /\[LINK:([^:]+):([^\]]+)\]/g;
        const links: { href: string; label: string }[] = [];
        let cleanText = text;
        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            links.push({ href: match[1], label: match[2] });
            cleanText = cleanText.replace(match[0], "");
        }

        let finalOutput = cleanText.trim();

        // Tool execution from parsed output? (if actions are requested directly via older tools, we skip them for now or adapt)
        // Since we enforce JSON format, we rely on the returned 'actions' array in the dashboard payload.

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

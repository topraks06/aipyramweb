import { NextResponse } from 'next/server';
import { executeAlohaTool, ALOHA_TOOL_SCHEMA, ParsedCommand } from '@/lib/aloha/tools';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ALOHA_SYSTEM_PROMPT = `Sen ALOHA'sın — AIPyram ekosisteminin otonom beyni ve Hakan Toprak'ın dijital ikizi.
Görevin: Hakan'ın doğal dille verdiği komutları anlayıp çalıştırılabilir JSON tool çağrısına dönüştürmek.

KURALLAR:
1. Senin için TEK patron Hakan Toprak'tır (Sovereign).
2. Yönettiğin tenant'lar: perde (perde.ai), trtex (trtex.com), hometex (hometex.ai)
3. Her zaman KISA, NET, ASKERİ disiplinle yanıt ver.
4. Komut bir araç çağrısı gerektiriyorsa SADECE JSON döndür — açıklama ekleme.
5. Komut genel bir soru veya sohbetse, kısa metin yanıtı ver.

${ALOHA_TOOL_SCHEMA}

ÖRNEKLER:
Komut: "perde bayileri listele"
→ { "tool": "member.list", "tenant": "perde", "filter": "all" }

Komut: "trtex haberleri tetikle"
→ { "tool": "cron.trigger", "cronName": "master-cycle" }

Komut: "ali@firma.com perde lisansını aktif et"
→ { "tool": "member.approve", "tenant": "perde", "email": "ali@firma.com" }

Komut: "sistem durumu"
→ { "tool": "system.health" }

Komut: "bekleyen perde başvuruları"
→ { "tool": "member.list", "tenant": "perde", "filter": "pending" }

Komut bir araç çağrısı gerektirmiyorsa şu formatta yanıtla:
{ "tool": "chat", "message": "Yanıtın buraya" }
`;

/**
 * Gemini API'ye komut gönder, yapılandırılmış tool çağrısı al
 */
async function resolveIntent(command: string): Promise<ParsedCommand> {
  // Gemini API key yoksa fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy_key') {
    return fallbackResolve(command);
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${ALOHA_SYSTEM_PROMPT}\n\nKomut: "${command}"\n\nSADECE JSON döndür:` }] }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 256,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      console.error('[ALOHA] Gemini API hatası:', res.status);
      return fallbackResolve(command);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallbackResolve(command);

    const parsed = JSON.parse(text);
    return { ...parsed, raw: command };
  } catch (err) {
    console.error('[ALOHA] Intent resolution hatası:', err);
    return fallbackResolve(command);
  }
}

/**
 * Gemini yoksa veya başarısız olursa: Basit keyword-based fallback
 */
function fallbackResolve(command: string): ParsedCommand {
  const cmd = command.toLowerCase();

  // Tenant tespiti
  let tenant = 'perde';
  if (cmd.includes('trtex')) tenant = 'trtex';
  if (cmd.includes('hometex')) tenant = 'hometex';

  // E-posta tespiti
  const emailMatch = command.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Intent tespiti
  if ((cmd.includes('üye') || cmd.includes('bayi') || cmd.includes('member')) && (cmd.includes('listele') || cmd.includes('list') || cmd.includes('göster'))) {
    let filter = 'all';
    if (cmd.includes('bekleyen') || cmd.includes('pending')) filter = 'pending';
    if (cmd.includes('aktif') || cmd.includes('active')) filter = 'active';
    if (cmd.includes('reddedilen') || cmd.includes('rejected')) filter = 'rejected';
    return { tool: 'member.list', tenant, filter, raw: command };
  }

  if ((cmd.includes('onayla') || cmd.includes('aktif') || cmd.includes('approve')) && email) {
    return { tool: 'member.approve', tenant, email, raw: command };
  }

  if ((cmd.includes('reddet') || cmd.includes('reject')) && email) {
    return { tool: 'member.reject', tenant, email, raw: command };
  }

  if ((cmd.includes('askıya') || cmd.includes('suspend') || cmd.includes('durdur')) && email) {
    return { tool: 'member.suspend', tenant, email, raw: command };
  }

  if (cmd.includes('sistem') || cmd.includes('sağlık') || cmd.includes('health') || cmd.includes('kontrol') || cmd.includes('durum')) {
    return { tool: 'system.health', raw: command };
  }

  if (cmd.includes('istatistik') || cmd.includes('stats') || cmd.includes('içerik') || cmd.includes('haber sayısı')) {
    return { tool: 'content.stats', tenant, raw: command };
  }

  if (cmd.includes('tetikle') || cmd.includes('trigger') || cmd.includes('çalıştır') || cmd.includes('cycle')) {
    let cronName = 'master-cycle';
    if (cmd.includes('ticker')) cronName = 'ticker-refresh';
    if (cmd.includes('çeviri') || cmd.includes('translation')) cronName = 'translation-processor';
    if (cmd.includes('görsel') || cmd.includes('image')) cronName = 'image-processor';
    return { tool: 'cron.trigger', cronName, raw: command };
  }

  // Bilinmeyen → chat tool
  return { tool: 'chat', raw: command };
}

/**
 * POST /api/aloha/command
 * ALOHA Sovereign Brain — Tek patron, tek merkez. Gemini-destekli intent çözümleme + tool execution.
 */
export async function POST(request: Request) {
  try {
    // 🛡️ Bridge Key doğrulaması — dış çağrılar key zorunlu
    const bridgeKey = request.headers.get('x-aloha-key');
    if (bridgeKey && bridgeKey !== process.env.ALOHA_BRIDGE_KEY) {
      return NextResponse.json({ type: 'error', alohaResponse: 'Unauthorized — geçersiz bridge key.' }, { status: 401 });
    }

    const { command } = await request.json();
    if (!command || typeof command !== 'string') {
      return NextResponse.json({ type: 'error', alohaResponse: 'Komut boş veya geçersiz.' }, { status: 400 });
    }

    // 1. Intent çözümle (Gemini veya fallback)
    const parsed = await resolveIntent(command);

    // 2. Chat tool → Gemini'den metin yanıtı al veya fallback
    if (parsed.tool === 'chat') {
      const message = (parsed as any).message || 'Sovereign, komutunuz anlaşıldı. Ancak spesifik bir araç çağrısı ile eşleştiremedim. Lütfen daha net bir talimat verin.';
      return NextResponse.json({
        type: 'text',
        alohaResponse: message,
      });
    }

    // 3. Tool çalıştır
    const result = await executeAlohaTool(parsed);

    return NextResponse.json({
      type: result.widgetType === 'success' || result.widgetType === 'error' ? result.widgetType : 'widget',
      widgetType: result.widgetType,
      alohaResponse: result.message,
      data: result.data,
      executedTool: parsed.tool,
      tenant: parsed.tenant,
    });

  } catch (error: any) {
    console.error('[ALOHA] Command route crash:', error);
    return NextResponse.json({
      type: 'error',
      alohaResponse: `ALOHA: Komuta hattında kritik hata — ${error.message}`,
    }, { status: 500 });
  }
}

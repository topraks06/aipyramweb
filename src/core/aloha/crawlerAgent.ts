import { alohaAI } from './aiClient';
import { logAlohaAction } from './engine';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA CRAWLER AGENT (Computer Use)                           ║
 * ║  Tedarik zinciri için dış ağ tarama (Computer Use Simulation) ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

export async function executeCrawlerAgent(url: string, instruction: string): Promise<string> {
  console.log(`[🕷️ CRAWLER AGENT] Hedef: ${url} | Talimat: ${instruction}`);
  logAlohaAction("CRAWLER_AGENT_START", { url, instruction });

  try {
    // Gemini 3.1 Pro 'Deep Research Max' with Google Search grounding
    // for real-time web intelligence gathering
    const prompt = `
      Sen bir Crawler (Web Gözlem) Ajanısın. 'Computer Use' yeteneklerini simüle ederek aşağıdaki adrese gidip, istenen bilgiyi çıkar:
      URL: ${url}
      Talimat: ${instruction}
      
      Not: Dış bağlantıyı analiz edip özetle ve stok/fiyat/istihbarat verilerini JSON veya düz metin olarak çıkar.
    `;

    const result = await alohaAI.generate(prompt, {
      complexity: 'complex',
      temperature: 0.3,
    }, 'crawler_agent');

    const responseText = result.text || "Tarama başarısız.";
    logAlohaAction("CRAWLER_AGENT_SUCCESS", { url, responseText });
    return responseText;

  } catch (error: any) {
    console.error("[CrawlerAgent Error]", error);
    logAlohaAction("CRAWLER_AGENT_ERROR", { url, error: error.message });
    return `[HATA] CrawlerAgent başarısız oldu: ${error.message}`;
  }
}

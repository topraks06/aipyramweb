import { NextResponse } from 'next/server';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import fs from 'fs';
import path from 'path';

// Removed raw ai client
export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ success: false, error: "Niyet belirtilmedi. Satın mi almak istiyorsun?" }, { status: 400 });
    }

    // Ajan Fabrikasından mevcut startupların (15 adet) domain bilgilerini ve görevlerini okuyalım:
    let siteAgents = "Startups Unknown";
    try {
      const sitePath = path.join(process.cwd(), 'src/core/agents/site-agents.json');
      siteAgents = fs.readFileSync(sitePath, 'utf8');
    } catch(e) {}

    const prompt = `
Sen "Aloha Master", aipyram Holding'in acımasız B2B CEO'susun. 
Müşteri şu "Niyet/Arama Sinyalini" kovan zihnine yolladı: "${query}"

Senin elindeki Holding Startupları (Ajanları) Şunlardır:
${siteAgents}

GÖREVİN: Müşterinin bu niyetine göre hangi ajan/startup tarafına (Örn: perde.ai, hometex.ai, fethiye.ai vb.) GİTMESİ veya YÖNLENDİRİLMESİ gerektiğine kesin karar ver.

DÖNÜŞ FORMATI (SADECE JSON - MARKDOWN YOK):
{
  "targetDomain": "uygun proje domaini örn: perde.ai",
  "reasoningTR": "Ajanın Hakan Toprak ticari vizyonuyla, 2 kelimelik neden yönlendirdiği logu",
  "actionCommand": "REDIRECT" veya "INVESTIGATE"
}
`;

    if (process.env.GEMINI_API_KEY) {
      const { text } = await alohaAI.generate(prompt, { complexity: 'routine' }, 'concierge.route');

      let jsonStr = text || "{}";
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const action = JSON.parse(jsonStr);

      return NextResponse.json({
        success: true,
        masterCommand: action
      });
    } else {
        return NextResponse.json({
            success: true,
            masterCommand: {
                targetDomain: "hometex.ai",
                reasoningTR: "API YOK - MOCK MODE",
                actionCommand: "REDIRECT"
            }
        });
    }

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Aloha Koma Girdi' }, { status: 500 });
  }
}

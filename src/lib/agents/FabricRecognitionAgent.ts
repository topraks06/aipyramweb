import { alohaAI } from '@/core/aloha/aiClient';

export interface FabricResult {
  composition: string;
  weaveType: string;
  weightEstimate: string;
  recommendedUse: string[];
}

export async function analyzeFabric(imageBase64: string, SovereignNodeId: string): Promise<FabricResult> {
  console.log(`[FabricAgent] ${SovereignNodeId} için kumaş analizi yapılıyor...`);

  const prompt = `Lütfen bu tekstil görselini analiz et. JSON formatı:
{
  "composition": "%100 Pamuk vb.",
  "weaveType": "Saten, Keten dokuma vb.",
  "weightEstimate": "Hafif, Orta, Ağır",
  "recommendedUse": ["Perde", "Döşemelik"]
}`;

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // Merkezi alohaAI router üzerinden çağrı — CFO Guard & token bütçesi aktif
    const result = await alohaAI.generateJSON<FabricResult>(
      prompt,
      {
        complexity: 'routine',
        systemInstruction: "Sen tekstil ve kumaş uzmanı bir ajansın. Görseldeki kumaşın dokusunu analiz edip SADECE JSON döndür.",
        inlineImages: [{
          data: cleanBase64,
          mimeType: "image/jpeg"
        }],
      },
      `fabric_analysis_${SovereignNodeId}`
    );

    if (result) return result;
    throw new Error("AI JSON parse başarısız");
  } catch (error) {
    console.error("[FabricAgent] Kumaş analiz hatası:", error);
    return {
       composition: "Bilinmiyor",
       weaveType: "Bilinmiyor",
       weightEstimate: "Orta",
       recommendedUse: []
    };
  }
}

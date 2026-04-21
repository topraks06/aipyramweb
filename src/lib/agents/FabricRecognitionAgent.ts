import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface FabricResult {
  composition: string;
  weaveType: string;
  weightEstimate: string;
  recommendedUse: string[];
}

export async function analyzeFabric(imageBase64: string, tenantId: string): Promise<FabricResult> {
  console.log(`[FabricAgent] ${tenantId} için kumaş analizi yapılıyor...`);
  
  const model = ai.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "Sen tekstil ve kumaş uzmanı bir ajansın. Görseldeki kumaşın dokusunu analiz edip SADECE JSON döndür."
  });

  const prompt = `Lütfen bu tekstil görselini analiz et. JSON formatı:
{
  "composition": "%100 Pamuk vb.",
  "weaveType": "Saten, Keten dokuma vb.",
  "weightEstimate": "Hafif, Orta, Ağır",
  "recommendedUse": ["Perde", "Döşemelik"]
}`;

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanText) as FabricResult;
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

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface RoomAnalysis {
    roomType: 'salon' | 'yatak_odasi' | 'ofis' | 'cocuk' | 'diger';
    lightLevel: 'parlak' | 'orta' | 'karanlik';
    colorPalette: string[];
    windowType: 'genis' | 'dar' | 'kemer' | 'standart';
    suggestedStyles: string[];
    suggestedFabrics: { name: string; priceRange: string }[];
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

import { getTenant } from "@/lib/tenant-config";

export async function analyzeRoom(imageBase64: string, tenantId: string = 'perde'): Promise<RoomAnalysis> {
    const config = getTenant(tenantId);
    let systemInstruction = "Sen bir iç mimar asistanısın. Gönderilen odayı analiz et ve perde önerisi yap. SADECE JSON formatında Türkçe yanıt ver, hiçbir markdown veya ekstra açıklama olmadan.";
    
    if (tenantId === 'hometex') {
        systemInstruction = "Sen ev tekstili uzmanısın. Gönderilen görseli analiz et ve perde veya halı/mobilya gibi ev tekstili ürünleri/kumaşları için JSON formatında öneriler sun.";
    } else if (tenantId === 'vorhang') {
        systemInstruction = "Du bist ein europäischer Innenarchitekt. Analysiere den Raum und mache Vorhang-Empfehlungen. Antworte NUR im JSON-Format auf Deutsch.";
    }
    const model = ai.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction
    });

    const prompt = `Analiz formatı:
{
  "roomType": "salon" | "yatak_odasi" | "ofis" | "cocuk" | "diger",
  "lightLevel": "parlak" | "orta" | "karanlik",
  "colorPalette": ["renk1", "renk2"],
  "windowType": "genis" | "dar" | "kemer" | "standart",
  "suggestedStyles": ["stil1", "stil2"],
  "suggestedFabrics": [{"name": "Kumaş Adı", "priceRange": "₺850 - ₺2.400/metre"}]
}`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg"
            }
        }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
        return JSON.parse(cleanText) as RoomAnalysis;
    } catch (e) {
        console.error("Vision Analysis JSON parse error:", e);
        // Fallback
        return {
            roomType: 'salon',
            lightLevel: 'orta',
            colorPalette: [],
            windowType: 'standart',
            suggestedStyles: ['modern'],
            suggestedFabrics: [{ name: 'Sade Blackout Perde', priceRange: '₺850 - ₺2.400/metre' }]
        };
    }
}

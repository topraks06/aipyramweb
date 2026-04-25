import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

import { getNode } from "@/lib/sovereign-config";

export async function analyzeRoom(imageBase64: string, SovereignNodeId: string = 'perde'): Promise<RoomAnalysis> {
    const config = getNode(SovereignNodeId);
    let systemInstruction = "Sen bir iç mimar asistanısın. Gönderilen odayı analiz et ve perde önerisi yap. SADECE JSON formatında Türkçe yanıt ver, hiçbir markdown veya ekstra açıklama olmadan.";
    
    if (SovereignNodeId === 'hometex') {
        systemInstruction = "Sen ev tekstili uzmanısın. Gönderilen görseli analiz et ve perde veya halı/mobilya gibi ev tekstili ürünleri/kumaşları için JSON formatında öneriler sun.";
    } else if (SovereignNodeId === 'vorhang') {
        systemInstruction = "Du bist ein europäischer Innenarchitekt. Analysiere den Raum und mache Vorhang-Empfehlungen. Antworte NUR im JSON-Format auf Deutsch.";
    }
    const model = 'gemini-2.5-flash';

    const prompt = `Analiz formatı:
{
  "roomType": "salon" | "yatak_odasi" | "ofis" | "cocuk" | "diger",
  "lightLevel": "parlak" | "orta" | "karanlik",
  "colorPalette": ["renk1", "renk2"],
  "windowType": "genis" | "dar" | "kemer" | "standart",
  "suggestedStyles": ["stil1", "stil2"],
  "suggestedFabrics": [{"name": "Kumaş Adı", "priceRange": "₺850 - ₺2.400/metre"}]
}`;

    try {
        const jsonResult = await alohaAI.generateJSON([prompt, { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }], {
            systemInstruction,
            complexity: 'routine'
        }, 'vision-analyzer.analyzeRoom');
        return jsonResult as RoomAnalysis;
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

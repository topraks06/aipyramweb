import { GoogleGenAI } from '@google/genai';
require('dotenv').config({ path: '.env.local' });

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'a futuristic curtain texture',
      config: { numberOfImages: 1, aspectRatio: '16:9' }
    });
    console.log("SUCCESS");
  } catch (e: any) {
    console.log("FAIL with apiKey:", e.message);
  }
}
test();

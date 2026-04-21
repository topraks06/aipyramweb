import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  const arr = [];
  for await (const page of response) {
      arr.push(page);
  }
  console.log(arr.map((m: any) => m.name).filter((n: string) => n.includes('imagen')));
}
listModels();

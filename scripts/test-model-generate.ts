import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const client = new GoogleGenAI({ apiKey });
  
  try {
    const modelsToTest = [
      'gemini-3.1-flash-lite-preview',
      'gemini-3.1-pro-preview',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];
    
    for (const model of modelsToTest) {
      console.log(`Testing model: ${model}...`);
      try {
        const response = await client.models.generateContent({
          model: model,
          contents: "Hello world, what model are you?"
        });
        console.log(`✅ Success with ${model}:`, response.text);
      } catch (e: any) {
        console.error(`❌ Failed with ${model}:`, e.message);
      }
    }
  } catch (e) {
    console.error("Initialization error:", e);
  }
}
run();

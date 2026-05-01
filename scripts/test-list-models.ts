import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const client = new GoogleGenAI({ apiKey });
  
  try {
    const models = await client.models.list();
    let found = false;
    for await (const model of models) {
      if (model.name.includes('gemini-3.1')) {
        console.log("FOUND MODEL:", model.name);
        found = true;
      }
    }
    if (!found) {
      console.log("No gemini-3.1 models found! Listing all models instead:");
      for await (const model of await client.models.list()) {
        console.log(model.name);
      }
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}
run();

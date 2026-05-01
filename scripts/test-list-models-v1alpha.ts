import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  // Try initializing with a different api version, or see if we can do fetch directly.
  const res = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models?key=${apiKey}`);
  const data = await res.json();
  let found = false;
  if (data.models) {
    for (const model of data.models) {
      if (model.name.includes('gemini-3.1')) {
        console.log("v1alpha FOUND MODEL:", model.name);
        found = true;
      }
    }
    if (!found) {
        console.log("No gemini-3.1 models in v1alpha");
    }
  } else {
    console.error("Error fetching v1alpha models:", data);
  }
}
run();

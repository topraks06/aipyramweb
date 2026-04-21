import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });
  }
  return aiClient;
}

/**
 * Trendsetter Agent
 * Analyzes TRTex market data and generates visual trend predictions.
 */
export async function analyzeMarketTrends(trtexData: any) {
  try {
    const prompt = `
      You are an expert B2B home textile trend forecaster. Analyze the following market data from TRTex:
      ${JSON.stringify(trtexData)}
      
      What are the top 3 emerging trends in colors, fabrics, and patterns for the upcoming season?
      Provide a short, punchy summary for a luxury B2B dashboard.
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('[Trendsetter Agent] Analysis failed:', error);
    throw error;
  }
}

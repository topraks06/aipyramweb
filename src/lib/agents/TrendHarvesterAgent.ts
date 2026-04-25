import { alohaAI } from '@/core/aloha/aiClient';
// Removed raw ai client

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

    const { text } = await alohaAI.generate(prompt, { complexity: 'routine' }, 'TrendHarvesterAgent.analyzeMarketTrends');
    return text;
  } catch (error) {
    console.error('[Trendsetter Agent] Analysis failed:', error);
    throw error;
  }
}

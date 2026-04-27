import { alohaAI } from '@/core/aloha/aiClient';
// Removed raw ai client

/**
 * Polyglot Translator Agent
 * Translates product descriptions, tags, and technical details into 7 target languages.
 */
export async function translateContent(text: string, targetLanguages: string[]) {
  try {
    const prompt = `
      You are an expert B2B textile translator. Translate the following text into these languages: ${targetLanguages.join(', ')}.
      Maintain professional, luxury, and technical textile terminology.
      
      Text to translate: "${text}"
      
      Return the result strictly as a JSON object where keys are language codes (e.g., 'tr', 'en', 'de') and values are the translated strings.
    `;

    const res = await alohaAI.generate(prompt, { 
      responseMimeType: 'application/json',
      complexity: 'routine'
    }, 'PolyglotAgent.translateContent');

    return JSON.parse(text || '{}');
  } catch (error) {
    console.error('[Polyglot Agent] Translation failed:', error);
    throw error;
  }
}

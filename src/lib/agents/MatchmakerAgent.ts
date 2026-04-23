import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = alohaAI.getClient();
  }
  return aiClient;
}

/**
 * Matchmaker Agent
 * Analyzes incoming RFQs (Request for Quotations) and matches them with the best suppliers.
 */
export async function matchSupplierWithRFQ(rfqDetails: any, suppliers: any[]) {
  try {
    const prompt = `
      You are a B2B Matchmaker Agent for a luxury home textile platform.
      
      Buyer RFQ (Request for Quotation):
      ${JSON.stringify(rfqDetails)}
      
      Available Suppliers:
      ${JSON.stringify(suppliers)}
      
      Analyze the buyer's needs (fabric type, certifications like OEKO-TEX, MOQ, lead time) and match them with the top 3 most suitable suppliers from the list.
      Explain WHY they are a good match.
      
      Return a JSON array of objects with keys: supplierId, matchScore (0-100), and reason.
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('[Matchmaker Agent] Matching failed:', error);
    throw error;
  }
}

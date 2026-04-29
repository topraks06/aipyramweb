import { alohaAI } from './aiClient';
import { adminDb } from '@/lib/firebase-admin';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA RAG ENGINE (Vertex AI / AsyncRetrieveContexts)         ║
 * ║  Gemini Embedding-2 ile Vektör Arama ve Bağlam Çıkarma        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedding = await alohaAI.generateEmbedding(text, 'rag_engine');
    if (embedding && embedding.length > 0) return embedding;
    console.warn("[RAG] Embedding boş döndü, boş dizi kullanılıyor");
    return [];
  } catch (err) {
    console.error("[RAG] Embedding üretim hatası:", err);
    return [];
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * AsyncRetrieveContexts API
 * @param query Sorgu metni
 * @param agentType 'Local Agent' veya 'Style Advisor' vs
 */
export async function AsyncRetrieveContexts(query: string, agentType: string = 'general'): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // In production with Vertex AI Search or Firestore Vector Search, we'd use .findNearest()
    // For now, we simulate vector search over aloha_knowledge
    const snapshot = await adminDb.collection('aloha_knowledge')
      .where('active', '==', true)
      .limit(100)
      .get();

    const contexts = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.embedding && Array.isArray(data.embedding)) {
        const score = cosineSimilarity(queryEmbedding, data.embedding);
        if (score > 0.7) { // Threshold
          contexts.push({ id: doc.id, score, ...data });
        }
      }
    }

    // Sort by score
    contexts.sort((a, b) => b.score - a.score);
    return contexts.slice(0, 5); // Return top 5

  } catch (error) {
    console.error("[RAG Engine] Error retrieving contexts:", error);
    return [];
  }
}

export async function storeKnowledgeWithEmbedding(topic: string, content: string, source: string, metadata: any) {
  const embedding = await generateEmbedding(`${topic}\n${content}`);
  
  const docRef = adminDb.collection('aloha_knowledge').doc();
  await docRef.set({
    topic,
    content,
    source,
    metadata,
    embedding,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  });
  return docRef.id;
}

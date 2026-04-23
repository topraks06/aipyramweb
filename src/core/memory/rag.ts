import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, QueryDocumentSnapshot, DocumentData, addDoc } from 'firebase/firestore';

/**
 * Basic Firebase initialization for RAG (Retrieval-Augmented Generation) memory.
 * Expects process.env variables to be defined.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase securely (avoiding double initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export interface RAGDocument {
  id: string;
  source: string;
  text: string;
  agentId: string;
}

/**
 * memory base query engine for Apollon
 */
export async function queryMemoryBase(agentId: string = "APOLLON"): Promise<RAGDocument[]> {
  try {
    if (!firebaseConfig.projectId) {
      console.warn("[Memory] Firebase Project ID missing. RAG is disabled.");
      return [];
    }

    const q = query(
      collection(db, "knowledge_base"),
      where("agentId", "in", [agentId, "Aloha", "Master"])
    );
    
    const querySnapshot = await getDocs(q);
    const docs: RAGDocument[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      docs.push({
        id: doc.id,
        source: data.source || 'Unknown Source',
        text: data.content || '',
        agentId: data.agentId || 'Unknown'
      });
    });

    console.log(`[Memory] Apollon fetched ${docs.length} historical RAG records.`);
    return docs;
  } catch (error) {
    console.error(`[Memory Error] Failed to access RAG for ${agentId}:`, error);
    return [];
  }
}

/**
 * FAZ 4.3: Knowledge Flywheel (V8.4 Flywheel Edition)
 * Semantic vs. Structured: Vektör tabanlı (vector_embedding) arama desteği eklendi.
 * Cross-Pollination: isGlobal bayrağı ile tüm ajanlara (15 sektör) tecrübe yayımı.
 */
export async function addKnowledge(
  SovereignNodeId: string, 
  category: string, 
  content: string, 
  sourceId: string,
  embedding?: number[],
  isGlobal?: boolean
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, "knowledge_base"), {
      SovereignNodeId: isGlobal ? "global_strategy" : SovereignNodeId, // Cross-pollination check
      agentId: "FLYWHEEL",
      category,
      source: `DealAnalyzer:${sourceId}`,
      content,
      vector_embedding: embedding || [], // Vertex AI Embedding desteği (Firebase native)
      timestamp: Date.now()
    });
    console.log(`[RAG Memory] Gömülü Ticaret Tecrübesi (Vectorized) Kaydedildi (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error("[RAG Memory Error] Knowledge Flywheel kayıt yapamadı:", error);
    return null;
  }
}

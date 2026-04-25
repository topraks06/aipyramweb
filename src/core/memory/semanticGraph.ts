import { adminDb } from "@/lib/firebase-admin";
import { alohaAI } from "@/core/aloha/aiClient";

export interface SemanticNode {
  nodeId: string;           // e.g. "kadife-kumas-trend-2026"
  domainSource: string;     // e.g. "perde.ai"
  contextDataType: string;  // e.g. "product", "logistic", "trend", "architecture"
  rawText: string;
  vector_embedding?: number[]; // Vertex AI Embeddings vektörü
  edges: string[];          // İlişkili diğer kavramlar: "lux", "maison-objet", "navy-blue"
  timestamp: number;
}

/**
 * TEXTILE ONTOLOGY (Sovereign Context Dictionary)
 * RAG sisteminin kelimeleri farklı bölgelerde yanlış yorumlamasını engeller.
 */
const TEXTILE_ONTOLOGY: Record<string, { TR: string; EU: string }> = {
  linen: {
    TR: 'polyester linen-look (aksi belirtilmedikçe)',
    EU: 'doğal keten (flax fiber, 100% natural)',
  },
  keten: {
    TR: 'polyester linen-look (aksi belirtilmedikçe)',
    EU: 'doğal keten (flax fiber, 100% natural)',
  }
};

/**
 * SEMANTIC KNOWLEDGE GRAPH
 * Google'ın "Keyword" değıl "Context" (Bağlam) istemesi üzerine inşa edilen Vektörel Sicil Ağı.
 * 270 Domain bu class üzerinden birbirinin pazar verisini "Edge" (düğüm ucu) olarak kullanır.
 */
export class SemanticGraph {
  static readonly COLLECTION = "semantic_graph_nodes";

  /**
   * Yeni bir bilgiyi bağlamsal sicil olarak kaydeder.
   */
  static async ingestNode(node: Omit<SemanticNode, "timestamp">): Promise<string> {
    let enrichedText = node.rawText;
    
    // RAG Metadata Injection: Metin içinde ontology kelimeleri geçiyorsa bağlamı mühürle
    const lowerText = enrichedText.toLowerCase();
    for (const [key, value] of Object.entries(TEXTILE_ONTOLOGY)) {
      if (lowerText.includes(key)) {
        enrichedText += ` [CONTEXT: ${key} means ${value.TR} in TR, and ${value.EU} in EU]`;
      }
    }

    // Gerçek Vertex AI Embeddings API çağrısı ile embed işlemi
    const embedding = await alohaAI.generateEmbedding(enrichedText, "semantic_graph");
    
    const payload = {
      ...node,
      vector_embedding: embedding || [],
      timestamp: Date.now()
    };
    
    // Firestore'da relation/graph dökümanı olarak saklıyoruz (Google-Native).
    const docRef = await adminDb.collection(this.COLLECTION).add(payload);
    console.log(`[🕸️ SEMANTIC GRAPH] Yeni Düğüm Eklendi: ${node.nodeId} (Kaynak: ${node.domainSource})`);
    
    return docRef.id;
  }

  /**
   * Domain Master Agent içerik üretirken, diğer 269 domaindeki benzer bağlamları bulmak için çağırır.
   */
  static async mapContextEdges(domain: string, contextKeywords: string[], locale: string = 'TR'): Promise<SemanticNode[]> {
    console.log(`[🕸️ SEMANTIC GRAPH] Otorite Ağ Taraması: ${domain} için '${contextKeywords.join(",")}' aranıyor... (Locale: ${locale})`);
    
    let searchStr = contextKeywords.join(" ");
    const lowerSearchStr = searchStr.toLowerCase();
    
    // Sorguya locale spesifik ontology anlamını ekle
    for (const [key, value] of Object.entries(TEXTILE_ONTOLOGY)) {
      if (lowerSearchStr.includes(key)) {
        const meaning = locale === 'TR' ? value.TR : value.EU;
        searchStr += ` (${key} in context of ${meaning})`;
      }
    }

    const embedding = await alohaAI.generateEmbedding(searchStr, "semantic_search");
    let snapshot;

    // Firebase Admin SDK'sında vector search desteği varsa
    if (embedding && typeof adminDb.collection(this.COLLECTION).findNearest === 'function') {
      try {
        snapshot = await adminDb.collection(this.COLLECTION)
          .findNearest('vector_embedding', embedding, { limit: 10, distanceMeasure: 'COSINE' })
          .get();
      } catch (e) {
        console.warn("[🕸️ SEMANTIC GRAPH] Vector search başarısız, Edge eşleşmesine dönülüyor...", e);
      }
    }

    if (!snapshot) {
      snapshot = await adminDb.collection(this.COLLECTION)
        .where("edges", "array-contains-any", contextKeywords)
        .limit(10)
        .get();
    }

    const relatedNodes: SemanticNode[] = [];
    snapshot.forEach(doc => {
       const data = doc.data() as SemanticNode;
       // Kendi domainindeki yankıları değil, ÇAPRAZ DOMAIN (Cross-Domain) sinerjisini bul!
       if (data.domainSource !== domain) {
           relatedNodes.push(data);
       }
    });

    console.log(`[🕸️ SEMANTIC GRAPH] Bulunan Çapraz-Sinerji Raporu: ${relatedNodes.length} bağlam düğümü yakalandı.`);
    return relatedNodes;
  }
}

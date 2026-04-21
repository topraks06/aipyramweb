import { adminDb } from "@/lib/firebase-admin";

export interface SemanticNode {
  nodeId: string;           // e.g. "kadife-kumas-trend-2026"
  domainSource: string;     // e.g. "perde.ai"
  contextDataType: string;  // e.g. "product", "logistic", "trend", "architecture"
  rawText: string;
  vectorId?: string;        // Vertex AI Embeddings referans vektör ID'si (Faz 5.2'de aktif edilecek)
  edges: string[];          // İlişkili diğer kavramlar: "lux", "maison-objet", "navy-blue"
  timestamp: number;
}

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
    const payload = {
      ...node,
      timestamp: Date.now()
    };
    
    // Gerçek prodüksiyonda burada Vertex AI Embeddings API çağrısı ile embed işlemi yapılır.
    // Şimdilik Firestore'da relation/graph dökümanı olarak saklıyoruz (Google-Native).
    const docRef = await adminDb.collection(this.COLLECTION).add(payload);
    console.log(`[🕸️ SEMANTIC GRAPH] Yeni Düğüm Eklendi: ${node.nodeId} (Kaynak: ${node.domainSource})`);
    
    return docRef.id;
  }

  /**
   * Domain Master Agent içerik üretirken, diğer 269 domaindeki benzer bağlamları bulmak için çağırır.
   */
  static async mapContextEdges(domain: string, contextKeywords: string[]): Promise<SemanticNode[]> {
    console.log(`[🕸️ SEMANTIC GRAPH] Otorite Ağ Taraması: ${domain} için '${contextKeywords.join(",")}' aranıyor...`);
    
    // Firestore'da 'array-contains-any' ile "Edge" eşleştirmesi yapıyoruz.
    // Bu, vektörel yakınlık (Cosine Similarity) aramasının en ilkel simülasyonudur.
    const snapshot = await adminDb.collection(this.COLLECTION)
      .where("edges", "array-contains-any", contextKeywords)
      .limit(10)
      .get();

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

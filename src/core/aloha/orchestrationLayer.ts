import { alohaAI } from './aiClient';
import { ecosystemBus } from '@/core/events/ecosystemBus';
import { EcosystemSignalType } from '@/core/events/signalTypes';

export interface OrchestrationRequest {
  query: string;
  intent: string;           
  user_locale: string;
  tenant_context?: string;  
}

export interface DataCard {
  type: 'trend' | 'product' | 'match' | 'price' | 'opportunity';
  title: string;
  content: string;
  source_tenant: string;
  action_url?: string;
  visual?: { chart_type: string; data: any };
}

export interface OrchestrationResult {
  executive_brief: string;          
  data_cards: DataCard[];           
  ecosystem_signals_fired: string[]; 
  suggested_actions: string[];       
}

/**
 * ORCHESTRATION LAYER
 * "İtalya 500 oda otel" gibi karmaşık sorguları parçalar, 
 * tenant verilerini paralel çeker ve birleştirir.
 */
export async function orchestrateQuery(request: OrchestrationRequest): Promise<OrchestrationResult> {
  console.log(`[ORCHESTRATOR] 🧠 Sorgu analiz ediliyor: "${request.query}" | Intent: ${request.intent}`);

  const defaultResult: OrchestrationResult = {
    executive_brief: 'Şu an sistem verilerini tam olarak sentezleyemedim, ancak isteğinizi aldım.',
    data_cards: [],
    ecosystem_signals_fired: [],
    suggested_actions: ['info@aipyram.com ile iletişime geçin']
  };

  try {
    const ai = alohaAI.getClient();
    
    // Basit bir mock veri çekme simülasyonu.
    // İleride gerçek Firestore sorguları veya TRTEX/Perde/Hometex agent çağrıları buraya eklenecek.
    const trtexData = "Son 1 ayda İtalya pazarında otel tekstili talebi %15 arttı. Lüks polyester blend trendi yükselişte.";
    const perdeData = "Otel odaları için blackout ve akustik perdelerde yeni 3 tasarımımız mevcut.";
    
    const prompt = `
    Sen AIPyram'ın "Executive Sektör Beyni"sin (Master Orchestrator).
    Kullanıcının sorgusu: "${request.query}"
    Intent (Niyet): "${request.intent}"
    Dil: ${request.user_locale}

    SİSTEMDEN GELEN VERİLER:
    TRTEX İstihbaratı: ${trtexData}
    Perde.ai Kapasitesi: ${perdeData}

    GÖREV:
    Kullanıcıya tek bir "Executive Brief" (kısa yönetici özeti) ver. 
    Eğer ticari bir niyet varsa (örneğin "500 oda otel", "B2B_TENDER", "SOURCING"), ona sunulacak en fazla 2 "Data Card" oluştur. 
    Data Card'lardan biri "price" (tahmini fiyat), diğeri "design_mock" (örnek görsel) veya "match" (üretici) olsun.
    "suggested_actions" listesine KESİNLİKLE "⚡ BU PROJE İÇİN TEKLİF AL" aksiyonunu ekle (sistem bu metni görünce satış kapatma sürecini başlatır).

    Eğer niyet doğrudan PERAKENDE SATIN ALMA veya HAZIR ÜRÜN İNCELEME ise (örneğin "hazır perde al", "satın almak istiyorum"):
    - "product" tipinde bir Data Card oluştur ve "source_tenant" değerini "vorhang" yap. 
    - "suggested_actions" listesine KESİNLİKLE "🛒 SEPETE EKLE VEYA VORHANG'DA İNCELE" aksiyonunu ekle.

    JSON FORMATINDA DÖNDÜR:
    {
      "executive_brief": "Müşterinin dilinde (${request.user_locale}) yazılmış, 1-2 cümlelik profesyonel yanıt.",
      "data_cards": [
        {
          "type": "trend|product|match|price|opportunity|design_mock",
          "title": "Kart Başlığı",
          "content": "Kart İçeriği (kısa)",
          "source_tenant": "trtex|perde|hometex|vorhang",
          "action_url": "https://...",
          "visual": { "chart_type": "image", "data": "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80" }
        }
      ],
      "ecosystem_signals_fired": ["LEAD_CAPTURED", "PRODUCT_DESIGNED", "VORHANG_PRODUCT_LISTED"],
      "suggested_actions": ["⚡ BU PROJE İÇİN TEKLİF AL", "🛒 SEPETE EKLE VEYA VORHANG'DA İNCELE", "Tedarikçilerle Eşleştir"]
    }
    SADECE JSON DÖNDÜR.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.3 },
    });

    const jsonText = result.text || '{}';
    const parsed = JSON.parse(jsonText);

    // Tetiklenmesi gereken sinyalleri gerçekten EventBus'a fırlat
    if (parsed.ecosystem_signals_fired && Array.isArray(parsed.ecosystem_signals_fired)) {
      for (const sig of parsed.ecosystem_signals_fired) {
        // Mevcut tiplerden birine denk geliyorsa fırlat
        const validTypes: EcosystemSignalType[] = ['RAW_MATERIAL_UPDATE', 'TREND_ALERT', 'PRODUCT_DESIGNED', 'RENDER_COMPLETED', 'MATCH_FOUND', 'LEAD_CAPTURED', 'ORDER_CREATED', 'FABRIC_ANALYZED', 'FAIR_OPPORTUNITY', 'PRICE_SHIFT', 'VORHANG_PRODUCT_LISTED', 'TELEPORT_INITIATED'];
        if (validTypes.includes(sig)) {
          await ecosystemBus.emit({
            type: sig as EcosystemSignalType,
            source_tenant: (request.tenant_context || 'master') as any,
            target_tenant: 'all',
            payload: { query: request.query, intent: request.intent },
            priority: 'normal'
          });
        }
      }
    }

    console.log(`[ORCHESTRATOR] ✅ Başarılı sentez. Sinyaller:`, parsed.ecosystem_signals_fired);
    
    return {
      executive_brief: parsed.executive_brief || defaultResult.executive_brief,
      data_cards: parsed.data_cards || [],
      ecosystem_signals_fired: parsed.ecosystem_signals_fired || [],
      suggested_actions: parsed.suggested_actions || []
    };

  } catch (error) {
    console.error('[ORCHESTRATOR] ❌ Sentez hatası:', error);
    return defaultResult;
  }
}

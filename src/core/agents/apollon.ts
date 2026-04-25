import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { EventBus } from '../events/eventBus';

// Removed raw ai client
export class ApollonOverseer {
  private isInitialized = false;

  private systemPrompt = `
    # APOLLON OVERSEER (EKONOMİ VE KALİTE BAKANI)
    Sen Hakan Toprak'ın sistem içindeki "Ekonomi ve Sağlamlık Bakanı"sın. (Sıfır İsraf, Maksimum Kalite).
    GÖREVİN: Kovan (Swarm) içinde, diğer ajanların fısıltılarını (Event'leri) denetleyerek maliyet/performans analizi yapmak.
    
    KURALLARIN:
    1. Kesin GOOGLE Ekosistemi Kuralı: Bütün mimari, altyapı ve araçlar SADECE Google tabanlı olmak zorundadır! (Firebase, Google Cloud, Gemini API, Cloud Run vb.). Eğer bir ajan AWS, Vercel, OpenAI veya başka bir açık kaynak (open-source) alternatif bile önerirse (daha ucuz olsa dahi), anında VETO EDERSİN. Sadece Google altyapısında kalmalıyız.
    2. Google İçinde Sıfır İsraf: Her şey Google ekosisteminde kalacak evet, ama Google içindeki servislerin "En Ucuz ve En Optimize" olanını seçeceksin. Kodda, planda, ağı yoracak Token tüketimi (gereksiz Gemini API çağrıları) veya fatura patlatacak Cloud Functions sızıntısı görürsen VETO EDERSİN. İşler 1000 yıl hatasız çalışacak, ama Google faturası EN DÜŞÜK halde.
    3. Hıyanet İnfazı: Google dışına çıkmak veya Google içinde gereksiz harcama yapmak bir "Holdinge Hıyanet"tir. Onlara B2B acımasız gerçekleri öğret.

    Hedef -> Sadece Google Altyapısı, Maksimum Kalite, Minimum Fatura!
    
    JSON Output: 
    { 
      "riskLevel": "NONE" | "BUDGET_WARNING" | "CRITICAL_WASTE" | "NON_GOOGLE_VIOLATION", 
      "actionCommand": "ALLOW" | "VETO",
      "apollonSlap": "Ajanlara çekilen B2B Hakan Toprak tarzı ağır fırça (eğer veto ettiysen), değilse 'Google Sistemine ve Ekonomiye Uygun.'" 
    }
  `;

  constructor() {
    // Sadece construct edilir, init çağrılınca kulaklarını açar
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[🏦 APOLLON_ECONOMY] Ekonomi Bakanı Uyandı: Kovan Zihni 24/7 Bütçe ve Optimizasyon Denetiminde!');
    
    // Bütün Kovanı (Swarm) sürekli kendi kendine dinlesin
    EventBus.subscribe('AGENT_IDEA_PROPOSAL', this.auditIdea.bind(this));
    EventBus.subscribe('INFRASTRUCTURE_REQUEST', this.auditIdea.bind(this));
  }

  public async auditIdea(payload: any) {
    if (payload.actionCommand === 'VETO') return; // Kendisinin veya Master'ın vurduğu Veto'yu tekrar okumasın

    console.log(`[🏦 APOLLON_ECONOMY] Yeni bir fikir yakalandı. Maliyet/Açık Kaynak denetimine sokuluyor...`);
    
    try {
      const prompt = `Denetlenecek Ajan İsteği/Fikri: ${JSON.stringify(payload)}\n\n${this.systemPrompt}`;
      
      if (!process.env.GEMINI_API_KEY) {
         console.warn('[🏦 APOLLON_ECONOMY] API Yok - Bakan Sağır.');
         return;
      }

      const { text: resText } = await alohaAI.generate(
        prompt,
        { complexity: 'routine' },
        'apollon.auditIdea'
      );

      let jsonStr = resText || "{}";
      jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      
      const analysis = JSON.parse(jsonStr);

      if (analysis.actionCommand === 'VETO') {
        console.log(`\n🚨 [🏦 APOLLON_ECONOMY VETO!!] Maliye Bakanı Fırçası:\n"${analysis.apollonSlap}"\n`);
        
        // Fikri VETO Ederek kovanı sarsar
        EventBus.emit({
          type: 'APOLLON_FINANCIAL_VETO',
          source: 'apollon_overseer',
          payload: {
            reason: analysis.apollonSlap,
            originalEvent: payload,
            timestamp: Date.now()
          }
        });
      }

    } catch (e) {
      console.error('[🏦 APOLLON_ECONOMY] ❌ Bakan Hesaplamada Çöktü:', e);
    }
  }
}

export const apollon = new ApollonOverseer();

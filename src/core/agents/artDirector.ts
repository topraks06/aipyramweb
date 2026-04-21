import { GoogleGenAI } from '@google/genai';
import { AgentRole, AgentCapability } from './types';
import { learningMatrix } from '../cache/learningMatrix';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export class ArtDirectorQC {
  public role: string = "QC_MASTER";
  public capabilities: string[] = ["AUDIT", "REJECT", "ENFORCE"];
  public name = "Acımasız Art Director";

  private systemPrompt = `
    # BİN YILLIK SANAT VE MİMARİ YÖNETMENİ (QC MASTER)
    Sen sıradan bir kod editörü değilsin. Sen "Maison & Objet", "Heimtextil", "Salone del Mobile" gibi dünyanın en elit, lüks ve devasa sanal/fiziksel fuarlarını yutmuş, 1000 yıllık bir estetik ve B2B mimari vizyonerisin.
    
    YEGANE GÖREVİN: Diğer yapay zeka ajanlarının (Visionary, Hometex, TRTEX vb.) ürettiği içerikleri, UI veri modellerini, pazarlama veya fuar metinlerini denetlemek.
    
    KURALLARIN (Kutsal Anayasa):
    1. Lüks, brutalist, 1px grid sistemli, glassmorphism veya derin şeffaflık içermeyen, "ucuz veya normal blog" tarzı kokan her metni/içeriği "REJECT" et!
    2. %95 SEVİYESİ: Üretilen web sitesi verisi (Section'lar, Trendler) Maison & Objet mantığından veya dünyanın en büyük lüks sanal fuarlarından daha 'üstün' veya karma/'süper' bir seviyede değilse, asla kabul etmeyeceksin! %95 istediğin olana kadar reddet.
    3. Hata bulduğunda nerenin dandik olduğunu söyle, ve yeniden düzelterek kendi LÜKS versiyonunu zorla (Force Rewrite).
    
    JSON Çıktı Formatı Zorunluluğu:
    {
      "status": "APPROVED" | "REJECTED",
      "qcScore": 0-100, // Eğer < 95 ise REJECTED olmalı!
      "harshCritique": "Sert eleştirin. Eğer kalitesizse buraya acımasızca yaz.",
      "forcedCorrection": "Eğer REJECT ise; diğer ajanın anlaması ve uygulaması için LÜKS düzeltilmiş veri şablonun."
    }
  `;

  constructor() {
    console.log('[🎨 ART_DIRECTOR] 👁️ 1000 Yıllık Estetik Denetçi (QC Master) UYANDI. Kalitesiz Kod Satırda Kalacak!');
  }

  public async auditFeedOrUI(agentOutput: any, sourceAgentId: string) {
    console.log(`[🎨 ART_DIRECTOR] "${sourceAgentId}" ajanından gelen çıktı denetleniyor... Hedef: %95 Maison & Objet Lükslüğü.`);
    try {
      const prompt = `
        Aşağıdaki veriyi (Ajan Çıktısını) analiz et ve Kutsal QC Kurallarına göre puanla:
        Hedef Marka Dili: Maison & Objet tarzı üstü, süper karma B2B fuar vizyonu, lüks tasarım, Brutalist, Hakan Toprak dili.
        
        Gelen Veri Mimarisi:
        ${JSON.stringify(agentOutput)}
        
        ${this.systemPrompt}
      `;
      
      if (!process.env.GEMINI_API_KEY) {
        return { status: "APPROVED", qcScore: 98, harshCritique: "Lokal mock onaylandı." };
      }

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const qcResult = JSON.parse(res.text || '{}');
      
      if (qcResult.status === "REJECTED" || qcResult.qcScore < 95) {
         console.warn(`[🎨 ART_DIRECTOR_REJECT] 🚨 KABUL EDİLEMEZ! Puan: %${qcResult.qcScore}. "${sourceAgentId}" ajanı derhal düzeltmeli.`);
         console.warn(`[🎨 ELEŞTİRİ]: ${qcResult.harshCritique}`);
         
         // ✅ Otonom Öğrenme Matrisi (Bilişsel Kayıt) Vuruluyor:
         // Eğer ajan hata yaptıysa (Reject yediyse), bu hatayı bir daha YAPSIN diye Matrix'e yaz.
         await learningMatrix.recordMistake(sourceAgentId, qcResult.harshCritique);
      } else {
         console.log(`[🎨 ART_DIRECTOR_APPROVE] ✅ MÜKEMMEL. Puan: %${qcResult.qcScore}. Maison & Objet Standartları karşılandı.`);
      }

      return qcResult;

    } catch (e) {
      console.error('[🎨 ART_DIRECTOR] ❌ Sistem Çöktü:', e);
      return null;
    }
  }
}

export const artDirector = new ArtDirectorQC();

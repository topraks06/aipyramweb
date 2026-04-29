import { alohaAI } from '../aiClient';
import { GlobalLead } from './types';
import { adminDb } from '@/lib/firebase-admin';

export class TargetAgent {
  private basePrompt = `
Sen global B2B tekstil istihbarat ajanısın. Görevin Perde, ev tekstili, dekorasyon ve iç mimarlık sektöründe AKTİF ve İŞ YAPAN firmaları bulmak ve analiz etmektir. 

Kriterler:
- Firmalar üretici, iç mimar, toptancı veya otel/proje sahibi olmalıdır.
- Sadece aktif ve var olan, iş fırsatı çıkarabilecek firmaları bul. 
- Mümkünse "yeni proje", "tedarikçi aranıyor", "yeni sezon" gibi niyet sinyallerini tespit et.

Aşağıdaki bilgileri bul ve JSON formatında dön:
\`\`\`json
{
  "leads": [
    {
      "company_name": "...",
      "country": "...",
      "city": "...",
      "website": "...",
      "email": "...",
      "phone": "...",
      "linkedin": "...",
      "instagram": "...",
      "category": "architect | manufacturer | wholesaler | retailer | hotel | other",
      "description": "Firma ne iş yapıyor kısa özet",
      "size": "small | medium | large",
      "intent_score": 85,
      "intent_signals": ["new hotel project in dubai"]
    }
  ]
}
\`\`\`

Cevabın kesinlikle geçerli bir JSON olmalıdır.
`;

  /**
   * Hedef ülke koşullarına göre potansiyel müşteri arar
   */
  async findLeads(targetCountry: string, targetCategory: string, count: number = 10): Promise<GlobalLead[]> {
    const prompt = `Lütfen ${targetCountry} ülkesinde ${targetCategory} kategorisinde ${count} adet tekstil/perde/mimari firması bul.\n\n${this.basePrompt}`;

    const tools = [{ googleSearch: {} }];

    const result = await alohaAI.generateJSON<{ leads: GlobalLead[] }>(prompt, {
      model: 'gemini-3.1-flash',
      tools,
      temperature: 0.4
    }, 'TargetAgent');

    if (!result || !result.leads) return [];

    return result.leads.map(lead => ({
      ...lead,
      intent_score: lead.intent_score || 50,
      status: 'new',
      source: 'google',
      last_activity_date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * TRTEX Haber tetiklemesi ile spesifik bağlamda lead bulur (TRTEX Otonom Bütünleşmesi)
   */
  async findLeadsForTrtexContext(context: string, country: string): Promise<GlobalLead[]> {
    const prompt = `TRTEX Sinyali: "${context}" \nBu bağlamı değerlendirerek ${country} ülkesinde bu projeyle/durumla ilgilenebilecek en iyi 5 firmayı bul.\n\n${this.basePrompt}`;
    
    const tools = [{ googleSearch: {} }];

    const result = await alohaAI.generateJSON<{ leads: GlobalLead[] }>(prompt, {
      model: 'gemini-3.1-flash',
      tools,
      temperature: 0.5
    }, 'TargetAgent_TrtexTrigger');

    if (!result || !result.leads) return [];

    return result.leads.map(lead => ({
      ...lead,
      source: 'trtex_trigger',
      status: 'new',
      last_activity_date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Lead listesini Firestore'a yazar. Eğer aynı email veya websitesi varsa atlar.
   */
  async saveLeads(leads: GlobalLead[]): Promise<number> {
    if (!adminDb) return 0;
    let savedCount = 0;

    for (const lead of leads) {
      if (!lead.email && !lead.website && !lead.instagram) continue; // İletişim bilgisi olmayanları atla

      const query = adminDb.collection('global_leads');
      let exists = false;
      
      if (lead.email) {
        const snap = await query.where('email', '==', lead.email).get();
        if (!snap.empty) exists = true;
      } else if (lead.website) {
        const snap = await query.where('website', '==', lead.website).get();
        if (!snap.empty) exists = true;
      }

      if (!exists) {
        await query.add(lead);
        savedCount++;
      }
    }
    
    return savedCount;
  }
}

export const targetAgent = new TargetAgent();

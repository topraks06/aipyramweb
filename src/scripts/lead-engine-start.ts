// Yürütme Komutu: npx ts-node src/scripts/lead-engine-start.ts
import { targetAgent } from '../core/aloha/lead-engine/targetAgent';
import { outreachAgent } from '../core/aloha/lead-engine/outreachAgent';
import { adminDb } from '../lib/firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

const TARGET_PLAN = [
  { country: 'Almanya', count: 5 },
  { country: 'Birleşik Arap Emirlikleri (Dubai ağırlıklı)', count: 5 },
  { country: 'İtalya', count: 5 },
  { country: 'Amerika Birleşik Devletleri', count: 5 },
  { country: 'İngiltere', count: 5 }
];

const TARGET_CATEGORIES = ['İç Mimarlık Ofisleri veya Otel Proje Geliştiricileri', 'Perde ve Döşemelik Kumaş Toptancıları'];

async function runLeadEngineStart() {
  console.log(`[LEAD ENGINE] 🚀 Sistem başlatılıyor... ${TARGET_PLAN.length} ülke hedefte.`);
  
  for (const plan of TARGET_PLAN) {
    for (const category of TARGET_CATEGORIES) {
      console.log(`[TARGET] 🔍 Aranan: ${plan.country} - Kategori: ${category} (${plan.count / TARGET_CATEGORIES.length} hedef)`);
      
      try {
        // Maliyeti düşük tutmak için count parametresi minimal tutuldu (örneğin 3 veya 5 adet):
        const leads = await targetAgent.findLeads(plan.country, category, 5);
        
        if (leads.length > 0) {
          console.log(`[TARGET] ✅ ${leads.length} firma bulundu. (Örn: "${leads[0].company_name}")`);
          const savedCount = await targetAgent.saveLeads(leads);
          console.log(`[TARGET] 📥 Veritabanına yeni kaydedilen: ${savedCount}\n`);

          // Test Outreachi: ilk bulduğuna iletişim metni hazırla
          const testLead = leads[0];
          console.log(`[OUTREACH] 📝 Test mesajı hazırlanıyor -> ${testLead.company_name} (Sinyal: ${(testLead.intent_signals || []).join()})`);
          
          const message = await outreachAgent.generateOutreachMessage(testLead, 'email');
          console.log(`\n===========================================`);
          console.log(`[ÖNERİLEN E-POSTA / DM]`);
          console.log(`${message}`);
          console.log(`===========================================\n`);
          
        } else {
          console.log(`[TARGET] ⚠️ ${plan.country} için ${category} bulunamadı.\n`);
        }
      } catch (err: any) {
        console.error(`[TARGET] 🔴 Hata oluştu (${plan.country}): ${err.message}`);
      }
      
      // Ekonomiyi korumak için Google API ve DB okuma/yazma kotalarına ani yüklenmemek adına 30 sn yavaşlatma
      console.log(`[PİL YÖNETİMİ] Yüklenmeyi dağıtmak için 30 saniye bekleniyor...`);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    // Her ülke arası 1 dakika bekle (API limitleri ve bütçe güvenliği)
    console.log(`[PİL YÖNETİMİ] Sonraki ülkeye geçmeden önce 60 saniye bekleniyor...`);
    await new Promise(resolve => setTimeout(resolve, 60000));
  }

  console.log(`[LEAD ENGINE] 🎉 İlk yavaş hedefler başarıyla tamamlandı. Maliyetler gözetilerek işlem bitti.`);
}

runLeadEngineStart().catch(console.error);

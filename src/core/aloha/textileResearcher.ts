import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA TEXTILE RESEARCHER — Otonom Sektörel Araştırma Motoru
 * 
 * Haftada 1 çalışır. Gemini Search Grounding ile gerçek dünyadan
 * güncel tekstil bilgisi toplar ve bilgi bankasına yazar.
 * 
 * Kalite kapısı: score > 70 olan veriler kaydedilir.
 * Günlük search limiti: autoRunner'daki 20/gün kuralına dahil.
 */

const RESEARCH_TOPICS = [
  // Hammadde & Kumaş
  { id: 'cotton_market', query: 'global cotton market 2026 price forecast supply demand Turkey textile', category: 'hammadde' },
  { id: 'polyester_market', query: 'polyester fiber price trend 2026 PTA MEG production capacity', category: 'hammadde' },
  { id: 'linen_viscose', query: 'linen viscose bamboo fabric market trend 2026 home textile', category: 'hammadde' },
  
  // Perde & Ev Tekstili
  { id: 'curtain_global', query: 'global curtain market size 2026 blackout sheer motorized smart curtain trend', category: 'perde' },
  { id: 'home_textile_export', query: 'Turkey home textile export 2026 statistics top markets towel bedding curtain', category: 'ihracat' },
  { id: 'hotel_textile', query: 'hotel textile procurement 2026 hospitality linen towel curtain bulk supplier', category: 'b2b' },
  
  // Rakip Ülkeler
  { id: 'india_textile', query: 'India textile export 2026 competition Turkey home textile market share', category: 'rekabet' },
  { id: 'pakistan_textile', query: 'Pakistan towel bedding export 2026 vs Turkey price quality', category: 'rekabet' },
  { id: 'china_textile', query: 'China home textile production 2026 capacity fabric price shipping cost', category: 'rekabet' },
  
  // Lojistik & Ticaret
  { id: 'freight_logistics', query: 'container shipping rates 2026 SCFI Mediterranean Turkey export logistics', category: 'lojistik' },
  { id: 'trade_terms', query: 'international trade terms FOB CIF EXW DDP textile wholesale 2026', category: 'ticaret' },
  
  // Sertifikasyon
  { id: 'certifications', query: 'OEKO-TEX GOTS GRS certification textile 2026 cost requirements process', category: 'sertifika' },
  
  // Fuarlar
  { id: 'fairs_2026', query: 'Heimtextil Evteks Proposte Intertextile 2026 2027 dates home textile fair', category: 'fuar' },
  
  // Alıcı Profilleri
  { id: 'german_buyers', query: 'Germany home textile import 2026 buyer profile hotel retail interior designer', category: 'pazar' },
  { id: 'gulf_buyers', query: 'Saudi Arabia UAE home textile import 2026 hotel project curtain supplier', category: 'pazar' },
  { id: 'usa_buyers', query: 'USA home textile market 2026 curtain drapes import supplier Turkey', category: 'pazar' },
];

export async function runDeepResearch(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';

  console.log('[TEXTILE RESEARCHER] 🔬 Haftalık derin araştırma başlatılıyor...');
  
  const results: string[] = [];
  let savedCount = 0;
  let skippedCount = 0;

  // Son araştırma tarihini kontrol et
  try {
    const lastResearch = await adminDb.collection('system_state').doc('textile_research').get();
    if (lastResearch.exists) {
      const lastDate = lastResearch.data()?.last_run;
      if (lastDate) {
        const daysSince = (Date.now() - new Date(lastDate).getTime()) / (24 * 3600 * 1000);
        if (daysSince < 6) {
          return `[TEXTILE RESEARCHER] Son araştırma ${Math.floor(daysSince)} gün önce yapıldı. Haftada 1 kez çalışır.`;
        }
      }
    }
  } catch { /* state okunamazsa devam */ }

  try {
    const { alohaAI } = await import('./aiClient');
    const ai = alohaAI.getClient();

    for (const topic of RESEARCH_TOPICS) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Sen bir B2B ev tekstili/perde sektörü uzmanısın. Aşağıdaki konuda GÜNCEL ve DERİN bir araştırma yap:

"${topic.query}"

JSON formatında döndür:
{
  "title": "Araştırma başlığı (Türkçe)",
  "summary": "3-4 cümle özet",
  "key_data": ["Kritik veri 1 (rakamlarla)", "Kritik veri 2", "Kritik veri 3"],
  "market_size": "Pazar büyüklüğü (varsa)",
  "turkey_relevance": "Türk tekstil sektörü için önemi ve fırsatı",
  "trends": ["Trend 1", "Trend 2"],
  "risks": ["Risk 1"],
  "opportunities": ["Fırsat 1", "Fırsat 2"],
  "sources": ["Kaynak 1", "Kaynak 2"],
  "quality_score": 0-100,
  "actionable_insight": "Tek cümlelik aksiyon önerisi"
}`,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.2,
            responseMimeType: 'application/json',
          }
        });

        const text = response.text || '';
        const data = JSON.parse(text);

        // Kalite kapısı: score > 70
        if (data.quality_score && data.quality_score >= 70) {
          await adminDb.collection('trtex_knowledge_base').doc(topic.id).set({
            ...data,
            topic_id: topic.id,
            category: topic.category,
            query: topic.query,
            researched_at: new Date().toISOString(),
            researched_by: 'aloha_textile_researcher',
          }, { merge: true });
          
          savedCount++;
          results.push(`✅ ${topic.id}: ${data.title} (skor: ${data.quality_score})`);
        } else {
          skippedCount++;
          results.push(`⚠️ ${topic.id}: Kalite düşük (skor: ${data.quality_score || 0}) — atlandı`);
        }
      } catch (topicErr: any) {
        results.push(`❌ ${topic.id}: ${topicErr.message}`);
      }
    }

    // Araştırma tarihini kaydet
    await adminDb.collection('system_state').doc('textile_research').set({
      last_run: new Date().toISOString(),
      topics_researched: RESEARCH_TOPICS.length,
      saved: savedCount,
      skipped: skippedCount,
    });

  } catch (err: any) {
    return `[TEXTILE RESEARCHER] Kritik hata: ${err.message}`;
  }

  const summary = `[TEXTILE RESEARCHER] ✅ Tamamlandı: ${savedCount} kayıt, ${skippedCount} atlandı\n${results.join('\n')}`;
  console.log(summary);
  return summary;
}

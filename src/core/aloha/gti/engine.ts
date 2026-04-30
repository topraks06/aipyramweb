import Parser from 'rss-parser';
import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';
import sourcesData from './sources.json';
import { Schema, Type } from '@google/genai';
import { FinanceMinister } from '@/core/aloha/financeMinister';

const parser = new Parser({
    timeout: 10000, // 10 seconds timeout
});

export interface GTIArticle {
    title: string;
    content_summary: string;
    region: string;
    source_url: string;
    impact_score?: number;
    timestamp?: string;
}

/**
 * KATMAN 1: COLLECTOR (Toplayıcı)
 * sources.json içindeki tüm RSS feed'lerini tarar ve ham başlık/özetleri toplar.
 */
async function collectRawData() {
    console.log("🌐 [GTI COLLECTOR] RSS beslemeleri taranıyor...");
    const rawItems: any[] = [];
    
    const fetchPromises = sourcesData.gti_sources.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            feed.items.forEach(item => {
                // Son 3 günün haberlerini al (basit filtre)
                const pubDate = new Date(item.pubDate || new Date());
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                
                if (pubDate >= threeDaysAgo) {
                    rawItems.push({
                        title: item.title,
                        summary: item.contentSnippet || item.content || '',
                        url: item.link,
                        source: source.name,
                        region: source.region,
                        pubDate: item.pubDate
                    });
                }
            });
            console.log(`  ✅ ${source.name} (${source.region}): ${feed.items.length} haber bulundu.`);
        } catch (error: any) {
            console.error(`  ❌ ${source.name} okunamadı: ${error.message}`);
        }
    });

    await Promise.allSettled(fetchPromises);
    console.log(`🌐 [GTI COLLECTOR] Toplam ${rawItems.length} ham başlık toplandı.`);
    
    // 🟡 3. Sessiz Veri Havuzu (gti_raw_pool)
    if (adminDb && rawItems.length > 0) {
        try {
            console.log(`💾 [GTI COLLECTOR] ${rawItems.length} ham veri 'gti_raw_pool' havuzuna kaydediliyor...`);
            const batch = adminDb.batch();
            rawItems.forEach(item => {
                const docRef = adminDb.collection('gti_raw_pool').doc();
                batch.set(docRef, { ...item, collectedAt: new Date().toISOString() });
            });
            await batch.commit();
        } catch (err: any) {
            console.warn(`⚠️ [GTI COLLECTOR] Ham veri kaydı başarısız: ${err.message}`);
        }
    }
    
    return rawItems;
}

/**
 * KATMAN 2: FILTER & SCORE (Flash-Lite Süzgeci)
 * 🔴 1. Katman 2 Mini Skor Sistemi
 * Ucuz Flash-Lite modelini kullanarak haberleri 0-100 arası skorlar.
 */
async function filterWithFlashLite(rawItems: any[]) {
    if (rawItems.length === 0) return [];
    
    console.log(`⚡ [GTI FILTER] ${rawItems.length} haber Gemini 3.1 Flash-Lite süzgecinden geçiriliyor...`);
    
    // Batch processing to save money. Send 20 items at a time.
    const CHUNK_SIZE = 20;
    const filteredItems: any[] = [];
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            scoredItems: {
                type: Type.ARRAY,
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        index: { type: Type.INTEGER },
                        score: { type: Type.INTEGER, description: "0-100 ticari skor" },
                        reason: { type: Type.STRING }
                    },
                    required: ["index", "score"]
                }
            }
        },
        required: ["scoredItems"]
    };

    for (let i = 0; i < rawItems.length; i += CHUNK_SIZE) {
        const chunk = rawItems.slice(i, i + CHUNK_SIZE);
        const promptText = chunk.map((item, idx) => `[ID: ${idx}] BÖLGE: ${item.region}\nBaşlık: ${item.title}\nÖzet: ${item.summary?.substring(0, 150)}...`).join("\n\n");
        
        try {
            const result = await alohaAI.generateJSON(
                `Aşağıdaki haber listesini incele ve her birine 0 ile 100 arası ticari skor ver.\n\nKRİTERLER:\n- Talep sinyali (trend, yatırım)\n- Coğrafya (Afrika, Türki Cumhuriyetler, Güney Amerika değerlidir)\n- Ürün uyumu (SADECE Ev Tekstili, Perde, Döşemelik, Akıllı Sistemler)\n- Moda ve Trend Sinyali (Ev modası, WGSN/Pantone renk kodları, yeni doku ve sürdürülebilir kumaş inovasyonları çok değerlidir)\n- Ticari Fırsat (ithalat, fabrika, teşvik)\n\nKIRMIZI ÇİZGİ: İçinde "Hazır Giyim, Ayakkabı, Çanta, Defile Magazini, Tişört" geçen B2C kıyafet/apparel haberlerine direkt 0 puan ver.\n(Ancak, giyimde doğup ev tekstiline uyarlanabilecek 'Kumaş ve Renk İnovasyonu' haberleri geçerlidir).\n\nSadece 50 puan ve üzeri alanların ID'lerini ve skorlarını döndür.\n\n${promptText}`,
                {
                    systemInstruction: "Sen ucuz ve hızlı bir ticari skorlama (0-100) süzgecisin. Amacın B2B ticari değeri olanları, ev modası ve renk trendlerini puanlamak, sadece 'hazır giyim/kıyafet' çöpünü elemek.",
                    responseSchema: schema,
                    complexity: 'routine',
                    temperature: 0.1
                },
                'gti.score'
            );
            
            if (result && result.scoredItems) {
                result.scoredItems.forEach((scored: any) => {
                    if (chunk[scored.index]) {
                        filteredItems.push({
                            ...chunk[scored.index],
                            gti_score: scored.score
                        });
                    }
                });
            }
        } catch (error: any) {
            console.error(`⚡ [GTI FILTER] Chunk ${i} başarısız: ${error.message}`);
        }
    }
    
    // Skora göre sırala ve en yüksek olanları al
    filteredItems.sort((a, b) => b.gti_score - a.gti_score);
    return filteredItems;
}

export interface GTIActionableArticle {
    title: string;
    content_summary: string;
    action_how_to_profit: string;
    action_target_country: string;
    action_risk_factor: string;
    region: string;
    source_url: string;
    impact_score: number;
    timestamp?: string;
}

/**
 * KATMAN 3: ANALYST (Gemini 3.1 Pro)
 * 🟠 2. Katman 3 Çıktısını “Aksiyon” Odaklı Yap.
 * Haber değil, B2B iş fırsatı analizi.
 */
async function analyzeWithPro(filteredItems: any[]): Promise<GTIActionableArticle[]> {
    if (filteredItems.length === 0) return [];
    
    // Sadece en yüksek skorlu ilk 3'ü seç (daha az ama çok kaliteli)
    const topItems = filteredItems.slice(0, 3);
    console.log(`🧠 [GTI ANALYST] En yüksek skorlu ${topItems.length} haber Gemini 3.1 Pro ile aksiyon analizine giriyor...`);
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Çarpıcı ve tıklanabilir Türkçe başlık" },
                content_summary: { type: Type.STRING, description: "Olayın B2B özeti (Ne oldu?)" },
                action_how_to_profit: { type: Type.STRING, description: "Bu haberden toptancı/üretici nasıl para kazanır? (Net ticaret stratejisi)" },
                action_target_country: { type: Type.STRING, description: "Hangi ülkeye odaklanmalı?" },
                action_risk_factor: { type: Type.STRING, description: "Risk nedir? (örn: Navlun pahalı, yerel rekabet yüksek)" },
                region: { type: Type.STRING },
                source_url: { type: Type.STRING },
                impact_score: { type: Type.INTEGER }
            },
            required: ["title", "content_summary", "action_how_to_profit", "action_target_country", "action_risk_factor", "region", "source_url", "impact_score"]
        }
    };

    const promptText = topItems.map((item, idx) => `[SKOR: ${item.gti_score} - BÖLGE: ${item.region}]\nURL: ${item.url}\nBaşlık: ${item.title}\nÖzet: ${item.summary}`).join("\n\n---\n\n");

    try {
        const result = await alohaAI.generateJSON(
            `Aşağıdaki yüksek skorlu B2B ve Trend haberlerinden toptancılar/üreticiler için 'Ticari Mini İş Fırsatı Analizi' çıkar.\nSıradan haber yazma, bunu bir PARA KAZANMA ve VİZYON REHBERİNE dönüştür. Eğer haber bir trend veya renk inovasyonu ise, 'Bunu döşemelik veya perdede nasıl kullanırsınız?' şeklinde akıl ver.\n\nVeriler:\n${promptText}`,
            {
                systemInstruction: "Sen Sovereign AI Analistisin. Sıradan haber değil, MİNİ İŞ FIRSATI ve TREND ANALİZİ yazarsın. Toptancılara net direktifler ver: Nereye satmalı, Hangi renk/dokuya yatırım yapmalı, Neye dikkat etmeli?",
                responseSchema: schema,
                complexity: 'complex',
                temperature: 0.5
            },
            'gti.analyst'
        );
        
        return result || [];
    } catch (error: any) {
        console.error(`🧠 [GTI ANALYST] Pro Model Başarısız: ${error.message}`);
        return [];
    }
}

/**
 * ANA MOTOR (3 KATMANLI HUNİ)
 */
export async function runGTIEngine() {
    const startTime = Date.now();
    
    // Bütçe ve Kotaları Kontrol Et
    const quotas = await FinanceMinister.getDailyQuotas();
    if (quotas.mode === 'LOCKED') {
        console.warn(`🛑 [GTI] SİSTEM KİLİTLİ. Aylık $100 limiti aşıldı. Motor durduruldu.`);
        return [];
    }
    
    if (quotas.currentNews >= quotas.maxNews) {
        console.warn(`⚠️ [GTI] Günlük Haber Kotası (${quotas.currentNews}/${quotas.maxNews}) doldu. Haber üretilmeyecek.`);
        return [];
    }

    // 1. COLLECTOR
    const rawItems = await collectRawData();
    
    // 2. FILTER
    const filteredItems = await filterWithFlashLite(rawItems);
    
    let finalArticles: GTIActionableArticle[] = [];
    
    // 3. ANALYST (Bütçe kontrolü)
    const availableSlots = quotas.maxNews - quotas.currentNews;
    const itemsToProcess = filteredItems.slice(0, availableSlots);

    if (!quotas.useProModel) {
        console.warn(`⚠️ [GTI] EKONOMİK MOD DEVREDE! Sadece Flash-Lite analizleri yayınlanacak.`);
        // Flash-lite ile basit fallback
        finalArticles = itemsToProcess.map(item => ({
            title: item.title,
            content_summary: item.summary || "Bütçe koruma modu devrede.",
            action_how_to_profit: "Hızlı ticaret fırsatı: Bölgesel talep artışı.",
            action_target_country: item.region,
            action_risk_factor: "Piyasa analizi beklemede.",
            region: item.region,
            source_url: item.url,
            impact_score: item.gti_score || 50
        }));
    } else {
        finalArticles = await analyzeWithPro(itemsToProcess);
    }
    
    // KAYIT (Firestore)
    if (adminDb && finalArticles.length > 0) {
        console.log(`💾 [GTI] ${finalArticles.length} haber Firestore'a yazılıyor...`);
        const batch = adminDb.batch();
        const collectionRef = adminDb.collection('global_news');
        
        finalArticles.forEach(article => {
            const docRef = collectionRef.doc();
            batch.set(docRef, {
                ...article,
                timestamp: new Date().toISOString()
            });
        });
        
        await batch.commit();
    }
    
    console.log(`✅ [GTI ENGINE] İşlem tamamlandı. Süre: ${((Date.now() - startTime) / 1000).toFixed(1)}sn`);
    return finalArticles;
}

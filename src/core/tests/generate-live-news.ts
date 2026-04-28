import { Schema, Type } from "@google/genai";
import { executeMasterAgent, MasterSystemState } from "../aloha/master-agent.js";
import * as fs from 'fs';
import * as path from 'path';

function slugify(text: string): string {
    return (text || "news").toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

async function generateLiveNews() {
    console.log("==================================================");
    console.log("📰 [NEWS-GUARD] ACİL HABER ÜRETİMİ BAŞLADI...");
    console.log("==================================================");

    const dummyState: MasterSystemState = {
        last_news_time: Date.now() - (10 * 60 * 60 * 1000), 
        topics_used: [],
        last_market_update: Date.now(),
        todays_news_count: 0
    };

    try {
        // 1. Haberi Zekaya Yazdır (7 Dilde)
        const response = await executeMasterAgent(dummyState, "URGENT FLASH NEWS: Heimtextil 2026'da Akıllı Perdeler ve Türk Tekstilinin Yükselişi konulu sıcağı sıcağına çok çarpıcı yeni bir haber geç. Bugünün haberi olsun.");
        
        const data = response.payload;
        console.log(`✅ Haber Yazıldı: ${data.translations.TR.title}`);

        // 2. TRTEX Schema Transformer (JSON Inşası)
        const dateStr = new Date().toISOString().split('T')[0];
        const slug = `${dateStr}_${slugify(data.translations.TR.title).substring(0, 40)}`;

        const trtexJson = {
            id: slug,
            title: data.translations.TR.title,
            slug: slug,
            summary: data.translations.TR.summary,
            content: data.translations.TR.content,
            category: data.category || "Gündem",
            tags: data.tags,
            status: "published",
            source: "aipyram News-Guard",
            published_at: new Date().toISOString(),
            translations: {
                en: data.translations.EN,
                de: data.translations.DE,
                fr: data.translations.FR,
                es: data.translations.ES,
                ru: data.translations.RU,
                ar: data.translations.AR
            }
        };

        // 3. Dosyaya Yaz (TRTEX Canlı published Dizini)
        const publishDir = path.resolve('C:/Users/MSI/Desktop/projeler zip/trtex.com/data/published');
        const filePath = path.join(publishDir, `${slug}.json`);

        fs.writeFileSync(filePath, JSON.stringify(trtexJson, null, 2), 'utf-8');
        console.log(`✅ Canlı Veritabanına Eklendi: ${filePath}`);

        console.log("==================================================");
        console.log("🔥 İŞLEM ONAYLANDI. YENİ HABER SİTEDE YAYINLANDI!");
        console.log("Lütfen `http://127.0.0.1:4000/news` sayfasını yenileyin.");
        console.log("==================================================");

    } catch (e: any) {
        console.error("❌ Hata:", e.message);
    }
}

generateLiveNews();

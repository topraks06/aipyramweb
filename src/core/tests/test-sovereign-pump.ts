import { saveToGoogleNativeMemory } from '../aloha/publishers/google-native-memory.js';

async function testSovereignPump() {
    console.log("==================================================");
    console.log("🚀 [aipyram SOVEREIGN PUMP] OTONOM VERİ TESTİ LOKAL (PULL) İÇİN BAŞLIYOR...");
    console.log("==================================================");

    try {
        const uniqueTS = Date.now().toString().substring(0, 5); 

        // 1. Site Brain Güncellemesi (Market verisi)
        console.log("\n⚡ [1/3] SITE BRAIN (Market) Sovereign Kasasına Mühürleniyor...");
        await saveToGoogleNativeMemory("site_brain", {
            type: "market",
            pamuk: "+2.4%",
            iplik: "-0.8%",
            polyester: "+1.1%",
            pazar_notu: "Bloomberg Terminal Asya pazarında dalgalanma öngörüyor.",
            last_scan: new Date().toISOString()
        });

        // 2. Ticaret Sinyali
        console.log("\n⚡ [2/3] SIGNAL Sovereign Kasasına Mühürleniyor...");
        await saveToGoogleNativeMemory("signals", {
            type: "opportunity", 
            title: `Mısır Menşeili İplik İhracat Teşviki Algılandı [${uniqueTS}]`, 
            score: 85, 
            markets: ["EG", "TR", "EU"]
        });

        // 3. Haber ve Kısmi Çeviriler Otonom Yayın
        console.log("\n⚡ [3/3] NEWS Sovereign Kasasına Mühürleniyor...");
        const payload = {
            title: `Türkiye Ev Tekstili İhracatı 2026'da Zirveye Çıktı [${uniqueTS}]`,
            summary: "aipyram Analizi: Sektörel raporda büyük sıçrama gözlemlendi.",
            content: "Maison&Objet verilerine göre Asya pazarındaki tedarik kırılmaları Türkiye'yi Avrupa'nın ana tedarikçisi yaptı. Kendi hafızamızda doğrulandı.",
            image_url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
            source: "aipyram GLOBAL SCAN",
            category: "Global Textile",
            translations: {
                en: { title: `Turkey Home Textile Exports Peak [${uniqueTS}]`, summary: "Huge leap in sector report." },
                de: { title: `Türkische Heimtextilexporte auf dem Höhepunkt [${uniqueTS}]`, summary: "Riesiger Sprung im Branchenbericht." }
            }
        };

        await saveToGoogleNativeMemory("news", payload);

        console.log("\n==================================================");
        console.log("🔥 [aipyram SOVEREIGN PUMP] Otonom Veriler LOKALE KUSURSUZ AKTI (Sıfır Bulut Bağımlılığı)!");
        console.log("TRTEX'in PULL Mimarisine ping ulaştı. TRTEX Ana Sayfasını yenileyin ve Brutalist dizilimin canlandığını görün!");
        console.log("==================================================");
        
    } catch (e: any) {
        console.error("❌ KRİTİK HATA:", e.message);
    }
}

testSovereignPump();

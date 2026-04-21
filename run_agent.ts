import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: '.env.local' });

// Vertex AI için service account credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, 'firebase-sa-key.json');
}

// Doğrulama: GEMINI_API_KEY yüklendi mi?
if (!process.env.GEMINI_API_KEY) {
    console.error("🔴 GEMINI_API_KEY .env.local'da bulunamadı! ALOHA pipeline çalışamaz.");
    process.exit(1);
}
console.log(`[ENV] ✅ GEMINI_API_KEY yüklendi. Vertex AI SA: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅' : '⚠️'}`);

// ═══════════════════════════════════════════════════════
//  TRTEX WORKER v5.0 — TEK PIPELINE, SIFIR HALÜSİNASYON
//
//  ❌ ESKİ: signalCollector (Gemini halüsinasyonu) + iki format
//  ✅ YENİ: executeLiveNewsSwarm (tek gerçek motor) + tek format
//
//  ÇALIŞMA MODELİ:
//  - HTTP endpoint DEĞİL, doğrudan fonksiyon çağrısı
//  - Timeout YOK (worker, API değil)
//  - Görsel üretimi async (beklemez)
//  - Günde 6 haber sınırı (Her 4 saatte 1 döngü)
// ═══════════════════════════════════════════════════════

// NOT: import'lar dynamic — dotenv yüklendikten SONRA çalışacak
const CYCLE_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 saat (14,400,000 ms)
const isDaemon = process.argv.includes('--daemon');

// Dinamik Brief Toplayıcı (Canlı Internet araması)
// Hardcoded array yerine internetten çekecek

let cycleCount = 0;

async function runSingleCycle() {
    cycleCount++;
    const startTime = Date.now();
    // ═══ OTONOM NİYET (INTENT) YÖNETİMİ ═══
    // Günde 6 kez çalışır. Her döngüye özel bir niyet veriyoruz:
    // Döngü 1, 2 -> TREND (ANALYZE)
    // Döngü 3, 4 -> PAZAR (DISCOVER)
    // Döngü 5, 6 -> FIRSAT (ACT)
    const cycleOfDay = ((cycleCount - 1) % 6) + 1;
    let targetIntent = 'TREND';
    if (cycleOfDay === 3 || cycleOfDay === 4) targetIntent = 'PAZAR';
    if (cycleOfDay === 5 || cycleOfDay === 6) targetIntent = 'FIRSAT';

    // Dynamic import — dotenv yüklendikten SONRA çağrılıyor
    const { getDynamicBrief } = await import('./src/core/aloha/dynamicSignalCollector');
    const { executeLiveNewsSwarm } = await import('./src/core/aloha/live-news-swarm');
    const { buildTerminalPayload } = await import('./src/core/aloha/terminalPayloadBuilder');
    const { refreshTickerData } = await import('./src/core/aloha/tickerDataFetcher');

    const liveBrief = await getDynamicBrief(targetIntent);

    console.log(`\n${'═'.repeat(55)}`);
    console.log(`  TRTEX WORKER v5.0 — DÖNGÜ #${cycleCount}`);
    console.log(`  ${new Date().toISOString()}`);
    console.log(`  Brief: ${liveBrief.substring(0, 60)}...`);
    console.log(`${'═'.repeat(55)}\n`);

    // ═══ ADIM 1: HABER ÜRET (TEK GERÇEK MOTOR) ═══
    console.log("[1/3] 🧠 Live News Swarm çalışıyor...");
    try {
        const result = await executeLiveNewsSwarm(liveBrief);
        if (result) {
            const title = result?.intelligence?.translations?.TR?.title || '(başlık yok)';
            console.log(`  ✅ Haber üretildi: "${title.substring(0, 60)}"`);
        } else {
            console.log("  ⚠️ Bu döngüde haber üretilemedi (kalite filtresi)");
        }
    } catch (err: any) {
        console.error(`  ❌ Swarm hatası: ${err.message}`);
    }

    // ═══ ADIM 2: TICKER GÜNCELLE ═══
    console.log("\n[2/4] 📊 Ticker verileri güncelleniyor...");
    try {
        const tickerResult = await refreshTickerData();
        console.log(`  ✅ ${tickerResult}`);
    } catch (err: any) {
        console.error(`  ❌ Ticker hatası: ${err.message}`);
    }

    // ═══ ADIM 3: GÖRSEL MOTORU TETİKLE ═══
    // Dışarıdan Cloud Scheduler'a bağımlı kalmamak için resmi olarak kendi içimizde otonom basıyoruz.
    console.log("\n[3/4] 🖼️ Görsel Kuyruğu İşleniyor (Tam Otonom Mod)...");
    try {
        // Master server 3000 portunda aipyram-master-brain pm2 ile açık. Oraya lokal istek atıyoruz.
        const authHeader = process.env.CRON_SECRET ? { 'x-cron-secret': process.env.CRON_SECRET } : {};
        const imgRes = await fetch('http://localhost:3000/api/cron/image-processor', { headers: authHeader });
        const imgData = await imgRes.json();
        console.log(`  ✅ Görsel işlendi: ${imgData.stats?.success || 0} tamamlandı, ${imgData.stats?.failed || 0} hata.`);
    } catch (err: any) {
        console.error(`  ❌ Görsel motoru hatası: ${err.message}`);
    }

    // ═══ ADIM 4: PAYLOAD GÜNCELLE ═══
    // Payload güncellenirken resimlerin de veritabanına işlenmiş olmasını garanti altına aldık.
    console.log("\n[4/4] 📦 Terminal Payload güncelleniyor...");
    try {
        const payload = await buildTerminalPayload();
        console.log(`  ✅ v${payload.version} | IQ: ${payload.intelligenceScore}/100 | ${payload.gridArticles.length} haber | ${payload.tickerItems.length} ticker`);
    } catch (err: any) {
        console.error(`  ❌ Payload hatası: ${err.message}`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${'═'.repeat(55)}`);
    console.log(`  DÖNGÜ #${cycleCount} TAMAMLANDI (${duration}s)`);
    console.log(`  Sonraki döngü: ${(CYCLE_INTERVAL_MS / 60000).toFixed(0)} dakika sonra`);
    console.log(`${'═'.repeat(55)}\n`);
}

// ═══════════════════════════════════════════════════════
//  ÇALIŞTIRMA MODLARI
// ═══════════════════════════════════════════════════════

if (isDaemon) {
    console.log(`\n🔄 DAEMON MODU — Her ${CYCLE_INTERVAL_MS / 60000} dakikada bir çalışacak`);
    console.log(`   İlk döngü 10sn sonra başlayacak...\n`);

    setTimeout(async () => {
        await runSingleCycle();

        setInterval(async () => {
            try {
                await runSingleCycle();
            } catch (err) {
                console.error("WORKER DAEMON HATA:", err);
            }
        }, CYCLE_INTERVAL_MS);
    }, 10_000);

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log("\n🛑 WORKER durduruluyor...");
        process.exit(0);
    });
} else {
    // TEK SEFERLİK MOD
    runSingleCycle()
        .then(() => {
            console.log("✅ Tek seferlik döngü tamamlandı.");
            process.exit(0);
        })
        .catch(err => {
            console.error("WORKER CRITICAL FAILURE:", err);
            process.exit(1);
        });
}

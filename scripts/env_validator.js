// ============================================================================
// AIPYRAM OS - SOVEREIGN .ENV.PRODUCTION VALIDATOR (EXPERT MODE)
// ============================================================================
// Aciklama: Bu script Master Beyin'in kaynak koda gore kesin ihtiyac duydugu 
// anahtarlari dinamik olarak test eder ve Cloud Run deployment patlamalarini onler.

const fs = require("fs");
const path = require("path");

const ENV_PATH = path.join(__dirname, "../.env.production");

// 1. KATEGORİZE EDİLMİŞ ZORUNLU ANAHTARLAR
// Kaynak kod analiziyle tespit edilmis kritik degiskenler:
const CORE_KEYS = [
  "GEMINI_API_KEY",               // Aloha Agentic Swarm Zekasi
  "JWT_SECRET",                   // Sovereign Kimlik Dogrulama
  "UPSTASH_REDIS_REST_URL",       // Onbellek, Rate Limit
  "UPSTASH_REDIS_REST_TOKEN"      // Redis Kimlik Dogrulama
];

const OPTIONAL_WARNING_KEYS = [
  "STRIPE_SECRET_KEY",            // Odeme Geit Altyapisi
  "RESEND_API_KEY",               // Bildirim Sistemi (Alternatif: GMAIL)
  "SYSTEM_MASTER_EMAIL",          // Sovereign Hata Loglama Gonderimleri
];

function validateEnv() {
  console.log("");
  console.log("==========================================");
  console.log("   🚀 AIPYRAM SOVEREIGN ENV KONTROL");
  console.log("==========================================");

  if (!fs.existsSync(ENV_PATH)) {
    console.error(`\n❌ FATAL ERROR: .env.production bulunamadi!\n👉 Lutfen ana dizine ekleyin: ${ENV_PATH}\n`);
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_PATH, "utf-8");
  const envVars = {};

  // Satir satir ayikla
  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const parts = trimmedLine.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join("=").trim();
        envVars[key] = val;
      }
    }
  });

  let hasFatalError = false;

  console.log("\n[KRITIK CEKİRDEK KONTROLU (CORE)]");
  
  // 1. Firebase Özel Kontrolü (Base64 Öncelikli)
  if (!envVars["FIREBASE_SERVICE_ACCOUNT_KEY_BASE64"] && !envVars["FIREBASE_SERVICE_ACCOUNT_KEY"]) {
       console.error(`❌ FATAL EKSİK: Firebase Service Account eksik! Base64 onerilir.`);
       hasFatalError = true;
  } else if (envVars["FIREBASE_SERVICE_ACCOUNT_KEY_BASE64"]) {
       console.log(`✅ [OK] FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`);
       try {
           JSON.parse(Buffer.from(envVars["FIREBASE_SERVICE_ACCOUNT_KEY_BASE64"], 'base64').toString('utf8'));
       } catch (e) {
           console.error(`❌ FATAL FORMAT: FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 cozulemedi veya icerigi JSON degil!`);
           hasFatalError = true;
       }
  } else {
       console.log(`✅ [OK] FIREBASE_SERVICE_ACCOUNT_KEY (Uyari: Gelişmiş güvenlik icin Base64 onerilir)`);
       try { 
           JSON.parse(envVars["FIREBASE_SERVICE_ACCOUNT_KEY"]); 
       } catch (e) { 
           console.error(`❌ FATAL FORMAT: FIREBASE_SERVICE_ACCOUNT_KEY gecerli bir JSON degil!`); 
           hasFatalError = true; 
       }
  }

  // 2. Diğer Core Modüller
  CORE_KEYS.forEach((key) => {
    if (!envVars[key] || envVars[key] === "") {
      console.error(`❌ FATAL EKSİK: '${key}' (AIPyram Master Node Cokebilir)`);
      hasFatalError = true;
    } else {
      console.log(`✅ [OK] ${key}`);
    }
  });

  console.log("\n[OPSIYONEL/PERFORMANS KONTROLU]");
  OPTIONAL_WARNING_KEYS.forEach((key) => {
    if (!envVars[key] || envVars[key] === "") {
      console.log(`⚠️ UYARI: '${key}' eksik. Bazi sistemler fallback (yedek) uzerinden calisacak.`);
    } else {
      console.log(`✅ [OK] ${key}`);
    }
  });

  console.log("==========================================");

  if (hasFatalError) {
    console.error("🚨 DEPLOY REDDEDILDI: EKSİKLERİ GİDERMEDEN CLOUD RUN'A ÇIKILAMAZ!");
    console.error("==========================================\n");
    process.exit(1);
  }

  console.log("🟢 TUM KRITIK DEGISKENLER DOGRULANDI, SISTEM HAZIR.");
  console.log("==========================================\n");
  process.exit(0);
}

validateEnv();

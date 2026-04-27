import { alohaAI } from '@/core/aloha/aiClient';
import { NextResponse } from "next/server";

/**
 * /api/health/deep — Sistemin tüm bağımlılıklarını tek seferde denetler.
 * GOOGLE-NATIVE: Sadece Google altyapısı kontrol edilir.
 */
export async function GET() {
  const checks: Record<string, { status: string; detail?: string }> = {};

  // 1. Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === "dummy_build_key" || geminiKey === "dummy") {
    checks.gemini = { status: "❌ DEAD", detail: "GEMINI_API_KEY eksik veya dummy. aistudio.google.com/apikey adresinden al." };
  } else {
    try {
      const { text } = await alohaAI.generate("Sadece 'OK' yaz.", { complexity: 'routine' }, 'health.deep');
      checks.gemini = { status: "✅ ALIVE", detail: `Yanıt: ${text?.substring(0, 30)}` };
    } catch (e: any) {
      checks.gemini = { status: "❌ DEAD", detail: `Key var ama çağrı çöktü: ${e.message?.substring(0, 100)}` };
    }
  }

  // 2. Firebase Admin
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    checks.firebase_admin = { status: "⚠️ DEGRADED", detail: "FIREBASE_SERVICE_ACCOUNT_KEY yok. ActionRunner ve Aloha Transaction çalışmaz." };
  } else {
    try {
      const { checkFirestoreHealth } = await import("@/lib/firebase-admin");
      const fbStatus = await checkFirestoreHealth();
      checks.firebase_admin = { 
        status: fbStatus === 'DOWN' ? "❌ DEAD" : "✅ ALIVE", 
        detail: `Firestore: ${fbStatus}` 
      };
    } catch (e: any) {
      checks.firebase_admin = { status: "❌ DEAD", detail: `Bağlantı başarısız: ${e.message?.substring(0, 100)}` };
    }
  }

  // 3. Firebase Client (NEXT_PUBLIC env kontrolü)
  const fbClientKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!fbClientKey) {
    checks.firebase_client = { status: "⚠️ DEGRADED", detail: "NEXT_PUBLIC_FIREBASE_API_KEY eksik. Client-side auth çalışmaz." };
  } else {
    checks.firebase_client = { status: "✅ CONFIGURED" };
  }

  // 4. GitHub Token (Ghost Strike — opsiyonel)
  if (!process.env.GITHUB_TOKEN) {
    checks.github = { status: "⚠️ OPTIONAL", detail: "GITHUB_TOKEN yok. PC kapalıyken cloud deploy yapılamaz." };
  } else {
    checks.github = { status: "✅ CONFIGURED" };
  }

  // Genel durum
  const allAlive = Object.values(checks).every(c => c.status.includes("✅"));
  const hasCriticalDead = Object.values(checks).some(c => c.status.includes("❌"));

  return NextResponse.json({
    systemStatus: hasCriticalDead ? "🔴 CRITICAL" : allAlive ? "🟢 OPERATIONAL" : "🟡 DEGRADED",
    timestamp: new Date().toISOString(),
    architecture: "GOOGLE-NATIVE (Firebase + Gemini)",
    checks,
    instructions: hasCriticalDead 
      ? "Yukarıdaki ❌ DEAD servislerin anahtarlarını .env.local dosyasına ekle ve pnpm dev'i yeniden başlat."
      : "Sistem operasyonel."
  });
}

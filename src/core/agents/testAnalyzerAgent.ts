import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { CodeRunnerAgent } from "./codeRunnerAgent";
import * as fs from "fs";

const ai = alohaAI.getClient();

/**
 * TEST ANALYZER AGENT — Hata Oku → Düzelt → Tekrar (V10 IDE Loop)
 * Build veya runtime hatası alındığında Gemini'ye gönderir.
 * Gemini fix üretir → CodeRunner uygular → Tekrar test → Max 3 deneme.
 */
export class TestAnalyzerAgent {
  private static MAX_RETRIES = 3;

  /**
   * Tam IDE döngüsü: Dosyayı oku → Build/Run → Hata varsa düzelt → Tekrar
   * Başarılıysa düzeltilmiş kodu döndürür, 3 denemede de başarısızsa null.
   */
  static async analyzeAndFix(
    filePath: string,
    errorLog: string,
    context: string = ""
  ): Promise<{ fixed: boolean; attempts: number; finalError?: string }> {
    console.log(`[🔬 TEST_ANALYZER] Otonom düzeltme döngüsü başlıyor: ${filePath}`);

    let currentError = errorLog;
    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      attempt++;
      console.log(`[🔬 TEST_ANALYZER] Deneme ${attempt}/${this.MAX_RETRIES}`);

      // 1. Gemini'den fix iste
      const fix = await this.requestFix(filePath, currentError, context);
      if (!fix) {
        console.error(`[🔬 TEST_ANALYZER] Gemini fix üretemedi.`);
        continue;
      }

      // 2. Fix'i uygula
      if (fix.type === "full_replace") {
        fs.writeFileSync(filePath, fix.code || "", "utf8");
        console.log(`[🔬 TEST_ANALYZER] Dosya tamamen yeniden yazıldı.`);
      } else if (fix.type === "patch" && fix.target && fix.replacement) {
        const patchResult = CodeRunnerAgent.applyPatch(filePath, fix.target, fix.replacement);
        if (!patchResult.success) {
          console.error(`[🔬 TEST_ANALYZER] Patch uygulanamadı: ${patchResult.error}`);
          continue;
        }
      }

      // 3. Tekrar test et (TypeCheck)
      const checkResult = await CodeRunnerAgent.typeCheck(filePath);
      if (checkResult.success) {
        console.log(`[✅ TEST_ANALYZER] Deneme ${attempt}'de düzeltildi!`);
        return { fixed: true, attempts: attempt };
      }

      currentError = checkResult.errors;
      console.log(`[🔬 TEST_ANALYZER] Hala hatalı. Yeni hata Gemini'ye gönderiliyor...`);
    }

    console.error(`[❌ TEST_ANALYZER] ${this.MAX_RETRIES} denemede düzeltilemedi.`);
    return { fixed: false, attempts: attempt, finalError: currentError };
  }

  /**
   * Bir build/runtime hatasını buildProject ile yakalar ve otonom düzeltme döngüsüne sokar.
   */
  static async buildAndAutoFix(projectDir?: string): Promise<{ success: boolean; output: string; fixAttempts: number }> {
    const buildResult = await CodeRunnerAgent.buildProject(projectDir);

    if (buildResult.success) {
      return { success: true, output: "Build başarılı.", fixAttempts: 0 };
    }

    // Hata mesajından dosya yolunu ve hatayı parse et
    const errorLines = buildResult.output.split("\n");
    const fileErrorMatch = errorLines.find(l => l.includes("error TS") || l.includes("Error:"));

    if (!fileErrorMatch) {
      return { success: false, output: buildResult.output, fixAttempts: 0 };
    }

    // Dosya yolunu çıkar (örn: "src/components/Foo.tsx(12,5): error TS2304")
    const pathMatch = fileErrorMatch.match(/^([^\s(]+)\(/);
    if (!pathMatch) {
      return { success: false, output: buildResult.output, fixAttempts: 0 };
    }

    const errorFile = pathMatch[1];
    console.log(`[🔬 TEST_ANALYZER] Build hatası tespit edildi: ${errorFile}`);

    const fixResult = await this.analyzeAndFix(errorFile, buildResult.output, "pnpm build hatası");

    if (fixResult.fixed) {
      // Düzelttikten sonra tekrar build al
      const retryBuild = await CodeRunnerAgent.buildProject(projectDir);
      return { success: retryBuild.success, output: retryBuild.output, fixAttempts: fixResult.attempts };
    }

    return { success: false, output: fixResult.finalError || buildResult.output, fixAttempts: fixResult.attempts };
  }

  /**
   * Gemini'den cerrahi düzeltme ister.
   */
  private static async requestFix(
    filePath: string, 
    errorLog: string, 
    context: string
  ): Promise<{ type: "full_replace" | "patch"; code?: string; target?: string; replacement?: string } | null> {
    try {
      const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";

      const prompt = `Sen bir TypeScript/React uzman debugger'sın. SADECE JSON döndür, açıklama yazma.

HATA:
${errorLog.substring(0, 2000)}

DOSYA (${filePath}):
${fileContent.substring(0, 5000)}

BAĞLAM: ${context}

Eğer küçük bir düzeltme yeterliyse şu JSON'u döndür:
{"type": "patch", "target": "hatalı satırlar (exact match)", "replacement": "düzeltilmiş satırlar"}

Eğer dosya tamamen bozuksa şu JSON'u döndür:
{"type": "full_replace", "code": "tüm düzeltilmiş dosya içeriği"}`;

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = res.text || "{}";
      return JSON.parse(text);
    } catch (e: any) {
      console.error(`[🔬 TEST_ANALYZER] Gemini fix isteği başarısız:`, e.message);
      return null;
    }
  }
}

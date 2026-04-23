import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { CodeRunnerAgent } from "../agents/codeRunnerAgent";
import { detectSuccess } from "./successDetector";

const ai = alohaAI.getClient();

export async function autoLoop(task: string, context: string, projectPath?: string) {
  let attempt = 0;
  let lastError: any = null;
  let code: string = "";

  console.log(`[🔄 AUTO_LOOP] Otonom döngü başlıyor. Görev: ${task}`);

  while (attempt < 3) {
    // 1. Generate code (or regenerate with error)
    code = await generateCodeNative(task, context, lastError, code);

    if (!code || code.length < 20) {
        console.warn(`[🔄 AUTO_LOOP] Üretilen kod çok kısa veya boş, iptal ediliyor.`);
        break;
    }

    // 2. Otonom olarak ilgili dosyaya yazılmalı veya build alınmalı
    const buildResult = await CodeRunnerAgent.buildProject(projectPath); 
    const result = {
      success: buildResult.success,
      output: buildResult.output,
      exitCode: buildResult.success ? 0 : 1
    };

    // 3. Başarı kontrolü
    const ok = await detectSuccess(result, task, code);

    if (ok) {
        console.log(`[✅ AUTO_LOOP] Başarı tespit edildi!`);
        return { success: true, code };
    }

    // Sonsuz hata döngüsünü engelle
    if (lastError === result.output) {
        console.warn(`[🔄 AUTO_LOOP] Aynı hatayı tekrar aldı. Sonsuz döngü kırılıyor.`);
        break;
    }

    lastError = result.output;
    console.log(`[🔄 AUTO_LOOP] Hata alındı. Yeni denemeye geçiliyor (${attempt + 1}/3)...`);
    attempt++;
  }

  return { success: false, error: lastError };
}

async function generateCodeNative(task: string, context: string, error: any, previousCode: string): Promise<string> {
    const prompt = `Sen bir Otonom B2B IDE Yazılımcısısın.

Görev: ${task}
Proje Context Yapısı: 
${context}

${error ? `HATA ALDIK. Lütfen önceki kodu düzelt: \nÖnceki Kod:\n${previousCode.substring(0,2000)}\n\nHATA LOGU:\n${String(error).substring(0,1000)}` : ''}

Sadece düzeltilmiş net TypeScript/React kodunu ver, açıklama yazma.
`;

    try {
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        
        // Strip markdown backticks
        let output = res.text || "";
        output = output.replace(/^```(typescript|tsx|ts|javascript|js)?\n/, "").replace(/```$/, "").trim();
        return output;
    } catch (e: any) {
        console.error(`[🔄 AUTO_LOOP] API Hatası:`, e.message);
        return previousCode;
    }
}

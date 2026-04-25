import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

// Removed raw ai client
export interface IDEBuildResult {
  success: boolean;
  exitCode: number;
  output: string;
  error?: any;
}

export async function detectSuccess(result: IDEBuildResult, task: string, code: string): Promise<boolean> {
  // 1. Build & Runtime Check
  if (result.exitCode !== 0) return false;
  if (result.error) return false;
  if (result.output.toLowerCase().includes("error")) {
      // It might be just a warning but let's be strict for autonomous loops
      if (result.output.toLowerCase().includes("failed")) return false;
  }

  // 2. AI Judge
  try {
    const prompt = `
Kod:
\`\`\`tsx
${code.substring(0, 3000)} // truncate to save tokens
\`\`\`

Terminal Log:
${result.output.substring(0, 500)}

Görev: ${task}

Bu görev başarıyla tamamlandı mı? Sadece SUCCESS veya FAIL yaz.`;

    const { text } = await alohaAI.generate(prompt, { 
      systemInstruction: "Sen acımasız bir Başhakem (AI Judge). Eğer kod istenen görevi harfiyen yapmıyorsa FAIL yaz.",
      complexity: 'routine'
    }, 'successDetector.detectSuccess');

    const verdict = (text || "").toUpperCase();
    console.log(`[⚖️ AI JUDGE] Karar: ${verdict.includes("SUCCESS") ? "SUCCESS" : "FAIL"}`);
    return verdict.includes("SUCCESS");
  } catch (err) {
    console.warn(`[⚖️ AI JUDGE] Hata:`, err);
    // Fallback to strict terminal logic
    return result.exitCode === 0 && !result.error && !result.output.includes("failed");
  }
}

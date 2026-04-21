import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * CODE RUNNER AGENT — IDE Çekirdeği (V10)
 * Dosya yazar, çalıştırır, build alır, hata yakalar, patch uygular.
 * SandboxAgent'ın üstünde çalışan "fiziksel infaz" katmanı.
 */
export class CodeRunnerAgent {
  private static SANDBOX_DIR = path.join(process.cwd(), ".sandbox_tmp");
  private static TIMEOUT_MS = 30000; // 30 saniye (sonsuz döngü koruması)

  /**
   * Verilen kodu geçici dosyaya yazar ve node/tsx ile çalıştırır.
   * Stdout ve stderr'i döndürür.
   */
  static async runCode(code: string, fileName?: string): Promise<{ success: boolean; stdout: string; stderr: string }> {
    this.ensureSandbox();
    const file = fileName || `run_${Date.now()}.ts`;
    const filePath = path.join(this.SANDBOX_DIR, file);

    try {
      fs.writeFileSync(filePath, code, "utf8");
      console.log(`[🔧 CODE_RUNNER] Kod yazıldı: ${filePath}`);

      const { stdout, stderr } = await execAsync(`npx tsx ${filePath}`, {
        cwd: this.SANDBOX_DIR,
        timeout: this.TIMEOUT_MS,
        env: { ...process.env, NODE_ENV: "development" }
      });

      console.log(`[✅ CODE_RUNNER] Çalıştırma başarılı.`);
      return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (err: any) {
      const stderr = err.stderr || err.message || "Unknown error";
      console.error(`[❌ CODE_RUNNER] Çalıştırma hatası: ${stderr.substring(0, 200)}`);
      return { success: false, stdout: err.stdout || "", stderr };
    } finally {
      // Temizlik (geçici dosyayı sil)
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  /**
   * Belirtilen proje dizininde pnpm build çalıştırır.
   * Hata varsa hata çıktısını döndürür.
   */
  static async buildProject(projectDir?: string): Promise<{ success: boolean; output: string }> {
    const cwd = projectDir || process.cwd();
    console.log(`[🔧 CODE_RUNNER] Build başlatılıyor: ${cwd}`);

    try {
      const { stdout, stderr } = await execAsync("pnpm run build", {
        cwd,
        timeout: 120000, // Build 2 dk sürebilir
        env: { ...process.env, NODE_ENV: "production" }
      });

      const output = (stdout + "\n" + stderr).trim();
      const hasError = output.toLowerCase().includes("error") && !output.toLowerCase().includes("0 errors");

      if (hasError) {
        console.error(`[❌ CODE_RUNNER] Build hatalı.`);
        return { success: false, output };
      }

      console.log(`[✅ CODE_RUNNER] Build başarılı.`);
      return { success: true, output };
    } catch (err: any) {
      return { success: false, output: err.stderr || err.stdout || err.message };
    }
  }

  /**
   * Var olan bir dosyaya cerrahi düzeltme uygular.
   * targetContent bulunup replacementContent ile değiştirilir.
   */
  static applyPatch(filePath: string, targetContent: string, replacementContent: string): { success: boolean; error?: string } {
    const absPath = path.resolve(filePath);

    if (!fs.existsSync(absPath)) {
      return { success: false, error: `Dosya bulunamadı: ${absPath}` };
    }

    const content = fs.readFileSync(absPath, "utf8");

    if (!content.includes(targetContent)) {
      return { success: false, error: "Hedef içerik dosyada bulunamadı." };
    }

    const newContent = content.replace(targetContent, replacementContent);
    fs.writeFileSync(absPath, newContent, "utf8");
    console.log(`[🔧 CODE_RUNNER] Patch uygulandı: ${absPath}`);
    return { success: true };
  }

  /**
   * TypeScript dosyasını syntax kontrolünden geçirir (NoEmit).
   */
  static async typeCheck(filePath: string): Promise<{ success: boolean; errors: string }> {
    try {
      const { stdout, stderr } = await execAsync(
        `npx tsc --noEmit --jsx react-jsx --skipLibCheck --esModuleInterop ${filePath}`,
        { timeout: this.TIMEOUT_MS }
      );
      return { success: true, errors: "" };
    } catch (err: any) {
      return { success: false, errors: err.stdout || err.stderr || err.message };
    }
  }

  private static ensureSandbox() {
    if (!fs.existsSync(this.SANDBOX_DIR)) {
      fs.mkdirSync(this.SANDBOX_DIR, { recursive: true });
    }
  }
}

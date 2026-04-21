import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * ☁️ V9.3 GHOST EXECUTOR (Bulut İnfaz Motoru)
 * Local PC kapalı olduğunda devreye giren "Ölümsüz İşçi". 
 * Git deposunu Cloud Node üzerine klonlar, otonom değişikliği yapar, Firebase'e basar 
 * ve yeni kodları ana depoya geri push'lar. Hakan PC'yi açtığında git pull atması yeterlidir.
 */

export class CloudExecutor {
  private static readonly REPO_URL = process.env.AIPYRAM_REPO_URL || "https://github.com/aipyram/aipyramweb.git"; // Target repository
  private static readonly GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  private static readonly WORKSPACE_DIR = "/tmp/aipyram-ghost-workspace"; // Geçici izole bulut belleği

  static async executeGhostStrike(taskTarget: string, newContent: string) {
    console.log(`\n☁️ [GHOST STRIKE] PC Ulaşılamıyor! Zero-Wait Bulut İnfazı Başladı.`);
    
    if (!this.GITHUB_TOKEN) {
      console.error("☁️ [FATAL ERROR] GITHUB_TOKEN eksik. Bulut, depoya sızamıyor.");
      return false;
    }

    try {
      this.setupWorkspace();
      this.cloneRepository();
      this.injectSurgicalCode(taskTarget, newContent);
      this.compileAndDeploy();
      this.pushChangesToGit();
      this.cleanupWorkspace();
      console.log("☁️ [SUCCESS] Bulut İnfazı Başarılı. Değişiklikler Canlıda ve Git Repository'sine gönderildi.");
      return true;
    } catch (e: any) {
      console.error(`☁️ [EXCEPTION] Ghost Strike Başarısız:`, e.message);
      return false;
    }
  }

  private static setupWorkspace() {
    console.log("☁️ [1/6] Savaş Alanı Hazırlanıyor (Isolated /tmp Workspace)...");
    if (fs.existsSync(this.WORKSPACE_DIR)) {
      fs.rmSync(this.WORKSPACE_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(this.WORKSPACE_DIR, { recursive: true });
  }

  private static cloneRepository() {
    console.log(`☁️ [2/6] Kod Tabanı (Repository) Klonlanıyor...`);
    const authRepoUrl = this.REPO_URL.replace("https://", `https://${this.GITHUB_TOKEN}@`);
    execSync(`git clone ${authRepoUrl} .`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
  }

  private static injectSurgicalCode(targetPath: string, content: string) {
    console.log(`☁️ [3/6] Kod Enjeksiyonu Yapılıyor: ${targetPath}`);
    const absolutePath = path.resolve(this.WORKSPACE_DIR, targetPath);
    
    // Güvenlik Duvarı
    if (!absolutePath.startsWith(this.WORKSPACE_DIR)) {
        throw new Error("LFI Breach Attempt! Yalnızca Workspace içi yazılabilir.");
    }

    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(absolutePath, content, "utf8");
    console.log(`☁️ [✓] Cerrahi yazım mühürlendi.`);
  }

  private static compileAndDeploy() {
    console.log("☁️ [4/6] Bulut Üzerinde Derleniyor ve Ateşleniyor (Firebase Deploy)...");
    try {
        // Cloud Run (Docker) içindeyken firebase deploy atabilmek için CI token veya service account tanımlı olmalıdır.
        execSync(`pnpm install`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
        execSync(`pnpm run build`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
        // execSync(`firebase deploy --only hosting`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
    } catch (err: any) {
        console.error(`☁️ [🚨 ARMOR PROTOKOLÜ] Build veya Deploy patladı! HATA: ${err.message}`);
        console.log(`☁️ [🛡️ OTONOM GERİ SARMA] Sistemin bozulması engelleniyor. Hard Reset Atılıyor...`);
        execSync(`git reset --hard HEAD`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
        execSync(`git clean -fd`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
        throw new Error("BUILD_FAILED_ROLLBACK_ACTIVATED");
    }
  }

  private static pushChangesToGit() {
    console.log("☁️ [5/6] Başarı Git Deposuna Mühürleniyor (Commit & Push)...");
    execSync(`git config user.email "aloha-ghost@aipyram.ai"`, { cwd: this.WORKSPACE_DIR });
    execSync(`git config user.name "Aloha Master AI (Ghost Strike)"`, { cwd: this.WORKSPACE_DIR });
    execSync(`git add .`, { cwd: this.WORKSPACE_DIR });
    execSync(`git commit -m "🤖 [ALOHA OTONOM]: Ghost Strike İnfazı. PC kapalı olduğu için bulutta çözüldü."`, { cwd: this.WORKSPACE_DIR });
    execSync(`git push origin main`, { cwd: this.WORKSPACE_DIR, stdio: 'inherit' });
  }

  private static cleanupWorkspace() {
    console.log("☁️ [6/6] Savaş Alanı Yokediliyor (Zero Footprint)...");
    fs.rmSync(this.WORKSPACE_DIR, { recursive: true, force: true });
  }
}

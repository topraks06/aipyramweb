import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { NotificationService } from "../../services/notificationService";

const execAsync = promisify(exec);

/**
 * FAZ 9: THE SANDBOX AGENT (Çalıştır - Patlat - Düzelt Döngüsü)
 * Sistem dışına (UI) çıkmadan önce yazılan kodu Typescript derleyicisinde sızdırmazlık testine sokar.
 */
export class SandboxAgent {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), ".sandbox_tmp");
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 1. KOD ÜRETİMİ VE DERLEME DÖNGÜSÜ
  public async generateAndTestComponent(prompt: string, maxRetries = 3): Promise<string | null> {
     console.log(`[🧪 SANDBOX] Otonom Kod İnşası Başlıyor. Görev: ${prompt}`);
     let currentAttempt = 1;
     let lastError = "";
     let currentCode = "";

     while (currentAttempt <= maxRetries) {
        console.log(`[🧪 SANDBOX] Deneme ${currentAttempt}/${maxRetries} üretiliyor...`);
        
        try {
           currentCode = await this.generateCode(prompt, lastError, currentCode);
           
           // Temizlenmiş Kodu Diske Yaz (Kum Havuzu Hücresi)
           const fileName = `target_component_${Date.now()}.tsx`;
           const filePath = path.join(this.tempDir, fileName);
           fs.writeFileSync(filePath, currentCode);

           // 2. STRES TESTİ (Derleme)
           console.log(`[⚡ SANDBOX] Kod derleniyor (TypeScript Compiler Stres Testi)...`);
           await this.compileCode(filePath);

           // Eğer buraya indiyse, Exec (TSC) hata fırlatmamıştır. Compile Bşarılı!
           console.log(`[✅ SANDBOX] MÜKEMMEL! Kod hatasız derlendi. Çıktı güvenli kabul ediliyor.`);
           
           // Cleanup
           fs.unlinkSync(filePath);
           return currentCode;

        } catch (e: any) {
           lastError = e.message || "Bilinmeyen Derleme Hatası";
           console.error(`[🚨 SANDBOX HATA] Deneme ${currentAttempt} Gümledi (Syntax/Logic Error):`);
           console.error(lastError.split('\n')[0]); // Sadece ilk satırı göster log kirlenmesin

           currentAttempt++;
        }
     }

     // 3. SOVEREIGN YARDIM ÇAĞRISI
     console.warn(`[🚨 SANDBOX PES ETTİ] 3 denemede de build (derleme) kurtarılamadı. Hakan Bey'den destek isteniyor.`);
     await NotificationService.sendWhatsApp(
       process.env.SYSTEM_MASTER_PHONE || "+905553330511", 
       `🚨 MİMARİ TIKANIKLIK (SANDBOX)\n\nGörev: ${prompt}\n\nAjan bu bloğu yazarken Typescript sınırlarına takıldı ve 3 denemede de kodu oturtamadı. İzole hücresinde bekliyor, terminale müdahale gerekli.`,
       "aipyram-core"
     );

     return null;
  }

  private async generateCode(objective: string, previousError: string = "", previousCode: string = ""): Promise<string> {
    let systemPrompt = `
      Sen aipyram sisteminin (Strikt B2B Typescript/NextJS) arayüz mimarısın. 
      LÜTFEN SADECE KOD DÖNDÜR. Markdown işaretlerini ( \`\`\`tsx vs ) KOYMA veya açıklamalar YAZMA.
      Direkt importlar ile başlayan saf react komponent kodunu döndür. Tailwind Mimarisi kullan.
    `;

    let userPrompt = `GÖREV: ${objective}`;

    if (previousError && previousCode) {
       userPrompt += `
         BİR ÖNCEKİ DENEMEMİZ PATLADI!
         ŞU HATAYI ALDIK:
         ${previousError}
         
         HATALI KODUMUZ ŞUYDU:
         ${previousCode}
         
         Lütfen bu hatayı OTONOM OLARAK düzelt ve kodu yeniden, saf haliyle bana ver. Asla açıklama yazma.
       `;
    }

    const { text } = await alohaAI.generate(
      `${systemPrompt}\n\n${userPrompt}`,
      { complexity: 'routine' },
      'sandboxAgent.generateCode'
    );

    let code = text || "";
    // Basit bir markdown temizleyici (Eğer AI inat edip markdown yazarsa test bozulur)
    code = code.replace(/```(?:tsx|ts|javascript|js)?/g, '').replace(/```/g, '').trim();
    
    return code;
  }

  private async compileCode(filePath: string): Promise<void> {
    // Sadece sözdizimi doğrulaması (NoEmit) ve React JSX desteği
    // Eğer TS hatalıysa exec hata fırlatacak, try-catch içine düşüp döngüye sokacaktır (Feedback Loop)
    const command = `npx tsc --noEmit --jsx react-jsx --skipLibCheck --esModuleInterop ${filePath}`;
    await execAsync(command);
  }

  public async generateAndFix(filePath: string, errorLog: string): Promise<string | null> {
    const { TestAnalyzerAgent } = await import("./testAnalyzerAgent");
    const result = await TestAnalyzerAgent.analyzeAndFix(filePath, errorLog, "SandboxAgent generateAndFix");
    
    if (result.fixed) {
      return fs.readFileSync(filePath, "utf8");
    }
    return null;
  }
}

export const sandboxAgent = new SandboxAgent();

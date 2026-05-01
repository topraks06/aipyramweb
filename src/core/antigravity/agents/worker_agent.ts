import * as fs from 'fs';
import * as path from 'path';
import { alohaAI } from '../aloha/aiClient';

/**
 * ANTI-GRAVITY: WORKER AGENT
 * Görevi: Seçilen Skill dosyasını okuyarak LLM veya API üzerinden işi icra etmek.
 * Kural: Kendisinin "COMPLETED" moduna alma yetkisi YOKTUR.
 */
export class WorkerAgent {
  
  public async executeTask(taskId: string, skillFile: string, inputPayload: any): Promise<any> {
    console.log(`\n⏳ [WORKER AGENT] Task ${taskId} işleniyor. Skill: ${skillFile}`);
    
    // Skill kuralını belleğe yükle
    const skillPath = path.resolve(process.cwd(), `src/core/antigravity/skills/${skillFile}.md`);
    
    if (!fs.existsSync(skillPath)) {
      throw new Error(`[Worker] Kritik Hata: AntiGravity anayasası gereği ${skillFile}.md olmadan ajan hareket edemez.`);
    }
    
    const skillDirectives = fs.readFileSync(skillPath, 'utf-8');
    console.log(`[Worker] "${skillFile}" kuralları yüklendi. İşlem icra ediliyor...`);

    // SİMÜLASYON KALDIRILDI: Zero-Mock kuralı gereği doğrudan ALOHA Engine çağrısı yapılır
    try {
      const prompt = `GÖREV: ${taskId}\nBECERİ KURALLARI:\n${skillDirectives}\nPAYLOAD:\n${JSON.stringify(inputPayload, null, 2)}`;
      
      const response = await alohaAI.generate(prompt, { 
        complexity: 'complex',
        responseMimeType: 'application/json' 
      }, 'worker_agent');

      const textOutput = response.text || "{}";
      const result = JSON.parse(textOutput);

      console.log(`[Worker] Üretim tamamlandı. Otonom çıktı (COMPLETED izni olmadan) Engine'e gönderiliyor.`);
      return result;

    } catch (err: any) {
      console.error(`[Worker] Kritik Motor Hatası: ${err.message}`);
      throw err;
    }
  }
}

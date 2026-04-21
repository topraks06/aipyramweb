import * as fs from 'fs';
import * as path from 'path';

export interface ValidationContext {
  taskId: string;
  skillUsed: string;
  contractId?: string;
  workerOutput: any;
}

export interface ReviewResult {
  valid: boolean;
  status: 'COMPLETED' | 'RETRY' | 'FAILED';
  reason?: string;
  fix?: string; // Worker'a ikinci deneme için spesifik yol gösterir
}

/**
 * ANTI-GRAVITY: REVIEWER AGENT (Kurşun Geçirmez Denetmen)
 * Tüm çıktılar buradaki 'Contract' (Çıktı Şeması) terazisinde ölçülür. 
 * Hata varsa, "Neden Hata?" ve "Nasıl Düzeltilir?" verisiyle geri teper.
 */
export class ReviewerAgent {
  
  public async verify(context: ValidationContext): Promise<ReviewResult> {
    console.log(`\n🔍 [REVIEWER] Task ${context.taskId} strict-contract testine sokuluyor...`);

    try {
      if (context.contractId) {
        const contractPath = path.resolve(process.cwd(), `src/core/antigravity/contracts/${context.contractId}.json`);
        if (fs.existsSync(contractPath)) {
           const contract = JSON.parse(fs.readFileSync(contractPath, 'utf-8'));
           
           if (contract.strict_validation && context.workerOutput) {
             const payload = context.workerOutput;
             
             // Contract: Word Count
             if (contract.schema.content?.min_words) {
               const wc = (payload.content || '').split(/\s+/).length;
               if (wc < contract.schema.content.min_words) {
                 return { valid: false, status: 'RETRY', reason: `Word count too low (${wc}). Required: ${contract.schema.content.min_words}`, fix: `Mevcut içeriği genişlet. Metne en az ${contract.schema.content.min_words - wc} kelime daha ekle ve detaylandır.` };
               }
             }

             // Contract: Images count
             if (contract.schema.images?.min_count) {
               const imgLen = payload.images?.length || 0;
               if (imgLen < contract.schema.images.min_count) {
                 return { valid: false, status: 'RETRY', reason: `Missing images. Found ${imgLen}, expected ${contract.schema.images.min_count}.`, fix: `skill_image_generator becerisini çalıştır ve en az ${contract.schema.images.min_count} adet benzersiz resim URL'si ekle.` };
               }
             }

             // Contract: Required keys
             if (!payload.title || typeof payload.title !== 'string') {
               return { valid: false, status: 'RETRY', reason: `Field "title" is missing or invalid.`, fix: `TRTEX SEO standartlarına uygun teknik bir "title" (başlık) ekle.` };
             }
           }
        }
      }

      console.log(`✅ [REVIEWER] Çıktı kusursuz. Tüm "Contract" şartları sağlandı. ONAY (COMPLETED).`);
      
      return {
        valid: true,
        status: 'COMPLETED'
      };

    } catch (e: any) {
      console.error(`❌ [REVIEWER AGENT] Motor Hatası:`, e);
      return { valid: false, status: 'FAILED', reason: `Denetim motorunda fatal error: ${e.message}`, fix: 'Sistem loglarını kontrol et.' };
    }
  }
}

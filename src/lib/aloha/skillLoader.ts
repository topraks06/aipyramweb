import * as fs from 'fs';
import * as path from 'path';

/**
 * ALOHA Skill Loader — LTM (Uzun Süreli Hafıza) Bağlantısı
 * 
 * Bu modül, `.agents/skills/academy/` klasöründeki eğitim dosyalarını
 * ve kök `.agents/skills/` klasöründeki anayasa dosyalarını otonom olarak
 * okuyup Gemini'nin Context Window'una enjekte eder.
 * 
 * ALOHA bir soru aldığında, ilgili skill dosyasını bulup sadece onu yükler.
 * Tüm dosyaları birden yüklememek "Halüsinasyon" riskini azaltır.
 */

const SKILLS_ROOT = path.join(process.cwd(), '.agents', 'skills');
const ACADEMY_ROOT = path.join(SKILLS_ROOT, 'academy');

// Konu → Dosya eşleştirme haritası (ALOHA hangi konuda hangi dosyayı okumalı)
const SKILL_KEYWORD_MAP: Record<string, string[]> = {
  // Academy Modülleri
  'iplik|elyaf|polyester|viskon|denye|büküm|pamuk|keten|boya|apre|yanmaz|fr|trevira|blackout': ['academy/1_RAW_MATERIALS_AND_YARNS.md'],
  'tezgah|jakar|armür|dokuma|örme|raşel|ekstrüzyon|enjeksiyon|zamak|döküm|ultrasonik|lazer|dijital baskı|sublimasyon': ['academy/2_MACHINERY_AND_WEAVING.md'],
  'depo|stok|navlun|konteyner|incoterm|fob|cif|exw|rulo|top kumaş|kesmece|fire|barkod|erp': ['academy/3_INVENTORY_AND_LOGISTICS.md'],
  'dikim|konfeksiyon|pile|ekstrafor|büzgü|tela|montaj|motor|tork|somfy': ['academy/4_PRODUCTION_AND_ASSEMBLY.md'],
  'toptancı|perakendeci|kartela|swatch|koleksiyoncu|editeur|iç mekan|dış mekan|outdoor|indoor': ['academy/5_COMMERCE_AND_DISTRIBUTION.md'],
  'render|texture|3d|mesh|giydirme|mekan|katalog|fuar stant': ['academy/6_DESIGN_AND_SPACE_FITTING.md'],
  'kalite|pilling|haslık|shrinkage|çekme|sertifika|grs|gots|reach|oeko|karbon': ['academy/7_QUALITY_AND_SUSTAINABILITY.md'],
  'paket|vakum|hacim|rölöve|kurulum|elektrik|montaj|ölçü': ['academy/8_PACKAGING_AND_INSTALLATION.md'],
  
  // Anayasa Dosyaları
  'ekosistem|fuar|katılımcı|hammaddeci|fabrika|mekanizma|pasmanteri|aksesuar|rustik|korniş|jaluzi|ray': ['HOME_TEXTILE_B2B_ECOSYSTEM.md'],
  'otonom|sovereign|onay|yetki|agi|hafıza|ltm|stm|silme|güven': ['SOVEREIGN_AUTONOMOUS_OPERATIONS_PLAN.md'],
};

/**
 * Verilen komut metnine göre ilgili Skill dosyalarını bulur ve içeriklerini döner.
 * Eğer hiçbir anahtar kelime eşleşmezse, boş string döner (LLM kendi bilgisini kullanır).
 */
export function loadRelevantSkills(command: string): string {
  const normalizedCommand = command.toLowerCase().replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g');
  
  const matchedFiles: Set<string> = new Set();
  
  for (const [keywordPattern, files] of Object.entries(SKILL_KEYWORD_MAP)) {
    const keywords = keywordPattern.split('|');
    for (const kw of keywords) {
      const normalizedKw = kw.replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g');
      if (normalizedCommand.includes(normalizedKw)) {
        files.forEach(f => matchedFiles.add(f));
        break; // Bu keyword grubundan bir eşleşme yeterli
      }
    }
  }
  
  if (matchedFiles.size === 0) return '';
  
  let skillContent = '\n\n--- ALOHA LTM (Uzun Süreli Hafıza) ---\n';
  
  for (const file of matchedFiles) {
    const fullPath = path.join(SKILLS_ROOT, file);
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Dosya çok büyükse (>4000 karakter) ilk 4000 karakteri al
        const trimmed = content.length > 4000 ? content.substring(0, 4000) + '\n...[KISALTILDI]' : content;
        skillContent += `\n[SKILL: ${file}]\n${trimmed}\n`;
      }
    } catch (err) {
      console.error(`[ALOHA SkillLoader] ${file} okunamadı:`, err);
    }
  }
  
  skillContent += '\n--- LTM SONU ---\n';
  return skillContent;
}

/**
 * Tüm mevcut Academy modül dosyalarının listesini döner.
 */
export function listAvailableSkills(): string[] {
  const skills: string[] = [];
  
  try {
    // Kök skill dosyaları
    if (fs.existsSync(SKILLS_ROOT)) {
      const rootFiles = fs.readdirSync(SKILLS_ROOT).filter(f => f.endsWith('.md'));
      skills.push(...rootFiles);
    }
    
    // Academy modülleri
    if (fs.existsSync(ACADEMY_ROOT)) {
      const academyFiles = fs.readdirSync(ACADEMY_ROOT).filter(f => f.endsWith('.md'));
      skills.push(...academyFiles.map(f => `academy/${f}`));
    }
  } catch (err) {
    console.error('[ALOHA SkillLoader] Dosya taraması hatası:', err);
  }
  
  return skills;
}

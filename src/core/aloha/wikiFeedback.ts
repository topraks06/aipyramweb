/**
 * ═══ WIKI FEEDBACK LOOP — Geri Bildirim Döngüsü ═══
 * 
 * Hakan bir çıktıyı "Bu yanlış" veya "Bunu yapma" dediğinde,
 * bu modül otomatik olarak .wiki/ dosyalarına yeni kural ekler.
 * 
 * Kullanım:
 *   import { processWikiFeedback } from '@/core/aloha/wikiFeedback';
 *   await processWikiFeedback('Keten %100 doğal değil, polyester', 'domain_expertise');
 */

import * as fs from 'fs';
import * as path from 'path';

const WIKI_DIR = path.resolve(process.cwd(), '.wiki');

interface FeedbackResult {
  success: boolean;
  file: string;
  entry: string;
}

/**
 * Kullanıcı düzeltmesini ilgili Wiki dosyasına ekle
 */
export async function processWikiFeedback(
  correction: string,
  category: 'domain_expertise' | 'persona_aloha' | 'technical_architecture' | 'forbidden_term'
): Promise<FeedbackResult> {
  const timestamp = new Date().toISOString().substring(0, 10);
  const entry = `\n\n### 📝 Düzeltme (${timestamp})\n> ${correction}\n`;

  try {
    if (category === 'forbidden_term') {
      // Yasaklı terim → forbidden_terms.json'a ekle
      return addForbiddenTerm(correction);
    }

    // Markdown dosyasına ekle
    const filePath = path.join(WIKI_DIR, `${category}.md`);
    
    if (!fs.existsSync(filePath)) {
      return { success: false, file: filePath, entry: `Dosya bulunamadı: ${filePath}` };
    }

    fs.appendFileSync(filePath, entry, 'utf-8');
    console.log(`[WIKI FEEDBACK] ✅ ${category}.md güncellendi: "${correction.substring(0, 60)}..."`);
    
    return { success: true, file: filePath, entry: correction };
  } catch (e: any) {
    console.warn(`[WIKI FEEDBACK] ❌ Güncelleme hatası: ${e.message}`);
    return { success: false, file: category, entry: e.message };
  }
}

/**
 * Yeni yasaklı terim ekle
 */
function addForbiddenTerm(term: string): FeedbackResult {
  const filePath = path.join(WIKI_DIR, 'forbidden_terms.json');
  
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    
    // content_forbidden rule'una ekle
    const contentRule = data.rules.find((r: any) => r.id === 'content_forbidden');
    if (contentRule && !contentRule.terms.includes(term.toLowerCase())) {
      contentRule.terms.push(term.toLowerCase());
      data.updated_at = new Date().toISOString().substring(0, 10);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`[WIKI FEEDBACK] 🚫 Yasaklı terim eklendi: "${term}"`);
      
      // contentGuard cache'ini temizle
      try {
        const { reloadRules } = require('./contentGuard');
        reloadRules();
      } catch { /* sessiz */ }
      
      return { success: true, file: filePath, entry: term };
    }
    
    return { success: true, file: filePath, entry: `"${term}" zaten yasaklı listede` };
  } catch (e: any) {
    return { success: false, file: filePath, entry: e.message };
  }
}

/**
 * Chat mesajından otomatik feedback tespiti
 * "Bu yanlış", "Bunu yapma", "Düzelt:" gibi kalıpları yakalar
 */
export function detectFeedbackIntent(message: string): {
  isFeedback: boolean;
  correction?: string;
  category?: 'domain_expertise' | 'persona_aloha' | 'technical_architecture' | 'forbidden_term';
} {
  const lower = message.toLowerCase();
  
  const feedbackPatterns = [
    /bu yanlış[:\s]*(.+)/i,
    /bunu yapma[:\s]*(.+)/i,
    /düzelt[:\s]*(.+)/i,
    /kural[:\s]*(.+)/i,
    /yasakla[:\s]*(.+)/i,
    /unutma[:\s]*(.+)/i,
    /asla (.+) kullanma/i,
    /(.+) yasak/i,
  ];

  for (const pattern of feedbackPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const correction = match[1].trim();
      
      // Kategori tespiti
      let category: 'domain_expertise' | 'persona_aloha' | 'technical_architecture' | 'forbidden_term' = 'domain_expertise';
      
      if (lower.includes('yasakla') || lower.includes('kullanma') || lower.includes('yasak')) {
        category = 'forbidden_term';
      } else if (lower.includes('kod') || lower.includes('teknik') || lower.includes('deploy')) {
        category = 'technical_architecture';
      } else if (lower.includes('hitap') || lower.includes('üslup') || lower.includes('ton')) {
        category = 'persona_aloha';
      }
      
      return { isFeedback: true, correction, category };
    }
  }

  return { isFeedback: false };
}

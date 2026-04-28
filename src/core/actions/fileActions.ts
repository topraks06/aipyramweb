import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// Kayıtlı projeler — Aloha bu projelerin dosyalarına erişebilir
function getRegisteredProjectPaths(): string[] {
  try {
    const projectsPath = path.join(process.cwd(), 'src', 'core', 'ide', 'projects.json');
    const raw = fsSync.readFileSync(projectsPath, 'utf-8');
    const projects = JSON.parse(raw);
    return projects.map((p: any) => path.resolve(p.repo));
  } catch {
    return [];
  }
}

/**
 * aipyram GOD MODE - FILE ACTIONS
 * Vetted and safe file execution pipeline: Plan -> Guard -> Execute
 */

export interface FileActionPlan {
  action: 'READ' | 'WRITE' | 'DELETE';
  targetPath: string;
  content?: string;
  reasoning: string;
}

export interface GuardResult {
  isSafe: boolean;
  reason?: string;
  normalizedPath?: string;
}

// 1. GUARD (Zırh - Ön Denetim)
// Path traversal, yetkisiz erişim ve riskli bölgeleri engeller.
// V2: Çapraz proje desteği — projects.json'daki tüm projeler erişilebilir
function _securityGuard(targetPath: string): GuardResult {
  try {
    const PROJECT_ROOT = process.cwd();
    const registeredPaths = getRegisteredProjectPaths();
    const allAllowedRoots = [PROJECT_ROOT, ...registeredPaths];

    // Path traversal koruması
    const cleanPath = targetPath.replace(/^[/\\]+/, '');
    const normalizedPath = path.normalize(cleanPath).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Eğer mutlak yol verilmişse direkt kullan, değilse PROJECT_ROOT'a göre çöz
    const absolutePath = path.isAbsolute(targetPath) 
      ? path.resolve(targetPath) 
      : path.resolve(PROJECT_ROOT, normalizedPath);
    
    // İzin verilen kök dizinlerden birinin içinde mi?
    const isInAllowedRoot = allAllowedRoots.some(root => 
      absolutePath.startsWith(path.resolve(root))
    );
    
    if (!isInAllowedRoot) {
      return { isSafe: false, reason: `Security Violation: ${absolutePath} kayıtlı proje dizinlerinden birinde değil. İzin verilen kökler: ${allAllowedRoots.join(', ')}` };
    }

    // Kara liste: Hassas klasörlere ajanlar dokunmasın
    const forbiddenPatterns = ['.git', 'node_modules', '.env'];
    if (forbiddenPatterns.some(pattern => absolutePath.includes(pattern))) {
      return { isSafe: false, reason: `Security Violation: Hassas dizine (${forbiddenPatterns.join(', ')}) müdahale izni reddedildi.` };
    }

    return { isSafe: true, normalizedPath: absolutePath };
  } catch (err: any) {
    return { isSafe: false, reason: `Guard Exception: ${err.message}` };
  }
}

// 2. EXECUTE (Aksiyon)
export async function executeFileAction(plan: FileActionPlan): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log(`[GodMode - FileAction] Gelen Plan: ${plan.action} on ${plan.targetPath}`);
  
  // Guard aşaması
  const guard = _securityGuard(plan.targetPath);
  if (!guard.isSafe || !guard.normalizedPath) {
    console.error(`[GodMode - GuardFailed] ${guard.reason}`);
    return { success: false, error: guard.reason };
  }

  const { normalizedPath } = guard;

  try {
    switch (plan.action) {
      case 'READ':
        const content = await fs.readFile(normalizedPath, 'utf-8');
        return { success: true, data: content };

      case 'WRITE':
        if (plan.content === undefined) {
          return { success: false, error: "Yazma işlemi için 'content' zorunludur." };
        }
        
        // Dizin yoksa oluştur
        await fs.mkdir(path.dirname(normalizedPath), { recursive: true });
        
        // Önemli Güvenlik: Eski kodu ezmeden önce bir backup alınabilir (eski server.ts kuralı).
        // Şimdilik direkt yazıyoruz.
        await fs.writeFile(normalizedPath, plan.content, 'utf-8');
        return { success: true, data: `Başarıyla yazıldı: ${plan.targetPath}` };

      case 'DELETE':
        // Silme işlemlerinde ek bir onay sistemi eklenebilir
        await fs.unlink(normalizedPath);
        return { success: true, data: `Başarıyla silindi: ${plan.targetPath}` };

      default:
        return { success: false, error: `Bilinmeyen eylem tipi: ${plan.action}` };
    }
  } catch (error: any) {
    console.error(`[GodMode - ExecutionError]`, error.message);
    return { success: false, error: error.message };
  }
}

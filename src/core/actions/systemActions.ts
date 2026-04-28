import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

/**
 * aipyram GOD MODE - SYSTEM ACTIONS
 * Vetted shell execution pipeline: Plan -> Guard -> Execute
 * V2: Çapraz proje desteği — projects.json'daki projelerde komut çalıştırabilir
 */

export interface SystemActionPlan {
  command: string;
  reasoning: string;
  project?: string; // Opsiyonel: 'trtex', 'perde', 'hometex' vb. Belirtilmezse aipyramweb'de çalışır.
}

// Proje adından çalışma dizinini çöz
function resolveProjectCwd(projectName?: string): string {
  if (!projectName) return process.cwd();
  
  try {
    const projectsPath = path.join(process.cwd(), 'src', 'core', 'ide', 'projects.json');
    const raw = fs.readFileSync(projectsPath, 'utf-8');
    const projects = JSON.parse(raw);
    const match = projects.find((p: any) => p.name === projectName);
    if (match && fs.existsSync(match.repo)) {
      return path.resolve(match.repo);
    }
  } catch {}
  
  return process.cwd();
}

export interface GuardResult {
  isSafe: boolean;
  reason?: string;
}

// 1. GUARD (Sistem Kalkanı)
// Yalnızca güvenli komutların (npm, npx vb.) çalıştırılmasına izin verir.
// 'rm -rf', 'wget' gibi tehlikeli komutları bloke eder.
function _securityGuard(command: string): GuardResult {
  if (!command) return { isSafe: false, reason: "Komut boş olamaz." };

  // İzin verilen prefix'ler (Whitelist mantığı)
  const allowedPrefixes = [
    // npm/pnpm (genel)
    'npm install', 'npm run build', 'npm run dev', 'npm run lint', 'npm run start',
    'pnpm install', 'pnpm run build', 'pnpm run dev', 'pnpm run lint', 'pnpm run start', 'pnpm --version',
    'pnpm run newsroom',  // TRTEX haber üretimi
    'pnpm run generate',  // İçerik üretimi
    // npx
    'npx shadcn', 'npx tailwindcss', 'npx tsc', 'npx next',
    // git (read-only + safe write)
    'git status', 'git add', 'git log', 'git diff', 'git branch', 'git stash', 'git remote',
    // firebase
    'firebase deploy', 'firebase projects:list', 'firebase hosting',
    'npx firebase',
    // node (script çalıştırma dahil)
    'node --version', 'node -e', 'node scripts/', 'node src/',
    // diagnostik (dosya okuma, listeleme — yazma yok)
    'dir ', 'ls ', 'cat ', 'type ', 'head ', 'tail ',
    'echo ',
    // TRTEX & proje-arası otonom komutlar
    'npx ts-node',
  ];
  
  // Zararlı karakter kombinasyonları engeli (Command Injection)
  const hasDangerousChars = /[&;\|<>]/.test(command);

  // Komut listedekilerden biriyle başlıyor mu?
  const isAllowed = allowedPrefixes.some(prefix => command.startsWith(prefix));

  if (hasDangerousChars) {
    return { isSafe: false, reason: "Security Violation: Komut birleştirme operatörleri (&, |, ;) tespit edildi. Apollon Kalkanı sistemi kilitledi." };
  }

  if (!isAllowed) {
    return { isSafe: false, reason: `Security Violation: '${command}' komutu güvenli listede yok. Sadece npm/npx türevi izlenen komutlara izin verilmektedir.` };
  }

  return { isSafe: true };
}

// 2. EXECUTE (Aksiyon)
export async function executeSystemAction(plan: SystemActionPlan): Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }> {
  console.log(`[GodMode - SystemAction] Gelen Komut: "${plan.command}"`);
  
  // Guard aşaması
  const guard = _securityGuard(plan.command);
  if (!guard.isSafe) {
    console.error(`[GodMode - GuardFailed] ${guard.reason}`);
    return { success: false, error: guard.reason };
  }

  try {
    const targetCwd = resolveProjectCwd(plan.project);
    console.log(`[GodMode - SystemAction] CWD: ${targetCwd}`);
    const { stdout, stderr } = await execPromise(plan.command, { cwd: targetCwd });
    
    return { success: true, stdout, stderr };
  } catch (error: any) {
    console.error(`[GodMode - ExecutionError]`, error.message);
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

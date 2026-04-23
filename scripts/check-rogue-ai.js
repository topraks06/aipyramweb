const fs = require('fs');
const path = require('path');

// Yalnızca bu dosyalarda GoogleGenAI import'una izin var (Sovereign SDK ve singleton)
const WHITELIST = [
  path.join(__dirname, '../src/core/aloha/aiClient.ts'),
  path.join(__dirname, '../packages/aloha-sdk'),
];

const SEARCH_DIRS = [
  path.join(__dirname, '../src'),
];

let hasErrors = false;

function isWhitelisted(filePath) {
  return WHITELIST.some(whitelistPath => filePath.startsWith(whitelistPath));
}

function checkFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  if (isWhitelisted(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to catch `import { GoogleGenAI }` or `require('@google/genai')`
  const rogueImportRegex = /import\s+.*GoogleGenAI.*from\s+['"]@google\/genai['"]/g;
  const rogueRequireRegex = /require\(['"]@google\/genai['"]\)/g;

  if (rogueImportRegex.test(content) || rogueRequireRegex.test(content)) {
    console.error(`\x1b[31m[GATE ENFORCEMENT FAIL]\x1b[0m Kaçak yapay zeka istemcisi bulundu!`);
    console.error(`\x1b[33mDosya:\x1b[0m ${filePath}`);
    console.error(`\x1b[36mKural:\x1b[0m "invokeAgent" veya "alohaAI" dışında doğrudan GoogleGenAI kullanımı yasaktır (Sovereign Anayasası).\n`);
    hasErrors = true;
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else {
      checkFile(fullPath);
    }
  }
}

console.log('[GATE ENFORCEMENT] Sovereign AI kilitleri taranıyor...');

SEARCH_DIRS.forEach(scanDir);

if (hasErrors) {
  console.error(`\x1b[31m[FATAL ERROR]\x1b[0m Sovereign Gate kural ihlali nedeniyle build durduruldu.`);
  process.exit(1);
} else {
  console.log(`\x1b[32m[GATE ENFORCEMENT PASS]\x1b[0m Tüm sistemler Sovereign Gateway üzerinden geçiyor.`);
  process.exit(0);
}

const fs = require('fs');
const path = require('path');

const WHITELIST = [
  path.join(__dirname, '../src/core/aloha/aiClient.ts'),
  path.join(__dirname, '../packages/aloha-sdk'),
];

const SEARCH_DIRS = [
  path.join(__dirname, '../src'),
];

function isWhitelisted(filePath) {
  return WHITELIST.some(whitelistPath => filePath.startsWith(whitelistPath));
}

function calculateRelativePath(fromPath, toPath) {
  let relative = path.relative(path.dirname(fromPath), toPath).replace(/\\/g, '/');
  if (!relative.startsWith('.')) relative = './' + relative;
  if (relative.endsWith('.ts')) relative = relative.slice(0, -3);
  return relative;
}

function fixFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  if (isWhitelisted(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  const rogueImportRegex = /import\s+\{([^}]*?)GoogleGenAI([^}]*?)\}\s+from\s+['"]@google\/genai['"];?/g;
  const requireRegex = /const\s+\{([^}]*?)GoogleGenAI([^}]*?)\}\s+=\s+require\(['"]@google\/genai['"]\);?/g;
  const newInstanceRegex1 = /new\s+GoogleGenAI\(\s*\{\s*apiKey[^}]*\}\s*\)/g;
  const newInstanceRegex2 = /new\s+GoogleGenAI\([^)]*\)/g;

  if (rogueImportRegex.test(content) || newInstanceRegex1.test(content) || newInstanceRegex2.test(content)) {
    console.log(`Fixing: ${filePath}`);
    
    // Replace import
    // Determine relative path to src/core/aloha/aiClient
    const aiClientPath = path.join(__dirname, '../src/core/aloha/aiClient.ts');
    let importPath = '@/core/aloha/aiClient'; // Next.js alias

    content = content.replace(rogueImportRegex, `import { alohaAI } from '${importPath}';\n// removed GoogleGenAI import`);
    content = content.replace(requireRegex, `const { alohaAI } = require('${importPath}');`);

    // Add import if missing and we are replacing instances
    if (!content.includes(`import { alohaAI }`) && !content.includes(`const { alohaAI }`)) {
       content = `import { alohaAI } from '${importPath}';\n` + content;
    }

    // Replace instances
    content = content.replace(newInstanceRegex1, `alohaAI.getClient()`);
    content = content.replace(newInstanceRegex2, `alohaAI.getClient()`);

    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else {
      fixFile(fullPath);
    }
  }
}

console.log('Fixing Rogue AI instances...');
SEARCH_DIRS.forEach(scanDir);
console.log('Done.');

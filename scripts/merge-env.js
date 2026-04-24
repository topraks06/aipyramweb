const fs = require('fs');
const path = require('path');

const perdeEnvPath = 'D:\\perde.ai\\.env';
const localEnvPath = 'c:\\Users\\MSI\\Desktop\\aipyramweb\\.env.local';
const prodEnvPath = 'c:\\Users\\MSI\\Desktop\\aipyramweb\\.env.production';
const rootEnvPath = 'c:\\Users\\MSI\\Desktop\\aipyramweb\\.env';

const perdeEnv = fs.readFileSync(perdeEnvPath, 'utf8');
const keysToAdd = [];

// Extract keys to add
const extract = (keyName) => {
  const match = perdeEnv.match(new RegExp(`^${keyName}=(.*)$`, 'm'));
  if (match) keysToAdd.push(`${keyName}=${match[1]}`);
}

extract('SUPABASE_URL');
extract('SUPABASE_SERVICE_ROLE_KEY');
extract('GEMINI_DESIGN_MODEL');
extract('GEMINI_CHAT_MODEL');
extract('GEMINI_IMAGE_MODEL');

const block = '\n# ═══════════════════════════════════════════════════════════\n# 🏗️ SUPABASE & MODEL OVERRIDES (from D:\\perde.ai)\n# ═══════════════════════════════════════════════════════════\n' + keysToAdd.join('\n') + '\n';

fs.appendFileSync(localEnvPath, block);
fs.appendFileSync(prodEnvPath, block);
fs.appendFileSync(rootEnvPath, block);

console.log('Merged successfully!');

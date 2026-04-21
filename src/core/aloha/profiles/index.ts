import * as fs from 'fs';
import * as path from 'path';

export { TRTEX_PROFILE } from './trtex-profile';
export { HOMETEX_PROFILE } from './hometex-profile';
export { PERDE_PROFILE } from './perde-profile';
export { REALESTATE_PROFILE } from './realestate-profile';

import { TRTEX_PROFILE } from './trtex-profile';
import { HOMETEX_PROFILE } from './hometex-profile';
import { PERDE_PROFILE } from './perde-profile';
import { REALESTATE_PROFILE } from './realestate-profile';

const BASE_DIR = "C:/Users/MSI/Desktop/projeler zip";

function safeReadFile(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {}
  return null;
}

export const getProfileForProject = async (projectName: string): Promise<string> => {
  const norm = projectName.toLowerCase();
  
  let baseProfile = `
INDUSTRY FOCUS: General Artificial Intelligence, Next-Gen Solutions, B2B.
TONE: Visionary, Technological, Professional.
  `;

  if (norm.includes('hometex')) baseProfile = HOMETEX_PROFILE;
  else if (norm.includes('perde')) baseProfile = PERDE_PROFILE;
  else if (norm.includes('trtex')) baseProfile = TRTEX_PROFILE;
  else if (norm.includes('didim') || norm.includes('fethiye') || norm.includes('kalkan') || 
           norm.includes('emlak') || norm.includes('satilik') || norm.includes('ultrarent') || norm.includes('immobiliens')) {
    baseProfile = REALESTATE_PROFILE;
  }

  // Dinamik Klasör Taraması (Kardeşin Zekası)
  const projectPath = path.join(BASE_DIR, projectName);
  let dynamicContext = "";

  if (fs.existsSync(projectPath)) {
    dynamicContext += `\n\n[🚀 ALOHA OTONOM BİLGİ AĞI - DOSYA TARAMA SONUÇLARI - ${projectName.toUpperCase()}]\n`;
    
    // Temel dosyalar
    const possibleDocs = [
      "AGENTS.md", 
      "README.md", 
      "kurallar.md", 
      ".agent/rules/kurallar.md",
      ".agents/rules/kurallar.md",
      "PIPELINE.md",
      "CHECKLIST.md"
    ];

    for (const doc of possibleDocs) {
      const content = safeReadFile(path.join(projectPath, doc));
      if (content) {
        dynamicContext += `\n--- SOURCE: ${doc} ---\n${content.substring(0, 3000)}\n`;
      }
    }

    // Skill dosyaları taraması
    const skillDirs = [
      path.join(projectPath, ".agent/skills"),
      path.join(projectPath, ".agents/skills"),
      path.join(projectPath, ".gemini/artifacts")
    ];

    for (const sDir of skillDirs) {
      if (fs.existsSync(sDir)) {
        try {
          const items = fs.readdirSync(sDir, { withFileTypes: true });
          for (const item of items) {
            if (item.isFile() && item.name.endsWith('.md')) {
              const skillContent = safeReadFile(path.join(sDir, item.name));
              if (skillContent) {
                dynamicContext += `\n--- SKILL: ${item.name} ---\n${skillContent.substring(0, 2000)}\n`;
              }
            } else if (item.isDirectory()) { // Bir alt klasöre de bak (örn: perde-ai-studio)
                const subDir = path.join(sDir, item.name);
                const subItems = fs.readdirSync(subDir, { withFileTypes: true });
                for (const subItem of subItems) {
                    if (subItem.isFile() && subItem.name.endsWith('.md')) {
                        const subContent = safeReadFile(path.join(subDir, subItem.name));
                        if (subContent) {
                            dynamicContext += `\n--- SUBSKILL: ${item.name}/${subItem.name} ---\n${subContent.substring(0, 1500)}\n`;
                        }
                    }
                }
            }
          }
        } catch (e) {}
      }
    }
  }

  return baseProfile + dynamicContext;
};

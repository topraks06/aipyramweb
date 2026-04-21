const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const swarmDir = path.join(srcDir, 'core', 'swarm');
const alohaDir = path.join(srcDir, 'core', 'aloha');

const files = fs.readdirSync(swarmDir);
const filesToMove = files.filter(f => f.endsWith('.ts') && f !== 'master-agent.ts' && f !== 'system_law.ts');

// Move files
filesToMove.forEach(file => {
  const oldPath = path.join(swarmDir, file);
  const newPath = path.join(alohaDir, file);
  if (!fs.existsSync(newPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file}`);
  }
});

// Process files to repair imports
function walkAndReplace(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory() && !res.includes('node_modules') && !res.includes('.next')) {
      walkAndReplace(res);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      let content = fs.readFileSync(res, 'utf8');
      
      // If this file is now in alohaDir, it needs to fix internal relative paths pointing to things that stayed in swarm
      const isNowInAloha = res.startsWith(alohaDir);

      let newContent = content;

      // 1. Replace absolute aliases like @/core/swarm/FILE
      newContent = newContent.replace(/@\/core\/swarm\/([^'"]+)/g, (match, fileName) => {
        if (fileName === 'master-agent' || fileName === 'system_law') return match;
        return `@/core/aloha/${fileName}`;
      });

      // 2. Replace sibling imports mapping to swarm from OUTSIDE swarm (e.g. ../swarm/FILE or ../../swarm/FILE)
      newContent = newContent.replace(/(\.\.\/)+swarm\/([^'"]+)/g, (match, dots, fileName) => {
        if (fileName === 'master-agent' || fileName === 'system_law') return match;
        return match.replace('swarm', 'aloha');
      });

      // 3. If file is now in Aloha, fix references to master-agent.ts which stayed in Swarm!
      if (isNowInAloha) {
        newContent = newContent.replace(/['"]\.\/master-agent['"]/g, "'../swarm/master-agent'");
        newContent = newContent.replace(/['"]\.\/system_law['"]/g, "'../swarm/system_law'");
      } else if (res.startsWith(swarmDir)) {
          // If file is master-agent in swarm, and it imports e.g. './imageAgent', it now needs to point to '../aloha/imageAgent'
          newContent = newContent.replace(/from\s+['"]\.\/([^'"]+)['"]/g, (match, fileName) => {
              if (fileName !== 'master-agent' && fileName !== 'system_law' && !fileName.includes('/')) {
                  return `from '../aloha/${fileName}'`;
              }
              return match;
          });
      }
      
      if (content !== newContent) {
        fs.writeFileSync(res, newContent, 'utf8');
        console.log(`Updated imports in ${res}`);
      }
    }
  }
}

walkAndReplace(srcDir);

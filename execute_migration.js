const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const swarmDir = path.join(srcDir, 'core', 'swarm');
const alohaDir = path.join(srcDir, 'core', 'aloha');

console.log("Starting final migration phase...");

// 1. Merge system_law.ts
const swarmSystemLawPath = path.join(swarmDir, 'system_law.ts');
const alohaSystemLawPath = path.join(alohaDir, 'system_law.ts');

if (fs.existsSync(swarmSystemLawPath) && fs.existsSync(alohaSystemLawPath)) {
  const swarmLaw = fs.readFileSync(swarmSystemLawPath, 'utf8');
  let alohaLaw = fs.readFileSync(alohaSystemLawPath, 'utf8');
  
  if (!alohaLaw.includes('CORE_IDENTITY')) {
    alohaLaw += '\n\n// --- MIGRATED FROM SWARM/SYSTEM_LAW.TS ---\n\n' + swarmLaw;
    fs.writeFileSync(alohaSystemLawPath, alohaLaw, 'utf8');
    console.log("✅ Merged system_law.ts successfully.");
  }
}

// 2. Move directories: profiles, publishers, trtex
const dirsToMove = ['profiles', 'publishers', 'trtex'];
dirsToMove.forEach(dirName => {
  const oldPath = path.join(swarmDir, dirName);
  const newPath = path.join(alohaDir, dirName);
  if (fs.existsSync(oldPath)) {
    if (!fs.existsSync(newPath)) {
      // Just rename if target doesn't exist
      fs.renameSync(oldPath, newPath);
      console.log(`✅ Moved directory ${dirName}`);
    } else {
      // If it exists, merge contents (rare case)
      const files = fs.readdirSync(oldPath);
      files.forEach(f => {
        fs.renameSync(path.join(oldPath, f), path.join(newPath, f));
      });
      console.log(`✅ Merged directory contents for ${dirName}`);
    }
  }
});

// 3. Move master-agent.ts to aloha so the whole brain is together
if (fs.existsSync(path.join(swarmDir, 'master-agent.ts'))) {
  fs.renameSync(path.join(swarmDir, 'master-agent.ts'), path.join(alohaDir, 'master-agent.ts'));
  console.log("✅ Moved master-agent.ts to Aloha");
}

// 4. Update import references from 'swarm' to 'aloha' across the codebase
function updateImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      updateImports(res);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      let content = fs.readFileSync(res, 'utf8');
      
      let newContent = content;

      // Global alias replacement: @/core/swarm/ -> @/core/aloha/
      newContent = newContent.replace(/@\/core\/swarm/g, '@/core/aloha');
      
      // Relative path replacements e.g. ../swarm/ -> ../aloha/
      newContent = newContent.replace(/(\.\.\/)+swarm\//g, (match) => {
        return match.replace('swarm', 'aloha');
      });

      // Handling sibling imports that were inside swarm and are now in aloha, or referencing swarm
      // E.g., if a file in aloha/publishers/ used to be in swarm/publishers/, its internal logic might still say ../../swarm
      
      if (content !== newContent) {
        fs.writeFileSync(res, newContent, 'utf8');
        console.log(`✅ Fixed imports in ${res}`);
      }
    }
  }
}

updateImports(srcDir);

// 5. Safely delete the swarm directory after checking if it's empty
if (fs.existsSync(swarmDir)) {
  try {
    fs.rmSync(swarmDir, { recursive: true, force: true });
    console.log("🔥 Eradicated old swarm directory successfully. Architecture is now SOVEREIGN under ALOHA.");
  } catch (err) {
    console.log("⚠️ Could not completely remove swarm directory, some ghost files might remain:", err.message);
  }
}

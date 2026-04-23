const fs = require('fs');
const path = require('path');

function fixMissingType(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixMissingType(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // If file contains 'Type.' or 'Schema' but does NOT import them
      const usesType = /\bType\./.test(content);
      const usesSchema = /\bSchema\b/.test(content);
      
      if (usesType || usesSchema) {
        const hasImport = /import\s+{[^}]*(Type|Schema)[^}]*}\s+from\s+['"]@google\/genai['"]/.test(content);
        
        if (!hasImport) {
          console.log("Restoring import in:", fullPath);
          content = `import { Schema, Type } from "@google/genai";\n` + content;
          fs.writeFileSync(fullPath, content, 'utf-8');
        }
      }
    }
  }
}

console.log("Starting restore...");
fixMissingType(path.join(__dirname, '../src'));
console.log("Done.");

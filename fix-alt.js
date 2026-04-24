const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  let totalFixed = 0;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      totalFixed += processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Simple string manipulation
      let currentIndex = 0;
      while (true) {
        const imgIndex = content.indexOf('<img', currentIndex);
        if (imgIndex === -1) break;

        // Find the end of the img tag. It might have arrow functions, so let's find the first `>` that has the same level of `{}`
        // For simplicity, just find the next `/>` or `>`
        let endTagIndex = imgIndex;
        let braceCount = 0;
        let foundEnd = false;
        
        while (endTagIndex < content.length) {
           if (content[endTagIndex] === '{') braceCount++;
           else if (content[endTagIndex] === '}') braceCount--;
           else if (content[endTagIndex] === '>' && braceCount === 0) {
              foundEnd = true;
              break;
           }
           endTagIndex++;
        }

        if (foundEnd) {
           const imgTagStr = content.substring(imgIndex, endTagIndex + 1);
           if (!imgTagStr.includes('alt=')) {
              // add alt="Görsel" right after <img
              const replacedTag = imgTagStr.replace('<img', '<img alt="AIPyram Görsel"');
              content = content.substring(0, imgIndex) + replacedTag + content.substring(endTagIndex + 1);
              changed = true;
           }
        }
        
        currentIndex = imgIndex + 4; // move past the `<img`
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[FIXED] ${fullPath}`);
        totalFixed++;
      }
    }
  }
  return totalFixed;
}

const total = processDir(path.join(__dirname, 'src'));
console.log(`Toplam ${total} dosya düzeltildi.`);

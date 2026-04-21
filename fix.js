const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    // We are looking for: apiKey: process.env.GEMINI_API_KEY (with or without '}' next to it)
    let dirty = false;
    
    // Pattern 1: apiKey: process.env.GEMINI_API_KEY }
    const p1 = /apiKey:\s*process\.env\.GEMINI_API_KEY\s*\}/g;
    if (p1.test(content)) {
        content = content.replace(p1, 'apiKey: process.env.GEMINI_API_KEY || "dummy" }');
        dirty = true;
    }
    
    // Pattern 2: apiKey: process.env.GEMINI_API_KEY\n
    const p2 = /apiKey:\s*process\.env\.GEMINI_API_KEY(\s*,|\s*\n)/g;
    if (p2.test(content)) {
        content = content.replace(p2, 'apiKey: process.env.GEMINI_API_KEY || "dummy"$1');
        dirty = true;
    }

    // Pattern 3: .env.GEMINI_API_KEY as string literal in new GoogleGenAI(...) Without apiKey object
    // Usually it accepts object. If passed directly? The new API needs object.

    if (dirty) {
        fs.writeFileSync(f, content);
        console.log("Fixed:", f);
    }
});

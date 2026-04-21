import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY;
const IMG_DIR = "c:\\Users\\MSI\\Desktop\\aipyramweb\\public\\assets\\perde.ai";

async function analyzeImage(filePath) {
    const fileName = path.basename(filePath);
    const mimeType = fileName.toLowerCase().endsWith('png') ? 'image/png' : 'image/jpeg';
    const base64Data = fs.readFileSync(filePath).toString("base64");

    const payload = {
        contents: [{
            parts: [
                { text: "Describe this image in a very short sentence. If it's a curtain, mention the style. If it's a room, mention the type of room. Is it an architectural rendering, a close-up of fabric, or a UI mockup?" },
                { inlineData: { mimeType: mimeType, data: base64Data } }
            ]
        }]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        console.error(`Failed to analyze ${fileName}: ${res.statusText}`);
        return "Error";
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No description";
}

async function main() {
    console.log("Analyzing images...");
    const files = fs.readdirSync(IMG_DIR).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
    const results = {};

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(IMG_DIR, file);
        console.log(`[${i+1}/${files.length}] Analyzing ${file}...`);
        try {
            const desc = await analyzeImage(filePath);
            results[file] = desc;
        } catch (e) {
            results[file] = "Failed: " + e.message;
        }
        // sleep a bit to avoid rate limit
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync(path.join(IMG_DIR, "image_descriptions.json"), JSON.stringify(results, null, 2));
    console.log("Analysis complete. Saved to image_descriptions.json");
}

main();

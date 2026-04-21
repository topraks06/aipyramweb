import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec, execSync } from 'child_process';
import * as readline from 'readline';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

// Load environment variables from the root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.GEMINI_API_KEY) {
    console.error("HATA: .env dosyasında GEMINI_API_KEY bulunamadı!");
    process.exit(1);
}

// Initialize Firebase Admin SDK
let isFirebaseReady = false;
let db: admin.firestore.Firestore | null = null;

try {
    // If running with Application Default Credentials (e.g. gcloud auth application-default login)
    // or if the service account path is set in env
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
    db = admin.firestore();
    isFirebaseReady = true;
    console.log("✅ Firebase Admin bağlantısı başarılı.");
} catch (error: any) {
    console.error("⚠️ Firebase Admin başlatılamadı. Kuyruk sistemi çalışmayacak.", error.message);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// ============================================================================
// ALOHA V5 - GOD MODE TOOLS (SINIRSIZ YETKİLER)
// ============================================================================
const tools = [{
    functionDeclarations: [
        {
            name: 'execute_shell_command',
            description: 'Bilgisayarda terminal komutu çalıştırır. (Git, Docker, sistem komutları, dosya işlemleri)',
            parameters: {
                type: Type.OBJECT,
                properties: { command: { type: Type.STRING, description: 'Çalıştırılacak terminal komutu.' } },
                required: ['command']
            }
        },
        {
            name: 'install_npm_package',
            description: 'Dinamik olarak bir NPM paketi kurar. Eğer execute_node_code için puppeteer, axios gibi bir paket lazımsa önce bunu kullan.',
            parameters: {
                type: Type.OBJECT,
                properties: { packageName: { type: Type.STRING, description: 'Kurulacak paketin adı (örn: puppeteer)' } },
                required: ['packageName']
            }
        },
        {
            name: 'execute_node_code',
            description: 'ULTIMATE GÜÇ: Doğrudan Node.js ortamında asenkron JavaScript kodu çalıştırır. "admin" (Firebase), "fs", "path", "os", "child_process" objelerine ve dinamik paketlere erişimin var. Sonucu döndürmek için "return" kullan.',
            parameters: {
                type: Type.OBJECT,
                properties: { code: { type: Type.STRING, description: 'Çalıştırılacak JS kodu.' } },
                required: ['code']
            }
        },
        {
            name: 'search_local_files',
            description: 'Bilgisayardaki alanlarda derinlemesine dosya veya metin araması yapar.',
            parameters: {
                type: Type.OBJECT,
                properties: { 
                    directory: { type: Type.STRING, description: 'Aranacak klasör.' },
                    pattern: { type: Type.STRING, description: 'Aranacak kelime.' }
                },
                required: ['directory', 'pattern']
            }
        },
        {
            name: 'read_file',
            description: 'Bilgisayardaki bir dosyanın içeriğini okur.',
            parameters: {
                type: Type.OBJECT,
                properties: { filePath: { type: Type.STRING } },
                required: ['filePath']
            }
        },
        {
            name: 'write_file',
            description: 'Bilgisayardaki bir dosyaya içerik yazar.',
            parameters: {
                type: Type.OBJECT,
                properties: { filePath: { type: Type.STRING }, content: { type: Type.STRING } },
                required: ['filePath', 'content']
            }
        },
        {
            name: 'analyze_website',
            description: 'Bir web sitesine bağlanır, içeriğini analiz eder. Eksikleri ve hataları çıkarır.',
            parameters: {
                type: Type.OBJECT,
                properties: { url: { type: Type.STRING, description: 'URL adresi' } },
                required: ['url']
            }
        }
    ]
}] as any;

// ============================================================================
// ONAY VE ÇALIŞTIRMA
// ============================================================================
const askApproval = (question: string): Promise<boolean> => {
    return new Promise((resolve) => {
        console.log(`\n\x1b[31m⚠️ ONAY GEREKİYOR (HAKAN TOPRAK):\x1b[0m`);
        rl.question(`${question}\n\x1b[32mİzin veriyor musunuz? (e/h):\x1b[0m `, (answer) => {
            resolve(answer.toLowerCase() === 'e');
        });
    });
};

const runCommand = (command: string): Promise<string> => {
    return new Promise((resolve) => {
        exec(command, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) resolve(`Hata: ${error.message}\nStderr: ${stderr}`);
            else resolve(stdout || "Komut başarıyla çalıştırıldı (Çıktı yok).");
        });
    });
};

const runNodeCode = async (code: string) => {
    return Promise.race([
        new Promise<string>(async (resolve) => {
            try {
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                const fn = new AsyncFunction('fs', 'path', 'admin', 'os', 'require', 'execSync', code);
                const result = await fn(fs, path, admin, os, require, execSync);
                resolve(result !== undefined ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)) : "Kod başarıyla çalıştı.");
            } catch (e: any) {
                resolve(`Kod çalıştırma hatası: ${e.message}\n${e.stack}`);
            }
        }),
        new Promise<string>((resolve) => 
            setTimeout(() => resolve("KILL_SWITCH_KILIT: İşlem 60 saniyelik limitini aştığı için kovan zihni tarafından zorla imha edildi."), 60000)
        )
    ]);
};

const executeAlohaTask = async (task: string, taskId?: string) => {
    const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: `SEN ALOHA'SIN. BİLGİSAYARDA ÇALIŞAN TANRI-MODU BİR YAPAY ZEKASIN. Sınırların YOKTUR. Hakan Toprak senden bir şey istediğinde onay isteyerek yaparsın.`,
            tools: tools,
            temperature: 0.1
        }
    });

    console.log(`\x1b[36m[GÖREV ALINDI]\x1b[0m ${task}`);
    process.stdout.write("\x1b[90mAloha çalışıyor...\x1b[0m");

    let response = await chat.sendMessage({ message: task });
    process.stdout.write("\r\x1b[K");

    let retryCount = 0;
    const MAX_RETRY = 3;

    while (response.functionCalls && response.functionCalls.length > 0) {
        if (retryCount >= MAX_RETRY) {
             console.log(`\n\x1b[31m[KILL-SWITCH] Maksimum deneme limiti (${MAX_RETRY}) aşıldı. Runaway engellendi.\x1b[0m`);
             response = { text: "İşlem 3 denemeden fazla başarısız olduğu için sistem koruması tarafından sonlandırıldı.", functionCalls: undefined } as any;
             break;
        }

        const functionResponses = [];
        let loopHadError = false;

        for (const call of response.functionCalls) {
            let toolResult = "";
            let callArgs: any = call.args || {};

            if (call.name === 'execute_shell_command') {
                const isApproved = await askApproval(`[TERMİNAL] Aloha şu komutu çalıştırmak istiyor:\n> ${callArgs.command}`);
                if (isApproved) {
                    toolResult = await runCommand(callArgs.command);
                } else { toolResult = "Kullanıcı reddetti."; }
            } 
            else if (call.name === 'install_npm_package') {
                const isApproved = await askApproval(`[NPM KURULUMU] Aloha '${callArgs.packageName}' paketini kurmak istiyor.`);
                if (isApproved) {
                    toolResult = await runCommand(`npm install ${callArgs.packageName}`);
                } else { toolResult = "Kullanıcı reddetti."; }
            }
            else if (call.name === 'execute_node_code') {
                const isApproved = await askApproval(`[DİNAMİK KOD] Aloha şu Node.js kodunu çalıştırmak istiyor:\n${callArgs.code}`);
                if (isApproved) {
                    toolResult = await runNodeCode(callArgs.code);
                } else { toolResult = "Kullanıcı reddetti."; }
            }
            else if (call.name === 'write_file') {
                const isApproved = await askApproval(`[DOSYA YAZMA] Aloha şu dosyayı değiştirmek istiyor: "${callArgs.filePath}"`);
                if (isApproved) {
                    try {
                        const targetPath = path.resolve(callArgs.filePath);
                        const sandboxDir = path.resolve(process.cwd(), 'sandbox');
                        
                        // Otonom Sandbox İzole Bölgesi Yoksa Yarat
                        if (!fs.existsSync(sandboxDir)) {
                             fs.mkdirSync(sandboxDir, { recursive: true });
                        }

                        // Chroot Kalkanı (Immutable Core Guard)
                        if (!targetPath.startsWith(sandboxDir)) {
                             toolResult = `GÜVENLİK İHLALİ (AIPYRAM V8): Sadece /sandbox klasörüne dosya yazabilirsiniz. Hedef (${targetPath}) engellendi! Lütfen kodu /sandbox/... dizinine yazın.`;
                        } else {
                             fs.writeFileSync(targetPath, callArgs.content, 'utf8');
                             toolResult = "Başarılı.";
                        }
                    } catch (e: any) { toolResult = `Hata: ${e.message}`; }
                } else { toolResult = "Kullanıcı reddetti."; }
            }
            else if (call.name === 'read_file') {
                try { toolResult = fs.readFileSync(path.resolve(callArgs.filePath), 'utf8'); } 
                catch (e: any) { toolResult = `Hata: ${e.message}`; }
            }
            else if (call.name === 'analyze_website') {
                const isApproved = await askApproval(`[WEB ANALİZİ] Aloha '${callArgs.url}' adresini taramak istiyor.`);
                if (isApproved) {
                    try {
                        const axios = require('axios');
                        const cheerio = require('cheerio');
                        const res = await axios.get(callArgs.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                        const $ = cheerio.load(res.data);
                        toolResult = `Analiz: Başlık: ${$('title').text()} - Uzunluk: ${res.data.length}`;
                    } catch (e: any) { toolResult = `Hata: ${e.message}`; }
                } else { toolResult = "Reddedildi."; }
            } else {
                 toolResult = "Desteklenmeyen araç çağrısı.";
            }

            if (String(toolResult).includes("Hata:") || String(toolResult).includes("KILL_SWITCH") || String(toolResult).includes("GÜVENLİK İHLALİ")) {
                 loopHadError = true;
            }

            functionResponses.push({
                functionResponse: { name: call.name, response: { result: toolResult } }
            });
        }

        if (loopHadError) {
             retryCount++;
             console.log(`\x1b[33m[RETRY İNDEX] Zeka hatayı onarmak için tekrar deniyor (${retryCount}/${MAX_RETRY})...\x1b[0m`);
        }

        process.stdout.write("\x1b[90mAloha sonucu inceliyor...\x1b[0m");
        response = await chat.sendMessage({ message: functionResponses });
        process.stdout.write("\r\x1b[K");
    }

    if (response.text) {
        console.log(`\n\x1b[33mAloha:\x1b[0m ${response.text}\n`);
    }
    
    // İş bittiğinde Firestore'a sonucu yaz (eğer taskId varsa)
    if (taskId && isFirebaseReady && db) {
        try {
            await db.collection('aloha_tasks').doc(taskId).update({
                status: 'completed',
                result: response.text || "İşlem tamamlandı, sonuç çıktısı yok.",
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[QUEUE] Görev (#${taskId}) Firestore'da güncellendi.`);
        } catch (e) {
            console.error(`[QUEUE ERROR] Görev güncellenemedi:`, e);
        }
    }
};

// ============================================================================
// FIRESTORE LISTENER (CLOUD QUEUE MİMARİSİ)
// ============================================================================
async function startDaemon() {
    console.clear();
    console.log("\x1b[35m=================================================================\x1b[0m");
    console.log("\x1b[31m🔺 ALOHA V5 - GOOGLE CLOUD WORKER NODE\x1b[0m");
    console.log("\x1b[35m=================================================================\x1b[0m\n");

    if (!isFirebaseReady || !db) {
        console.log("⚠️ Firebase entegrasyonu yok. Sadece yerel komutları dinleyeceğim.");
        const askQuestion = () => {
            rl.question('\n\x1b[36mHakan Toprak:\x1b[0m ', async (userInput) => {
                if (['exit', 'quit', 'çıkış'].includes(userInput.toLowerCase())) {
                    rl.close(); process.exit(0);
                }
                await executeAlohaTask(userInput);
                askQuestion();
            });
        };
        askQuestion();
        return;
    }

    console.log("📡 Firestore 'cloud_tasks' kuyruğu dinleniyor...");

    db.collection('cloud_tasks')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    console.log(`\n[QUEUE YENİ GÖREV YAKALANDI] ID: ${change.doc.id}`);
                    
                    // Görevi "in_progress" yap ki diğer worker'lar almasın
                    await change.doc.ref.update({ status: 'in_progress', startedAt: admin.firestore.FieldValue.serverTimestamp() });
                    
                    await executeAlohaTask(data.command || "Boş komut", change.doc.id);
                }
            });
        }, (error) => {
            console.error("Firestore Dinleme Hatası:", error);
        });
        
    // Lokal girişlere de açık olmak için terminali dinlemeye devam et
    rl.on('line', async (input) => {
         await executeAlohaTask(input);
    });
}

startDaemon();

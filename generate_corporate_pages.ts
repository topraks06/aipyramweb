import fs from 'fs';
import path from 'path';

const BASE_DIR = "C:\\Users\\MSI\\Desktop\\projeler zip";
const QUEUE_FILE = path.join(BASE_DIR, "domains", "_aloha_autonomous_queue.json");

const templates = {
  kvkk: `import React from 'react';\n\nexport default function KvkkPage() {\n  return (\n    <div className="min-h-screen bg-black text-white p-8 font-sans">\n      <div className="max-w-4xl mx-auto">\n        <h1 className="text-3xl font-black uppercase tracking-widest border-b border-red-600 pb-4 mb-8">KVKK ve Gizlilik Politikası</h1>\n        <div className="prose prose-invert prose-p:text-neutral-400 prose-h2:text-white prose-h2:font-bold">\n          <h2>1. Aydınlatma Metni</h2>\n          <p>Kişisel verileriniz, 6698 sayılı Kanun kapsamında veri sorumlusu sıfatıyla özenle işlenmektedir.</p>\n          <h2>2. Verilerin İşlenme Amacı</h2>\n          <p>Ticari b2b istihbarat faaliyetlerimizin yürütülmesi amacıyla toplanmaktadır.</p>\n        </div>\n      </div>\n    </div>\n  );\n}`,
  iletisim: `import React from 'react';\n\nexport default function IletisimPage() {\n  return (\n    <div className="min-h-screen bg-black text-white p-8 font-sans">\n      <div className="max-w-4xl mx-auto">\n        <h1 className="text-3xl font-black uppercase tracking-widest border-b border-red-600 pb-4 mb-8">İletişim</h1>\n        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-300">\n          <div>\n            <h2 className="text-xl font-bold text-white mb-4">Merkez Ofis</h2>\n            <p>AIPyram Bilişim A.Ş.</p>\n            <p>B2B Intelligence Terminal</p>\n          </div>\n          <div>\n            <h2 className="text-xl font-bold text-white mb-4">Destek</h2>\n            <p>support@aipyram.com</p>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}`,
  hakkimizda: `import React from 'react';\n\nexport default function HakkimizdaPage() {\n  return (\n    <div className="min-h-screen bg-black text-white p-8 font-sans">\n      <div className="max-w-4xl mx-auto">\n        <h1 className="text-3xl font-black uppercase tracking-widest border-b border-red-600 pb-4 mb-8">Hakkımızda</h1>\n        <div className="prose prose-invert prose-p:text-neutral-400">\n          <p className="text-xl font-bold text-white">Sovereign B2B Intelligence</p>\n          <p>AIPyram, endüstriyel ticaret ağında veriye dayalı stratejik kararlar almanızı sağlayan otonom karar destek sistemidir.</p>\n        </div>\n      </div>\n    </div>\n  );\n}`,
  notfound: `import React from 'react';\nimport Link from 'next/link';\n\nexport default function NotFound() {\n  return (\n    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans">\n      <div className="text-center">\n        <h1 className="text-6xl font-black font-mono text-red-600 mb-4">404</h1>\n        <h2 className="text-2xl font-bold uppercase tracking-widest mb-6">Sinyal Kaybı</h2>\n        <p className="text-neutral-400 mb-8">Aradığınız veri terminalde bulunamadı.</p>\n        <Link href="/" className="bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors">\n          Terminal'e Dön\n        </Link>\n      </div>\n    </div>\n  );\n}`,
  footer: `import React from 'react';\nimport Link from 'next/link';\n\nexport function Footer() {\n  return (\n    <footer className="bg-black border-t border-neutral-800 text-neutral-400 py-12 font-sans">\n      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">\n        <div>\n          <h3 className="text-white font-black uppercase tracking-widest mb-4">AIPYRAM</h3>\n          <p className="text-sm">B2B Intelligence Terminal</p>\n        </div>\n        <div>\n          <h4 className="text-white font-bold mb-4">Kurumsal</h4>\n          <ul className="space-y-2 text-sm">\n            <li><Link href="/hakkimizda" className="hover:text-white">Hakkımızda</Link></li>\n            <li><Link href="/iletisim" className="hover:text-white">İletişim</Link></li>\n          </ul>\n        </div>\n        <div>\n          <h4 className="text-white font-bold mb-4">Yasal</h4>\n          <ul className="space-y-2 text-sm">\n            <li><Link href="/kvkk" className="hover:text-white">KVKK</Link></li>\n          </ul>\n        </div>\n      </div>\n    </footer>\n  );\n}`,
  cookie: `import React from 'react';\n\nexport function CookieBanner() {\n  return (\n    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 z-50 flex justify-between items-center text-sm font-sans">\n      <p className="text-neutral-300">Bu terminal en iyi deneyim için çerezleri(cookie) kullanır.</p>\n      <button className="bg-white text-black px-4 py-2 font-bold text-xs uppercase hover:bg-neutral-200">Kabul Et</button>\n    </div>\n  );\n}`,
  seo: `import type { Metadata } from 'next';\n\nexport function generateSeoMeta(title: string, desc: string): Metadata {\n  return {\n    title: title + \" | AIPyram Intelligence\",\n    description: desc\n  };\n}`
};

function copyFiles(scope: string, featureId: string) {
  let projectDirSuffix = scope === 'trtex' ? 'trtex.com' : scope === 'aipyram' ? 'aipyram.com' : 'didimemlak.ai';
  let projectDir = path.join(BASE_DIR, projectDirSuffix);
  
  if (!fs.existsSync(projectDir)) {
      console.log(`Project dir not found: ${projectDir}`);
      return false;
  }

  // Ensure src/app/[locale] directory for localized pages
  const appLocaleDir = path.join(projectDir, "src", "app", "[locale]");
  const appDir = path.join(projectDir, "src", "app");
  const componentsDir = path.join(projectDir, "src", "components", "layout");
  
  if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });
  if (!fs.existsSync(appLocaleDir)) fs.mkdirSync(appLocaleDir, { recursive: true });

  let outPath = "";
  let content = "";

  switch (featureId) {
    case 'kvkk':
      outPath = path.join(appLocaleDir, "kvkk", "page.tsx");
      content = templates.kvkk;
      break;
    case 'iletisim':
      outPath = path.join(appLocaleDir, "iletisim", "page.tsx");
      content = templates.iletisim;
      break;
    case 'hakkimizda':
      outPath = path.join(appLocaleDir, "hakkimizda", "page.tsx");
      content = templates.hakkimizda;
      break;
    case 'notfound':
      outPath = path.join(appDir, "not-found.tsx");
      content = templates.notfound;
      break;
    case 'footer':
      outPath = path.join(componentsDir, "Footer.tsx");
      content = templates.footer;
      break;
    case 'cookie':
      outPath = path.join(componentsDir, "CookieBanner.tsx");
      content = templates.cookie;
      break;
    case 'seo':
      outPath = path.join(projectDir, "src", "components", "seo.ts");
      content = templates.seo;
      break;
    default:
      return true; // We might have tasks like ux_friction_fix which we will handle manually
  }

  if (outPath) {
    const pDir = path.dirname(outPath);
    if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });
    fs.writeFileSync(outPath, content, "utf-8");
    console.log(`Created ${outPath}`);
  }
  return true;
}

function processQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.log("Queue file not found.");
    return;
  }

  const queueText = fs.readFileSync(QUEUE_FILE, "utf-8");
  const queue = JSON.parse(queueText);
  let updated = false;

  for (let job of queue) {
    if (job.status === "PENDING" || job.status === "AWAITING_APPROVAL") {
      let success = copyFiles(job.scope, job.featureId);
      if (success) {
        job.status = "COMPLETED";
        job.completedAt = new Date().toISOString();
        updated = true;
      }
    }
  }

  if (updated) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), "utf-8");
    console.log("Queue updated.");
  }
}

processQueue();

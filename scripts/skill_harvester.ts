import fs from 'fs/promises';
import path from 'path';

// Hasat edilecek hedef ana dizin
const TARGET_DIR = 'C:\\Users\\MSI\\Desktop\\projeler zip';
// Hasat edilen zihinlerin toplanacağı ana AIPyram kütüphanesi
const IMPORT_DIR = path.join(process.cwd(), '.agents', 'skills', 'imported_brains');

async function crawlAndHarvest(currentPath: string) {
  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Eğer bir markanın ajan "skills" klasörüne girdiysek, içindeki .md leri sömür
        if (entry.name === 'skills') {
          const parentDir = path.basename(path.dirname(currentPath)); // örn: hometex.ai , trtex.com
          console.log(`[🌾 HASAT MOTORU] Zengin '.agents/skills' madeni bulundu: [${parentDir}]`);
          
          await harvestMarkdownFiles(fullPath, parentDir);
        } else {
          // Çok derinlere inmemek için klasör taramasına devam et.
          await crawlAndHarvest(fullPath);
        }
      }
    }
  } catch (err: any) {
    // Permission sorunlarını vs es geç
    if (err.code !== 'EPERM' && err.code !== 'EBUSY') {
      console.error(`[❌] Hata okunamadı: ${currentPath} ->`, err.message);
    }
  }
}

async function harvestMarkdownFiles(skillPath: string, projectName: string) {
  const files = await fs.readdir(skillPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.md')) {
      const sourceFile = path.join(skillPath, file.name);
      
      // Aynı isimli dosyaların ezilmemesi için: proje_adi_SKILL.md formatı
      const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const destFile = path.join(IMPORT_DIR, `${safeProjectName}__${safeFileName}`);

      await fs.copyFile(sourceFile, destFile);
      console.log(`  └─ 🚀 [ZİHİN TRANSFERİ] ${file.name} -> ${destFile}`);
    } else if (file.isDirectory()) {
       // İç içe klasörlü skiller varsa onları da döngüye al
       await harvestMarkdownFiles(path.join(skillPath, file.name), `${projectName}_${file.name}`);
    }
  }
}

async function runHarvester() {
  console.log(`\n======================================================`);
  console.log(`[🧠 AIPYRAM BRAIN HARVESTER (Zihin Emici)] Başlıyor...`);
  console.log(`Kaynak Okyanus: ${TARGET_DIR}`);
  console.log(`Hedef Holding Klasörü: ${IMPORT_DIR}`);
  console.log(`======================================================\n`);

  try {
    // Önce kütüphane klasörünü oluştur
    await fs.mkdir(IMPORT_DIR, { recursive: true });
    
    console.log(`[🔎] Sistem tüm projelerinizi ('projeler zip') otonom tarıyor. Bu işlem bi kaç saniye sürebilir...`);
    await crawlAndHarvest(TARGET_DIR);

    console.log(`\n[✅ HASAT TAMAMLANDI] Bütün ajanların 1000 yıllık eğitim dosyaları (SKILL.md) kopyalandı.`);
    console.log(`Artık: agentFactory.ts içinden bu .md dosyaları okunup ajanların beynine Master Prompt olarak pompanalacak!`);
  } catch (error) {
    console.error('Kritik Hata:', error);
  }
}

// Scripti tetikle
runHarvester();

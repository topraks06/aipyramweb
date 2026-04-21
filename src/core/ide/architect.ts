import fs from "fs";
import path from "path";
import { autoLoop } from "./autoLoop";

/**
 * Projenin dizin yapısını okur (sadece klasörler ve dosya adları, kod içerikleri değil).
 * IDE'nin "körü körüne" çalışmak yerine nerede olduğunu bilmesini sağlar.
 */
function loadProjectContext(projectPath: string = process.cwd()): string {
  try {
    const srcPath = path.join(projectPath, "src");
    if (!fs.existsSync(srcPath)) return "src dizini bulunamadı.";

    const exploreDir = (dir: string): string[] => {
      let results: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === "node_modules" || item.name.startsWith(".")) continue;
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          results.push(`[DIR]  ${path.relative(projectPath, fullPath)}/`);
          results = results.concat(exploreDir(fullPath));
        } else {
          // İsteğe bağlı olarak sadece ts/tsx dosyalarını da alabiliriz
          results.push(`[FILE] ${path.relative(projectPath, fullPath)}`);
        }
      }
      return results;
    };

    const tree = exploreDir(srcPath);
    // Token tasarrufu yapmak adına sadece ilk 500 dosya veya yapı gösterilsin
    return tree.slice(0, 500).join("\n");
  } catch (err: any) {
    return `Mevcut proje yapısı okunamadı: ${err.message}`;
  }
}

export async function runTask(task: string, projectPath?: string) {
  console.log(`[🏗️ ARCHITECT] Yeni Task Alındı:\n${task}`);
  
  const targetPath = projectPath || process.cwd();

  // 1. Context yükle
  const context = loadProjectContext(targetPath);
  console.log(`[🏗️ ARCHITECT] Proje haritası (Context) yüklendi. Hedef: ${targetPath}`);

  // 2. Loop Başlat (Max Timeout route'dan yönetilir)
  const result = await autoLoop(task, context, targetPath);

  if (result.success) {
    console.log("[🟢 ARCHITECT] GÖREV BAŞARIYLA TAMAMLANDI");
  } else {
    console.log(`[🔴 ARCHITECT] GÖREV BAŞARISIZ. Son Hata:`, result.error);
  }

  return result;
}
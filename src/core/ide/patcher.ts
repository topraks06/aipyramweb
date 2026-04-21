import fs from "fs";

export function applyPatch(filePath: string, find: string, replace: string) {
  const backup = filePath + ".bak";

  // 1. Dosya var mı?
  if (!fs.existsSync(filePath)) {
     return { success: false, error: "File not found" };
  }

  // 2. Backup al
  fs.copyFileSync(filePath, backup);

  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Güvenlik katmanı: pattern kontrolü (Sessiz hataları önler)
    if (!content.includes(find)) {
        return { success: false, error: "Target code pattern not found in file" };
    }

    content = content.replace(find, replace);

    fs.writeFileSync(filePath, content);

    return { success: true };
  } catch (err: any) {
    // Fail durumunda Rollback
    if (fs.existsSync(backup)) {
        fs.copyFileSync(backup, filePath);
    }
    return { success: false, error: err.message || JSON.stringify(err) };
  }
}

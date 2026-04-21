import fs from 'fs';
import path from 'path';

export interface ScanResult {
  exists: boolean;
  componentCount: number;
  apiRouteCount: number;
  hasSrcApp: boolean;
  error?: string;
}

export function scanProject(projectPath: string): ScanResult {
  try {
    if (!fs.existsSync(projectPath)) {
      return { exists: false, componentCount: 0, apiRouteCount: 0, hasSrcApp: false, error: "Repo klasörü bulunamadı." };
    }

    const srcAppPath = path.join(projectPath, 'src', 'app');
    const componentsPath = path.join(projectPath, 'src', 'components');

    const hasSrcApp = fs.existsSync(srcAppPath);
    
    let componentCount = 0;
    if (fs.existsSync(componentsPath)) {
      componentCount = countFilesRecursively(componentsPath, ['.tsx', '.jsx']);
    }

    let apiRouteCount = 0;
    if (hasSrcApp) {
      apiRouteCount = countFilesRecursively(srcAppPath, ['route.ts', 'route.js']);
    }

    return {
      exists: true,
      hasSrcApp,
      componentCount,
      apiRouteCount
    };
  } catch (err: any) {
    return { exists: false, componentCount: 0, apiRouteCount: 0, hasSrcApp: false, error: err.message };
  }
}

function countFilesRecursively(dir: string, extensions: string[]): number {
  let count = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      count += countFilesRecursively(path.join(dir, file.name), extensions);
    } else {
      const ext = path.extname(file.name);
      if (extensions.includes(ext) || extensions.some(e => file.name.endsWith(e))) {
        count++;
      }
    }
  }

  return count;
}

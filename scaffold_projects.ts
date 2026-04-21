import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_DIR = "C:\\Users\\MSI\\Desktop\\projeler zip";
const SOURCE_DIR = path.join(BASE_DIR, "aipyram.com");

const PROJECTS = [
  "fethiye.ai",
  "kalkan.ai",
  "mobilya.ai",
  "satilik.ai",
  "ultrarent",
  "ardıç-perde-ankara-_-official-vision-platform",
  "didimde.net"
];

function copyFolderRecursiveSync(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    if (file === "node_modules" || file === ".next" || file === ".git" || file === ".pnpm-store") continue;

    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);

    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  }
}

for (const project of PROJECTS) {
  console.log(`\n=== SCAFFOLDING: ${project} ===`);
  const projectDir = path.join(BASE_DIR, project);

  // Copy template files
  console.log("Copying template...");
  copyFolderRecursiveSync(SOURCE_DIR, projectDir);

  // Update package.json name
  const pkgPath = path.join(projectDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.name = project.toLowerCase().replace(/[^a-z0-9]/g, "-");
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
  }

  // Generate .env.local
  const normalizedName = project.toLowerCase()
    .replace(".com", "")
    .replace(".ai", "")
    .replace(".net", "")
    .replace(/[^a-z0-9]/g, "");
    
  const envContent = `# ${project} — Google Cloud Native

# Firebase (perde-ai projesi)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBs1Ks2jeH2AXxTu8NqNMFeYQdsHA41Ztg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=perde-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=perde-ai

# Auth
JWT_SECRET=${normalizedName}-jwt-secret-2026-aipyram
SCHEMA_ADMIN_USER=authenticated

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AIPyram Brain Connection
AIPYRAM_BRAIN_URL=http://localhost:3000/api/v1/master/${normalizedName}/data
`;
  fs.writeFileSync(path.join(projectDir, ".env.local"), envContent, "utf-8");

  // Run pnpm install
  console.log("Running pnpm install...");
  try {
    execSync("pnpm install", { cwd: projectDir, stdio: 'inherit' });
    console.log(`✅ Scaffolded ${project} successfully.`);
  } catch (err) {
    console.error(`❌ Failed to install dependencies for ${project}`);
  }
}

console.log("\n🎉 SKELETON PROJECTS SCAFFOLDED SUCCESSFULLY");

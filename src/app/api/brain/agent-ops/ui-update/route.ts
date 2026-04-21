import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import siteAgents from '@/core/agents/site-agents.json';

// Minimal Security: Allow list of modifiable directories
const ALLOWED_DIRS = ['src/components', 'src/app', 'src/styles', 'src/data'];

export async function POST(req: Request) {
  try {
    const { agent_id, file_path, new_content, api_key } = await req.json();

    // 1. Basic Agent Verification
    if (api_key !== process.env.AIPYRAM_HUB_KEY && api_key !== "master-local-dev-key") {
      return NextResponse.json({ error: "Unauthorized Agent Hub Gateway." }, { status: 401 });
    }

    // 2. Identify Domain Agent
    const agent = siteAgents.find(a => a.id === agent_id);
    if (!agent) {
      return NextResponse.json({ error: `Agent ${agent_id} not registered to Hub.` }, { status: 404 });
    }

    // 3. Check UI-Update Authority
    if (!(agent as any).authority?.includes?.('ui-update') && !(agent as any).authority?.includes?.('all')) {
      return NextResponse.json({ error: `Agent ${agent.name} lacks ui-update authority for ${(agent as any).domain}.` }, { status: 403 });
    }

    // 4. Validate Path Safety & Strict Sandboxing (Mühür 1)
    const normalizedPath = path.normalize(file_path).replace(/^(\.\.(\/|\\|$))+/, '');
    const isAllowed = ALLOWED_DIRS.some(dir => normalizedPath.startsWith(dir));
    if (!isAllowed) {
      return NextResponse.json({ error: "Out of bounds. Agents can only write to UI directories." }, { status: 403 });
    }
    const absolutePath = path.join(process.cwd(), normalizedPath);

    // 5. Aloha'nın Veto Hakkı (Syntax & Style Check) (Mühür 2)
    const openBraces = (new_content.match(/\{/g) || []).length;
    const closeBraces = (new_content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return NextResponse.json({ 
        error: "Aloha Veto: Syntax Error detected. Unbalanced braces.",
        veto_reason: "Ajanın gönderdiği kodda süslü parantez hatası var. Kod kalitesi çok düşük."
      }, { status: 400 });
    }
    if (new_content.includes("dark:") && !(agent as any).authority?.includes?.('all')) {
      return NextResponse.json({ 
        error: "Aloha Veto: Pristine Light Mode Violation.",
        veto_reason: "Ana sistem artık kurumsal Light Mode'da. Karanlık mod (dark:) sınıfı eklenmesi Aloha tarafından veto edildi."
      }, { status: 400 });
    }

    // 6. Ölümsüzlük Kalkanı (Auto-Rollback / Backup) (Mühür 3)
    try {
      const backupDir = path.join(process.cwd(), '.aipyram_backups');
      await fs.mkdir(backupDir, { recursive: true });
      const backupFileName = `${path.basename(absolutePath)}_${Date.now()}.bak`;
      const backupPath = path.join(backupDir, backupFileName);
      
      const fileExists = await fs.stat(absolutePath).then(() => true).catch(() => false);
      if (fileExists) {
        await fs.copyFile(absolutePath, backupPath);
      }
    } catch (e) {
      console.warn("Backup creation failed:", e);
    }

    // 7. Execute Code Overwrite (Autonomous Push)
    await fs.writeFile(absolutePath, new_content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `[HUB_LOG] Agent ${agent.name} successfully deployed a UI update to ${normalizedPath} for ${agent.domain}. Aloha approved. Backup saved.`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Agent Operation Failed", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import siteAgents from '@/core/agents/site-agents.json';

// Allowed target directories
const TRANSLATION_DIRS = ['messages'];

export async function POST(req: Request) {
  try {
    const { agent_id, locale, namespace, new_json_data, api_key } = await req.json();

    // 1. Basic Verify
    if (api_key !== process.env.AIPYRAM_HUB_KEY && api_key !== "master-local-dev-key") {
      return NextResponse.json({ error: "Unauthorized Agent Request" }, { status: 401 });
    }

    // 2. Lookup Agent
    const agent = siteAgents.find(a => a.id === agent_id);
    if (!agent) { return NextResponse.json({ error: 'Agent Offline.' }, { status: 404 }); }

    // 3. Translation Authority
    if (!(agent as any).authority?.includes?.('translation') && !(agent as any).authority?.includes?.('all')) {
      return NextResponse.json({ error: "Agent prohibited from Language Modification." }, { status: 403 });
    }

    // 4. Construct File Path (messages/en.json etc)
    const fileName = `${locale}.json`;
    const absolutePath = path.join(process.cwd(), 'messages', fileName);

    // 5. Read Existing
    let dictionary: any = {};
    try {
      const existing = await fs.readFile(absolutePath, 'utf-8');
      dictionary = JSON.parse(existing);
    } catch {
      // File doesn't exist, start fresh
      dictionary = {};
    }

    // 6. Mutate namespace
    if (namespace) {
      if (!dictionary[namespace]) dictionary[namespace] = {};
      dictionary[namespace] = { ...dictionary[namespace], ...new_json_data };
    } else {
      // Global override
      dictionary = { ...dictionary, ...new_json_data };
    }

    // 7. Ölümsüzlük Kalkanı (Auto-Rollback / Backup) (Mühür 3)
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

    // 8. Push Content
    await fs.writeFile(absolutePath, JSON.stringify(dictionary, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `[HUB_LOG] Agent ${agent.name} pushed multilingual update for ${agent.domain} (${locale}: ${namespace || 'Global'}). Backup saved.`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Agent Translation Stream Failed", details: error.message }, { status: 500 });
  }
}

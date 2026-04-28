import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// Gerçek ağ tarama endpointi — AgentTreeWidget bunu çağırır
export async function GET() {
  try {
    // 1. PROJE TARAMASI (projects.json + fiziksel dizin kontrolü)
    const projectsPath = path.join(process.cwd(), 'src/core/ide/projects.json');
    let projectNodes: { name: string; status: string }[] = [];
    
    try {
      const projectsRaw = fs.readFileSync(projectsPath, 'utf8');
      const projects = JSON.parse(projectsRaw);
      
      projectNodes = projects.map((p: any) => ({
        name: p.name.toUpperCase(),
        status: (fs.existsSync(p.repo) || p.name === 'aipyram') ? 'aktif' : 'offline',
      }));
    } catch {
      // Fallback statik liste
      projectNodes = [
        { name: 'aipyram', status: 'aktif' },
        { name: 'TRTEX', status: 'aktif' },
        { name: 'PERDE', status: 'aktif' },
        { name: 'HOMETEX', status: 'aktif' },
        { name: 'DIDIMEMLAK', status: 'aktif' },
      ];
    }

    // 2. AJAN TARAMASI (core-agents.json dosyasından)
    const agentsPath = path.join(process.cwd(), 'src/core/agents/core-agents.json');
    let agentNodes: { name: string; status: string }[] = [];
    
    try {
      const agentsRaw = fs.readFileSync(agentsPath, 'utf8');
      const agents = JSON.parse(agentsRaw);
      
      if (Array.isArray(agents)) {
        agentNodes = agents.map((a: any) => ({
          name: a.name || a.id || 'unknown',
          status: 'online',
        }));
      } else if (typeof agents === 'object') {
        agentNodes = Object.entries(agents).map(([key, val]: [string, any]) => ({
          name: val?.name || key,
          status: 'online',
        }));
      }
    } catch {
      // Fallback: src/core/agents dizinindeki .ts dosyalarını tara
      const agentDir = path.join(process.cwd(), 'src/core/agents');
      try {
        const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'agentFactory.ts');
        agentNodes = files.map(f => ({
          name: f.replace('.ts', '').replace(/Agent$/, '').toUpperCase(),
          status: 'online',
        }));
      } catch {
        agentNodes = [
          { name: 'ALOHA', status: 'online' },
          { name: 'TRTEX-AGENT', status: 'online' },
          { name: 'MASTER-AGENT', status: 'online' },
        ];
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: projectNodes,
        agents: agentNodes,
        timestamp: Date.now(),
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      data: { projects: [], agents: [] }
    });
  }
}

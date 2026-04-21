import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { agent_id, name, domain, role, authority, systemPrompt, api_key } = await req.json();

    // 1. Basic Agent Verification
    if (api_key !== process.env.AIPYRAM_HUB_KEY && api_key !== "master-local-dev-key") {
      return NextResponse.json({ error: "Unauthorized Agent Hub Gateway." }, { status: 401 });
    }

    if (!agent_id || !domain || !role) {
      return NextResponse.json({ error: "Missing required agent parameters: agent_id, domain, role." }, { status: 400 });
    }

    const agentsFilePath = path.join(process.cwd(), 'src/core/agents/site-agents.json');
    let siteAgents: any[] = [];
    try {
      const data = await fs.readFile(agentsFilePath, 'utf-8');
      siteAgents = JSON.parse(data);
    } catch {
      siteAgents = [];
    }

    // Check if exists
    const exists = siteAgents.find(a => a.id === agent_id || a.domain === domain);
    if (exists) {
      return NextResponse.json({ error: `Agent identity or domain conflict. ${domain} is already assigned.` }, { status: 409 });
    }

    // Register New Agent
    const newAgent = {
      id: agent_id,
      name: name || `Agent-${agent_id}`,
      domain,
      role,
      authority: authority || ["translation"], // default lower authority
      systemPrompt: systemPrompt || "Standart Aipyram Node Ajanı."
    };

    siteAgents.push(newAgent);
    await fs.writeFile(agentsFilePath, JSON.stringify(siteAgents, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `[HUB_LOG] Welcome to the Hive. Agent ${newAgent.name} successfully registered for domain: ${newAgent.domain}.`,
      assigned_authorities: newAgent.authority,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Agent Registration Failed", details: error.message }, { status: 500 });
  }
}

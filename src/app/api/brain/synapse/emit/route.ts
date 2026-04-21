import { NextResponse } from 'next/server';
import { handleSynapseSignal } from '@/services/crossNexusOrchestrator';

export async function POST(req: Request) {
  try {
    const { source_agent, event_type, payload, api_key } = await req.json();

    // 1. Basic Agent Verification
    if (api_key !== process.env.AIPYRAM_HUB_KEY && api_key !== "master-local-dev-key") {
      return NextResponse.json({ error: "Unauthorized Synapse Access." }, { status: 401 });
    }

    if (!source_agent || !event_type) {
      return NextResponse.json({ error: "Missing source_agent or event_type." }, { status: 400 });
    }

    // 2. Fire the Telepathic Signal to the Orchestrator
    const reaction = await handleSynapseSignal({
      source_agent,
      event_type,
      payload: payload || {}
    });

    return NextResponse.json({
      success: true,
      message: "[CROSS_NEXUS] Signal Broadcasted successfully.",
      synapse_results: reaction,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Synapse Overload", details: error.message }, { status: 500 });
  }
}

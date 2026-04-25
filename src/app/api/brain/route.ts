import { NextResponse } from 'next/server';
import { AlohaRouter, UAPRequest } from '@/core/aloha/brain';

export async function POST(req: Request) {
  try {
    const payload: UAPRequest = await req.json();

    // 1. Validate UAP Protocol Format
    if (!payload.agent_id || !payload.project || !payload.task_type || !payload.metadata) {
      return NextResponse.json({ 
        success: false, 
        error: "Geçersiz UAP (Unified Agent Protocol) formatı." 
      }, { status: 400 });
    }

    // 2. Process Request via Sovereign Router (The Judge)
    const decision = await AlohaRouter.processRequest(payload);

    return NextResponse.json({
      success: true,
      decision
    });

  } catch (error: any) {
    console.error('[Brain API] Error processing UAP request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

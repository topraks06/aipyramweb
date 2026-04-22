import { NextResponse } from 'next/server';
import { orchestrateQuery, OrchestrationRequest } from '@/core/aloha/orchestrationLayer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.query || !body.intent || !body.locale) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: query, intent, locale' }, 
        { status: 400 }
      );
    }

    const orchestrationReq: OrchestrationRequest = {
      query: body.query,
      intent: body.intent,
      user_locale: body.locale,
      tenant_context: body.tenantContext
    };

    const result = await orchestrateQuery(orchestrationReq);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('[API] Orchestrate POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to orchestrate query' }, 
      { status: 500 }
    );
  }
}

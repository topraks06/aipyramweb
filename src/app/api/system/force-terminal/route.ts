import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/system/force-terminal
 * Terminal payload'u zorla yeniden oluşturur
 */
export async function GET() {
  try {
    const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
    const result = await buildTerminalPayload();
    
    return NextResponse.json({
      success: true,
      version: result?.version || 0,
      generatedAt: result?.generatedAt || new Date().toISOString(),
      message: '✅ Terminal payload güncellendi',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { exportAgentStudioManifest } from '@/core/aloha/engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/agent-manifest
 * ALOHA'nın 33+ ajan yeteneğini Google Agent Studio JSON-RPC formatında döndürür.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'aloha_admin_secret'}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const manifest = exportAgentStudioManifest();
    return NextResponse.json({ success: true, manifest });
  } catch (error: any) {
    console.error('[Admin API] Agent manifest export failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

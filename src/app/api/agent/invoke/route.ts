/**
 * SOVEREIGN AGENT API — Unified Endpoint
 * 
 * POST /api/agent/invoke
 * Tüm node'ların çağıracağı TEK endpoint.
 * Agent sadece Master'da çalışır — Node direkt agent çalıştırmaz.
 * 
 * Body: { node, action, uid?, payload, idempotencyKey? }
 * Response: { success, data, creditUsed, duration, message }
 */

import { NextResponse } from 'next/server';
import { invokeAgent, type SovereignInvocation } from '@aipyram/aloha-sdk';
import { logDLQ } from '@aipyram/aloha-sdk';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { node, action, uid, payload, idempotencyKey } = body;

    // ═══ VALIDATION ═══
    if (!node || typeof node !== 'string') {
      return NextResponse.json(
        { success: false, error: 'node parametresi zorunlu (string).' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'action parametresi zorunlu (string).' },
        { status: 400 }
      );
    }

    // Node whitelist
    const VALID_NODES = ['trtex', 'perde', 'hometex', 'vorhang', 'aipyram'];
    if (!VALID_NODES.includes(node)) {
      return NextResponse.json(
        { success: false, error: `Geçersiz node: ${node}` },
        { status: 400 }
      );
    }

    // ═══ INVOKE ═══
    const invocation: SovereignInvocation = {
      node,
      action,
      uid: uid || undefined,
      payload: payload || {},
      idempotencyKey: idempotencyKey || undefined,
    };

    const result = await invokeAgent(invocation);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      creditUsed: result.creditUsed,
      duration: result.duration,
      message: result.message,
    });

  } catch (err: any) {
    console.error('[/api/agent/invoke] Kritik hata:', err);

    // DLQ — Sistem çökerse veri kaybolmaz
    try {
      const body = await req.clone().json().catch(() => ({}));
      await logDLQ(
        body.node || 'unknown',
        body.action || 'unknown',
        err.message,
        body.payload || {}
      );
    } catch {
      // DLQ kaydı bile başarısız — sadece logla
    }

    return NextResponse.json(
      { success: false, error: `Internal error: ${err.message}` },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ALOHA Sovereign Agent Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}

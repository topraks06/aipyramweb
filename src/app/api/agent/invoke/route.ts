/**
 * SOVEREIGN AGENT API — Unified Endpoint
 * 
 * POST /api/agent/invoke
 * Tüm tenant'ların çağıracağı TEK endpoint.
 * Agent sadece Master'da çalışır — Tenant direkt agent çalıştırmaz.
 * 
 * Body: { tenant, action, uid?, payload, idempotencyKey? }
 * Response: { success, data, creditUsed, duration, message }
 */

import { NextResponse } from 'next/server';
import { invokeAgent, type SovereignInvocation } from '@aipyram/aloha-sdk';
import { logDLQ } from '@aipyram/aloha-sdk';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenant, action, uid, payload, idempotencyKey } = body;

    // ═══ VALIDATION ═══
    if (!tenant || typeof tenant !== 'string') {
      return NextResponse.json(
        { success: false, error: 'tenant parametresi zorunlu (string).' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'action parametresi zorunlu (string).' },
        { status: 400 }
      );
    }

    // Tenant whitelist
    const VALID_TENANTS = ['trtex', 'perde', 'hometex', 'vorhang', 'aipyram'];
    if (!VALID_TENANTS.includes(tenant)) {
      return NextResponse.json(
        { success: false, error: `Geçersiz tenant: ${tenant}` },
        { status: 400 }
      );
    }

    // ═══ INVOKE ═══
    const invocation: SovereignInvocation = {
      tenant,
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
        body.tenant || 'unknown',
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

import { NextResponse } from 'next/server';
import { ecosystemBus } from '@/core/events/ecosystemBus';
import { EcosystemSignal } from '@/core/events/signalTypes';

// ═══════════════════════════════════════════════════
// AIPYRAM Ecosystem Signals API
// GET: Son sinyalleri çeker
// POST: Manuel sinyal gönderir
// ═══════════════════════════════════════════════════

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get('tenant') || 'all';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const signals = await ecosystemBus.getRecentSignals(tenant, limit);
    return NextResponse.json({ success: true, count: signals.length, signals });
  } catch (error) {
    console.error('[API] Signals GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch signals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Basit auth kontrolü (örneğin CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  if (secret && authHeader !== `Bearer ${secret}` && authHeader !== secret) {
    // Sadece development ortamında veya yetkili kullanıcılarda geçiş
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json() as Partial<EcosystemSignal>;
    
    if (!body.type || !body.source_tenant || !body.target_tenant) {
      return NextResponse.json({ success: false, error: 'Missing required fields: type, source_tenant, target_tenant' }, { status: 400 });
    }

    const signal: EcosystemSignal = {
      type: body.type,
      source_tenant: body.source_tenant,
      target_tenant: body.target_tenant,
      payload: body.payload || {},
      priority: body.priority || 'normal',
    };

    await ecosystemBus.emit(signal);
    
    return NextResponse.json({ success: true, message: 'Signal emitted successfully' });
  } catch (error) {
    console.error('[API] Signals POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to emit signal' }, { status: 500 });
  }
}

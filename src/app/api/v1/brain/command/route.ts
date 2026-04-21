import { NextResponse } from 'next/server';
import { EventBus } from '@/core/events/eventBus';
import { trtexAgent } from '@/core/agents/trtexAgent';

export async function POST(request: Request) {
  // Sistemin uyanması için Ajanları bağlıyoruz (Bir kere init olur)
  trtexAgent.init();
  
  try {
    const payload = await request.json();
    
    // Basit COMMAND Sinyali Şeması:
    // { "target": "trtex" | "perde", "action": "GENERATE_NEWS", "input": "..." }
    const { target, action, input } = payload;

    if (!target || !action) {
      return NextResponse.json({ success: false, error: 'Eksik Komut Parametresi' }, { status: 400 });
    }

    console.log(`[🚀 COMMAND TOWER] Gelen Emir: ${action} -> Hedef: ${target} Ajanı. Input: ${input}`);

    // ACTION'a göre uyugn EVENT mapping'i yapılır
    if (action === 'GENERATE_NEWS' && target === 'trtex') {
      EventBus.emit({
        type: 'NEW_TREND_DETECTED',
        source: 'command_tower',
        payload: {
          trend: input || "Genel B2B Pazarı"
        }
      });
      console.log('[🚀 COMMAND TOWER] EventBus üzerinden TRTEX yayını başlatıldı.');
    } else if (action === 'GENERATE_NEWS' && target === 'hometex') {
      EventBus.emit({
        type: 'NEW_TREND_DETECTED',
        source: 'command_tower',
        payload: {
          trend: input || "Genel Ev Tekstili Vizyonu"
        }
      });
      console.log('[🚀 COMMAND TOWER] EventBus üzerinden HOMETEX yayını başlatıldı.');
    } else {
      console.warn(`[⚠️ COMMAND TOWER] Tanımlanmamış emir rotası: ${action} for ${target}`);
      return NextResponse.json({ success: false, message: 'Geçersiz Komut Hedefi' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ajan Başarıyla Tetiklendi. Düşünce Süreci (Visionary AI) Başladı.',
      ticket: {
        agent: target,
        action: action,
        status: 'THINKING',
        timestamp: Date.now()
      }
    });

  } catch (err: any) {
    console.error('Command Endpoint Hatası:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

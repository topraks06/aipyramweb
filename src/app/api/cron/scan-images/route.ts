import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 🔒 DEVRE DIŞI — Hakan Bey emri (30 Nisan 2026)
 * Görsel üretim maliyeti aylık $20 bütçeyi aştı (2.613 CHF fatura).
 * Bu endpoint tamamen kapatıldı. Görsel üretimi YASAK.
 */
export async function GET() {
  return NextResponse.json({
    success: false,
    disabled: true,
    reason: '🔒 GÖRSEL ÜRETİM TAMAMEN KAPALI — Maliyet kilidi aktif (Hakan Bey emri 30/04/2026)',
    message: 'Bu endpoint devre dışı bırakıldı. Görsel üretimi için admin panelinden manuel yükleme yapın.',
  }, { status: 403 });
}

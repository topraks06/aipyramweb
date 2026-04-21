import { NextResponse } from 'next/server';
import { adminDb, firebaseInitStatus, checkFirestoreHealth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * 🔍 FIRESTORE HEALTH CHECK — Deploy sonrası doğrulama endpoint'i
 * 
 * GET /api/health/firestore
 * 
 * Aloha deploy'dan sonra bunu test eder:
 * - Firebase Admin init durumu
 * - Firestore bağlantısı
 * - trtex_news koleksiyon erişimi
 */
export async function GET() {
  const startTime = Date.now();
  
  const result: {
    status: 'OK' | 'DEGRADED' | 'DOWN';
    init: string;
    firestore: string;
    trtex_news: { accessible: boolean; count: number };
    latency_ms: number;
    timestamp: string;
  } = {
    status: 'DOWN',
    init: firebaseInitStatus,
    firestore: 'unknown',
    trtex_news: { accessible: false, count: 0 },
    latency_ms: 0,
    timestamp: new Date().toISOString(),
  };

  // 1. Firestore health
  const fsHealth = await checkFirestoreHealth();
  result.firestore = fsHealth;

  // 2. trtex_news erişimi
  if (fsHealth === 'OK') {
    try {
      const snap = await adminDb.collection('trtex_news').limit(1).get();
      result.trtex_news = { accessible: true, count: snap.size };
      result.status = 'OK';
    } catch (e: any) {
      result.trtex_news = { accessible: false, count: 0 };
      result.status = 'DEGRADED';
    }
  } else {
    result.status = fsHealth === 'NOOP' ? 'DEGRADED' : 'DOWN';
  }

  result.latency_ms = Date.now() - startTime;

  const statusCode = result.status === 'OK' ? 200 : result.status === 'DEGRADED' ? 503 : 500;
  return NextResponse.json(result, { status: statusCode });
}

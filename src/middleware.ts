import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE RATE LIMITER (Edge-uyumlu, in-memory)
// Upstash kaldırıldı — Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 10_000; // 10 saniye pencere
  const maxRequests = 100;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) return true;
  return false;
}

// Bellek taşmasını önle — her 60 saniyede eski entry'leri temizle
let lastCleanup = Date.now();
function cleanupRateLimitMap() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  
  // 🛡️ DDOS VE BOT KALKANI (In-Memory Rate Limiter — Google-Native)
  cleanupRateLimitMap();
  if (isRateLimited(ip)) {
    console.warn(`[🛑 DDoS/BOT KALKANI] IP ${ip} engellendi! Edge limitleri aşıldı.`);
    return new NextResponse(
      JSON.stringify({ error: "Rate limit exceeded. System is under high load.", code: 429 }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '10' } }
    );
  }

  // Clean port for local testing (e.g. localhost:3000 -> localhost)
  const currentHost = hostname.split(':')[0];

  // Define Master Node domains (Main UI + Admin)
  const isMainDomain = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.includes('aipyram');
  
  // API, Admin and Multinode Static Routes bypass
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/sites')) {
    if (!isMainDomain && url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url)); // Block nodes from admin
    }
    return NextResponse.next();
  }

  // 🌍 MULTI-NODE DUMB-CLIENT RENDER LAYER
  if (isMainDomain) {
    // Normal AIPYRAM Master Node (Uses next-intl)
    return intlMiddleware(req);
  }

  // Local dev: trtex.localhost → trtex.com, hometex.localhost → hometex.ai vb.
  let SovereignNodeId = currentHost.replace(/^www\./, '');
  if (currentHost.endsWith('.localhost')) {
    const sub = currentHost.replace('.localhost', '');
    // Bilinen domain uzantı eşleştirmesi
    const domainMap: Record<string, string> = {
      'trtex': 'trtex.com',
      'hometex': 'hometex.ai',
      'perde': 'perde.ai',
      'vorhang': 'vorhang.ai',
    };
    SovereignNodeId = domainMap[sub] || `${sub}.com`;
    console.log(`[MIDDLEWARE] Local subdomain algılandı: ${currentHost} → node: ${SovereignNodeId}`);
  }

  // Rewrite requests to /sites/[domain]/[path]
  url.pathname = `/sites/${SovereignNodeId}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|_vercel|robots\\.txt|sitemap\\.xml|manifest\\.json|sw\\.js|favicon\\.svg|og-image\\.png|.*\\..*).*)']
};
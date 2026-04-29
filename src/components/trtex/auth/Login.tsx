'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * TRTex Login — Sovereign SSO ile çalışır
 * Tekstil İstihbarat Radarı
 */
export default function Login({ basePath = '/sites/trtex.com' }: { basePath?: string }) {
  return <SovereignLogin nodeId="trtex" basePath={basePath} />;
}

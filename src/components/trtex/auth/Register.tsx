'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * TRTex Register — Sovereign SSO ile çalışır
 * Tekstil İstihbarat Radarı
 */
export default function Register({ basePath = '/sites/trtex.com' }: { basePath?: string }) {
  return <SovereignRegister nodeId="trtex" basePath={basePath} />;
}

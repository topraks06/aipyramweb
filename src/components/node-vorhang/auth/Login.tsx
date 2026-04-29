'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * Vorhang.ai Login — Sovereign SSO ile çalışır
 * DACH pazarı (Almanca)
 */
export default function Login({ basePath = '/sites/vorhang.ai' }: { basePath?: string }) {
  return <SovereignLogin nodeId="vorhang" basePath={basePath} />;
}

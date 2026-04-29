'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * Hometex.ai Login — Sovereign SSO ile çalışır
 */
export default function Login({ basePath = '/sites/hometex.ai' }: { basePath?: string }) {
  return <SovereignLogin nodeId="hometex" basePath={basePath} />;
}

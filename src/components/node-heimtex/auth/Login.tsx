'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * Heimtex.ai Login — Sovereign SSO ile çalışır
 */
export default function Login({ basePath = '/sites/heimtex.ai' }: { basePath?: string }) {
  return <SovereignLogin nodeId="heimtex" basePath={basePath} />;
}

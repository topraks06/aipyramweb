'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * icmimar.ai Login — Sovereign SSO ile çalışır
 */
export default function Login({ basePath = '/sites/icmimar.ai' }: { basePath?: string }) {
  return <SovereignLogin nodeId="icmimar" basePath={basePath} />;
}

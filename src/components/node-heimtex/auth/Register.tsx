'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * Heimtex.ai Register — Sovereign SSO ile çalışır
 */
export default function Register({ basePath = '/sites/heimtex.ai' }: { basePath?: string }) {
  return <SovereignRegister nodeId="heimtex" basePath={basePath} />;
}

'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * Hometex.ai Register — Sovereign SSO ile çalışır
 */
export default function Register({ basePath = '/sites/hometex.ai' }: { basePath?: string }) {
  return <SovereignRegister nodeId="hometex" basePath={basePath} />;
}

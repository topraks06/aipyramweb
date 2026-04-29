'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * Perde.ai Register — Sovereign SSO ile çalışır
 */
export default function Register({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  return <SovereignRegister nodeId="perde" basePath={basePath} />;
}

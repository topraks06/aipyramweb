'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * icmimar.ai Register — Sovereign SSO ile çalışır
 */
export default function Register({ basePath = '/sites/icmimar.ai' }: { basePath?: string }) {
  return <SovereignRegister nodeId="icmimar" basePath={basePath} />;
}

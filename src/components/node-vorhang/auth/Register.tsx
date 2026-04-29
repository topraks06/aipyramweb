'use client';

import SovereignRegister from '@/components/shared/auth/SovereignRegister';

/**
 * Vorhang.ai Register — Sovereign SSO ile çalışır
 * DACH pazarı (Almanca)
 */
export default function Register({ basePath = '/sites/vorhang.ai' }: { basePath?: string }) {
  return <SovereignRegister nodeId="vorhang" basePath={basePath} />;
}

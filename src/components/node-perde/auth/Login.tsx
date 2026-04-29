'use client';

import SovereignLogin from '@/components/shared/auth/SovereignLogin';

/**
 * Perde.ai Login — Sovereign SSO ile çalışır
 * Eski kopyala-yapıştır bileşen yerine tek tip SovereignLogin kullanılır.
 */
export default function Login({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  return <SovereignLogin nodeId="perde" basePath={basePath} />;
}

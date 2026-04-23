'use client';

import { useSovereignAuth } from './useSovereignAuth';

/**
 * Perde.ai Auth Wrapper
 * Geriye dönük uyumluluk için korunuyor.
 * Tüm mantık useSovereignAuth('perde') üzerinden geliyor.
 */
export function usePerdeAuth() {
  const auth = useSovereignAuth('perde');
  return {
    ...auth,
    // Eski API uyumluluğu — registerDealer = registerMember
    registerDealer: auth.registerMember,
  };
}

export type { LicenseStatus } from './useSovereignAuth';

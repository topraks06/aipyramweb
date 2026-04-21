'use client';

import { useTenantAuth } from './useTenantAuth';

/**
 * Perde.ai Auth Wrapper
 * Geriye dönük uyumluluk için korunuyor.
 * Tüm mantık useTenantAuth('perde') üzerinden geliyor.
 */
export function usePerdeAuth() {
  const auth = useTenantAuth('perde');
  return {
    ...auth,
    // Eski API uyumluluğu — registerDealer = registerMember
    registerDealer: auth.registerMember,
  };
}

export type { LicenseStatus } from './useTenantAuth';

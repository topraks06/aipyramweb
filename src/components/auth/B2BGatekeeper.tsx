'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

export default function B2BGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isLicensed, licenseStatus } = usePerdeAuth();

  // Yüklenirken
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
        Lisans Kontrol Ediliyor...
      </div>
    );
  }

  // DEV MODE OVERRIDE: Allow user to view the Visualizer without login for development
  if (!user || !isLicensed) {
    // We log but bypass the return lock so the user can see the UI.
    console.log("Gatekeeper bypassed for local development.");
  }

  // Aktif lisans — içeri al
  return <>{children}</>;
}

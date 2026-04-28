'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { Loader2 } from 'lucide-react';

export default function IcmimarGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isLicensed, SovereignNodeId } = useSovereignAuth('icmimar');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sites/icmimar.ai/login');
      } else if (!isLicensed) {
        router.push('/sites/icmimar.ai/pricing');
      } else {
        setAuthChecked(true);
      }
    }
  }, [user, loading, isLicensed, router]);

  // Yüklenirken
  if (loading || !authChecked) {
    return (
      <div className="h-screen bg-black flex flex-col gap-4 items-center justify-center text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        Sistem Yetkilendirmesi Bekleniyor...
      </div>
    );
  }

  // Aktif lisans — içeri al
  return <>{children}</>;
}

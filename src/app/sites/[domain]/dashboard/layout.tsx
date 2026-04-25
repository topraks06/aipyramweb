'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { resolveNodeFromDomain } from '@/lib/sovereign-config';
import { ShieldAlert, Loader2 } from 'lucide-react';
import TenantAlohaWidget from '@/components/aloha/TenantAlohaWidget';

export default function DashboardGuardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const domain = pathname.split('/')[2];
    const nodeConfig = resolveNodeFromDomain(domain);
    const nodeId = nodeConfig.id;
    
    const { user, loading, role } = useSovereignAuth(nodeId);
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> Redirect to login
                router.replace(`/sites/${domain}/login?redirect=/sites/${domain}/dashboard`);
            } else if (role !== 'admin') {
                // Not an admin -> Block
                setAuthorized(false);
            } else {
                // Is Admin -> Allow
                setAuthorized(true);
            }
        }
    }, [user, loading, role, domain, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Next router will redirect
    }

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center font-mono">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
                <h1 className="text-2xl font-bold uppercase tracking-widest text-red-500 mb-2">ERİŞİM REDDEDİLDİ</h1>
                <p className="text-zinc-400 text-sm">Bu panele sadece 'admin' yetkisine sahip kullanıcılar erişebilir.</p>
                <button 
                  onClick={() => router.push(`/sites/${domain}/`)}
                  className="mt-8 px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
                >
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111] text-white font-sans selection:bg-[#D4AF37] selection:text-white">
            {children}
            <TenantAlohaWidget nodeId={nodeId} nodeName={nodeConfig.shortName} />
        </div>
    );
}

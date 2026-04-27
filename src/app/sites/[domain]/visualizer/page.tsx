import React from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import RoomVisualizer from '@/components/node-perde/RoomVisualizer';
import B2BGatekeeper from '@/components/auth/B2BGatekeeper';

export const dynamic = "force-dynamic";

export default async function VisualizerPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  if (!exactDomain.includes('perde')) {
     return <div className="p-12 text-center text-white bg-black">Access Denied. Only Perde.ai nodes can access the Visualizer.</div>;
  }

  return (
    <B2BGatekeeper>
      <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
        
        {/* MINIMALIST TOP HEADER */}
        <header className="h-20 border-b border-white/10 bg-zinc-950 flex items-center justify-between px-8 shrink-0 z-10 w-full relative">
           
           {/* LEFT MENU */}
           <div className="flex items-center gap-6">
              <Link href={`/sites/${exactDomain}`} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 hover:text-white transition-colors rounded-sm px-4 py-2 hover:bg-white/5">
                <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
              </Link>
           </div>

           {/* CENTER LOGO */}
           <div className="absolute left-1/2 -translate-x-1/2">
              <span className="font-serif text-2xl tracking-tight font-medium text-white">
                PERDE.AI
              </span>
           </div>

           {/* RIGHT MENU */}
           <div className="flex items-center gap-4">
              <Link href={`/sites/${exactDomain}/yonetim`} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 transition-colors rounded-sm text-[10px] uppercase tracking-[0.1em] font-bold">
                 <LayoutDashboard className="w-4 h-4" /> Yönetim Paneli
              </Link>
           </div>

        </header>

        <main className="flex-1 overflow-auto p-0 md:p-2 relative">
          <React.Suspense fallback={<div className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mt-20">Stüdyo Yükleniyor...</div>}>
            <RoomVisualizer />
          </React.Suspense>
        </main>
      </div>
    </B2BGatekeeper>
  );
}

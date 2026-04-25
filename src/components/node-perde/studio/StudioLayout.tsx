'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  const { user, loading, logout } = usePerdeAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/sites/perde.ai/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col h-screen bg-[#F9F9F6] text-[#111111] overflow-hidden font-sans">
      
      {/* MINIMALIST TOP HEADER */}
      <header className="h-20 border-b border-[#111111]/10 bg-white flex items-center justify-between px-8 shrink-0 z-10 w-full relative">
         
         {/* LEFT MENU */}
         <div className="flex items-center gap-6">
            <Link href="/sites/perde" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-[#111] transition-colors rounded-sm px-4 py-2 hover:bg-zinc-100">
              <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
            </Link>
         </div>

         {/* CENTER LOGO */}
         <div className="absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-2xl tracking-tight font-medium text-[#111]">
              PERDE.AI
            </span>
         </div>

         {/* RIGHT MENU */}
         <div className="flex items-center gap-4">
            {user && (
              <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-bold hidden md:block px-4">
                {user.email}
              </span>
            )}
            <Link href="/sites/perde/studio" className="flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white hover:bg-black transition-colors rounded-sm text-[10px] uppercase tracking-[0.1em] font-bold">
               <LayoutDashboard className="w-4 h-4" /> Yönetim Paneli
            </Link>
            {user && (
              <button onClick={() => logout()} className="text-red-500 hover:text-red-700 transition-colors p-2.5 rounded-sm hover:bg-red-50" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </button>
            )}
         </div>

      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto relative">
         {children}
      </main>

    </div>
  );
}

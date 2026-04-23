'use client';

import React, { useState, useEffect, useRef } from 'react';
import AlohaInput from '@/components/aloha/AlohaInput';
import DynamicCanvas from '@/components/aloha/DynamicCanvas';
import TenantSelector from '@/components/aloha/TenantSelector';
import HealthCards from '@/components/aloha/HealthCards';
import DashboardOverview from '@/components/admin/DashboardOverview';

export default function TheVoidAdmin() {
  const [intelItems, setIntelItems] = useState<any[]>([]);
  const [activeTenant, setActiveTenant] = useState('trtex');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new intel arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [intelItems]);

  return (
    <main className="h-screen bg-[#050505] text-zinc-100 selection:bg-blue-500/30 flex flex-col font-sans overflow-hidden">
      {/* OS Status Bar */}
      <div className="p-3 bg-black flex justify-between items-center border-b border-white/5 z-50">
        <div className="flex items-center gap-4 pl-4">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-400">AIPYRAM OS 5.0 — GOOGLE-NATIVE</span>
        </div>

        {/* Tenant Seçici — Üst barda */}
        <div className="hidden md:flex items-center gap-4">
          <TenantSelector activeTenant={activeTenant} onTenantChange={setActiveTenant} />
        </div>

        <div className="flex items-center gap-8 pr-4">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 tracking-widest transition hidden md:block"
          >
            {sidebarOpen ? '◀ PANEL' : '▶ PANEL'}
          </button>
          <div className="text-[10px] font-mono text-blue-500/70 tracking-widest hidden sm:block">
            ENCRYPTED : ACTIVE
          </div>
        </div>
      </div>

      {/* Mobile Tenant Selector */}
      <div className="md:hidden px-4 py-2 bg-black border-b border-white/5">
        <TenantSelector activeTenant={activeTenant} onTenantChange={setActiveTenant} />
      </div>

      {/* Main Content Area: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sol Panel: Health Cards */}
        {sidebarOpen && (
          <aside className="hidden md:block w-56 shrink-0 bg-black/80 border-r border-white/5 overflow-y-auto p-4">
            <HealthCards />
          </aside>
        )}

        {/* The Void: Dinamik Veri Sahnesi */}
        <section ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth border-x border-white/[0.02] mx-auto w-full max-w-[1600px]">
          {intelItems.length === 0 ? (
            <div className="pt-4">
              <DashboardOverview />
            </div>
          ) : (
            <div className="pt-10">
              <DynamicCanvas items={intelItems} />
            </div>
          )}
        </section>
      </div>

      {/* Command Input: Merkeze Oturtulmuş Giriş Hattı */}
      <div className="p-8 bg-black z-50 border-t border-white/5">
        <AlohaInput onExecute={(response) => setIntelItems(prev => [...prev, response])} />
      </div>
    </main>
  );
}

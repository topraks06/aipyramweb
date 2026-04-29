'use client';

import React from 'react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN AUTH WRAPPER — Tek Tip Arayüz Sarmalayıcı
 *  
 *  7 Node, 1 Tasarım: AIPyram, TRTex, Perde.ai, icmimar.ai,
 *  Vorhang.ai, Hometex.ai, Heimtex.ai
 *  
 *  Node'a göre sadece renk ve logo değişir. Yapı aynı.
 * ═══════════════════════════════════════════════════════════════
 */

export interface NodeTheme {
  nodeId: string;
  name: string;
  tagline: string;
  accent: string;       // Primary accent color
  accentHover: string;  // Hover state
  accentRing: string;   // Focus ring
  logo?: string;        // Logo URL (optional)
}

// 7 Ana Node Tema Haritası
export const NODE_THEMES: Record<string, NodeTheme> = {
  aipyram: {
    nodeId: 'aipyram',
    name: 'AIPyram',
    tagline: 'Sovereign AI Master Node',
    accent: '#1E293B',
    accentHover: '#0F172A',
    accentRing: 'rgba(30,41,59,0.15)',
  },
  trtex: {
    nodeId: 'trtex',
    name: 'TRTex',
    tagline: 'Tekstil İstihbarat Radarı',
    accent: '#DC2626',
    accentHover: '#B91C1C',
    accentRing: 'rgba(220,38,38,0.15)',
  },
  perde: {
    nodeId: 'perde',
    name: 'Perde.ai',
    tagline: 'Online Satış Portalı',
    accent: '#8B7355',
    accentHover: '#725E45',
    accentRing: 'rgba(139,115,85,0.15)',
  },
  icmimar: {
    nodeId: 'icmimar',
    name: 'icmimar.ai',
    tagline: 'İç Mimari Tasarım & ERP',
    accent: '#6366F1',
    accentHover: '#4F46E5',
    accentRing: 'rgba(99,102,241,0.15)',
  },
  vorhang: {
    nodeId: 'vorhang',
    name: 'Vorhang.ai',
    tagline: 'DACH Premium Textilmarkt',
    accent: '#7C3AED',
    accentHover: '#6D28D9',
    accentRing: 'rgba(124,58,237,0.15)',
  },
  hometex: {
    nodeId: 'hometex',
    name: 'Hometex.ai',
    tagline: '365 Gün Sanal Tekstil Fuarı',
    accent: '#059669',
    accentHover: '#047857',
    accentRing: 'rgba(5,150,105,0.15)',
  },
  heimtex: {
    nodeId: 'heimtex',
    name: 'Heimtex.ai',
    tagline: 'Global Trend & Dergi',
    accent: '#0EA5E9',
    accentHover: '#0284C7',
    accentRing: 'rgba(14,165,233,0.15)',
  },
};

export function getNodeTheme(nodeId: string): NodeTheme {
  return NODE_THEMES[nodeId] || NODE_THEMES['aipyram'];
}

interface SovereignAuthWrapperProps {
  nodeId: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function SovereignAuthWrapper({ nodeId, title, subtitle, children }: SovereignAuthWrapperProps) {
  const theme = getNodeTheme(nodeId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: `linear-gradient(135deg, ${theme.accent}08 0%, #FAFAF8 40%, #FFFFFF 60%, ${theme.accent}05 100%)`,
    }}>
      {/* Subtle animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.04] animate-pulse"
          style={{ background: `radial-gradient(circle, ${theme.accent}, transparent)`, animationDuration: '6s' }}
        />
        <div
          className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full opacity-[0.03] animate-pulse"
          style={{ background: `radial-gradient(circle, ${theme.accent}, transparent)`, animationDuration: '8s' }}
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 border border-white/60 p-8 sm:p-10">
          
          {/* Node Identity */}
          <div className="text-center mb-8">
            {/* Logo / Brand */}
            <div className="inline-flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})` }}
              >
                {theme.name[0]}
              </div>
              <span className="text-lg font-bold text-zinc-900 tracking-tight">{theme.name}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{title}</h1>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer — Sovereign SSO Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Sovereign SSO ile korunuyor — Tek hesap, tüm ekosistem</span>
          </div>
          <p className="text-[10px] text-zinc-300 mt-1">{theme.tagline}</p>
        </div>
      </div>
    </div>
  );
}

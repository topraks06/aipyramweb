'use client';

import React from 'react';
import { getAllSovereignNodeIds, getNode, type SovereignNodeId } from '@/lib/sovereign-config';
import { Activity, Lock } from 'lucide-react';

interface NodeSelectorProps {
  activeNode: string;
  onNodeChange: (SovereignNodeId: string) => void;
}

/**
 * ALOHA Admin — Node Seçici
 * Brutalist B2B terminal estetik: siyah zemin, 1px border, mono font.
 * sovereign-config.ts'den dinamik dolur.
 */
export default function NodeSelector({ activeNode, onNodeChange }: NodeSelectorProps) {
  const SovereignNodeIds = getAllSovereignNodeIds();

  return (
    <div className="flex items-center gap-1">
      {SovereignNodeIds.map((id) => {
        const config = getNode(id);
        const isActive = activeNode === id;
        const isDisabled = id === 'vorhang'; // Henüz hazır değil

        return (
          <button
            key={id}
            onClick={() => !isDisabled && onNodeChange(id)}
            disabled={isDisabled}
            className={`
              relative px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] 
              border transition-all duration-200
              ${isActive 
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' 
                : isDisabled
                  ? 'border-white/5 text-zinc-700 cursor-not-allowed'
                  : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300 cursor-pointer'
              }
            `}
          >
            <span className="flex items-center gap-1.5">
              {config.features.autonomous && (
                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              )}
              {isDisabled && <Lock className="w-3 h-3" />}
              {config.shortName}
            </span>
            {isActive && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

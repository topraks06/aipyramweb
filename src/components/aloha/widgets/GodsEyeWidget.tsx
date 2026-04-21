"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, ShieldAlert } from 'lucide-react';

export function GodsEyeWidget() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Satış Ajanı (Perde.ai)', status: 'active', x: 20, y: 30 },
    { id: 2, name: 'Tasarım Ajanı (Aipyram)', status: 'working', x: 70, y: 40 },
    { id: 3, name: 'Tedarik Ajanı (Kumaş)', status: 'conflict', x: 40, y: 70 },
    { id: 4, name: 'Finans Ajanı', status: 'active', x: 80, y: 80 },
    { id: 5, name: 'Pazarlama Ajanı', status: 'working', x: 30, y: 80 },
    { id: 6, name: 'Güvenlik Ajanı', status: 'active', x: 50, y: 50 },
    { id: 7, name: 'Lojistik Ajanı', status: 'working', x: 85, y: 20 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        x: Math.max(10, Math.min(90, agent.x + (Math.random() * 10 - 5))),
        y: Math.max(10, Math.min(90, agent.y + (Math.random() * 10 - 5))),
        status: Math.random() > 0.95 ? 'conflict' : Math.random() > 0.6 ? 'working' : 'active'
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-md font-mono">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Activity size={18} />
          <span className="text-sm font-semibold tracking-widest">TANRI GÖZÜ RADARI</span>
        </div>
        <span className="text-xs text-gray-500 animate-pulse">CANLI YAYIN</span>
      </div>

      <div className="relative w-full aspect-square bg-black rounded-full overflow-hidden border border-gray-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-br from-emerald-500/20 to-transparent right-1/2 bottom-1/2" style={{ borderRight: '2px solid rgba(16, 185, 129, 0.5)' }} />
        <div className="absolute inset-0 border border-gray-800 rounded-full m-8" />
        <div className="absolute inset-0 border border-gray-800 rounded-full m-16" />
        <div className="absolute inset-0 border border-gray-800 rounded-full m-24" />
        <div className="absolute w-full h-[1px] bg-gray-800" />
        <div className="absolute h-full w-[1px] bg-gray-800" />

        {agents.map(agent => (
          <motion.div
            key={agent.id}
            animate={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full group cursor-pointer z-10"
            style={{
              backgroundColor: agent.status === 'active' ? '#10b981' : agent.status === 'working' ? '#eab308' : '#ef4444',
              boxShadow: `0 0 10px ${agent.status === 'active' ? '#10b981' : agent.status === 'working' ? '#eab308' : '#ef4444'}`
            }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-gray-700 z-20">
              {agent.name}<br/>
              <span className={agent.status === 'active' ? 'text-emerald-400' : agent.status === 'working' ? 'text-yellow-400' : 'text-red-400'}>
                {agent.status === 'active' ? 'BEKLEMEDE' : agent.status === 'working' ? 'İŞLEM YAPIYOR' : 'ÇATIŞMA / HATA'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-center">
        <div className="bg-gray-800/50 rounded p-2 border border-emerald-900/30">
          <CheckCircle2 size={14} className="text-emerald-400 mx-auto mb-1" />
          <span className="text-gray-400">AKTİF</span>
        </div>
        <div className="bg-gray-800/50 rounded p-2 border border-yellow-900/30">
          <Activity size={14} className="text-yellow-400 mx-auto mb-1" />
          <span className="text-gray-400">İŞLİYOR</span>
        </div>
        <div className="bg-gray-800/50 rounded p-2 border border-red-900/30">
          <ShieldAlert size={14} className="text-red-400 mx-auto mb-1" />
          <span className="text-gray-400">ÇATIŞMA</span>
        </div>
      </div>
    </div>
  );
}

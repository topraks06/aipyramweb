'use client';

import React from 'react';
import { Bot, LineChart, Activity, CircleCheck, AlertTriangle, Users, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ═══════════════════════════════════════════════════
// WIDGET PLUGIN REGISTRY — switch-case yerine map
// Yeni widget = 1 fonksiyon + registry'ye 1 satır
// ═══════════════════════════════════════════════════

function SuccessWidget({ response }: { response: any }) {
  return (
    <div className="border border-green-500/20 bg-green-500/5 p-4 flex gap-4 items-start max-w-2xl mt-4">
      <CircleCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-green-500 uppercase tracking-widest">İŞLEM BAŞARILI</p>
        <p className="text-xs text-green-500/70 font-mono mt-1">{response.alohaResponse}</p>
        {response.executedTool && (
          <p className="text-[10px] text-green-600/50 font-mono mt-2">tool: {response.executedTool} | tenant: {response.tenant || 'global'}</p>
        )}
      </div>
    </div>
  );
}

function MetricsChartWidget({ response }: { response: any }) {
  const data = response.data;
  return (
    <div className="border border-white/10 bg-black p-8 max-w-3xl mt-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
          <LineChart className="w-4 h-4" /> {data?.tenant ? `${data.tenant.toUpperCase()} İÇERİK İSTATİSTİĞİ` : 'AKTİF KULLANICI NABZI'}
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">GÜNCEL: REAL-TIME</div>
      </div>
      {data?.total !== undefined && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border border-white/5 p-4">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Toplam Makale</div>
            <div className="text-3xl font-black text-white tracking-tighter">{data.total}</div>
          </div>
          <div className="border border-white/5 p-4">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Son 24 Saat</div>
            <div className="text-3xl font-black text-blue-500 tracking-tighter">{data.last24h}</div>
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 h-32">
        {[40, 20, 60, 80, 50, 90, 70, 100, 60, 40].map((h, i) => (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 1, delay: i * 0.05 }}
            key={i}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500 transition-colors cursor-pointer border-t border-blue-500"
          />
        ))}
      </div>
    </div>
  );
}

function SystemStatusWidget({ response }: { response: any }) {
  const data = response.data;
  if (!data) return null;

  const entries = Object.entries(data).filter(([key]) => !['gemini', 'firebase'].includes(key));
  const infra = Object.entries(data).filter(([key]) => ['gemini', 'firebase'].includes(key));

  return (
    <div className="space-y-4 max-w-4xl mt-4">
      {/* Tenant kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {entries.map(([name, info]: [string, any]) => (
          <div key={name} className="border border-white/10 bg-black p-5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{name.toUpperCase()}</div>
            <div className="text-[9px] text-zinc-700 font-mono mb-4">{info.domain || ''}</div>
            <div className={`text-lg font-bold tracking-tighter flex items-center gap-2 ${info.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
              {info.status === 'online' ? <Activity className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {info.status === 'online' ? 'OPERATIONAL' : 'ERROR'}
            </div>
            {info.autonomous && <div className="text-[9px] text-blue-500 font-mono mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> OTONOM AKTİF</div>}
          </div>
        ))}
      </div>
      {/* Altyapı kartları */}
      <div className="grid grid-cols-2 gap-3">
        {infra.map(([name, info]: [string, any]) => (
          <div key={name} className="border border-white/5 bg-black/50 p-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{name}</span>
            <span className={`text-xs font-mono ${info.status === 'active' || info.status === 'connected' ? 'text-green-600' : 'text-amber-500'}`}>{info.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberListWidget({ response }: { response: any }) {
  const members = response.data;
  if (!members || !Array.isArray(members) || members.length === 0) {
    return (
      <div className="border border-zinc-800 p-6 mt-4 text-center text-zinc-600 text-sm font-mono">
        Kayıtlı üye bulunamadı.
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'text-green-500 bg-green-500/10 border-green-500/20',
    pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
    suspended: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <div className="border border-white/10 bg-black mt-4 max-w-4xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
        <Users className="w-4 h-4" /> ÜYE LİSTESİ ({members.length})
      </div>
      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {members.map((m: any, i: number) => (
          <div key={m.id || i} className="px-6 py-3 flex items-center justify-between hover:bg-white/[0.02] transition">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{m.name || m.email}</div>
              <div className="text-[10px] text-zinc-600 font-mono">{m.email} {m.company ? `• ${m.company}` : ''}</div>
            </div>
            <div className="flex items-center gap-3">
              {m.role && m.role !== 'member' && (
                <span className="text-[9px] px-2 py-0.5 border border-blue-500/20 text-blue-500 uppercase font-bold tracking-widest">
                  <Shield className="w-3 h-3 inline mr-1" />{m.role}
                </span>
              )}
              <span className={`text-[9px] px-2 py-0.5 border uppercase font-bold tracking-widest ${statusColors[m.license] || statusColors.pending}`}>
                {m.license || 'pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorWidget({ response }: { response: any }) {
  return (
    <div className="border border-red-500/20 bg-red-500/5 p-4 flex gap-4 items-center max-w-2xl mt-4 text-red-500 text-sm font-mono tracking-wide">
      <AlertTriangle className="w-5 h-5 shrink-0" /> {response.error || response.alohaResponse}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PLUGIN REGISTRY — yeni widget = 1 satır ekle
// ═══════════════════════════════════════════════════

const widgetRegistry: Record<string, React.FC<{ response: any }>> = {
  success: SuccessWidget,
  metricsChart: MetricsChartWidget,
  systemStatus: SystemStatusWidget,
  memberList: MemberListWidget,
  error: ErrorWidget,
};

// ═══════════════════════════════════════════════════
// MAIN CANVAS
// ═══════════════════════════════════════════════════

export default function DynamicCanvas({ items }: { items: any[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-24">
      <AnimatePresence>
        {items.map((item, index) => {
          // Widget seçimi — registry'den
          const widgetType = item.response.widgetType || item.response.type;
          const WidgetComponent = widgetRegistry[widgetType];

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              className="flex flex-col gap-6"
            >
              {/* User Command */}
              <div className="self-end text-sm text-zinc-500 font-mono">
                <span className="text-zinc-600 mr-4">[{item.timestamp}]</span>
                <span className="text-white">SOVEREIGN_CMD</span> $ {item.command}
              </div>

              {/* ALOHA Response */}
              <div className="flex gap-6 w-full">
                <div className="w-10 h-10 shrink-0 bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                  <Bot className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-4">
                  {/* Text Response */}
                  <div className="text-lg font-light leading-relaxed tracking-wide text-zinc-200">
                    {item.response.alohaResponse}
                  </div>

                  {/* Widget — plugin registry'den render */}
                  {WidgetComponent && <WidgetComponent response={item.response} />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAllSovereignNodeIds, getNode } from '@/lib/sovereign-config';
import { Activity, AlertTriangle, Cpu, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

interface ServiceHealth {
  status: string;
  detail?: string;
}

interface HealthData {
  systemStatus: string;
  timestamp: string;
  checks: Record<string, ServiceHealth>;
}

/**
 * ALOHA Admin — Canlı Sağlık Kartları
 * /api/health/deep endpoint'inden veri çeker.
 * Tüm node'lar + altyapı bileşenlerinin canlı durumunu gösterir.
 * Auto-refresh: 30 saniyede bir.
 */
export default function HealthCards() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health/deep', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
        setLastRefresh(new Date().toLocaleTimeString('tr-TR'));
      }
    } catch (e) {
      // Sessizce geç
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30 saniye
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const SovereignNodeIds = getAllSovereignNodeIds();

  const getStatusColor = (status: string) => {
    if (status.includes('✅') || status.includes('ALIVE') || status.includes('CONFIGURED')) return 'text-green-500';
    if (status.includes('⚠️') || status.includes('DEGRADED') || status.includes('OPTIONAL')) return 'text-amber-500';
    return 'text-red-500';
  };

  const getSystemStatusBg = (status: string) => {
    if (status.includes('OPERATIONAL')) return 'border-green-500/20 bg-green-500/5';
    if (status.includes('DEGRADED')) return 'border-amber-500/20 bg-amber-500/5';
    return 'border-red-500/20 bg-red-500/5';
  };

  return (
    <div className="space-y-3">
      {/* Genel Sistem Durumu */}
      <div className={`border p-3 ${healthData ? getSystemStatusBg(healthData.systemStatus) : 'border-white/10'}`}>
        <div className="flex items-center justify-between">
          <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
            SİSTEM
          </div>
          <button onClick={fetchHealth} className="text-zinc-600 hover:text-zinc-400 transition">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="text-sm font-bold mt-1">
          {healthData?.systemStatus || '...'}
        </div>
        {lastRefresh && (
          <div className="flex items-center gap-1 text-[8px] text-zinc-700 font-mono mt-1">
            <Clock className="w-2.5 h-2.5" /> {lastRefresh}
          </div>
        )}
      </div>

      {/* Node Kartları */}
      {SovereignNodeIds.map((id) => {
        const config = getNode(id);
        return (
          <div key={id} className="border border-white/5 p-3 hover:border-white/10 transition">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                {config.shortName}
              </div>
              {config.features.autonomous ? (
                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              ) : id === 'vorhang' ? (
                <WifiOff className="w-3 h-3 text-zinc-700" />
              ) : (
                <Wifi className="w-3 h-3 text-blue-500/50" />
              )}
            </div>
            <div className="text-[8px] text-zinc-700 font-mono">{config.domain}</div>
            <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
              config.features.autonomous ? 'text-green-600' : 
              id === 'vorhang' ? 'text-zinc-700' : 'text-blue-500/60'
            }`}>
              {config.features.autonomous ? 'OTONOM' : id === 'vorhang' ? 'BEKLEMEDE' : 'HAZIR'}
            </div>
          </div>
        );
      })}

      {/* Altyapı Kartları */}
      <div className="border-t border-white/5 pt-3 mt-3">
        <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-600 font-bold mb-2">
          ALTYAPI
        </div>
        {healthData?.checks && Object.entries(healthData.checks).map(([name, info]) => (
          <div key={name} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">
              {name.replace('_', ' ')}
            </span>
            <span className={`text-[9px] font-mono font-bold ${getStatusColor(info.status)}`}>
              {info.status.includes('✅') ? '●' : info.status.includes('⚠️') ? '◐' : '○'}
            </span>
          </div>
        ))}
        {!healthData?.checks && (
          <div className="text-[9px] text-zinc-700 font-mono">Yükleniyor...</div>
        )}
      </div>
    </div>
  );
}

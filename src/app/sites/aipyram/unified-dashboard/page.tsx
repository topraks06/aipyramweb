'use client';

import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight, LayoutDashboard, ShieldCheck, Box, Power, Activity, ScrollText, DollarSign, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';

interface SystemState {
  lockdown: boolean;
  global_kill_switch: boolean;
  reason: string;
  lastUpdated: string;
}

interface AuditEntry {
  id: string;
  nodeId?: string;
  action?: string;
  caller?: string;
  timestamp?: string;
  success?: boolean;
  error?: string;
}

interface HealthReport {
  status: string;
  news_total: number;
  news_with_images: number;
  missing_images: number;
  ticker_count: number;
  node_health?: Array<{
    domain: string;
    role: string;
    status: string;
    error_count: number;
  }>;
}

export default function UnifiedSovereignDashboard() {
  const { user, loading, role } = useSovereignAuth('aipyram' as any);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // System state
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      // Fetch system state
      const stateRes = await fetch('/api/admin/data?table=aloha_system_state');
      const stateJson = await stateRes.json();
      if (stateJson.success && stateJson.data) {
        const globalState = stateJson.data.find((d: any) => d.id === 'global');
        if (globalState) setSystemState(globalState);
      }

      // Fetch audit log
      const auditRes = await fetch('/api/admin/data?table=sovereign_audit_log');
      const auditJson = await auditRes.json();
      if (auditJson.success && auditJson.data) {
        setAuditLog(auditJson.data.slice(0, 20));
      }

      // Fetch health report
      const healthRes = await fetch('/api/health-full');
      const healthJson = await healthRes.json();
      setHealthReport(healthJson);
    } catch (err) {
      console.error('Dashboard veri çekme hatası:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && role === 'admin') {
      fetchDashboardData();
    }
  }, [mounted, user, role, fetchDashboardData]);

  const toggleKillSwitch = async () => {
    if (!systemState) return;
    setKillSwitchLoading(true);
    try {
      const newState = !systemState.global_kill_switch;
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'aloha_system_state',
          data: {
            id: 'global',
            global_kill_switch: newState,
            lockdown: newState,
            reason: newState ? 'Admin tarafından manuel kapatma' : 'Admin tarafından yeniden açıldı',
          }
        })
      });
      setSystemState(prev => prev ? { ...prev, global_kill_switch: newState, lockdown: newState, lastUpdated: new Date().toISOString() } : null);
    } catch (err) {
      console.error('Kill Switch hatası:', err);
    } finally {
      setKillSwitchLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Erişim Reddedildi</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Sovereign sistemine erişmek için lütfen giriş yapın.
        </p>
        <Button onClick={() => router.push('/aipyram/login')} variant="outline">
          Giriş Yap
        </Button>
      </div>
    );
  }

  const isKilled = systemState?.global_kill_switch || false;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Sovereign OS — Komuta Merkezi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hoş geldin, {user.displayName || user.email} — Tüm ekosistemi buradan yönet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchDashboardData} variant="ghost" size="sm" disabled={dataLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} /> Yenile
            </Button>
            <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-semibold text-primary capitalize flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {role}
            </div>
            {role === 'admin' && (
              <Button onClick={() => router.push('/admin')} variant="destructive" size="sm">
                MasterKokpit
              </Button>
            )}
          </div>
        </div>

        {/* ═══ KILL SWITCH + SYSTEM STATUS ROW ═══ */}
        {role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Kill Switch Card */}
            <Card className={`border-2 ${isKilled ? 'bg-red-950/50 border-red-500/50' : 'bg-emerald-950/30 border-emerald-500/30'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Power className={`h-5 w-5 ${isKilled ? 'text-red-400' : 'text-emerald-400'}`} />
                    Kill Switch
                  </CardTitle>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isKilled ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isKilled ? 'DURDURULDU' : 'AKTİF'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-zinc-400 mb-4">
                  {isKilled 
                    ? 'Tüm AI ajanları durduruldu. Hiçbir otonom işlem yapılamaz.' 
                    : 'Sistem normal çalışıyor. Tüm pipeline\'lar aktif.'}
                </p>
                {systemState?.reason && (
                  <p className="text-[10px] text-zinc-500 mb-3 italic">Son sebep: {systemState.reason}</p>
                )}
                <Button
                  className={`w-full font-bold ${isKilled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                  onClick={toggleKillSwitch}
                  disabled={killSwitchLoading}
                >
                  {killSwitchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                  {isKilled ? 'Sistemi Aç' : 'ACİL DURDUR'}
                </Button>
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Sistem Sağlığı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthReport ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Durum</span>
                      <span className={healthReport.status === 'OK' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {healthReport.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Toplam Haber</span>
                      <span className="text-white font-mono">{healthReport.news_total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Görselli</span>
                      <span className="text-emerald-400 font-mono">{healthReport.news_with_images}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Görsel Eksik</span>
                      <span className={`font-mono ${healthReport.missing_images > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {healthReport.missing_images}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Ticker</span>
                      <span className="text-white font-mono">{healthReport.ticker_count} sinyal</span>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-500 text-xs">Yükleniyor...</p>
                )}
              </CardContent>
            </Card>

            {/* Node Health Card */}
            <Card className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  Node Durumları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthReport?.node_health ? (
                  healthReport.node_health.map(node => (
                    <div key={node.domain} className="flex items-center justify-between py-1.5 border-b border-zinc-900 last:border-0">
                      <div className="flex items-center gap-2">
                        {node.status === 'online' 
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        }
                        <span className="text-sm font-medium">{node.domain}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {node.error_count > 0 && (
                          <span className="text-[10px] text-red-400 font-mono">{node.error_count} hata</span>
                        )}
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${node.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {node.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs">Yükleniyor...</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ AUDIT LOG ═══ */}
        {role === 'admin' && auditLog.length > 0 && (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-amber-400" />
                  Son Ajan İşlemleri (Audit Log)
                </CardTitle>
                <span className="text-[10px] text-zinc-500 font-mono">{auditLog.length} kayıt</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="text-left py-2 pr-4 font-medium">Zaman</th>
                      <th className="text-left py-2 pr-4 font-medium">Node</th>
                      <th className="text-left py-2 pr-4 font-medium">Aksiyon</th>
                      <th className="text-left py-2 pr-4 font-medium">Çağıran</th>
                      <th className="text-left py-2 font-medium">Sonuç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((entry) => (
                      <tr key={entry.id} className="border-b border-zinc-900/50 hover:bg-zinc-900/30">
                        <td className="py-2 pr-4 text-zinc-400 font-mono whitespace-nowrap">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-'}
                        </td>
                        <td className="py-2 pr-4 text-white font-medium">{entry.nodeId || '-'}</td>
                        <td className="py-2 pr-4 text-zinc-300">{entry.action || '-'}</td>
                        <td className="py-2 pr-4 text-zinc-400 font-mono">{entry.caller || '-'}</td>
                        <td className="py-2">
                          {entry.success === true 
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            : entry.success === false 
                              ? <XCircle className="h-4 w-4 text-red-400" />
                              : <span className="text-zinc-600">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ NODE KARTLARI ═══ */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-zinc-400 flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Hızlı Erişim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* TRTex */}
            <Card className="bg-zinc-950 border-zinc-800 hover:border-amber-500/50 transition-colors group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-amber-500">TRTex.com</CardTitle>
                  <Globe className="h-5 w-5 text-amber-500/50 group-hover:text-amber-500 transition-colors" />
                </div>
                <CardDescription>B2B İstihbarat & İhale Ağı</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Sektörel haberlere göz atın, açık ihalelere teklif verin ve global alıcılarla eşleşin.
                </p>
                <Button className="w-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black" onClick={() => router.push('/tr')}>
                  Terminal'i Aç <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Perde.ai */}
            <Card className="bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-500">Perde.ai</CardTitle>
                  <LayoutDashboard className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                </div>
                <CardDescription>Otonom Tasarım & Render Motoru</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Müşterilerinizin mekanlarında kumaşlarınızı anında 3D olarak giydirin ve B2B fiyatlandırın.
                </p>
                <Button className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black" onClick={() => window.open('https://perde.ai', '_blank')}>
                  Stüdyo'ya Git <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Icmimar.ai */}
            <Card className="bg-zinc-950 border-zinc-800 hover:border-blue-500/50 transition-colors group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-500">İcmimar.ai</CardTitle>
                  <Box className="h-5 w-5 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                </div>
                <CardDescription>Master Design Engine & ERP</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Mimarlar, mobilyacılar ve iç mimarlar için entegre B2B ERP ve profesyonel tasarım mutfağı.
                </p>
                <Button className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={() => window.open('https://icmimar.ai', '_blank')}>
                  ERP'yi Aç <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}

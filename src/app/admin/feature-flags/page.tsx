"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Save, Plus, Trash2, RefreshCw, Activity, AlertTriangle } from "lucide-react";
import { FeatureFlag, FeatureFlagStatus } from "@/core/aloha/deployGuard";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // New flag form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<FeatureFlagStatus>("disabled");
  const [newTraffic, setNewTraffic] = useState(0);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags");
      const data = await res.json();
      if (data.success) {
        setFlags(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleCreate = async () => {
    if (!newId || !newName) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          name: newName,
          status: newStatus,
          trafficPercentage: newTraffic
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("Feature flag başarıyla oluşturuldu.");
        setNewId("");
        setNewName("");
        setNewTraffic(0);
        setNewStatus("disabled");
        fetchFlags();
      } else {
        setStatusMsg(`Hata: ${data.error}`);
      }
    } catch (error) {
      setStatusMsg("Bağlantı hatası.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleUpdate = async (id: string, status: FeatureFlagStatus, trafficPercentage: number) => {
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, trafficPercentage })
      });
      const data = await res.json();
      if (data.success) {
        fetchFlags();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`"${id}" flagini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/feature-flags?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchFlags();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            DEPLOY GUARD <span className="text-slate-300 font-light">| Feature Flags</span>
          </h1>
          <p className="text-slate-500 mt-1">A/B testleri, kademeli dağıtımlar ve acil kapatma anahtarlarını yönetin.</p>
        </div>
        <button onClick={fetchFlags} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <RefreshCw className={`w-5 h-5 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-mono text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4" /> {statusMsg}
        </div>
      )}

      {/* Yeni Flag Ekleme Kartı */}
      <Card className="border-blue-900/20 bg-white/80 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> Yeni Feature Flag
          </CardTitle>
          <CardDescription>Sovereign Ağına yeni bir kontrol anahtarı ekleyin.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500">FLAG ID</label>
              <input
                type="text"
                placeholder="Örn: aloha_vision_v2"
                value={newId}
                onChange={e => setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500">AÇIKLAMA</label>
              <input
                type="text"
                placeholder="Örn: Yeni Vision Model"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500">STATUS</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as FeatureFlagStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value="disabled">Disabled (Kapalı)</option>
                <option value="shadow">Shadow (Sadece İzleme)</option>
                <option value="canary">Canary (% Yüzdeli Açık)</option>
                <option value="live">Live (Tamamen Açık)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-500">TRAFFIC %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newTraffic}
                disabled={newStatus !== 'canary'}
                onChange={e => setNewTraffic(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm disabled:opacity-50 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!newId || !newName || isSaving}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Ekle
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Aktif Flagler Listesi */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Kayıtlı Feature Flag'ler</h3>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse font-mono">Veriler Yükleniyor...</div>
        ) : flags.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-mono">
            Henüz hiç feature flag bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-4">
            {flags.map(flag => (
              <div key={flag.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Sol - Bilgiler */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base">{flag.id}</span>
                    {flag.status === 'live' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">LİVE</span>}
                    {flag.status === 'disabled' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">DİSABLED</span>}
                    {flag.status === 'shadow' && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">SHADOW</span>}
                    {flag.status === 'canary' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full">CANARY %{flag.trafficPercentage}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{flag.name}</p>
                </div>

                {/* Sağ - Kontroller */}
                <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <select
                    value={flag.status}
                    onChange={(e) => handleUpdate(flag.id, e.target.value as FeatureFlagStatus, flag.trafficPercentage)}
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-mono focus:outline-none min-w-[120px]"
                  >
                    <option value="disabled">Disabled</option>
                    <option value="shadow">Shadow</option>
                    <option value="canary">Canary</option>
                    <option value="live">Live</option>
                  </select>
                  
                  <div className="flex items-center gap-1 w-24">
                    <input
                      type="number"
                      value={flag.trafficPercentage}
                      disabled={flag.status !== 'canary'}
                      onChange={(e) => handleUpdate(flag.id, flag.status, Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm disabled:opacity-50 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-bold">%</span>
                  </div>

                  <button
                    onClick={() => handleDelete(flag.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

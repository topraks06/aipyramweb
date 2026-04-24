'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShieldAlert, Plus, Save, Trash2, Zap, Play, Activity } from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  status: 'disabled' | 'shadow' | 'canary' | 'live';
  trafficPercentage: number;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const snap = await getDocs(collection(db, 'feature_flags'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeatureFlag));
      setFlags(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (flag: FeatureFlag) => {
    try {
      await setDoc(doc(db, 'feature_flags', flag.id), flag);
      setEditingId(null);
      await fetchFlags();
    } catch (e) {
      console.error('Save error', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feature_flags', id));
      await fetchFlags();
    } catch (e) {
      console.error('Delete error', e);
    }
  };

  const handleAddNew = () => {
    const newFlag: FeatureFlag = {
      id: `feature_${Date.now()}`,
      name: 'Yeni Özellik',
      status: 'disabled',
      trafficPercentage: 0
    };
    setFlags([newFlag, ...flags]);
    setEditingId(newFlag.id);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif">AIPyram Feature Flags</h1>
            <p className="text-zinc-500 text-sm">DeployGuard Shadow & Canary Dağıtım Kontrolü</p>
          </div>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Flag
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
              {editingId === flag.id ? (
                <div className="flex-1 grid grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">ID (Key)</label>
                    <input 
                      type="text" 
                      value={flag.id}
                      onChange={e => setFlags(flags.map(f => f.id === flag.id ? { ...f, id: e.target.value } : f))}
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm text-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">İsim</label>
                    <input 
                      type="text" 
                      value={flag.name}
                      onChange={e => setFlags(flags.map(f => f.id === flag.id ? { ...f, name: e.target.value } : f))}
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm text-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Durum</label>
                    <select 
                      value={flag.status}
                      onChange={e => setFlags(flags.map(f => f.id === flag.id ? { ...f, status: e.target.value as any } : f))}
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm text-zinc-300"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="shadow">Shadow (Log Only)</option>
                      <option value="canary">Canary (A/B Test)</option>
                      <option value="live">Live (100%)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-zinc-500 mb-1">Trafik (%)</label>
                      <input 
                        type="number" 
                        value={flag.trafficPercentage}
                        onChange={e => setFlags(flags.map(f => f.id === flag.id ? { ...f, trafficPercentage: parseInt(e.target.value) || 0 } : f))}
                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-sm text-zinc-300"
                      />
                    </div>
                    <button onClick={() => handleSave(flag)} className="bg-emerald-600 p-2 rounded hover:bg-emerald-500 mt-5">
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-32">
                      <div className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Flag ID</div>
                      <div className="font-mono text-sm text-zinc-300">{flag.id}</div>
                    </div>
                    <div className="w-48">
                      <div className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Açıklama</div>
                      <div className="text-sm font-medium">{flag.name}</div>
                    </div>
                    <div className="w-32">
                      <div className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Deploy Fazı</div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        flag.status === 'live' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        flag.status === 'canary' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        flag.status === 'shadow' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {flag.status === 'live' && <Zap className="w-3 h-3" />}
                        {flag.status === 'canary' && <Activity className="w-3 h-3" />}
                        {flag.status === 'shadow' && <Play className="w-3 h-3" />}
                        {flag.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="w-48">
                       <div className="text-[10px] uppercase text-zinc-500 tracking-wider mb-1">Trafik Yönlendirmesi</div>
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                           <div className={`h-full ${flag.status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${flag.status === 'live' ? 100 : flag.status === 'disabled' ? 0 : flag.trafficPercentage}%` }} />
                         </div>
                         <span className="text-xs text-zinc-400 w-8">{flag.status === 'live' ? 100 : flag.status === 'disabled' ? 0 : flag.trafficPercentage}%</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingId(flag.id)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">Düzenle</button>
                    <button onClick={() => handleDelete(flag.id)} className="p-2 hover:bg-red-900/30 rounded text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {flags.length === 0 && (
             <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                Henüz feature flag tanımlanmadı. Sağ üstten yeni bir flag ekleyebilirsiniz.
             </div>
          )}
        </div>
      )}
    </div>
  );
}

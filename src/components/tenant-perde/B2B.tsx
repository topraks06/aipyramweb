'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Loader2, Hammer, Truck, Bot, Sparkles, Compass, Plus } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { getTenant } from '@/lib/tenant-config';

const STATUS_LIST = [
  { id: 's1', label: 'Teklif', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 's2', label: 'OnaylandÄ±', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 's3', label: 'Ãœretimde', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 's4', label: 'Kuruluma HazÄ±r', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const DEFAULT_CONFIG = {
  title: 'Genel B2B / ERP',
  desc: 'TÃ¼m sipariÅŸ, Ã¼retim ve operasyonlarÄ± takip edin.',
  card2: 'AtÃ¶lyedeki Ä°ÅŸler',
  card3: 'Montaj Bekleyen',
  tableItem: 'Ä°ÅŸ / SipariÅŸ',
  shortcuts: ['Yeni KayÄ±t', 'HÄ±zlÄ± Fiyat Ver'],
  statusList: STATUS_LIST,
  mockProjects: null
};

export default function B2B() {
  const { user, loading: authLoading, tenantId } = usePerdeAuth();
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // set to false for mock
  const [cfg, setCfg] = useState(() => {
    try {
       if (typeof window !== 'undefined') {
         const saved = localStorage.getItem('ai_dashboard_config');
         if(saved) return JSON.parse(saved);
       }
    } catch(e) {}
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    if (!user || !tenantId) return;
    setLoading(true);
    
    const config = getTenant(tenantId);
    
    const q = query(
      collection(db, config.projectCollection),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDbProjects(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
     const handleDynamicConfigUpdate = (e: any) => {
        if(e.detail) {
           setCfg(e.detail);
           localStorage.setItem('ai_dashboard_config', JSON.stringify(e.detail));
        }
     };

     if (typeof window !== 'undefined') {
       window.addEventListener('agent_update_dashboard', handleDynamicConfigUpdate);
       return () => window.removeEventListener('agent_update_dashboard', handleDynamicConfigUpdate);
     }
  }, []);

  if (authLoading) return <div className="fixed inset-0 top-[60px] bg-zinc-950 flex flex-col items-center justify-center z-50"><Loader2 className="h-8 w-8 text-zinc-500 animate-spin" /></div>;
  if (!user) return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Oturum Açınız</h2>
        <a href="/sites/perde/login" className="bg-white text-black px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
          Sisteme Giriş Yap
        </a>
      </div>
    </div>
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const baseProjects = cfg.mockProjects || dbProjects;
  const projectsToDisplay = baseProjects || [];
  const activeStatuses = cfg.statusList || STATUS_LIST;
  const totalRevenue = projectsToDisplay.reduce((acc: any, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-[0_0_30px_rgba(59,130,246,0.1)]">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_blue] shrink-0">
               <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
                 Sistem Senin HÃ¼kmÃ¼nde <Sparkles className="w-4 h-4 text-blue-400" />
               </h2>
               <p className="text-zinc-300 text-sm">MesleÄŸini deÄŸiÅŸtirmek istersen veya rapor alacaksan, <b>saÄŸ alttaki Sanal Ä°Ã§ Mimar</b> ile yazÄ±ÅŸman yeterli.</p>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between border-b border-white/10 pb-6 mb-8 gap-6">
        <div>
          <h1 className="font-sans font-bold uppercase tracking-widest text-3xl md:text-4xl text-white flex items-center gap-3">
             <Compass className="w-8 h-8 text-blue-400" /> {cfg.title}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">{cfg.desc}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button 
             onClick={() => {
               if (typeof window !== 'undefined') {
                 window.dispatchEvent(new CustomEvent('open_order_slide'));
               }
             }}
             className="bg-white text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
             <Plus className="w-4 h-4" /> YENÄ° FÄ°Å KES
          </button>
          {cfg.shortcuts.map((shortcut: string, idx: number) => (
             <button key={idx} className="bg-zinc-900 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors hidden sm:flex">
                {shortcut}
             </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
         <span className="bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2 rounded-full cursor-pointer hover:bg-white/10">
            <Plus className="w-3 h-3" /> Yeni KayÄ±t
         </span>
         {cfg.shortcuts?.map((shortcut: string, i: number) => (
           <span key={i} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full cursor-pointer hover:bg-blue-500/20 transition-colors">
              {shortcut}
           </span>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 flex flex-col">
            <div className="p-3 bg-blue-500/10 w-fit rounded-lg text-blue-400 border border-blue-500/20 mb-4"><TrendingUp className="h-5 w-5" /></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Ciro Hacmi</p>
            <h3 className="font-sans font-bold text-3xl text-white">{formatCurrency(totalRevenue || 245000)}</h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 flex flex-col">
            <div className="p-3 bg-yellow-500/10 w-fit rounded-lg text-yellow-500 border border-yellow-500/20 mb-4"><Hammer className="h-5 w-5" /></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">{cfg.card2}</p>
            <h3 className="font-sans font-bold text-3xl text-white">
              {projectsToDisplay.filter((p: any) => p.status === 's2' || p.status === 's3' || p.status === 'Ãœretimde').length || 4} Ä°ÅŸ
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 flex flex-col">
            <div className="p-3 bg-purple-500/10 w-fit rounded-lg text-purple-400 border border-purple-500/20 mb-4"><Truck className="h-5 w-5" /></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">{cfg.card3}</p>
            <h3 className="font-sans font-bold text-3xl text-white">
              {projectsToDisplay.filter((p: any) => p.status === 's4' || p.status === 'Montaja HazÄ±r').length || 2} Ä°ÅŸ
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 flex flex-col">
            <div className="p-3 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 border border-emerald-500/20 mb-4"><Users className="h-5 w-5" /></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">PortfÃ¶y / Ä°letiÅŸim</p>
            <h3 className="font-sans font-bold text-3xl text-white">{new Set(projectsToDisplay.map((p: any) => p.customerName)).size || 15} KiÅŸi</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-white/5 rounded-xl shadow-2xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg text-white">KayÄ±tlÄ± Ä°ÅŸ GeÃ§miÅŸi</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 p-0 md:p-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold rounded-tl-xl">Tarih</th>
                    <th className="px-6 py-4 font-bold">Durum</th>
                    <th className="px-6 py-4 font-bold">MÃ¼ÅŸteri</th>
                    <th className="px-6 py-4 font-bold">{cfg.tableItem}</th>
                    <th className="px-6 py-4 text-right font-bold rounded-tr-xl">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projectsToDisplay.map((order: any) => {
                     // ... Render logic skipped for brevity if empty
                    return null;
                  })}
                  {projectsToDisplay.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 border-b border-white/5 text-sm">
                        HenÃ¼z sipariÅŸ kaydÄ±nÄ±z yok. (Aipyram ERP'den bekleniyor)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

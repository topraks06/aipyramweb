'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Loader2, DollarSign, Activity, FileText, Users, ShieldAlert, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  const { user, loading: authLoading } = usePerdeAuth();
  const router = useRouter();
  
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNode, setActiveNode] = useState('icmimar');

  const nodes = [
    { id: 'icmimar', label: 'İcmimar.ai', color: 'red' },
    { id: 'perde', label: 'Perde.ai', color: 'emerald' },
    { id: 'trtex', label: 'TRTex.com', color: 'blue' },
    { id: 'hometex', label: 'Hometex.ai', color: 'purple' },
    { id: 'vorhang', label: 'Vorhang.ai', color: 'amber' }
  ];

  // Süper Admin Email Kontrolü
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hakantoprak71@gmail.com';

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push(basePath);
      return;
    }

    async function fetchAdminData() {
      try {
        setLoading(true);
        // Üyeleri çek
        const memberSnap = await getDocs(query(collection(db, `${activeNode}_members`), orderBy('createdAt', 'desc')));
        const memberData = memberSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(memberData);

        // Projeleri/Renderları çek
        try {
          const projectSnap = await getDocs(query(collection(db, `${activeNode}_orders`), orderBy('createdAt', 'desc')));
          setProjects(projectSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
          console.warn(`${activeNode}_orders koleksiyonu henüz yok veya okunamadı.`);
          setProjects([]);
        }
        
      } catch (err) {
        console.error("Admin verileri çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAdminData();
  }, [user, authLoading, router, basePath, ADMIN_EMAIL, activeNode]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="h-8 w-8 text-[#8B7355] animate-spin" /></div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const activeMembers = members.filter(m => m.license === 'active' || m.onboardingCompleted).length;
  const totalVolume = projects.reduce((acc, p) => acc + (p.totalAmount || p.grandTotal || 0), 0);
  const totalCommission = totalVolume * 0.05; // %5 Komisyon örneği

  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              <h1 className="font-serif text-4xl tracking-tight">Sovereign Master Node</h1>
            </div>
            <p className="text-zinc-400 text-sm font-light">
              Geliştirici veya Sistem Sahibi olarak tüm platform verilerini, ekosistemdeki toplam ticareti ve üyeleri görüntüleyin.
            </p>
          </div>
          <div className="bg-red-500/10 text-red-400 text-[10px] px-4 py-2 font-mono uppercase tracking-widest border border-red-500/20">
            SuperAdmin Mode Active
          </div>
        </div>

        {/* Node Shortcuts */}
        <div className="flex flex-wrap gap-4 mb-8">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setActiveNode(node.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeNode === node.id ? `bg-${node.color}-500 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <Globe className="w-4 h-4" /> {node.label}
            </button>
          ))}
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400"><Users className="h-5 w-5" /></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Toplam Üye</p>
            </div>
            <h3 className="font-serif text-3xl">{members.length}</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400"><Activity className="h-5 w-5" /></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Aktif Üye</p>
            </div>
            <h3 className="font-serif text-3xl">{activeMembers}</h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#8B7355]/10 text-[#8B7355]"><FileText className="h-5 w-5" /></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Sipariş Hacmi</p>
            </div>
            <h3 className="font-serif text-3xl">{formatCurrency(totalVolume)}</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-400"><DollarSign className="h-5 w-5" /></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Komisyon (%5)</p>
            </div>
            <h3 className="font-serif text-3xl text-amber-400">{formatCurrency(totalCommission)}</h3>
          </div>
        </div>

        {/* Üyeler Tablosu */}
        <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800 bg-black/40 flex justify-between items-center">
            <h2 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Platform Üyeleri</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-950/50">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-zinc-800">Firma / Üye</th>
                  <th className="px-6 py-4 font-bold border-b border-zinc-800">E-Posta</th>
                  <th className="px-6 py-4 font-bold border-b border-zinc-800">Meslek</th>
                  <th className="px-6 py-4 font-bold border-b border-zinc-800">Kayıt Tarihi</th>
                  <th className="px-6 py-4 font-bold border-b border-zinc-800">Durum</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-light">Kayıtlı üye bulunmuyor.</td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-zinc-200 font-medium">{m.company || '-'}</div>
                        <div className="text-zinc-500 text-xs">{m.name}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{m.email}</td>
                      <td className="px-6 py-4 text-zinc-400 text-xs uppercase tracking-wider">{m.profession?.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString('tr-TR') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {m.onboardingCompleted ? (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">Aktif</span>
                        ) : (
                          <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">Bekliyor</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

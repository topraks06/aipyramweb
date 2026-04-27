'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, Users, Loader2, Hammer, Truck, Bot, Sparkles, Compass, Plus, 
  FileText, CheckCircle, Wallet, Package, Fingerprint, Palette, FolderOpen, UserCircle, LogOut 
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { getNode } from '@/lib/sovereign-config';
import OrderSlideOver from './OrderSlideOver';
import { Accounting } from './Accounting';
import { Inventory } from './Inventory';
import Catalog from './Catalog';
import MyProjects from './MyProjects';
import UserProfile from './profile/UserProfile';

const STATUS_LIST = [
  { id: 's1', label: 'Teklif', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 's2', label: 'Onaylandı', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 's3', label: 'Üretimde', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 's4', label: 'Kuruluma Hazır', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'opportunity', label: 'Fırsat', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

const DEFAULT_CONFIG = {
  title: 'Genel B2B / ERP',
  desc: 'Tüm sipariş, üretim ve operasyonları takip edin.',
  card2: 'Atölyedeki İşler',
  card3: 'Montaj Bekleyen',
  tableItem: 'İş / Sipariş',
  shortcuts: ['Yeni Kayıt', 'Hızlı Fiyat Ver'],
  statusList: STATUS_LIST,
  initialProjects: null
};

export default function B2B() {
  const router = useRouter();
  const { user, loading: authLoading, SovereignNodeId, isLicensed, logout } = useSovereignAuth('icmimar');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'catalog' | 'accounting' | 'inventory' | 'customers' | 'profile'>('dashboard');
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
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
    if (!user || !SovereignNodeId) return;
    setLoading(true);
    
    const config = getNode(SovereignNodeId);
    
    const q1 = query(
      collection(db, config.projectCollection),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const q2 = query(
      collection(db, 'b2b_opportunities'),
      orderBy('createdAt', 'desc')
    );
    const q3 = query(
      collection(db, config.customerCollection || 'customers'),
      where('SovereignNodeId', '==', SovereignNodeId),
      orderBy('createdAt', 'desc')
    );

    let projects: any[] = [];
    let opportunities: any[] = [];
    let customers: any[] = [];

    const mergeData = () => {
      const recentOps = opportunities.slice(0, 5);
      setDbProjects([...recentOps, ...projects].sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      }));
      setLoading(false);
    };

    const unsub1 = onSnapshot(q1, (snapshot) => {
      projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeData();
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      opportunities = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeData();
    });

    const unsub3 = onSnapshot(q3, (snapshot) => {
      customers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setDbCustomers(customers);
    }, (err) => {
      console.warn("Müşteri CRM verisi çekilemedi:", err);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user, SovereignNodeId]);

  if (authLoading) return <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50"><Loader2 className="h-8 w-8 text-zinc-500 animate-spin" /></div>;
  
  if (!user) return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Oturum Açınız</h2>
        <a href="/sites/icmimar/login" className="bg-white text-black px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
          Sisteme Giriş Yap
        </a>
      </div>
    </div>
  );

  if (user && !isLicensed) return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Lisansınız Aktif Değil</h2>
        <p className="text-zinc-400 mb-6 max-w-sm mx-auto">Sistemi kullanabilmek için aktif bir kurumsal lisansa ihtiyacınız var.</p>
        <a href="/sites/icmimar/pricing" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
          Kurumsal Üyelik Paketleri
        </a>
      </div>
    </div>
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const projectsToDisplay = dbProjects || [];
  const activeStatuses = cfg.statusList || STATUS_LIST;
  const totalRevenue = projectsToDisplay.reduce((acc: any, curr: any) => acc + (Number(curr.grandTotal) || 0), 0);

  // Müşteri Silme İşlemi (Basit)
  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      try {
         const config = getNode(SovereignNodeId as string);
         await deleteDoc(doc(db, config.customerCollection || 'customers', id));
      } catch(err) {
         console.error("Müşteri silinirken hata:", err);
      }
    }
  };

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'GENEL BAKIŞ', icon: Compass },
    { id: 'projects', label: 'PROJELERİM', icon: FolderOpen },
    { id: 'catalog', label: 'KATALOG & STOK', icon: Package },
    { id: 'customers', label: 'MÜŞTERİ REHBERİ', icon: Users },
    { id: 'accounting', label: 'FİNANS & CARİ', icon: Wallet },
    { id: 'inventory', label: 'KUMAŞ DEPOSU', icon: Hammer },
    { id: 'profile', label: 'PROFİL & AYARLAR', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-black/50 border-r border-white/10 flex flex-col justify-between backdrop-blur-xl shrink-0 z-20">
         <div className="p-6">
            <div className="flex items-center gap-3 mb-10 text-white">
               <Fingerprint className="w-8 h-8 text-blue-500" />
               <span className="text-xl font-bold tracking-widest uppercase">İcmimar.ai</span>
            </div>
            
            <nav className="space-y-2">
               <Link href="/sites/icmimar/visualizer" className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-[11px] font-bold text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg uppercase tracking-widest">
                  <Palette className="w-4 h-4" />
                  TASARIM STÜDYOSU
               </Link>
               
               {NAV_ITEMS.map(item => {
                 const Icon = item.icon;
                 const isActive = activeTab === item.id;
                 return (
                   <button 
                     key={item.id}
                     onClick={() => setActiveTab(item.id as any)}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-medium transition-colors uppercase tracking-widest
                       ${isActive ? 'text-white bg-blue-600 shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                     `}
                   >
                      <Icon className="w-4 h-4" />
                      {item.label}
                   </button>
                 );
               })}
            </nav>
         </div>
         
         <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-400 font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{user?.email}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">İşletme Hesabı</p>
               </div>
            </div>
            <button onClick={async () => { await logout(); router.push('/sites/icmimar/login'); }} className="w-full py-3 text-[10px] font-bold flex justify-center items-center gap-2 text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-widest">
               <LogOut className="w-4 h-4" /> ÇIKIŞ YAP
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05)_0%,transparent_50%)]">
         
         {activeTab === 'projects' && <MyProjects />}
         {activeTab === 'catalog' && <Catalog />}
         {activeTab === 'accounting' && <Accounting projects={projectsToDisplay} />}
         {activeTab === 'inventory' && <Inventory />}
         {activeTab === 'profile' && <UserProfile />}
         
         {activeTab === 'customers' && (
           <div className="max-w-7xl mx-auto px-6 py-12">
             <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <div>
                  <h1 className="font-sans font-bold uppercase tracking-widest text-3xl text-white flex items-center gap-3">
                     MÜŞTERİ REHBERİ
                  </h1>
                  <p className="text-zinc-400 text-sm mt-1">Sisteme kayıtlı müşterilerinizi yönetin.</p>
                </div>
             </div>
             
             <Card className="bg-zinc-900 border-white/5 rounded-xl shadow-2xl">
               <CardContent className="p-0">
                 <div className="overflow-x-auto custom-scrollbar">
                   <table className="w-full text-sm text-left">
                     <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-black/40 border-b border-white/10">
                       <tr>
                         <th className="px-6 py-4 font-bold rounded-tl-xl">Ad Soyad</th>
                         <th className="px-6 py-4 font-bold">Telefon</th>
                         <th className="px-6 py-4 font-bold">E-Posta</th>
                         <th className="px-6 py-4 font-bold">Adres</th>
                         <th className="px-6 py-4 font-bold rounded-tr-xl text-right">İşlem</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                       {dbCustomers.length > 0 ? dbCustomers.map(customer => (
                         <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4 whitespace-nowrap text-white font-bold">{customer.name}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-zinc-300">{customer.phone || '-'}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-zinc-300">{customer.email || '-'}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-zinc-400 truncate max-w-[200px]">{customer.address || '-'}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-right">
                             <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest">Sil</button>
                           </td>
                         </tr>
                       )) : (
                         <tr><td colSpan={5} className="py-12 text-center text-zinc-500 border-b border-white/5 text-sm">Henüz kayıtlı müşteri yok.</td></tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           </div>
         )}

         {activeTab === 'dashboard' && (
           <div className="max-w-7xl mx-auto px-6 py-8">
             <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_blue] shrink-0">
                      <Bot className="w-7 h-7 text-white" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-2">
                        Sistem Senin Hükmünde <Sparkles className="w-4 h-4 text-blue-400" />
                      </h2>
                      <p className="text-zinc-300 text-sm">Mesleğini değiştirmek istersen veya rapor alacaksan, <b>sağ alttaki Sanal İç Mimar</b> ile yazışman yeterli.</p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between border-b border-white/10 pb-6 mb-8 gap-6">
               <div>
                 <h1 className="font-sans font-bold uppercase tracking-widest text-3xl md:text-4xl text-white flex items-center gap-3">
                    <Compass className="w-8 h-8 text-blue-400" /> FIRSATLAR & SİPARİŞLER
                 </h1>
                 <p className="text-zinc-400 text-sm mt-1">{cfg.desc}</p>
               </div>
               <div className="flex flex-wrap gap-2 items-center">
                 <button 
                    onClick={() => setIsCreateMode(true)}
                    className="bg-white text-black font-bold uppercase tracking-widest text-[10px] px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                 >
                    <Plus className="w-4 h-4" /> YENİ FİŞ KES
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
               {/* Stat Cards */}
               <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <CardContent className="p-6 flex flex-col">
                   <div className="p-3 bg-blue-500/10 w-fit rounded-lg text-blue-400 border border-blue-500/20 mb-4"><Sparkles className="h-5 w-5" /></div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Stüdyo Etkileşimi (Render)</p>
                   <h3 className="font-sans font-bold text-3xl text-white">{Math.max(120, projectsToDisplay.length * 8)} <span className="text-sm font-normal text-zinc-500">adet</span></h3>
                 </CardContent>
               </Card>
               
               <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
                 <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <CardContent className="p-6 flex flex-col">
                   <div className="p-3 bg-yellow-500/10 w-fit rounded-lg text-yellow-500 border border-yellow-500/20 mb-4"><FileText className="h-5 w-5" /></div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Otomatik Teklif Sayısı</p>
                   <div className="flex items-end gap-3">
                     <h3 className="font-sans font-bold text-3xl text-white">
                       {projectsToDisplay.filter((p: any) => p.status === 's1' || p.status === 'Teklif').length}
                     </h3>
                   </div>
                 </CardContent>
               </Card>

               <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
                 <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <CardContent className="p-6 flex flex-col">
                   <div className="p-3 bg-emerald-500/10 w-fit rounded-lg text-emerald-400 border border-emerald-500/20 mb-4"><CheckCircle className="h-5 w-5" /></div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Kazanılan Siparişler</p>
                   <div className="flex items-end gap-3">
                     <h3 className="font-sans font-bold text-3xl text-white">
                       {projectsToDisplay.filter((p: any) => ['s2', 's3', 's4', 'Onaylandı', 'Üretimde', 'Kuruluma Hazır'].includes(p.status)).length}
                     </h3>
                   </div>
                 </CardContent>
               </Card>

               <Card className="bg-zinc-900 border-white/10 rounded-xl overflow-hidden relative group">
                 <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <CardContent className="p-6 flex flex-col">
                   <div className="p-3 bg-purple-500/10 w-fit rounded-lg text-purple-400 border border-purple-500/20 mb-4"><TrendingUp className="h-5 w-5" /></div>
                   <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Ciro Hacmi</p>
                   <h3 className="font-sans font-bold text-3xl text-white">{formatCurrency(totalRevenue || 0)}</h3>
                 </CardContent>
               </Card>
             </div>

             <Card className="bg-zinc-900 border-white/5 rounded-xl shadow-2xl">
               <CardHeader className="border-b border-white/5 pb-4">
                 <CardTitle className="text-lg text-white">Kayıtlı İş Geçmişi</CardTitle>
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
                           <th className="px-6 py-4 font-bold">Müşteri</th>
                           <th className="px-6 py-4 font-bold">{cfg.tableItem}</th>
                           <th className="px-6 py-4 text-right font-bold rounded-tr-xl">Tutar</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {projectsToDisplay.map((order: any) => {
                           const statusConfig = activeStatuses.find((s: any) => s.id === order.status) || activeStatuses[0];
                           const isAbandoned = order.status === 's1' && order.createdAt?.seconds && (Date.now()/1000 - order.createdAt.seconds > 86400); 
                           return (
                             <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setActiveOrder(order)}>
                               <td className="px-6 py-4 whitespace-nowrap text-zinc-300">
                                  {order.createdAt?.seconds 
                                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('tr-TR') 
                                    : 'Tarih Yok'}
                                  {isAbandoned && <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 uppercase tracking-widest">Kapanmadı</span>}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                                   {statusConfig.label}
                                 </span>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-zinc-200 font-medium">
                                 {order.source === 'vorhang_bridge' && (
                                   <span className="mr-2 inline-flex" title="Vorhang Avrupa Siparişi">🇪🇺</span>
                                 )}
                                 {order.source === 'trtex_news_trigger' && (
                                   <span className="mr-2 inline-flex text-orange-500" title="TRTEX Otonom Fırsat">🎯</span>
                                 )}
                                 {order.customerName || 'Bilinmiyor'}
                                 {order.source === 'vorhang_bridge' && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-green-500/20 text-green-400 uppercase tracking-widest border border-green-500/30">İHRACAT</span>
                                 )}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                                 {order.items?.length > 0 ? `${order.items.length} Kalem` : order.title || 'İş/Proje'}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-white group-hover:text-blue-400 transition-colors">
                                 {order.source === 'vorhang_bridge' && order.exportTotal ? (
                                   <div className="flex flex-col items-end">
                                     <span>€{order.exportTotal.toFixed(2)}</span>
                                     <span className="text-[9px] text-zinc-500 mt-0.5">({formatCurrency(Number(order.grandTotal || order.amount || 0))})</span>
                                   </div>
                                 ) : (
                                   formatCurrency(Number(order.grandTotal || order.amount || 0))
                                 )}
                               </td>
                             </tr>
                           );
                         })}
                         {projectsToDisplay.length === 0 && (
                           <tr>
                             <td colSpan={5} className="py-12 text-center text-zinc-500 border-b border-white/5 text-sm">
                               Henüz sipariş kaydınız yok. (Aipyram ERP'den bekleniyor)
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
         )}
      </main>
      
      <OrderSlideOver 
        isOpen={!!activeOrder || isCreateMode} 
        onClose={() => { setActiveOrder(null); setIsCreateMode(false); }} 
        order={activeOrder}
        isCreateMode={isCreateMode}
      />
    </div>
  );
}

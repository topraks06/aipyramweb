"use client";

import PerdeNavbar from "../PerdeNavbar";
import { LineChart, LayoutDashboard, Package, ShoppingBag, Settings, Plus, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useSovereignAuth } from "@/hooks/useSovereignAuth";

export default function MarketplaceSellerDashboard({ basePath = "" }: { basePath?: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSovereignAuth('perde');
  const sellerId = user?.uid || "test_seller_id"; // Auth provider'dan gelecek

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "perde_marketplace_orders"),
          where("sellerId", "==", sellerId),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const orderData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(orderData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-zinc-900 font-sans selection:bg-[#8B7355] selection:text-white">
      <PerdeNavbar theme="light" />
      
      <div className="pt-20 flex min-h-[calc(100vh-80px)] max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-zinc-200 hidden md:block shrink-0">
           <div className="p-6 sticky top-24">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Yönetim Paneli</div>
              <nav className="space-y-1">
                 <Link href={`${basePath}/seller/dashboard`} className="flex items-center gap-3 text-[#8B7355] bg-[#8B7355]/10 px-4 py-3 rounded-lg font-bold text-sm tracking-wide">
                   <LayoutDashboard className="w-5 h-5" /> Özet
                 </Link>
                 <Link href={`${basePath}/seller/products`} className="flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4 py-3 rounded-lg font-medium text-sm transition-colors">
                   <Package className="w-5 h-5" /> Ürünlerim
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4 py-3 rounded-lg font-medium text-sm transition-colors">
                   <ShoppingBag className="w-5 h-5" /> Siparişler
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4 py-3 rounded-lg font-medium text-sm transition-colors">
                   <LineChart className="w-5 h-5" /> Analiz
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4 py-3 rounded-lg font-medium text-sm transition-colors">
                   <Settings className="w-5 h-5" /> Mağaza Ayarları
                 </Link>
              </nav>

              <div className="mt-12 bg-zinc-900 rounded-xl p-4 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-6 h-6 text-[#8B7355] opacity-50" />
                 </div>
                 <h4 className="font-bold text-sm mb-1">AI Tasarım Stüdyosu</h4>
                 <p className="text-xs text-zinc-400 mb-4 font-light leading-relaxed">Kendi tasarımlarınızı AI ile oluşturup tek tıkla satışa sunun.</p>
                 <Link href={`${basePath}/visualizer`} className="block w-full py-2 bg-white text-black text-center rounded-md text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors">
                    Stüdyoya Git
                 </Link>
              </div>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 lg:p-12">
           <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif tracking-tight">Hoş Geldiniz, <span className="font-medium text-[#8B7355]">Örnek Perde Evi</span></h1>
              <Link href={`${basePath}/seller/products`} className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-[#8B7355] transition-colors shadow-lg">
                <Plus className="w-4 h-4" /> Yeni Ürün
              </Link>
           </div>

           {/* Quick Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Aylık Ciro", value: "₺24.500", trend: "+12.5%", isUp: true },
                { label: "Bekleyen Sipariş", value: "14", trend: "-2", isUp: false },
                { label: "AI İle Denenme Sayısı", value: "1.204", trend: "+45%", isUp: true }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                   <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
                   <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${stat.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                         {stat.isUp && <TrendingUp className="w-3 h-3" />}
                         {stat.trend}
                      </p>
                   </div>
                </div>
              ))}
           </div>

           {/* Recent Activity */}
           <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                 <h2 className="font-serif text-xl tracking-tight">Son Siparişler</h2>
                 <Link href="#" className="text-xs font-bold text-[#8B7355] hover:text-black uppercase tracking-widest transition-colors">Tümünü Gör</Link>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-zinc-500 font-light text-sm">Siparişler yükleniyor...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 font-light text-sm">Henüz hiç siparişiniz yok. Tasarım stüdyosunu kullanarak ürün yelpazenizi genişletebilirsiniz.</div>
              ) : (
                <div className="divide-y divide-zinc-50">
                   {orders.map((order, i) => (
                      <div key={order.id || i} className="px-6 py-5 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-500 group-hover:bg-[#8B7355] group-hover:text-white transition-colors">
                               <Package className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="font-bold tracking-wide">Sipariş #{order.id?.slice(0, 8).toUpperCase() || 'P-1234'}</p>
                               <p className="text-sm text-zinc-500 font-light mt-0.5">{order.itemTitle || 'AI Özel Tasarım'} • {order.quantity || 1} Adet</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-lg">₺{((order.amount || 0) * (order.quantity || 1)).toLocaleString('tr-TR')}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest inline-block px-2.5 py-1 rounded-md mt-1.5 ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                              'bg-zinc-100 text-zinc-800'
                            }`}>
                              {order.status === 'completed' ? 'Tamamlandı' : order.status === 'processing' ? 'Hazırlanıyor' : 'Beklemede'}
                            </p>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
}

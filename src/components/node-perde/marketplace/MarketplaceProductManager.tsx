"use client";

import PerdeNavbar from "../PerdeNavbar";
import { Package, Plus, Search, Edit, Trash2, LayoutDashboard, ShoppingBag, LineChart, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useSovereignAuth } from "@/hooks/useSovereignAuth";

export default function MarketplaceProductManager({ basePath = "" }: { basePath?: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSovereignAuth('perde');
  const sellerId = user?.uid || "test_seller_id"; // Auth provider'dan gelecek

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "perde_marketplace_products"),
          where("sellerId", "==", sellerId)
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
                 <Link href={`${basePath}/seller/dashboard`} className="flex items-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-4 py-3 rounded-lg font-medium text-sm transition-colors">
                   <LayoutDashboard className="w-5 h-5" /> Özet
                 </Link>
                 <Link href={`${basePath}/seller/products`} className="flex items-center gap-3 text-[#8B7355] bg-[#8B7355]/10 px-4 py-3 rounded-lg font-bold text-sm tracking-wide transition-colors">
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
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl font-serif tracking-tight">Ürün Yönetimi</h1>
              <div className="flex gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Ürün ara..." 
                      className="w-full pl-9 pr-4 py-2.5 rounded-full border border-zinc-200 text-sm outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all"
                    />
                 </div>
                 <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-[#8B7355] transition-colors shadow-lg shrink-0">
                   <Plus className="w-4 h-4" /> Yeni Ürün
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              {loading ? (
                 <div className="p-12 text-center text-zinc-500 font-light text-sm flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#8B7355] rounded-full animate-spin mb-4"></div>
                    Ürünleriniz yükleniyor...
                 </div>
              ) : products.length === 0 ? (
                 <div className="p-16 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                       <Package className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif mb-2">Henüz ürün eklemediniz</h3>
                    <p className="text-zinc-500 font-light mb-6 max-w-sm">Mağazanıza ilk ürününüzü ekleyerek satışa hemen başlayabilirsiniz.</p>
                    <button className="bg-zinc-900 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-[#8B7355] transition-colors">
                      <Plus className="w-4 h-4" /> Yeni Ürün Ekle
                    </button>
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200">
                             <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ürün Bilgisi</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fiyat</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stok</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Durum</th>
                             <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">İşlemler</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-zinc-100">
                          {products.map(product => (
                             <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0 relative">
                                         {product.aiRenderedImages?.[0] || product.images?.[0] ? (
                                            <img src={product.aiRenderedImages?.[0] || product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                               <Package className="w-5 h-5" />
                                            </div>
                                         )}
                                      </div>
                                      <div>
                                         <p className="font-bold text-sm text-zinc-900 group-hover:text-[#8B7355] transition-colors">{product.title}</p>
                                         <p className="text-xs text-zinc-500 mt-0.5">{product.category || 'Kategorisiz'}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="font-bold">₺{product.price?.toLocaleString('tr-TR')}</p>
                                </td>
                                <td className="px-6 py-4">
                                   <p className="text-sm font-medium">{product.stock || 0} Adet</p>
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${
                                      product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                                   }`}>
                                      {product.status === 'active' ? 'Satışta' : 'Pasif'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 text-zinc-400 hover:text-[#8B7355] hover:bg-[#8B7355]/10 rounded-lg transition-colors">
                                         <Edit className="w-4 h-4" />
                                      </button>
                                      <button className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
}

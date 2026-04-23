import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { getNode } from '@/lib/sovereign-config';

export function Inventory() {
  const { user, SovereignNodeId } = usePerdeAuth();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !SovereignNodeId) return;

    const config = getNode(SovereignNodeId);
    const q = query(
      collection(db, config.productCollection || 'products'),
      where('authorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInventoryItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, SovereignNodeId]);

  const criticalItemsCount = inventoryItems.filter(item => (item.stock || 0) < 10).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Stok & Envanter</h2>
          <p className="text-sm text-zinc-400">Üretim hammaddeleri ve katalog stok takibi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Layers className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Kalem</p>
            <h3 className="text-4xl font-bold text-white">{loading ? '...' : inventoryItems.length}</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Kritik Stok Uyarıları</p>
            <h3 className="text-4xl font-bold text-white">{loading ? '...' : criticalItemsCount}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Depo Durumu</CardTitle>
          <button onClick={() => window.location.href = '/sites/perde/catalog'} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white text-black hover:bg-zinc-200 transition-colors rounded">
            Kataloğa Git
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-zinc-500 animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-black/40 border-y border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-bold">Stok Kodu / ID</th>
                    <th className="px-6 py-4 font-bold">Ürün Adı</th>
                    <th className="px-6 py-4 font-bold text-right">Miktar</th>
                    <th className="px-6 py-4 font-bold">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventoryItems.map((item) => {
                    const isCritical = (item.stock || 0) < 10;
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-mono text-xs">
                          {item.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                          {item.name || 'İsimsiz Ürün'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white">
                          {(item.stock || 0).toLocaleString('tr-TR')} <span className="text-zinc-500 text-xs font-normal ml-1">Adet/M</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {isCritical ? 'Kritik Seviye' : 'Yeterli'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {inventoryItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500 text-xs">Katalogda henüz ürün bulunmuyor.</td>
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

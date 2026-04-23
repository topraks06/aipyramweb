import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Layers, AlertCircle } from 'lucide-react';

export function Inventory() {
  // Simüle edilmiş stok verisi
  const inventoryItems = [
    { id: 1, name: 'Premium Blackout Kumaş (Antrasit)', sku: 'BLK-01', stock: 1240, unit: 'Metre', status: 'Yeterli', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 2, name: 'Keten Fon Perdelik (Bej)', sku: 'KTN-04', stock: 85, unit: 'Metre', status: 'Kritik', color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 3, name: 'Jakarlı Damask (Altın)', sku: 'JQD-02', stock: 450, unit: 'Metre', status: 'Yeterli', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 4, name: 'Somfy Motor Sistemi (Sessiz)', sku: 'SMF-99', stock: 12, unit: 'Adet', status: 'Azalıyor', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Stok & Envanter</h2>
          <p className="text-sm text-zinc-400">Üretim hammaddeleri ve Hometex / Vorhang entegre stok takibi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Layers className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Toplam Kalem</p>
            <h3 className="text-4xl font-bold text-white">{inventoryItems.length}</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Kritik Stok Uyarıları</p>
            <h3 className="text-4xl font-bold text-white">1</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white">Depo Durumu</CardTitle>
          <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-white text-black hover:bg-zinc-200 transition-colors rounded">
            Yeni Giriş Ekle
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-black/40 border-y border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold">Stok Kodu</th>
                  <th className="px-6 py-4 font-bold">Ürün / Materyal</th>
                  <th className="px-6 py-4 font-bold text-right">Miktar</th>
                  <th className="px-6 py-4 font-bold">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-mono text-xs">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-white">
                      {item.stock.toLocaleString('tr-TR')} <span className="text-zinc-500 text-xs font-normal ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${item.bg} ${item.color}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

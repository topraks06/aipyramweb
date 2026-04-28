import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowDownRight, ArrowUpRight, CreditCard, Euro, Receipt } from 'lucide-react';

interface AccountingProps {
  projects: any[];
}

export function Accounting({ projects }: AccountingProps) {
  // Hesaplamalar
  const vorhangOrders = projects.filter(p => p.source === 'vorhang_bridge');
  const localOrders = projects.filter(p => p.source !== 'vorhang_bridge' && p.source !== 'trtex_news_trigger');
  
  const totalEuroEarnings = vorhangOrders.reduce((acc, curr) => acc + (curr.vendorEarningsEur || 0), 0);
  const pendingAipyramPayoutEur = totalEuroEarnings; // Şimdilik hepsi içeride (Yemeksepeti modeli)
  
  const localRevenueTry = localOrders.reduce((acc, curr) => acc + (curr.grandTotal || curr.amount || 0), 0);

  const transactions = [
    ...vorhangOrders.map(o => ({
      id: o.id,
      date: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(),
      desc: `[Vorhang İhracat] ${o.customerName || 'Müşteri'}`,
      amount: `+€${o.vendorEarningsEur?.toFixed(2) || '0.00'}`,
      status: 'aipyram Havuzunda Bekliyor',
      type: 'income',
      isEur: true
    })),
    ...localOrders.map(o => ({
      id: o.id,
      date: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(),
      desc: `[Yerel Satış] ${o.title || 'İş'}`,
      amount: `+₺${(o.grandTotal || o.amount || 0).toLocaleString('tr-TR')}`,
      status: 'Tahsil Edildi / Açık Hesap',
      type: 'income',
      isEur: false
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Cari & Muhasebe</h2>
          <p className="text-sm text-zinc-400">aipyram hakedişleri, ihracat ödemeleri ve cari hesap takibi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><Euro className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded text-white">İHRACAT BİRİKİMİ</span>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">aipyram Havuzunda (Bekleyen)</p>
            <h3 className="text-4xl font-bold text-white">€{totalEuroEarnings.toFixed(2)}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Bu tutar ay sonunda veya iş tesliminde banka hesabınıza aktarılır.</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Receipt className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Yerel Satışlar (TRY)</p>
            <h3 className="text-4xl font-bold text-white">₺{localRevenueTry.toLocaleString('tr-TR')}</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Perde.ai üzerinden yönetilen yerel satışların toplam hacmi.</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><CreditCard className="w-6 h-6" /></div>
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Abonelik Gideri</p>
            <h3 className="text-4xl font-bold text-white">-₺0.00</h3>
            <p className="text-[10px] text-zinc-500 mt-2">Perde.ai "Sınırsız Tasarım" güncel abonelik ücretiniz.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Hesap Hareketleri (Döküm)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-black/40 border-y border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold">Tarih</th>
                  <th className="px-6 py-4 font-bold">Açıklama</th>
                  <th className="px-6 py-4 font-bold">Durum</th>
                  <th className="px-6 py-4 text-right font-bold">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {tx.date.toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium flex items-center gap-2">
                      {tx.isEur ? <ArrowDownRight className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-blue-400" />}
                      {tx.desc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${tx.isEur ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-300'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${tx.isEur ? 'text-green-400' : 'text-white'}`}>
                      {tx.amount}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-xs">Henüz finansal hareket bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

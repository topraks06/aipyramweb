"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Link as LinkIcon, ShieldCheck } from 'lucide-react';

export default function MarketplaceEngine() {
  const [vendors] = useState([
    { id: 'v1', name: 'Nova Home Textiles', status: 'verified', activeCatalogs: 3, totalDeals: 12 },
    { id: 'v2', name: 'Apex Curtains Ltd', status: 'pending', activeCatalogs: 0, totalDeals: 0 },
  ]);

  return (
    <div className="w-full bg-slate-50 p-4 font-sans border border-slate-200 rounded-xl mt-4">
      <header className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-indigo-500 mb-1">Vorhang.ai Node</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800">Marketplace Engine</h1>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-mono tracking-widest uppercase rounded-md">
          {vendors.length} Registered Vendors
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700 uppercase">Vendor Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendors.map(v => (
                <div key={v.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-white">
                  <div>
                    <div className="font-bold text-slate-800">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.activeCatalogs} Active Catalogs | {v.totalDeals} Deals</div>
                  </div>
                  <Badge variant="outline" className={v.status === 'verified' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                    {v.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Deal Engine (Sovereign Escrow)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 text-center bg-slate-50/50">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 text-indigo-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">B2B Escrow Aktif</h3>
            <p className="text-xs text-slate-500 max-w-[220px] mb-4">
              ALOHA "Yemeksepeti" modeli devrede. Para aipyram havuzuna iner, %10 komisyon kesilip üreticiye hak ediş yazılır.
            </p>
            <div className="w-full max-w-[250px] p-3 border border-indigo-100 bg-white rounded-lg shadow-sm flex flex-col gap-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Hızlı Ödeme Linki Üret</div>
              <Button className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-8" onClick={() => alert('ALOHA: commerce.escrow komutu tetikleniyor...')}>
                <LinkIcon className="w-3 h-3 mr-2" /> $5,000 Sipariş Linki
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

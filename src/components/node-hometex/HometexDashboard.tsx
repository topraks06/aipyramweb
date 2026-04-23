"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HometexDashboard() {
  const [dealers, setDealers] = useState([
    { id: 'd1', name: 'Global Textiles', country: 'Germany', status: 'pending' },
    { id: 'd2', name: 'Home Living UAE', country: 'UAE', status: 'approved' },
  ]);

  const approveDealer = async (id: string) => {
    // Bu kısım ALOHA'ya "hometex.approve" tool olarak bağlanabilir.
    setDealers(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
  };

  return (
    <div className="w-full bg-slate-50 p-4 font-sans border border-slate-200 rounded-xl mt-4">
      <header className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-sky-500 mb-1">Hometex.ai Node</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800">Dealer Network</h1>
        </div>
        <div className="px-4 py-2 bg-sky-50 text-sky-600 border border-sky-200 text-[10px] font-mono tracking-widest uppercase rounded-md">
          {dealers.length} Applications
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700 uppercase">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dealers.filter(d => d.status === 'pending').map(d => (
                <div key={d.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-white">
                  <div>
                    <div className="font-bold text-slate-800">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.country}</div>
                  </div>
                  <Button onClick={() => approveDealer(d.id)} variant="outline" className="text-xs h-8 text-sky-600 border-sky-200 hover:bg-sky-50">
                    Approve
                  </Button>
                </div>
              ))}
              {dealers.filter(d => d.status === 'pending').length === 0 && (
                <div className="text-xs text-slate-500 text-center py-4">No pending applications</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-700 uppercase">Approved Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dealers.filter(d => d.status === 'approved').map(d => (
                <div key={d.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-white">
                  <div>
                    <div className="font-bold text-slate-800">{d.name}</div>
                    <div className="text-xs text-slate-500">{d.country}</div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">
                    VERIFIED
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

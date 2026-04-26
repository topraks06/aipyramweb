'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Printer, FileDown, Eye, Plus } from 'lucide-react';
import Link from 'next/link';

// Mock Data for now
const mockProjects = [
  { id: '1', name: 'Ahmet Yılmaz Salon', date: '26 Nisan 2026', total: '45.000 TL', status: 'Bekliyor', fabric: 'Keten Fon, İpek Tül' },
  { id: '2', name: 'Ayşe Hanım Yatak Odası', date: '25 Nisan 2026', total: '12.000 TL', status: 'Üretimde', fabric: 'Blackout, Basic Tül' },
  { id: '3', name: 'Hilton Otel Lobi', date: '20 Nisan 2026', total: '150.000 TL', status: 'Tamamlandı', fabric: 'Motorlu Sahne, Yanmaz Kumaş' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Projeler & <span className="font-bold text-emerald-500">Siparişler</span></h1>
          <p className="text-zinc-400">Tüm B2B satışlarınız, teklifleriniz ve üretim durumları.</p>
        </div>
        <Link href="/studio" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" /> Yeni Tasarım (Stüdyo)
        </Link>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex gap-4 items-center bg-black/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Müşteri adı, proje veya telefon ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50"
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50 appearance-none">
          <option value="all">Tüm Durumlar</option>
          <option value="waiting">Bekliyor</option>
          <option value="production">Üretimde</option>
          <option value="done">Tamamlandı</option>
        </select>
      </div>

      {/* PROJECTS TABLE */}
      <div className="bg-black/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase">Proje / Müşteri</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase">Tarih</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase">Kumaşlar</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase">Tutar</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase">Durum</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 tracking-wider uppercase text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
                        <FileText className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-xs text-zinc-500">#{p.id.padStart(5, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-zinc-300">{p.date}</td>
                  <td className="p-4 text-sm text-zinc-300">{p.fabric}</td>
                  <td className="p-4 text-sm font-medium text-emerald-400">{p.total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      p.status === 'Tamamlandı' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      p.status === 'Üretimde' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-zinc-400 transition-colors tooltip-trigger" title="Görüntüle/Düzenle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-zinc-400 transition-colors tooltip-trigger" title="Satış Sözleşmesi Çıktısı (Yazdır)">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-zinc-400 transition-colors tooltip-trigger" title="Müşteriye Teklif Gönder (PDF)">
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

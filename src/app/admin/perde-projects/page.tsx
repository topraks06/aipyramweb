'use client';

import React, { useEffect, useState } from 'react';
import { Tent, Search, ArrowRight, User, MapPin, Calendar, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PerdeProjectsArchive() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/perde/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projects) setProjects(data.projects);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Tent className="w-10 h-10 text-emerald-500" />
              MÜŞTERİ ARŞİVİ
            </h1>
            <p className="text-zinc-500 mt-2 text-sm tracking-wide">Perde.ai üzerinden müşterilerinize sunduğunuz tüm projeler burada güvende.</p>
          </div>
          <div className="relative">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <input type="text" placeholder="Müşteri ara..." className="bg-zinc-900 border border-white/10 rounded-full pl-10 pr-4 py-3 outline-none focus:border-emerald-500/50 w-64" />
          </div>
        </header>

        {loading ? (
          <div className="text-center text-zinc-500 py-20 animate-pulse">Arşiv Yükleniyor...</div>
        ) : projects.length === 0 ? (
          <div className="text-center border border-dashed border-white/10 rounded-3xl py-32 bg-zinc-900/50">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl text-zinc-400 font-medium">Henüz kayıtlı projeniz yok</h3>
            <p className="text-zinc-600 mt-2 text-sm">Tasarım stüdyosunda "Müşteriye Kaydet" butonunu kullanarak projelerinizi buraya alabilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <div key={proj.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl">
                <div className="h-48 w-full relative bg-black">
                  <img src={proj.resultImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Proje" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 border border-white/10">
                    {new Date(proj.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{proj.customerName}</h3>
                  <p className="text-emerald-500 text-sm font-medium mb-4">{proj.projectName}</p>
                  
                  <div className="space-y-2 mb-6">
                    {proj.phone && (
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <User className="w-4 h-4" /> {proj.phone}
                      </div>
                    )}
                    {proj.address && (
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <MapPin className="w-4 h-4" /> <span className="truncate">{proj.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-zinc-500 font-mono">{proj.fabrics?.length || 0} Kumaş Kullanıldı</span>
                    <button 
                      onClick={() => router.push(`/perde?projectId=${proj.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold tracking-wide flex items-center gap-2 transition-all shadow-lg"
                    >
                      Devam Et <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

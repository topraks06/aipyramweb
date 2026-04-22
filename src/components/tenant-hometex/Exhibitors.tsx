'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, Download, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';
import { HOMETEX_EXHIBITORS } from '@/lib/hometex-demoData';

export default function Exhibitors() {
  // Mock role for UI parity
  const role = 'consumer'; 
  const [isSimulating, setIsSimulating] = useState(false);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedExhibitorId, setSelectedExhibitorId] = useState<string>('');

  useEffect(() => {
    // Mock Data Fetch Instead of Firebase
    setTimeout(() => {
      setExhibitors(HOMETEX_EXHIBITORS);
      setLoading(false);
    }, 800);
  }, []);

  const handlePerdeAiClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert("Perde.ai'ye yönlendiriliyorsunuz... (Sanal Simulasyon)");
    }, 2500);
  };

  const handleUploadClick = (e: React.MouseEvent, exhibitorId: string) => {
    e.preventDefault();
    setSelectedExhibitorId(exhibitorId);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Perde.ai Simulation Overlay */}
      {isSimulating && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center max-w-md text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border border-white/20 rounded-full animate-ping" />
              <div className="absolute inset-2 border border-white/40 rounded-full animate-pulse" />
              <div className="absolute inset-4 border border-white rounded-full flex items-center justify-center bg-black">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-medium text-white mb-4 tracking-tight">Yapay Zeka Odanızı Analiz Ediyor</h2>
            <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-bold">Perde.ai Ekosistemine Aktarılıyor...</p>
          </motion.div>
        </div>
      )}

      {/* Directory Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 text-[10px] uppercase tracking-[0.2em] mb-8 text-zinc-400 rounded-full">
            <Globe className="w-3 h-3" />
            Global Network
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-serif font-medium tracking-tighter leading-[0.9] text-white uppercase mb-8">
            Katılımcı <br/>
            <span className="italic text-zinc-500 font-light lowercase border-b border-white/20">İndeksi.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed max-w-2xl">
            Onaylanmış, yüksek kapasiteli ve sürdürülebilirlik sertifikalı ev tekstili üreticilerinin tam listesi. 
            Aipyram tarafından doğrulanan global tedarik zinciri.
          </p>
        </motion.div>
      </section>

      {/* Directory List */}
      <section className="pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center py-32 border-t border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Ağ Taranıyor</span>
            </div>
          </div>
        ) : exhibitors.length === 0 ? (
          <div className="flex justify-center items-center py-32 border-t border-white/10 bg-zinc-950">
            <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold">Kayıtlı üretici bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-white/10">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-6 py-4 border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              <div className="col-span-5">Firma / Üretici</div>
              <div className="col-span-2">Lokasyon</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-3 text-right">Aksiyon</div>
            </div>

            {/* List Items */}
            {exhibitors.map((exhibitor, i) => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              >
                <Link 
                  href={`./exhibitors/${exhibitor.id}`}
                  className="group block py-8 md:py-10 border-b border-white/10 hover:bg-white/5 transition-colors relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:items-center">
                    
                    {/* Name & Image Preview */}
                    <div className="col-span-1 md:col-span-5 flex items-center gap-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-900 border border-white/10 shrink-0 overflow-hidden hidden sm:block">
                        <img 
                          src={exhibitor.image || exhibitor.coverImageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80"} 
                          alt={exhibitor.name}
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-serif font-medium text-white group-hover:text-zinc-400 transition-colors tracking-tight">
                          {exhibitor.name}
                        </h3>
                        <p className="text-sm text-zinc-500 font-light line-clamp-1 mt-1 md:hidden">
                          {exhibitor.desc}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 text-sm text-zinc-400 font-light">
                      <MapPin className="w-3.5 h-3.5" />
                      {exhibitor.country || 'Global'}
                    </div>

                    {/* Category */}
                    <div className="col-span-1 md:col-span-2">
                      <span className="inline-block px-2 py-1 border border-white/20 text-[10px] uppercase tracking-widest text-zinc-400">
                        {exhibitor.category || 'Premium'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 md:col-span-3 flex flex-wrap md:justify-end gap-2 mt-4 md:mt-0" onClick={(e) => e.preventDefault()}>
                      
                      {role === 'consumer' && (
                        <button 
                          onClick={handlePerdeAiClick}
                          className="px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-3 h-3" /> Odamda Gör
                        </button>
                      )}

                      {/* Arrow Indicator */}
                      <div className="hidden md:flex items-center justify-center w-8 h-8 ml-2">
                        <ArrowRight className="w-4 h-4 text-zinc-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

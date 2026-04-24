'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Globe, Mail, Phone, Download, Sparkles, Languages, ChevronRight, Calculator, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import HometexFooter from './HometexFooter';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';

// Mock modal
const ProductUploadModal = ({ isOpen, onClose }: any) => isOpen ? <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-zinc-900 p-8 text-white"><h2 className="mb-4 text-xl">Materyal Yükleme Sınırlandırıldı</h2><button onClick={onClose} className="px-4 py-2 bg-white text-black">Kapat</button></div></div> : null;
const B2BRequestModal = ({ isOpen, onClose }: any) => isOpen ? <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"><div className="bg-zinc-900 p-8 text-white"><h2 className="mb-4 text-xl">B2B Talebi Gönderildi</h2><button onClick={onClose} className="px-4 py-2 bg-white text-black">Kapat</button></div></div> : null;

export default function ExhibitorDetail({ exhibitor, products = [] }: { exhibitor: any, products?: any[] }) {
  const { role } = useSovereignAuth('hometex');
  
  const [activeTab, setActiveTab] = useState<'showroom' | 'about' | 'contact'>('showroom');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [b2bModalState, setB2bModalState] = useState<{ isOpen: boolean, type: 'quote' | 'sample', productName: string }>({
    isOpen: false,
    type: 'quote',
    productName: ''
  });

  if (!exhibitor) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Dijital İkiz Yükleniyor</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      <ProductUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <B2BRequestModal isOpen={b2bModalState.isOpen} onClose={() => setB2bModalState(prev => ({ ...prev, isOpen: false }))} />

      {/* Cinematic Hero Section */}
      <section className="relative h-[70vh] lg:h-[90vh] w-full bg-zinc-900 border-b border-white/10">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={exhibitor.coverImageUrl} 
          alt={exhibitor.name}
          className="w-full h-full object-cover grayscale opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-6 lg:px-12 max-w-[1400px] mx-auto pb-16 lg:pb-24">
          <Link href="../exhibitors" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors mb-12">
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> İndekse Dön
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end gap-10 lg:gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-32 h-32 md:w-48 md:h-48 bg-black border border-white/20 p-1.5 shrink-0"
            >
              <img 
                src={exhibitor.logoUrl} 
                alt={`${exhibitor.name} Logo`}
                className="w-full h-full object-cover grayscale"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pb-2"
            >
              <div className="flex items-center gap-5 mb-6">
                <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-[0.3em] font-medium border border-white/20">
                  {exhibitor.category}
                </span>
                <span className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-[0.3em]">
                  <MapPin className="w-4 h-4 stroke-[1.5]" /> {exhibitor.country}
                </span>
              </div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif font-medium text-white tracking-tighter leading-[0.9] uppercase">
                {exhibitor.name}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto w-full mt-16 lg:mt-24">
        
        {/* Minimalist Tabs */}
        <div className="flex gap-10 border-b border-white/10 mb-20 lg:mb-32 overflow-x-auto no-scrollbar">
          {['showroom', 'about', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-8 text-[10px] uppercase tracking-[0.3em] font-bold whitespace-nowrap transition-colors relative",
                activeTab === tab ? "text-white" : "text-zinc-600 hover:text-white"
              )}
            >
              {tab === 'showroom' ? '3D Koleksiyon' : tab === 'about' ? 'Manifesto' : 'İletişim'}
              {activeTab === tab && (
                <motion.div layoutId="activeTabExhibitor" className="absolute bottom-0 left-0 w-full h-px bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[50vh] pb-24">
          
          {/* SHOWROOM TAB */}
          {activeTab === 'showroom' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-3xl">
                  <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-medium mb-6 tracking-tighter uppercase">Koleksiyon</h2>
                  <p className="text-zinc-500 text-xl font-light leading-relaxed">Perde.ai tarafından oluşturulmuş, 8 dilde global pazara sunulan dijital ikiz ürünler.</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="py-40 flex flex-col items-center justify-center border border-white/10 bg-zinc-950">
                  <Sparkles className="w-10 h-10 text-zinc-800 mb-6 stroke-[1]" />
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-medium">Bu firma henüz otonom ürün yüklemesi yapmamış.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                  {products.map((product, i) => (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="group flex flex-col"
                    >
                      <div className="aspect-[4/5] bg-zinc-900 border border-white/10 relative overflow-hidden mb-8">
                        <img 
                          src={product.renderedImageUrl} 
                          alt="Rendered Product" 
                          className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-6 left-6 flex gap-3">
                          <span className="px-4 py-2 bg-black/80 backdrop-blur-md text-[9px] uppercase tracking-[0.3em] font-bold text-white border border-white/10">
                            Perde.ai Render
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                          <span className="w-12 h-12 rounded-full bg-zinc-900 overflow-hidden border border-white/10 shrink-0">
                            <img src={product.renderedImageUrl} alt="Raw Material" className="w-full h-full object-cover grayscale" />
                          </span>
                          <div>
                            <span className="block text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Ham Materyal</span>
                            <span className="block text-sm font-bold text-white uppercase tracking-widest">{product.category}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-3xl font-serif font-medium mb-4 tracking-tight group-hover:text-zinc-500 transition-colors uppercase">{product.name}</h3>
                        <p className="text-lg text-zinc-500 font-light mb-10 line-clamp-2 leading-relaxed">
                          Yapay Zeka tarafından analiz edilmiş pazar uyumlu ürün.
                        </p>
                        
                        <div className="mt-auto pt-8 border-t border-white/10 flex gap-4">
                           <button className="flex-1 border border-white/20 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-3">
                              <Sparkles className="w-4 h-4 stroke-[1.5]" /> Odamda Gör
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ABOUT & CONTACT tabs mocked for brevity */}
          {activeTab === 'about' && <div className="text-zinc-400">Firma Manifestosu çok yakında aktive edilecektir.</div>}
          {activeTab === 'contact' && <div className="text-zinc-400">İletişim Formları sunucu bağlantısı bekleniyor.</div>}
        </div>
      </div>
      <HometexFooter />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MapPin, Download, Play, CheckCircle2, X, Send, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ModalType = 'quote' | 'sample' | 'upload' | null;

export default function BoothDetail() {
  const params = useParams();
  const id = params?.boothId as string || 'default';
  const role = 'consumer'; // mock
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Mock data for the exhibitor
  const exhibitor = {
    name: id === '1' ? "Sovereign Weavers" : "Aurora Textiles",
    country: "İtalya, Milano",
    category: "Döşemelik Kumaş & İpek",
    desc: "Lüks mobilya markaları için özel dokuma ipek ve kadife koleksiyonları. 1920'den beri Milano'nun kalbinde geleneksel dokuma tekniklerini modern teknolojiyle harmanlıyoruz.",
    logo: "SW",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80",
    collections: [
      {
        name: "Milano Kadifesi 2026",
        image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80",
        tags: ["Kadife", "Lüks", "Ağır Gramaj"]
      },
      {
        name: "Doğa Dostu İpek Karışımı",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80",
        tags: ["İpek", "Sürdürülebilir", "Hafif"]
      },
      {
        name: "Akıllı Tam Karartma",
        image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80",
        tags: ["Karartma", "Akıllı İplik", "Otel"]
      }
    ]
  };

  const handlePerdeAiClick = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert("Perde.ai'ye yönlendiriliyorsunuz... (Sanal Simulasyon)");
    }, 2500);
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="w-full min-h-screen bg-black text-white pb-24 relative">
      {/* Action Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/20 shadow-2xl p-8 z-10"
            >
              <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'quote' && (
                <div>
                  <h3 className="text-2xl font-serif font-medium mb-2">Toptan Fiyat Teklifi</h3>
                  <p className="text-sm text-zinc-400 mb-6 font-light">Sovereign Weavers firmasına iletilmek üzere proje detaylarınızı girin.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">İlgilenilen Koleksiyon</label>
                      <select className="w-full bg-black border border-white/20 p-3 text-sm focus:outline-none focus:border-white transition-colors text-white">
                        <option>Tüm Koleksiyonlar</option>
                        {exhibitor.collections.map(c => <option key={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <button onClick={closeModal} className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4">
                      <Send className="w-4 h-4" /> Teklif İsteğini Gönder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Perde.ai Simulation Overlay */}
      {isSimulating && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-serif font-medium text-white mb-2">Yapay Zeka Odanızı Analiz Ediyor...</h2>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-[0.2em]">Perde.ai Ekosistemine Aktarılıyor</p>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden border-b border-white/10">
        <img 
          src={exhibitor.coverImage} 
          alt={exhibitor.name}
          className="w-full h-full object-cover grayscale opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-8 left-4 sm:left-8 z-10">
          <Link href="../expo" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-white hover:text-zinc-400 transition-colors bg-black/60 px-4 py-2 backdrop-blur-md border border-white/10">
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            Sanal Fuar'a Dön
          </Link>
        </div>
      </div>

      {/* Brand Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-black border border-white/10 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white text-black flex items-center justify-center text-4xl font-serif shrink-0">
            {exhibitor.logo}
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-medium mb-2 uppercase">{exhibitor.name}</h1>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  {exhibitor.country}
                  <span className="mx-2">•</span>
                  <span>{exhibitor.category}</span>
                </div>
              </div>
              
              {/* Dynamic Role Actions */}
              <div className="flex gap-3">
                {role === 'consumer' && (
                  <button 
                    onClick={handlePerdeAiClick}
                    className="px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-bold border border-white/20 bg-black text-white hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4 stroke-[1.5]" />
                    Odamda Gör (Perde.ai)
                  </button>
                )}
              </div>
            </div>
            <p className="text-zinc-500 font-light leading-relaxed max-w-3xl">
              {exhibitor.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 3D Collections / Scenes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-serif font-medium uppercase tracking-tight">Yapay Zeka Sahneleri & Koleksiyonlar</h2>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <CheckCircle2 className="w-4 h-4 text-white" />
            4K Çözünürlük Onaylı
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitor.collections.map((collection, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-zinc-900 border border-white/10">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white/20">
                    <Play className="w-6 h-6 text-white ml-1 fill-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-medium mb-2 uppercase tracking-tight">{collection.name}</h3>
              <div className="flex flex-wrap gap-2">
                {collection.tags.map((tag, j) => (
                  <span key={j} className="px-2 py-1 border border-white/20 text-zinc-400 text-[9px] uppercase tracking-widest font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}

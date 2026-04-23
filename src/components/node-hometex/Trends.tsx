'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, BarChart3, ArrowRight, Camera, CheckCircle2 } from 'lucide-react';
import { HOMETEX_TRENDS } from '@/lib/hometex-demoData';
import HometexFooter from './HometexFooter';

export default function Trends() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        handleUpload();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    setIsAnalyzing(true);
    setShowResult(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 3500);
  };

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-12 max-w-[1400px] mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/10 text-[9px] uppercase tracking-[0.3em] mb-10 text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Aipyram Trend Motoru
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[11rem] font-serif font-medium tracking-tighter mb-10 leading-[0.9] text-white uppercase">
            Geleceği <br/>
            <span className="italic text-zinc-500 font-light normal-case">Dokumak.</span>
          </h1>
          <p className="text-xl md:text-3xl text-zinc-400 font-light leading-relaxed max-w-3xl">
            2026-2027 renk paletleri, doku öngörüleri ve materyal inovasyonları. 
            Yapay zeka analizleriyle desteklenmiş küresel trend raporları.
          </p>
        </motion.div>
      </section>

      {/* AI Analysis Tool - Premium Layout */}
      <section className="py-24 lg:py-40 bg-zinc-950 border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
          >
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-medium mb-8 text-zinc-500">
                <Sparkles className="w-4 h-4 text-white stroke-[1.5]" />
                <span>Yapay Zeka Trend Analizi</span>
              </div>
              <h2 className="text-5xl sm:text-6xl font-serif font-medium mb-8 tracking-tight uppercase">Kumaşınız Geleceğe Hazır Mı?</h2>
              <p className="text-xl text-zinc-400 mb-12 font-light leading-relaxed max-w-xl">
                Ürettiğiniz veya ilgilendiğiniz kumaşın fotoğrafını yükleyin. Aipyram yapay zekası, 
                kumaşınızın 2027 küresel trendleriyle uyumunu analiz etsin ve pazar öngörüleri sunsun.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/*" 
                className="hidden" 
              />

              {!isAnalyzing && !showResult && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-all"
                >
                  <Camera className="w-4 h-4 stroke-[1.5]" />
                  <span>Kumaş Görseli Yükle</span>
                </button>
              )}

              {isAnalyzing && (
                <div className="bg-black border border-white/10 p-8 max-w-md">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Analiz Ediliyor</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-px w-full bg-white/20 overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full bg-white w-1/2"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Aipyram global trend veritabanı taranıyor...</p>
                  </div>
                </div>
              )}

              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black border border-white/10 p-10"
                >
                  <div className="flex items-start justify-between mb-8 pb-8 border-b border-white/20">
                    <div>
                      <div className="flex items-center gap-3 text-white mb-4">
                        <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
                        <h4 className="font-bold uppercase tracking-[0.3em] text-[10px]">Analiz Tamamlandı</h4>
                      </div>
                      <h3 className="text-3xl font-serif font-medium uppercase tracking-tight">Yüksek Pazar Uyumu</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-5xl font-serif font-medium text-white">%87</span>
                      <span className="block text-[9px] uppercase tracking-[0.3em] text-zinc-500 mt-2">Eşleşme Skoru</span>
                    </div>
                  </div>
                  <p className="text-lg text-zinc-400 mb-10 font-light leading-relaxed">
                    Yüklediğiniz doku, Avrupa pazarındaki "Doğaya Dönüş" trendiyle %87 oranında eşleşiyor. 
                    Özellikle İskandinav ve Alman pazarlarında, 2027'nin 2. çeyreğinde yüksek talep görme potansiyeline sahip.
                  </p>
                  <button 
                    onClick={() => {
                      setShowResult(false);
                      setSelectedImage(null);
                    }}
                    className="group relative inline-flex items-center gap-5 text-[10px] uppercase tracking-[0.3em] font-medium text-white"
                  >
                    <span className="relative z-10">Yeni Görsel Analiz Et</span>
                    <span className="w-12 h-px bg-white group-hover:w-24 transition-all duration-700 ease-out" />
                  </button>
                </motion.div>
              )}
            </div>

            <div className="order-1 lg:order-2">
              <div className="w-full aspect-square bg-zinc-900 relative overflow-hidden border border-white/10">
                {selectedImage ? (
                  <motion.img 
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={selectedImage} 
                    alt="Analyzed Fabric" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                    <BarChart3 className="w-16 h-16 mb-6 opacity-20 stroke-[1]" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Görsel Bekleniyor</span>
                  </div>
                )}
                
                {/* Scanning Overlay */}
                {isAnalyzing && (
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent z-10 pointer-events-none border-y border-white/20"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trend Boards - Editorial Grid */}
      <section className="py-24 lg:py-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="mb-20 lg:mb-32">
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter mb-6 uppercase">2027 Makro Trendler</h2>
            <p className="text-zinc-500 text-xl sm:text-2xl font-light">Aipyram veri madenciliği sonuçlarına göre şekillenen 4 ana akım.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
            {HOMETEX_TRENDS.map((board, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.2 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] bg-zinc-900 border border-white/10 relative overflow-hidden mb-10">
                  <img 
                    src={board.image} 
                    alt={board.title}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-[3s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-8 left-8 bg-black/90 backdrop-blur-md px-5 py-2.5 text-[9px] uppercase tracking-[0.3em] font-medium text-white border border-white/20">
                    {board.tags?.[0] || 'Trend'}
                  </div>
                </div>
                <h3 className="text-4xl lg:text-5xl font-serif font-medium text-white mb-6 tracking-tight group-hover:text-zinc-400 transition-colors uppercase leading-[1.1]">{board.title}</h3>
                <p className="text-zinc-400 text-xl font-light leading-relaxed max-w-xl">{board.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <HometexFooter />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Paintbrush, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductIdea {
  name: string;
  type: string;
  description: string;
  priceEstimate: number;
  imagePrompt: string;
  imageUrl?: string;
  technicalDetails?: string; 
}

export default function DesignEngine() {
  const [engineMode, setEngineMode] = useState<'Koleksiyon' | 'Editoryal' | 'Fuar'>('Koleksiyon');
  
  // Perde.AI (B2B/B2C Koleksiyon) State
  const [fabric, setFabric] = useState('DÖKÜMLÜ KETEN VE OPAK KADİFE');
  const [style, setStyle] = useState('İSKANDİNAV MİNİMALİZM');
  const [colorPalette, setColorPalette] = useState('TOPRAK TONLARI, MAT SİYAH');
  
  // TRTEX (Editoryal) State
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsContext, setNewsContext] = useState('');

  // Hometex (Fuar) State
  const [fairBrand, setFairBrand] = useState('');
  const [fairConcept, setFairConcept] = useState('LÜKS & MİNİMALİST STAND');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // EVENT TETİKLEMESİ (aipyram SİNYAL AĞI)
      if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('design_requested', { detail: { mode: engineMode } }));
      }

      // GERÇEK API BAĞLANTISI (Zero-Mock)
      const res = await fetch('/api/perde/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fabric, style, colorPalette, engineMode, newsHeadline, fairBrand, fairConcept })
      });
      
      if (!res.ok) throw new Error('Tasarım motoru API hatası');
      const data = await res.json();
      
      if (data.success && data.collection) {
         // API'den gelen 3 farklı ürün/render varyasyonunu göster
         setIdeas(data.collection);
         toast.success('Koleksiyon başarıyla oluşturuldu!');
      } else {
         throw new Error('Geçersiz yanıt formatı');
      }

    } catch (error: any) {
           console.error("[DesignEngine] Hata:", error);
           toast.error(error.message || "Tasarım motoru çalışırken bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToERP = async (idea: ProductIdea) => {
    // FİŞE DÖNÜŞTÜR (ERP ENTEGRASYONU)
    if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('order_draft_created', { detail: { idea } }));
    }
    try {
      const res = await fetch('/api/perde/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(idea)
      });
      if (res.ok) {
        toast.success("ERP Sistemine Başarıyla Aktarıldı!");
      } else {
        throw new Error('ERP API hatası');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "ERP aktarımı başarısız.");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-16 border-b border-white/10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
           <h1 className="font-display font-light text-5xl md:text-6xl text-white uppercase tracking-tighter">
              {engineMode === 'Koleksiyon' && <><span className="text-zinc-500 font-bold block mb-2 text-2xl tracking-widest">MİMARİ</span> KOLEKSİYON <br/><span className="text-white/40">MOTORU</span></>}
              {engineMode === 'Editoryal' && <><span className="text-blue-500 font-bold block mb-2 text-2xl tracking-widest">EDİTORYAL</span> MEDYA <br/><span className="text-white/40">SAYFASI MOTORU</span></>}
              {engineMode === 'Fuar' && <><span className="text-emerald-500 font-bold block mb-2 text-2xl tracking-widest">HOMETEX</span> SANAL <br/><span className="text-white/40">FUAR MOTORU</span></>}
           </h1>
           <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-sm shadow-xl">
              <button 
                onClick={() => setEngineMode('Koleksiyon')}
                className={`px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${engineMode === 'Koleksiyon' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                 PERDE.AI (Tasarım)
              </button>
              <button 
                onClick={() => setEngineMode('Editoryal')}
                className={`px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${engineMode === 'Editoryal' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-zinc-500 hover:text-white'}`}
              >
                 TRTEX (Medya)
              </button>
              <button 
                onClick={() => setEngineMode('Fuar')}
                className={`px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${engineMode === 'Fuar' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]' : 'text-zinc-500 hover:text-white'}`}
              >
                 HOMETEX (Fuar)
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 bg-zinc-950 border border-white/5 p-8 shadow-2xl">
          <h2 className="text-xs font-bold text-white mb-8 border-b border-white/10 pb-4 uppercase tracking-[0.2em]">PARAMETRELER</h2>
          
          {engineMode === 'Koleksiyon' && (
             <div className="space-y-6">
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">KUMAŞ DOKUSU</label>
                 <input 
                   value={fabric} onChange={(e) => setFabric(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-white transition-colors uppercase font-mono"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">TASARIM KONSEPTİ</label>
                 <input 
                   value={style} onChange={(e) => setStyle(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-white transition-colors uppercase font-mono"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">RENK PALETİ</label>
                 <input 
                   value={colorPalette} onChange={(e) => setColorPalette(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-white transition-colors uppercase font-mono"
                 />
               </div>
             </div>
          )}
          
          {engineMode === 'Editoryal' && (
             <div className="space-y-6">
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-blue-400">TRTEX HABER BAŞLIĞI</label>
                 <input 
                   value={newsHeadline} onChange={(e) => setNewsHeadline(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-blue-500 transition-colors uppercase font-mono"
                 />
               </div>
             </div>
          )}

          {engineMode === 'Fuar' && (
             <div className="space-y-6">
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-emerald-400">MARKA ADI</label>
                 <input 
                   value={fairBrand} onChange={(e) => setFairBrand(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-emerald-500 transition-colors uppercase font-mono"
                 />
               </div>
             </div>
          )}

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className={`w-full mt-8 py-5 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center transition-all 
               ${engineMode === 'Koleksiyon' ? 'bg-white text-black hover:bg-zinc-200' : ''} 
               ${engineMode === 'Editoryal' ? 'bg-blue-600 text-white hover:bg-blue-500' : ''}
               ${engineMode === 'Fuar' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : ''}
            `}
          >
            {isGenerating ? (
              <><Loader2 className="mr-3 h-4 w-4 animate-spin" /> ALGORİTMA VARYASYON ÜRETİYOR...</>
            ) : (
              <><Paintbrush className="mr-3 h-4 w-4" /> MOTORU ÇALIŞTIR</>
            )}
          </button>
        </div>

        <div className="lg:col-span-7">
           {ideas.length === 0 && !isGenerating ? (
             <div className="h-full min-h-[400px] border border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                <Paintbrush className="h-12 w-12 text-zinc-800 mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Oluşturulacak varyasyonlar (Maks 4K) burada görünecek.</p>
             </div>
           ) : null}

           {ideas.map((idea, index) => (
             <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-white/10 shadow-2xl relative group overflow-hidden">
                <div className="aspect-video bg-zinc-950 relative border-b border-white/5 overflow-hidden">
                   {idea.imageUrl ? (
                     <img src={idea.imageUrl} alt={idea.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-black to-black"></div>
                        <span className="text-[90px] font-display font-light text-zinc-800 tracking-tighter opacity-30 select-none">aipyram</span>
                     </div>
                   )}
                   <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-white/20">
                     {idea.type}
                   </div>
                </div>
                
                <div className="p-8">
                   <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-2">{idea.name}</h3>
                   <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-4">{idea.description}</p>
                   {idea.technicalDetails && (
                     <p className="text-[10px] text-zinc-500 font-mono border-t border-white/5 pt-3 mb-4 leading-relaxed">{idea.technicalDetails}</p>
                   )}
                   
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                     {idea.priceEstimate > 0 && (
                       <div>
                         <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Maliyet/Fiyat</span>
                         <span className="font-display font-light text-2xl text-white">₺{idea.priceEstimate}</span>
                       </div>
                     )}
                     
                     <button 
                         onClick={() => handleSaveToERP(idea)}
                         className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                     >
                       FİŞE DÖNÜŞTÜR (ERP) <ArrowRight className="h-3 w-3" />
                     </button>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}

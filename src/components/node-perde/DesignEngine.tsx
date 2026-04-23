'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Paintbrush, ArrowRight, Save } from 'lucide-react';
// We assume there's a global gemini service or we'll mock it for the engine till agent integration
// import { generateProductIdeas, generateProductImage } from '@/services/gemini';

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
  const [fabric, setFabric] = useState('DÃ–KÃœMLÃœ KETEN VE OPAK KADÄ°FE');
  const [style, setStyle] = useState('Ä°SKANDÄ°NAV MÄ°NÄ°MALÄ°ZM');
  const [colorPalette, setColorPalette] = useState('TOPRAK TONLARI, MAT SÄ°YAH');
  
  // TRTEX (Editoryal) State
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsContext, setNewsContext] = useState('');

  // Hometex (Fuar) State
  const [fairBrand, setFairBrand] = useState('');
  const [fairConcept, setFairConcept] = useState('LÃœKS & MÄ°NÄ°MALÄ°ST STAND');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // EVENT TETÄ°KLEMESÄ° (AIPYRAM SÄ°NYAL AÄI)
      if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent('design_requested', { detail: { mode: engineMode } }));
      }

      // TODO: Firebase/Gemini agentic entegrasyonu gelecek (aloha/agentBus.ts Ã¼zerinden)
      // Åimdilik sistemin nasÄ±l Ã§alÄ±ÅŸtÄ±ÄŸÄ±nÄ± gÃ¶stermek adÄ±na sahte gecikme.
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const draftImageUrl = "/placeholder-render.jpg"; // Fallback for testing

      if (engineMode === 'Koleksiyon') {
         setIdeas([{
            name: `${fabric} Ã–zel TasarÄ±mÄ±`,
            type: 'PERDE.AI',
            description: `${style} konseptinde, ${colorPalette} tonlarÄ±nda.`,
            priceEstimate: 1250,
            imagePrompt: "Architectural render",
            imageUrl: draftImageUrl,
            technicalDetails: "Gizli korniÅŸ, pileli Ã¶zel dikim."
         }]);
      } else if (engineMode === 'Editoryal') {
         setIdeas([{
            name: 'TRTEX Haber KapaÄŸÄ±',
            type: 'TRTEX',
            description: newsHeadline,
            priceEstimate: 0,
            imagePrompt: "Photorealistic cover",
            imageUrl: draftImageUrl
         }]);
      } else {
         setIdeas([{
            name: '3D Fuar StandÄ±',
            type: 'HOMETEX',
            description: `${fairBrand} - ${fairConcept}`,
            priceEstimate: 0,
            imagePrompt: "Luxury 3D Booth",
            imageUrl: draftImageUrl
         }]);
      }
    } catch (error) {
           console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToERP = (idea: ProductIdea) => {
    // FÄ°ÅE DÃ–NÃœÅTÃœR (ERP ENTEGRASYONU)
    if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('order_draft_created', { detail: { idea } }));
    }
    alert("ERP Sistemine FiÅŸ Olarak BaÅŸarÄ±yla AktarÄ±ldÄ±!");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
      <div className="mb-16 border-b border-white/10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
           <h1 className="font-display font-light text-5xl md:text-6xl text-white uppercase tracking-tighter">
              {engineMode === 'Koleksiyon' && <><span className="text-zinc-500 font-bold block mb-2 text-2xl tracking-widest">MÄ°MARÄ°</span> KOLEKSÄ°YON <br/><span className="text-white/40">MOTORU</span></>}
              {engineMode === 'Editoryal' && <><span className="text-blue-500 font-bold block mb-2 text-2xl tracking-widest">EDÄ°TORYAL</span> MEDYA <br/><span className="text-white/40">SAYFASI MOTORU</span></>}
              {engineMode === 'Fuar' && <><span className="text-emerald-500 font-bold block mb-2 text-2xl tracking-widest">HOMETEX</span> SANAL <br/><span className="text-white/40">FUAR MOTORU</span></>}
           </h1>
           <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-sm shadow-xl">
              <button 
                onClick={() => setEngineMode('Koleksiyon')}
                className={`px-6 py-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-all ${engineMode === 'Koleksiyon' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                 PERDE.AI (TasarÄ±m)
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
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">KUMAÅ DOKUSU</label>
                 <input 
                   value={fabric} onChange={(e) => setFabric(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-white transition-colors uppercase font-mono"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">TASARIM KONSEPTÄ°</label>
                 <input 
                   value={style} onChange={(e) => setStyle(e.target.value)}
                   className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:border-white transition-colors uppercase font-mono"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-zinc-500">RENK PALETÄ°</label>
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
                 <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest text-blue-400">TRTEX HABER BAÅLIÄI</label>
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
              <><Loader2 className="mr-3 h-4 w-4 animate-spin" /> ALGORÄ°TMA VARYASYON ÃœRETÄ°YOR...</>
            ) : (
              <><Paintbrush className="mr-3 h-4 w-4" /> MOTORU Ã‡ALIÅTIR</>
            )}
          </button>
        </div>

        <div className="lg:col-span-7">
           {ideas.length === 0 && !isGenerating ? (
             <div className="h-full min-h-[400px] border border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                <Paintbrush className="h-12 w-12 text-zinc-800 mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-[0.2em]">OluÅŸturulacak varyasyonlar (Maks 4K) burada gÃ¶rÃ¼necek.</p>
             </div>
           ) : null}

           {ideas.map((idea, index) => (
             <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-white/10 shadow-2xl relative group overflow-hidden">
                <div className="aspect-video bg-zinc-950 relative border-b border-white/5 overflow-hidden">
                   {idea.imageUrl && idea.imageUrl !== "/placeholder-render.jpg" ? (
                     <img src={idea.imageUrl} alt={idea.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-black to-black"></div>
                        <span className="text-[90px] font-display font-light text-zinc-800 tracking-tighter opacity-30 select-none">AIPYRAM</span>
                     </div>
                   )}
                   <div className="absolute top-4 right-4 bg-black/80 backdrop-blur text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-white/20">
                     {idea.type}
                   </div>
                </div>
                
                <div className="p-8">
                   <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-2">{idea.name}</h3>
                   <p className="text-xs text-zinc-400 font-mono leading-relaxed mb-8">{idea.description}</p>
                   
                   <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                     {idea.priceEstimate > 0 && (
                       <div>
                         <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Maliyet/Fiyat</span>
                         <span className="font-display font-light text-2xl text-white">â‚º{idea.priceEstimate}</span>
                       </div>
                     )}
                     
                     <button 
                         onClick={() => handleSaveToERP(idea)}
                         className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                     >
                       FÄ°ÅE DÃ–NÃœÅTÃœR (ERP) <ArrowRight className="h-3 w-3" />
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

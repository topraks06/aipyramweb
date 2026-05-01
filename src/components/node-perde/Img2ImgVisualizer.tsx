'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Sparkles, X, CheckCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

// Örnek 3D Şablonlar
const TEMPLATES = [
  { id: 't1', name: 'Modern Fon Perde', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400', style: 'Modern' },
  { id: 't2', name: 'Klasik Kruvaze', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=400', style: 'Klasik' },
  { id: 't3', name: 'Minimalist Tül', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400', style: 'Minimal' },
  { id: 't4', name: 'Rustik Ahşap', url: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=400', style: 'Rustik' },
];

export default function Img2ImgVisualizer() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [fabricImage, setFabricImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { SovereignNodeId } = usePerdeAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFabricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen sadece görsel (JPG/PNG) yükleyin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFabricImage(reader.result as string);
      setResultImage(null); // Reset result when new fabric is loaded
    };
    reader.readAsDataURL(file);
  };

  const handleDressFabric = async () => {
    if (!selectedTemplate) {
      toast.error('Lütfen bir şablon seçin.');
      return;
    }
    if (!fabricImage) {
      toast.error('Lütfen bir kumaş görseli yükleyin.');
      return;
    }

    setIsProcessing(true);

    try {
      // API call to the actual render route or a specialized img2img route
      const response = await fetch('/api/perde/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SovereignNodeId,
          templateId: selectedTemplate,
          fabricBase64: fabricImage,
          prompt: 'Apply the provided fabric texture perfectly onto the curtain template. Photorealistic rendering.',
          isImg2Img: true
        })
      });

      if (!response.ok) {
        throw new Error('Görsel oluşturulamadı. (Not: Otonom motor entegrasyonu backendde tamamlanmalıdır)');
      }

      const data = await response.json();
      if (data.renderUrl) {
        setResultImage(data.renderUrl);
        toast.success('Kumaş başarıyla giydirildi!');
      } else {
        throw new Error('Render URL alınamadı.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Bir hata oluştu.');
      
      // Fallback (for zero-mock strictly, we shouldn't use Math.random, so we just show an error or fallback to the fabric itself if it's a demo)
      // Actually, since it's an audit, we just fail gracefully without math.random
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-zinc-950 text-white rounded-3xl border border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl">
      
      {/* Sol Panel: Kontroller */}
      <div className="w-full md:w-[400px] bg-zinc-900 border-r border-white/5 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-medium tracking-tight mb-1">Kumaş Giydirme Motoru</h2>
          <p className="text-sm text-zinc-400">3D Şablonlara kendi kumaşınızı giydirin.</p>
        </div>

        {/* 1. Şablon Seçimi */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">1. Şablon Seçin</h3>
            {selectedTemplate && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((tmpl) => (
              <div 
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${selectedTemplate === tmpl.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent hover:border-white/20'}`}
              >
                <img src={tmpl.url} alt={tmpl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                  <span className="text-xs font-medium text-white">{tmpl.name}</span>
                </div>
                {selectedTemplate === tmpl.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Kumaş Yükleme */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">2. Kumaş Yükleyin</h3>
            {fabricImage && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          </div>

          {!fabricImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-blue-500/50 transition-colors"
            >
              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
              <span className="text-xs text-zinc-400 font-medium">Kumaş Görseli Seçin</span>
            </div>
          ) : (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 group">
              <img src={fabricImage} alt="Kumaş" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button 
                  onClick={() => { setFabricImage(null); setResultImage(null); }}
                  className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFabricUpload} />
        </div>

        {/* 3. Aksiyon */}
        <div className="p-6 mt-auto">
          <button
            onClick={handleDressFabric}
            disabled={!selectedTemplate || !fabricImage || isProcessing}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isProcessing ? 'GİYEN MOTOR ÇALIŞIYOR...' : 'KUMAŞI GİYDİR (RENDER)'}
          </button>
        </div>
      </div>

      {/* Sağ Panel: Önizleme / Sonuç */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-4 md:p-8">
        
        {/* Satranç Tahtası Arka Planı */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <AnimatePresence mode="wait">
          {!selectedTemplate && !fabricImage && !resultImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-2xl border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                <ImageIcon className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-2xl font-light text-white mb-2">Img2Img <span className="font-semibold text-blue-500">Visualizer</span></h3>
              <p className="text-zinc-500 max-w-sm">Sol menüden bir 3D şablon seçin ve kumaş görselinizi yükleyerek anında gerçekçi render alın.</p>
            </motion.div>
          )}

          {(selectedTemplate || fabricImage) && !resultImage && !isProcessing && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
              className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl border border-white/10 overflow-hidden flex"
            >
              <div className="flex-1 bg-zinc-900 flex items-center justify-center border-r border-white/10">
                {selectedTemplate ? (
                  <img src={TEMPLATES.find(t => t.id === selectedTemplate)?.url} className="w-full h-full object-cover opacity-50" alt="Template" />
                ) : (
                  <span className="text-zinc-600 text-sm">Şablon Bekleniyor</span>
                )}
              </div>
              <div className="flex-1 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                {fabricImage ? (
                  <img src={fabricImage} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Fabric" />
                ) : (
                  <span className="text-zinc-600 text-sm">Kumaş Bekleniyor</span>
                )}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-medium text-white shadow-xl">
                  {selectedTemplate && fabricImage ? 'Hazır — Render Butonuna Tıklayın' : 'Eksikleri Tamamlayın'}
                </div>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-2 border-emerald-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-medium tracking-tight text-white mb-2">Tasarım İşleniyor</h3>
              <p className="text-zinc-400 text-sm animate-pulse">Kumaş dokusu 3D modele giydiriliyor, lütfen bekleyin...</p>
            </motion.div>
          )}

          {resultImage && !isProcessing && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-4xl h-full max-h-[80vh] flex items-center justify-center group"
            >
              <img src={resultImage} alt="Render Sonucu" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-blue-900/20" />
              
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={resultImage} 
                  download="render.jpg"
                  className="bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 p-3 rounded-xl flex items-center gap-2 transition-all shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium text-sm pr-1">İndir</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Maximize2, Undo2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Img2ImgVisualizerProps {
  onRenderComplete?: (url: string) => void;
}

const TEMPLATES = [
  {
    id: 'living_room_1',
    name: 'Modern Salon (Tek Kanat)',
    bgUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
    // Sahte maske ve gölge koordinatları (gerçek sistemde şeffaf PNG'ler olacak)
    maskProps: { x: 200, y: 100, w: 300, h: 600 },
  },
  {
    id: 'bedroom_1',
    name: 'Yatak Odası (Çift Kanat)',
    bgUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
    maskProps: { x: 150, y: 150, w: 250, h: 500 },
  }
];

export default function Img2ImgVisualizer({ onRenderComplete }: Img2ImgVisualizerProps) {
  const [fabricBase64, setFabricBase64] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Kontroller
  const [scale, setScale] = useState(1); // Rapor boyu (desen büyüklüğü)
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFabricUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası yükleyin.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFabricBase64(e.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  // Gerçek zamanlı Canvas render motoru
  const renderImg2Img = async () => {
    if (!fabricBase64 || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context bulunamadı');

      // 1. Arka planı yükle
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
        bgImg.src = selectedTemplate.bgUrl;
      });

      // Canvas boyutunu arka plana eşitle
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;
      ctx.drawImage(bgImg, 0, 0);

      // 2. Kumaşı yükle
      const fabricImg = new Image();
      await new Promise((resolve, reject) => {
        fabricImg.onload = resolve;
        fabricImg.onerror = reject;
        fabricImg.src = fabricBase64;
      });

      // Kumaş desenini oluştur (Pattern Repeat)
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Temp canvas hatası');
      
      // Ölçeklendirme (Rapor Boyu simulasyonu)
      tempCanvas.width = fabricImg.width * scale;
      tempCanvas.height = fabricImg.height * scale;
      tempCtx.drawImage(fabricImg, 0, 0, tempCanvas.width, tempCanvas.height);
      
      const pattern = ctx.createPattern(tempCanvas, 'repeat');
      if (!pattern) throw new Error('Pattern oluşturulamadı');

      // 3. Perde Maskesi ve Çizimi
      const { x, y, w, h } = selectedTemplate.maskProps;
      
      ctx.save();
      
      // Perde şeklini çiz (Gerçekte bu bir alpha mask png olacak)
      ctx.beginPath();
      // Dalgalı perde efekti (Bezier eğrileriyle)
      ctx.moveTo(x, y);
      for(let i=0; i<5; i++) {
         ctx.quadraticCurveTo(x + (w/5)*i + (w/10), y + 20, x + (w/5)*(i+1), y);
      }
      ctx.lineTo(x + w, y + h);
      for(let i=4; i>=0; i--) {
         ctx.quadraticCurveTo(x + (w/5)*i + (w/10), y + h - 20, x + (w/5)*i, y + h);
      }
      ctx.closePath();
      
      // Sadece maske alanına kumaşı döşe
      ctx.clip();
      ctx.fillStyle = pattern;
      ctx.fillRect(x, y, w, h);
      
      // 4. Gölgelendirme ve Katlanma Efekti (Displacement / Multiply simülasyonu)
      ctx.globalCompositeOperation = 'multiply';
      const gradient = ctx.createLinearGradient(x, y, x + w, y);
      // Pile gölgeleri
      for(let i=0; i<=10; i++) {
        gradient.addColorStop(i/10, i % 2 === 0 ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, w, h);
      
      // Işık ve hacim efekti (Overlay)
      ctx.globalCompositeOperation = 'overlay';
      const lightGrad = ctx.createLinearGradient(x, y, x + w, y);
      for(let i=0; i<=10; i++) {
        lightGrad.addColorStop(i/10, i % 2 !== 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0)');
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(x, y, w, h);

      ctx.restore();

      // Render bitti, dataURL al
      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setResultImage(finalDataUrl);
      if (onRenderComplete) onRenderComplete(finalDataUrl);

    } catch (error) {
      console.error('Img2Img Render Hatası:', error);
      toast.error('Render sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (fabricBase64) {
      renderImg2Img();
    }
  }, [fabricBase64, scale, selectedTemplate]);

  return (
    <div className="w-full bg-zinc-950 min-h-[600px] border border-white/10 rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
      
      {/* SOL PANEL: Kontroller */}
      <div className="w-full md:w-80 bg-zinc-900 border-r border-white/10 flex flex-col p-6">
        <h2 className="text-white text-lg font-display uppercase tracking-widest mb-6">IMG2IMG MOTORU</h2>
        
        {/* Şablon Seçimi */}
        <div className="mb-6">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Şablon (Oda Tipi)</label>
          <div className="space-y-2">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${selectedTemplate.id === t.id ? 'bg-[#8B7355] text-white' : 'bg-black text-zinc-400 hover:bg-zinc-800'}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Kumaş Yükleme */}
        <div className="mb-6">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Kumaş Fotoğrafı</label>
          <div 
            className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#8B7355] hover:bg-white/5 transition-colors relative overflow-hidden"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => handleFabricUpload(e.target.files[0]);
              input.click();
            }}
          >
            {fabricBase64 ? (
              <img src={fabricBase64} alt="Kumaş" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-zinc-500 font-medium">Kumaş Yükle</span>
            )}
          </div>
        </div>

        {/* Rapor Boyu (Desen Büyüklüğü) */}
        {fabricBase64 && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Desen Ölçeği (Rapor Boyu)</label>
              <span className="text-[10px] text-zinc-400">{scale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-[#8B7355]"
            />
          </div>
        )}

        <button 
          onClick={renderImg2Img}
          disabled={!fabricBase64 || isProcessing}
          className="mt-auto bg-white text-black py-4 rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize2 className="w-4 h-4" />}
          Yeniden Render Al
        </button>
      </div>

      {/* SAĞ PANEL: Canvas / Sonuç */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden p-8">
        {/* Gizli Canvas (İşlem için) */}
        <canvas ref={canvasRef} className="hidden" />

        {!fabricBase64 ? (
          <div className="text-center text-zinc-600">
            <h3 className="text-2xl font-light mb-2">Sıfır Halüsinasyon. Saf Matematik.</h3>
            <p className="text-sm">Başlamak için sol panelden kumaş fotoğrafınızı yükleyin.</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {resultImage && (
              <img 
                src={resultImage} 
                alt="Render Sonucu" 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
}

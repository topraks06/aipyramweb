'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Maximize2, Undo2, ArrowRight, Layers, Box, PaintRoller, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Img2ImgVisualizerProps {
  onRenderComplete?: (url: string) => void;
}

// PROFESYONEL 3D ŞABLON MİMARİSİ
// Gerçek sistemde bu resimler Perde.ai tasarımcıları tarafından hazırlanmış şeffaf PNG'ler olacaktır.
// Şu an prototip olduğu için boş URL'ler yerleştirildi, motorun matematiği bu katmanlara göre çalışır.
interface TemplateDef {
  id: string;
  name: string;
  thumbnailUrl: string;
  baseLayer: string;      // Arka plan (Boş oda)
  alphaMaskLayer: string; // Perde şekli (Siyah-Beyaz veya Şeffaf PNG)
  shadowLayer: string;    // Pile gölgeleri (Grayscale PNG - Multiply Blend için)
  highlightLayer: string; // Işık parlamaları (Grayscale PNG - Overlay Blend için)
  fgLayer: string;        // Perdenin önünde duran nesneler (Koltuk, bitki vb. PNG)
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'premium_living_room',
    name: 'Premium Salon (Çift Kanat)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&q=80',
    baseLayer: '/assets/templates/living_room/base.jpg',
    alphaMaskLayer: '/assets/templates/living_room/mask.png',
    shadowLayer: '/assets/templates/living_room/shadow.png',
    highlightLayer: '/assets/templates/living_room/highlight.png',
    fgLayer: '/assets/templates/living_room/foreground.png',
  },
  {
    id: 'master_bedroom',
    name: 'Master Yatak Odası',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&q=80',
    baseLayer: '/assets/templates/bedroom/base.jpg',
    alphaMaskLayer: '/assets/templates/bedroom/mask.png',
    shadowLayer: '/assets/templates/bedroom/shadow.png',
    highlightLayer: '/assets/templates/bedroom/highlight.png',
    fgLayer: '/assets/templates/bedroom/foreground.png',
  }
];

export default function Img2ImgVisualizer({ onRenderComplete }: Img2ImgVisualizerProps) {
  const [fabricBase64, setFabricBase64] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef>(TEMPLATES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Profesyonel Kontroller
  const [scale, setScale] = useState(1.0); // Rapor boyu
  const [opacity, setOpacity] = useState(1.0); // Kumaş kalınlığı (1.0 = Blackout, 0.5 = Tül)
  const [shadowIntensity, setShadowIntensity] = useState(0.8); // Pile derinliği
  const [brightness, setBrightness] = useState(1.0); // Kumaş parlaklığı
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFabricUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası yükleyin.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFabricBase64(e.target?.result as string);
      setResultImage(null); // Yeni kumaş yüklendiğinde eski sonucu temizle
    };
    reader.readAsDataURL(file);
  };

  // Güvenli Resim Yükleme Helper'ı
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img); // Hata olsa bile dön, engine çökmesin
      img.src = src;
    });
  };

  // PROFESYONEL COMPOSITING MOTORU (Sıfır Halüsinasyon)
  const executeCompositing = async () => {
    if (!fabricBase64 || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context bulunamadı');

      // 1. Şablon Resimlerini Yükle (Gerçek sistemde bunlar Cloud Storage'dan gelir)
      // Şimdilik sistemin hata vermemesi için eğer resim yüklenemezse boş bir Canvas oluşturacağız.
      const [baseImg, maskImg, shadowImg, highlightImg, fgImg, fabricImg] = await Promise.all([
        loadImage(selectedTemplate.baseLayer),
        loadImage(selectedTemplate.alphaMaskLayer),
        loadImage(selectedTemplate.shadowLayer),
        loadImage(selectedTemplate.highlightLayer),
        loadImage(selectedTemplate.fgLayer),
        loadImage(fabricBase64)
      ]);

      // Çözünürlüğü referans fotoğrafa göre ayarla (Örn: 1920x1080)
      const targetWidth = baseImg.width > 0 ? baseImg.width : 1920;
      const targetHeight = baseImg.height > 0 ? baseImg.height : 1080;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // -------------------------------------------------------------
      // ADIM A: ARKA PLANI ÇİZ (Boş Oda)
      // -------------------------------------------------------------
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      if (baseImg.width > 0) {
        ctx.drawImage(baseImg, 0, 0, targetWidth, targetHeight);
      } else {
        // Fallback arka plan (Prototip için)
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // -------------------------------------------------------------
      // ADIM B: KUMAŞI HAZIRLA VE MASKELE (Pattern Mapping)
      // -------------------------------------------------------------
      const curtainCanvas = document.createElement('canvas');
      curtainCanvas.width = targetWidth;
      curtainCanvas.height = targetHeight;
      const cCtx = curtainCanvas.getContext('2d');
      if (!cCtx) throw new Error('Curtain context hatası');

      // Desen için geçici canvas (Rapor Boyu)
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = fabricImg.width * scale;
      patternCanvas.height = fabricImg.height * scale;
      const pCtx = patternCanvas.getContext('2d');
      if (pCtx) {
        // Kumaş parlaklık ayarı (CSS Filter alternatifi)
        pCtx.filter = `brightness(${brightness * 100}%)`;
        pCtx.drawImage(fabricImg, 0, 0, patternCanvas.width, patternCanvas.height);
      }
      const pattern = cCtx.createPattern(patternCanvas, 'repeat');

      // Perde Maskesini çiz (Şekil)
      if (maskImg.width > 0) {
        cCtx.drawImage(maskImg, 0, 0, targetWidth, targetHeight);
      } else {
        // Fallback Şekil (Şablonlar yüklenmemişse gösterilecek prototip maske)
        cCtx.beginPath();
        cCtx.moveTo(targetWidth * 0.2, 0);
        cCtx.lineTo(targetWidth * 0.8, 0);
        cCtx.lineTo(targetWidth * 0.8, targetHeight * 0.9);
        cCtx.lineTo(targetWidth * 0.2, targetHeight * 0.9);
        cCtx.fill();
      }

      // 'source-in' ile sadece maskenin olduğu yere kumaşı çiz
      cCtx.globalCompositeOperation = 'source-in';
      if (pattern) {
        cCtx.fillStyle = pattern;
        cCtx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // -------------------------------------------------------------
      // ADIM C: GÖLGE VE IŞIK EFEKTLERİ (PİLELER)
      // -------------------------------------------------------------
      // Pile Gölgeleri (Multiply)
      if (shadowImg.width > 0) {
        cCtx.globalCompositeOperation = 'multiply';
        cCtx.globalAlpha = shadowIntensity;
        cCtx.drawImage(shadowImg, 0, 0, targetWidth, targetHeight);
      } else {
        // Fallback Gölge
        cCtx.globalCompositeOperation = 'multiply';
        const grad = cCtx.createLinearGradient(0, 0, targetWidth, 0);
        for(let i=0; i<20; i++) grad.addColorStop(i/20, i%2===0 ? `rgba(0,0,0,${shadowIntensity*0.5})` : 'rgba(255,255,255,0)');
        cCtx.fillStyle = grad;
        cCtx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // Işık Parlamaları (Overlay / Screen)
      cCtx.globalCompositeOperation = 'overlay';
      cCtx.globalAlpha = 0.5;
      if (highlightImg.width > 0) {
        cCtx.drawImage(highlightImg, 0, 0, targetWidth, targetHeight);
      } else {
        // Fallback Işık
        const light = cCtx.createLinearGradient(0, 0, targetWidth, 0);
        for(let i=0; i<20; i++) light.addColorStop(i/20, i%2!==0 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0)');
        cCtx.fillStyle = light;
        cCtx.fillRect(0, 0, targetWidth, targetHeight);
      }

      // -------------------------------------------------------------
      // ADIM D: OLUŞAN PERDEYİ ANA SAHNEYE YAPIŞTIR
      // -------------------------------------------------------------
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = opacity; // Tül perde ise şeffaf olacak (0.5), kalın ise mat (1.0)
      ctx.drawImage(curtainCanvas, 0, 0);

      // -------------------------------------------------------------
      // ADIM E: FOREGROUND (ÖN NESNELER) ÇİZİMİ
      // -------------------------------------------------------------
      // Koltuk, pencere mermeri gibi objeler perdenin önünde durmalıdır.
      ctx.globalAlpha = 1.0;
      if (fgImg.width > 0) {
        ctx.drawImage(fgImg, 0, 0, targetWidth, targetHeight);
      }

      // Sonucu al
      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setResultImage(finalDataUrl);
      if (onRenderComplete) onRenderComplete(finalDataUrl);
      toast.success('Profesyonel 3D Render Tamamlandı');

    } catch (error) {
      console.error('Compositing Hatası:', error);
      toast.error('Gelişmiş Render sırasında kritik hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-[#050505] min-h-[700px] border border-white/10 rounded-2xl flex flex-col lg:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* SOL PANEL: Profesyonel Kontroller (High-Density B2B) */}
      <div className="w-full lg:w-[400px] bg-[#0a0a0a] border-r border-white/5 flex flex-col relative z-20">
        
        <div className="p-6 border-b border-white/5 bg-[#0d0d0d]">
          <h2 className="text-white text-xl font-display font-light uppercase tracking-[0.2em] flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#8B7355]" />
            SOVEREIGN ENGINE
          </h2>
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-widest font-mono">Layered Alpha Compositing (v2.0)</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Şablon Seçimi */}
          <div>
            <label className="flex items-center justify-between text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-3">
              <span>Şablon (Mekan)</span>
              <Box className="w-3 h-3" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedTemplate.id === t.id ? 'border-[#8B7355] shadow-[0_0_15px_rgba(139,115,85,0.3)]' : 'border-transparent hover:border-white/20'}`}
                >
                  <img src={t.thumbnailUrl} alt={t.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2">
                    <span className="text-white text-[10px] font-bold leading-tight">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kumaş Yükleme */}
          <div>
            <label className="flex items-center justify-between text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-3">
              <span>Hedef Kumaş</span>
              <PaintRoller className="w-3 h-3" />
            </label>
            <div 
              className="w-full h-32 bg-black border border-white/10 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-[#8B7355] hover:bg-white/5 transition-colors relative overflow-hidden group"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => handleFabricUpload(e.target.files[0]);
                input.click();
              }}
            >
              {fabricBase64 ? (
                <>
                  <img src={fabricBase64} alt="Kumaş" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase">Değiştir</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-2xl font-light text-zinc-500">+</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Görsel Yükle</span>
                </div>
              )}
            </div>
          </div>

          {/* Fiziksel Parametreler (High-Density UI) */}
          {fabricBase64 && (
            <div className="space-y-5 bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
              <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold block border-b border-white/5 pb-2 mb-4">
                Fiziksel Parametreler
              </label>
              
              {/* Rapor Boyu */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-zinc-300 font-medium">Rapor Boyu (Desen Ölçeği)</span>
                  <span className="text-[10px] text-[#8B7355] font-mono">{scale.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.1" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-[#8B7355] h-1 bg-white/10 rounded-full appearance-none outline-none" />
              </div>

              {/* Opaklık (Tül vs Kalın) */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-zinc-300 font-medium">Kumaş Tipi (Blackout / Tül)</span>
                  <span className="text-[10px] text-[#8B7355] font-mono">{opacity === 1 ? 'Blackout' : opacity <= 0.5 ? 'Tül' : 'Normal'}</span>
                </div>
                <input type="range" min="0.3" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-[#8B7355] h-1 bg-white/10 rounded-full appearance-none outline-none" />
              </div>

              {/* Pile Derinliği */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-zinc-300 font-medium">Pile Derinliği (Gölge)</span>
                  <span className="text-[10px] text-[#8B7355] font-mono">%{(shadowIntensity * 100).toFixed(0)}</span>
                </div>
                <input type="range" min="0" max="1.5" step="0.1" value={shadowIntensity} onChange={(e) => setShadowIntensity(parseFloat(e.target.value))} className="w-full accent-[#8B7355] h-1 bg-white/10 rounded-full appearance-none outline-none" />
              </div>

              {/* Parlaklık */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-zinc-300 font-medium">Aydınlatma</span>
                  <span className="text-[10px] text-[#8B7355] font-mono">%{(brightness * 100).toFixed(0)}</span>
                </div>
                <input type="range" min="0.5" max="2" step="0.1" value={brightness} onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full accent-[#8B7355] h-1 bg-white/10 rounded-full appearance-none outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0d0d0d]">
          <button 
            onClick={executeCompositing}
            disabled={!fabricBase64 || isProcessing}
            className="w-full bg-[#8B7355] text-white py-4 rounded-lg text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#725e45] disabled:opacity-30 disabled:hover:bg-[#8B7355] transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(139,115,85,0.2)]"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> İŞLENİYOR...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> 3D RENDER AL (0 KREDİ)</>
            )}
          </button>
        </div>
      </div>

      {/* SAĞ PANEL: Canvas / Sonuç Sahnesi */}
      <div className="flex-1 bg-[#030303] relative flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] p-4 lg:p-8">
        
        {/* Görünmez İşlem Canvas'ı */}
        <canvas ref={canvasRef} className="hidden" />

        {!fabricBase64 ? (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
              <Layers className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-3xl font-display font-light text-white mb-3 tracking-tighter">Deterministik Mimari</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto font-light leading-relaxed">
              Katmanlı Alpha Compositing mimarisi ile gerçek kumaşınızı 3D şablonlara <strong className="text-zinc-300">sıfır halüsinasyon</strong> ile giydirin.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center rounded-2xl border border-white/5">
                <Loader2 className="w-10 h-10 text-[#8B7355] animate-spin mb-4" />
                <span className="text-[10px] text-white uppercase tracking-[0.2em] font-bold">Katmanlar Birleştiriliyor</span>
              </div>
            )}
            
            {resultImage ? (
              <img 
                src={resultImage} 
                alt="Render Sonucu" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
              />
            ) : (
              <div className="text-zinc-600 text-sm uppercase tracking-widest font-bold">Bekleniyor...</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

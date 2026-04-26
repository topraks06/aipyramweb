'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2, Maximize2, Undo2, ArrowRight, Layers, Box, PaintRoller, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Img2ImgVisualizerProps {
  onRenderComplete?: (url: string) => void;
}

// PROFESYONEL 3D ŞABLON MİMARİSİ
interface TemplateDef {
  id: string;
  name: string;
  thumbnailUrl: string;
  roomType: string; // salon, yatak, otel, balkon, ofis
}

const TEMPLATES: TemplateDef[] = [
  {
    id: 'premium_living_room',
    name: 'Premium Salon (Çift Kanat)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&q=80',
    roomType: 'salon',
  },
  {
    id: 'master_bedroom',
    name: 'Master Yatak Odası',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&q=80',
    roomType: 'yatak_odasi',
  },
  {
    id: 'hotel_room',
    name: 'Otel Odası (Motorlu)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590490360182-c33d955735ed?w=300&q=80',
    roomType: 'otel',
  },
  {
    id: 'modern_office',
    name: 'Modern Ofis',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80',
    roomType: 'ofis',
  }
];

// Kumaş tipi etiketleri (perdeci bakış açısı)
const FABRIC_ROLES = [
  { value: 'Fon Perde', label: 'Fon Perde (Blackout)' },
  { value: 'Tül Perde', label: 'Tül Perde (Şeffaf)' },
  { value: 'Stor Perde', label: 'Stor Perde' },
  { value: 'Zebra Perde', label: 'Zebra Perde' },
  { value: 'Döşemelik', label: 'Döşemelik (Koltuk/Kanepe)' },
  { value: 'Nevresim', label: 'Yatak Tekstili' },
];

export default function Img2ImgVisualizer({ onRenderComplete }: Img2ImgVisualizerProps) {
  const [fabricBase64, setFabricBase64] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDef>(TEMPLATES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  // Kumaş Tipi Seçimi (Perdeci için KRİTİK)
  const [fabricRole, setFabricRole] = useState('Fon Perde');
  
  // Profesyonel Kontroller
  const [decorationMode, setDecorationMode] = useState<'auto-decor' | 'preserve'>('auto-decor');
  const [timeOfDay, setTimeOfDay] = useState('Gün ışığı');
  const [lighting, setLighting] = useState('Doğal Gün Işığı');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Görsel Sıkıştırma
  const compressImage = (base64: string, maxWidth = 1000, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const handleFabricUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası yükleyin.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu çok büyük! Maksimum 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      const compressed = await compressImage(raw, 800, 0.7);
      setFabricBase64(compressed);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  // PROFESYONEL RENDER MOTORU (render-pro v4 API)
  const executeCompositing = async () => {
    if (!fabricBase64) return;
    setIsProcessing(true);

    try {
      // Kumaş görselini sıkıştır
      const compressedFabric = await compressImage(fabricBase64, 800, 0.7);

      // render-pro v4 API'sine DOĞRU payload formatı
      const payload = {
        // Mekan: Seçilen şablonun tasviri (şablon fotoğrafı yüklenmediyse prompt kullan)
        spacePrompt: `${selectedTemplate.name} — ${selectedTemplate.roomType} tipi bir mekan. Profesyonel iç mimari fotoğraf kalitesinde.`,
        // Ürünler: Record<string, { data, mimeType }> formatında
        products: {
          [fabricRole]: { 
            data: compressedFabric, 
            mimeType: 'image/jpeg' 
          }
        },
        // Stüdyo Ayarları
        studioSettings: {
          decorationMode,
          timeOfDay,
          lighting,
          lens: '35mm Prime',
          composition: selectedTemplate.name,
          renderQuality: '2K',
        },
        variationCount: 1, // Img2Img daima 1'li tam render
        aspectRatio: '16:9',
        SovereignNodeId: 'perde',
      };

      console.log(`[Img2Img] Sending render request: ${fabricRole} → ${selectedTemplate.name}`);

      const res = await fetch('/api/perde/render-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMsg = `Sunucu hatası (${res.status})`;
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch { /* HTML error page */ }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      
      if (data.renderUrl) {
         setResultImage(data.renderUrl);
         if (onRenderComplete) onRenderComplete(data.renderUrl);
         toast.success(`Profesyonel Render Tamamlandı! (${data.analysis?.duration || '?'}ms, ${data.analysis?.model || '?'})`, { duration: 5000 });
      } else {
         throw new Error('Render URL bulunamadı');
      }

    } catch (error: any) {
      console.error('Img2Img Render Hatası:', error);
      toast.error(`Render Hatası: ${error.message || 'Bilinmeyen hata'}`, { duration: 6000 });
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
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-widest font-mono">Img2Img Render Pro v4.0</p>
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFabricUpload(file);
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
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Kumaş Fotoğrafı Yükle</span>
                  <span className="text-[9px] text-zinc-600">veya sürükle-bırak</span>
                </div>
              )}
            </div>
          </div>

          {/* Kumaş Tipi Seçimi (Perdeci için KRİTİK) */}
          {fabricBase64 && (
            <div>
              <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mb-3 block">
                Kumaş Tipi / Rolü
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FABRIC_ROLES.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setFabricRole(role.value)}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      fabricRole === role.value
                        ? 'border-[#8B7355] bg-[#8B7355]/20 text-white'
                        : 'border-white/10 text-zinc-500 hover:border-white/30 hover:text-zinc-300'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stüdyo Ayarları */}
          {fabricBase64 && (
            <div className="space-y-5 bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
              <label className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold block border-b border-white/5 pb-2 mb-4">
                Stüdyo Ayarları
              </label>
              
              {/* Dekorasyon Modu */}
              <div>
                <span className="text-[10px] text-zinc-300 font-medium block mb-2">Dekorasyon Modu</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDecorationMode('auto-decor')}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                      decorationMode === 'auto-decor' ? 'border-[#8B7355] bg-[#8B7355]/20 text-white' : 'border-white/10 text-zinc-500'
                    }`}
                  >
                    Otomatik Dekor
                  </button>
                  <button
                    onClick={() => setDecorationMode('preserve')}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition-all ${
                      decorationMode === 'preserve' ? 'border-[#8B7355] bg-[#8B7355]/20 text-white' : 'border-white/10 text-zinc-500'
                    }`}
                  >
                    Mevcut Koru
                  </button>
                </div>
              </div>

              {/* Zaman Dilimi */}
              <div>
                <span className="text-[10px] text-zinc-300 font-medium block mb-2">Zaman / Atmosfer</span>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-sm text-white"
                >
                  <option value="Gün ışığı">Gün Işığı (Doğal)</option>
                  <option value="Altın saat">Altın Saat (Golden Hour)</option>
                  <option value="Gece lambası">Gece Lambası</option>
                  <option value="Dramatik gölge">Dramatik Gölge</option>
                </select>
              </div>

              {/* Aydınlatma */}
              <div>
                <span className="text-[10px] text-zinc-300 font-medium block mb-2">Aydınlatma</span>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-sm text-white"
                >
                  <option value="Doğal Gün Işığı">Doğal Gün Işığı</option>
                  <option value="Stüdyo Işığı">Stüdyo Işığı</option>
                  <option value="Sıcak Aydınlatma">Sıcak Aydınlatma</option>
                  <option value="Soğuk Beyaz">Soğuk Beyaz</option>
                </select>
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
              <><Loader2 className="w-4 h-4 animate-spin" /> AI RENDER İŞLENİYOR...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> PROFESYONEL RENDER AL</>
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
            <h3 className="text-3xl font-display font-light text-white mb-3 tracking-tighter">Kumaş → Mekana Giydir</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto font-light leading-relaxed">
              Sol panelden <strong className="text-zinc-300">kumaş fotoğrafı</strong> yükleyin, 
              şablon seçin ve <strong className="text-zinc-300">AI render</strong> ile mekanda nasıl duracağını görün.
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center rounded-2xl border border-white/5">
                <Loader2 className="w-10 h-10 text-[#8B7355] animate-spin mb-4" />
                <span className="text-[10px] text-white uppercase tracking-[0.2em] font-bold">AI Render İşleniyor...</span>
                <span className="text-[9px] text-zinc-500 mt-2 font-mono">Model: gemini-3.1-flash-image-preview</span>
              </div>
            )}
            
            {resultImage ? (
              <div className="relative">
                <img 
                  src={resultImage} 
                  alt="Render Sonucu" 
                  className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10"
                />
                {/* Download Button */}
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `perde-ai-render-${Date.now()}.jpg`;
                    link.href = resultImage;
                    link.click();
                  }}
                  className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/20 text-white p-3 rounded-xl hover:bg-white hover:text-black transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
                {/* PERDE.AI Watermark */}
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-40">
                  <span className="text-xl font-black text-white tracking-[0.3em] uppercase font-serif mix-blend-overlay">PERDE.AI</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-zinc-600 text-sm uppercase tracking-widest font-bold mb-2">Render Bekleniyor</div>
                <p className="text-zinc-700 text-xs">&quot;Profesyonel Render Al&quot; butonuna tıklayın</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

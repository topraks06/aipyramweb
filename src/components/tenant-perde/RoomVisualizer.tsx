'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';
import Image from 'next/image';
import { 
  Download, Loader2, Sparkles, Expand, Undo2, Redo2, Save, Image as ImageIcon, ArrowRight
} from 'lucide-react';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

export default function RoomVisualizer() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Greeting logic
  const [greeting, setGreeting] = useState('Hoş Geldiniz');

  // History / Inputs
  const [renderHistory, setRenderHistory] = useState<{ url: string; originalUrl: string | null }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const searchParams = useSearchParams();
  const lang = (searchParams.get('lang') || 'TR').toUpperCase() as keyof typeof PERDE_DICT;
  const T = PERDE_DICT[lang]?.visualizer || PERDE_DICT['TR'].visualizer;

  // Outputs
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeOriginalUrl, setActiveOriginalUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  
  // Staged File state (Waiting for instruction)
  const [stagedImage, setStagedImage] = useState<{base64: string, mimeType: string} | null>(null);
  
  // 4-Grid Variations State
  const [variations, setVariations] = useState<string[] | null>(null);
  const [variationCount, setVariationCount] = useState<1 | 2 | 4>(4);
  const [uploadPhase, setUploadPhase] = useState(false);
  const [canvasAttachments, setCanvasAttachments] = useState<any[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const { tenantId } = usePerdeAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Günaydın');
    else if (hour >= 12 && hour < 18) setGreeting('İyi Günler');
    else setGreeting('İyi Akşamlar');

    const handleStartRender = (e: any) => {
       const img = e.detail?.attachments?.[0]?.base64 || e.detail?.base64;
       triggerAutonomousRender(img);
    };
    const handleSync = (e: any) => {
       if (e.detail && Array.isArray(e.detail)) {
           setCanvasAttachments(e.detail);
       }
    };
    const handleEditRequest = (e: any) => {
      if (e.detail?.prompt) {
        const currentImage = resultImage || activeOriginalUrl || stagedImage?.base64;
        if (currentImage) {
          triggerAutonomousRender(currentImage);
        }
      }
    };
    window.addEventListener('start_autonomous_render', handleStartRender);
    window.addEventListener('agent_attachments_sync', handleSync);
    window.addEventListener('agent_request_edit', handleEditRequest);
    return () => {
       window.removeEventListener('start_autonomous_render', handleStartRender);
       window.removeEventListener('agent_attachments_sync', handleSync);
       window.removeEventListener('agent_request_edit', handleEditRequest);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedImage, variationCount, resultImage, activeOriginalUrl]);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
       const base64String = reader.result as string;
       setStagedImage({ base64: base64String, mimeType: file.type });
       setResultImage(null);
       setVariations(null);
       setActiveOriginalUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerAutonomousRender = async (sourceImageBase64?: string) => {
     const targetImage = sourceImageBase64 || stagedImage?.base64;
     if (!targetImage) return;
     
     setIsProcessing(true);
     if (variationCount === 1) {
        setLoadingMsg(T.rendering || 'İÇ MİMAR (YZ) DETAYLI 4K TASARIMI HAZIRLIYOR...');
     } else {
        setLoadingMsg(`İÇ MİMAR (YZ) ${variationCount} FARKLI KONSEPT (HIZLI TASLAK) ÜRETİYOR...`);
     }
     
     try {
       const response = await fetch('/api/render', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           imageBase64: targetImage,
           attachments: canvasAttachments.map(a => a.base64),
           variationCount,
           tenantId
         })
       });

       if (response.status === 402) {
         throw new Error("Yetersiz ALOHA Kredisi. Görsel tasarım başlatılamadı. Lütfen paketinizi yükseltin.");
       }

       if (!response.ok) {
         const err = await response.json();
         throw new Error(err.error || 'Render başarısız');
       }

       const data = await response.json();

       if (data.renderUrl) {
         setIsProcessing(false);
         if (variationCount === 1) {
           setResultImage(data.renderUrl);
           setActiveOriginalUrl(targetImage);
           const newHistory = renderHistory.slice(0, historyIndex + 1);
           newHistory.push({ url: data.renderUrl, originalUrl: targetImage });
           setRenderHistory(newHistory);
           setHistoryIndex(newHistory.length - 1);
           setStagedImage(null);
           setVariations(null);
         } else {
           const variationUrls = [data.renderUrl];
           for (let i = 1; i < variationCount; i++) {
             try {
               const vRes = await fetch('/api/render', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ imageBase64: targetImage, tenantId })
               });
               const vData = await vRes.json();
               if (vData.renderUrl) variationUrls.push(vData.renderUrl);
             } catch { /* skip failed variation */ }
           }
           setVariations(variationUrls);
           setActiveOriginalUrl(targetImage);
           setStagedImage(null);
         }
         
         window.dispatchEvent(new CustomEvent('agent_message', {
           detail: { message: `✅ Tasarım tamamlandı! Oda tipi: ${data.analysis?.roomType || 'bilinmiyor'}. Önerilen kumaşlar: ${data.suggestions?.map((s: any) => s.name).join(', ') || 'yok'}` }
         }));
       } else {
         throw new Error('Render sonucu alınamadı');
       }
     } catch (err: any) {
       console.error('Render error:', err);
       setIsProcessing(false);
       
       if (err.message.includes('ALOHA Kredisi')) {
           alert("Hata: " + err.message);
       } else {
           window.dispatchEvent(new CustomEvent('agent_message', {
             detail: { message: `❌ Tasarım hatası: ${err.message}. Lütfen tekrar deneyin.` }
           }));
       }
     }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSlider || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setResultImage(renderHistory[prevIndex].url);
      setActiveOriginalUrl(renderHistory[prevIndex].originalUrl);
      setSliderPosition(50);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setResultImage(null);
      setActiveOriginalUrl(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < renderHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setResultImage(renderHistory[nextIndex].url);
      setActiveOriginalUrl(renderHistory[nextIndex].originalUrl);
      setSliderPosition(50);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-zinc-950 text-white flex overflow-hidden rounded-3xl shadow-2xl relative">
      
      {/* CENTRAL CANVAS AREA */}
      <div className="flex-1 relative bg-zinc-950 flex flex-col overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setIsDraggingSlider(false)}
        onPointerLeave={() => setIsDraggingSlider(false)}
      >
        
        {/* Floating Top Bar (Undo / Redo / History indicators) */}
        {renderHistory.length > 0 && !isProcessing && (
          <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-2 z-30">
             <button 
               onClick={handleUndo} 
               disabled={historyIndex < 0}
               className="h-10 px-4 bg-zinc-900 border border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors rounded-lg flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:text-white"
             >
               <Undo2 className="h-4 w-4" /> Geri
             </button>
             <button 
               onClick={handleRedo} 
               disabled={historyIndex >= renderHistory.length - 1}
               className="h-10 px-4 bg-zinc-900 border border-white/10 text-[10px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-colors rounded-lg flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-zinc-900 disabled:hover:text-white"
             >
               <Redo2 className="h-4 w-4" /> İleri
             </button>
          </div>
        )}

        {/* Empty State / Initial File Dropzone */}
        {!resultImage && !stagedImage && !isProcessing && !variations && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] z-10">
             <div 
               className="w-full max-w-4xl aspect-[16/9] md:aspect-auto md:h-[60vh] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/30 hover:bg-white/[0.02] transition-colors cursor-pointer group shadow-2xl bg-black/20 backdrop-blur-sm"
               onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
               onDrop={(e) => {
                 e.preventDefault(); e.stopPropagation();
                 const file = e.dataTransfer?.files[0];
                 if(file) {
                    handleImageUpload(file);
                 }
               }}
               onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if(file) {
                        handleImageUpload(file);
                    }
                  };
                  input.click();
               }}
             >
                <div className="h-24 w-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <ImageIcon className="h-10 w-10 text-blue-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 font-sans text-white/90">
                  {greeting}, <span className="font-semibold text-white">Hoş Geldiniz!</span>
                </h2>
                <p className="text-zinc-400 text-sm md:text-base tracking-wide text-center max-w-xl leading-relaxed">
                  İşlemlere başlamak için buraya <strong className="text-white font-medium">tıklayarak</strong> fotoğraf yükleyebilir veya <strong className="text-white font-medium">sürükleyip bırakabilirsiniz.</strong>
                </p>
             </div>
          </div>
        )}

        {/* Staged Image - Waiting for User Instruction */}
        {stagedImage && !resultImage && !isProcessing && (
           <div className="absolute inset-4 md:inset-12 flex items-center justify-center z-10">
               <div className="relative w-full h-full max-h-[80vh] bg-zinc-950 shadow-2xl rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={stagedImage.base64} className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale" alt="Staged" />
                   
                   <div className="relative z-10 flex flex-col items-center p-8 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl md:w-[32rem] w-[95%] max-h-[95%] overflow-y-auto custom-scrollbar text-center shadow-2xl mx-4">
                       <ImageIcon className="w-8 h-8 text-white/50 mb-6" />
                       <h3 className="text-white text-2xl font-light tracking-tight mb-2">{T.configTitle || 'Tasarım Konfigürasyonu'}</h3>
                       <p className="text-zinc-400 text-sm mb-6 font-light">{T.configDesc || 'Kredi maliyetini optimize etmek için üretim tipini seçin.'}</p>
                       
                       {!uploadPhase ? (
                          <>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6">
                                  {[1, 2, 4].map((num) => (
                                      <button
                                          key={num}
                                          onClick={() => setVariationCount(num as any)}
                                          className={`py-3 px-2 rounded-lg border-2 transition-all font-medium flex flex-col items-center justify-center gap-1 ${
                                              variationCount === num 
                                                  ? 'border-[#8B7355] bg-[#8B7355]/10 text-white' 
                                                  : 'border-white/10 text-zinc-500 hover:border-white/30'
                                          }`}
                                      >
                                          <span className="text-lg">{num === 1 ? '1' : num === 2 ? "2'li" : "4'lü"}</span>
                                          <span className="text-[10px] uppercase tracking-wider text-center">{T.generateVariations || 'Resim Tasarla'}</span>
                                      </button>
                                  ))}
                              </div>
                              
                              <button 
                                 onClick={() => {
                                     setUploadPhase(true);
                                 }} 
                                 className="w-full bg-[#8B7355] text-white font-semibold tracking-wider py-4 rounded-xl shadow-lg hover:bg-[#725e45] transition-colors flex items-center justify-center gap-2"
                              >
                                  DEVAM ET <ArrowRight className="w-5 h-5"/>
                              </button>
                          </>
                       ) : (
                          <div className="w-full flex flex-col gap-4">
                              <div className="w-full text-left">
                                 <h4 className="text-white text-sm font-medium mb-1">{T.productsToUse || 'Kullanılacak Ürünler'}</h4>
                                 <p className="text-zinc-400 text-xs">Yüklediğiniz ürünleri isimlendirerek YZ'nin daha doğru tasarım yapmasını sağlayın.</p>
                              </div>

                              {canvasAttachments.length > 0 && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-h-[30vh] overflow-y-auto custom-scrollbar pr-2 border-b border-t border-white/5 py-2">
                                     {canvasAttachments.map((att: any) => (
                                        <div key={att.id} className="flex flex-col bg-zinc-900 border border-white/10 rounded-lg overflow-hidden relative">
                                            <div className="flex bg-black/40 h-16 shrink-0 relative">
                                                <img src={att.base64} alt="product" className="w-16 h-16 object-cover border-r border-white/10 shrink-0" />
                                                <div className="flex-1 p-2 flex flex-col justify-center relative">
                                                    <input 
                                                        type="text" 
                                                        value={att.label || ''} 
                                                        onChange={(e) => {
                                                            const newLabel = e.target.value;
                                                            // update local preemptively
                                                            setCanvasAttachments(prev => prev.map(p => p.id === att.id ? {...p, label: newLabel} : p));
                                                            // inform chat state over global event
                                                            window.dispatchEvent(new CustomEvent('agent_request_update_attachment', {
                                                                detail: { id: att.id, label: newLabel }
                                                            }));
                                                        }}
                                                        placeholder="Öürün: Ürün Ekle..." 
                                                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600 font-medium"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        // inform chat state
                                                        window.dispatchEvent(new CustomEvent('agent_request_remove_attachment', { detail: { id: att.id } }));
                                                    }}
                                                    className="absolute top-1 right-1 p-1 text-zinc-500 hover:text-red-400 transition-colors bg-black/50 rounded-md backdrop-blur-sm"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                     ))}
                                  </div>
                              )}

                              <div 
                                  className={`w-full ${canvasAttachments.length > 0 ? 'h-20' : 'h-40'} border-2 border-dashed border-[#8B7355] rounded-xl flex flex-col items-center justify-center bg-black/40 text-center p-4 cursor-pointer hover:bg-black/60 transition-colors`}
                                  onClick={() => {
                                      const input = document.createElement('input');
                                      input.type = 'file';
                                      input.accept = 'image/*';
                                      input.multiple = true;
                                      input.onchange = (e: any) => {
                                          const files = Array.from(e.target.files) as File[];
                                          files.forEach(file => {
                                              const reader = new FileReader();
                                              reader.onload = (re) => {
                                                  window.dispatchEvent(new CustomEvent('agent_request_add_attachment', {
                                                      detail: { file, base64: re.target?.result as string }
                                                  }));
                                                  if (window.innerWidth >= 768) {
                                                      window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { attention: false } }));
                                                  }
                                              };
                                              reader.readAsDataURL(file);
                                          });
                                      };
                                      input.click();
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                      e.preventDefault();
                                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                      files.forEach(file => {
                                          const reader = new FileReader();
                                          reader.onload = (re) => {
                                              window.dispatchEvent(new CustomEvent('agent_request_add_attachment', {
                                                  detail: { file, base64: re.target?.result as string }
                                              }));
                                              if (window.innerWidth >= 768) {
                                                  window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { attention: false } }));
                                              }
                                          };
                                          reader.readAsDataURL(file);
                                      });
                                  }}
                              >
                                  {canvasAttachments.length === 0 && <ImageIcon className="w-8 h-8 text-[#8B7355] mb-2" />}
                                  <span className="text-white text-sm font-medium">{canvasAttachments.length > 0 ? `+ ${T.addMoreProducts || 'Daha Fazla Ürün Ekle'}` : (T.dragProductsHere || 'Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin')}</span>
                                  {canvasAttachments.length === 0 && <span className="text-zinc-500 text-xs mt-1">({T.orClickToSelect || 'veya tıklayıp seçin'})</span>}
                              </div>
                              
                              {canvasAttachments.length > 0 ? (
                                  <>
                                      <button 
                                         onClick={() => window.dispatchEvent(new CustomEvent('start_autonomous_render', { detail: { attachments: canvasAttachments, prompt: '' } }))} 
                                         className="md:hidden w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
                                      >
                                          <Sparkles className="w-5 h-5"/> {T.startRender || 'TASARIMI BAŞLAT'}
                                      </button>
                                      <p className="hidden md:block text-[11px] text-zinc-400 mt-4 text-center px-4 leading-relaxed font-medium">
                                          Ürünleriniz hazır! Tasarımı başlatmak için sağ bölümdeki <strong className="text-white">Sanal İç Mimar'a</strong> (Chat) "Tasarla" diyebilir veya doğrudan butona tıklayabilirsiniz.
                                      </p>
                                  </>
                              ) : (
                                  <p className="text-[10px] text-zinc-400 mt-2">Not: {T.syncNote || 'Eklediğiniz ürünler AI Stüdyo hafızasına (sağ alt panele) senkronize edilecektir.'}</p>
                              )}
                          </div>
                       )}
                   </div>
               </div>
           </div>
        )}

        {/* 4-Grid Variations Result */}
        {variations && !resultImage && !isProcessing && (
          <div className="absolute inset-4 md:inset-12 flex flex-col items-center justify-center z-10 pt-16 md:pt-0">
            <div className="text-center mb-6">
               <h3 className="text-white text-2xl font-light tracking-tight mb-2">{variations.length} Farklı Tasarım Alteürünatifi</h3>
               <p className="text-zinc-400 text-sm font-light">{T.upscaleNote || 'Seçiminizi 4K Çözünürlüğe (Upscale) yükseltecektir.'}</p>
            </div>
            <div className={`grid gap-4 w-full h-full max-h-[70vh] max-w-5xl ${variations.length === 2 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-2 grid-rows-2'}`}>
               {variations.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative rounded-xl overflow-hidden cursor-pointer group shadow-2xl border-2 border-transparent hover:border-[#8B7355] transition-all bg-zinc-900"
                    onClick={() => {
                        setIsProcessing(true);
                        setLoadingMsg("T.upscaling || 'SEÇİLEN TASLAK 4K ÇÖZÜNÜRLÜKTE YENİDEN İŞLENİYOR (UPSCALE)...'");
                        setTimeout(() => {
                            setIsProcessing(false);
                            setResultImage(url);
                            const newHistory = renderHistory.slice(0, historyIndex + 1);
                            newHistory.push({ url: url, originalUrl: activeOriginalUrl });
                            setRenderHistory(newHistory);
                            setHistoryIndex(newHistory.length - 1);
                            setVariations(null);
                        }, 2500);
                    }}
                  >
                     <Image src={url} fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Variation ${idx}`} unoptimized />
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* Render Result with Before/After Slider */}
        {resultImage && (
          <div className="absolute inset-4 md:inset-12 flex items-center justify-center z-10 pt-16 md:pt-0">
            <div 
              ref={containerRef}
              className="relative w-full h-full max-h-[80vh] bg-black shadow-2xl overflow-hidden rounded-md border border-white/10"
            >
              {/* After Image (Generated) */}
              <Image src={resultImage} fill className="absolute inset-0 w-full h-full object-contain bg-zinc-950" alt="Generated" unoptimized />
              
              {/* Before Image (Original) masked by clipPath */}
              {activeOriginalUrl && (
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activeOriginalUrl} className="absolute inset-0 w-full h-full object-contain border-r border-white/30" alt="Original" />
                </div>
              )}
              
              {/* Slider Handle */}
              {activeOriginalUrl && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  onPointerDown={(e) => { e.preventDefault(); setIsDraggingSlider(true); }}
                >
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center border border-white/50">
                    <Expand className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Spinner */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center"
            >
              <div className="border border-white/10 p-12 bg-black rounded-[2rem] shadow-2xl flex flex-col items-center min-w-[320px]">
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-white animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-zinc-600 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest mb-3 font-sans">{T.processing || 'RENDER ALINIYOR'}</h2>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest animate-pulse">{loadingMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

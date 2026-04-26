'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';
import Image from 'next/image';
import { 
  Download, Loader2, Sparkles, Expand, Undo2, Redo2, Save, Image as ImageIcon, ArrowRight, ShoppingCart, Tent, Ruler, BookOpen, ChevronDown
} from 'lucide-react';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import toast from 'react-hot-toast';
import LeadCaptureModal from '@/components/trtex/LeadCaptureModal';

export default function RoomVisualizer() {

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Greeting logic
  const [greeting, setGreeting] = useState('Hoş Geldiniz');

  // Lead Modal
  const [leadModalOpen, setLeadModalOpen] = useState(false);

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
  const { SovereignNodeId } = usePerdeAuth();

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

  // ── Görsel Sıkıştırma (API Payload Boyutunu Düşürmek İçin) ──
  const compressImage = (base64: string, maxWidth = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
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
        const compressed = canvas.toDataURL('image/jpeg', quality);
        console.log(`[COMPRESS] ${Math.round(base64.length / 1024)}KB → ${Math.round(compressed.length / 1024)}KB (${w}x${h})`);
        resolve(compressed);
      };
      img.onerror = () => resolve(base64); // fallback: return original
      img.src = base64;
    });
  };

  const getClosestAspectRatio = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio > 1.5) resolve('16:9');
        else if (ratio > 1.1) resolve('4:3');
        else if (ratio > 0.8) resolve('1:1');
        else if (ratio > 0.6) resolve('3:4');
        else resolve('9:16');
      };
      img.onerror = () => resolve('1:1');
      img.src = base64;
    });
  };

  const matchDimensions = (originalBase64: string, generatedBase64: string): Promise<string> => {
    return new Promise((resolve) => {
      const origImg = new window.Image();
      origImg.onload = () => {
        const genImg = new window.Image();
        genImg.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = origImg.width;
          canvas.height = origImg.height;
          const ctx = canvas.getContext('2d')!;
          
          // Calculate object-cover dimensions to draw genImg onto origImg dimensions
          const origRatio = origImg.width / origImg.height;
          const genRatio = genImg.width / genImg.height;
          
          let drawWidth = origImg.width;
          let drawHeight = origImg.height;
          let offsetX = 0;
          let offsetY = 0;

          if (genRatio > origRatio) {
            // Generated is wider, crop sides
            drawWidth = origImg.height * genRatio;
            offsetX = (origImg.width - drawWidth) / 2;
          } else {
            // Generated is taller, crop top/bottom
            drawHeight = origImg.width / genRatio;
            offsetY = (origImg.height - drawHeight) / 2;
          }

          ctx.drawImage(genImg, offsetX, offsetY, drawWidth, drawHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        genImg.onerror = () => resolve(generatedBase64);
        genImg.src = generatedBase64;
      };
      origImg.onerror = () => resolve(generatedBase64);
      origImg.src = originalBase64;
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
        toast.error("Lütfen sadece resim dosyası yükleyin (JPG/PNG).");
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        toast.error("Dosya boyutu çok büyük! Maksimum 10MB olmalıdır.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
       const rawBase64 = reader.result as string;
       // Sıkıştır: 1200px max, %80 kalite → API payload'u düşür
       const compressed = await compressImage(rawBase64, 1200, 0.8);
       setStagedImage({ base64: compressed, mimeType: 'image/jpeg' });
       setResultImage(null);
       setVariations(null);
       setActiveOriginalUrl(null);
    };
    reader.onerror = () => {
       toast.error("Dosya yüklenirken bir sorun oluştu.");
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
       // v4: TÜM renderlar render-pro üzerinden (Dual-Label + model seçim stratejisi)
       const endpoint = '/api/perde/render-pro';

       // ── TÜM GÖRSELLERİ SIKIŞTIRIR (API payload boyutunu düşür) ──
       const compressedTarget = await compressImage(targetImage, 1200, 0.8);
       const calculatedAR = await getClosestAspectRatio(compressedTarget);

       const productsObj: Record<string, any> = {};
       for (const [i, a] of canvasAttachments.entries()) {
           const role = a.label || `Ürün ${i+1}`;
           const compressedProduct = await compressImage(a.base64, 800, 0.7);
           productsObj[role] = { data: compressedProduct, mimeType: 'image/jpeg' };
       }

       const bodyPayload = {
           spaceImage: { data: compressedTarget, mimeType: 'image/jpeg' },
           products: productsObj,
           variationCount,        // 1=4K tam render, 2/4=hızlı taslak
           aspectRatio: calculatedAR,   // Mekanın orijinal oranını koru (hesaplanan: 16:9, 4:3 vs)
           studioSettings: {
             decorationMode: canvasAttachments.length > 0 ? 'preserve' : 'auto-decor',
           },
           SovereignNodeId,
       };

       const payloadStr = JSON.stringify(bodyPayload);
       console.log(`[RENDER] Sending ${Math.round(payloadStr.length / 1024)}KB to ${endpoint}`);

       const response = await fetch(endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: payloadStr
       });

       if (response.status === 402) {
         throw new Error("Yetersiz ALOHA Kredisi. Görsel tasarım başlatılamadı. Lütfen paketinizi yükseltin.");
       }

       if (!response.ok) {
         // Sunucu HTML hata sayfası dönebilir — JSON parse güvenli olmalı
         let errorMsg = `Sunucu hatası (${response.status})`;
         try {
           const err = await response.json();
           errorMsg = err.error || errorMsg;
         } catch {
           // JSON parse edilemedi (HTML hata sayfası)
           console.error('[RENDER] Sunucu JSON olmayan hata döndürdü, status:', response.status);
         }
         throw new Error(errorMsg);
       }

       const data = await response.json();

       if (data.renderUrl) {
         setIsProcessing(false);
         if (variationCount === 1) {
           const finalImage = await matchDimensions(targetImage, data.renderUrl);
           setResultImage(finalImage);
           setActiveOriginalUrl(targetImage);
           const newHistory = renderHistory.slice(0, historyIndex + 1);
           newHistory.push({ url: finalImage, originalUrl: targetImage });
           setRenderHistory(newHistory);
           setHistoryIndex(newHistory.length - 1);
           setStagedImage(null);
           setVariations(null);
         } else {
           const variationUrls = [data.renderUrl];
           for (let i = 1; i < variationCount; i++) {
             try {
               // v4.1 FIX: Use the exact same render-pro endpoint and payload for variations!
               // Do not fallback to the legacy /api/render which lacks products & anti-hallucination.
               const vRes = await fetch(endpoint, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: payloadStr
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
         window.dispatchEvent(new CustomEvent('RENDER_COMPLETE', {
           detail: { url: data.renderUrl }
         }));
       } else {
         throw new Error('Render sonucu alınamadı');
       }
     } catch (err: any) {
        console.error('Render error:', err);
        setIsProcessing(false);
        setStagedImage(null);

        // Kullanıcıya GERÇEK hata mesajını göster — sahte resim YASAK
        const errorMsg = err.message || 'Tasarım motoru yanıt vermedi.';
        toast.error(`❌ Render Hatası: ${errorMsg}`, { duration: 6000 });

        window.dispatchEvent(new CustomEvent('agent_message', {
          detail: { message: `❌ Tasarım motoru hata verdi: ${errorMsg}. Lütfen tekrar deneyin veya farklı bir görsel yükleyin.` }
        }));
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
                <p className="text-zinc-500 text-xs mt-4 text-center max-w-md">
                  Fotoğrafınız yoksa sağ alt köşedeki <strong className="text-blue-400">Sanal İç Mimar</strong> ile sohbet edin — otonom tasarım yapabilir.
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
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pb-4">
                                     {canvasAttachments.map((att: any) => (
                                        <div key={att.id} className="w-full flex flex-col bg-zinc-900 border border-white/10 rounded-lg overflow-hidden relative shadow-lg">
                                            <div className="flex bg-black/40 h-16 shrink-0 relative">
                                                <img src={att.base64} alt="product" className="w-16 h-16 object-cover border-r border-white/10 shrink-0" />
                                                <div className="flex-1 p-2 flex flex-col justify-center relative min-w-0">
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
                                                        // Doğrudan state'ten sil
                                                        setCanvasAttachments(prev => prev.filter(p => p.id !== att.id));
                                                        // Chat paneline de bildir (açıksa)
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

                              {canvasAttachments.length < 6 && (
                                  <div 
                                      className={`w-full ${canvasAttachments.length > 0 ? 'h-20' : 'h-40'} border-2 border-dashed border-[#8B7355] rounded-xl flex flex-col items-center justify-center bg-black/40 text-center p-4 cursor-pointer hover:bg-black/60 transition-colors`}
                                      onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'image/*';
                                          input.multiple = true;
                                          input.onchange = (e: any) => {
                                              const files = Array.from(e.target.files) as File[];
                                              const availableSlots = 6 - canvasAttachments.length;
                                              const filesToAdd = files.slice(0, Math.max(0, availableSlots));
                                              
                                              filesToAdd.forEach(file => {
                                                  const reader = new FileReader();
                                                  reader.onload = (re) => {
                                                      const base64 = re.target?.result as string;
                                                      const newAtt = {
                                                        id: `att_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                                                        base64,
                                                        label: '',
                                                        mimeType: file.type || 'image/jpeg',
                                                      };
                                                      setCanvasAttachments(prev => [...prev, newAtt]);
                                                      // Chat paneline de senkronize et (açıksa)
                                                      window.dispatchEvent(new CustomEvent('agent_request_add_attachment', {
                                                          detail: { file, base64 }
                                                      }));
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
                                          const availableSlots = 6 - canvasAttachments.length;
                                          const filesToAdd = files.slice(0, Math.max(0, availableSlots));
                                          
                                          filesToAdd.forEach(file => {
                                              const reader = new FileReader();
                                              reader.onload = (re) => {
                                                  const base64 = re.target?.result as string;
                                                  const newAtt = {
                                                    id: `att_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                                                    base64,
                                                    label: '',
                                                    mimeType: file.type || 'image/jpeg',
                                                  };
                                                  setCanvasAttachments(prev => [...prev, newAtt]);
                                              };
                                              reader.readAsDataURL(file);
                                          });
                                      }}
                                  >
                                      {canvasAttachments.length === 0 && <ImageIcon className="w-8 h-8 text-[#8B7355] mb-2" />}
                                      <span className="text-white text-sm font-medium">{canvasAttachments.length > 0 ? `+ ${T.addMoreProducts || 'Daha Fazla Ürün Ekle'}` : (T.dragProductsHere || 'Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin')}</span>
                                      {canvasAttachments.length === 0 && <span className="text-zinc-500 text-xs mt-1">({T.orClickToSelect || 'veya tıklayıp seçin'})</span>}
                                  </div>
                              )}
                              
                              {canvasAttachments.length >= 6 && (
                                  <div className="w-full text-center text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                                      Maksimum kapasiteye (6 ürün) ulaştınız.
                                  </div>
                              )}
                              
                              {canvasAttachments.length > 0 ? (
                                  <>
                                      <button 
                                         onClick={() => triggerAutonomousRender()} 
                                         className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
                                      >
                                          <Sparkles className="w-5 h-5"/> {T.startRender || 'TASARIMI BAŞLAT'}
                                      </button>
                                      <p className="text-[11px] text-zinc-400 mt-3 text-center px-4 leading-relaxed font-medium">
                                          {canvasAttachments.length} ürün eklendi. Etiketleri yazarak AI&apos;ın doğru yerleştirmesini sağlayın.
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

              {/* Elegant B2B Watermark */}
              <div className="absolute bottom-6 right-6 z-20 pointer-events-none opacity-40 flex flex-col items-end">
                  <span className="text-2xl font-black text-white tracking-[0.3em] uppercase font-serif mix-blend-overlay">PERDE.AI</span>
                  <span className="text-[8px] font-mono text-white/70 tracking-widest uppercase">Sovereign Engine</span>
              </div>
              
              {/* Admin Ecosystem Dropdown (Top Right) */}
              <div className="absolute top-6 right-6 z-30 group">
                 <button className="bg-black/50 backdrop-blur-md border border-white/10 text-white p-3 rounded-full hover:bg-black transition-colors flex items-center justify-center">
                    <Tent className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                 </button>
                 <div className="absolute right-0 mt-2 flex-col gap-2 hidden group-hover:flex w-48">
                    <button 
                       onClick={async () => {
                         toast.success('Vorhang.ai Pazaryerine Gönderiliyor...', { icon: '🚀' });
                         try {
                           await fetch('/api/system/signals', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               type: 'VORHANG_PRODUCT_LISTED',
                               source_node: 'perde',
                               target_node: 'vorhang',
                               payload: { image: activeOriginalUrl, seller: "Perde.ai Designer" }
                             })
                           });
                           toast.success('Ürün başarıyla Vorhang.ai mağazanıza eklendi.');
                         } catch (e) {
                           toast.error('Gönderim başarısız.');
                         }
                       }}
                       className="bg-black/90 backdrop-blur border border-white/10 text-white px-4 py-3 rounded-lg text-xs tracking-wider flex items-center justify-between hover:bg-[#8B7355]/20 hover:border-[#8B7355]/50 transition-all w-full text-left"
                    >
                       <span>Vorhang'a Aktar</span> <ShoppingCart className="w-3 h-3 text-[#8B7355]" />
                    </button>
                    <button 
                       onClick={async () => {
                         toast.success('Hometex Sanal Fuara Işınlanıyor...', { icon: '🎪' });
                         try {
                           await fetch('/api/system/signals', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               type: 'TELEPORT_INITIATED',
                               source_node: 'perde',
                               target_node: 'hometex',
                               payload: { image: activeOriginalUrl }
                             })
                           });
                           setTimeout(() => {
                             window.location.href = 'http://hometex.localhost:3000/exhibitors/upload';
                           }, 1500);
                         } catch (e) {
                           toast.error('Işınlanma başarısız.');
                         }
                       }}
                       className="bg-black/90 backdrop-blur border border-white/10 text-white px-4 py-3 rounded-lg text-xs tracking-wider flex items-center justify-between hover:bg-[#8B7355]/20 hover:border-[#8B7355]/50 transition-all w-full text-left"
                    >
                       <span>Hometex Fuarı</span> <Tent className="w-3 h-3 text-[#8B7355]" />
                    </button>
                 </div>
              </div>

              {/* B2B Floating Action Bar (Bottom Center) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                 <button className="text-zinc-300 hover:text-white px-6 py-3 rounded-xl text-[11px] font-medium tracking-widest flex items-center gap-2 transition-colors hover:bg-white/5 uppercase">
                    <Download className="w-4 h-4" />
                    <span>SUNUM İNDİR</span>
                 </button>
                 <div className="w-px h-6 bg-white/10 mx-1"></div>
                 <button 
                    onClick={() => setLeadModalOpen(true)}
                    className="text-zinc-300 hover:text-white px-6 py-3 rounded-xl text-[11px] font-medium tracking-widest flex items-center gap-2 transition-colors hover:bg-white/5 uppercase"
                 >
                    <BookOpen className="w-4 h-4" />
                    <span>NUMUNE İSTE</span>
                 </button>
                 <div className="w-px h-6 bg-white/10 mx-1"></div>
                 <button 
                    onClick={() => setLeadModalOpen(true)}
                    className="bg-gradient-to-r from-[#8B7355] to-[#725e45] text-white px-8 py-3 rounded-xl text-[11px] font-bold tracking-[0.15em] flex items-center gap-2 hover:shadow-[0_0_20px_rgba(139,115,85,0.4)] transition-all uppercase"
                 >
                    <Ruler className="w-4 h-4" />
                    <span>METRAJ & FİYAT HESAPLA</span>
                 </button>
              </div>
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

        {/* B2B LEAD CAPTURE MODAL */}
        <LeadCaptureModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          context={{ type: 'PERDE_DESIGN', title: 'Yapay Zeka Destekli Perde Tasarımı' }}
          brandName="PERDE.AI"
        />

      </div>
    </div>
  );
}

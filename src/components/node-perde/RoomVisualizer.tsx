'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';
import Image from 'next/image';
import { 
  Download, Loader2, Sparkles, Expand, Undo2, Redo2, Save, Image as ImageIcon, ArrowRight, ShoppingCart, Tent, Ruler, BookOpen, ChevronDown, X, Globe, Share2, Columns, Presentation, Maximize
} from 'lucide-react';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import toast from 'react-hot-toast';
import LeadCaptureModal from '@/components/trtex/LeadCaptureModal';

export default function RoomVisualizer() {

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // Greeting logic
  const [greeting, setGreeting] = useState('Hoş Geldiniz');

  // Lead Modal & CRM
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [crmData, setCrmData] = useState({
    customerName: '', projectName: '', notes: ''
  });
  const [archivedProjects, setArchivedProjects] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // History / Inputs
  const [renderHistory, setRenderHistory] = useState<{ url: string; originalUrl: string | null }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const searchParams = useSearchParams();
  const lang = (searchParams.get('lang') || 'TR').toUpperCase() as keyof typeof PERDE_DICT;
  const T = PERDE_DICT[lang]?.visualizer || PERDE_DICT['TR'].visualizer;
  const projectId = searchParams?.get('projectId');

  useEffect(() => {
    if (projectId) {
       fetch(`/api/perde/projects?id=${projectId}`)
         .then(res => res.json())
         .then(data => {
            if (data.project) {
              setStagedImage({ base64: data.project.originalImage, mimeType: 'image/jpeg' });
              setResultImage(data.project.resultImage);
              setActiveOriginalUrl(data.project.originalImage);
              setCanvasAttachments(data.project.fabrics || []);
              toast.success(`${data.project.customerName} projesi arşividen yüklendi.`, { icon: '🔄' });
            }
         }).catch(err => console.error(err));
    }
  }, [projectId]);

  // Outputs
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeOriginalUrl, setActiveOriginalUrl] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  
  // Staged File state (Waiting for instruction)
  const [stagedImage, setStagedImage] = useState<{base64: string, mimeType: string} | null>(null);
  
  // 4-Grid Variations State Removed (Always 4K single image)
  const [preFlightConfidence, setPreFlightConfidence] = useState<number | null>(null); // Ürün kutucukları state'i (Sıfırıncı noktada boş)
  const [canvasAttachments, setCanvasAttachments] = useState<any[]>([]);
  
  // Stil Referansı / Model (Opsiyonel)
  const [referenceModel, setReferenceModel] = useState<any>(null);
  
  // 4K Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ startX: 0, startY: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const { SovereignNodeId } = usePerdeAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Günaydın');
    else if (hour >= 12 && hour < 18) setGreeting('İyi Günler');
    else setGreeting('İyi Akşamlar');

    const handleStartRender = (e: any) => {
       // Only trigger with existing staged image and user prompt.
       const prompt = e.detail?.prompt;
       triggerAutonomousRender(undefined, false, prompt);
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
          triggerAutonomousRender(currentImage, false, e.detail.prompt);
        }
      }
    };
    // ── CİLA MODU: render-edit API ile mevcut tasarımı düzenle ──
    const handleRenderEdit = async (e: any) => {
      const editPrompt = e.detail?.editPrompt;
      const currentRender = resultImage;
      if (!editPrompt || !currentRender) {
        window.dispatchEvent(new CustomEvent('agent_message', {
          detail: { message: '⚠️ Düzenleme için önce bir tasarım oluşturmalısınız.' }
        }));
        return;
      }
      setIsProcessing(true);
      setLoadingMsg('CİLA MOTORU TASARIMI DÜZENLİYOR...');
      try {
        const response = await fetch('/api/perde/render-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalImageBase64: currentRender,
            editPrompt,
            SovereignNodeId,
          }),
        });
        if (!response.ok) {
          let errorMsg = `Sunucu hatası (${response.status})`;
          try { const err = await response.json(); errorMsg = err.error || errorMsg; } catch {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        if (data.renderUrl) {
          const finalImage = await matchDimensions(currentRender, data.renderUrl);
          setResultImage(finalImage);
          const newHistory = renderHistory.slice(0, historyIndex + 1);
          newHistory.push({ url: finalImage, originalUrl: activeOriginalUrl });
          setRenderHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          setZoomLevel(1);
          setPanPos({ x: 0, y: 0 });
          window.dispatchEvent(new CustomEvent('agent_message', {
            detail: { message: `✅ Cila tamamlandı: "${editPrompt}" uygulandı.` }
          }));
        } else {
          throw new Error(data.error || 'Düzenleme sonucu alınamadı');
        }
      } catch (err: any) {
        console.error('[RENDER-EDIT] Error:', err);
        toast.error(`❌ Cila Hatası: ${err.message}`, { duration: 6000 });
        window.dispatchEvent(new CustomEvent('agent_message', {
          detail: { message: `❌ Cila motoru hata verdi: ${err.message}` }
        }));
      } finally {
        setIsProcessing(false);
      }
    };
    window.addEventListener('start_autonomous_render', handleStartRender);
    window.addEventListener('agent_attachments_sync', handleSync);
    window.addEventListener('agent_request_edit', handleEditRequest);
    window.addEventListener('request_render_edit', handleRenderEdit);
    return () => {
       window.removeEventListener('start_autonomous_render', handleStartRender);
       window.removeEventListener('agent_attachments_sync', handleSync);
       window.removeEventListener('agent_request_edit', handleEditRequest);
       window.removeEventListener('request_render_edit', handleRenderEdit);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedImage, resultImage, activeOriginalUrl, renderHistory, historyIndex]);

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

  const sliceCollage = (base64: string, count: number): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const slices: string[] = [];
        const w = img.width;
        const h = img.height;
        
        if (count === 2) {
          const halfW = w / 2;
          for (let i = 0; i < 2; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = halfW;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, i * halfW, 0, halfW, h, 0, 0, halfW, h);
            slices.push(canvas.toDataURL('image/jpeg', 0.9));
          }
        } else if (count === 4) {
          const halfW = w / 2;
          const halfH = h / 2;
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
              const canvas = document.createElement('canvas');
              canvas.width = halfW;
              canvas.height = halfH;
              const ctx = canvas.getContext('2d')!;
              ctx.drawImage(img, col * halfW, row * halfH, halfW, halfH, 0, 0, halfW, halfH);
              slices.push(canvas.toDataURL('image/jpeg', 0.9));
            }
          }
        } else {
           slices.push(base64);
        }
        resolve(slices);
      };
      img.onerror = () => resolve([base64]);
      img.src = base64;
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
       setActiveOriginalUrl(null);
       setReferenceModel(null);
       setZoomLevel(1);
       setPanPos({ x: 0, y: 0 });
    };
    reader.onerror = () => {
       toast.error("Dosya yüklenirken bir sorun oluştu.");
    };
    reader.readAsDataURL(file);
  };

  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/perde/projects');
      const data = await res.json();
      if (data.projects) setArchivedProjects(data.projects);
    } catch(e) {
      console.error(e);
    }
  };

  const handleSaveProject = async () => {
    if (!crmData.customerName) {
      toast.error('Müşteri Adı zorunludur.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...crmData,
        originalImage: activeOriginalUrl || stagedImage?.base64,
        resultImage: resultImage,
        fabrics: canvasAttachments,
        SovereignNodeId
      };
      
      const res = await fetch('/api/perde/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Proje Müşteriye Kaydedildi!', { icon: '📁' });
        setIsSaveModalOpen(false);
        fetchArchives(); // Refresh
      } else {
        toast.error(data.error || 'Kaydedilemedi');
      }
    } catch(e) {
      toast.error('Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadArchivedProject = (proj: any) => {
    // Kaldığın Yerden Devam Et (Rehydration)
    setStagedImage({ base64: proj.originalImage, mimeType: 'image/jpeg' });
    setResultImage(proj.resultImage);
    setActiveOriginalUrl(proj.originalImage);
    setCanvasAttachments(proj.fabrics || []);
    setIsArchiveOpen(false);
    toast.success(`${proj.customerName} projesi yüklendi. Kaldığınız yerden devam edebilirsiniz.`, { icon: '🔄' });
  };

  const triggerAutonomousRender = async (sourceImageBase64?: string, isUpscale: boolean = false, promptOverride?: string) => {
     const targetImage = sourceImageBase64 || stagedImage?.base64;
     if (!targetImage) return;
     
     setIsProcessing(true);
     setLoadingMsg(T.rendering || 'İÇ MİMAR (YZ) DETAYLI 4K TASARIMI HAZIRLIYOR...');
     
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
           productsObj[role] = { data: compressedProduct, mimeType: 'image/jpeg', physics: a.physics || 'auto' };
       }

       const bodyPayload = {
           spaceImage: { data: compressedTarget, mimeType: 'image/jpeg' },
           products: productsObj,
           referenceModel: referenceModel ? { data: await compressImage(referenceModel.base64, 800, 0.7), mimeType: 'image/jpeg' } : undefined,
           variationCount: 1, // Her zaman 1 (4K)
           isUpscale: true,
           aspectRatio: calculatedAR,   // Mekanın orijinal oranını koru (hesaplanan: 16:9, 4:3 vs)
           userPrompt: promptOverride,
           studioSettings: {
             decorationMode: canvasAttachments.length > 0 ? 'preserve' : 'auto-decor',
             semanticMasking: true // Phase 1: Otonom Pencere Tespiti Aktif
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
         if (data.preFlightData?.confidence) {
            setPreFlightConfidence(data.preFlightData.confidence);
         } else {
            setPreFlightConfidence(null);
         }
         setIsProcessing(false);
         
         const finalImage = await matchDimensions(targetImage, data.renderUrl);
         setResultImage(finalImage);
         setActiveOriginalUrl(targetImage);
         const newHistory = renderHistory.slice(0, historyIndex + 1);
         newHistory.push({ url: finalImage, originalUrl: targetImage });
         setRenderHistory(newHistory);
         setHistoryIndex(newHistory.length - 1);
          setStagedImage(null);
          setZoomLevel(1);
          setPanPos({ x: 0, y: 0 });

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
        {!resultImage && !stagedImage && !isProcessing && (
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
           <div className="absolute inset-0 md:inset-2 flex items-center justify-center z-10">
               <div className="relative w-full h-full max-h-full bg-zinc-950 md:shadow-2xl md:rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={stagedImage.base64} className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale" alt="Staged" />
                   
                   <div className="relative z-10 flex flex-col items-center p-4 md:px-6 md:pt-6 md:pb-4 backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl md:w-[38rem] w-[98%] max-h-[98%] text-center shadow-2xl mx-4">
                       <button 
                         onClick={() => {
                            setStagedImage(null);
                            setActiveOriginalUrl(null);
                            setCanvasAttachments([]);
                            setReferenceModel(null);
                         }}
                         className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
                         title="Fotoğrafı İptal Et / Yeniden Yükle"
                       >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                       </button>
                       <h3 className="text-white text-xl font-medium tracking-tight mb-1">Perde Kumaşlarını Belirle</h3>
                       <p className="text-zinc-400 text-sm mb-2 font-light">Tasarımda kullanılacak kumaşları yükleyin ve isimlendirin.</p>
                       
                       <div className="w-full flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] md:max-h-[75vh]">
                           <div className="w-full text-left">
                              <h4 className="text-white text-sm font-medium mb-1">{T.productsToUse || 'Kullanılacak Ürünler'}</h4>
                              <p className="text-zinc-400 text-xs">Yüklediğiniz ürünleri isimlendirerek YZ'nin daha doğru tasarım yapmasını sağlayın.</p>
                           </div>

                              {canvasAttachments.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pb-2">
                                     {canvasAttachments.map((att: any) => (
                                        <div key={att.id} className="w-full flex flex-col bg-zinc-900 border border-white/10 rounded-lg overflow-hidden relative shadow-lg">
                                            <div className="flex bg-black/40 h-14 shrink-0 relative">
                                                <img src={att.base64} alt="product" className="w-14 h-14 object-cover border-r border-white/10 shrink-0" />
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
                                                        placeholder="Örn: Tül Perde, Fon Kumaşı..." 
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
                                      className={`w-full ${canvasAttachments.length > 0 ? 'h-14' : 'h-32'} border-2 border-dashed border-[#8B7355] rounded-xl flex flex-col items-center justify-center bg-black/40 text-center p-2 cursor-pointer hover:bg-black/60 transition-colors`}
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
                                                  reader.onload = async (re) => {
                                                      const base64 = re.target?.result as string;

                                                      // FAZ 3: AIPyram Brain Zero-Duplication Kumaş Hafızası
                                                      let physicsValue = 'auto';
                                                      try {
                                                          const res = await fetch('/api/brain/v1/fabric-memory', {
                                                              method: 'POST',
                                                              headers: { 'Content-Type': 'application/json' },
                                                              body: JSON.stringify({ image_base64: base64, source_node: 'perde_visualizer' })
                                                          });
                                                          if (res.ok) {
                                                            const data = await res.json();
                                                            if (data.physics?.type) physicsValue = data.physics.type;
                                                            if (data.cached) toast.success('Kumaş Beyin Hafızasında Bulundu!', { icon: '🧠', id: 'brain_cache' });
                                                          }
                                                      } catch (e) {
                                                          console.error('[AIPyram Brain] Bağlantı hatası', e);
                                                      }

                                                      const newAtt = {
                                                        id: `att_${Date.now()}_${crypto.randomUUID().slice(0,5)}`,
                                                        base64,
                                                        label: '',
                                                        physics: physicsValue,
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
                                              reader.onload = async (re) => {
                                                  const base64 = re.target?.result as string;

                                                  // FAZ 3: AIPyram Brain Zero-Duplication Kumaş Hafızası
                                                  let physicsValue = 'auto';
                                                  try {
                                                      const res = await fetch('/api/brain/v1/fabric-memory', {
                                                          method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: JSON.stringify({ image_base64: base64, source_node: 'perde_visualizer' })
                                                      });
                                                      if (res.ok) {
                                                        const data = await res.json();
                                                        if (data.physics?.type) physicsValue = data.physics.type;
                                                        if (data.cached) toast.success('Kumaş Beyin Hafızasında Bulundu!', { icon: '🧠', id: 'brain_cache_drop' });
                                                      }
                                                  } catch (e) {
                                                      console.error('[AIPyram Brain] Bağlantı hatası', e);
                                                  }

                                                  const newAtt = {
                                                    id: `att_${Date.now()}_${crypto.randomUUID().slice(0,5)}`,
                                                    base64,
                                                    label: '',
                                                    physics: physicsValue,
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
                                  <div className="w-full text-center text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg shrink-0">
                                      Maksimum kapasiteye (6 ürün) ulaştınız.
                                  </div>
                              )}
                              
                              {/* REFERANS MODEL EKLEME */}
                              <div className="w-full mt-2 shrink-0">
                                {referenceModel ? (
                                  <div className="flex items-center gap-2 bg-black border border-emerald-500/30 rounded-xl p-2 shadow-lg relative">
                                     <img src={referenceModel.base64} className="w-10 h-10 object-cover rounded opacity-80" alt="Referans" />
                                     <div className="flex-1 text-left">
                                        <p className="text-emerald-400 text-xs font-semibold tracking-wide">Stil Referansı Aktif</p>
                                        <p className="text-zinc-500 text-[10px]">YZ perdenin şeklini bu resme benzetecek.</p>
                                     </div>
                                     <button onClick={() => setReferenceModel(null)} className="p-2 text-zinc-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <button 
                                     onClick={() => {
                                         const input = document.createElement('input');
                                         input.type = 'file';
                                         input.accept = 'image/jpeg, image/png';
                                         input.onchange = (e: any) => {
                                             if (e.target.files && e.target.files[0]) {
                                                 const reader = new FileReader();
                                                 reader.onload = () => setReferenceModel({ base64: reader.result as string, mimeType: e.target.files[0].type });
                                                 reader.readAsDataURL(e.target.files[0]);
                                             }
                                         };
                                         input.click();
                                     }}
                                     className="w-full h-10 border border-white/10 bg-black/20 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2 hover:bg-black/60 hover:text-white hover:border-white/20 transition-all font-medium"
                                  >
                                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><circle cx="9" cy="9" r="2"/><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"/><path d="m16 5 3 3 3-3"/><path d="m19 2 3 3-3 3"/></svg>
                                     Örnek Model / Stil Görseli Ekle (İsteğe Bağlı)
                                  </button>
                                )}
                              </div>
                              
                          </div>

                          <div className="w-full mt-3 pt-3 border-t border-white/10 shrink-0 flex flex-col">
                              
                              {canvasAttachments.length > 0 ? (
                                  <>
                                      <button 
                                         onClick={() => triggerAutonomousRender()} 
                                         className="w-full mt-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold tracking-wider py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
                                      >
                                          <Sparkles className="w-5 h-5"/> {T.startRender || 'TASARIMI BAŞLAT'}
                                      </button>
                                      <p className="text-[11px] text-zinc-400 mt-3 text-center px-4 leading-relaxed font-medium">
                                          {canvasAttachments.length} ürün eklendi. Etiketleri yazarak AI&apos;ın doğru yerleştirmesini sağlayın.
                                      </p>
                                  </>
                              ) : null}
                              
                              <button 
                                onClick={() => {
                                  setStagedImage(null);
                                  setActiveOriginalUrl(null);
                                  setCanvasAttachments([]);
                                  setReferenceModel(null);
                                }}
                                className="w-full mt-3 bg-transparent border border-zinc-500/30 text-zinc-400 text-sm font-medium py-2.5 rounded-xl hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2"
                              >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
                                  Mekan Fotoğrafını Değiştir
                              </button>
                          </div>
                   </div>
               </div>
           </div>
        )}

        {/* Render Result with Before/After Slider */}
        {resultImage && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 pt-16 md:pt-0 ${presentationMode ? 'fixed !inset-0 !z-[100] bg-black m-0 p-0' : 'md:inset-2'}`}>
            <div 
              ref={containerRef}
              className={`relative w-full h-full max-h-full bg-black overflow-hidden border border-white/10 ${presentationMode ? '' : 'md:shadow-2xl md:rounded-2xl'}`}
              onWheel={(e) => {
                 const delta = e.deltaY * -0.005;
                 const newZoom = Math.min(Math.max(1, zoomLevel + delta), 4);
                 setZoomLevel(newZoom);
                 if (newZoom === 1) setPanPos({ x: 0, y: 0 });
              }}
            >
              
              {/* Zoom Container */}
              <div 
                 className={`absolute inset-0 w-full h-full transition-transform ${isPanning ? 'duration-0 cursor-grabbing' : 'duration-100 cursor-grab'}`}
                 style={{ transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)` }}
                 onPointerDown={(e) => {
                    if (zoomLevel > 1) {
                       setIsPanning(true);
                       panRef.current.startX = e.clientX - panPos.x;
                       panRef.current.startY = e.clientY - panPos.y;
                    }
                 }}
                 onPointerMove={(e) => {
                    if (isPanning && zoomLevel > 1) {
                       setPanPos({ x: e.clientX - panRef.current.startX, y: e.clientY - panRef.current.startY });
                    }
                 }}
                 onPointerUp={() => setIsPanning(false)}
                 onPointerLeave={() => setIsPanning(false)}
              >
                 {isSideBySide && activeOriginalUrl ? (
                    <div className="absolute inset-0 w-full h-full flex pointer-events-none">
                       <div className="flex-1 relative border-r border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activeOriginalUrl} className="absolute inset-0 w-full h-full object-contain" alt="Original" />
                          <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-[10px] font-bold tracking-widest text-white backdrop-blur-md">ÖNCESİ</div>
                       </div>
                       <div className="flex-1 relative">
                          <Image src={resultImage} fill className="absolute inset-0 w-full h-full object-contain" alt="Generated" unoptimized />
                          <div className="absolute bottom-4 right-4 bg-emerald-500/80 px-2 py-1 rounded text-[10px] font-bold tracking-widest text-white backdrop-blur-md">SONRASI</div>
                       </div>
                    </div>
                 ) : (
                    <>
                       {/* After Image (Generated) */}
                       <Image src={resultImage} fill className="absolute inset-0 w-full h-full object-contain bg-zinc-950 pointer-events-none" alt="Generated" unoptimized />
                       
                       {/* Before Image (Original) masked by clipPath */}
                       {activeOriginalUrl && (
                         <div 
                           className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                           style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                         >
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={activeOriginalUrl} className="absolute inset-0 w-full h-full object-contain border-r border-white/30" alt="Original" />
                         </div>
                       )}
                       
                       {/* Slider Handle */}
                       {activeOriginalUrl && (
                         <div 
                           className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-30 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                           style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                           onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingSlider(true); }}
                         >
                           <div className="w-14 h-14 bg-black/60 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border-2 border-white/70 cursor-ew-resize hover:scale-110 transition-transform">
                             <Expand className="h-5 w-5 text-white pointer-events-none" />
                           </div>
                         </div>
                       )}
                    </>
                 )}
              </div>

              {!presentationMode && (
                 <div className="absolute bottom-6 left-6 z-30 flex flex-wrap gap-2 items-center">
                     <button 
                         onClick={() => setIsSaveModalOpen(true)}
                         className="bg-zinc-950/80 hover:bg-black border border-zinc-700/50 hover:border-emerald-500/50 backdrop-blur-xl text-zinc-300 hover:text-emerald-400 px-6 py-2.5 rounded-full text-[11px] font-semibold tracking-widest uppercase flex items-center gap-2 shadow-2xl transition-all"
                         title="Projeyi Kaydet"
                     >
                         <Save className="w-4 h-4" /> KAYDET
                     </button>
                     <button 
                         onClick={() => {
                            const a = document.createElement('a');
                            a.href = resultImage!;
                            a.download = `perde-ai-${crmData.projectName || 'tasarim'}-${Date.now()}.jpg`;
                            a.click();
                         }}
                         className="bg-zinc-950/80 hover:bg-black border border-zinc-700/50 hover:border-white/50 backdrop-blur-xl text-zinc-300 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transition-all"
                         title="Görseli İndir"
                     >
                         <Download className="w-4 h-4" />
                     </button>
                     <button 
                         onClick={() => {
                            window.open(`https://wa.me/?text=${encodeURIComponent('Perde.ai ile hazırladığım yeni tasarıma göz atın!')}`, '_blank');
                         }}
                         className="bg-zinc-950/80 hover:bg-black border border-zinc-700/50 hover:border-green-500/50 backdrop-blur-xl text-zinc-300 hover:text-green-400 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transition-all"
                         title="WhatsApp'ta Paylaş"
                     >
                         <Share2 className="w-4 h-4" />
                     </button>
                     <div className="w-px h-6 bg-white/10 mx-1"></div>
                     <button 
                         onClick={() => setIsSideBySide(!isSideBySide)}
                         className={`bg-zinc-950/80 hover:bg-black border border-zinc-700/50 backdrop-blur-xl w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transition-all ${isSideBySide ? 'text-blue-400 border-blue-500/50' : 'text-zinc-300 hover:text-white hover:border-white/50'}`}
                         title="Yan Yana / Slider Karşılaştırma"
                     >
                         <Columns className="w-4 h-4" />
                     </button>
                     <button 
                         onClick={() => setPresentationMode(true)}
                         className="bg-zinc-950/80 hover:bg-black border border-zinc-700/50 hover:border-purple-500/50 backdrop-blur-xl text-zinc-300 hover:text-purple-400 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transition-all"
                         title="Sunum Modu (Tam Ekran)"
                     >
                         <Maximize className="w-4 h-4" />
                     </button>
                 </div>
              )}

              {/* Exit Presentation Mode Button */}
              {presentationMode && (
                 <button 
                    onClick={() => setPresentationMode(false)}
                    className="absolute top-6 right-6 z-50 bg-black/50 hover:bg-black border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 backdrop-blur-md transition-all"
                 >
                    <X className="w-4 h-4" /> Çıkış
                 </button>
              )}

              {/* Render History Mini Gallery (Bottom Right) */}
              {!presentationMode && renderHistory.length > 1 && (
                 <div className="absolute bottom-6 right-6 z-30 flex gap-2 max-w-[50vw] overflow-x-auto p-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                    {renderHistory.map((item, idx) => (
                       <button
                         key={idx}
                         onClick={() => {
                            setHistoryIndex(idx);
                            setResultImage(item.url);
                            setActiveOriginalUrl(item.originalUrl);
                            setSliderPosition(50);
                         }}
                         className={`relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === historyIndex ? 'border-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                       >
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={item.url} className="w-full h-full object-cover" alt={`Render ${idx+1}`} />
                       </button>
                    ))}
                 </div>
              )}

              {/* Confidence Badge (Phase 1.5) */}
              {preFlightConfidence && (
                <div className="absolute top-6 left-6 z-30 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-2xl">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">%{Math.round(preFlightConfidence * 100)}</span>
                    <span className="text-zinc-300 font-light tracking-wide">Gerçeklik Simülasyonu</span>
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

        {/* B2B LEAD CAPTURE MODAL */}
        <LeadCaptureModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          context={{ type: 'PERDE_DESIGN', title: 'Yapay Zeka Destekli Perde Tasarımı' }}
          brandName="PERDE.AI"
        />

        {/* TASARIM ARŞİVİ — Projeyi Kaydet */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
               <div className="p-6 border-b border-white/10 sticky top-0 bg-zinc-900 z-10 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-400"/> Tasarım Arşivi</h2>
                 <button onClick={() => setIsSaveModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
               </div>
               
               <div className="p-6 space-y-4">
                 <div>
                   <label className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1 block">Proje / Oda Adı *</label>
                   <input type="text" placeholder="Örn: Yatak Odası, Salon..." value={crmData.projectName} onChange={e=>setCrmData({...crmData, projectName: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-emerald-500/50" />
                 </div>
                 <div>
                   <label className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1 block">Müşteri Adı</label>
                   <input type="text" placeholder="İsteğe bağlı" value={crmData.customerName} onChange={e=>setCrmData({...crmData, customerName: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-emerald-500/50" />
                 </div>
                 <div>
                   <label className="text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1 block">Notlar</label>
                   <textarea placeholder="Tasarım hakkında notlar..." value={crmData.notes} onChange={e=>setCrmData({...crmData, notes: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm text-white outline-none h-20 resize-none focus:border-emerald-500/50" />
                 </div>

                 {/* Öncesi / Sonrası Önizleme */}
                 {resultImage && activeOriginalUrl && (
                   <div className="grid grid-cols-2 gap-3">
                     <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                       <img src={activeOriginalUrl} className="w-full h-full object-cover" alt="Öncesi" />
                       <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-widest bg-black/70 text-zinc-300 px-2 py-1 rounded-full font-bold">Öncesi</span>
                     </div>
                     <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-emerald-500/30">
                       <img src={resultImage} className="w-full h-full object-cover" alt="Sonrası" />
                       <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-widest bg-emerald-500/70 text-white px-2 py-1 rounded-full font-bold">Sonrası</span>
                     </div>
                   </div>
                 )}
               </div>

               <div className="p-6 border-t border-white/10 bg-zinc-900 sticky bottom-0 z-10 flex gap-4">
                 <button onClick={() => setIsSaveModalOpen(false)} className="px-8 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition font-medium">İptal</button>
                 <button onClick={handleSaveProject} disabled={isSaving} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-500 transition disabled:opacity-50 flex justify-center items-center gap-2">
                   {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                   {isSaving ? 'Kaydediliyor...' : 'Tasarımı Arşive Kaydet'}
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

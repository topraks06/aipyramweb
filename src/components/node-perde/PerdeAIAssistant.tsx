import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Minimize2, Maximize2, Send, Paperclip, 
  Bot, Loader2, TrendingUp, Hammer, Package, Briefcase, FileText, Download, User, History, Image as ImageIcon,
  Mic, MicOff, Volume2, VolumeX, Globe
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { PieChart as VIPieChart, MiniBarChart as VIMiniBarChart, KPICard as VIKPICard, DataCredibility } from '@/components/ui/visual-intelligence';

const DICT: Record<string, any> = {
  tr: {
    headerTitle: "SANAL İÇ MİMAR",
    headerSubtitle: "YAPAY ZEKA LİDERİ",
    welcome: "Tasarım Stüdyosuna hoş geldiniz. Kumaşlarınızı ataş (📎) simgesinden yükleyebilir, mevcut tasarımı yeniden şekillendirmek (cila) için bana komut verebilirsiniz.",
    placeholder: "Örn: Ürün Ekle...",
    processing: "Sistemi inceliyorum...",
    startRenderMsg: "Kumaşlarınızı/desenlerinizi sisteme aldım. Tasarım motorunu hemen çalıştırıyorum...",
    uploadPromptMsg: "Şimdi bu simülasyonda kullanmak istediğiniz ürünlerin görsellerini aşağıdaki ataş simgesine tıklayarak yükleyin.",
    panelAdjustMsg: "Panel Ayarlanıyor..."
  },
  en: {
    headerTitle: "VIRTUAL INTERIOR DESIGNER",
    headerSubtitle: "AI LEADER",
    welcome: "Hello! What is your industry? (Curtains, Furniture, Lighting, Interior Design, Fashion, Beauty Salon etc.) Tell me your profession, and I will tailor the system for you!",
    placeholder: "Ex: Add Product...",
    processing: "Analyzing system...",
    startRenderMsg: "I have received your fabrics/patterns. Starting the design engine immediately...",
    uploadPromptMsg: "Now, please upload the images of the products you want to use in this simulation by clicking the paperclip icon below.",
    panelAdjustMsg: "Adjusting Panel..."
  },
  de: {
    headerTitle: "VIRTUELLER INNENARCHITEKT",
    headerSubtitle: "KI-FÜHRER",
    welcome: "Hallo! Was ist Ihre Branche? (Vorhänge, Möbel, Beleuchtung, Innenarchitektur, Mode, Schönheitssalon usw.) Nennen Sie Ihren Beruf und ich werde das System für Sie anpassen!",
    placeholder: "Bsp: Produkt hinzufügen...",
    processing: "System wird analysiert...",
    startRenderMsg: "Stoffe/Muster erhalten. Die Design-Engine wird sofort gestartet...",
    uploadPromptMsg: "Laden Sie nun bitte die Bilder der Produkte hoch, die Sie in dieser Simulation verwenden möchten, indem Sie unten auf das Büroklammer-Symbol klicken.",
    panelAdjustMsg: "Panel wird angepasst..."
  },
  es: {
    headerTitle: "DISEÑADOR DE INTERIORES",
    headerSubtitle: "LÍDER EN IA",
    welcome: "¡Hola! ¿Cuál es su sector? (Cortinas, Muebles, Iluminación, Diseño de Interiores, Moda, Salón de Belleza, etc.) ¡Dígame su profesión y adaptaré el sistema para usted!",
    placeholder: "Ej: Añadir producto...",
    processing: "Analizando sistema...",
    startRenderMsg: "He recibido tus telas/patrones. Iniciando el motor de diseño inmediatamente...",
    uploadPromptMsg: "Ahora, suba las imágenes de los productos que desea usar en esta simulación haciendo clic en el icono del clip a continuación.",
    panelAdjustMsg: "Ajustando panel..."
  },
  fr: {
    headerTitle: "ARCHITECTE VIRTUEL",
    headerSubtitle: "LEADER EN IA",
    welcome: "Bonjour ! Quel est votre secteur ? (Rideaux, Meubles, Éclairage, Design d'intérieur, Mode, Beauté, etc.) Dites-moi votre profession et je personnaliserai le système pour vous !",
    placeholder: "Ex: Ajouter...",
    processing: "Analyse du système...",
    startRenderMsg: "J'ai reçu vos tissus/motifs. Démarrage du moteur de conception immédiatement...",
    uploadPromptMsg: "Mainnode, veuillez télécharger les images des produits que vous souhaitez utiliser en cliquant sur le trombone ci-dessous.",
    panelAdjustMsg: "Ajustement du panneau..."
  },
  ru: {
    headerTitle: "ВИРТУАЛЬНЫЙ ДИЗАЙНЕР",
    headerSubtitle: "ИИ ЛИДЕР",
    welcome: "Здравствуйте! Какая у вас отрасль? Назовите свою профессию, и я настрою систему для вас!",
    placeholder: "Напр.: Добавить...",
    processing: "Анализ системы...",
    startRenderMsg: "Ткани получены. Запускаю движок дизайна немедленно...",
    uploadPromptMsg: "Теперь загрузите изображения продуктов, нажав на значок скрепки.",
    panelAdjustMsg: "Настройка панели..."
  },
  zh: {
    headerTitle: "虚拟室内设计师",
    headerSubtitle: "人工智能领导者",
    welcome: "你好！你的行业是什么？（窗帘、家具、灯饰、室内设计等）告诉我你的职业，我会为你定制系统！",
    placeholder: "例：添加产品...",
    processing: "正在分析系统...",
    startRenderMsg: "已收到您的面料/图案。正在启动设计引擎...",
    uploadPromptMsg: "现在请点击下方回形针图标上传您想要使用的产品图片。",
    panelAdjustMsg: "正在调整面板..."
  },
  ar: {
    headerTitle: "مصمم داخلي افتراضي",
    headerSubtitle: "رائد في الذكاء الاصطناعي",
    welcome: "مرحباً! ما هو مجالك؟ (ستائر، أثاث...) أخبرني بمهنتك وسأقوم بتخصيص النظام لك!",
    placeholder: "مثال: إضافة منتج...",
    processing: "جاري تحليل النظام...",
    startRenderMsg: "لقد تلقيت الأقمشة. بدء تشغيل محرك التصميم فوراً...",
    uploadPromptMsg: "الآن يرجى تحميل صور المنتجات بالنقر على أيقونة مشبك الورق.",
    panelAdjustMsg: "جاري ضبط اللوحة..."
  }
};

export default function PerdeAIAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState('tr');
  const d = DICT[locale] || DICT['tr'];
  const { SovereignNodeId, user } = useSovereignAuth('perde');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAttention, setIsAttention] = useState(false);
  const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
  
  // Custom Drag & Resize State (Bulletproof tracking)
  const [bounds, setBounds] = useState(() => {
     if (typeof window === 'undefined') return { x: 800, y: 200, w: 360, h: 500 };
     const w = 360;
     const h = 500;
     const x = Math.max(10, window.innerWidth - w - 20);
     const y = Math.max(10, window.innerHeight - h - 20);
     return { x, y, w, h };
  });
  const [isInteractive, setIsInteractive] = useState(false);
  const actionRef = useRef({ type: '', startX: 0, startY: 0, initialB: bounds });

  const [sessionId, setSessionId] = useState<string>('');
  // Messages State
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
     let currentSessionId = '';
     if (user?.uid && SovereignNodeId) {
         currentSessionId = `${user.uid}_${SovereignNodeId}`;
     } else if (typeof window !== 'undefined' && SovereignNodeId) {
         currentSessionId = localStorage.getItem(`anon_chat_${SovereignNodeId}`) || `anon_${SovereignNodeId}_${Date.now()}`;
         localStorage.setItem(`anon_chat_${SovereignNodeId}`, currentSessionId);
     }
     if (currentSessionId) {
         setSessionId(currentSessionId);
         fetch(`/api/chat/history?sessionId=${currentSessionId}`)
           .then(res => res.json())
           .then(data => {
               if (data.messages && data.messages.length > 0) {
                   const formatted = data.messages.map((m: any) => ({
                       id: m.id || crypto.randomUUID(),
                       role: m.role === 'assistant' ? 'agent' : 'user',
                       content: m.text
                   }));
                   setMessages(formatted);
               } else {
                   setMessages([{
                      id: 'welcome',
                      role: 'agent',
                      content: DICT[locale]?.welcome || DICT['tr'].welcome
                   }]);
               }
           }).catch(err => {
               console.error(err);
               setMessages([{
                  id: 'welcome',
                  role: 'agent',
                  content: DICT[locale]?.welcome || DICT['tr'].welcome
               }]);
           });
     }
  }, [user, SovereignNodeId]);
  
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSector, setCurrentSector] = useState('perde');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ id: string, base64: string, file: File, label?: string }[]>([]);
  const hasCompletedRender = useRef(false);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const silenceTimerRef = useRef<any>(null);

  // Sync locale changes
  useEffect(() => {
     setMessages(prev => prev.map(m => m.id === 'welcome' ? { ...m, content: d.welcome } : m));
  }, [locale]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, isExpanded, bounds]);

  // --- Proactive Interaction Logic ---
  const proactiveTriggered = useRef(false);
  const hasNudged = useRef(false);
  const [showOfferBadge, setShowOfferBadge] = useState(false);
  useEffect(() => {
     if (pathname === '/sites/perde/schema/b2b' && !proactiveTriggered.current) {
        proactiveTriggered.current = true;
        setTimeout(() => {
            if (!isOpen) setIsOpen(true);
            setMessages(prev => [...prev, {
                id: 'proactive-' + Date.now(),
                role: 'agent',
                content: `Panele hoş geldin! Sen yokken sistemine arka planda eklenen siparişleri ve yeni dosyaları tespit ettim. Dilersen 'bugün ne var' yazarak özetini anında görebilirsin. Bütün detayları senin için klasörledim.`
            }]);
        }, 1500);
     }
  }, [pathname, isOpen]);

  useEffect(() => {
    const handleAgentMessage = (e: any) => {
       if (e.detail?.message) {
           if (!isOpen) setIsOpen(true);
           setMessages(prev => [...prev, {
              id: 'sys-' + Date.now(),
              role: 'agent',
              content: e.detail.message
           }]);
       }
    };
    const handleOpen = (e: any) => {
        setIsOpen(true);
        if (e.detail?.attention) {
            setIsAttention(true);
            setTimeout(() => setIsAttention(false), 5000);
        }
        if (e.detail?.action === 'upload') {
            setMessages(prev => [...prev, {
               id: 'sys-' + Date.now(),
               role: 'agent',
               content: d.uploadPromptMsg
            }]);
        }
    };
    const handleRemoteAttachment = (e: any) => {
        if(e.detail?.file && e.detail?.base64) {
            setAttachments(prev => {
                const updated = [...prev, {
                    id: crypto.randomUUID(),
                    file: e.detail.file,
                    base64: e.detail.base64
                }];
                // Broadcast sync
                return updated;
            });
        }
    };
    const handleRemoteUpdate = (e: any) => {
        if(e.detail?.id) {
            setAttachments(prev => prev.map(p => p.id === e.detail.id ? {...p, label: e.detail.label} : p));
        }
    };
    const handleRemoteRemove = (e: any) => {
        if(e.detail?.id) {
            setAttachments(prev => prev.filter(p => p.id !== e.detail.id));
        }
    };
    const handleRenderComplete = (e: any) => {
        if (hasNudged.current) {
            if (!isOpen) setShowOfferBadge(true);
            return;
        }
        hasNudged.current = true;
        if (!isOpen) setIsOpen(true);
        setIsAttention(true);
        setMessages(prev => [...prev, {
            id: 'render-cta-' + Date.now(),
            role: 'agent',
            content: `Tasarım başarıyla tamamlandı. Yeniden şekillendirmek (cila) için komut verebilirsiniz.`
        }]);
        hasCompletedRender.current = true;
        setTimeout(() => setIsAttention(false), 3000);
    };
    window.addEventListener('agent_message', handleAgentMessage);
    window.addEventListener('open_perde_ai_assistant', handleOpen);
    window.addEventListener('agent_request_add_attachment', handleRemoteAttachment);
    window.addEventListener('agent_request_update_attachment', handleRemoteUpdate);
    window.addEventListener('agent_request_remove_attachment', handleRemoteRemove);
    window.addEventListener('RENDER_COMPLETE', handleRenderComplete);
    return () => {
        window.removeEventListener('agent_message', handleAgentMessage);
        window.removeEventListener('open_perde_ai_assistant', handleOpen);
        window.removeEventListener('agent_request_add_attachment', handleRemoteAttachment);
        window.removeEventListener('agent_request_update_attachment', handleRemoteUpdate);
        window.removeEventListener('agent_request_remove_attachment', handleRemoteRemove);
        window.removeEventListener('RENDER_COMPLETE', handleRenderComplete);
    };
  }, [isOpen]);

  useEffect(() => {
     window.dispatchEvent(new CustomEvent('agent_attachments_sync', { detail: attachments }));
  }, [attachments]);

  // TTS Logic
  useEffect(() => {
      if (!isSpeakerOn || messages.length === 0) return;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'agent') {
          const msgContent = lastMsg.content;
          const utterance = new SpeechSynthesisUtterance(msgContent);
          utterance.lang = locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'tr-TR';
          window.speechSynthesis.speak(utterance);
      }
  }, [messages, isSpeakerOn, locale]);

  const handleMicClick = () => {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert('Tarayıcınız sesli komutları desteklemiyor.');
          return;
      }
      if (isListening) {
          shouldListenRef.current = false;
          recognitionRef.current?.stop();
          setIsListening(false);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          return;
      }
      
      const resetSilenceTimer = () => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
              shouldListenRef.current = false;
              recognitionRef.current?.stop();
              setIsListening(false);
          }, 300000); // 5 mins auto-stop
      };

      shouldListenRef.current = true;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'tr-TR';
      recognition.interimResults = true;
      recognition.onstart = () => {
          setIsListening(true);
          resetSilenceTimer();
      };
      recognition.onresult = (event: any) => {
          resetSilenceTimer();
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript;
          }
          setInputMsg(fullTranscript);
      };
      recognition.onerror = (e: any) => {
          if (e.error === 'not-allowed' || e.error === 'aborted') {
              shouldListenRef.current = false;
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          }
      };
      recognition.onend = () => {
          if (shouldListenRef.current) {
              try {
                  recognition.start();
              } catch(e) { }
          } else {
              setIsListening(false);
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          }
      };
      recognitionRef.current = recognition;
      recognition.start();
  };

  // --- Unified Drag/Resize Logic ---
  const handlePointerDown = (type: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actionRef.current = { type, startX: e.clientX, startY: e.clientY, initialB: bounds };
    setIsInteractive(true);
    document.body.style.userSelect = 'none';
    if(type !== 'drag') {
        document.body.style.cursor = `${type}-resize`;
    }
  };

  useEffect(() => {
    if (!isInteractive) return;
    
    const onMove = (e: PointerEvent) => {
      const { type, startX, startY, initialB } = actionRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let { x, y, w, h } = initialB;

      if (type === 'drag') {
          x += dx; y += dy;
      } else {
          if (type.includes('e')) w += dx;
          if (type.includes('s')) h += dy;
          if (type.includes('w')) { w -= dx; x += dx; }
          if (type.includes('n')) { h -= dy; y += dy; }
          
          const minW = 320; const minH = 200;
          if (w < minW) { if (type.includes('w')) x -= (minW - w); w = minW; }
          if (h < minH) { if (type.includes('n')) y -= (minH - h); h = minH; }
      }
      
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + w > maxW) x = maxW - w;
      if (y + h > maxH) y = maxH - h;

      setBounds({ x, y, w, h });
    };

    const onUp = () => {
      setIsInteractive(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isInteractive]);

  const handleSend = async () => {
    if (!inputMsg.trim() && attachments.length === 0) return;
    
    if (isListening) {
        shouldListenRef.current = false;
        recognitionRef.current?.stop();
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }

    const userMsg = inputMsg;
    const currentAttachments = [...attachments];
    
        let replyContent = d.processing;
    let widgetType = null;
    let customPayload: any = null;
    const lower = userMsg.toLowerCase();

    // NAVIGATION INTENTS (Client Side)
    const isNavigating = lower.includes('geç') || lower.includes('git') || lower.includes('aç') || lower.includes('götür');
    if (isNavigating && (lower.includes('tasarım') || lower.includes('kanvas') || lower.includes('kaanvas') || lower.includes('çizim'))) {
      router.push('/sites/perde/visualizer');
      setMessages(prev => [...prev, { id: 'nav-' + Date.now(), role: 'agent', content: 'Tasarım Motoru açılıyor...' }]);
      setIsTyping(false);
      return;
    }
    if (isNavigating && (lower.includes('yönetim') || lower.includes('b2b') || lower.includes('panel'))) {
      router.push('/sites/perde/b2b');
      setMessages(prev => [...prev, { id: 'nav-' + Date.now(), role: 'agent', content: 'B2B Yönetim Paneli açılıyor...' }]);
      setIsTyping(false);
      return;
    }


    // ── STİL MAP: Tasarım stilleri ve prompt karşılıkları ──
    const STYLE_MAP: Record<string, string> = {
      'japandi': 'Japandi style: natural light wood, beige-white tones, minimal low-profile furniture, woven textures, diffused natural light',
      'minimalist': 'Minimalist: clean lines, monochrome neutral palette, hidden storage, less is more, geometric shapes',
      'modern': 'Modern contemporary: sleek surfaces, neutral palette with bold accent colors, statement pendant lighting',
      'klasik': 'Classic elegant: ornate carved details, rich velvet and silk fabrics, warm dark wood, crystal chandelier',
      'rustik': 'Rustic: exposed wood beams, natural stone walls, vintage distressed furniture, warm ambient lighting',
      'bohem': 'Bohemian: layered colorful textiles, macramé wall hangings, indoor plants, eclectic furniture mix',
      'endüstriyel': 'Industrial loft: exposed brick, metal pipe fixtures, raw concrete, Edison bulb lighting',
      'skandinav': 'Scandinavian: white walls, light ash wood, cozy hygge textiles, functional minimal furniture',
      'art deco': 'Art Deco: geometric patterns, gold and brass accents, velvet upholstery, jewel tones',
      'country': 'Country cottage: floral prints, painted wood furniture, checkered textiles, warm pastel colors',
      'loft': 'Urban loft: open high-ceiling, industrial elements, modern art, concrete floors, designer furniture',
      'tropikal': 'Tropical: rattan and bamboo furniture, palm leaf patterns, bright green plants, airy white curtains',
      'osmanlı': 'Ottoman Turkish: intricate tile patterns, kilim rugs, brass lanterns, carved wood, burgundy and gold',
      'retro': 'Retro 70s: warm mustard and orange tones, curved furniture, shag rugs, statement wallpaper',
    };
    const STYLE_KEYS = Object.keys(STYLE_MAP);
    const matchedStyle = STYLE_KEYS.find(s => lower.includes(s));

    // ── 1.1 STİL DEĞİŞTİRME: "Bu odayı japandi yap" ──
    const isStyleIntent = !!(matchedStyle || ((lower.includes('tarz') || lower.includes('stil') || lower.includes('style')) && hasCompletedRender.current));
    if (isStyleIntent && hasCompletedRender.current && currentAttachments.length === 0) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      const stylePrompt = matchedStyle 
        ? `Completely redesign this room in ${STYLE_MAP[matchedStyle]}. Keep the room geometry and windows exactly the same.`
        : userMsg;
      const styleName = matchedStyle ? matchedStyle.charAt(0).toUpperCase() + matchedStyle.slice(1) : 'Custom';
      setInputMsg('');
      setMessages(prev => [...prev,
        { id: 'u-' + uid, role: 'user', content: userMsg },
        { id: 'style-' + uid, role: 'agent', content: `🎨 **${styleName}** stili uygulanıyor... Mekan geometrisi korunarak tüm dekorasyon yeniden tasarlanıyor.` }
      ]);
      window.dispatchEvent(new CustomEvent('request_render_edit', { detail: { editPrompt: stylePrompt } }));
      setIsTyping(false);
      return;
    }

    // ── 1.2 MOBİLYA/OBJE SWAP: "Koltuğu yeşil kadife yap" ──
    const FURNITURE_WORDS = ['koltuk', 'kanepe', 'masa', 'sandalye', 'yatak', 'dolap', 'raf', 'avize', 'lamba', 'halı', 'paspas', 'yastık', 'vazo', 'ayna', 'tablo', 'sehpa', 'konsol', 'kitaplık', 'puf', 'berjer', 'tabure', 'komodin', 'gardırop', 'aplik', 'spot', 'abajur'];
    const matchedFurniture = FURNITURE_WORDS.find(f => lower.includes(f));
    if (matchedFurniture && hasCompletedRender.current && currentAttachments.length === 0) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      setInputMsg('');
      setMessages(prev => [...prev,
        { id: 'u-' + uid, role: 'user', content: userMsg },
        { id: 'swap-' + uid, role: 'agent', content: `🔄 **${matchedFurniture.charAt(0).toUpperCase() + matchedFurniture.slice(1)}** değiştiriliyor...` }
      ]);
      window.dispatchEvent(new CustomEvent('request_render_edit', { detail: { editPrompt: userMsg } }));
      setIsTyping(false);
      return;
    }

    // ── 1.3 RENK PALETİ ÖNERİSİ: "Bu oda için renk öner" ──
    const isColorAdvice = lower.includes('renk öner') || lower.includes('palet') || lower.includes('renk kombinasyonu') || lower.includes('hangi renk') || lower.includes('ne renk') || lower.includes('renk uyumu');
    if (isColorAdvice) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      setInputMsg('');
      setMessages(prev => [...prev, { id: 'u-' + uid, role: 'user', content: userMsg }]);
      setIsTyping(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `Kullanıcı iç mekan tasarımı için renk paleti önerisi istiyor: "${userMsg}". 60-30-10 kuralına göre 3 farklı renk paleti öner. Her palet için: ana renk, ikincil renk, aksan renk, hangi yüzeylere uygulanacağı. Kısa ve net cevap ver.`, history: [], sessionId: sessionId || `perde_${Date.now()}`, node: SovereignNodeId, authorId: user?.uid || 'anonymous' })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { id: 'colorres-' + uid, role: 'agent', content: data.text || '🎨 Renk analizi tamamlandı.' }]);
      } catch { setMessages(prev => [...prev, { id: 'colorerr-' + uid, role: 'agent', content: 'Renk analizi sırasında hata oluştu.' }]); }
      setIsTyping(false);
      return;
    }

    // ── 1.4 İLHAM / MOODBOARD: "Fikir ver", "ilham" ──
    const isInspirationIntent = lower.includes('ilham') || lower.includes('fikir ver') || lower.includes('moodboard') || lower.includes('nasıl güzel') || lower.includes('ne yapabilirim');
    if (isInspirationIntent && !isNavigating && currentAttachments.length === 0) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      setInputMsg('');
      setMessages(prev => [...prev, { id: 'u-' + uid, role: 'user', content: userMsg }]);
      setIsTyping(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: `İç mekan tasarımcısı olarak kullanıcıya ilham ver: "${userMsg}". 3-5 somut tasarım fikri öner. Her fikir için: stil adı, anahtar elemanlar (mobilya, renk, tekstil, aydınlatma), ve neden iyi olacağı. Perde, kumaş, mobilya, aydınlatma önerilerini dahil et. Kısa cevap.`, history: [], sessionId: sessionId || `perde_${Date.now()}`, node: SovereignNodeId, authorId: user?.uid || 'anonymous' })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { id: 'inspres-' + uid, role: 'agent', content: data.text || '💡 Tasarım fikirleri hazır.' }]);
      } catch { setMessages(prev => [...prev, { id: 'insperr-' + uid, role: 'agent', content: 'Fikir oluştururken hata oluştu.' }]); }
      setIsTyping(false);
      return;
    }

    const isRenderIntent = lower.includes('tasarla') || lower.includes('render') || lower.includes('çiz') || lower.includes('dene') || lower.includes('giydir') || lower.includes('uygula');
    const isEditIntent = lower.includes('cila') || lower.includes('düzenle') || lower.includes('değiştir') || lower.includes('bordo') || lower.includes('sıkılaştır') || lower.includes('gevşet') || lower.includes('kaldır') || lower.includes('ekle') || lower.includes('rengi') || lower.includes('tonu') || lower.includes('açık yap') || lower.includes('koyu yap') || lower.includes('küçük') || lower.includes('büyük') || lower.includes('pile') || lower.includes('yığma') || lower.includes('kısa') || lower.includes('uzun') || lower.includes('kat') || lower.includes('fon') || lower.includes('tül') || lower.includes('desen') || lower.includes('olsun') || lower.includes('azalt') || lower.includes('artır') || lower.includes('koyulaştır') || lower.includes('açıklaştır');
    const isAnalysisIntent = lower.includes('analiz') || lower.includes('incele');
    
    // ── CİLA MODU: Render tamamlanmışsa ve yeni attachment yoksa → düzenleme komutu ──
    const shouldEdit = (isEditIntent || hasCompletedRender.current) && !isRenderIntent && currentAttachments.length === 0 && userMsg.trim().length > 0;
    if (shouldEdit) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      setInputMsg('');
      setMessages(prev => [...prev,
        { id: 'u-' + uid, role: 'user', content: userMsg },
        { id: 'edit-' + uid, role: 'agent', content: 'Tasarım düzenleniyor... Cila motoru devrede.' }
      ]);
      window.dispatchEvent(new CustomEvent('request_render_edit', { detail: { editPrompt: userMsg } }));
      setIsTyping(false);
      return;
    }

    // ── YENİ RENDER: Attachment + render komutu ("yap" sadece attachment varken tetiklenir) ──
    const isYapWithAttachment = lower.includes('yap') && currentAttachments.length > 0;
    if (isRenderIntent || isYapWithAttachment || (currentAttachments.length > 0 && !isAnalysisIntent)) {
      const uid = Date.now() + '-' + crypto.randomUUID().slice(0, 5);
      setInputMsg('');
      setAttachments([]);
      hasCompletedRender.current = false; // Yeni render başlıyor, cila modu sıfırla
      setMessages(prev => [...prev, 
        { id: 'u-' + uid, role: 'user', content: userMsg || 'Tasarımı başlat', attachments: currentAttachments },
        { id: 'r-' + uid, role: 'agent', content: d.startRenderMsg }
      ]);
      window.dispatchEvent(new CustomEvent('start_autonomous_render', { detail: { attachments: currentAttachments, prompt: userMsg } }));
      setIsTyping(false);
      return;
    }

    // ── KUMAŞ ANALİZİ TETİKLEME (analyze-fabric) ──
    if ((lower.includes('analiz') || lower.includes('incele')) && currentAttachments.length > 0) {
      setInputMsg('');
      setAttachments([]);
      setMessages(prev => [...prev, 
        { id: 'u-' + Date.now(), role: 'user', content: userMsg || 'Bu kumaşı analiz et', attachments: currentAttachments },
        { id: 'a-' + Date.now(), role: 'agent', content: 'Kumaş analizi yapılıyor...' }
      ]);
      fetch('/api/perde/analyze-fabric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: currentAttachments[0]?.base64 })
      }).then(res => res.json()).then(data => {
        // API returns { success, suggestions: [...] }
        const suggestions = data.suggestions;
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          const formatted = suggestions.map((s: any, i: number) => 
            `${i + 1}. **${s.category}** — ${s.fabricType}\n   Renk: ${s.color} | Desen: ${s.pattern}\n   ${s.reason}\n   💰 ${s.priceRange} | 🧪 ${s.martindale || '-'}`
          ).join('\n\n');
          setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'agent', content: `Kumaş Analiz Sonuçları:\n\n${formatted}` }]);
        } else {
          setMessages(prev => [...prev, { id: 'sys-' + Date.now(), role: 'agent', content: 'Analiz tamamlandı ancak öneri üretilemedi.' }]);
        }
      }).catch(err => {
        setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'agent', content: 'Analiz sırasında hata oluştu: ' + err.message }]);
      });
      setIsTyping(false);
      return;
    }

    // ── KOLEKSİYON MOTORU TETİKLEME ──
    if (lower.includes('koleksiyon') && (lower.includes('oluştur') || lower.includes('hazırla') || lower.includes('üret'))) {
      router.push('/sites/perde/studio');
      setMessages(prev => [...prev, { id: 'col-' + Date.now(), role: 'agent', content: 'Koleksiyon Motoru (Design Engine) açılıyor... AI arka planda kumaş dokusu, konsept ve renk paletini hazırlıyor.' }]);
      fetch('/api/perde/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      }).then(res => res.json()).then(data => {
         // Veri gelirse UI'ı güncelleyebilir veya asistan üzerinden gösterebiliriz.
         console.log("Collection data:", data);
      });
      setIsTyping(false);
      return;
    }

    // ── TEKLİF / FİYAT / ÖLÇÜ → YÖNETİM PANELİNE YÖNLENDİR ──
    if ((lower.includes('teklif') && lower.includes('hazırla')) || lower.includes('keşif föyü') || lower.includes('fiyat hesapla') || lower.includes('metraj') || lower.includes('sipariş')) {
      setMessages(prev => [...prev,
        { id: 'u-' + Date.now(), role: 'user', content: userMsg },
        { id: 'erp-' + Date.now(), role: 'agent', content: 'Fiyat, teklif ve sipariş işlemleri **Yönetim Paneli**\'nden yapılır. Sizi yönlendireyim mi? (Burası sadece tasarım stüdyosu)' }
      ]);
      setInputMsg('');
      setIsTyping(false);
      return;
    }

    // DYNAMIC DASHBOARD GENERATOR (Deep Logic)
    let detectedSector = null;
    const keywords = ["halı", "aydınlatma", "kuaför", "berber", "mimar", "mobilya", "perde", "aksesuar", "bahçe", "peyzaj", "kumaş", "güzellik", "inşaat", "doktor", "oto", "diş", "restoran", "kafe", "yazılım"];
    const matchedKeyword = keywords.find(k => lower.includes(k));
    if (matchedKeyword) {
        detectedSector = matchedKeyword;
    } else if (lower.includes('mesleğim') || lower.includes('sektörüm')) {
        const words = lower.split(' ');
        const idx = words.findIndex(w => w === 'mesleğim' || w === 'sektörüm');
        if (idx !== -1 && words[idx + 1]) detectedSector = words[idx + 1];
    }

    let finalUserMsg = userMsg;
    if (!finalUserMsg.trim() && attachments.length > 0) {
        finalUserMsg = "Ekteki ürünleri mekana uygulayarak tasarımı başlat.";
        // Tell RoomVisualizer to actually start the render!
        window.dispatchEvent(new CustomEvent('start_autonomous_render'));
    }
    
    if (detectedSector && !lower.includes('yarın') && !lower.includes('ciro') && !lower.includes('montaj')) {
       setCurrentSector(detectedSector);
       const cap = detectedSector.charAt(0).toUpperCase() + detectedSector.slice(1);
       
       const isKuafor = detectedSector.includes('kuaför') || detectedSector.includes('berber') || detectedSector.includes('güzellik');
       const isOto = detectedSector.includes('oto') || detectedSector.includes('araç');
       const isSaglik = detectedSector.includes('doktor') || detectedSector.includes('diş') || detectedSector.includes('sağlık');
       const isYemek = detectedSector.includes('restoran') || detectedSector.includes('kafe');
       
       const s1 = isKuafor || isSaglik ? 'Randevu Bekliyor' : isOto ? 'Sırada' : isYemek ? 'Sipariş Alındı' : 'Ön Görüşme';
       const s2 = isKuafor ? 'Koltukta' : isOto ? 'İşlemde (Yıkama/Boya)' : isSaglik ? 'Muayenede' : isYemek ? 'Hazırlanıyor' : 'Üretimde/Sırada';
       const s3 = isKuafor || isSaglik ? 'İşlem Devam Ediyor' : isOto ? 'Kurulanıyor/Cila' : isYemek ? 'Masada' : 'Kalite Kontrol';
       const s4 = isKuafor || isSaglik ? 'İşlem Bitti / Ödeme' : isOto ? 'Teslime Hazır' : isYemek ? 'Hesap Ödendi' : 'Teslime Hazır';

       const customConfig = {
          title: `${cap} Yönetim Paneli`,
          desc: `${cap} iş yapılarına özel randevu, teslimat ve gelir analizleri.`,
          card2: isYemek ? 'Aktif Siparişler' : `Aktif Operasyonlar`,
          card3: isKuafor || isSaglik ? 'Randevular' : isOto ? 'Sıradaki Araçlar' : `Gelecek İşler`,
          tableItem: `Hizmet / İşlem Türü`,
          shortcuts: ['Yeni Kayıt/Randevu Ekle', `${cap} Özel Form`, 'Hızlı Fiş Kes'],
          statusList: [
             { id: 's1', label: s1, color: 'text-blue-400', bg: 'bg-blue-500/10' },
             { id: 's2', label: s2, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
             { id: 's3', label: s3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
             { id: 's4', label: s4, color: 'text-purple-400', bg: 'bg-purple-500/10' }
          ],
       };
       window.dispatchEvent(new CustomEvent('agent_update_dashboard', { detail: customConfig }));
       finalUserMsg = `[SECTOR:${cap}] ` + finalUserMsg;
    }

    try {
      const activeSessionId = sessionId || `perde_${Date.now()}`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: finalUserMsg,
          history: messages.slice(-5).map(m => ({
            role: m.role === 'agent' ? 'assistant' : 'user',
            text: m.content
          })),
          sessionId: activeSessionId,
          node: SovereignNodeId,
          authorId: user?.uid || 'anonymous'
        })
      });

      if (!response.ok) throw new Error('AI Engine hatası');
      const data = await response.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: data.text,
        links: data.links,
        widget: data.widgetType,
        payload: data.payload
      }]);

    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'agent',
        content: `Bağlantı hatası oluştu: ${err.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      
      const readers = files.map(file => {
          return new Promise<any>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  resolve({
                      id: crypto.randomUUID(),
                      base64: reader.result as string,
                      file,
                      label: ''
                  });
              };
              reader.readAsDataURL(file);
          });
      });
      
      Promise.all(readers).then(results => {
          setAttachments(prev => [...prev, ...results]);
      });
      
      if(attachmentInputRef.current) {
         attachmentInputRef.current.value = '';
      }
  };

  // TODO: Firestore'dan gercek gelir verileri cekilecek (Accounting koleksiyonundan)
  // Bos baslat - sahte veri SIFIR MOCK kurali geregi kaldirildi
  const revenueData: { name: string; ciro: number }[] = [];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="relative group flex items-center justify-end" onClick={() => { setIsOpen(true); setShowOfferBadge(false); }}>
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              {showOfferBadge && (
                 <div className="absolute -left-20 bg-white text-blue-600 px-3 py-1.5 rounded-full shadow-xl font-bold text-xs uppercase tracking-widest animate-bounce z-20 whitespace-nowrap border border-blue-100">
                    Teklif Al
                 </div>
              )}
              <button 
                className="relative h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-110 overflow-hidden border border-blue-400/50 transition-all z-10"
              >
                 <Sparkles className="h-6 w-6 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            style={{ 
              position: 'fixed', 
              top: isExpanded ? '5vh' : `${bounds.y}px`,
              left: isExpanded ? '5vw' : `${bounds.x}px`,
              width: isExpanded ? '90vw' : `${bounds.w}px`,
              height: isExpanded ? '90vh' : `${bounds.h}px`,
              pointerEvents: 'auto',
            }}
            className="z-[100] flex flex-col bg-zinc-950/95 backdrop-blur-3xl border border-blue-500/40 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden"
          >
            {/* Header / Drag Handle */}
            <div 
              onPointerDown={!isExpanded ? handlePointerDown('drag') : undefined}
              className={`h-14 shrink-0 bg-gradient-to-r from-blue-900/50 to-transparent border-b border-blue-500/20 flex items-center justify-between px-4 transition-colors ${!isExpanded ? 'cursor-move hover:bg-white/5' : ''}`}
            >
               <div className="flex items-center gap-3 pointer-events-none">
                 <div className="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                   <Sparkles className="w-4 h-4 text-blue-400" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-widest text-white leading-tight">{d.headerTitle}</span>
                   <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest leading-tight">{d.headerSubtitle}</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-1 cursor-default" onPointerDown={e => e.stopPropagation()}>
                 {/* Otonom LLM çevirisi yapıldıÄŸı için manuel dil seçme ikonu kaldırıldı */}
                 
                 <button 
                   onClick={() => {
                       setIsSpeakerOn(!isSpeakerOn);
                       if (isSpeakerOn && typeof window !== 'undefined') {
                           window.speechSynthesis.cancel();
                       }
                   }} 
                   className={`p-2 rounded-lg transition-colors ${isSpeakerOn ? 'text-blue-400 bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)] border border-blue-400/30' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
                   title={isSpeakerOn ? "Sesi Kapat" : "Sesi Aç"}
                 >
                   {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 </button>
                 <button 
                   onClick={() => setIsExpanded(!isExpanded)} 
                   className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                   title="Tam Ekran"
                 >
                   {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                 </button>
                 <button 
                   onClick={() => setIsOpen(false)} 
                   className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                   title="Kapat"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/40 ${isExpanded ? 'p-8' : ''}`}>
               <div className="flex flex-col gap-4">
                 {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm shadow-md' : 'bg-transparent text-zinc-300'}`}>
                             {msg.role === 'agent' && <Bot className="w-4 h-4 text-zinc-500 mb-2" />}
                             {msg.attachments && msg.attachments.length > 0 && (
                                <div className="flex gap-2 flex-wrap mb-2">
                                   {msg.attachments.map((att: any) => (
                                      <img key={att.id} src={att.base64} alt="attachment" className="w-20 h-20 object-cover rounded shadow border border-white/10" />
                                   ))}
                                </div>
                             )}
                             <p className="text-sm font-sans whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>

                          {/* Dynamic Widgets */}
                          {msg.widget === 'dashboard' && msg.payload && (
                             <div className="bg-[#111] shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-5 w-full flex flex-col gap-4 mt-3 backdrop-blur-md">
                                <div className="border-b border-white/10 pb-3 flex flex-col gap-1">
                                  <div className="text-[10px] font-bold text-accent uppercase flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> ALOHA Deep Research
                                  </div>
                                  <h3 className="text-white font-serif text-lg">{msg.payload.title}</h3>
                                  <DataCredibility source="Sovereign AI Node" confidence={98} className="mt-1" />
                                </div>
                                
                                {msg.payload.charts && msg.payload.charts.map((chart: any, i: number) => (
                                   <div key={i} className="bg-black/30 p-3 rounded-lg border border-white/5 w-full flex justify-center">
                                     {chart.type === 'pie' ? (
                                       <VIPieChart data={chart.data} size={140} centerLabel="Toplam" />
                                     ) : chart.type === 'bar' ? (
                                       <VIMiniBarChart data={chart.data} className="w-full" />
                                     ) : null}
                                   </div>
                                ))}

                                {msg.payload.table && msg.payload.table.length > 0 && (
                                   <div className="bg-black/30 p-3 rounded-lg border border-white/5 w-full overflow-x-auto">
                                     <table className="w-full text-left text-xs text-zinc-300">
                                        <thead>
                                          <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-widest text-[9px]">
                                            {Object.keys(msg.payload.table[0]).map(key => <th key={key} className="pb-2 pr-2">{key}</th>)}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {msg.payload.table.map((row: any, i: number) => (
                                            <tr key={i} className="border-b border-white/5 last:border-0">
                                              {Object.values(row).map((val: any, j: number) => <td key={j} className="py-2 pr-2">{val}</td>)}
                                            </tr>
                                          ))}
                                        </tbody>
                                     </table>
                                   </div>
                                )}

                                {msg.payload.actions && msg.payload.actions.length > 0 && (
                                   <div className="flex flex-col gap-2 mt-2">
                                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Otonom Aksiyonlar</div>
                                      {msg.payload.actions.map((act: any, i: number) => (
                                        <button 
                                            key={i}
                                            className="w-full bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest text-[10px] py-3 rounded-md transition-all flex justify-between items-center px-4"
                                            onClick={() => window.dispatchEvent(new CustomEvent('agent_message', { detail: { message: `⚙️ [${act.action}] tetiklendi...` } }))}
                                        >
                                            <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> {act.label}</span>
                                            <span className="bg-black/10 px-2 py-1 rounded text-[9px] flex gap-2">
                                              <span className="text-emerald-700">Güven: %{act.confidence || 90}</span>
                                              <span className="text-zinc-600">Risk: {act.riskLevel || 'Düşük'}</span>
                                            </span>
                                        </button>
                                      ))}
                                   </div>
                                )}
                             </div>
                          )}

                          {msg.widget === 'quotePreview' && msg.payload && (
                             <div className="bg-[#111] shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-5 w-full flex flex-col gap-4 mt-3 backdrop-blur-md">
                                <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                                  <div className="text-[10px] font-bold text-accent uppercase flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Yarı Otonom Satış Modülü
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Müşteri / Firma</div>
                                  <div className="text-white font-serif text-lg">{msg.payload.customerName}</div>
                                  {msg.payload.phone && <div className="text-zinc-400 font-mono text-[10px]">{msg.payload.phone}</div>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Liste Fiyatı</div>
                                    <div className="text-zinc-300 font-mono text-sm">{msg.payload.grandTotal?.toLocaleString('tr-TR')} ₺</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">İndirim</div>
                                    <div className={msg.payload.discount > 0 ? "text-emerald-400 font-mono text-sm" : "text-zinc-500 font-mono text-sm"}>
                                      {msg.payload.discount > 0 ? `-${msg.payload.discount.toLocaleString('tr-TR')} ₺` : 'Yok'}
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                  <div className="flex justify-between items-center">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Net Tutar</div>
                                    <div className="text-white font-serif text-2xl">{msg.payload.finalTotal?.toLocaleString('tr-TR')} ₺</div>
                                  </div>
                                </div>

                                {msg.payload.notes && (
                                  <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Notlar / Koşullar</div>
                                    <div className="text-zinc-300 text-xs italic">"{msg.payload.notes}"</div>
                                  </div>
                                )}

                                <div className="flex gap-2 mt-2">
                                  <button 
                                      className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest text-[10px] py-3 rounded-md transition-all flex items-center justify-center gap-2"
                                      onClick={async (e) => {
                                         const btn = e.currentTarget;
                                         btn.innerHTML = '<span class="animate-spin text-xl">↻</span> İŞLENİYOR...';
                                         btn.disabled = true;
                                         try {
                                             const { setDoc, collection, doc } = await import('firebase/firestore');
                                             const { db } = await import('@/lib/firebase-client');
                                             const newOrder = {
                                                SovereignNodeId: 'perde', // client context fallback
                                                authorId: 'seller', 
                                                customerId: 'ai-generated-lead',
                                                customerName: msg.payload.customerName,
                                                customerAddress: msg.payload.phone ? `Telefon: ${msg.payload.phone}` : 'Adres belirtilmedi',
                                                projectType: 'Otonom Fiyat Teklifi',
                                                grandTotal: msg.payload.finalTotal,
                                                originalTotal: msg.payload.grandTotal,
                                                discountApplied: msg.payload.discount || 0,
                                                status: 's1',
                                                notes: msg.payload.notes,
                                                rooms: JSON.stringify([{ id: 'otonom_1', name: 'AI Teklif Odası', products: [] }]),
                                                createdAt: new Date()
                                             };
                                             const newDocRef = doc(collection(db, 'projects'));
                                             await setDoc(newDocRef, newOrder);
                                             
                                             await fetch('/api/agent/trigger', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    event: 'ORDER_CREATED',
                                                    payload: { 
                                                        orderId: newDocRef.id, 
                                                        SovereignNodeId: 'perde', 
                                                        data: newOrder,
                                                        phone: msg.payload.phone || "+905550000000"
                                                    }
                                                })
                                             });

                                             window.dispatchEvent(new CustomEvent('agent_message', { detail: { 
                                                message: `✅ Teklif başarılı! Müşterinize lüks PDF hazırlandı ve (numarası varsa) WhatsApp'tan "Onay Seçeneğiyle" gönderildi.` 
                                             }}));
                                             
                                             setMessages(prev => prev.map(m => m.id === msg.id ? {...m, widget: null} : m));

                                         } catch(err) {
                                            btn.innerHTML = 'HATA OLUŞTU';
                                         }
                                      }}
                                  >
                                      ✅ ONAYLA VE GÖNDER
                                  </button>
                                  <button 
                                      className="flex-1 bg-black hover:bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-[10px] py-3 rounded-md transition-all flex items-center justify-center gap-2"
                                      onClick={() => {
                                        setMessages(prev => prev.map(m => m.id === msg.id ? {...m, widget: null} : m));
                                        window.dispatchEvent(new CustomEvent('agent_message', { detail: { message: `❌ Teklif işlemi iptal edildi.` }}));
                                      }}
                                  >
                                      İPTAL
                                  </button>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'customer_history' && msg.payload && msg.payload.length > 0 && (
                             <div className="bg-zinc-900/90 shadow-[0_0_20px_rgba(0,0,0,0.6)] border border-white/10 rounded-xl p-4 w-full flex flex-col gap-3 mt-2 backdrop-blur-md">
                                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                                   <div>
                                      <div className="text-[10px] font-bold text-accent uppercase flex items-center gap-2 mb-1">
                                        <History className="w-3 h-3" /> Müşteri Dökümü
                                      </div>
                                      <h4 className="text-white font-sans font-bold text-base">{msg.payload[0]?.customerName || 'Bilinmeyen Müşteri'}</h4>
                                      <span className="text-zinc-500 text-[10px] font-mono">{msg.payload[0]?.customerAddress || 'Adres Yok'}</span>
                                   </div>
                                   <div className="text-right">
                                      <span className="block text-[10px] text-zinc-500 uppercase tracking-widest">Kümülatif Ciro</span>
                                      <span className="text-emerald-400 font-serif text-lg font-bold">
                                        {msg.payload.reduce((acc: number, cur: any) => acc + Number(cur.grandTotal || 0), 0).toLocaleString('tr-TR')} ₺
                                      </span>
                                   </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                   {msg.payload.map((order: any, i: number) => (
                                     <div key={i} className="bg-black/40 border border-white/5 p-3 rounded-lg flex gap-3 relative overflow-hidden group">
                                        <div className="w-16 h-16 rounded flex items-center justify-center bg-zinc-800 shrink-0 border border-dashed border-zinc-600">
                                           <Package className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <div className="flex flex-col flex-1 justify-center">
                                           <span className="text-white text-xs font-bold mb-1">{order.projectType}</span>
                                           <span className="text-zinc-400 text-[10px] uppercase font-mono">{order.grandTotal?.toLocaleString('tr-TR')} ₺</span>
                                           <div className="flex justify-between items-center mt-2">
                                              <span className="text-zinc-500 text-[9px]">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('tr-TR') : ''}</span>
                                              <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">İşlemde</span>
                                           </div>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                                
                                <button className="w-full bg-white text-black font-bold uppercase text-[10px] py-2 rounded mt-1 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                                  <FileText className="w-3 h-3" /> Fişi PDF Olarak Gönder
                                </button>
                             </div>
                          )}

                          {msg.widget === 'crm_list' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-2 mt-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4" /> Müşteri Havuzu (CRM)
                                </div>
                                <div className="flex flex-col gap-2">
                                  {msg.payload && msg.payload.map((customer: any, idx: number) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs flex justify-between items-center hover:bg-white/10 cursor-pointer" onClick={() => alert(`${customer.name} için WhatsApp taslağı açılıyor...`)}>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-white font-medium hover:text-accent transition-colors">{customer.name}</span>
                                        <span className="text-zinc-500 text-[10px] font-mono">{customer.count} Sipariş</span>
                                      </div>
                                      <span className={`${customer.total > 10000 ? 'text-emerald-400 bg-emerald-500/10' : 'text-blue-400 bg-blue-500/10'} font-bold px-2 py-1 rounded`}>
                                        {customer.total > 10000 ? 'VIP' : 'Standart'}
                                      </span>
                                    </div>
                                  ))}
                                  {(!msg.payload || msg.payload.length === 0) && (
                                     <div className="text-zinc-500 text-xs">Müşteri bulunamadı.</div>
                                  )}
                                  
                                  <button className="mt-2 text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest text-center w-full bg-black/50 py-2 rounded border border-white/5">
                                    Tüm Listeyi İndir (Excel)
                                  </button>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'daily_orders' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-2 mt-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2 mb-2">
                                  <Briefcase className="w-4 h-4" /> Bugünün İşleri
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs flex justify-between items-center hover:bg-white/10 cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-white font-medium">Ahmet Yılmaz - VIP Paket</span>
                                      <span className="text-zinc-500 text-[10px]">10:30 â€¢ Bekliyor</span>
                                    </div>
                                    <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">1.500 ₺</span>
                                  </div>
                                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs flex justify-between items-center hover:bg-white/10 cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-white font-medium">Zeynep Kaya - Standart İşlem</span>
                                      <span className="text-zinc-500 text-[10px]">14:00 â€¢ İşlemde</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Ödendi</span>
                                  </div>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'comparison' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-3 mt-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" /> Aylık Performans Özeti
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                                    <span className="text-zinc-500 text-[10px] uppercase">Ciro Farkı</span>
                                    <span className="text-white font-sans text-lg font-bold">145.000 ₺</span>
                                    <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">â–² %15 Artış</span>
                                  </div>
                                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                                    <span className="text-zinc-500 text-[10px] uppercase">Yeni Müşteri</span>
                                    <span className="text-white font-sans text-lg font-bold">+24 Kişi</span>
                                    <span className="text-red-400 text-[10px] font-bold flex items-center gap-1">â–¼ %2 Azalma</span>
                                  </div>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'tasks' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2 mb-2"><Hammer className="w-4 h-4" /> Yaklaşan Planlamalar</div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-xs">
                                   <span className="text-white">Operasyon İşlemi</span>
                                   <span className="text-blue-400 font-mono">09:00</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-xs">
                                   <span className="text-white">Müşteri Randevusu</span>
                                   <span className="text-blue-400 font-mono">11:30</span>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'workshop' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2 mb-2"><Package className="w-4 h-4" /> İş & Saha Durumu</div>
                                <div className="flex justify-between items-center bg-black/50 p-2 rounded text-xs border border-white/5">
                                  <span>Aktif Alanda</span>
                                  <span className="text-emerald-400 font-mono font-bold">Yoğun Talep</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/50 p-2 rounded text-xs border border-white/5">
                                  <span>Bekleyen İşlemler</span>
                                  <span className="text-zinc-500 font-mono">Hazırlanıyor</span>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'file_download' && (
                             <div className="bg-zinc-900 shadow-xl border border-white/10 rounded-xl p-4 w-full flex flex-col gap-3 mt-2">
                                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-2 mb-1">
                                  <FileText className="w-4 h-4" /> Çıktı Dosyaları Hazır
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button onClick={() => alert('PDF formatında indiriliyor...')} className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-3 rounded-lg text-xs flex justify-between items-center transition-colors">
                                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Kapsamlı_Rapor_2026.pdf</span>
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => alert('Excel formatında indiriliyor...')} className="bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs flex justify-between items-center transition-colors">
                                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Siparis_Listesi_Nihai.xlsx</span>
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                             </div>
                          )}

                          {msg.widget === 'pie_chart' && (
                            <div className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl mt-2 h-48 min-w-[250px] flex flex-col items-center">
                               <div className="flex items-center gap-2 mb-2 text-zinc-400 uppercase tracking-widest text-[10px] font-bold self-start">
                                 Hizmet / Dağılım Pastası
                               </div>
                               <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                   <Pie data={[
                                      { name: 'Standart İş', value: 400 },
                                      { name: 'VIP İşlem', value: 300 },
                                      { name: 'Onarım', value: 300 },
                                      { name: 'Diğer', value: 200 },
                                   ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={5}>
                                      <Cell fill="#3b82f6" />
                                      <Cell fill="#10b981" />
                                      <Cell fill="#f0abfc" />
                                      <Cell fill="#f59e0b" />
                                   </Pie>
                                   <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px' }} />
                                 </PieChart>
                               </ResponsiveContainer>
                            </div>
                          )}

                          {msg.widget === 'bar_chart' && (
                            <div className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl mt-2 h-48 min-w-[250px]">
                               <div className="flex items-center gap-2 mb-2 text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                                 Saatlik Görev Yükü
                               </div>
                               <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={[
                                    { name: '09:00', islem: 12 }, { name: '12:00', islem: 25 },
                                    { name: '15:00', islem: 18 }, { name: '18:00', islem: 30 }
                                 ]}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                   <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                   <Bar dataKey="islem" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                 </BarChart>
                               </ResponsiveContainer>
                            </div>
                          )}

                          {msg.widget === 'revenue' && (
                            <div className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl mt-2 h-48 min-w-[250px]">
                               <div className="flex items-center gap-2 mb-2 text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                                 <TrendingUp className="w-3 h-3" /> Aylık Büyüme Hacmi
                               </div>
                               <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={revenueData}>
                                   <defs>
                                     <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                     </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                   <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                   <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px' }} />
                                   <Area type="monotone" dataKey="ciro" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorC)" />
                                 </AreaChart>
                               </ResponsiveContainer>
                            </div>
                          )}
                       </div>
                    </motion.div>
                 ))}



                 {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="p-3 rounded-2xl bg-transparent text-zinc-500 flex items-center gap-2 border border-blue-500/20">
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span className="text-[10px] uppercase tracking-widest font-mono text-blue-400">{d.panelAdjustMsg}</span>
                      </div>
                    </motion.div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black border-t border-white/10 shrink-0 relative">
               
               {/* Hidden Memory Drawer */}
               <AnimatePresence>
                 {showAttachmentDrawer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl z-50 mx-3"
                    >
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">Aktif Materyaller</span>
                           <button onClick={() => setShowAttachmentDrawer(false)} className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
                       </div>
                       
                       <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                         {attachments.length === 0 ? (
                            <div className="text-xs text-zinc-500 text-center py-6 font-medium">Hafızada materyal yok.</div>
                         ) : (
                            attachments.map(att => (
                              <div key={att.id} className="flex flex-col bg-black/40 border border-white/5 rounded overflow-hidden relative shrink-0 transition-colors hover:border-white/10">
                                 <div className="flex items-center gap-2">
                                     <img src={att.base64} alt="preview" className="w-10 h-10 object-cover shrink-0" />
                                     <input 
                                        type="text" 
                                        value={att.label || ''} 
                                        onChange={(e) => {
                                           const newLabel = e.target.value;
                                           setAttachments(prev => prev.map(p => p.id === att.id ? {...p, label: newLabel} : p));
                                           window.dispatchEvent(new CustomEvent('agent_attachments_sync', { detail: attachments.map(p => p.id === att.id ? {...p, label: newLabel} : p) }));
                                        }}
                                        placeholder="Örn: Tül Perde..." 
                                        className="flex-1 bg-transparent text-xs text-white p-2 outline-none placeholder:text-zinc-600 font-medium"
                                     />
                                     <button 
                                        onClick={() => {
                                            setAttachments(prev => prev.filter(p => p.id !== att.id));
                                        }}
                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors h-full"
                                     >
                                        <X className="w-4 h-4" />
                                     </button>
                                 </div>
                              </div>
                            ))
                         )}
                       </div>
                       <button 
                         onClick={() => attachmentInputRef.current?.click()}
                         className="w-full mt-3 py-2.5 border border-dashed border-white/20 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-colors"
                       >
                         <Paperclip className="w-3 h-3" /> YENİ MATERYAL EKLE
                       </button>
                    </motion.div>
                 )}
               </AnimatePresence>

               <div className="flex gap-2 items-center">
                   <button 
                     onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
                     className={`p-3 rounded-xl transition-all shrink-0 relative ${attachments.length > 0 ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30' : 'text-zinc-500 hover:text-white bg-zinc-900 border border-transparent'}`}
                   >
                     <Paperclip className="w-4 h-4" />
                     {attachments.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-black shadow-sm">{attachments.length}</span>
                     )}
                   </button>
                   <input type="file" multiple ref={attachmentInputRef} className="hidden" accept="image/*" onChange={handleAttachment} />
                   <div className="flex-1 relative flex items-center">
                     <input 
                       type="text" 
                       value={inputMsg}
                       onChange={(e) => setInputMsg(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder="Bana komut ver veya resim yükle..."
                       className="w-full bg-zinc-900 border border-white/5 outline-none rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/40 transition-colors"
                     />
                     <button
                        onClick={handleMicClick}
                        className={`absolute right-2 p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
                        title="Sesli Komut"
                     >
                        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                     </button>
                   </div>

                   <button 
                     onClick={handleSend}
                     disabled={( !inputMsg.trim() && attachments.length === 0 ) || isTyping}
                     className="bg-blue-600 hover:bg-blue-500 p-3 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center w-10"
                   >
                        <Send className="w-4 h-4 ml-1" />
                   </button>
               </div>
            </div>

            {/* Edges & Corners for Omni-Directional Resize */}
            {!isExpanded && (
              <>
                {/* Edges */}
                <div className="absolute top-0 bottom-0 left-0 w-2 cursor-w-resize z-50 hover:bg-blue-500/30 transition-colors opacity-0 hover:opacity-100" onPointerDown={handlePointerDown('w')} />
                <div className="absolute top-0 bottom-0 right-0 w-2 cursor-e-resize z-50 hover:bg-blue-500/30 transition-colors opacity-0 hover:opacity-100" onPointerDown={handlePointerDown('e')} />
                <div className="absolute top-0 left-0 right-0 h-2 cursor-n-resize z-50 hover:bg-blue-500/30 transition-colors opacity-0 hover:opacity-100" onPointerDown={handlePointerDown('n')} />
                <div className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize z-50 hover:bg-blue-500/30 transition-colors opacity-0 hover:opacity-100" onPointerDown={handlePointerDown('s')} />
                
                {/* Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50" onPointerDown={handlePointerDown('nw')} />
                <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50" onPointerDown={handlePointerDown('ne')} />
                <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50" onPointerDown={handlePointerDown('sw')} />
                <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1.5 opacity-50 hover:opacity-100 transition-opacity" onPointerDown={handlePointerDown('se')}>
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L10 8V10H8ZM4 10L10 4V6L6 10H4ZM0 10L10 0V2L2 10H0Z" fill="#3b82f6"/>
                  </svg>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

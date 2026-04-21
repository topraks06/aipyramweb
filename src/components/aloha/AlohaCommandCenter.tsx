"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Bot, Image as ImageIcon, Plus, X, Volume2, VolumeX, MicOff, Shield, Zap, Terminal, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentTreeWidget } from './widgets/AgentTreeWidget';
import { ArtifactPreviewWidget } from './widgets/ArtifactPreviewWidget';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Message {
  id: string;
  role: 'user' | 'aloha';
  text: string;
  toolEvents?: ToolEvent[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}

interface ToolEvent {
  tool: string;
  status: 'running' | 'done' | 'error';
  result?: string;
  duration?: number;
  iteration?: number;
  message?: string;
}

interface AlohaCommandCenterProps {
  onSwitchToLegacy?: () => void;
}

// ═══════════════════════════════════════════════════
// QUICK COMMANDS 
// ═══════════════════════════════════════════════════

const QUICK_COMMANDS = [
  { label: 'Haber Üret', cmd: 'TRTEX için yeni haber üret', icon: '📰' },
  { label: 'Eksik Görseller', cmd: 'TRTEX haberlerinde eksik görselleri tara (dry run)', icon: '📸' },
  { label: 'Makale Yaz', cmd: 'Türk tekstil sektöründe sürdürülebilirlik trendleri hakkında 3 görsel ile makale oluştur', icon: '✍️' },
  { label: 'TRTEX Analiz', cmd: 'TRTEX projesini analiz et', icon: '🔍' },
  { label: 'Firebase Kontrol', cmd: 'Firestore trtex_news koleksiyonunu sorgula', icon: '🔥' },
  { label: 'Sistem Sağlık', cmd: 'TRTEX proje sağlığını doğrula', icon: '💊' },
  { label: 'Tüm Projeleri Tara', cmd: 'Tüm projeleri analiz et', icon: '🌐' },
];

// ═══════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════

export default function AlohaCommandCenter({ onSwitchToLegacy }: AlohaCommandCenterProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTools, setActiveTools] = useState<ToolEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{name: string, type: string, base64: string}[]>([]);
  const [previewState, setPreviewState] = useState<{type: 'diff' | 'json' | 'web', title: string, content: string | null}>({
    type: 'json', title: 'Bağlantı Aktif', content: '{\n  "status": "connected",\n  "node": "master",\n  "uptime": "99.9%"\n}'
  });
  const [systemUptime, setSystemUptime] = useState('00:00:00');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const uptimeStart = useRef(Date.now());

  // ═══════════════════════════════════════════════════
  // UPTIME TIMER
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - uptimeStart.current;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setSystemUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ═══════════════════════════════════════════════════
  // SPEECH-TO-TEXT
  // ═══════════════════════════════════════════════════
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Chrome gerekli.'); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInputValue(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setTimeout(() => { setIsRecording(false); if (transcript.trim()) handleSendMessage(transcript.trim()); }, 500);
      }
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsRecording(false); }, []);
  const toggleRecording = useCallback(() => { isRecording ? stopListening() : startListening(); }, [isRecording, startListening, stopListening]);

  // ═══════════════════════════════════════════════════
  // TEXT-TO-SPEECH
  // ═══════════════════════════════════════════════════
  const speakText = useCallback((text: string) => {
    if (!isTTSEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.substring(0, 500));
    utterance.lang = 'tr-TR';
    utterance.rate = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    if (trVoice) utterance.voice = trVoice;
    window.speechSynthesis.speak(utterance);
  }, [isTTSEnabled]);

  useEffect(() => { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.getVoices(); }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, activeTools]);

  // AUTH CHECK
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hasCookie = document.cookie.includes("aipyram_auth=sovereign_pass");
      setIsAuthorized(isLocal || hasCookie);
    }
  }, []);

  // ═══════════════════════════════════════════════════
  // SSE STREAM CONSUMER — The real deal
  // ═══════════════════════════════════════════════════
  const processAlohaStream = async (userText: string) => {
    setIsProcessing(true);
    setActiveTools([]);

    // Placeholder aloha message
    const alohaId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: alohaId, role: 'aloha', text: '', toolEvents: [] }]);

    try {
      // Build history from last 10 messages
      const historyForBackend = messages.slice(-10).map(m => ({
        role: m.role,
        text: m.text.substring(0, 2000),
      }));

      const res = await fetch('/api/aloha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'founder',
          message: userText,
          systemContext: { activeDomain: 'aipyram.com', userRole: 'Founder' },
          inlineData: selectedFiles.length > 0 ? selectedFiles : undefined,
          stream: true,
          history: historyForBackend,
        }),
      });

      setSelectedFiles([]);

      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({ error: 'Bağlantı hatası' }));
        setMessages(prev => prev.map(msg => msg.id === alohaId ? { ...msg, text: `❌ Hata: ${errJson.error || res.statusText}` } : msg));
        setIsProcessing(false);
        return;
      }

      // READ SSE STREAM
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const collectedTools: ToolEvent[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.replace('data: ', ''));

            switch (json.type) {
              case 'status':
                // Update status in message
                setMessages(prev => prev.map(msg => 
                  msg.id === alohaId ? { ...msg, text: `⏳ ${json.message}` } : msg
                ));
                break;

              case 'tool_start':
                const startEvent: ToolEvent = { 
                  tool: json.tool, status: 'running', 
                  iteration: json.iteration, message: json.message 
                };
                collectedTools.push(startEvent);
                setActiveTools([...collectedTools]);
                setMessages(prev => prev.map(msg => 
                  msg.id === alohaId ? { ...msg, toolEvents: [...collectedTools] } : msg
                ));
                break;

              case 'tool_result':
                // Update the last tool with this name to 'done'
                const toolIdx = collectedTools.findLastIndex(t => t.tool === json.tool && t.status === 'running');
                if (toolIdx >= 0) {
                  collectedTools[toolIdx] = {
                    ...collectedTools[toolIdx],
                    status: 'done',
                    result: json.result,
                    duration: json.duration,
                    message: json.message,
                  };
                }
                setActiveTools([...collectedTools]);
                setMessages(prev => prev.map(msg =>
                  msg.id === alohaId ? { ...msg, toolEvents: [...collectedTools] } : msg
                ));
                // Update preview with latest tool result
                if (json.result) {
                  setPreviewState({
                    type: 'json',
                    title: `${json.tool} Sonucu`,
                    content: json.result.substring(0, 5000),
                  });
                }
                break;

              case 'final':
                setMessages(prev => prev.map(msg =>
                  msg.id === alohaId ? { ...msg, text: json.text || 'Tamamlandı.', toolEvents: [...collectedTools] } : msg
                ));
                if (json.text) speakText(json.text);
                // Extract code for preview
                if (json.text?.includes('```')) {
                  const codeMatch = json.text.match(/```(\w*)\n([\s\S]*?)```/);
                  if (codeMatch) {
                    setPreviewState({
                      type: codeMatch[1] === 'diff' ? 'diff' : 'json',
                      title: 'Üretilen Artefakt',
                      content: codeMatch[2],
                    });
                  }
                }
                break;

              case 'error':
                setMessages(prev => prev.map(msg =>
                  msg.id === alohaId ? { ...msg, text: `❌ Hata: ${json.message}` } : msg
                ));
                break;
            }
          } catch { /* malformed SSE chunk, skip */ }
        }
      }
    } catch (error: any) {
      console.error("Aloha Stream Hatası:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === alohaId ? { ...msg, text: `❌ Bağlantı kesildi: ${error.message}` } : msg
      ));
    } finally {
      setIsProcessing(false);
      setActiveTools([]);
    }
  };

  // ═══════════════════════════════════════════════════
  // MESSAGE HANDLERS
  // ═══════════════════════════════════════════════════
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    processAlohaStream(text.trim());
  };

  const handleSend = () => handleSendMessage(inputValue);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArr = Array.from(e.target.files);
    const newFiles: {name: string, type: string, base64: string}[] = [];
    for (const file of filesArr) {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} 5MB limitini aşıyor.`); continue; }
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => { const r = reader.result as string; resolve(r.split(',')[1] || r); };
        reader.readAsDataURL(file);
      });
      newFiles.push({ name: file.name, type: file.type, base64 });
    }
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // ═══════════════════════════════════════════════════
  // AUTH SCREENS
  // ═══════════════════════════════════════════════════
  if (isAuthorized === false) {
    return (
      <div className="h-[100dvh] bg-black text-red-500 font-mono flex flex-col items-center justify-center p-6 text-center">
        <Shield size={64} className="mb-6 animate-pulse text-red-600" />
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4">ACCESS DENIED</h1>
        <p className="text-lg text-red-400/80 mb-8 max-w-lg uppercase">
          ALOHA is restricted to the Sovereign Node (Hakan Toprak).
        </p>
        <button onClick={() => window.location.href = '/admin/login'} className="px-8 py-3 bg-red-950 border border-red-900 hover:bg-red-900 transition-colors rounded-sm uppercase tracking-widest text-sm font-bold">
          Authenticate
        </button>
      </div>
    );
  }
  if (isAuthorized === null) return <div className="h-[100dvh] bg-black" />;

  // ═══════════════════════════════════════════════════
  // TOOL EVENT RENDERER (inline chat bubbles)
  // ═══════════════════════════════════════════════════
  const ToolEventBadge = ({ ev }: { ev: ToolEvent }) => (
    <div className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono border ${
      ev.status === 'running' 
        ? 'border-amber-800/50 bg-amber-950/30 text-amber-400' 
        : ev.status === 'done'
        ? 'border-emerald-800/50 bg-emerald-950/20 text-emerald-400'
        : 'border-red-800/50 bg-red-950/20 text-red-400'
    }`}>
      {ev.status === 'running' ? <Loader2 size={12} className="animate-spin" /> 
       : ev.status === 'done' ? <CheckCircle2 size={12} /> 
       : <AlertCircle size={12} />}
      <span className="font-bold">{ev.tool}</span>
      {ev.duration && <span className="text-zinc-500">{ev.duration}ms</span>}
    </div>
  );

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="h-[100dvh] bg-black text-gray-100 flex flex-col font-sans overflow-hidden">

      {/* ─── IDE HEADER BAR ─── */}
      <header className="h-9 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">ALOHA v3.0</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">|</span>
          <span className="text-[10px] text-zinc-500 font-mono">SOVEREIGN IDE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
            <Clock size={10} />
            <span>{systemUptime}</span>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
              <Loader2 size={10} className="animate-spin" />
              <span>İŞLEM</span>
            </div>
          )}
          {onSwitchToLegacy && (
            <button onClick={onSwitchToLegacy} className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-wider">
              Legacy
            </button>
          )}
        </div>
      </header>

      {/* ─── 3-COLUMN TRIAD ─── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Agent Tree */}
        <aside className="w-[20%] min-w-[220px] hidden lg:block border-r border-zinc-900 bg-zinc-950">
          <AgentTreeWidget logs={messages as any[]} />
        </aside>

        {/* CENTER: Command Core */}
        <section className="flex-1 flex flex-col relative bg-[#050505] overflow-hidden">
          
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-[14px] space-y-5 custom-scrollbar">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <Terminal size={48} className="mb-4 text-zinc-600" />
                <p className="text-zinc-500 text-sm mb-6 max-w-md">Aloha Otonom IDE hazır. Komut verin veya aşağıdaki kısayolları kullanın.</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-full"
                >
                  <div className="shrink-0 pt-0.5">
                    {msg.role === 'user' ? (
                      <span className="text-blue-500 font-bold uppercase text-[11px]">[FOUNDER]</span>
                    ) : (
                      <span className="text-emerald-500 font-bold uppercase flex items-center gap-1 text-[11px]">
                        <Zap size={12}/> [ALOHA]
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 relative group">
                    {/* Tool Events (live badges) */}
                    {msg.toolEvents && msg.toolEvents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {msg.toolEvents.map((ev, i) => (
                          <ToolEventBadge key={`${ev.tool}-${i}`} ev={ev} />
                        ))}
                      </div>
                    )}
                    
                    {/* Message Text (Markdown) */}
                    {msg.text && !msg.text.startsWith('⏳') ? (
                      msg.role === 'aloha' ? (
                        <div className="text-zinc-300 leading-relaxed prose prose-invert prose-sm max-w-none 
                          prose-headings:text-zinc-200 prose-headings:font-bold prose-headings:border-b prose-headings:border-zinc-800 prose-headings:pb-1 prose-headings:mb-2
                          prose-code:text-emerald-400 prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
                          prose-table:border-collapse prose-th:border prose-th:border-zinc-700 prose-th:bg-zinc-900 prose-th:px-2 prose-th:py-1
                          prose-td:border prose-td:border-zinc-800 prose-td:px-2 prose-td:py-1
                          prose-strong:text-zinc-100 prose-a:text-blue-400
                          prose-li:text-zinc-300 prose-p:text-zinc-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      )
                    ) : msg.text?.startsWith('⏳') ? (
                      <span className="text-amber-500/80 animate-pulse text-sm">{msg.text}</span>
                    ) : msg.toolEvents && msg.toolEvents.length > 0 ? null : (
                      <span className="text-zinc-600 animate-pulse">Sistem işliyor...</span>
                    )}

                    {/* Copy button */}
                    {msg.text && msg.text.length > 10 && !msg.text.startsWith('⏳') && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                        className="absolute top-0 right-0 p-1.5 bg-zinc-900/80 text-zinc-500 rounded border border-zinc-800 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                        title="Kopyala"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Active tool indicators (global, below messages) */}
            {isProcessing && activeTools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-900">
                {activeTools.filter(t => t.status === 'running').map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/30 border border-amber-800/40 rounded text-[11px] text-amber-400 font-mono animate-pulse">
                    <Loader2 size={10} className="animate-spin" />
                    {t.tool}
                  </div>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* QUICK COMMANDS */}
          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
              {QUICK_COMMANDS.map((qc) => (
                <button
                  key={qc.label}
                  onClick={() => handleSendMessage(qc.cmd)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 hover:border-blue-800 hover:bg-blue-950/20 text-zinc-400 hover:text-blue-300 rounded text-[11px] font-mono transition-all disabled:opacity-30"
                >
                  {qc.icon} {qc.label}
                </button>
              ))}
            </div>
          )}

          {/* COMMAND PALETTE (INPUT) */}
          <div className="p-2 sm:p-3 border-t border-zinc-900 bg-black shrink-0 relative flex flex-col">
            
            {isRecording && (
              <div className="mb-2 px-3 py-1.5 bg-red-950/50 border border-red-900/30 flex items-center justify-center gap-2 text-xs text-red-500 rounded">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                MİKROFON AKTİF
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex gap-2 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-300">
                    <span className="truncate max-w-[100px]">{f.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full bg-zinc-900/50 border border-zinc-800 p-1 md:p-1.5 focus-within:border-blue-500/50 transition-colors rounded">
              
              <button 
                onClick={() => setIsTTSEnabled(p => { if (p && window.speechSynthesis) window.speechSynthesis.cancel(); return !p; })}
                title={isTTSEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                className={`p-1.5 rounded shrink-0 transition-colors ${isTTSEnabled ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 bg-black'}`}
              >
                {isTTSEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-500" />}
              </button>

              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} title="Dosya Ekle" className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded shrink-0">
                <Plus size={16} />
              </button>

              <span className="text-blue-500 font-bold text-xs hidden sm:inline">{'>'}</span>
              
              <textarea
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (inputValue.trim()) handleSend(); } }}
                placeholder={isRecording ? "Dinliyorum..." : isProcessing ? "İşlem sürüyor..." : "Komut Enjekte Et..."}
                disabled={isProcessing}
                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 focus:outline-none text-zinc-300 placeholder-zinc-700 text-sm font-mono py-2 resize-none custom-scrollbar overflow-y-auto max-h-[200px] disabled:opacity-50"
                rows={1}
                autoComplete="off"
                spellCheck="false"
              />
              
              {inputValue.trim() ? (
                <button 
                  onClick={handleSend}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded text-xs font-bold uppercase tracking-widest border border-blue-900/50 transition-colors shrink-0 disabled:opacity-30"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Çalıştır'}
                </button>
              ) : (
                <button 
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  className={`p-1.5 rounded shrink-0 transition-all ${
                    isRecording ? 'bg-red-900/50 text-red-500 border border-red-900 animate-pulse' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  } disabled:opacity-30`}
                  title={isRecording ? 'Durdur' : 'Sesli Komut'}
                >
                  {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>

            {/* INLINE QUICK COMMANDS (after first message) */}
            {messages.length > 0 && !isProcessing && (
              <div className="flex gap-1.5 mt-2 max-w-4xl mx-auto w-full overflow-x-auto custom-scrollbar pb-1">
                {QUICK_COMMANDS.map((qc) => (
                  <button
                    key={qc.label}
                    onClick={() => handleSendMessage(qc.cmd)}
                    className="px-2 py-1 bg-zinc-900/30 border border-zinc-800/50 hover:border-blue-800 text-zinc-500 hover:text-blue-300 rounded text-[10px] font-mono transition-all whitespace-nowrap shrink-0"
                  >
                    {qc.icon} {qc.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Artifact Preview */}
        <aside className="w-[28%] min-w-[320px] hidden xl:block">
          <ArtifactPreviewWidget 
            type={previewState.type}
            title={previewState.title}
            content={previewState.content || undefined}
            logs={messages as any[]}
          />
        </aside>

      </main>
    </div>
  );
}

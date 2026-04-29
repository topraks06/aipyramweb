'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, VolumeX, Volume2, User, Bot, Loader2 } from 'lucide-react';

/**
 * Sovereign Live Concierge (Gemini Multimodal Live API)
 * Q2 2026 Master Vision: Real-time, ultra-low latency voice assistant for B2B portal.
 */
export default function SovereignLiveConcierge() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user'|'model', text: string}[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const connectToLiveAPI = async () => {
    try {
      setIsConnecting(true);
      // Q2 2026 - Endpoint for bidirectional audio streaming (Gemini 2.0/3.1 Live API)
      // Note: In production, this uses a secure intermediary server to protect the API key.
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
      
      // Simulate connection for the UI (Replace with real WS logic when deployed to Firebase App Hosting)
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        setTranscript(prev => [...prev, { role: 'model', text: 'Merhaba! TRTEX İstihbarat Merkezine hoş geldiniz. Size nasıl yardımcı olabilirim?' }]);
      }, 1500);

    } catch (error) {
      console.error("Live API Connection Error:", error);
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setTranscript([]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
      {isConnected && (
        <div className="bg-[#0f1114] border border-[#2a2a2a] rounded-xl shadow-2xl p-4 w-80 max-h-[400px] flex flex-col font-mono animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest text-green-500">LIVE AUDIO_SYS</span>
            </div>
            <button onClick={disconnect} className="text-gray-500 hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex gap-2 text-sm ${msg.role === 'model' ? 'text-gray-300' : 'text-[#f5a623]'}`}>
                <span>{msg.role === 'model' ? <Bot size={14} className="mt-1" /> : <User size={14} className="mt-1" />}</span>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 pt-2 border-t border-[#222]">
            <div className="flex-1 h-8 bg-[#111] rounded-full flex items-center justify-center overflow-hidden relative">
               {/* Simüle edilmiş ses dalgası */}
               <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center gap-1">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-1 bg-green-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s`}}></div>
                 ))}
               </div>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-[#222] text-white hover:bg-[#333]'}`}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button className="p-2 rounded-full bg-[#222] text-white hover:bg-[#333]">
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <button 
          onClick={connectToLiveAPI}
          disabled={isConnecting}
          className="bg-[#111] hover:bg-[#222] border border-[#f5a623] text-[#f5a623] font-mono text-sm tracking-wider px-6 py-4 rounded-full flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(245,166,35,0.15)] group"
        >
          {isConnecting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <div className="relative">
              <Mic size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[#f5a623] blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </div>
          )}
          {isConnecting ? "BAĞLANIYOR..." : "MASTER CONCIERGE (LIVE)"}
        </button>
      )}
    </div>
  );
}

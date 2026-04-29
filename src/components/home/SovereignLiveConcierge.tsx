'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, X, TrendingUp, Globe, Box, Zap, Sparkles } from 'lucide-react';

export default function SovereignLiveConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#020617] hover:bg-[#0F172A] border border-[#334155] text-[#38BDF8] font-mono text-sm tracking-widest px-6 py-4 rounded-full flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(56,189,248,0.2)] group"
      >
        <div className="relative">
          <Sparkles size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-500" />
          <div className="absolute inset-0 bg-[#38BDF8] blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
        </div>
        <span className="font-bold">TRTEX BEYİN</span>
        <div className="flex gap-1 ml-2 opacity-50 font-sans">
          <kbd className="px-2 py-1 bg-[#1E293B] rounded text-xs border border-[#475569]">⌘</kbd>
          <kbd className="px-2 py-1 bg-[#1E293B] rounded text-xs border border-[#475569]">K</kbd>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4">
      {/* Otonom Arka Plan Bulanıklığı */}
      <div 
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl transition-all duration-500"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#334155] rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.5),0_0_50px_rgba(56,189,248,0.1)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Üst Input Alanı */}
        <div className="relative flex items-center px-6 py-4 border-b border-[#1E293B] bg-[#020617]/50">
          <Search size={28} className="text-[#38BDF8] mr-4 opacity-70" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bir konu, ihale veya hammadde arayın... (Örn: Pamuk Fiyatları)"
            className="flex-1 bg-transparent border-none text-2xl text-white placeholder-[#475569] focus:outline-none font-sans font-light tracking-wide"
          />
          <div className="flex gap-2 items-center text-[#475569] text-sm ml-4">
            <span className="font-mono">ESC</span> kapat
          </div>
        </div>

        {/* Sonuç & Dashboard Alanı */}
        <div className="p-6 h-[60vh] max-h-[600px] overflow-y-auto custom-scrollbar">
          {!query ? (
            <div className="space-y-8">
              {/* Boş Durum: Canlı Sinyaller */}
              <div>
                <h3 className="text-xs font-mono text-[#64748B] mb-4 tracking-widest">CANLI İSTİHBARAT SİNYALLERİ</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-2xl flex items-center gap-4 hover:bg-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center border border-[#475569] group-hover:border-[#38BDF8] transition-colors">
                      <TrendingUp size={20} className="text-[#38BDF8]" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Pamuk Endeksi</div>
                      <div className="text-[#10B981] text-sm font-mono">+1.2% Artış</div>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-2xl flex items-center gap-4 hover:bg-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center border border-[#475569] group-hover:border-[#F59E0B] transition-colors">
                      <Globe size={20} className="text-[#F59E0B]" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Avrupa İhaleleri</div>
                      <div className="text-[#64748B] text-sm font-mono">14 Yeni İhale</div>
                    </div>
                  </div>

                  <div className="bg-[#1E293B] border border-[#334155] p-4 rounded-2xl flex items-center gap-4 hover:bg-[#334155] transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-[#0F172A] flex items-center justify-center border border-[#475569] group-hover:border-[#EF4444] transition-colors">
                      <Box size={20} className="text-[#EF4444]" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Navlun (Asya)</div>
                      <div className="text-[#EF4444] text-sm font-mono">Risk Yüksek</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Görsel Haber Önerileri */}
              <div>
                <h3 className="text-xs font-mono text-[#64748B] mb-4 tracking-widest">ÖNERİLEN ANALİZLER</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { img: "https://images.unsplash.com/photo-1580828369019-22204eb32145?q=80&w=800&auto=format&fit=crop", title: "2027 İplik Fiyat Projeksiyonu", label: "ANALİZ" },
                    { img: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=800&auto=format&fit=crop", title: "Ortadoğu Otel Projeleri Raporu", label: "FIRSAT" }
                  ].map((item, i) => (
                    <div key={i} className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer border border-[#334155] hover:border-[#38BDF8] transition-all">
                      <img src={item.img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[0.6rem] font-mono text-[#38BDF8] tracking-widest px-2 py-1 bg-[#020617]/80 rounded border border-[#38BDF8]/30 backdrop-blur-md mb-2 inline-block">{item.label}</span>
                        <div className="text-white font-bold text-lg leading-tight">{item.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Arama Sonuçları Görünümü (Yapay Zeka Yanıtı Simülasyonu) */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-[#1E293B]/50 border border-[#38BDF8]/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8] opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={20} className="text-[#38BDF8]" />
                  <h2 className="text-[#38BDF8] font-mono text-sm tracking-widest font-bold">TRTEX YZ YANITI</h2>
                </div>
                <p className="text-[#E2E8F0] text-lg leading-relaxed font-light">
                  <strong className="text-white font-bold">"{query}"</strong> sorgunuz için küresel B2B veritabanı tarandı. İlgili 4 piyasa sinyali ve 2 ihale eşleşmesi bulundu. Yapay zeka skorlamasına göre bu alanda <span className="text-[#10B981] font-bold">Yüksek Fırsat</span> görülmektedir.
                </p>
                <div className="mt-6 flex gap-3">
                  <button className="bg-[#38BDF8] text-[#020617] px-6 py-2 rounded-full font-bold text-sm hover:bg-[#7DD3FC] transition-colors">Detaylı Rapor Oluştur</button>
                  <button className="bg-[#0F172A] border border-[#334155] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#1E293B] transition-colors">Tedarikçi Eşleştir</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

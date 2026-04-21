'use client';

import React from 'react';
import { Upload, Camera, Sparkles, TrendingUp, Presentation } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';

export default function WowDemoSection() {
    const searchParams = useSearchParams();
    const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
    const T = PERDE_DICT[langKey]?.wow || PERDE_DICT['EN'].wow;

    // Function to trigger the concierge via global event
    const handleTriggerConcierge = (action: string, message?: string) => {
        window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { 
            detail: { action, message } 
        }));
    };

    return (
        <section className="py-24 px-6 md:px-12 bg-zinc-950 text-white relative flex flex-col items-center justify-center overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B7355]/20 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none"></div>
            </div>

            <div className="max-w-4xl w-full z-10 flex flex-col items-center relative">
                
                <div className="mb-6 flex items-center justify-center gap-4">
                    <span className="w-8 h-[1px] bg-zinc-700"></span>
                    <span className="uppercase tracking-[0.2em] text-[10px] text-[#D4C3A3] font-semibold flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        {T.badge}
                    </span>
                    <span className="w-8 h-[1px] bg-zinc-700"></span>
                </div>

                <h2 className="font-serif text-4xl md:text-5xl text-center mb-6 leading-tight" dangerouslySetInnerHTML={{__html: T.title.replace(',', ', <span class="text-[#8B7355] italic">').replace('.', '.</span>')}}>
                </h2>
                <p className="text-zinc-400 text-center max-w-2xl mb-12 font-light">
                    {T.desc}
                </p>

                {/* Upload Area */}
                <div 
                    onClick={() => handleTriggerConcierge('upload')}
                    className="w-full max-w-3xl border-2 border-dashed border-zinc-700 hover:border-[#8B7355] bg-zinc-900/50 hover:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group shadow-2xl shadow-black/50"
                >
                    <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-zinc-700 group-hover:border-[#8B7355]">
                        <Camera className="w-8 h-8 text-[#D4C3A3]" />
                    </div>
                    <h3 className="text-2xl font-serif mb-2">{T.uploadBtn}</h3>
                    <p className="text-zinc-500 text-sm mb-6 text-center">{T.uploadHint}</p>
                    <button className="px-6 py-3 bg-white text-zinc-950 font-semibold text-[11px] uppercase tracking-widest rounded hover:bg-[#D4C3A3] transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {T.browse}
                    </button>
                </div>

                {/* Prompt Buttons */}
                <div className="w-full max-w-3xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={() => handleTriggerConcierge('chat', T.q1_q)}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[#8B7355]/20">
                            <Sparkles className="w-4 h-4 text-[#D4C3A3]" />
                        </div>
                        <span className="text-sm font-light text-zinc-300 group-hover:text-white">&quot;{T.q1_btn}&quot;</span>
                    </button>
                    
                    <button 
                        onClick={() => handleTriggerConcierge('chat', T.q2_q)}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[#8B7355]/20">
                            <Presentation className="w-4 h-4 text-[#D4C3A3]" />
                        </div>
                        <span className="text-sm font-light text-zinc-300 group-hover:text-white">&quot;{T.q2_btn}&quot;</span>
                    </button>

                    <button 
                        onClick={() => handleTriggerConcierge('chat', T.q3_q)}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 flex items-center gap-3 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[#8B7355]/20">
                            <TrendingUp className="w-4 h-4 text-[#D4C3A3]" />
                        </div>
                        <span className="text-sm font-light text-zinc-300 group-hover:text-white">&quot;{T.q3_btn}&quot;</span>
                    </button>
                </div>
                
            </div>
        </section>
    );
}

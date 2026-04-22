'use client';

import React, { Suspense, useState } from 'react';
import { Sparkles, TrendingUp, Presentation, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';
import dynamic from 'next/dynamic';

// Lazy-load RoomVisualizer only when user clicks "Try Demo"
const RoomVisualizer = dynamic(() => import('./RoomVisualizer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white animate-spin rounded-full" />
    </div>
  ),
});

export default function WowDemoSection() {
    const searchParams = useSearchParams();
    const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
    const T = PERDE_DICT[langKey]?.wow || PERDE_DICT['EN'].wow;
    const [showDemo, setShowDemo] = useState(false);

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

            <div className="max-w-6xl w-full z-10 flex flex-col items-center relative">
                
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

                {/* Demo Visualizer OR CTA */}
                {showDemo ? (
                    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
                        <Suspense fallback={
                            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-zinc-700 border-t-white animate-spin rounded-full" />
                            </div>
                        }>
                            <RoomVisualizer isDemoMode={true} />
                        </Suspense>
                    </div>
                ) : (
                    <>
                        {/* Big CTA Button to launch demo */}
                        <motion.button 
                            onClick={() => setShowDemo(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full max-w-3xl bg-gradient-to-r from-[#8B7355] to-[#725e45] text-white py-8 rounded-2xl text-lg font-bold uppercase tracking-[0.15em] hover:shadow-[0_0_60px_rgba(139,115,85,0.3)] transition-all flex items-center justify-center gap-4 mb-12 border border-[#8B7355]/50"
                        >
                            <Sparkles className="w-6 h-6" />
                            {T.uploadBtn || 'HEMEN ÜCRETSİZ DENEYİN'}
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>

                        {/* Prompt Buttons */}
                        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </>
                )}
                
            </div>
        </section>
    );
}

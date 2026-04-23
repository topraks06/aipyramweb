'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { PERDE_DICT } from './perde-dictionary';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
  const T = PERDE_DICT[langKey]?.pricing || PERDE_DICT['EN'].pricing;
  const { SovereignNodeId, user } = usePerdeAuth();

  const handleCheckout = async (planId: string) => {
      if (!user) {
          alert('Devam etmek için giriş yapmanız gerekmektedir.');
          return;
      }
      setLoadingPlan(planId);
      try {
          const res = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                type: 'plan', 
                payload: { planId, SovereignNodeId, isYearly, uid: user.uid } 
              })
          });
          const data = await res.json();
          if (data.url) {
              window.location.href = data.url;
          } else {
              alert(data.error || 'Ödeme sistemi başlatılamadı.');
          }
      } catch (err) {
          alert('Beklenmeyen bir hata oluştu.');
      } finally {
          setLoadingPlan(null);
      }
  };

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-zinc-900 font-sans pt-24 min-h-[calc(100vh-100px)]">
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-zinc-900 mb-6 tracking-tight">{T.title}</h1>
          <p className="text-zinc-500 font-light text-lg max-w-2xl mx-auto mb-12">
             {T.desc}
          </p>

          {/* Toggle Switch */}
          <div className="flex justify-center items-center gap-4">
            <span className={`text-sm transition-colors ${!isYearly ? 'text-zinc-900 font-medium tracking-wide' : 'text-zinc-500 font-light'}`}>{T.monthly}</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-14 h-7 rounded-full p-1 relative transition-colors duration-500 focus:outline-none ${isYearly ? 'bg-[#8B7355]' : 'bg-zinc-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-500 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm transition-colors flex items-center gap-2 ${isYearly ? 'text-zinc-900 font-medium tracking-wide' : 'text-zinc-500 font-light'}`}>
              {T.yearly}
              <span className="bg-[#8B7355]/10 text-[#8B7355] text-[9px] uppercase tracking-[0.1em] px-2 py-1 rounded-full font-semibold">
                {T.discount}
              </span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Starter */}
           <div className="bg-white p-10 border border-[#EBEBE6] flex flex-col rounded-sm hover:-translate-y-1 transition-transform duration-500">
              <h3 className="font-serif text-2xl mb-2 text-zinc-900">{T.p1_name}</h3>
              <p className="text-zinc-500 text-sm font-light mb-8 h-10">{T.p1_desc}</p>
              
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-light tracking-tight text-zinc-900">${isYearly ? '15.90' : '19.90'}</span>
                <span className="text-sm text-zinc-400 font-light pb-1">/ mo</span>
              </div>
              <p className="text-zinc-500 text-xs font-light mb-8 h-4">{T.p1_limit}</p>
              
              <button 
                  onClick={() => handleCheckout('starter')}
                  disabled={loadingPlan === 'starter'}
                  className="w-full py-4 border border-zinc-200 text-zinc-900 hover:border-zinc-900 focus:outline-none transition-colors uppercase tracking-[0.2em] text-[10px] font-semibold rounded-sm mb-10 disabled:opacity-50">
                 {loadingPlan === 'starter' ? 'Yönlendiriliyor...' : T.buyNow}
              </button>
              
              <ul className="space-y-4 flex-1">
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p1_f1}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p1_f2}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p1_f3}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p1_f4}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p1_f5}</li>
              </ul>
           </div>
           
           {/* Pro */}
           <div className="bg-zinc-900 text-white p-10 border border-zinc-900 flex flex-col relative rounded-sm transform md:-translate-y-4 shadow-2xl shadow-zinc-900/20 hover:-translate-y-5 transition-transform duration-500">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8B7355] text-white px-4 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold rounded-full whitespace-nowrap">
                 {T.mostPopular}
              </div>
              <h3 className="font-serif text-2xl mb-2 flex items-center gap-2">
                 {T.p2_name}
              </h3>
              <p className="text-zinc-400 text-sm font-light mb-8 h-10">{T.p2_desc}</p>
              
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-light tracking-tight text-white">${isYearly ? '63.90' : '79.90'}</span>
                <span className="text-sm text-zinc-500 font-light pb-1">/ mo</span>
              </div>
              <p className="text-zinc-400 text-xs font-light mb-8 h-4">{T.p2_limit}</p>
              
              <button 
                  onClick={() => handleCheckout('pro')}
                  disabled={loadingPlan === 'pro'}
                  className="w-full py-4 bg-white text-zinc-900 hover:bg-[#F9F9F6] focus:outline-none transition-colors uppercase tracking-[0.2em] text-[10px] font-semibold rounded-sm mb-10 disabled:opacity-50">
                 {loadingPlan === 'pro' ? 'Yönlendiriliyor...' : T.buyNow}
              </button>
              
              <ul className="space-y-4 flex-1">
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p2_f1}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Sparkles className="w-4 h-4 text-yellow-500" /> {T.p2_f2}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p2_f3}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p2_f4}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p2_f5}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-300"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p2_f6}</li>
              </ul>
           </div>
           
           {/* Enterprise */}
           <div className="bg-white p-10 border border-[#EBEBE6] flex flex-col rounded-sm relative hover:-translate-y-1 transition-transform duration-500">
              <div className="absolute top-0 right-0 bg-zinc-100 text-zinc-500 px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-semibold rounded-bl-sm">
                 {T.fullSystem}
              </div>
              <h3 className="font-serif text-2xl mb-2 flex items-center gap-2 text-zinc-900">{T.p3_name}</h3>
              <p className="text-zinc-500 text-sm font-light mb-8 h-10">{T.p3_desc}</p>
              
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-light tracking-tight text-zinc-900">${isYearly ? '199.90' : '249.90'}</span>
                <span className="text-sm text-zinc-400 font-light pb-1">/ mo</span>
              </div>
              <p className="text-zinc-500 text-xs font-light mb-8 h-4">{T.p3_limit}</p>
              
              <button 
                  onClick={() => handleCheckout('enterprise')}
                  disabled={loadingPlan === 'enterprise'}
                  className="w-full py-4 border border-zinc-200 text-zinc-900 hover:border-zinc-900 focus:outline-none transition-colors uppercase tracking-[0.2em] text-[10px] font-semibold rounded-sm mb-10 disabled:opacity-50">
                 {loadingPlan === 'enterprise' ? 'Yönlendiriliyor...' : T.buyNow}
              </button>
              
              <ul className="space-y-4 flex-1">
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p3_f1}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Sparkles className="w-4 h-4 text-yellow-500" /> {T.p3_f2}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p3_f3}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p3_f4}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p3_f5}</li>
                 <li className="flex gap-3 items-center text-sm font-light text-zinc-600"><Check className="w-4 h-4 text-[#8B7355]" /> {T.p3_f6}</li>
              </ul>
           </div>
        </div>

        {/* Small Note */}
         <div className="mt-12 text-center text-zinc-400 font-light text-[11px] tracking-wide" dangerouslySetInnerHTML={{__html: T.note}}>
         </div>
      </section>
    </div>
  );
}

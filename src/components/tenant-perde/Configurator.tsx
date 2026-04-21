'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';

import { usePerdeAuth } from '@/hooks/usePerdeAuth';

export default function Configurator() {
  const { user, loading: authLoading } = usePerdeAuth();
  
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(250);
  const [fabric, setFabric] = useState('linen');
  const [mechanism, setMechanism] = useState('manual');

  const fabrics = [
    { id: 'linen', name: 'Premium Keten', pricePerSqm: 450, color: '#e5e0d8' },
    { id: 'velvet', name: 'Kraliyet Kadifesi', pricePerSqm: 650, color: '#2c3e50' },
    { id: 'sheer', name: 'Havadar TÃ¼l', pricePerSqm: 300, color: '#f8f9fa' },
    { id: 'blackout', name: 'Tam Karartma', pricePerSqm: 550, color: '#343a40' },
  ];

  const mechanisms = [
    { id: 'manual', name: 'Standart Manuel Ray', price: 250 },
    { id: 'motorized', name: 'AkÄ±llÄ± Motorlu Sistem', price: 1500 },
  ];

  if (authLoading) return <div className="fixed inset-0 top-[60px] bg-zinc-950 flex flex-col items-center justify-center z-50"><Loader2 className="h-8 w-8 text-zinc-500 animate-spin" /><p className="text-zinc-500 mt-4 text-xs tracking-widest font-mono uppercase">YÃ¼kleniyor...</p></div>;
  if (!user) return (
    <div className="fixed inset-0 top-[60px] bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Oturum Açınız</h2>
        <a href="/sites/perde/login" className="bg-white text-black px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
          Sisteme Giriş Yap
        </a>
      </div>
    </div>
  );

  const currentFabric = fabrics.find(f => f.id === fabric) || fabrics[0];
  const currentMechanism = mechanisms.find(m => m.id === mechanism) || mechanisms[0];
  
  const area = (width / 100) * (height / 100);
  const totalPrice = Math.round((area * currentFabric.pricePerSqm) + currentMechanism.price);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black mt-16 text-white min-h-screen">
      <div className="mb-10 text-center pt-8">
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-white uppercase tracking-tighter">Ä°malat & Maliyet</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto text-[10px] tracking-widest uppercase font-bold">
          B2B Ã–LÃ‡ÃœLERÄ°NÄ°ZÄ° GÄ°RÄ°N VE ARKA PLANDA SÄ°STEMÄ°N OTOMATÄ°K MALÄ°YET HESABINI Ä°ZLEYÄ°N.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950 border border-white/10 rounded-3xl p-12 relative min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none"></div>
          
          <div 
            className="relative shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-700 ease-in-out z-10"
            style={{
              width: `${Math.min(width, 400)}px`,
              height: `${Math.min(height, 500)}px`,
              backgroundColor: currentFabric.color,
              backgroundImage: currentFabric.id === 'linen' ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' : 'none',
              borderRadius: '4px',
              borderTop: mechanism === 'motorized' ? '16px solid #222' : '8px solid #ccc',
            }}
          >
            <div className="absolute inset-0 flex justify-evenly opacity-30 mix-blend-multiply">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-[2%] h-full bg-black shadow-[0_0_15px_rgba(0,0,0,0.8)]"></div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent w-1/3"></div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-8 py-4 rounded-xl shadow-2xl flex items-center space-x-6 z-20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Maliyet</span>
            <span className="font-serif text-3xl text-emerald-400 font-bold">{totalPrice} â‚º</span>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="bg-zinc-900 border-white/10 shadow-2xl rounded-2xl">
            <CardContent className="p-8 space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-white/10 pb-2">Boyutlar (cm)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">GeniÅŸlik</label>
                    <Input 
                      type="number" 
                      value={width} 
                      onChange={(e) => setWidth(Number(e.target.value))}
                      min={50} max={1000}
                      className="bg-black border-white/10 text-white font-mono text-center h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 ml-1">YÃ¼kseklik</label>
                    <Input 
                      type="number" 
                      value={height} 
                      onChange={(e) => setHeight(Number(e.target.value))}
                      min={50} max={600}
                      className="bg-black border-white/10 text-white font-mono text-center h-12"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-white/10 pb-2">KumaÅŸ Tipi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fabrics.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => setFabric(f.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${fabric === f.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black hover:border-white/30'}`}
                    >
                      <div className="w-8 h-8 rounded-full shadow-inner border border-white/20" style={{ backgroundColor: f.color }}></div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-white uppercase tracking-wider">{f.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">+{f.pricePerSqm}â‚º/mÂ²</div>
                      </div>
                      {fabric === f.id && <Check className="h-4 w-4 text-emerald-400" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-white/10 pb-2">Mekanizma Opsiyonu</h3>
                <div className="space-y-3">
                  {mechanisms.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => setMechanism(m.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${mechanism === m.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-black hover:border-white/30'}`}
                    >
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">{m.name}</span>
                      <span className="text-[10px] font-mono text-blue-400">+{m.price}â‚º</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open_order_slide', {
                        detail: {
                          aiSuggestedItems: [`${currentFabric.name} (${width}x${height}cm)`]
                        }
                      }));
                    }
                  }}
                  className="w-full rounded-xl py-6 bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-[10px] font-bold transition-colors"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  SipariÅŸe DÃ¶nÃ¼ÅŸtÃ¼r (ERP)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

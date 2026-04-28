"use client";

import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function HometexContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', type: 'visitor' });
  const [status, setStatus] = useState<'idle'|'sending'|'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          company: form.name,
          role: 'HOMETEX_CONTACT',
          message: form.message,
          type: form.type,
          source: 'hometex_contact_page',
          createdAt: new Date().toISOString()
        })
      });
      setStatus('sent');
      setForm({ name: '', email: '', message: '', type: 'visitor' });
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HometexNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        <h1 className="text-5xl font-serif mb-12 uppercase tracking-tighter">İletişim</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-xl text-zinc-400 font-light leading-relaxed mb-8">
              Sorularınız, işbirlikleri ve sistem entegrasyon talepleriniz için bize ulaşın.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Merkez Ofis</h3>
                  <p className="text-zinc-400 text-sm">Maslak, Büyükdere Cd. No:255 Nurol Plaza<br/>Sarıyer, İstanbul, Türkiye</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">E-Posta</h3>
                  <p className="text-zinc-400 text-sm">contact@hometex.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Telefon</h3>
                  <p className="text-zinc-400 text-sm">+90 850 123 45 67</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-950 p-8 border border-white/10">
            {status === 'sent' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif mb-2">Mesajınız Alındı</h3>
                <p className="text-zinc-400">En kısa sürede tarafınıza dönüş sağlanacaktır.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Başvuru Tipi</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white mb-6">
                    <option value="visitor">Ziyaretçi Kayıt / Bilgi</option>
                    <option value="exhibitor">Katılımcı Başvuru (Stant Talebi)</option>
                    <option value="other">Diğer İşbirlikleri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Firma Adı / Ad Soyad</label>
                  <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} type="text" className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">E-Posta</label>
                  <input required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Mesajınız</label>
                  <textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={4} className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white"></textarea>
                </div>
                <button disabled={status==='sending'} type="submit" className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50">
                  {status === 'sending' ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <HometexFooter />
    </div>
  );
}

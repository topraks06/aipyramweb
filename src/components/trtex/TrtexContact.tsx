'use client';

import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, Globe, Clock } from 'lucide-react';
import { useState } from 'react';
import TrtexNavbar from './TrtexNavbar';
import TrtexFooter from './TrtexFooter';

export default function TrtexContact() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          company: form.company || form.name,
          role: form.subject || 'GENERAL_CONTACT',
          message: form.message,
          source: 'trtex_contact_page',
          createdAt: new Date().toISOString()
        })
      });
      setFormState('sent');
    } catch (err) {
      console.error('Contact error:', err);
      setFormState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <TrtexNavbar lang="tr" basePath="" />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/10 text-[9px] uppercase tracking-[0.3em] mb-10 text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              İletişim Terminali
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-[0.9] mb-8 uppercase">
              İletişim
            </h1>
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-2xl">
              Sektörel iş birliği, reklam, sponsorluk veya teknik destek talepleriniz için bizimle iletişime geçin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form + Info Grid */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-7"
            >
              {formState === 'sent' ? (
                <div className="flex flex-col items-center justify-center py-20 border border-white/10">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <Send className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium mb-3">Mesajınız Alındı</h3>
                  <p className="text-zinc-500 text-sm font-light">En kısa sürede sizinle iletişime geçeceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3">
                        Ad Soyad *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Adınız"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3">
                        E-Posta *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="email@firma.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3">
                        Firma
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 transition-colors"
                        placeholder="Firma adı"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3">
                        Konu
                      </label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                        className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                      >
                        <option value="" className="bg-black">Konu seçin</option>
                        <option value="partnership" className="bg-black">İş Birliği</option>
                        <option value="advertising" className="bg-black">Reklam / Sponsorluk</option>
                        <option value="technical" className="bg-black">Teknik Destek</option>
                        <option value="press" className="bg-black">Basın / Medya</option>
                        <option value="other" className="bg-black">Diğer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium mb-3">
                      Mesaj *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full bg-transparent border border-white/10 px-5 py-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/30 transition-colors resize-none"
                      placeholder="Mesajınızı yazın..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formState === 'sending'}
                    className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-xs uppercase tracking-[0.25em] font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {formState === 'sending' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Gönderiliyor
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Gönder
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lg:col-span-5 space-y-10"
            >
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium mb-6">Merkez</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[1.5]" />
                    <div>
                      <p className="text-white font-medium text-sm">AIPyram GmbH</p>
                      <p className="text-zinc-500 text-sm font-light mt-1">Almanya</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[1.5]" />
                    <div>
                      <p className="text-white text-sm">info@aipyram.com</p>
                      <p className="text-zinc-500 text-sm font-light mt-1">Genel İletişim</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[1.5]" />
                    <div>
                      <p className="text-white text-sm">support@aipyram.com</p>
                      <p className="text-zinc-500 text-sm font-light mt-1">Teknik Destek</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[1.5]" />
                    <div>
                      <p className="text-white text-sm">trtex.com</p>
                      <p className="text-zinc-500 text-sm font-light mt-1">B2B İstihbarat Terminali</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium mb-6">Çalışma Saatleri</h3>
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5 stroke-[1.5]" />
                  <div>
                    <p className="text-white text-sm font-medium">AI Motor: 7/24 Aktif</p>
                    <p className="text-zinc-500 text-sm font-light mt-1">Destek: Pazartesi – Cuma, 09:00 – 18:00 (CET)</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-medium mb-6">Reklam & Sponsorluk</h3>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  TRTEX üzerinde banner, sponsorlu içerik veya premium firma profili 
                  için <span className="text-white">ads@aipyram.com</span> adresine ulaşın.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <TrtexFooter basePath="" lang="tr" />
    </div>
  );
}

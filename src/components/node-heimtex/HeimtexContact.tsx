"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";
import { useState } from "react";

export default function HeimtexContact({ lang = 'en', basePath = '/sites/heimtex.ai' }: { lang?: string, basePath?: string }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          company: form.name,
          role: 'HEIMTEX_CONTACT',
          message: form.message,
          source: 'heimtex_contact_page',
          createdAt: new Date().toISOString()
        })
      });
      setFormState('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact error:', err);
      setFormState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <HeimtexNavbar lang={lang} basePath={basePath} />
      
      <main className="pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-8">
        <header className="mb-16 border-b border-zinc-900 pb-8">
          <span className="text-red-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Get In Touch</span>
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter mb-6 leading-none">
            Contact
          </h1>
          <p className="text-zinc-400 text-lg font-light">
            For editorial inquiries, partnerships, and global trend consultations.
          </p>
        </header>

        {formState === 'sent' ? (
          <div className="py-16 text-center border border-zinc-900 bg-zinc-900/30">
            <h3 className="text-2xl font-serif mb-4 text-white uppercase tracking-wider">Message Sent</h3>
            <p className="text-zinc-500 font-light text-sm">We will get back to you shortly.</p>
            <button 
              onClick={() => setFormState('idle')}
              className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-red-500 hover:text-white transition-colors"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Name</label>
                <input 
                  required
                  type="text" 
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Email</label>
                <input 
                  required
                  type="email" 
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Message</label>
              <textarea 
                required
                rows={6} 
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={formState === 'sending'}
              className="bg-white text-black hover:bg-zinc-200 transition-colors px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {formState === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </main>

      <HeimtexFooter basePath={basePath} />
    </div>
  );
}

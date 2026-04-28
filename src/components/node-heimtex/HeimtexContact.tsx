"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";

export default function HeimtexContact({ lang = 'en', basePath = '/sites/heimtex.ai' }: { lang?: string, basePath?: string }) {
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

        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Name</label>
              <input type="text" className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Email</label>
              <input type="email" className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs tracking-widest uppercase font-mono text-zinc-500">Message</label>
            <textarea rows={6} className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"></textarea>
          </div>
          
          <button type="button" className="bg-white text-black hover:bg-zinc-200 transition-colors px-10 py-4 text-xs font-bold uppercase tracking-[0.2em]">
            Send Message
          </button>
        </form>
      </main>

      <HeimtexFooter basePath={basePath} />
    </div>
  );
}

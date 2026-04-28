"use client";
import HeimtexNavbar from "../HeimtexNavbar";
import HeimtexFooter from "../HeimtexFooter";

export default function HeimtexLogin({ lang = 'en' }: { lang?: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans">
      <HeimtexNavbar lang={lang} />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <h1 className="text-2xl font-serif uppercase tracking-widest text-center mb-8">Login to Heimtex</h1>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Email</label>
              <input type="email" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-red-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Password</label>
              <input type="password" className="w-full bg-zinc-950 border border-zinc-800 p-3 text-white focus:border-red-500 outline-none transition-colors" />
            </div>
            <button type="button" className="w-full bg-white text-black font-bold uppercase tracking-widest p-4 hover:bg-red-500 hover:text-white transition-colors mt-4">
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account? <a href="/register" className="text-white hover:text-red-500">Register</a>
          </div>
        </div>
      </main>
      <HeimtexFooter />
    </div>
  );
}

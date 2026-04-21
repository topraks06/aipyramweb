import Expo from '@/components/tenant-hometex/Expo';
import Link from 'next/link';

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  // We can inject a header here for Hometex
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="absolute top-0 w-full z-50 flex justify-between p-6 md:px-12 backdrop-blur-sm border-b border-white/5">
        <Link href={`/sites/${domain}`} className="text-2xl font-serif tracking-tight hover:opacity-80 transition-opacity">HOMETEX<span className="text-zinc-500">.AI</span></Link>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold items-center">
           <Link href={`/sites/${domain}/expo`} className="text-white">Sanal Fuar</Link>
           <Link href={`/sites/${domain}/magazine`} className="text-zinc-500 hover:text-white transition-colors">Dergi</Link>
           <Link href="/admin" className="text-[#8B7355] border border-[#8B7355]/30 px-3 py-1 rounded-sm hover:bg-[#8B7355]/10 transition-colors">B2B Toptan</Link>
        </div>
      </header>

      <main>
        <Expo />
      </main>
    </div>
  );
}

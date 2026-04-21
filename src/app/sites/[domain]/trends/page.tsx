import Trends from '@/components/tenant-hometex/Trends';
import Link from 'next/link';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="absolute top-0 w-full z-50 flex justify-between p-6 md:px-12 backdrop-blur-sm border-b border-white/5">
        <Link href={`/sites/${domain}`} className="text-2xl font-serif tracking-tight hover:opacity-80 transition-opacity">HOMETEX<span className="text-zinc-500">.AI</span></Link>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold items-center">
           <Link href={`/sites/${domain}/expo`} className="text-zinc-500 hover:text-white transition-colors">Sanal Fuar</Link>
           <Link href={`/sites/${domain}/exhibitors`} className="text-zinc-500 hover:text-white transition-colors">Katılımcılar</Link>
           <Link href={`/sites/${domain}/magazine`} className="text-white">Dergi</Link>
        </div>
      </header>

      <main>
        <Trends />
      </main>
    </div>
  );
}

import Configurator from '@/components/node-perde/Configurator';
import Link from 'next/link';

export default async function ConfiguratorPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-5 flex justify-between items-center text-zinc-900 border-b border-[#8B7355]/10 bg-[#F9F9F6]/80 backdrop-blur-lg">
        <Link href={`/sites/${domain}`} className="font-serif text-2xl tracking-tight font-medium hover:opacity-80 transition-opacity">PERDE.AI</Link>
        <nav className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
           <Link href={`/sites/${domain}/visualizer`} className="hover:text-zinc-900 transition-colors">Tasarım Stüdyosu</Link>
           <Link href={`/sites/${domain}/pricing`} className="hover:text-zinc-900 transition-colors">Kurumsal Üyelik</Link>
           <Link href={`/sites/${domain}/b2b`} className="hover:text-zinc-900 transition-colors">B2B Yönetimi</Link>
           <Link href={`/sites/${domain}/catalog`} className="hover:text-zinc-900 transition-colors">Katalog Stoku</Link>
           <Link href={`/sites/${domain}/configurator`} className="text-zinc-900 transition-colors">Maliyet Motoru</Link>
        </nav>
        <div className="flex items-center gap-6">
           <Link href={`/sites/${domain}/contact`} className="hidden sm:block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-zinc-900 transition-colors">İletişim</Link>
           <Link href="/admin" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-900 hover:text-[#8B7355] transition-colors">Sisteme Giriş</Link>
        </div>
      </header>

      <main>
        <Configurator />
      </main>
    </div>
  );
}

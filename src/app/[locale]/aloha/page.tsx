"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';

/**
 * ESKİ ALOHA SAYFASI — /admin'e yönlendirir.
 * 
 * Bu sayfa perde.ai döneminden kalma bir kalıntıydı.
 * Gerçek Aloha beyni artık /admin panelinde (Aloha sekmesi) çalışıyor.
 */
export default function AlohaRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 2 saniye sonra admin paneline yönlendir
    const timer = setTimeout(() => {
      router.replace('/admin');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 animate-pulse">
        <Bot className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-black uppercase tracking-widest mb-2">ALOHA v2.0</h1>
      <p className="text-sm text-zinc-400 font-mono">Admin paneline yönlendiriliyorsunuz...</p>
      <p className="text-[10px] text-zinc-600 mt-4 font-mono">Admin Paneli → Aloha Sekmesi</p>
    </div>
  );
}

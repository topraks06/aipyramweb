"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, CheckCircle2, Lock, Rss, Loader2, KeyRound } from 'lucide-react';

interface SocialMediaWidgetProps {
  brandName: string;
  handle: string;
}

export function SocialMediaWidget({ brandName, handle }: SocialMediaWidgetProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Tarama Başlatılıyor...');

  const platforms = [
    { name: 'X (Twitter)', status: progress > 20 ? 'claimed' : 'pending' },
    { name: 'Instagram', status: progress > 40 ? 'claimed' : 'pending' },
    { name: 'Facebook', status: progress > 50 ? 'claimed' : 'pending' },
    { name: 'LinkedIn', status: progress > 60 ? 'claimed' : 'pending' },
    { name: 'TikTok', status: progress > 70 ? 'claimed' : 'pending' },
    { name: 'Pinterest', status: progress > 80 ? 'claimed' : 'pending' },
    { name: 'YouTube', status: progress > 90 ? 'claimed' : 'pending' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(timer); setStatus('Tüm Hesaplar Oluşturuldu ve Şifrelendi.'); return 100; }
        if (prev === 10) setStatus('Kullanıcı Adı Müsaitliği Kontrol Ediliyor...');
        if (prev === 30) setStatus('Hesaplar Açılıyor ve Şifreler Üretiliyor...');
        if (prev === 60) setStatus('Profil Fotoğrafları ve Biyografiler Ekleniyor...');
        if (prev === 80) setStatus('Otonom Yayın Motoru (API) Bağlanıyor...');
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 w-full max-w-md font-mono">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2 text-blue-400"><Share2 size={18} /><span className="text-sm font-semibold tracking-widest">SOSYAL MEDYA AJANI</span></div>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">OTONOM</span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Proje: <strong className="text-white">{brandName}</strong></span>
          <span>Hedef ID: <strong className="text-white">@{handle}</strong></span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
          <motion.div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-400">
          {progress < 100 ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          <span>{status}</span>
        </div>
      </div>
      <div className="space-y-2">
        {platforms.map((platform, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-2 rounded border border-gray-700/50">
            <span className="text-xs text-gray-300">{platform.name}</span>
            <div className="flex items-center gap-3">
              {platform.status === 'claimed' ? (
                <>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><KeyRound size={10} /> ***{idx + 1}A9</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-1.5 py-0.5 rounded"><CheckCircle2 size={10} /> ALINDI</span>
                </>
              ) : (
                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> BEKLİYOR</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {progress === 100 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-blue-900/20 border border-blue-800/50 rounded p-3">
          <div className="flex items-center gap-2 text-blue-400 mb-2"><Rss size={14} /><span className="text-xs font-semibold">GÜNLÜK YAYIN MOTORU AKTİF</span></div>
          <p className="text-[10px] text-gray-400 leading-relaxed">Tüm hesaplar güvenli kasaya eklendi. Ajan, her gün sabah 09:00 ve akşam 18:00'de sektörel haberleri otomatik olarak tüm platformlarda eşzamanlı paylaşacak.</p>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, LayoutDashboard, Aperture, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface WelcomeWizardProps {
  userUid: string;
  userName: string;
  profession: string;
  onComplete: () => void;
  basePath?: string;
}

export default function WelcomeWizard({ userUid, userName, profession, onComplete, basePath = '/sites/icmimar.ai' }: WelcomeWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const getProfessionMessage = () => {
    switch (profession) {
      case 'perdeci': return 'Müşterilerinize oda fotoğrafında icmimar göstermeye hazır mısınız?';
      case 'ic_mimar': return 'Projelerinizi yapay zeka ile saniyeler içinde görselleştirin.';
      case 'mobilyaci': return 'Mekanlarınıza kumaş ve icmimar simülasyonu ekleyin.';
      default: return 'Yapay zeka ile tasarım dünyasına hoş geldiniz.';
    }
  };

  const steps = [
    {
      title: `Hoş Geldiniz, ${userName.split(' ')[0]}!`,
      desc: getProfessionMessage(),
      icon: <Sparkles className="w-12 h-12 text-[#8B7355]" />,
      actionText: "Devam Et"
    },
    {
      title: "İlk Tasarımınızı Yapalım",
      desc: "Stüdyoya geçip müşterinizin oda fotoğrafını ve mağazanızdaki kumaşı yükleyin. Sistem ışık ve açıyı otonom hesaplar.",
      icon: <Aperture className="w-12 h-12 text-zinc-400" />,
      actionText: "Sonraki Adım"
    },
    {
      title: "5 Ücretsiz Hakkınız Var",
      desc: "Sistemi test etmeniz için hesabınıza 5 adet yüksek çözünürlüklü tasarım hakkı tanımlandı.",
      icon: <LayoutDashboard className="w-12 h-12 text-[#8B7355]" />,
      actionText: "Stüdyoyu Başlat"
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      await updateDoc(doc(db, 'icmimar_members', userUid), {
        onboardingCompleted: true
      });
      onComplete();
    } catch (err) {
      console.error("Onboarding kaydı güncellenemedi:", err);
      onComplete(); // Hata olsa bile kapat
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-zinc-800 w-full">
          <motion.div 
            className="h-full bg-[#8B7355]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Skip button */}
        <button 
          onClick={finishOnboarding}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
          title="Atla"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                {steps[currentStep].icon}
              </div>
              <h2 className="text-3xl font-serif text-white mb-4">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm font-light text-zinc-400 max-w-xs mx-auto leading-relaxed h-16">
                {steps[currentStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-[#8B7355]' : 'bg-zinc-800'}`} 
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={isFinishing}
              className="flex items-center gap-3 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {steps[currentStep].actionText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

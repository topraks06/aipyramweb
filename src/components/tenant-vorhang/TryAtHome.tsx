"use client";

import { useState } from "react";
import VorhangNavbar from "./VorhangNavbar";
import { Camera, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TryAtHome() {
  const [step, setStep] = useState<1|2|3>(1);
  const [isRendering, setIsRendering] = useState(false);

  const handleSimulateUpload = () => {
    setStep(2);
    // Simulate render delay
    setIsRendering(true);
    setTimeout(() => {
       setIsRendering(false);
       setStep(3);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <VorhangNavbar />
      
      <main className="pt-24 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-serif mb-4">In Ihrem Raum ansehen</h1>
           <p className="text-gray-500 max-w-2xl mx-auto">
             Laden Sie ein Foto Ihres Raumes hoch. Unsere KI (Powered by Perde.ai) appliziert 
             den gewählten Stoff fotorealistisch und maßstabsgetreu.
           </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center items-center gap-4 mb-12">
           <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">1</div>
              <span className="font-medium hidden sm:block">Foto hochladen</span>
           </div>
           <div className={`w-12 h-px ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`} />
           <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">2</div>
              <span className="font-medium hidden sm:block">KI-Rendering</span>
           </div>
           <div className={`w-12 h-px ${step >= 3 ? 'bg-[#D4AF37]' : 'bg-gray-200'}`} />
           <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4AF37]' : 'text-gray-300'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"><CheckCircle2 className="w-5 h-5"/></div>
              <span className="font-medium hidden sm:block">Ergebnis</span>
           </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
           
           {step === 1 && (
             <>
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-[#D4AF37]">
                 <Upload className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-medium mb-2">Ziehen Sie ein Foto hierher</h3>
               <p className="text-gray-400 mb-8">oder klicken Sie, um eine Datei auszuwählen (JPG, PNG)</p>
               <button 
                 onClick={handleSimulateUpload}
                 className="bg-black text-white px-8 py-3 rounded-sm font-medium hover:bg-[#D4AF37] transition-colors"
               >
                 Testbild verwenden
               </button>
             </>
           )}

           {step === 2 && (
             <div className="flex flex-col items-center">
               <Sparkles className="w-12 h-12 text-[#D4AF37] animate-pulse mb-6" />
               <h3 className="text-xl font-medium mb-2">KI-Magie am Werk...</h3>
               <p className="text-gray-400">Das dauert nur wenige Sekunden.</p>
               <div className="w-64 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-[#D4AF37] w-full origin-left animate-[scale-x_3s_ease-in-out_forwards]" />
               </div>
             </div>
           )}

           {step === 3 && (
             <div className="w-full">
               <div className="relative aspect-video bg-gray-200 mb-8 rounded overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-mono text-sm">
                     [Watermarked Mock Render Result]
                  </div>
                  {/* Demo Watermark */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-wrap content-evenly justify-evenly -rotate-12">
                     {Array.from({length: 20}).map((_, i) => (
                       <span key={i} className="text-4xl font-bold text-white m-4">Vorhang.ai</span>
                     ))}
                  </div>
               </div>
               <div className="flex gap-4 justify-center">
                  <button onClick={() => setStep(1)} className="border border-black px-6 py-3 rounded-sm font-medium hover:bg-gray-100 transition-colors">
                    Neues Foto
                  </button>
                  <Link href="/products/mock-id" className="bg-[#D4AF37] text-white px-6 py-3 rounded-sm font-medium hover:bg-black transition-colors">
                    Stoff kaufen
                  </Link>
               </div>
             </div>
           )}

        </div>
      </main>
    </div>
  );
}

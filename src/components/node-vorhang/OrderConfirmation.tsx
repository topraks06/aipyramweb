"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function OrderConfirmation({ orderId }: { orderId: string | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col font-sans">
      <VorhangNavbar />
      <main className="flex-grow pt-32 pb-12 max-w-3xl mx-auto px-4 text-center w-full">
        <div className="bg-white p-12 border border-gray-100 shadow-sm rounded-sm">
          <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-serif mb-4">Bestellung Erfolgreich!</h1>
          <p className="text-gray-500 mb-8">
            Ihre Zahlung wurde bestätigt. Der Auftrag wurde über das Sovereign Network direkt an den Hersteller in der Türkei weitergeleitet.
          </p>
          <div className="bg-gray-50 p-6 rounded-sm text-left max-w-md mx-auto space-y-4">
             <div className="flex justify-between border-b border-gray-200 pb-2">
               <span className="text-gray-500">Bestellnummer:</span>
               <span className="font-mono font-bold">{orderId || "VND-10492"}</span>
             </div>
             <div className="flex justify-between border-b border-gray-200 pb-2">
               <span className="text-gray-500">Hersteller Status:</span>
               <span className="text-green-600 font-bold flex items-center gap-1">
                 <CheckCircle2 className="w-4 h-4" /> In Produktion
               </span>
             </div>
             <div className="text-xs text-gray-400 mt-4 text-center">
               Eine Kopie dieses Auftrags wurde soeben an das B2B-Dashboard des türkischen Herstellers gesendet.
             </div>
          </div>
          <div className="mt-8">
            <Link href="/" className="inline-block bg-black text-white px-8 py-4 font-bold tracking-widest text-xs uppercase hover:bg-gray-800 transition-colors">
              Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}

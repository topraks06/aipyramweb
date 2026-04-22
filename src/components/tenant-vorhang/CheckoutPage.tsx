"use client";

import { useState } from "react";
import VorhangNavbar from "./VorhangNavbar";
import { Lock, ShieldCheck, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import VorhangFooter from "./VorhangFooter";

export function CheckoutPage() {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Mock total
  const total = 439.49;
  const basePriceEur = 369.32;
  const vatEur = 70.17;
  const shippingEur = 0;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/master/vorhang/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'VOR-BUNDLE-01',
          productName: 'Premium Leinen & Blackout Samt',
          priceEur: basePriceEur,
          vatEur: vatEur,
          shippingEur: shippingEur,
          totalEur: total,
          customerDetails: {
             name: 'Gast Kunde',
             country: 'DE',
             vatId: ''
          },
          manufacturerId: 'perde_default_vendor' // TR'deki üreticiyi temsil eder
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderResult(data);
      setSuccess(true);
    } catch (err: any) {
      alert('Bestellung fehlgeschlagen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 text-black">
        <VorhangNavbar />
        <main className="pt-32 pb-12 max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white p-12 border border-gray-100 shadow-sm rounded-sm">
            <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl font-serif mb-4">Bestellung Erfolgreich!</h1>
            <p className="text-gray-500 mb-8">
              Ihre Zahlung wurde bestätigt. Der Auftrag wurde über das Sovereign Network direkt an den Hersteller in der Türkei weitergeleitet.
            </p>
            <div className="bg-gray-50 p-6 rounded-sm text-left max-w-md mx-auto space-y-4">
               <div className="flex justify-between border-b border-gray-200 pb-2">
                 <span className="text-gray-500">Bestellnummer:</span>
                 <span className="font-mono font-bold">{orderResult?.orderId}</span>
               </div>
               <div className="flex justify-between border-b border-gray-200 pb-2">
                 <span className="text-gray-500">Hersteller Status:</span>
                 <span className="text-green-600 font-bold">In Produktion</span>
               </div>
               <div className="text-xs text-gray-400 mt-4 text-center">
                 Eine Kopie dieses Auftrags wurde soeben an das B2B-Dashboard des türkischen Herstellers gesendet.
               </div>
            </div>
          </div>
        </main>
        <VorhangFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <VorhangNavbar />
      
      <main className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif mb-8 text-black">Kasse</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Checkout Form */}
          <div className="flex-1 space-y-8">
            
            {/* Steps indicator */}
            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
              <span className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div>
                Lieferung
              </span>
              <div className="w-8 h-px bg-gray-200" />
              <span className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div>
                Zahlung
              </span>
            </div>

            {step === 1 && (
              <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm space-y-6">
                <h2 className="text-xl font-bold font-serif">Lieferadresse</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vorname</label>
                    <input type="text" className="w-full border border-gray-200 p-3 rounded-sm focus:border-black outline-none transition-colors" placeholder="Max" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nachname</label>
                    <input type="text" className="w-full border border-gray-200 p-3 rounded-sm focus:border-black outline-none transition-colors" placeholder="Mustermann" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Straße und Hausnummer</label>
                    <input type="text" className="w-full border border-gray-200 p-3 rounded-sm focus:border-black outline-none transition-colors" placeholder="Musterstraße 1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">PLZ</label>
                    <input type="text" className="w-full border border-gray-200 p-3 rounded-sm focus:border-black outline-none transition-colors" placeholder="10115" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stadt</label>
                    <input type="text" className="w-full border border-gray-200 p-3 rounded-sm focus:border-black outline-none transition-colors" placeholder="Berlin" />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-black text-white py-4 font-bold tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors mt-4"
                >
                  WEITER ZUR ZAHLUNG <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 border border-gray-100 rounded-sm shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-serif">Zahlungsdetails</h2>
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Sicher verschlüsselt</span>
                  </div>
                </div>
                
                {/* Placeholder for Stripe Elements */}
                <div className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-500 min-h-[200px]">
                  <CreditCard className="w-8 h-8 opacity-50" />
                  <p className="text-sm text-center">
                    Dieses Feld ist für die <strong className="text-black">Stripe Integration</strong> vorbereitet.<br/>
                    (Verwaltet von Barış)
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-4 border border-gray-200 font-bold tracking-widest text-xs hover:bg-gray-50 transition-colors"
                  >
                    ZURÜCK
                  </button>
                  <button 
                    className="flex-1 bg-black text-white py-4 font-bold tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-green-700 transition-colors"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'VERARBEITUNG...' : `JETZT BEZAHLEN (€${total.toFixed(2)})`} <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white p-6 border border-gray-100 rounded-sm shadow-sm space-y-6 sticky top-28">
              <h3 className="font-bold font-serif text-lg">Zusammenfassung</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Premium Leinen Vorhang (1x)</span>
                  <span className="font-medium">€249.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Blackout Samt (2x)</span>
                  <span className="font-medium">€189.50</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span className="font-medium">€439.49</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Versand</span>
                  <span className="font-medium text-green-600">Kostenlos</span>
                </div>
                <div className="h-px bg-black" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Gesamt</span>
                  <span className="font-bold text-xl">€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-sm flex gap-3 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p>Ihre Bestellung ist durch unsere 30-Tage-Geld-zurück-Garantie abgesichert.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}

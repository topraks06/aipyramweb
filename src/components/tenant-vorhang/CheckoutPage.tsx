"use client";

import { useState, useEffect } from "react";
import VorhangNavbar from "./VorhangNavbar";
import { Lock, ShieldCheck, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import VorhangFooter from "./VorhangFooter";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

export function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { items, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  const total = getTotal();
  const shippingEur = 0;
  // Calculate VAT out of total (e.g. 19% German VAT)
  const basePriceEur = total / 1.19;
  const vatEur = total - basePriceEur;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Create Stripe Checkout Session
      const res = await fetch('/api/stripe/marketplace-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ 
            name: i.name, 
            amountEur: i.price, 
            quantity: i.quantity,
            images: i.image ? [i.image] : undefined
          })),
          tenantId: 'vorhang',
          customerDetails: {
             name: 'Gast Kunde', // In real app, comes from form step 1
             country: 'DE',
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout Error');

      // Redirect to Stripe Hosted Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe URL not returned");
      }
    } catch (err: any) {
      alert('Bestellung fehlgeschlagen: ' + err.message);
      setLoading(false);
    }
  };

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
                {!mounted ? (
                  <div className="text-sm text-gray-500">Lade Warenkorb...</div>
                ) : items.length === 0 ? (
                  <div className="text-sm text-gray-500">Ihr Warenkorb ist leer.</div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-4">{item.name} ({item.quantity}x)</span>
                      <span className="font-medium whitespace-nowrap">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span className="font-medium">€{basePriceEur.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Versand</span>
                  <span className="font-medium text-green-600">Kostenlos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt. (19%)</span>
                  <span className="font-medium">€{vatEur.toFixed(2)}</span>
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

"use client";

import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { ArrowRight, ShieldCheck, CheckCircle2, Building, Banknote, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useSovereignAuth } from "@/hooks/useSovereignAuth";
import toast from "react-hot-toast";

export default function SellerOnboarding({ basePath = "" }: { basePath?: string }) {
  const { user, loading: authLoading } = useSovereignAuth("vorhang");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    legalForm: '',
    vatId: '',
    street: '',
    zip: '',
    city: '',
    country: 'DE',
    iban: '',
    bic: '',
    accountHolder: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!user) {
        toast.error('Lütfen önce giriş yapın.');
        return;
      }
      setLoading(true);
      try {
        await setDoc(doc(db, "vorhang_sellers", user.uid), {
          ...formData,
          userId: user.uid,
          timestamp: new Date().toISOString(),
          status: "pending",
        });
        setSuccess(true);
      } catch (error) {
        console.error("Error adding document: ", error);
        toast.error("Hata oluştu, lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) return <div className="p-12 text-center text-gray-500">Yükleniyor...</div>;
  if (!user) return <div className="p-12 text-center text-gray-500">Lütfen kayıt olmak için giriş yapın.</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col text-black">
        <VorhangNavbar />
        <main className="flex-grow pt-32 pb-12 flex items-center justify-center">
          <div className="bg-white p-12 border border-gray-100 shadow-sm text-center max-w-lg w-full">
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif mb-4">Antrag eingereicht!</h1>
            <p className="text-gray-500 mb-8">
              Ihre Registrierung als Händler bei Vorhang.ai wurde erfolgreich übermittelt. 
              Unser Team wird Ihre Daten prüfen und sich in Kürze bei Ihnen melden.
            </p>
            <Link 
              href={`${basePath}/seller`}
              className="inline-flex bg-black text-white px-8 py-4 font-bold text-xs tracking-widest hover:bg-[#D4AF37] transition-all"
            >
              ZUM DASHBOARD
            </Link>
          </div>
        </main>
        <VorhangFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-black">
      <VorhangNavbar />
      
      <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Händler Registrierung</h1>
          <p className="text-gray-500 text-lg">Werden Sie Teil des größten KI-gesteuerten B2B-Marktplatzes.</p>
        </div>

        <div className="flex mb-12 relative">
           <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>1</div>
              <span className={`text-xs mt-3 uppercase tracking-widest font-bold ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>Firma</span>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>2</div>
              <span className={`text-xs mt-3 uppercase tracking-widest font-bold ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>Adresse</span>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'}`}>3</div>
              <span className={`text-xs mt-3 uppercase tracking-widest font-bold ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>Zahlung</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 border border-gray-100 shadow-sm relative">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                 <Building className="w-6 h-6 text-[#D4AF37]" />
                 <h2 className="text-2xl font-serif">Unternehmensdaten</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Firmenname</label>
                  <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="Ihre Firma GmbH" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Rechtsform</label>
                  <select required value={formData.legalForm} onChange={e => setFormData({...formData, legalForm: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors bg-white">
                    <option value="">Bitte wählen...</option>
                    <option value="gmbh">GmbH</option>
                    <option value="ag">AG</option>
                    <option value="kg">KG</option>
                    <option value="einzelunternehmen">Einzelunternehmen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Umsatzsteuer-ID (VAT)</label>
                  <input required type="text" value={formData.vatId} onChange={e => setFormData({...formData, vatId: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="DE123456789" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                 <MapPin className="w-6 h-6 text-[#D4AF37]" />
                 <h2 className="text-2xl font-serif">Geschäftsadresse</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Straße und Hausnummer</label>
                  <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="Musterstraße 123" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Postleitzahl</label>
                  <input required type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="10115" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stadt</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="Berlin" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Land</label>
                  <select required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors bg-white">
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                    <option value="CH">Schweiz</option>
                    <option value="TR">Türkei</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                 <Banknote className="w-6 h-6 text-[#D4AF37]" />
                 <h2 className="text-2xl font-serif">Zahlungsinformationen</h2>
              </div>
              
              <div className="bg-blue-50 p-4 border border-blue-100 rounded text-sm text-blue-800 mb-6 flex items-start gap-3">
                 <ShieldCheck className="w-5 h-5 shrink-0" />
                 <p>Ihre Bankdaten werden für Auszahlungen benötigt. Die Abwicklung erfolgt sicher über unseren Zahlungspartner Stripe.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">IBAN</label>
                  <input required type="text" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors font-mono" placeholder="DE00 0000 0000 0000 0000 00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">BIC / SWIFT</label>
                  <input required type="text" value={formData.bic} onChange={e => setFormData({...formData, bic: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors font-mono" placeholder="XXXX DE XX XXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Kontoinhaber</label>
                  <input required type="text" value={formData.accountHolder} onChange={e => setFormData({...formData, accountHolder: e.target.value})} className="w-full border border-gray-200 p-3 outline-none focus:border-black transition-colors" placeholder="Ihre Firma GmbH" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Zurück
              </button>
            ) : <div />}
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
            >
              {loading ? 'Verarbeitung...' : step < 3 ? 'Weiter' : 'Registrieren'} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </main>

      <VorhangFooter />
    </div>
  );
}

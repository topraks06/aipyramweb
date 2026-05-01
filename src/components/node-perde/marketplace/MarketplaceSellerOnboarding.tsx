"use client";

import PerdeNavbar from "../PerdeNavbar";
import PerdeFooter from "../PerdeFooter";
import { ArrowRight, ShieldCheck, CheckCircle2, Building, Banknote, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSovereignAuth } from "@/hooks/useSovereignAuth";

export default function MarketplaceSellerOnboarding({ basePath = "" }: { basePath?: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useSovereignAuth('perde');

  // Form Data
  const [formData, setFormData] = useState({
    companyName: "",
    taxId: "",
    address: "",
    city: "",
    iban: "",
    ibanOwner: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const response = await fetch('/api/perde/marketplace/sellers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storeName: formData.companyName,
                taxId: formData.taxId,
                address: `${formData.address}, ${formData.city}`,
                iban: formData.iban,
                ibanOwner: formData.ibanOwner,
                email: user?.email || "test@esnaf.com", // Auth provider'dan alınır
                phone: ""
            })
        });

        if (!response.ok) {
            throw new Error('Kayıt başarısız');
        }

        setSuccess(true);
      } catch (error) {
        console.error("Error adding document: ", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col text-zinc-900 font-sans selection:bg-[#8B7355] selection:text-white">
        <PerdeNavbar theme="light" />
        <main className="flex-grow pt-32 pb-12 flex items-center justify-center">
          <div className="bg-white p-12 shadow-2xl text-center max-w-lg w-full rounded-2xl border border-zinc-100">
            <CheckCircle2 className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
            <h1 className="text-3xl font-serif mb-4">Başvurunuz Alındı!</h1>
            <p className="text-zinc-500 mb-8 font-light">
              Perde.ai satıcı kaydınız başarıyla oluşturuldu. B2B onay sürecinden geçtikten sonra (tahmini 24 saat), yönetim panelinize erişebilir ve ürünlerinizi satışa sunabilirsiniz.
            </p>
            <Link 
              href={`${basePath}/seller/dashboard`}
              className="inline-flex bg-zinc-900 text-white px-8 py-4 font-bold text-xs tracking-widest hover:bg-[#8B7355] transition-all rounded-full"
            >
              YÖNETİM PANELİNE GİT
            </Link>
          </div>
        </main>
        <PerdeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F6] flex flex-col text-zinc-900 font-sans">
      <PerdeNavbar theme="light" />
      
      <main className="flex-grow pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-[#8B7355]"></div>
            <span className="text-[#8B7355] uppercase tracking-[0.3em] text-[10px] font-semibold">ESNAF VE ÜRETİCİ</span>
            <div className="h-[1px] w-8 bg-[#8B7355]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">Satıcı Onboarding</h1>
          <p className="text-zinc-500 text-lg font-light">Türkiye'nin en büyük yapay zeka destekli ev tekstili pazaryerine katılın.</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex mb-12 relative max-w-2xl mx-auto">
           <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-200 -z-10" />
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200'}`}>1</div>
              <span className={`text-[10px] mt-3 uppercase tracking-widest font-bold ${step >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>Firma</span>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200'}`}>2</div>
              <span className={`text-[10px] mt-3 uppercase tracking-widest font-bold ${step >= 2 ? 'text-zinc-900' : 'text-zinc-400'}`}>Adres</span>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 3 ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200'}`}>3</div>
              <span className={`text-[10px] mt-3 uppercase tracking-widest font-bold ${step >= 3 ? 'text-zinc-900' : 'text-zinc-400'}`}>Ödeme</span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 shadow-2xl rounded-2xl relative border border-zinc-100 max-w-2xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                 <Building className="w-6 h-6 text-[#8B7355]" />
                 <h2 className="text-2xl font-serif">Firma Bilgileri</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Mağaza / Firma Adı</label>
                  <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50" placeholder="Örn: ABC Perde ve Tasarım" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Vergi Numarası / T.C. Kimlik No</label>
                  <input required type="text" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50" placeholder="Vergi levhanızdaki VKN veya Şahıs şirketi ise T.C." />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                 <MapPin className="w-6 h-6 text-[#8B7355]" />
                 <h2 className="text-2xl font-serif">İletişim & Adres</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Açık Adres</label>
                  <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50 resize-none h-24" placeholder="Fatura veya Mağaza adresiniz..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">İl / İlçe</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50" placeholder="Örn: Kadıköy, İstanbul" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-100">
                 <Banknote className="w-6 h-6 text-[#8B7355]" />
                 <h2 className="text-2xl font-serif">Ödeme Altyapısı (İyzico)</h2>
              </div>
              
              <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-xl text-sm text-emerald-800 mb-6 flex items-start gap-3">
                 <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                 <p className="font-light">IBAN bilgileriniz satışlarınızın komisyon kesildikten sonra hesabınıza aktarılması için <b>İyzico Sub-Merchant</b> altyapısında güvenle saklanır.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">IBAN NUMARASI</label>
                  <input required type="text" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50 font-mono text-sm" placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Konto Sahibi / Alıcı Adı</label>
                  <input required type="text" value={formData.ibanOwner} onChange={e => setFormData({...formData, ibanOwner: e.target.value})} className="w-full border border-zinc-200 rounded-xl p-3 outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] transition-all bg-zinc-50/50" placeholder="IBAN sahibinin tam adı veya şirket unvanı" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-zinc-100 flex justify-between">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors rounded-full"
              >
                Geri Dön
              </button>
            ) : <div />}
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-zinc-900 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#8B7355] transition-colors disabled:opacity-50 rounded-full shadow-lg hover:shadow-xl"
            >
              {loading ? 'İşleniyor...' : step < 3 ? 'Devam Et' : 'Kayıt Ol'} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </main>

      <PerdeFooter />
    </div>
  );
}

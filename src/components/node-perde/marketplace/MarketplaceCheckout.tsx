"use client";

import { useState, useEffect } from "react";
import PerdeNavbar from "../PerdeNavbar";
import PerdeFooter from "../PerdeFooter";
import { Lock, ShieldCheck, ArrowRight, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

export function MarketplaceCheckout({ basePath = "" }: { basePath?: string }) {
  const [step, setStep] = useState(1);
  const { items, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = getTotal();
  const FREE_SHIPPING_THRESHOLD = 500;
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 49.90;
  const grandTotal = total + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = () => {
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.phone) {
      toast.error("Lütfen teslimat bilgilerinizi eksiksiz doldurun.");
      return;
    }
    setStep(2);
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Önce siparişi pending olarak oluştur
      const orderRes = await fetch('/api/perde/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ 
            productId: i.id,
            name: i.name, 
            price: i.price, 
            quantity: i.quantity,
            sellerId: i.sellerId
          })),
          buyerName: `${formData.firstName} ${formData.lastName}`,
          buyerAddress: { address: formData.address, city: formData.city },
          buyerPhone: formData.phone,
          buyerEmail: formData.email
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Sipariş oluşturulamadı');

      // 2. Stripe Checkout Session'a yönlendir
      const stripeRes = await fetch('/api/stripe/marketplace-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ 
            name: i.name, 
            amountEur: i.price / 35, // TR -> EUR geçici conversion
            quantity: i.quantity,
            images: i.image ? [i.image] : undefined
          })),
          SovereignNodeId: 'perde',
          metadata: {
            orderId: orderData.orderId
          },
          customerDetails: {
             name: `${formData.firstName} ${formData.lastName}`,
             country: 'TR',
          }
        })
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) throw new Error(stripeData.error || 'Ödeme altyapısına ulaşılamadı');

      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        throw new Error("Ödeme linki alınamadı");
      }
    } catch (err: any) {
      toast.error('Ödeme işlemi başarısız: ' + err.message);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-zinc-900 font-sans">
      <PerdeNavbar theme="light" />
      
      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-8 uppercase tracking-widest">
          <Link href={`${basePath}/`} className="hover:text-[#8B7355]">Ana Sayfa</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`${basePath}/cart`} className="hover:text-[#8B7355]">Sepet</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-900">Güvenli Ödeme</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-serif mb-8 text-zinc-900">Güvenli Ödeme</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Checkout Form */}
          <div className="flex-1 space-y-8">
            
            {/* Steps indicator */}
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
              <span className={`flex items-center gap-2 ${step >= 1 ? 'text-zinc-900' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#8B7355] text-white' : 'bg-zinc-200'}`}>1</div>
                Teslimat Bilgileri
              </span>
              <div className="w-8 h-px bg-zinc-200" />
              <span className={`flex items-center gap-2 ${step >= 2 ? 'text-zinc-900' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#8B7355] text-white' : 'bg-zinc-200'}`}>2</div>
                Ödeme
              </span>
            </div>

            {step === 1 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 space-y-6">
                <h2 className="text-xl font-serif">Teslimat Adresi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ad</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="Adınız" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Soyad</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="Soyadınız" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Telefon</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="05XX XXX XX XX" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">E-posta</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="ornek@email.com" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">İl / İlçe</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="İstanbul, Kadıköy" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Açık Adres</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-zinc-200 p-3.5 rounded-xl focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all" placeholder="Mahalle, Sokak, No:" />
                  </div>
                </div>

                <button 
                  onClick={handleProceedToPayment}
                  className="w-full bg-[#8B7355] text-white py-4 mt-4 rounded-xl font-bold tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-[#725e45] transition-colors"
                >
                  ÖDEMEYE GEÇ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-serif">Ödeme Bilgileri</h2>
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>256-bit Güvenli</span>
                  </div>
                </div>
                
                {/* İyzico/Stripe Placeholder */}
                <div className="border border-zinc-200 rounded-xl p-8 bg-zinc-50 flex flex-col items-center justify-center gap-4 text-zinc-500 min-h-[200px]">
                  <CreditCard className="w-10 h-10 opacity-30 text-[#8B7355]" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-700 mb-1">Stripe & İyzico Entegrasyonu Hazır</p>
                    <p className="text-xs text-zinc-500">
                      Ödemeniz güvenli altyapı üzerinden çekilecektir.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-xl border border-zinc-200 font-bold tracking-widest text-xs text-zinc-600 hover:bg-zinc-50 transition-colors sm:w-1/3"
                  >
                    GERİ DÖN
                  </button>
                  <button 
                    className="flex-1 bg-[#8B7355] text-white py-4 rounded-xl font-bold tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-[#725e45] transition-colors shadow-lg shadow-[#8B7355]/20 disabled:opacity-70"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'İŞLENİYOR...' : `₺${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ÖDE`} <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-100 space-y-6 sticky top-28">
              <h3 className="font-serif text-xl">Sipariş Özeti</h3>
              
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-sm text-zinc-500 py-4">Sepetiniz boş.</div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-zinc-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.quantity} adet</p>
                          <p className="text-sm font-bold mt-1">₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="h-px bg-zinc-100" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Ara Toplam</span>
                    <span className="font-medium text-zinc-900">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Kargo Tutarı</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">KDV (%20)</span>
                    <span className="font-medium text-zinc-900">Dahil</span>
                  </div>
                </div>

                <div className="h-px bg-zinc-200" />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-serif text-lg">Ödenecek Tutar</span>
                  <span className="font-bold text-2xl text-zinc-900">₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-xl flex items-start gap-3 text-sm text-zinc-600 border border-zinc-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Siparişiniz <strong className="text-zinc-900">Perde.ai Güvencesiyle</strong> korunmaktadır. 14 gün içinde koşulsuz iade hakkınız bulunmaktadır.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <PerdeFooter />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ApprovalWidget } from "@/components/aloha/widgets/ApprovalWidget";
import { Building, MapPin, Euro, ArrowRight, ShieldCheck, User, Phone, FileText, Check } from "lucide-react";

interface PropertyEscrowEngineProps {
  isMasterSession?: boolean;
  buyerName?: string;
  buyerPhone?: string;
  buyerPassportOrId?: string;
  propertyId?: string;
  depositAmountEUR?: number;
  totalPriceEUR?: number;
}

/**
 * DIDIM/FETHIYE.AI - DİJİTAL KAPORA SÖZLEŞMESİ (ESCROW MOTORU)
 * Dinamik NLP (Aloha) üzerinden gelen alıcı/mülk kimlikleriyle Stripe'a bağlanır.
 */
export default function PropertyEscrowEngine({ 
  isMasterSession = true,
  buyerName = "Anonim Alıcı",
  buyerPhone = "-",
  buyerPassportOrId = "-",
  propertyId = "Belirsiz Mülk",
  depositAmountEUR = 10000,
  totalPriceEUR = 0
}: PropertyEscrowEngineProps) {
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "APPROVED">("IDLE");

  const handleEscrowApprove = async () => {
    setStatus("PROCESSING");
    
    try {
      // Otonom olarak gerçek Stripe Checkout linkini üret.
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: buyerName, // Müşteri ismi aktarılıyor
          tenant_id: "didimemlak.ai",
          packageId: "escrow_didim",
          // Extra metadata for the Golden Flow webhook mapping
          metadata: {
            buyerName,
            buyerPhone,
            buyerPassportOrId,
            propertyId,
            depositAmountEUR,
            totalPriceEUR
          }
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        // İnfaz gerçekleştiriliyor, Stripe kapısına fırlat.
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Bilinmeyen Stripe Checkout Hatası");
      }
    } catch (e: any) {
      console.error("[ESCROW_ERROR] Kapora Mühürlenemedi:", e.message);
      setStatus("IDLE");
      alert(`Güvenlik duvarı engelledi: ${e.message}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0a0a] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
      
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-neutral-900 bg-[#111111]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-950/50 text-emerald-500 rounded-lg border border-emerald-900/30">
               <ShieldCheck size={20} />
             </div>
             <h2 className="text-[14px] font-black tracking-[0.2em] uppercase text-emerald-500">
               Resmi Kapora Sözleşmesi
             </h2>
          </div>
          <div className="px-3 py-1 bg-black text-neutral-400 text-[10px] font-mono border border-neutral-800 rounded-full">
             AIPYRAM ESCROW NODE
          </div>
        </div>
      </div>

      <div className="p-6 pb-2 space-y-6">
        {/* ALICI BİLGİLERİ (KYC) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2 flex items-center gap-2">
            <User size={14} /> Alıcı Taraf (Müşteri Kimliği)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#151515] p-3 rounded-lg border border-neutral-800">
               <span className="text-[10px] text-neutral-500 block mb-1 uppercase tracking-wider">Tam İsim</span>
               <span className="text-sm text-neutral-200 font-bold">{buyerName}</span>
            </div>
            <div className="bg-[#151515] p-3 rounded-lg border border-neutral-800">
               <span className="text-[10px] text-neutral-500 block mb-1 uppercase tracking-wider">Kimlik / Pasaport</span>
               <span className="text-sm text-neutral-200 font-mono tracking-wider">{buyerPassportOrId}</span>
            </div>
            <div className="bg-[#151515] p-3 rounded-lg border border-neutral-800 col-span-2">
               <span className="text-[10px] text-neutral-500 block mb-1 uppercase tracking-wider">İletişim</span>
               <span className="text-sm text-neutral-200 flex items-center gap-2">
                  <Phone size={12} className="text-neutral-600" /> {buyerPhone}
               </span>
            </div>
          </div>
        </div>

        {/* MÜLK BİLGİLERİ */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2 flex items-center gap-2">
            <Building size={14} /> Gayrimenkul & Ticari Şartlar
          </h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest block mb-1">Mülk Tanımı</span>
                   <span className="text-lg text-neutral-200 font-black">{propertyId}</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Satış Bedeli</span>
                   <span className="text-lg text-neutral-400 font-black">{totalPriceEUR > 0 ? totalPriceEUR.toLocaleString() : "Belirsiz"} €</span>
                </div>
             </div>
             
             {/* PRICE LOCK */}
             <div className="bg-[#050505] border border-emerald-900/30 rounded-lg p-4 mt-2 flex items-center justify-between">
                <div>
                   <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest mb-1 shadow-sm">Bağlayıcı Kapora Bedeli</p>
                   <p className="text-[10px] text-neutral-500 w-3/4">Stripe aracılığıyla güvenli kasaya (Escrow) alınacaktır. Ödendiği an gayrimenkul global pazardan satıştan düşer.</p>
                </div>
                <div className="text-right">
                   <div className="flex items-baseline gap-1 text-3xl font-black text-emerald-500">
                     <span>{depositAmountEUR.toLocaleString()}</span>
                     <span className="text-xl">€</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* APPROVAL WIDGET AREA */}
      <div className="p-6 pt-2">
        {status === "IDLE" && (
          <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#111111]">
            <ApprovalWidget 
              title="Escrow Sözleşme İnfazı" 
              description={`${buyerName} adına bu mülkün blokaj işlemi için 1. derece güvenlik yetkinizi kullanıyorsunuz.`}
              requires2FA={true}
              isMasterAuth={isMasterSession}
              onApprove={handleEscrowApprove}
              onReject={() => console.log("Reddedildi")}
            />
          </div>
        )}
        
        {status === "PROCESSING" && (
          <div className="bg-[#111111] text-white rounded-xl p-8 text-center animate-pulse border border-neutral-800">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-sm text-neutral-300 tracking-wider mb-1">Stripe Güvenli Kasaya Bağlanıyor...</h4>
            <p className="text-xs text-neutral-500">Master Key onay bekleniyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}

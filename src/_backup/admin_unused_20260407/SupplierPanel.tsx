"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, ShieldCheck, Factory, Globe2, ScanFace, Building2, AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react";
import { AgentTerminal, LogEntry } from "@/components/shared/AgentTerminal";

export interface Supplier {
  id: string;
  companyName: string;
  region: string;
  products: string[];
  certifications: string[];
  contactEmail: string;
  yearsInBusiness: number;
  trustScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  lastAuditAt?: number;
}

export default function SupplierPanel() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditingId, setAuditingId] = useState<string | null>(null);

  // New Supplier Form State
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [productsStr, setProductsStr] = useState("");
  const [certsStr, setCertsStr] = useState("");
  const [years, setYears] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeStream, setActiveStream] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success || data.suppliers) {
        setSuppliers(data.suppliers || data.data || []);
      }
    } catch (e) {
      toast.error("Tedarikçiler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tf = () => new Date().toISOString().substring(11, 19);

    let logs: LogEntry[] = [{ id: '1', agent: 'INTENT_GUARD', message: 'Bağlantı kanalı açılıyor...', status: 'info', timestamp: tf() }];
    setActiveStream([...logs]);
    
    // Agent execution flow simulation
    const steps = [
      { agent: 'OCR_AGENT', message: 'Fabrika vergi levhası ve evraklar taranıyor...', status: 'info' as const },
      { agent: 'AUDITOR', message: 'Global KYC havuzunda geçmiş kayıtlar doğrulanıyor...', status: 'info' as const },
      { agent: 'STRATEGIST', message: 'Risk Analizi: Bölgesel ticaret riski puanlandı.', status: 'warning' as const },
      { agent: 'DB_WRITE', message: 'Güvenli kayıt işlemi başlatıldı.', status: 'success' as const }
    ];

    for(let i=0; i<steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      logs.push({ id: `step-${i}`, ...steps[i], timestamp: tf() });
      setActiveStream([...logs]);
    }

    try {
      const products = productsStr.split(",").map(s => s.trim()).filter(Boolean);
      const certifications = certsStr.split(",").map(s => s.trim()).filter(Boolean);

      const payload = {
        companyName,
        region,
        contactEmail,
        products,
        certifications,
        yearsInBusiness: parseInt(years) || 1,
        tenant_id: "aipyram-core"
      };

      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      logs.push({ id: 'fin', agent: 'SUCCESS', message: 'Veri Mühürlendi. Sinyal dağıtılıyor.', status: 'success', timestamp: tf() });
      setActiveStream([...logs]);
      await new Promise(r => setTimeout(r, 600));

      toast.success("Tedarikçi veri tabanına başarıyla eklendi.");
      setShowForm(false);
      setCompanyName(""); setRegion(""); setContactEmail(""); setProductsStr(""); setCertsStr("");
      fetchSuppliers();
    } catch (e: any) {
      logs.push({ id: 'err', agent: 'ERROR', message: 'İŞLEM REDDEDİLDİ: ' + e.message, status: 'error', timestamp: tf() });
      setActiveStream([...logs]);
      toast.error("Hata: " + e.message);
    } finally {
      setTimeout(() => {
         setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleAudit = async (id: string, name: string) => {
    setAuditingId(id);
    toast.info(`${name} için Müfettiş Ajan (Auditor) çağrılıyor...`);
    try {
      const res = await fetch(`/api/suppliers/${id}/audit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Denetim Tamamlandı! Trust Score: ${data.trustScore} - ${data.riskLevel}`);
      fetchSuppliers(); // Refresh list to get new scores
    } catch (e: any) {
      toast.error(`Denetim Başarısız: ${e.message}`);
    } finally {
      setAuditingId(null);
    }
  };

  const getScoreColor = (score: number, risk: string) => {
    if (score === 0 || risk === "UNVERIFIED") return "bg-neutral-800 text-neutral-400 border-neutral-700";
    if (score >= 80) return "bg-emerald-950/50 text-emerald-500 border-emerald-900";
    if (score >= 50) return "bg-yellow-950/50 text-yellow-500 border-yellow-900";
    return "bg-red-950/50 text-red-500 border-red-900";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Factory className="text-primary" /> Tedarikçi Radarı & Trust Layer
          </h2>
          <p className="text-sm text-muted-foreground mt-1 tracking-wide">
            Otonom AuditorAgent fabrikaları denetler ve global B2B güven skoru (KYC) atar.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="uppercase tracking-widest text-xs font-bold bg-white text-black hover:bg-neutral-200 rounded-sm"
        >
          {showForm ? "İptal" : <><Plus size={16} className="mr-1" /> Fabrika Ekle</>}
        </Button>
      </div>

      {/* NEW SUPPLIER FORM */}
      {showForm && (
        <div className="corporate-card p-6 border-emerald-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
            <Building2 size={16} /> Yeni Tedarikçi Kütüğü OLuştur
          </h3>
          <form onSubmit={handleCreateSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Fabrika Adı</label>
              <Input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Örn: Ege Tül Tekstil A.Ş." className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Bölge / Ülke</label>
              <Input required value={region} onChange={e => setRegion(e.target.value)} placeholder="Örn: Denizli, Türkiye" className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Email (B2B)</label>
              <Input type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="export@egetul.com" className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Pazardaki Yılı</label>
              <Input type="number" required value={years} onChange={e => setYears(e.target.value)} min="1" className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Ürün Portföyü (Virgülle Ayırın)</label>
              <Input value={productsStr} onChange={e => setProductsStr(e.target.value)} placeholder="Keten Perde, Blackout, Zebra Stor" className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-neutral-400 uppercase tracking-widest">Küresel Sertifikasyonlar (Virgülle Ayırın)</label>
              <Input value={certsStr} onChange={e => setCertsStr(e.target.value)} placeholder="OEKO-TEX Standard 100, ISO 9001, GOTS" className="bg-neutral-900/50 border-neutral-800" />
            </div>
            <div className="md:col-span-2 mt-2">
              {(isSubmitting || activeStream.length > 0) && (
                <div className="mb-2 w-full text-left relative z-10">
                  <AgentTerminal logs={activeStream} isActive={isSubmitting} title="KYC_PROTOCOL" />
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest font-bold h-12 rounded-sm border border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "SİSTEM KİLİTLİ (İŞLENİYOR)" : "Veritabanına Kaydet & Denetime Hazırla"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SUPPLIER LIST */}
      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-neutral-500 w-8 h-8" /></div>
      ) : suppliers.length === 0 ? (
        <div className="text-center p-12 corporate-card border-dashed">
          <Globe2 className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 uppercase tracking-widest text-sm">Hiçbir tedarikçi bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className={`corporate-card p-5 relative overflow-hidden transition-all hover:border-neutral-600 ${auditingId === sup.id ? 'border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : ''}`}>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">{sup.companyName}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1 uppercase tracking-wider">
                    <MapPin size={12} /> {sup.region} • {sup.yearsInBusiness} Yıllık Üretici
                  </div>
                </div>
                
                {/* TRUST SCORE BADGE */}
                <div className={`flex flex-col items-center justify-center p-2 rounded-lg border min-w-[70px] ${getScoreColor(sup.trustScore, sup.riskLevel)}`}>
                  <ShieldCheck size={16} className="mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{sup.trustScore > 0 ? `${sup.trustScore}/100` : "TBD"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Risk Seviyesi</span>
                  <div className="font-bold flex items-center gap-1">
                    {sup.riskLevel === 'HIGH' ? <AlertTriangle size={14} className="text-red-500" /> : 
                     sup.riskLevel === 'LOW' ? <CheckCircle size={14} className="text-emerald-500" /> :
                     <Clock size={14} className="text-neutral-500" />}
                    {sup.riskLevel}
                  </div>
                </div>
                <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">Ürün Havuzu</span>
                  <span className="text-neutral-300 font-medium truncate block">
                    {sup.products?.length > 0 ? sup.products.join(", ") : "Belirtilmedi"}
                  </span>
                </div>
              </div>

              {/* AUDIT ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-mono">
                   ID: {sup.id.substring(0, 8)}... | {sup.lastAuditAt ? `Son denetim: ${new Date(sup.lastAuditAt).toLocaleDateString()}` : 'Denetlenmedi'}
                </span>
                
                <Button 
                  onClick={() => handleAudit(sup.id, sup.companyName)}
                  disabled={auditingId === sup.id}
                  variant={sup.trustScore > 0 ? "outline" : "default"}
                  size="sm"
                  className={`text-[10px] font-bold uppercase tracking-widest rounded-sm ${sup.trustScore === 0 ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                >
                  {auditingId === sup.id ? (
                    <><ScanFace className="w-3 h-3 mr-2 animate-spin" /> Yapay Zeka Denetliyor...</>
                  ) : (
                    <><ScanFace className="w-3 h-3 mr-2" /> {sup.trustScore > 0 ? "Yeniden Denetle" : "Müfettişi Çağır"}</>
                  )}
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

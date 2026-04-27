
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import { Globe, Search, Plus, ExternalLink, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


interface Domain {
  id: string;
  domain_name: string;
  sector: string;
  status: string;
  health_score: number;
  expiry_date: string;
  ssl_status: string;
  is_active: boolean;
}

export default function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [newDomain, setNewDomain] = useState({ name: "", sector: "Ev Tekstili" });

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    filterDomains();
  }, [searchQuery, sectorFilter, domains]);

  const loadDomains = async () => {
    try {
      const domainsCrud = new CrudOperations("domain_management");
      const data = await domainsCrud.findMany({}, {
        order: { column: "created_at", ascending: false }
      });
      setDomains(data);
      setFilteredDomains(data);
    } catch (error) {
      console.error("Domainler yüklenirken hata:", error);
      toast.error("Domainler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const filterDomains = () => {
    let filtered = [...domains];

    if (searchQuery) {
      filtered = filtered.filter((domain) =>
        domain.domain_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sectorFilter !== "all") {
      filtered = filtered.filter((domain) => domain.sector === sectorFilter);
    }

    setFilteredDomains(filtered);
  };

  const toggleDomainStatus = async (domainId: string, currentStatus: boolean) => {
    try {
      const domainsCrud = new CrudOperations("domain_management");
      await domainsCrud.update(domainId, { is_active: !currentStatus });
      toast.success("Domain durumu güncellendi");
      loadDomains();
    } catch (error) {
      console.error("Domain durumu güncellenirken hata:", error);
      toast.error("Durum güncellenemedi");
    }
  };

  const handleAutonomousActivation = async () => {
    if (!newDomain.name || !newDomain.sector) {
      toast.error("Domain adı ve sektör zorunludur.");
      return;
    }
    
    setIsActivating(true);
    toast.info("DomainMasterAgent uyanıyor. İskelet kuruluyor...");
    
    try {
      const res = await fetch("/api/domains/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: newDomain.name,
          sector: newDomain.sector,
          targetMarket: "Global",
          budget: 500
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Başarılı! ${newDomain.name} (SEO ve Planlama) aktif.`);
        loadDomains(); // Veritabanından güncel durumu çek
      } else {
        toast.error(`Aktivasyon Hatası: ${data.error}`);
      }
    } catch (e: any) {
      toast.error(`Bağlantı Hatası: ${e.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  const sectors = Array.from(new Set(domains.map((d) => d.sector)));

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (

    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-l-4 border-primary pl-4 py-2">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
            Domain Portföyü
          </h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">
            Stratejik Dijital Varlık Yönetimi
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-none font-bold uppercase tracking-wider px-6 h-12">
              <Plus className="h-4 w-4 mr-2" />
              Otonom Varlık Kurulumu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white border-2 border-emerald-900 rounded-none text-emerald-600">
            <DialogHeader>
              <DialogTitle className="uppercase font-black tracking-widest flex items-center">
                <Globe className="mr-2" /> DomainMaster İmparatorluk Motoru
              </DialogTitle>
              <DialogDescription className="text-emerald-500/70">
                SEO iskeletini, iş modelini ve federasyon entegrasyonlarını saniyeler içinde otonom olarak inşa eder.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="domainName" className="text-right uppercase text-xs font-bold text-emerald-600">Domain (.ai vb)</Label>
                <Input
                  id="domainName"
                  className="col-span-3 rounded-none border-2 border-emerald-900 bg-emerald-950/20 text-emerald-600 focus-visible:ring-emerald-500 font-mono"
                  value={newDomain.name}
                  onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                  placeholder="hometex.ai"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector" className="text-right uppercase text-xs font-bold text-emerald-600">Sektör</Label>
                <Input
                  id="sector"
                  className="col-span-3 rounded-none border-2 border-emerald-900 bg-emerald-950/20 text-emerald-600 focus-visible:ring-emerald-500"
                  value={newDomain.sector}
                  onChange={(e) => setNewDomain({ ...newDomain, sector: e.target.value })}
                  placeholder="Ev Tekstili"
                />
              </div>
            </div>
            <Button 
                onClick={handleAutonomousActivation} 
                className="w-full rounded-none font-black tracking-widest uppercase bg-emerald-600 hover:bg-emerald-500 text-slate-900 border-2 border-emerald-400"
                disabled={isActivating}
            >
              {isActivating ? "MOTOR ÇALIŞIYOR..." : "OTONOM İNŞAAT BAŞLAT"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-none border-2 border-foreground/10 hover:border-primary transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Toplam Varlık</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">{domains.length}</div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-2 border-foreground/10 hover:border-primary transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aktif Durum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-primary">
              {domains.filter((d) => d.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-2 border-foreground/10 hover:border-primary transition-colors">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Analizi (Ort.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">
              {domains.length > 0
                ? Math.round(domains.reduce((acc, d) => acc + (d.health_score || 0), 0) / domains.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-2 border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">Sektörel Yayılım</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">{sectors.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-2 border-foreground/10">
        <CardHeader className="flex flex-row items-center space-x-4 space-y-0 pb-6 border-b">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="VARLIK ARA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-none border-none bg-muted/50 font-bold uppercase text-xs tracking-wider h-11 focus-visible:ring-0 focus-visible:bg-muted"
            />
          </div>
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[200px] rounded-none border-none bg-muted/50 font-bold uppercase text-xs tracking-wider h-11">
              <SelectValue placeholder="SEKTÖR" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2">
              <SelectItem value="all">TÜM SEKTÖRLER</SelectItem>
              {sectors.filter(Boolean).map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {(sector || '').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y-2 divide-foreground/5">
              {filteredDomains.map((domain) => (
                <div key={domain.id} className="p-6 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-foreground/5 p-2 rounded-none group-hover:bg-primary/10 transition-colors">
                          <Globe className="h-4 w-4 text-foreground/70 group-hover:text-primary" />
                        </div>
                        <span className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                          {domain.domain_name}
                        </span>
                        <div className="h-4 w-[2px] bg-foreground/10" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {domain.sector}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Statü:</span>
                          <span className={domain.is_active ? "text-primary" : "text-muted-foreground"}>
                            {domain.is_active ? "AKTİF" : "PASİF"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Durum:</span>
                          <span>{domain.status}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">Sağlık:</span>
                          <span className={getHealthColor(domain.health_score)}>
                            %{domain.health_score}
                          </span>
                        </div>
                        {domain.expiry_date && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Bitiş:</span>
                            <span>{new Date(domain.expiry_date).toLocaleDateString("tr-TR")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="rounded-none border-2 font-bold uppercase text-[10px] tracking-widest h-9" asChild>
                        <a href={`https://${domain.domain_name}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          İncele
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

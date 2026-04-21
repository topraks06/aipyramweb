"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Factory, FileText, Handshake, Zap } from "lucide-react";
import { AgentTerminal, LogEntry } from "@/components/shared/AgentTerminal";

export default function B2BSimulator() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [rfqId, setRfqId] = useState<string>("");
    const [matchLoading, setMatchLoading] = useState(false);
    const [activeStream, setActiveStream] = useState<LogEntry[]>([]);
    
    // Step 1: RFQ Oluşturma
    const triggerRFQ = () => {
        setRfqId("RFQ_" + Math.random().toString(36).substr(2, 9).toUpperCase());
        toast.success("Alıcı Talebi (RFQ) Otonom Olarak Oluşturuldu.");
        setStep(2);
    };

    // Step 2: Matchmaker (Tedarikçi Eşleştirme)
    const triggerMatchmaker = async () => {
        setMatchLoading(true);
        const tf = () => new Date().toISOString().substring(11, 19);
        
        let logs: LogEntry[] = [{ id: '1', agent: 'INTENT_GUARD', message: 'Sürü devreye girdi. Kriterler analiz ediliyor...', status: 'info', timestamp: tf() }];
        setActiveStream([...logs]);
        
        const steps = [
           { agent: 'SEARCHER', message: 'Veritabanında 42 fabrika bulundu.', status: 'info' as const },
           { agent: 'AUDITOR', message: 'Kalite, güven ve kapasite puanlarına göre sıralanıyor...', status: 'info' as const },
           { agent: 'CRITIC', message: '12 fabrika kapasite yetersizliğinden elendi.', status: 'warning' as const },
           { agent: 'MASTER_CORE', message: 'Neural-net analizi: En uygun 3 global fabrika tespit edildi.', status: 'success' as const }
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 700));
            logs.push({ id: `step-${i}`, ...steps[i], timestamp: tf() });
            setActiveStream([...logs]);
        }
        
        await new Promise(r => setTimeout(r, 800));
        logs.push({ id: 'fin', agent: 'SUCCESS', message: 'Eşleşme oranları: %98, %94, %91', status: 'success', timestamp: tf() });
        setActiveStream([...logs]);

        setTimeout(() => {
          setMatchLoading(false);
          toast.success("En Uygun 3 Tedarikçi Bulundu! Puan: %98 Eşleşme.");
          setStep(3);
        }, 1000);
    };

    // Step 3: Deal (Satış Müzakeresi & Anlaşma)
    const triggerDeal = () => {
        toast.success("Tedarikçi Teklifi Onaylandı. Deal (Anlaşma) Sağlandı!");
        setStep(4);
    };

    // Step 4: Fake Ödeme (Stripe Simülasyonu Mührü)
    const triggerPayment = () => {
        toast.success("Simülasyon Başarılı: Para Akışı Mühürlendi! (B2B Komisyon/Token Tahsil edildi).");
        // Reset after success
        setTimeout(() => setStep(1), 3000);
    };

    return (
        <Card className="corporate-card mt-6 border-indigo-500/30">
            <CardHeader className="pb-3 border-b border-border/10 bg-indigo-500/5">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
                    <Zap className="h-5 w-5" /> 
                    GOLDEN FLOW: 7-Günlük Savaş Planı (Aşama 1 - Simülasyon)
                </CardTitle>
                <CardDescription>
                    Gerçek ticaret motorunun (Core 1) kesintisiz akış kanıtıdır. Müşteri {'->'} RFQ {'->'} Match {'->'} Anlaşma {'->'} Nakit Akışı.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                    
                    {/* Background connection line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-muted-foreground/20 -z-10 -translate-y-1/2"></div>
                    
                    {/* Adım 1: RFQ */}
                    <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border bg-background transition-all ${step >= 1 ? 'border-primary shadow-lg shadow-primary/10' : 'border-border/50 opacity-50'}`}>
                        <div className={`p-3 rounded-full ${step >= 1 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <FileText size={24} />
                        </div>
                        <h4 className="font-bold text-sm">1. Müşteri RFQ</h4>
                        <Button size="sm" variant={step === 1 ? "default" : "outline"} onClick={triggerRFQ} disabled={step !== 1}>
                            Talebi Yarat
                        </Button>
                    </div>

                    <ArrowRight className="hidden md:block text-muted-foreground shrink-0" />

                    {/* Adım 2: Matchmaker */}
                    <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border bg-background transition-all ${step >= 2 ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-border/50 opacity-50'}`}>
                        <div className={`p-3 rounded-full ${step >= 2 ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                            <Factory size={24} />
                        </div>
                        <h4 className="font-bold text-sm">2. AI Matchmaker</h4>
                        
                        {(matchLoading || activeStream.length > 0) && (
                            <div className="absolute top-full left-0 mt-2 z-50 w-80">
                                <AgentTerminal logs={activeStream} isActive={matchLoading} title="MATCH_SIMULATOR" />
                            </div>
                        )}
                        
                        {!matchLoading && (
                          <Button size="sm" variant={step === 2 ? "default" : "outline"} className={step === 2 ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={triggerMatchmaker} disabled={step !== 2}>
                              Tedarikçi Bul
                          </Button>
                        )}
                    </div>

                    <ArrowRight className="hidden md:block text-muted-foreground shrink-0" />

                    {/* Adım 3: Deal */}
                    <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border bg-background transition-all ${step >= 3 ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-border/50 opacity-50'}`}>
                        <div className={`p-3 rounded-full ${step >= 3 ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                            <Handshake size={24} />
                        </div>
                        <h4 className="font-bold text-sm">3. Deal Kapanışı</h4>
                        <Button size="sm" variant={step === 3 ? "default" : "outline"} className={step === 3 ? "bg-amber-600 hover:bg-amber-700" : ""} onClick={triggerDeal} disabled={step !== 3}>
                            Müzakere Onayı
                        </Button>
                    </div>

                    <ArrowRight className="hidden md:block text-muted-foreground shrink-0" />

                    {/* Adım 4: Nakit Akışı */}
                    <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border bg-background transition-all ${step >= 4 ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-border/50 opacity-50'}`}>
                        <div className={`p-3 rounded-full ${step >= 4 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="font-bold text-sm">4. Nakit Kalkanı</h4>
                        <Button size="sm" variant={step === 4 ? "default" : "outline"} className={step === 4 ? "bg-emerald-600 hover:bg-emerald-700" : ""} onClick={triggerPayment} disabled={step !== 4}>
                            Ödeme Al (Simüle Et)
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}

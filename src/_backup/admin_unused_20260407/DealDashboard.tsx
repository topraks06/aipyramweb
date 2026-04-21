"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Handshake, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Deal {
  id: string;
  rfqId: string;
  supplierId: string;
  status: string;
  negotiatedPrice: number;
  commissionRate: number;
}

export default function DealDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch deals", e);
      toast.error("Anlaşmalar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white gap-1"><CheckCircle2 className="h-3 w-3" /> Kazanıldı</Badge>;
      case "expired":
        return <Badge className="bg-red-500 text-white gap-1"><AlertCircle className="h-3 w-3" /> Kaybedildi</Badge>;
      case "negotiation":
      default:
        return <Badge className="bg-blue-500 text-white gap-1"><Handshake className="h-3 w-3" /> Müzakere</Badge>;
    }
  };

  const calculateTotalCommission = () => {
    return deals
        .filter(d => d.status === "completed")
        .reduce((sum, d) => sum + (d.negotiatedPrice * d.commissionRate), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Anlaşma ve Komisyon Paneli (Deal Funnel)
          </h2>
          <p className="text-sm text-muted-foreground">Aktif müzakereler, ciro ve dönüşüm metrikleri</p>
        </div>
        <div className="text-right">
            <h3 className="text-sm font-semibold text-muted-foreground">TOPLAM HAK EDİŞ</h3>
            <span className="text-3xl font-black text-green-600">${calculateTotalCommission().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-accent/50">
              <TableRow>
                <TableHead>Deal ID</TableHead>
                <TableHead>RFQ</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Hacim</TableHead>
                <TableHead className="text-right">Komisyon (%3)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Yükleniyor...</TableCell>
                </TableRow>
              ) : deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Bekleyen veya tamamlanan anlaşma bulunamadı.</TableCell>
                </TableRow>
              ) : deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium text-xs font-mono">{deal.id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-xs font-mono">{deal.rfqId.slice(0, 8)}...</TableCell>
                  <TableCell className="text-xs">{deal.supplierId.slice(0, 8)}...</TableCell>
                  <TableCell>{getStatusBadge(deal.status)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${deal.negotiatedPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    ${(deal.negotiatedPrice * deal.commissionRate).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

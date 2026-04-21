
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import { Layers, TrendingUp, Bot, Globe } from "lucide-react";
import { toast } from "sonner";

interface SectorStats {
  name: string;
  agents: number;
  domains: number;
  tasks: number;
  activeAgents: number;
}

export default function SectorManagement() {
  const [sectors, setSectors] = useState<SectorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const agentsCrud = new CrudOperations("ai_agents");
      const tasksCrud = new CrudOperations("agent_tasks");

      const [agents, tasks] = await Promise.all([
        agentsCrud.findMany(),
        tasksCrud.findMany(),
      ]);

      const sectorMap = new Map<string, SectorStats>();

      agents.forEach((agent: any) => {
        const sector = agent.sector || "Diğer";
        
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, {
            name: sector,
            agents: 0,
            domains: 0,
            tasks: 0,
            activeAgents: 0,
          });
        }

        const stats = sectorMap.get(sector)!;
        stats.agents += 1;
        if (agent.is_active) stats.activeAgents += 1;
        if (agent.assigned_domains) {
          stats.domains += agent.assigned_domains.length;
        }
      });

      tasks.forEach((task: any) => {
        const sector = task.sector || "Diğer";
        if (sectorMap.has(sector)) {
          sectorMap.get(sector)!.tasks += 1;
        }
      });

      const sectorList = Array.from(sectorMap.values()).sort((a, b) => b.agents - a.agents);
      setSectors(sectorList);
    } catch (error) {
      console.error("Sektörler yüklenirken hata:", error);
      toast.error("Sektörler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const sectorIcons: Record<string, any> = {
    "E-Ticaret": Globe,
    "Fintech": TrendingUp,
    "Sağlık": Bot,
    "Eğitim": Layers,
    "Gayrimenkul": Globe,
    "Turizm": Globe,
    "Lojistik": TrendingUp,
    "Medya": Layers,
    "Teknoloji": Bot,
    "Perakende": Globe,
    "Üretim": TrendingUp,
    "Diğer": Layers,
  };

  return (
    <div className="space-y-6">
      <Card className="glass-strong">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Layers className="h-6 w-6 mr-2 text-primary" />
            Sektör Yönetimi
          </CardTitle>
          <CardDescription>
            12 farklı sektörde otonom operasyonlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Aktif Sektör</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sectors.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Ajan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sectors.reduce((sum, s) => sum + s.agents, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {sectors.reduce((sum, s) => sum + s.domains, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((sector) => {
          const Icon = sectorIcons[sector.name] || Layers;
          
          return (
            <Card key={sector.name} className="glass-swiss hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Icon className="h-5 w-5 mr-2 text-primary" />
                    {sector.name}
                  </CardTitle>
                  <Badge variant="default">
                    {sector.activeAgents}/{sector.agents}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ajanlar</span>
                  <span className="font-semibold">{sector.agents}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Domainler</span>
                  <span className="font-semibold">{sector.domains}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Görevler</span>
                  <span className="font-semibold">{sector.tasks}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Aktif Oran</span>
                    <span className="font-semibold text-green-500">
                      {sector.agents > 0 
                        ? Math.round((sector.activeAgents / sector.agents) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

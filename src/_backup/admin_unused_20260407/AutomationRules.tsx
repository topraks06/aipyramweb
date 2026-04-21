
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import { Plus, Play, Pause, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutomationRule {
  id: string;
  rule_name: string;
  description: string;
  trigger_type: string;
  action_type: string;
  target_sector: string;
  priority: string;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string;
}

export default function AutomationRules() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const crud = new CrudOperations("automation_rules");
      const data = await crud.findMany({}, {
        order: { column: "created_at", ascending: false }
      });
      setRules(data);
    } catch (error) {
      console.error("Otomasyon kuralları yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Otomasyon kuralları yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRule = async (id: string, currentStatus: boolean) => {
    try {
      const crud = new CrudOperations("automation_rules");
      await crud.update(id, { is_active: !currentStatus });
      await loadRules();
      toast({
        title: "Başarılı",
        description: `Kural ${!currentStatus ? "etkinleştirildi" : "devre dışı bırakıldı"}`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kural durumu güncellenemedi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Otomasyon Kuralları</h2>
          <p className="text-muted-foreground">
            Aloha tarafından yönetilen otomatik görev kuralları
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kural
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Yükleniyor...
            </CardContent>
          </Card>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Henüz otomasyon kuralı bulunmuyor
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="glass-strong">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {rule.rule_name}
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleRule(rule.id, rule.is_active)}
                    >
                      {rule.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tetikleyici:</span>
                    <p className="font-medium">{rule.trigger_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aksiyon:</span>
                    <p className="font-medium">{rule.action_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sektör:</span>
                    <p className="font-medium">{rule.target_sector || "Tümü"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Çalıştırma:</span>
                    <p className="font-medium">{rule.execution_count} kez</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

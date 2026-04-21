
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import { CheckCircle2, Clock, AlertCircle, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  priority: string;
  status: string;
  sector: string;
  agent_id: string;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, statusFilter, priorityFilter, tasks]);

  const loadTasks = async () => {
    try {
      const tasksCrud = new CrudOperations("agent_tasks");
      const data = await tasksCrud.findMany({}, {
        limit: 100,
        order: { column: "created_at", ascending: false }
      });
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      console.error("Görevler yüklenirken hata:", error);
      toast.error("Görevler yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.task_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      pending: { variant: "secondary", label: "Bekliyor", icon: Clock },
      running: { variant: "default", label: "Çalışıyor", icon: RefreshCw },
      completed: { variant: "default", label: "Tamamlandı", icon: CheckCircle2 },
      failed: { variant: "destructive", label: "Başarısız", icon: AlertCircle },
      cancelled: { variant: "outline", label: "İptal", icon: AlertCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      low: { variant: "outline", label: "Düşük" },
      medium: { variant: "secondary", label: "Orta" },
      high: { variant: "default", label: "Yüksek" },
      critical: { variant: "destructive", label: "Kritik" },
    };

    const config = variants[priority] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-strong">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <CheckCircle2 className="h-6 w-6 mr-2 text-primary" />
                Görev Yönetimi
              </CardTitle>
              <CardDescription>
                Ajan görevlerini izleyin ve yönetin
              </CardDescription>
            </div>
            <Button onClick={loadTasks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="running">Çalışıyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Öncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Öncelikler</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Toplam</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Bekliyor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {tasks.filter((t) => t.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Çalışıyor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {tasks.filter((t) => t.status === "running").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tamamlandı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {tasks.filter((t) => t.status === "completed").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Başarısız</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {tasks.filter((t) => t.status === "failed").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Görev Listesi</CardTitle>
          <CardDescription>
            {filteredTasks.length} görev gösteriliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold">{task.task_name}</span>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Tip: {task.task_type} • Sektör: {task.sector || "Genel"}
                      </div>
                      {task.error_message && (
                        <div className="text-sm text-red-500 mt-2">
                          Hata: {task.error_message}
                        </div>
                      )}
                      {task.retry_count > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Yeniden deneme: {task.retry_count}/{task.max_retries}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Oluşturulma: {new Date(task.scheduled_at).toLocaleString("tr-TR")}
                    </span>
                    {task.completed_at && (
                      <span>
                        Tamamlanma: {new Date(task.completed_at).toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

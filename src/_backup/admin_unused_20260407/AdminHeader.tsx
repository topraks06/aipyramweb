
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, Home, Activity, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Sovereign Cookie'yi patlatıyoruz (Supabase YOK)
      document.cookie = "aipyram_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success("Command Center connection terminated.");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Failed to disconnect securely.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/98 backdrop-blur-xl supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-3 group">
              {/* Swiss-inspired logo mark */}
              <div className="bg-primary p-1.5 rounded-none group-hover:bg-primary/90 transition-colors">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black leading-none tracking-tighter text-foreground uppercase">
                  Aipyram
                </span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
                  Neural Protocol v2.1
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-6 w-px bg-foreground/10" />

            {/* System Status */}
            <div className="hidden md:flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                System Active
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/aloha")}
              className="text-primary font-black text-[10px] uppercase tracking-wider h-8"
            >
              <Activity className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
              Aloha
            </Button>
            <div className="h-4 w-px bg-foreground/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-[10px] uppercase tracking-wider font-bold h-8"
            >
              <Home className="h-3.5 w-3.5 mr-1.5" />
              Home
            </Button>
            <ThemeToggle />
            <div className="h-4 w-px bg-foreground/10" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-[10px] uppercase tracking-wider font-bold h-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

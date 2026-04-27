'use client';

import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, ArrowRight, LayoutDashboard, ShieldCheck, Box } from 'lucide-react';

export default function UnifiedSovereignDashboard() {
  const { user, loading, role } = useSovereignAuth('aipyram' as any);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h1 className="text-2xl font-bold tracking-tight mb-2">Erişim Reddedildi</h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Sovereign sistemine erişmek için lütfen giriş yapın.
        </p>
        <Button onClick={() => router.push('/aipyram/login')} variant="outline">
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Sovereign OS</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hoş geldin, {user.displayName || user.email} — Tüm projelerini buradan yönetebilirsin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-xs font-semibold text-primary capitalize flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Rol: {role}
            </div>
            {role === 'admin' && (
              <Button onClick={() => router.push('/admin')} variant="destructive" size="sm">
                MasterKokpit'e Geç
              </Button>
            )}
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* TRTex */}
          <Card className="bg-zinc-950 border-zinc-800 hover:border-amber-500/50 transition-colors group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-500">TRTex.com</CardTitle>
                <Globe className="h-5 w-5 text-amber-500/50 group-hover:text-amber-500 transition-colors" />
              </div>
              <CardDescription>B2B İstihbarat & İhale Ağı</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Sektörel haberlere göz atın, açık ihalelere teklif verin ve global alıcılarla eşleşin.
              </p>
              <Button className="w-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black" onClick={() => router.push('/tr')}>
                Terminal'i Aç <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Perde.ai */}
          <Card className="bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 transition-colors group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-emerald-500">Perde.ai</CardTitle>
                <LayoutDashboard className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
              </div>
              <CardDescription>Otonom Tasarım & Render Motoru</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Müşterilerinizin mekanlarında kumaşlarınızı anında 3D olarak giydirin ve B2B fiyatlandırın.
              </p>
              <Button className="w-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black" onClick={() => window.open('https://perde.ai', '_blank')}>
                Stüdyo'ya Git <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Icmimar.ai */}
          <Card className="bg-zinc-950 border-zinc-800 hover:border-blue-500/50 transition-colors group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-500">İcmimar.ai</CardTitle>
                <Box className="h-5 w-5 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
              </div>
              <CardDescription>Master Design Engine & ERP</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Mimarlar, mobilyacılar ve iç mimarlar için entegre B2B ERP ve profesyonel tasarım mutfağı.
              </p>
              <Button className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={() => window.open('https://icmimar.ai', '_blank')}>
                ERP'yi Aç <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

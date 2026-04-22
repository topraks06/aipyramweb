import React from 'react';
import { Radar, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getRadarNews } from '@/core/intel/news-reader';

export async function FarEastRadar() {
  const allRadar = await getRadarNews();
  let radarItems = allRadar ? allRadar.filter((n: any) => n.category === 'Radar Alert').slice(0, 3) : [];

  // ZERO-MOCK: Radar verisi yoksa bileşen render edilmez
  if (!radarItems || radarItems.length === 0) {
    return null;
  }


  const mainAlert = radarItems[0];
  const metrics = radarItems.slice(1, 3); // next 2 metrics

  return (
    <section className="bg-white py-12 font-sans overflow-hidden my-12 border-y border-border relative">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1600px] relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-black p-2 shadow-sm">
              <Radar className="w-5 h-5 animate-spin-slow" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-black tracking-widest uppercase text-foreground">UZAKDOĞU B2B RADARI</h2>
              <p className="text-secondary font-mono text-[10px] uppercase tracking-widest mt-1 opacity-80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                ACTIVE MONITORING: CN, VN, IN
              </p>
            </div>
          </div>
          <Link href="/radar" className="hidden md:inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-foreground border border-border px-4 py-2 hover:bg-neutral-50 transition-colors">
            TÜM RADAR UYARILARI
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Alert / Context */}
          {mainAlert && (
            <Link href={`/news/${mainAlert.slug}`} className="lg:col-span-2 bg-neutral-50 border border-neutral-200 p-6 flex flex-col justify-between group hover:border-yellow-500/50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-600 w-5 h-5" />
                  <span className="text-[10px] font-bold text-yellow-600 tracking-widest uppercase">STRATEJİK UYARI</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black font-serif text-foreground mb-4 leading-snug group-hover:text-secondary transition-colors">
                  {mainAlert.title || "Lojistik & Kapasite Sinyali Alındı"}
                </h3>
                <p className="text-neutral-600 font-serif text-[15px] leading-relaxed mb-6">
                  {mainAlert.summary || `AIPYRAM motoruna düşen son sinyallere göre Asya navlun ve üretim kapasitelerinde kritik değişimler izleniyor.`}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-auto">
                <span className="text-neutral-500 font-mono text-[10px] uppercase">GÜVEN: %{((mainAlert.trust_score || 0.92) * 100).toFixed(0)} ({(mainAlert.trust_score || 0.92) > 0.8 ? 'YÜKSEK' : 'ORTA'})</span>
                <div className="flex items-center gap-3">
                  <span className="bg-red-50 text-red-600 font-bold px-2 py-1 text-[10px] border border-red-200 uppercase tracking-widest">
                    AKSIYON: {mainAlert.ai_action || 'TAKİP ET'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                </div>
              </div>
            </Link>
          )}

          {/* Metrics */}
          {metrics.map((metricItem, i) => (
            <Link key={metricItem.id || i} href={`/news/${metricItem.slug}`} className="bg-white border border-neutral-200 group hover:border-secondary transition-colors overflow-hidden flex flex-col">
              <div className="aspect-video w-full overflow-hidden relative">
                {metricItem.image_url ? (
                  <img src={metricItem.image_url.startsWith('http') ? metricItem.image_url : `/images/${metricItem.image_url}`} alt={metricItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                    <Radar className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-mono tracking-widest">
                  {i === 0 ? "ENDEKS: SCFI" : "KAPASİTE (CN)"}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-1 line-clamp-2 leading-relaxed">
                    {metricItem.title}
                  </h4>
                  <p className="text-neutral-600 font-serif text-[13px] leading-relaxed mt-3 line-clamp-3">
                    {metricItem.summary}
                  </p>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}

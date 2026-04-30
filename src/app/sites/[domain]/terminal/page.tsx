import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import B2BActionPanel from '@/components/trtex/B2BActionPanel';

export const dynamic = 'force-dynamic';

async function getTerminalData() {
  if (!adminDb) return { news: [], ticker: [] };

  try {
    // Gerçek haberler — trtex_news koleksiyonundan son 5 haber
    const newsSnap = await adminDb.collection('trtex_news')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const news = newsSnap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.translations?.TR?.title || d.title || '',
        summary: d.translations?.TR?.summary || d.summary || '',
        category: d.category || 'İSTİHBARAT',
        createdAt: d.createdAt || '',
        type: d.type || 'NEWS',
        isUGC: d.isUGC || false,
      };
    });

    // Ticker verileri — trtex_ticker_cache koleksiyonundan
    const tickerSnap = await adminDb.collection('trtex_ticker_cache')
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get();

    const ticker = tickerSnap.empty ? [] : (tickerSnap.docs[0].data()?.items || []);

    return { news, ticker };
  } catch (err) {
    console.error('[TERMINAL] Veri çekme hatası:', err);
    return { news: [], ticker: [] };
  }
}

export default async function TerminalPage({ params }: { params: { domain: string } }) {
  if (!params.domain.includes('trtex')) {
    return notFound();
  }

  const { news, ticker } = await getTerminalData();
  const hasNews = news.length > 0;

  // Zaman damgası formatlayıcı
  const formatTime = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 60) return `${diffMin} DK ÖNCE`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} SAAT ÖNCE`;
      return `${Math.floor(diffHr / 24)} GÜN ÖNCE`;
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex flex-col">
      {/* Top Ticker Bar */}
      <div className="w-full bg-black border-b border-[#333]">
        <IntelligenceTicker items={ticker} />
      </div>

      {/* TRTEX-style Terminal Header */}
      <header className="p-4 border-b border-[#333] flex justify-between items-end bg-[#0a0a0a]">
        <div>
          <h1 className="text-2xl font-bold text-[#f5a623] tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            TRTEX SOVEREIGN TERMINAL
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Global Textile Intelligence & Trading Desk</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-green-500 font-bold">SYSTEM ONLINE</p>
          <p>{new Date().toUTCString()}</p>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="flex-grow p-4 grid grid-cols-12 gap-4 h-full">
        {/* Left Column: Bilgilendirme */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="border border-[#333] bg-[#0a0a0a] rounded-sm p-3">
            <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-3">Piyasa Verileri</h2>
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-2">Canlı piyasa verileri yakında aktif edilecek.</p>
              <p className="text-xs text-gray-600">Pamuk, Polyester, Navlun endeksleri gerçek zamanlı olarak burada görüntülenecek.</p>
            </div>
          </div>

          <div className="border border-[#333] bg-[#0a0a0a] rounded-sm p-3 flex-grow">
            <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-3">Hedef Pazarlar</h2>
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-2">Döviz kurları yakında aktif edilecek.</p>
              <p className="text-xs text-gray-600">EUR/TRY, USD/TRY ve diğer pariteler canlı olarak izlenecek.</p>
            </div>
          </div>
        </div>

        {/* Center Column: Gerçek Haber Akışı */}
        <div className="col-span-12 lg:col-span-6 border border-[#333] bg-[#0a0a0a] rounded-sm p-4 relative overflow-hidden">
          <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-4">ALOHA Live News Feed</h2>
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10 pointer-events-none mt-16" />

          <div className="space-y-6 overflow-y-auto h-full pb-20 pr-2">
            {hasNews ? news.map((item, i) => {
              const borderColor = item.type === 'TENDER' ? 'border-red-500' 
                : item.isUGC ? 'border-yellow-500' 
                : i === 0 ? 'border-red-500' 
                : 'border-gray-600';
              const labelColor = item.type === 'TENDER' ? 'text-red-500' 
                : item.isUGC ? 'text-yellow-500' 
                : i === 0 ? 'text-red-500' 
                : 'text-gray-500';
              const label = item.type === 'TENDER' ? '🚨 İHALE' 
                : item.isUGC ? '⚡ B2B SİNYAL' 
                : i === 0 ? '🚨 SON DAKİKA' 
                : '📡 İSTİHBARAT';

              return (
                <div key={item.id} className={`border-l-2 ${borderColor} pl-3`}>
                  <p className={`text-xs ${labelColor} font-bold mb-1`}>
                    {label} | {formatTime(item.createdAt)}
                  </p>
                  <h3 className="text-white text-lg font-bold">{item.title}</h3>
                  {item.summary && (
                    <p className="text-gray-400 text-sm mt-1">{item.summary}</p>
                  )}
                  {item.category && (
                    <div className="flex gap-2 mt-2">
                      <span className="bg-[#222] text-xs px-2 py-1 rounded">#{item.category}</span>
                    </div>
                  )}
                </div>
              );
            }) : (
              /* Firestore'da henüz haber yoksa — bilgilendirme (FOMO) */
              <div className="text-center py-12">
                <div className="text-3xl mb-3">📡</div>
                <h3 className="text-[#f5a623] text-lg font-bold mb-2">Otonom İstihbarat Motoru Çalışıyor</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                  ALOHA AI şu an küresel tekstil kaynaklarını tarıyor ve doğrulanmış istihbarat bültenlerini hazırlıyor. İlk bültenler kısa süre içinde bu terminalde yayınlanacak.
                </p>
                <p className="text-gray-600 text-xs mt-4">
                  Siz de sağdaki panelden B2B taleplerinizi sisteme girebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: UGC B2B Action Panel (Otonom İstihbarat Üretimi) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col h-full">
          <B2BActionPanel brandName={params.domain.split('.')[0].toUpperCase()} basePath={`/sites/${params.domain}`} />
        </div>
      </div>
    </div>
  );
}

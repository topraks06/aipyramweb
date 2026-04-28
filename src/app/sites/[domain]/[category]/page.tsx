import { adminDb } from '@/lib/firebase-admin';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import { Metadata } from 'next';

// ANAYASA: Zero-Cache — Firestore'dan canlı veri çeken her sayfa dinamik olmalı
export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ domain: string, category: string }>;
  searchParams: Promise<{ lang?: string }>;
};

// Basitleştirilmiş Otonom Payload Çekimi (Kategori Sayfası İçin)
async function fetchAlohaCategoryPayload(projectName: string, category: string, currentPage: number, limitCount: number) {
  let tickerData: any = null;
  try {
    const tickerDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
    if (tickerDoc.exists) tickerData = tickerDoc.data();
  } catch (e) {}

  const tickerItems: any[] = [];
  if (tickerData?.forex?.usd_try?.value) tickerItems.push({ id: 'usdtry', type: 'fx_energy', label: 'USD/TRY', value: tickerData.forex.usd_try.value, unit: '₺', change: tickerData.forex.usd_try.change || 0, direction: tickerData.forex.usd_try.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.95 });
  if (tickerData?.forex?.eur_try?.value) tickerItems.push({ id: 'eurtry', type: 'fx_energy', label: 'EUR/TRY', value: tickerData.forex.eur_try.value, unit: '₺', change: tickerData.forex.eur_try.change || 0, direction: tickerData.forex.eur_try.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.9 });
  if (tickerData?.commodities) {
    for (const [key, val] of Object.entries(tickerData.commodities) as [string, any][]) {
      if (val?.value) tickerItems.push({ id: key, type: 'commodity', label: key.toUpperCase(), value: val.value, unit: '', change: val.change || 0, direction: val.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.8 });
    }
  }

  try {
    const recentNewsSnap = await adminDb.collection(`${projectName}_news`).where("status", "==", "published").orderBy("createdAt", "desc").limit(5).get();
    recentNewsSnap.docs.forEach(doc => {
      const data = doc.data();
      tickerItems.push({
        id: doc.id,
        type: 'news_event',
        label: data.category || 'BRK',
        value: data.ai_ceo_block?.priority_level ? data.ai_ceo_block.priority_level.split('-')[0] : 'LIVE',
        direction: 'up',
        severity: 'attention',
        timestamp: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
        isBreaking: true,
        newsHeadline: data.title
      });
    });
  } catch (e) {}

  let menuConfig = [
    { id: 'haberler', label: 'HABERLER', slug: 'news', subItems: [
      { id: 'guncel', label: 'Son Haberler', slug: 'news' },
      { id: 'radar', label: 'Dünya Radarı', slug: 'radar' },
      { id: 'analiz', label: 'Pazar Analizi', slug: 'analysis' }
    ]},
    { id: 'ihaleler', label: 'İHALELER', slug: 'tenders', subItems: [
      { id: 'canli', label: 'Canlı İhaleler', slug: 'tenders' },
      { id: 'stok', label: 'Stok Fırsatları', slug: 'tenders?filter=HOT_STOCK' }
    ]},
    { id: 'ticaret', label: 'TİCARET', slug: 'trade', subItems: [
      { id: 'firsatlar', label: 'Ticari Fırsatlar', slug: 'opportunities' }
    ]},
    { id: 'akademi', label: 'AKADEMİ', slug: 'academy', subItems: [
      { id: 'egitim', label: 'Sektör Eğitimi', slug: 'academy' }
    ]}
  ];

  try {
    const payloadDoc = await adminDb.collection(`${projectName}_intelligence`).doc('terminal_payload').get();
    if (payloadDoc.exists && payloadDoc.data()?.menuConfig) {
      menuConfig = payloadDoc.data()?.menuConfig;
    }
  } catch (e) {}

  // Otonom Pagination Algoritması
  let categoryNews: any[] = [];
  const offsetCalc = currentPage === 1 ? 0 : 30 + ((currentPage - 2) * 60);
  
  let collectionName = `${projectName}_news`;
  
  try {
    // ═══ OTONOM KOLEKSİYON ROUTING (INDEX POINTER MİMARİSİ) ═══
    let isIndexCollection = false;
    const lowSlug = category.toLowerCase();
    
    if (lowSlug === 'radar') { collectionName = `${projectName}_radar`; isIndexCollection = true; }
    else if (lowSlug === 'academy') { collectionName = `${projectName}_academy`; isIndexCollection = true; }
    else if (lowSlug === 'opportunities' || lowSlug === 'firsatlar') { collectionName = `${projectName}_opportunities`; isIndexCollection = true; }
    
    let query: any = adminDb.collection(collectionName);
    
    if (isIndexCollection) {
      // 1) İlgili index (radar/academy) koleksiyonundan "pointer" ID'lerini çek
      const pointerSnap = await query.orderBy("createdAt", "desc").offset(offsetCalc).limit(limitCount).get();
      const pointerIds = pointerSnap.docs.map((doc: any) => doc.id); // ref_id === doc.id
      
      if (pointerIds.length > 0) {
        // 2) MASTER Koleksiyondan verileri çek (IN query max 30 destekler, limitCount <= 60 uyarı: array parçalama yap)
        const batches = [];
        for (let i = 0; i < pointerIds.length; i += 30) {
           const chunk = pointerIds.slice(i, i + 30);
           const batchQuery = adminDb.collection(`${projectName}_news`).where("__name__", "in", chunk).get();
           batches.push(batchQuery);
        }
        
        const results = await Promise.all(batches);
        const resolvedDocs = results.flatMap((snap: any) => snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        
        // 3) Sıralamayı (createdAt descending) korumak için pointer ID sırasına göre mapping yap
        categoryNews = pointerIds.map((pid: string) => resolvedDocs.find((d: any) => d.id === pid)).filter(Boolean);
      }
    } else {
      // MASTER KOLEKSİYON (Standart Haber / Sektör Filtreleme)
      query = query.where("status", "==", "published");
      
      if (lowSlug !== 'haberler' && lowSlug !== 'news' && lowSlug !== 'guncel') {
        const catMap: Record<string, string[]> = {
            'perde': ['PERDE'],
            'ev-tekstili': ['EV TEKSTİLİ'],
            'dosemelik': ['DÖŞEMELİK'],
            'dekorasyon': ['DEKORASYON'],
            'iplik': ['İPLİK', 'IP', 'HAMMADDE']
        };
        const mappedCats = catMap[lowSlug] || [category.toUpperCase()];
        query = query.where("category", "in", mappedCats);
      }
      
      const newsSnap = await query.orderBy("createdAt", "desc").offset(offsetCalc).limit(limitCount).get();
      categoryNews = newsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }
  } catch (err) {
    console.error("[CATEGORY] Fetch Error:", err);
    try {
      if (collectionName === `${projectName}_news`) {
        const queryFallback = adminDb.collection(`${projectName}_news`).orderBy("createdAt", "desc");
        const newsSnap2 = await queryFallback.offset(offsetCalc).limit(limitCount).get();
        categoryNews = newsSnap2.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {}
  }

  // ═══ FALLBACK INTELLIGENCE (If Dynamic Data Fails) ═══
  const fallbackSlug = category.toLowerCase();
  if (categoryNews.length === 0) {
    if (fallbackSlug === 'academy') {
      categoryNews = [
        { id: 'acad-1', title: 'Küresel Tedarik Zinciri Yönetimi: 2026 Projeksiyonu', commercial_note: 'Tedarik zinciri risklerini minimize etmek için stratejik planlama rehberi.', createdAt: Date.now() - 3600000, category: 'EĞİTİM', slug: 'global-supply-chain-2026' },
        { id: 'acad-2', title: 'Tekstilde Sürdürülebilirlik ve Yeşil Mutabakat Uyum Süreci', commercial_note: 'AB ihracatçıları için kritik mevzuat ve uygulama adımları.', createdAt: Date.now() - 7200000, category: 'EĞİTİM', slug: 'sustainability-regulation' },
        { id: 'acad-3', title: 'B2B Dijital Pazarlama Stratejileri ve AI Entegrasyonu', commercial_note: 'Yapay zeka araçlarıyla ticaret ağınızı nasıl genişletirsiniz?', createdAt: Date.now() - 10800000, category: 'EĞİTİM', slug: 'b2b-digital-ai-strategies' }
      ];
    } else if (fallbackSlug === 'opportunities' || fallbackSlug === 'firsatlar') {
      categoryNews = [
        { id: 'opp-1', title: 'Orta Doğu Pazarında Lüks Ev Tekstili Talebi Artıyor', commercial_note: 'Bölgedeki projeler için yüksek kaliteli döşemelik kumaş arayışı.', createdAt: Date.now() - 3600000, category: 'FIRSAT', slug: 'middle-east-market-demand' },
        { id: 'opp-2', title: 'Slovenya ve Hırvatistan: Yeni Tedarik Rotası Analizi', commercial_note: 'Balkanlar üzerinden Avrupa lojistik operasyonlarında maliyet avantajı.', createdAt: Date.now() - 7200000, category: 'FIRSAT', slug: 'balkans-logistics-route' },
        { id: 'opp-3', title: 'Stratejik Stok Fazlası: Pamuklu İplik Alım Fırsatı', commercial_note: 'Uzak Doğu bazlı hammadde fiyatlarında geçici dalgalanma değerlendirilmeli.', createdAt: Date.now() - 10800000, category: 'FIRSAT', slug: 'cotton-yarn-stock-opportunity' }
      ];
    }
  }

  const activeMenu = menuConfig.find((m: any) => m.slug === category);
  const categoryTitle = activeMenu ? activeMenu.label : category.toUpperCase();

  return { tickerItems, menuConfig, categoryNews, categoryTitle, currentPage };
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams as Record<string, string | undefined>;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const category = resolvedParams.category;
  const lang = (resolvedSearch?.lang || "tr").toUpperCase();
  
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const titleCategory = category.replace('-', ' ').toUpperCase();
  
  return {
    title: `${brandName} — ${titleCategory} (${lang})`,
    description: `${brandName} B2B Intelligence Terminal — ${titleCategory} Haberleri ve Analizleri`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams as Record<string, string | undefined>;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const category = resolvedParams.category;
  const lang = resolvedSearch?.lang || "tr";
  
  // Pagination
  const currentPage = parseInt(resolvedSearch?.p || "1", 10);
  const limitCount = currentPage === 1 ? 30 : 60; // Asimetrik Sayfa Adedi

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  if (exactDomain.includes('icmimar')) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-serif text-zinc-900 mb-4">404</h1>
        <p className="text-zinc-500 max-w-md">Aradığınız sayfa B2B Master Design Engine sisteminde bulunmuyor.</p>
        <a href={`/sites/${exactDomain}`} className="mt-8 text-[#8B7355] font-bold uppercase tracking-widest text-[10px] border border-[#8B7355] px-6 py-3 rounded-md hover:bg-[#8B7355] hover:text-white transition-colors">Ana Sayfaya Dön</a>
      </div>
    );
  }

  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  const payload = await fetchAlohaCategoryPayload(projectName, category, currentPage, limitCount);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111', fontFamily: "'Inter', 'Helvetica', sans-serif" }}>

      {/* 1. TICKER */}
      {payload.tickerItems.length > 0 && <IntelligenceTicker items={payload.tickerItems} />}

      {/* 2. ORTAK NAVBAR */}
      <TrtexNavbar 
        basePath={basePath} 
        brandName={brandName} 
        lang={lang} 
        activePage={category === 'opportunities' ? 'trade' : category === 'academy' ? 'academy' : category === 'tenders' ? 'tenders' : 'news'} 
        theme="light" 
      />

      {/* 3. KATEGORİ HABER AKIŞI (ASİMETRİK TASARIM) */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '4px solid #111', paddingBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase', margin: 0 }}>
              {payload.categoryTitle}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0 0 0', fontWeight: 600, textTransform: 'uppercase' }}>
              {payload.currentPage === 1 ? '🔥 GÜNCEL GELİŞMELER' : `ARŞİV DÖKÜMÜ - SAYFA ${payload.currentPage}`}
            </p>
          </div>
          {payload.currentPage > 1 && (
            <a href={`${basePath}/${category}?lang=${lang}&p=1`} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textDecoration: 'none' }}>
              ← ANA EKRANA DÖN
            </a>
          )}
        </div>

        {payload.categoryNews.length === 0 ? (
           <div style={{ padding: '8rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ width: '80px', height: '80px', background: 'rgba(204, 0, 0, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem' }}>📡</span>
             </div>
             <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#111', marginBottom: '1rem', letterSpacing: '-1px' }}>
               {lang.toUpperCase() === 'TR' ? 'SİSTEM TARAMASI DEVAM EDİYOR' : 'SYSTEM SCAN IN PROGRESS'}
             </h2>
             <p style={{ fontSize: '1.1rem', color: '#4B5563', maxWidth: '600px', lineHeight: 1.6, marginBottom: '3rem' }}>
               {lang.toUpperCase() === 'TR' 
                  ? 'Sektörel veriler ve istihbarat sinyalleri TISF yapay zeka motoru tarafından otonom olarak toplanıp indekslenmektedir.' 
                  : 'Industry intelligence signals are continuously being gathered and indexed by the TISF AI engine.'}
             </p>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#FFF', border: '1px solid #E5E7EB', padding: '1rem 2rem', borderRadius: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', animation: 'tickerPulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', letterSpacing: '1px' }}>
                  {lang.toUpperCase() === 'TR' ? 'AĞ DİNLENİYOR...' : 'LISTENING TO NETWORK...'}
                </span>
             </div>
           </div>
        ) : (
          <>
            {/* SAYFA 1: SHOWROOM GRID MODU */}
            {payload.currentPage === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
                {payload.categoryNews.map((article: any) => {
                  const translatedTitle = article.translations?.[lang.toUpperCase()]?.title || article.title;
                  const translatedSummary = article.translations?.[lang.toUpperCase()]?.summary || article.commercial_note || article.summary;

                  // Kategori Çeviri Haritası
                  const catStr = String(article.category || payload.categoryTitle).toUpperCase();
                  const catMap: Record<string, string> = {
                     'MARKET': 'PAZAR',
                     'OPPORTUNITY': 'FIRSAT',
                     'TENDER': 'İHALE',
                     'ANALYSIS': 'ANALİZ',
                     'TREND': 'TREND'
                  };
                  const displayCat = lang.toUpperCase() === 'TR' ? (catMap[catStr] || catStr) : catStr;

                  return (
                  <a key={article.id} href={`${basePath}/${category}/${article.slug || article.id}?lang=${lang}`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {(article.images?.[0] || article.image_url) ? (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                        <img src={article.images?.[0] || article.image_url} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                        <div style={{ position: 'relative', zIndex: 10, width: '40px', height: '4px', background: '#D1D5DB', borderRadius: '2px' }}></div>
                      </div>
                    )}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#CC0000', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {displayCat}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem', color: '#111', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {translatedTitle}
                      </h3>
                      {translatedSummary && (
                        <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, marginTop: 'auto', borderLeft: '2px solid #E5E7EB', paddingLeft: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {translatedSummary}
                        </p>
                      )}
                    </div>
                  </a>
                  );
                })}
              </div>
            )}

            {/* SAYFA 2+: YÜKSEK YOĞUNLUKLU (DENSITY) B2B LİSTE MODU */}
            {payload.currentPage > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', border: '1px solid #E5E7EB', padding: '1.5rem' }}>
                {payload.categoryNews.map((article: any) => {
                  const translatedTitle = article.translations?.[lang.toUpperCase()]?.title || article.title;
                  const translatedSummary = article.translations?.[lang.toUpperCase()]?.summary || article.commercial_note;
                  return (
                  <a key={article.id} href={`${basePath}/${category}/${article.slug || article.id}?lang=${lang}`} style={{ 
                    display: 'flex', textDecoration: 'none', color: 'inherit', 
                    borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem', alignItems: 'center', gap: '1.5rem' 
                  }}>
                    <div style={{ width: '100px', height: '60px', backgroundColor: '#F3F4F6', flexShrink: 0, overflow: 'hidden', borderRadius: '4px' }}>
                      {(article.images?.[0] || article.image_url) && (
                        <img src={article.images?.[0] || article.image_url} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: '0 0 0.3rem 0', lineHeight: 1.3 }}>{translatedTitle}</h3>
                      {translatedSummary && <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{translatedSummary.substring(0, 110)}...</div>}
                    </div>
                    {article.ai_block?.action && (
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#CC0000', background: '#FEF2F2', padding: '0.4rem 0.8rem', borderRadius: '4px', textTransform: 'uppercase', minWidth: '100px', textAlign: 'center' }}>
                         {article.ai_block.action.substring(0, 12)}
                       </div>
                    )}
                  </a>
                  );
                })}
              </div>
            )}
            
            {/* OTONOM PAGINATION BAR (AUTHORITY Navigasyon) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '4rem' }}>
               {payload.currentPage > 1 && (
                  <a href={`${basePath}/${category}?lang=${lang}&p=${payload.currentPage - 1}`} style={{ padding: '0.5rem 1rem', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111', fontWeight: 600, background: '#fff' }}>{lang.toUpperCase() === 'TR' ? 'Önceki' : 'Previous'}</a>
               )}
               {/* 5 Sayfalık Dinamik Slot */}
               {Array.from({ length: 5 }).map((_, i) => {
                 let pageNum = payload.currentPage > 3 ? payload.currentPage - 2 + i : i + 1;
                 const isActive = pageNum === payload.currentPage;
                 return (
                   <a key={pageNum} href={`${basePath}/${category}?lang=${lang}&p=${pageNum}`} style={{ 
                     padding: '0.5rem 1rem', textDecoration: 'none', fontWeight: isActive ? 900 : 600, 
                     background: isActive ? '#111' : '#fff', color: isActive ? '#fff' : '#111', border: '1px solid #111' 
                   }}>
                     {pageNum}
                   </a>
                 );
               })}
               <a href={`${basePath}/${category}?lang=${lang}&p=${payload.currentPage + 1}`} style={{ padding: '0.5rem 1rem', border: '1px solid #111', textDecoration: 'none', color: '#fff', fontWeight: 600, background: '#111' }}>{lang.toUpperCase() === 'TR' ? 'Sonraki →' : 'Next →'}</a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

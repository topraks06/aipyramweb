import { adminDb } from '@/lib/firebase-admin';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import NewsletterCapture from '@/components/trtex/NewsletterCapture';
import StickyCtaBar from '@/components/trtex/StickyCtaBar';
import { Metadata } from 'next';

// ═══ HABER SAYFA ETİKETLERİ (8 DİL OTONOM) ═══
const newsLabels: Record<string, {
  title: string; latest: string; archive: string; back: string;
  noData: string; prev: string; next: string;
}> = {
  TR: { title: 'HABERLER', latest: '🔥 SON GELİŞMELER', archive: 'ARŞİV — SAYFA', back: '← ANA EKRANA DÖN', noData: 'Daha fazla veri bulunamadı.', prev: 'Önceki', next: 'Sonraki →' },
  EN: { title: 'NEWS', latest: '🔥 LATEST UPDATES', archive: 'ARCHIVE — PAGE', back: '← BACK TO HOME', noData: 'No more data found.', prev: 'Previous', next: 'Next →' },
  DE: { title: 'NACHRICHTEN', latest: '🔥 AKTUELLE ENTWICKLUNGEN', archive: 'ARCHIV — SEITE', back: '← ZURÜCK', noData: 'Keine weiteren Daten gefunden.', prev: 'Vorherige', next: 'Nächste →' },
  RU: { title: 'НОВОСТИ', latest: '🔥 ПОСЛЕДНИЕ ОБНОВЛЕНИЯ', archive: 'АРХИВ — СТРАНИЦА', back: '← НА ГЛАВНУЮ', noData: 'Больше данных не найдено.', prev: 'Предыдущая', next: 'Следующая →' },
  ZH: { title: '新闻', latest: '🔥 最新动态', archive: '存档 — 页面', back: '← 返回首页', noData: '没有更多数据。', prev: '上一页', next: '下一页 →' },
  AR: { title: 'أخبار', latest: '🔥 آخر التطورات', archive: 'الأرشيف — صفحة', back: '← العودة', noData: 'لم يتم العثور على مزيد من البيانات.', prev: 'السابق', next: 'التالي →' },
  ES: { title: 'NOTICIAS', latest: '🔥 ÚLTIMAS NOVEDADES', archive: 'ARCHIVO — PÁGINA', back: '← VOLVER AL INICIO', noData: 'No se encontraron más datos.', prev: 'Anterior', next: 'Siguiente →' },
  FR: { title: 'ACTUALITÉS', latest: '🔥 DERNIÈRES NOUVELLES', archive: 'ARCHIVE — PAGE', back: '← RETOUR', noData: 'Aucune donnée supplémentaire trouvée.', prev: 'Précédent', next: 'Suivant →' },
};

// ═══ OTONOM KATEGORİ ÇEVİRİ HARİTASI (8 DİL) ═══
const CATEGORY_MAP: Record<string, Record<string, string>> = {
  'İSTİHBARAT': { TR: 'İSTİHBARAT', EN: 'INTELLIGENCE', DE: 'INTELLIGENCE', FR: 'RENSEIGNEMENT', ES: 'INTELIGENCIA', RU: 'РАЗВЕДКА', ZH: '情报', AR: 'استخبارات' },
  'YENİ TEKNOLOJİ': { TR: 'YENİ TEKNOLOJİ', EN: 'NEW TECH', DE: 'NEUE TECHNOLOGIE', FR: 'NOUVELLE TECHNOLOGIE', ES: 'NUEVA TECNOLOGÍA', RU: 'НОВЫЕ ТЕХНОЛОГИИ', ZH: '新技术', AR: 'تكنولوجيا جديدة' },
  'MİMARİ & TREND': { TR: 'MİMARİ & TREND', EN: 'ARCHITECTURE & TREND', DE: 'ARCHITEKTUR & TREND', FR: 'ARCHITECTURE & TENDANCE', ES: 'ARQUITECTURA & TENDENCIA', RU: 'АРХИТЕКТУРА И ТРЕНД', ZH: '建筑与趋势', AR: 'عمارة واتجاهات' },
  'PERDE': { TR: 'PERDE', EN: 'CURTAIN', DE: 'VORHANG', FR: 'RIDEAU', ES: 'CORTINA', RU: 'ШТОРЫ', ZH: '窗帘', AR: 'ستائر' },
  'EV TEKSTİLİ': { TR: 'EV TEKSTİLİ', EN: 'HOME TEXTILE', DE: 'HEIMTEXTIL', FR: 'TEXTILE MAISON', ES: 'TEXTIL HOGAR', RU: 'ДОМАШНИЙ ТЕКСТИЛЬ', ZH: '家纺', AR: 'منسوجات منزلية' },
  'DÖŞEMELİK': { TR: 'DÖŞEMELİK', EN: 'UPHOLSTERY', DE: 'POLSTERSTOFF', FR: 'AMEUBLEMENT', ES: 'TAPICERÍA', RU: 'ОБИВКА', ZH: '装饰面料', AR: 'تنجيد' },
  'PAZAR': { TR: 'PAZAR', EN: 'MARKET', DE: 'MARKT', FR: 'MARCHÉ', ES: 'MERCADO', RU: 'РЫНОК', ZH: '市场', AR: 'سوق' },
  'MARKET': { TR: 'PAZAR', EN: 'MARKET', DE: 'MARKT', FR: 'MARCHÉ', ES: 'MERCADO', RU: 'РЫНОК', ZH: '市场', AR: 'سوق' },
  'FIRSAT': { TR: 'FIRSAT', EN: 'OPPORTUNITY', DE: 'CHANCE', FR: 'OPPORTUNITÉ', ES: 'OPORTUNIDAD', RU: 'ВОЗМОЖНОСТЬ', ZH: '机会', AR: 'فرصة' },
  'OPPORTUNITY': { TR: 'FIRSAT', EN: 'OPPORTUNITY', DE: 'CHANCE', FR: 'OPPORTUNITÉ', ES: 'OPORTUNIDAD', RU: 'ВОЗМОЖНОСТЬ', ZH: '机会', AR: 'فرصة' },
  'GÜNDEM': { TR: 'GÜNDEM', EN: 'AGENDA', DE: 'AGENDA', FR: 'AGENDA', ES: 'AGENDA', RU: 'ПОВЕСТКА', ZH: '议程', AR: 'جدول أعمال' },
  'HABER': { TR: 'HABER', EN: 'NEWS', DE: 'NACHRICHTEN', FR: 'ACTUALITÉS', ES: 'NOTICIAS', RU: 'НОВОСТИ', ZH: '新闻', AR: 'أخبار' },
  'NEWS': { TR: 'HABER', EN: 'NEWS', DE: 'NACHRICHTEN', FR: 'ACTUALITÉS', ES: 'NOTICIAS', RU: 'НОВОСТИ', ZH: '新闻', AR: 'أخبار' },
  'ANALİZ': { TR: 'ANALİZ', EN: 'ANALYSIS', DE: 'ANALYSE', FR: 'ANALYSE', ES: 'ANÁLISIS', RU: 'АНАЛИЗ', ZH: '分析', AR: 'تحليل' },
  'ANALYSIS': { TR: 'ANALİZ', EN: 'ANALYSIS', DE: 'ANALYSE', FR: 'ANALYSE', ES: 'ANÁLISIS', RU: 'АНАЛИЗ', ZH: '分析', AR: 'تحليل' },
  'BÖLGE': { TR: 'BÖLGE', EN: 'REGION', DE: 'REGION', FR: 'RÉGION', ES: 'REGIÓN', RU: 'РЕГИОН', ZH: '地区', AR: 'منطقة' },
  'REGION': { TR: 'BÖLGE', EN: 'REGION', DE: 'REGION', FR: 'RÉGION', ES: 'REGIÓN', RU: 'РЕГИОН', ZH: '地区', AR: 'منطقة' },
  'TREND': { TR: 'TREND', EN: 'TREND', DE: 'TREND', FR: 'TENDANCE', ES: 'TENDENCIA', RU: 'ТРЕНД', ZH: '趋势', AR: 'اتجاه' },
  'DEKORASYON': { TR: 'DEKORASYON', EN: 'DECORATION', DE: 'DEKORATION', FR: 'DÉCORATION', ES: 'DECORACIÓN', RU: 'ДЕКОР', ZH: '装饰', AR: 'ديكور' },
  'HAMMADDE': { TR: 'HAMMADDE', EN: 'RAW MATERIAL', DE: 'ROHSTOFF', FR: 'MATIÈRE PREMIÈRE', ES: 'MATERIA PRIMA', RU: 'СЫРЬЁ', ZH: '原材料', AR: 'مواد خام' },
  'İPLİK': { TR: 'İPLİK', EN: 'YARN', DE: 'GARN', FR: 'FIL', ES: 'HILO', RU: 'ПРЯЖА', ZH: '纱线', AR: 'خيوط' },
};

// ═══ ARAMA & BOŞ SAYFA ETİKETLERİ (8 DİL) ═══
const searchLabels: Record<string, {
  searchResults: string; filteredData: string; noResults: string;
  noDataDesc: string; createRequest: string;
}> = {
  TR: { searchResults: 'ARAMA SONUÇLARI', filteredData: 'Filtrelenmiş B2B İstihbarat Verisi', noResults: 'İÇİN SONUÇ BULUNAMADI', noDataDesc: '{SL.noDataDesc}', createRequest: '{SL.createRequest}' },
  EN: { searchResults: 'SEARCH RESULTS', filteredData: 'Filtered B2B Intelligence Data', noResults: 'NO RESULTS FOUND FOR', noDataDesc: 'No supplier, product or tender data matching your criteria was found. Are you planning a targeted procurement?', createRequest: 'CREATE CUSTOM REQUEST →' },
  DE: { searchResults: 'SUCHERGEBNISSE', filteredData: 'Gefilterte B2B-Intelligenzdaten', noResults: 'KEINE ERGEBNISSE FÜR', noDataDesc: 'Keine Lieferanten-, Produkt- oder Ausschreibungsdaten gefunden. Planen Sie eine gezielte Beschaffung?', createRequest: 'INDIVIDUELLE ANFRAGE ERSTELLEN →' },
  RU: { searchResults: 'РЕЗУЛЬТАТЫ ПОИСКА', filteredData: 'Отфильтрованные данные B2B', noResults: 'НЕТ РЕЗУЛЬТАТОВ ДЛЯ', noDataDesc: 'Данные поставщиков, продуктов или тендеров не найдены. Планируете целевую закупку?', createRequest: 'СОЗДАТЬ ЗАПРОС →' },
  ZH: { searchResults: '搜索结果', filteredData: '已过滤的B2B情报数据', noResults: '未找到结果', noDataDesc: '未找到符合您条件的供应商、产品或招标数据。是否计划有针对性的采购？', createRequest: '创建定制请求 →' },
  AR: { searchResults: 'نتائج البحث', filteredData: 'بيانات B2B مصفاة', noResults: 'لم يتم العثور على نتائج لـ', noDataDesc: 'لم يتم العثور على بيانات مطابقة. هل تخطط لشراء مستهدف؟', createRequest: 'إنشاء طلب مخصص →' },
  ES: { searchResults: 'RESULTADOS DE BÚSQUEDA', filteredData: 'Datos de Inteligencia B2B Filtrados', noResults: 'SIN RESULTADOS PARA', noDataDesc: 'No se encontraron datos de proveedores o licitaciones. ¿Planea una adquisición específica?', createRequest: 'CREAR SOLICITUD PERSONALIZADA →' },
  FR: { searchResults: 'RÉSULTATS DE RECHERCHE', filteredData: 'Données B2B filtrées', noResults: 'AUCUN RÉSULTAT POUR', noDataDesc: 'Aucune donnée fournisseur ou appel d\'offres trouvée. Planifiez-vous un achat ciblé ?', createRequest: 'CRÉER UNE DEMANDE PERSONNALISÉE →' },
};

// ANAYASA: Zero-Cache — Dumb Client her istekte Firestore'dan taze veri çeker
export const dynamic = "force-dynamic";

type NewsListPageProps = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ lang?: string }>;
};

// Basitleştirilmiş Otonom Payload Çekimi (Kategori Sayfası İçin)
async function fetchAlohaCategoryPayload(projectName: string, category: string, currentPage: number, limitCount: number, searchQuery: string = "") {
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
        const batches = [];
        for (let i = 0; i < pointerIds.length; i += 30) {
           const chunk = pointerIds.slice(i, i + 30);
           const batchQuery = adminDb.collection(`${projectName}_news`).where("__name__", "in", chunk).get();
           batches.push(batchQuery);
        }
        
        const results = await Promise.all(batches);
        const resolvedDocs = results.flatMap((snap: any) => snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        
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

  const activeMenu = menuConfig.find((m: any) => m.slug === category);
  const categoryTitle = activeMenu ? activeMenu.label : category.toUpperCase();

  // IN-MEMORY SEARCH FILTERING (Eğer ?q= varsa)
  if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
    const qLower = searchQuery.toLowerCase().trim();
    // Bütün çekilen haberlerde başlık, kategori veya summary içinde ara
    categoryNews = categoryNews.filter((article: any) => {
      const matchTitle = article.title?.toLowerCase().includes(qLower);
      const matchCat = article.category?.toLowerCase().includes(qLower);
      const matchSummary = article.commercial_note?.toLowerCase().includes(qLower);
      const matchEnTitle = article.translations?.EN?.title?.toLowerCase().includes(qLower);
      return matchTitle || matchCat || matchSummary || matchEnTitle;
    });
  }

  return { tickerItems, menuConfig, categoryNews, categoryTitle, currentPage };
}

export async function generateMetadata({ params, searchParams }: NewsListPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams as Record<string, string | undefined>;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = (resolvedSearch?.lang || "tr").toUpperCase();
  
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const titleCategory = "HABERLER";
  
  return {
    title: `${brandName} — ${titleCategory} (${lang})`,
    description: `${brandName} B2B Intelligence Terminal — ${titleCategory} Haberleri ve Analizleri. Ev tekstili sektöründe gerçek zamanlı istihbarat.`,
    openGraph: {
      title: `${brandName} ${titleCategory} — B2B Textile Intelligence`,
      description: `Latest B2B textile intelligence, market analysis and industry news from ${brandName}.`,
      type: 'website',
    },
    alternates: { canonical: `https://${exactDomain}/haberler` },
  };
}

export default async function NewsListPage({ params, searchParams }: NewsListPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams as Record<string, string | undefined>;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const category = "news";
  const lang = resolvedSearch?.lang || "tr";
  
  // Pagination
  const currentPage = parseInt(resolvedSearch?.p || "1", 10);
  const limitCount = currentPage === 1 ? 30 : 60; // Asimetrik Sayfa Adedi

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;
  const searchQuery = resolvedSearch?.q || "";

  const payload = await fetchAlohaCategoryPayload(projectName, category, currentPage, limitCount, searchQuery);
  const NL = newsLabels[lang.toUpperCase()] || newsLabels.TR;
  const SL = searchLabels[lang.toUpperCase()] || searchLabels.TR;
  const targetLang = lang.toUpperCase();
  const translateCategory = (raw: string) => {
    const mapped = CATEGORY_MAP[raw?.toUpperCase()];
    return mapped?.[targetLang] || raw;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', color: '#111', fontFamily: "'Inter', 'Helvetica', sans-serif" }}>

      {/* 1. TICKER */}
      {payload.tickerItems.length > 0 && <IntelligenceTicker items={payload.tickerItems} />}

      {/* 2. ORTAK NAVBAR */}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />

      {/* 3. KATEGORİ HABER AKIŞI (ASİMETRİK TASARIM) */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '4px solid #111', paddingBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', textTransform: 'uppercase', margin: 0 }}>
              {searchQuery ? `${SL.searchResults}: "${searchQuery}"` : NL.title}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0 0 0', fontWeight: 600, textTransform: 'uppercase' }}>
              {searchQuery ? SL.filteredData : (payload.currentPage === 1 ? NL.latest : `${NL.archive} ${payload.currentPage}`)}
            </p>
          </div>
          {payload.currentPage > 1 && (
            <a href={`${basePath}/${category}?lang=${lang}&p=1`} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textDecoration: 'none' }}>
              {NL.back}
            </a>
          )}
        </div>

        {payload.categoryNews.length === 0 ? (
           <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>
               {searchQuery ? `"${searchQuery}" ${SL.noResults}` : NL.noData}
             </h2>
             <p style={{ color: '#6B7280', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.6 }}>
               {SL.noDataDesc}
             </p>
             <a href={`${basePath}/request-quote?lang=${lang}&product=${searchQuery}`} style={{ display: 'inline-block', background: '#CC0000', color: '#FFF', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 800, textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(204,0,0,0.2)' }}>
               {SL.createRequest}
             </a>
           </div>
        ) : (
          <>
            {/* SAYFA 1: SHOWROOM GRID MODU */}
            {payload.currentPage === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
                {payload.categoryNews.map((article: any) => {
                  const translatedTitle = article.translations?.[lang.toUpperCase()]?.title || article.title;
                  const translatedSummary = article.translations?.[lang.toUpperCase()]?.summary || article.commercial_note;
                  return (
                  <a key={article.id} href={`${basePath}/${category}/${article.slug || article.id}?lang=${lang}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden' }}>
                    {(article.images?.[0] || article.image_url || article.image) ? (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                        <img src={article.images?.[0] || article.image_url || article.image} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                        <div style={{ position: 'relative', zIndex: 10, width: '60px', height: '4px', background: '#D1D5DB', borderRadius: '2px' }}></div>
                      </div>
                    )}
                    <div style={{ padding: '1.5rem' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#CC0000', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                         {(() => {
                           const c = article.translations?.[lang.toUpperCase()]?.category || article.category || 'GÜNDEM';
                           if (lang.toUpperCase() === 'TR') {
                             if (c.toUpperCase() === 'MARKET') return 'PAZAR';
                             if (c.toUpperCase() === 'OPPORTUNITY') return 'FIRSAT';
                             if (c.toUpperCase() === 'NEWS') return 'HABER';
                             if (c.toUpperCase() === 'REGION') return 'BÖLGE';
                             if (c.toUpperCase() === 'TREND') return 'TREND';
                             if (c.toUpperCase() === 'ANALYSIS') return 'ANALİZ';
                           }
                           return c;
                         })()}
                       </div>
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem', color: '#111' }}>
                         {translatedTitle}
                       </h3>
                       {translatedSummary && (
                         <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, marginTop: '1rem', borderLeft: '2px solid #E5E7EB', paddingLeft: '0.75rem' }}>
                           {translatedSummary.substring(0, 100)}...
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
                    <div style={{ width: '100px', height: '60px', flexShrink: 0, overflow: 'hidden', borderRadius: '4px', position: 'relative', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                      {(article.images?.[0] || article.image_url || article.image) ? (
                        <img src={article.images?.[0] || article.image_url || article.image} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 20 }} />
                      ) : (
                        <div style={{ position: 'relative', zIndex: 10, width: '20px', height: '3px', background: '#D1D5DB', borderRadius: '2px' }}></div>
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
            
            {/* CEO BRİFİNG — E-posta yakalama */}
            <NewsletterCapture lang={lang} />

            {/* OTONOM PAGINATION BAR (AUTHORITY Navigasyon) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '4rem' }}>
               {payload.currentPage > 1 && (
                  <a href={`${basePath}/${category}?lang=${lang}&p=${payload.currentPage - 1}`} style={{ padding: '0.5rem 1rem', border: '1px solid #E5E7EB', textDecoration: 'none', color: '#111', fontWeight: 600, background: '#fff' }}>{NL.prev}</a>
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
               <a href={`${basePath}/${category}?lang=${lang}&p=${payload.currentPage + 1}`} style={{ padding: '0.5rem 1rem', border: '1px solid #111', textDecoration: 'none', color: '#fff', fontWeight: 600, background: '#111' }}>{NL.next}</a>
            </div>
          </>
        )}
      </main>
      
      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <StickyCtaBar lang={lang} />
    </div>
  );
}

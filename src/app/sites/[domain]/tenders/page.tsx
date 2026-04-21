import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { t } from '@/i18n/labels';
import TendersClient from './TendersClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';

  // 8 dil canonical dökümü (AIPyram Sovereign Architecture)
  const alternates: Record<string, string> = {
    'x-default': `https://${exactDomain}/tenders?lang=tr`
  };
  const TRTEX_LANGS = ["tr", "en", "de", "ru", "zh", "ar", "es", "fr"] as const;
  for (const l of TRTEX_LANGS) {
    alternates[l] = `https://${exactDomain}/tenders?lang=${l}`;
  }

  return {
    title: `${t('liveTenders', lang)} — ${brandName}`,
    description: t('tendersDesc', lang),
    alternates: {
      canonical: `https://${exactDomain}/tenders?lang=${lang}`,
      languages: alternates
    }
  };
}

async function fetchActiveTicker() {
  const tickerItems: any[] = [];
  try {
    const tickerDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
    if (tickerDoc.exists) {
       const tickerData = tickerDoc.data() || {};
       if (tickerData?.forex?.usd_try?.value) tickerItems.push({ id: 'usdtry', type: 'fx_energy', label: 'USD/TRY', value: tickerData.forex.usd_try.value, unit: '₺', change: tickerData.forex.usd_try.change || 0, direction: tickerData.forex.usd_try.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.95 });
       if (tickerData?.forex?.eur_try?.value) tickerItems.push({ id: 'eurtry', type: 'fx_energy', label: 'EUR/TRY', value: tickerData.forex.eur_try.value, unit: '₺', change: tickerData.forex.eur_try.change || 0, direction: tickerData.forex.eur_try.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.9 });
       if (tickerData?.commodities) {
         for (const [key, val] of Object.entries(tickerData.commodities) as [string, any][]) {
           if (val?.value) tickerItems.push({ id: key, type: 'commodity', label: key.toUpperCase(), value: val.value, unit: '', change: val.change || 0, direction: val.direction || 'stable', severity: 'normal', timestamp: Date.now(), businessImpact: 0.8 });
         }
       }
    }
  } catch (e) {}
  return tickerItems;
}

async function fetchTenders() {
  if (!adminDb) return [];
  try {
    // Önce payload'dan oku (terminal/current içinde activeTenders var)
    const terminalSnap = await adminDb.collection('trtex_terminal').doc('current').get();
    if (terminalSnap.exists) {
      const data = terminalSnap.data();
      if (data?.activeTenders && Array.isArray(data.activeTenders) && data.activeTenders.length > 0) {
        return data.activeTenders;
      }
    }
    
    // Fallback: Direkt koleksiyondan oku
    const snap = await adminDb.collection('trtex_tenders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const results: any[] = [];
    snap.forEach((doc: any) => {
      const d = doc.data();
      if (d.status === 'LIVE') results.push({ id: doc.id, ...d });
    });
    return results;
  } catch (e) {
    console.error('[TENDERS PAGE] Fetch error:', e);
    return [];
  }
}

export default async function TendersPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const tenders = await fetchTenders();
  const tickerItems = await fetchActiveTicker();
  const basePath = `/sites/${exactDomain}`;
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';
  
  return <TendersClient tenders={tenders} tickerItems={tickerItems} basePath={basePath} brandName={brandName} domain={exactDomain} lang={lang} />;
}

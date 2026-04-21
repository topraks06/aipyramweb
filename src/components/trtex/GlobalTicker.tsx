import { adminDb } from '@/lib/firebase-admin';
import IntelligenceTicker from './IntelligenceTicker';

/**
 * GlobalTicker (Server Component)
 * Fetches real-time market data from Firestore and renders the IntelligenceTicker.
 * MUST be used in Server Components and passed to Client Components as a prop or child.
 */
export default async function GlobalTicker() {
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
  } catch (e) {
    console.error('[GlobalTicker] Firestore Error:', e);
  }
  
  if (tickerItems.length === 0) return null;
  return <IntelligenceTicker items={tickerItems} />;
}

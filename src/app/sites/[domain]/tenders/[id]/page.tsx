import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { t } from '@/i18n/labels';
import TenderDetailClient from './TenderDetailClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const id = resolvedParams.id;
  const lang = resolvedSearch?.lang || 'tr';
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';

  return {
    title: `İhale Detayı: ${id} — ${brandName}`,
  };
}

async function fetchTender(id: string) {
  if (!adminDb) return null;
  try {
    const docSnap = await adminDb.collection('trtex_tenders').doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    // Eğer trtex_tenders içinde yoksa, terminal'in activeTenders dizisine bakabiliriz
    const terminalSnap = await adminDb.collection('trtex_terminal').doc('current').get();
    if (terminalSnap.exists) {
      const data = terminalSnap.data();
      if (data?.activeTenders && Array.isArray(data.activeTenders)) {
        const found = data.activeTenders.find((t: any) => t.id === id);
        if (found) return found;
      }
    }
  } catch (e) {
    console.error('[TENDER DETAIL] Fetch error:', e);
  }
  return null;
}

export default async function TenderDetailPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const id = resolvedParams.id;
  
  const tender = await fetchTender(id);
  const basePath = `/sites/${exactDomain}`;
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';
  
  return <TenderDetailClient tender={tender} basePath={basePath} brandName={brandName} lang={lang} />;
}

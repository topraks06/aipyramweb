import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * /trade → /tenders yönlendirmesi
 * Navbar'daki "TİCARET" linki buraya düşer. 
 * İhaleler sayfasına yönlendirir — 404 yerine.
 */
export default async function TradePage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const lang = resolvedSearch?.lang || 'tr';
  redirect(`/sites/${domain}/tenders${lang !== 'tr' ? `?lang=${lang}` : ''}`);
}

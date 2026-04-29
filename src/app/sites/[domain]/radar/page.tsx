import { redirect } from 'next/navigation';

export default async function RadarRedirectPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  
  // Radar → Trends sayfasına yönlendir (Dünya Radarı burada)
  redirect(`/sites/${domain}/trends?lang=${lang}`);
}

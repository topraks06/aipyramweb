import { redirect } from 'next/navigation';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexTrends = (await import('@/components/node-heimtex/HeimtexTrends')).default;
    return <HeimtexTrends />;
  }

  // Hometex or other nodes shouldn't access this page anymore
  redirect(`/sites/${exactDomain}`);
}

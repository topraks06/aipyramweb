import { redirect } from 'next/navigation';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexMagazine = (await import('@/components/node-heimtex/HeimtexMagazine')).default;
    return <HeimtexMagazine />;
  }

  // Hometex or other nodes shouldn't access this page anymore
  redirect(`/sites/${exactDomain}`);
}

import { redirect } from 'next/navigation';

export default async function AkademiRedirectPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  
  redirect(`/sites/${domain}/academy?lang=${lang}`);
}

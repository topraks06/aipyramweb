import { resolveNodeFromDomain } from '@/lib/sovereign-config';
import IcmimarB2B from '@/components/node-icmimar/B2B';
import PerdeB2B from '@/components/node-perde/B2B';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(':')[0];
  const node = resolveNodeFromDomain(exactDomain);
  
  return {
    title: `Yönetim Paneli | ${node.shortName} Ekosistemi`,
    description: `AIPyram Sovereign B2B Yönetim Merkezi - ${node.name}`,
  };
}

export default async function YonetimPage(props: { params: Promise<{ domain: string }> }) {
  const { domain } = await props.params;
  const exactDomain = decodeURIComponent(domain).split(':')[0];
  const node = resolveNodeFromDomain(exactDomain);

  if (node.id === 'icmimar') {
    return <IcmimarB2B />;
  }
  
  if (node.id === 'perde') {
    return <PerdeB2B />;
  }

  return notFound();
}

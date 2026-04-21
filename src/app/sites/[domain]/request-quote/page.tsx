import { Metadata } from 'next';
import RequestQuoteClient from './RequestQuoteClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';
  
  return {
    title: `Request Quote — ${brandName} B2B Trade Engine`,
    description: `Get direct factory prices and connect with verified suppliers via our autonomous B2B platform.`,
    alternates: {
      canonical: `https://${exactDomain}/request-quote`,
    }
  };
}

export default async function RequestQuotePage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'en';
  
  const basePath = `/sites/${exactDomain}`;
  const brandName = exactDomain?.replace('.com','').toUpperCase() || 'TRTEX';

  return (
    <RequestQuoteClient 
      basePath={basePath} 
      brandName={brandName} 
      lang={lang} 
    />
  );
}

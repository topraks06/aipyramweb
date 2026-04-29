import { t } from '@/i18n/labels';
import SupplyClient from './SupplyClient';

export const dynamic = "force-dynamic";

export default async function SupplyPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  return <SupplyClient basePath={basePath} brandName={brandName} lang={lang} />;
}

import ProductIngestionClient from '@/components/hometex/seller/ProductIngestionClient';

export const metadata = {
  title: 'AI Catalog Ingestion | Hometex',
  description: 'Upload your textile products to the global B2B catalog instantly with AI.',
};

export default function HometexIngestionPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <ProductIngestionClient />
    </div>
  );
}

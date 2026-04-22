import { ProductDetail } from "@/components/tenant-vorhang/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

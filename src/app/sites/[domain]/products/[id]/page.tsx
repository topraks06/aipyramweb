import { ProductDetail } from "@/components/tenant-vorhang/ProductDetail";
import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { id } = await params;

  let product: any = null;
  let seller: any = null;

  try {
    const productDoc = await adminDb.collection('vorhang_products').doc(id).get();
    if (productDoc.exists) {
      product = { id: productDoc.id, ...productDoc.data() };
      
      if (product.sellerId) {
        const sellerDoc = await adminDb.collection('vorhang_sellers').doc(product.sellerId).get();
        if (sellerDoc.exists) {
          seller = { id: sellerDoc.id, ...sellerDoc.data() };
        }
      }
    }
  } catch (error) {
    console.error('Error fetching vorhang product details:', error);
  }

  if (!product) {
    // We will still render the page so that the mock data in ProductDetail can be shown during dev,
    // or we can just pass null and let the component handle it.
  }

  return <ProductDetail id={id} product={product} seller={seller} />;
}

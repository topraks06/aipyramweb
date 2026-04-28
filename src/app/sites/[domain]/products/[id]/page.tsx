import { ProductDetail as VorhangProductDetail } from "@/components/node-vorhang/ProductDetail";
import MarketplaceProductDetail from "@/components/node-perde/marketplace/MarketplaceProductDetail";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  if (domain === 'perde.ai') {
    return <MarketplaceProductDetail productId={id} basePath={`/sites/${domain}`} />;
  }

  // Vorhang Logic
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

  return <VorhangProductDetail id={id} product={product} seller={seller} />;
}


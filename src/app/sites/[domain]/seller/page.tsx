import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;

  if (exactDomain.includes('vorhang')) {
    let orders: any[] = [];
    let seller: any = null;
    try {
      const ordersSnap = await adminDb.collection('vorhang_orders').limit(10).get();
      orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sellersSnap = await adminDb.collection('vorhang_sellers').limit(1).get();
      if (!sellersSnap.empty) {
        seller = { id: sellersSnap.docs[0].id, ...sellersSnap.docs[0].data() };
      }
    } catch (error) {
      console.error('Error fetching vorhang seller data:', error);
    }
    const VorhangSellerDashboard = (await import("@/components/node-vorhang/SellerDashboard")).default;
    return <VorhangSellerDashboard orders={orders} seller={seller} />;
  } else if (exactDomain.includes('perde')) {
    const MarketplaceSellerDashboard = (await import("@/components/node-perde/marketplace/MarketplaceSellerDashboard")).default;
    return <MarketplaceSellerDashboard basePath={basePath} />;
  }

  return notFound();
}

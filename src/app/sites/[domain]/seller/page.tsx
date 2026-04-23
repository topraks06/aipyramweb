import SellerDashboard from "@/components/node-vorhang/SellerDashboard";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  let orders: any[] = [];
  let seller: any = null;
  
  try {
    const ordersSnap = await adminDb.collection('vorhang_orders').limit(10).get();
    orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Simulate fetching current seller (we just pick the first one for now)
    const sellersSnap = await adminDb.collection('vorhang_sellers').limit(1).get();
    if (!sellersSnap.empty) {
      seller = { id: sellersSnap.docs[0].id, ...sellersSnap.docs[0].data() };
    }
  } catch (error) {
    console.error('Error fetching vorhang seller data:', error);
  }

  return <SellerDashboard orders={orders} seller={seller} />;
}

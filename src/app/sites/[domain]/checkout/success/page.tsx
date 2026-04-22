import { OrderConfirmation } from "@/components/tenant-vorhang/OrderConfirmation";

export const dynamic = "force-dynamic";

export default async function SuccessPage({ params, searchParams }: { params: Promise<{ domain: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain);
  const search = await searchParams;
  const orderId = typeof search.order_id === 'string' ? search.order_id : null;

  if (d.includes('vorhang')) {
    return <OrderConfirmation orderId={orderId} />;
  }

  // Perde.ai or others could also use this route later
  return <div className="p-20 text-center">Thank you for your order!</div>;
}

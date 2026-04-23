import React from 'react';
import { adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function approveOrder(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const nodeId = formData.get('nodeId') as string;
  const domain = formData.get('domain') as string;

  if (!orderId || !nodeId) return;

  const config = getNode(nodeId);
  const orderRef = adminDb.collection(config.projectCollection).doc(orderId);
  
  await orderRef.update({
    status: 's2',
    approvedAt: new Date().toISOString()
  });

  revalidatePath(`/sites/${domain}/approve-order`);
  redirect(`/sites/${domain}?approved=true`);
}

export default async function ApproveOrderPage({ params, searchParams }: { params: Promise<{ domain: string }>, searchParams: Promise<{ id?: string }> }) {
  const { domain } = await params;
  const search = await searchParams;
  const orderId = search.id;

  if (!orderId) {
    return notFound();
  }

  const exactDomain = decodeURIComponent(domain).split(":")[0];
  let currentNode = 'perde';
  if (exactDomain.includes('hometex')) currentNode = 'hometex';
  else if (exactDomain.includes('trtex')) currentNode = 'trtex';
  
  const config = getNode(currentNode);
  const orderDoc = await adminDb.collection(config.projectCollection).doc(orderId).get();

  if (!orderDoc.exists) {
    return notFound();
  }

  const orderData = orderDoc.data();
  const isApproved = orderData?.status !== 's1' && orderData?.status !== 'pending' && orderData?.status !== 'draft';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans p-6">
      <div className="max-w-xl w-full bg-zinc-900 border border-white/10 p-10 rounded-sm">
        <h1 className="text-3xl font-serif text-center mb-2 tracking-tight">{config.shortName} B2B Sipariş Onayı</h1>
        <p className="text-zinc-400 text-center text-sm mb-8">Sipariş ID: {orderId}</p>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-zinc-500">Müşteri</span>
            <span className="font-medium">{orderData?.customer?.name || orderData?.customerName || 'Bilinmiyor'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-zinc-500">Tutar</span>
            <span className="font-bold text-lg">${orderData?.financials?.grandTotal || orderData?.grandTotal || 0}</span>
          </div>
        </div>

        {isApproved ? (
          <div className="bg-green-500/10 text-green-400 p-4 text-center rounded-sm border border-green-500/20">
             Bu teklif zaten onaylanmış ve işleme alınmıştır.
          </div>
        ) : (
          <form action={approveOrder}>
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="nodeId" value={currentNode} />
            <input type="hidden" name="domain" value={domain} />
            
            <button type="submit" className="w-full py-4 bg-white text-black text-sm uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors">
              Teklifi Onayla
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

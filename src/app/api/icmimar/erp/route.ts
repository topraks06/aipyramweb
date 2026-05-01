import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * icmimar.ai — ERP Dashboard API (Sipariş/Muhasebe Toplu Veri)
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Sipariş istatistikleri
    const ordersSnap = await adminDb.collection('icmimar_orders').get();
    const orders = ordersSnap.docs.map(doc => doc.data());

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || o.grandTotal || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 's4').length;
    const completedOrders = orders.filter(o => o.status === 's4').length;

    // Müşteri sayısı
    const customersSnap = await adminDb.collection('icmimar_customers').get();

    return NextResponse.json({
      totalRevenue,
      activeOrders,
      completedOrders,
      totalOrders: orders.length,
      totalCustomers: customersSnap.size,
    });
  } catch (error: any) {
    console.error("[ICMIMAR-ERP] Error:", error);
    return NextResponse.json({
      totalRevenue: 0,
      activeOrders: 0,
      completedOrders: 0,
      totalOrders: 0,
      totalCustomers: 0,
      error: error.message,
    });
  }
}

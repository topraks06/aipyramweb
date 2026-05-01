import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { routeOrderToBestVendor } from '@/core/aloha/orderRouter';


export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/master/vorhang/create-order
 * 
 * Vorhang.ai Sipariş Köprüsü (The Final Bridge)
 * DACH bölgesinden gelen siparişi alır, TR kurlarına çevirir ve 
 * üretici firmanın Perde.ai B2B paneline iş/üretim emri olarak düşürür.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, priceEur, vatEur, shippingEur, totalEur, customerDetails, manufacturerId } = body;

    if (!productId || !totalEur) {
      return NextResponse.json({ error: 'Geçersiz sipariş verisi' }, { status: 400 });
    }

    console.log(`[VORHANG-BRIDGE] 🇪🇺 Yeni Avrupa Siparişi Alındı: ${totalEur} EUR`);

    let EUR_TRY_RATE = 36.45; 
    try {
      const tickerDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
      if (tickerDoc.exists && tickerDoc.data()?.forex?.eur_try?.value) {
        EUR_TRY_RATE = tickerDoc.data()!.forex.eur_try.value;
      }
    } catch (e) {
      console.warn('[VORHANG-BRIDGE] Kur çekilemedi, varsayılan değer kullanılıyor.');
    }
    const totalTry = totalEur * EUR_TRY_RATE;

    const orderId = `VOR-${Date.now()}-${crypto.randomUUID().slice(0,4).toUpperCase()}-DE`;
    const timestamp = new Date();

    // 2. Vorhang Sistemine Kayıt (Müşteri için)
    const vorhangOrder = {
      orderId,
      productId,
      productName,
      priceEur,
      vatEur,
      shippingEur,
      totalEur,
      customerDetails,
      manufacturerId,
      status: 'paid',
      createdAt: timestamp,
    };

    await adminDb.collection('vorhang_orders').doc(orderId).set(vorhangOrder);

    // 3. Pazar Yeri Akıllı Yönlendirme (Order Router)
    // Siparişi en uygun dükkana atarız ve aipyram komisyonunu hesaplarız
    const routeInfo = await routeOrderToBestVendor(
      customerDetails.country || 'DE',
      totalEur,
      [{ name: productName, quantity: 1 }]
    );
    
    const manufacturerUid = routeInfo.vendorId;
    
    const b2bProject = {
      title: `[VORHANG İHRACAT] ${productName}`,
      customerName: customerDetails.name,
      country: customerDetails.country,
      items: [
         { name: productName, quantity: 1, unitPriceEur: priceEur }
      ],
      amount: totalTry, // Üretici B2B panelini TRY üzerinden takip ediyor
      grandTotal: totalTry,
      currency: 'TRY',
      exportCurrency: 'EUR',
      exportTotal: totalEur,
      aipyramCommissionEur: routeInfo.aipyramCommissionEur,
      vendorEarningsEur: routeInfo.vendorEarningsEur,
      status: 's2', // Onaylandı (Çünkü Avrupa'da ödeme peşin alındı)
      source: 'vorhang_bridge',
      vorhangOrderId: orderId,
      authorId: manufacturerUid,
      createdAt: timestamp,

      updatedAt: timestamp,
    };

    // Perde.ai kullanan üreticinin koleksiyonuna yazıyoruz (Sipariş Event'i)
    await adminDb.collection('perde_projects').add(b2bProject);

    // 4. Mimari Hardening: Event Bus Ayrışımı (Finansal Ledger Event'i)
    // Sipariş ile muhasebeyi ayırıyoruz. Bakiye çifte kayıt (race condition) yememesi için
    // finansal akış tamamen bağımsız, değiştirilemez bir ledger tablosuna yazılır.
    const ledgerEntry = {
      transactionId: `TXN-${orderId}`,
      vorhangOrderId: orderId,
      vendorId: manufacturerUid,
      type: 'vorhang_export_payout',
      totalOrderValueEur: totalEur,
      aipyramCommissionEur: routeInfo.aipyramCommissionEur,
      vendorEarningsEur: routeInfo.vendorEarningsEur,
      status: 'pending_payout', // Para şu an havuzda (Yemeksepeti modeli)
      createdAt: timestamp,
    };

    await adminDb.collection('aipyram_ledger').doc(ledgerEntry.transactionId).set(ledgerEntry);

    console.log(`[VORHANG-BRIDGE] 🚀 İhracat Siparişi İletildi & Ledger Kaydı Atıldı! (Değer: ₺${totalTry.toFixed(2)})`);

    return NextResponse.json({
      success: true,
      orderId,
      status: 'confirmed',
      message: 'Sipariş başarıyla üreticiye iletildi'
    });

  } catch (err: any) {
    console.error(`[VORHANG-BRIDGE] ❌ Hata: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminAccess } from '@/lib/admin-auth';

// ⚠️ ONLY FOR LOCAL/DEMO USAGE
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const isAdmin = await verifyAdminAccess();
  // Geçici olarak local geliştirme ortamında yetkiyi baypas edebiliriz veya admin girişi şart koşarız.
  // if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    if (!adminDb) return NextResponse.json({ success: false, error: 'Firebase Admin is not initialized' }, { status: 500 });

    const results = {
      perdeOrders: 0,
      vorhangProducts: 0,
      hometexExhibitors: 0,
      trtexNews: 0
    };

    // 1. PERDE.AI DEMO SIPARISLERI
    const perdeRef = adminDb.collection('perde_orders');
    for(let i=0; i<5; i++) {
        await perdeRef.add({
            orderNumber: `ORD-PERDE-2026${i+1}`,
            customerName: `Demo Müşteri ${i+1}`,
            status: i % 2 === 0 ? 'confirmed' : 'pending',
            totalAmount: (i * 1234 + 5000).toFixed(2),
            createdAt: new Date().toISOString()
        });
        results.perdeOrders++;
    }

    // 2. VORHANG.AI DEMO ÜRÜNLERİ
    const vorhangRef = adminDb.collection('vorhang_products');
    const vorhangSampleProducts = [
        "Akıllı Karartma Perde - Siyah", "Lüks İtalyan Kadife Döküm", "Motorlu Jaluzi Sistemi",
        "Sürdürülebilir Keten Fon", "Yangına Dayanıklı Otel Tipi", "Akustik Yalıtım Paneli",
        "Minimalist Tül", "Bohem Tarzı Rustik Perde", "İskandinav Basic Koleksiyon",
        "Ofis Tipi Store Perde", "Çocuk Odası Anti-Alerjik", "Premium İpek Karışımlı"
    ];
    for (const p of vorhangSampleProducts) {
        await vorhangRef.add({
            title: p,
            price: (p.length * 15) + 100,
            currency: 'EUR',
            image: 'https://via.placeholder.com/800x800?text=Vorhang+Product',
            sellerId: 'demo-seller-1',
            status: 'active',
            createdAt: new Date().toISOString()
        });
        results.vorhangProducts++;
    }

    // 3. HOMETEX DEMO KATILIMCILARI
    const hometexRef = adminDb.collection('exhibitors');
    const hometexFirms = ["Zorlu Tekstil", "Bursa Kumaşçılık", "Denizli Home", "Gaziantep İplik", "İstanbul Tasarım Evi", "Saray Halı & Tekstil"];
    for (const f of hometexFirms) {
        await hometexRef.add({
            name: f,
            booth: `Hall ${(f.length % 8) + 1} - Stand ${f.length * 3}`,
            category: 'Ev Tekstili',
            logo: 'https://via.placeholder.com/400x400?text=Company+Logo',
            status: 'approved',
            createdAt: new Date().toISOString()
        });
        results.hometexExhibitors++;
    }

    // 4. TRTEX DEMO HABERLERİ
    const trtexRef = adminDb.collection('trtex_news');
    const trtexNews = [
        "Küresel Tedarik Zincirinde Yeni Rota: Türkiye Merkez Oluyor",
        "Akıllı Kumaşlar Avrupa Pazarını Domine Etmeye Başladı",
        "Pamuk Fiyatlarında Son 5 Yılın En Sert Düşüşü Bekleniyor"
    ];
    for (const n of trtexNews) {
        await trtexRef.add({
            title: n,
            slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: 'Sektörel İstihbarat',
            status: 'published',
            publishedAt: new Date().toISOString(),
            translations: {
                TR: { title: n, content: "Bu bir otonom demo içeriktir." },
                EN: { title: n + " (EN)", content: "This is an autonomous demo content." }
            }
        });
        results.trtexNews++;
    }

    return NextResponse.json({ success: true, message: 'Demo data seeded successfully', results });

  } catch (error: any) {
    console.error('[Demo Seed API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

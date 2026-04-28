import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════
 *  PERDE.AI MARKETPLACE — ÜRÜN API'si
 *  Koleksiyon: perde_marketplace_products
 *  
 *  GET: Ürün listele (public, filtreleme + sayfalama)
 *  POST: Yeni ürün ekle (auth required, seller only)
 *  PUT: Ürün güncelle (auth required, owner only)
 * ═══════════════════════════════════════════════════════
 */

// ── Kategori Tipleri ──
const VALID_CATEGORIES = [
  'perde', 'dosemelik', 'korniz', 'stor', 
  'pasmanteri', 'duvar-kagidi', 'yatak-banyo', 'aksesuar'
];

// ── GET: Ürün Listele (Public) ──
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);
    const page = parseInt(searchParams.get('page') || '1');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const productId = searchParams.get('id');

    // Tek ürün getir
    if (productId) {
      const doc = await adminDb.collection('perde_marketplace_products').doc(productId).get();
      if (!doc.exists) {
        return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
      }
      return NextResponse.json({ product: { id: doc.id, ...doc.data() } });
    }

    // Ürün listesi sorgusu
    let query: any = adminDb.collection('perde_marketplace_products')
      .where('status', '==', 'active');

    if (category && VALID_CATEGORIES.includes(category)) {
      query = query.where('category', '==', category);
    }

    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }

    // Sıralama
    switch (sort) {
      case 'price_asc':
        query = query.orderBy('price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('price', 'desc');
        break;
      case 'popular':
        query = query.orderBy('salesCount', 'desc');
        break;
      case 'rating':
        query = query.orderBy('rating', 'desc');
        break;
      default: // newest
        query = query.orderBy('createdAt', 'desc');
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Client-side fiyat filtresi (Firestore composite index gerektirmemek için)
    if (minPrice > 0 || maxPrice < 999999) {
      products = products.filter((p: any) => p.price >= minPrice && p.price <= maxPrice);
    }

    // Client-side arama (basit text match, ileride Algolia/Typesense eklenebilir)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter((p: any) => 
        (p.title?.toLowerCase().includes(searchLower)) ||
        (p.description?.toLowerCase().includes(searchLower)) ||
        (p.tags?.some((t: string) => t.toLowerCase().includes(searchLower)))
      );
    }

    return NextResponse.json({ 
      products, 
      total: products.length,
      page,
      hasMore: products.length === limit 
    });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Products GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST: Ürün Ekle (Auth Required) ──
export async function POST(req: NextRequest) {
  try {
    // Auth kontrolü
    const isDev = process.env.NODE_ENV === 'development';
    let uid: string;

    if (isDev) {
      uid = 'dev-bypass-user';
    } else {
      const sessionCookie = req.cookies.get("session");
      if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
      }
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;
    }

    const body = await req.json();
    const {
      title, description, category, subCategory,
      price, currency = 'TRY', unit = 'metre',
      images = [], aiRenderedImages = [],
      fabricDetails, stock = 0, minOrder = 1,
      tags = [], sellerName = '',
    } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { error: "Ürün adı, fiyat ve kategori zorunludur." },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Geçersiz kategori. Geçerli: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const newProduct = {
      title,
      description: description || '',
      category,
      subCategory: subCategory || '',
      price: Number(price),
      currency,
      unit,
      images,
      aiRenderedImages,
      fabricDetails: fabricDetails || null,
      sellerId: uid,
      sellerName: sellerName || 'Satıcı',
      sellerVerified: false,
      stock: Number(stock),
      minOrder: Number(minOrder),
      tags,
      status: 'active',
      sourceDesignId: body.sourceDesignId || null,
      hometexExhibitId: null,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('perde_marketplace_products').add(newProduct);

    console.log(`[PERDE-MARKETPLACE] ✅ Ürün eklendi: ${docRef.id} - ${title}`);

    return NextResponse.json({
      success: true,
      productId: docRef.id,
      product: { id: docRef.id, ...newProduct },
    });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Products POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── PUT: Ürün Güncelle (Auth Required, Owner Only) ──
export async function PUT(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    let uid: string;

    if (isDev) {
      uid = 'dev-bypass-user';
    } else {
      const sessionCookie = req.cookies.get("session");
      if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
      }
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;
    }

    const body = await req.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId zorunludur" }, { status: 400 });
    }

    const docRef = adminDb.collection('perde_marketplace_products').doc(productId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    // Owner kontrolü (dev bypass hariç)
    if (!isDev && doc.data()?.sellerId !== uid) {
      return NextResponse.json({ error: "Bu ürünü düzenleme yetkiniz yok" }, { status: 403 });
    }

    // Güvenli güncelleme (sellerId değiştirilemez)
    delete updates.sellerId;
    delete updates.createdAt;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);

    return NextResponse.json({ success: true, productId });

  } catch (error: any) {
    console.error("[PERDE-MARKETPLACE] Products PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════════
 *  SOVEREIGN CROSS-NODE PUBLISH API
 *  
 *  icmimar.ai'de tasarlanan ürünü tek tıkla:
 *  → Perde.ai'de satışa sun
 *  → Hometex.ai'de fuarda sergile
 *  → Vorhang.ai'da Avrupa pazarına aç
 *  
 *  Dumb Client Principle: Tüm iş zekası burada.
 * ═══════════════════════════════════════════════════════════════════
 */

// Node → Firestore koleksiyon mapping
const NODE_COLLECTIONS: Record<string, string> = {
  perde: 'perde_marketplace_products',
  hometex: 'hometex_booth_products',
  vorhang: 'vorhang_marketplace_products',
};

export async function POST(req: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    let uid: string;

    if (isDev) {
      uid = 'dev-bypass-user';
    } else {
      const sessionCookie = req.cookies.get("session");
      if (!sessionCookie?.value) {
        return NextResponse.json({ error: "Yayınlamak için giriş yapın" }, { status: 401 });
      }
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;
    }

    const body = await req.json();
    const {
      sourceNodeId = 'icmimar',
      targetNodes = ['perde'],
      product,
      designId,
    } = body;

    if (!product || !product.title) {
      return NextResponse.json({ error: "Ürün bilgisi eksik" }, { status: 400 });
    }

    const results: Record<string, any> = {};
    const timestamp = new Date().toISOString();

    for (const targetNode of targetNodes) {
      const collection = NODE_COLLECTIONS[targetNode];
      if (!collection) {
        results[targetNode] = { success: false, error: `Bilinmeyen node: ${targetNode}` };
        continue;
      }

      try {
        const adaptedProduct = adaptProductForNode(product, targetNode, uid, designId, timestamp);
        
        const docRef = await adminDb.collection(collection).add(adaptedProduct);
        
        results[targetNode] = {
          success: true,
          productId: docRef.id,
          collection,
          message: getSuccessMessage(targetNode),
        };

        console.log(`[SOVEREIGN-PUBLISH] ✅ ${sourceNodeId} → ${targetNode}: ${docRef.id}`);

        if (designId) {
          try {
            await adminDb.collection('icmimar_projects').doc(designId).update({
              [`publishedTo.${targetNode}`]: {
                productId: docRef.id,
                publishedAt: timestamp,
              },
              updatedAt: timestamp,
            });
          } catch (e) {
            // Design doc yoksa sorun değil
          }
        }

      } catch (nodeError: any) {
        results[targetNode] = { success: false, error: nodeError.message };
        console.error(`[SOVEREIGN-PUBLISH] ❌ ${targetNode} hatası:`, nodeError.message);
      }
    }

    return NextResponse.json({
      success: true,
      sourceNodeId,
      targetNodes,
      results,
      publishedAt: timestamp,
    });

  } catch (error: any) {
    console.error("[SOVEREIGN-PUBLISH] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function adaptProductForNode(
  product: any, 
  targetNode: string, 
  sellerId: string,
  designId: string | null,
  timestamp: string
): any {
  const base = {
    title: product.title,
    description: product.description || '',
    images: product.images || [],
    aiRenderedImages: product.aiRenderedImages || [],
    fabricDetails: product.fabricDetails || null,
    tags: product.tags || [],
    sellerId,
    sourceDesignId: designId || null,
    sourceNode: 'icmimar',
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'active',
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
  };

  switch (targetNode) {
    case 'perde':
      return {
        ...base,
        category: product.category || 'perde',
        subCategory: product.subCategory || '',
        price: product.priceTRY || product.price || 0,
        currency: 'TRY',
        unit: product.unit || 'metre',
        stock: product.stock || 999,
        minOrder: product.minOrder || 1,
        sellerName: product.sellerName || 'İcmimar Tasarımcı',
        sellerVerified: true,
        hometexExhibitId: null,
      };

    case 'hometex':
      return {
        ...base,
        boothId: product.boothId || `booth-${sellerId}`,
        exhibitType: 'product',
        category: product.category || 'perde',
        priceRange: product.price ? `${product.price}+ TL` : 'Teklif Alın',
        moq: product.minOrder || 100,
        certifications: product.certifications || [],
      };

    case 'vorhang':
      return {
        ...base,
        category: product.category || 'vorhang',
        price: product.priceEUR || (product.price ? product.price / 35 : 0),
        currency: 'EUR',
        unit: product.unit || 'metre',
        stock: product.stock || 999,
        minOrder: 1,
        sellerName: product.sellerName || 'AIPyram Partner',
        isVerified: true,
      };

    default:
      return base;
  }
}

function getSuccessMessage(node: string): string {
  switch (node) {
    case 'perde': return '🛒 Perde.ai mağazasında satışa sunuldu!';
    case 'hometex': return '🎪 Hometex.ai sanal fuarında sergileniyor!';
    case 'vorhang': return '🇩🇪 Vorhang.ai Avrupa pazarında yayında!';
    default: return `✅ ${node} node'unda yayınlandı.`;
  }
}

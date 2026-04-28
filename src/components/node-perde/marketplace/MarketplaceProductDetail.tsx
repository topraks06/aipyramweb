"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PerdeNavbar from "../PerdeNavbar";
import PerdeFooter from "../PerdeFooter";
import { ShieldCheck, Sparkles, Heart, Share2, Eye, ShoppingCart, Truck, RotateCcw, ChevronLeft, ChevronRight, Star, Loader2, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import Link from "next/link";

interface MarketplaceProductDetailProps {
  productId: string;
  basePath?: string;
}

export default function MarketplaceProductDetail({ productId, basePath = "" }: MarketplaceProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/perde/marketplace/products?id=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <PerdeNavbar theme="light" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif mb-4">Ürün Bulunamadı</h2>
            <Link href={`${basePath}/collections`} className="text-[#8B7355] hover:underline">
              ← Koleksiyonlara Dön
            </Link>
          </div>
        </div>
        <PerdeFooter />
      </div>
    );
  }

  const allImages = [...(product.images || []), ...(product.aiRenderedImages || [])];
  const currentImage = allImages[selectedImageIndex] || "";

  const unitLabels: Record<string, string> = {
    metre: "/ metre",
    adet: "/ adet",
    set: "/ set",
    "m²": "/ m²",
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity,
      image: allImages[0],
      sellerId: product.sellerId,
    });
    toast.success(`"${product.title}" sepete eklendi!`, { icon: "🛒" });
    openCart();
  };

  const handleTryAtHome = () => {
    window.open(`${basePath}/visualizer?tryProduct=${product.id}&fabric=${encodeURIComponent(allImages[0] || "")}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-zinc-900">
      <PerdeNavbar theme="light" />

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
          <Link href={`${basePath}/collections`} className="hover:text-[#8B7355]">
            Koleksiyonlar
          </Link>
          <span>/</span>
          <span className="text-zinc-700 capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-zinc-700 truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
              {currentImage ? (
                <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-300">
                  <Sparkles className="w-16 h-16 opacity-20" />
                </div>
              )}

              {/* Nav Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((i) => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* AI Badge */}
              {product.aiRenderedImages?.length > 0 && selectedImageIndex >= (product.images?.length || 0) && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3" /> AI İLE TASARLANDI
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      i === selectedImageIndex ? "border-[#8B7355] shadow-md" : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Seller */}
            <div className="flex items-center gap-2 mb-4">
              {product.sellerVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" /> Onaylı Satıcı
                </span>
              )}
              <span className="text-sm text-zinc-400">{product.sellerName}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl lg:text-4xl text-zinc-900 mb-4 leading-tight">{product.title}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-zinc-500">({product.reviewCount} değerlendirme)</span>
                {product.salesCount > 0 && (
                  <span className="text-sm text-zinc-400">• {product.salesCount}+ satış</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mb-8 p-6 bg-white rounded-xl border border-zinc-100">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-zinc-900">
                  ₺{product.price?.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm text-zinc-400">{unitLabels[product.unit] || "/ adet"}</span>
              </div>
              {product.stock > 0 ? (
                <p className="text-xs text-emerald-600 mt-2 font-medium">✓ Stokta var</p>
              ) : (
                <p className="text-xs text-red-500 mt-2 font-medium">✗ Stokta yok</p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-zinc-600">Adet:</span>
              <div className="flex items-center border border-zinc-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(product.minOrder || 1, quantity - 1))}
                  className="p-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-bold min-w-[48px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                  className="p-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {product.minOrder > 1 && (
                <span className="text-xs text-zinc-400">Min. {product.minOrder} {product.unit}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full bg-[#8B7355] text-white py-4 rounded-xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-[#725e45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> SEPETE EKLE
              </button>

              <button
                onClick={handleTryAtHome}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-200"
              >
                <Eye className="w-5 h-5" /> EVİMDE DENE — AI İLE GÖR
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    isFavorite ? "border-red-200 bg-red-50 text-red-600" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} /> Favori
                </button>
                <button className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                  <Share2 className="w-4 h-4" /> Paylaş
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                <Truck className="w-5 h-5 text-[#8B7355]" />
                <div>
                  <p className="text-xs font-bold text-zinc-800">Ücretsiz Kargo</p>
                  <p className="text-[10px] text-zinc-400">500₺ üzeri</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                <RotateCcw className="w-5 h-5 text-[#8B7355]" />
                <div>
                  <p className="text-xs font-bold text-zinc-800">14 Gün İade</p>
                  <p className="text-[10px] text-zinc-400">Koşulsuz</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                <ShieldCheck className="w-5 h-5 text-[#8B7355]" />
                <div>
                  <p className="text-xs font-bold text-zinc-800">Güvenli Ödeme</p>
                  <p className="text-[10px] text-zinc-400">256-bit SSL</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-zinc-100 pt-8">
                <h3 className="font-serif text-xl mb-4">Ürün Açıklaması</h3>
                <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Fabric Details */}
            {product.fabricDetails && (
              <div className="border-t border-zinc-100 pt-8 mt-8">
                <h3 className="font-serif text-xl mb-4">Kumaş Detayları</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.fabricDetails.material && (
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Malzeme</p>
                      <p className="text-sm font-medium">{product.fabricDetails.material}</p>
                    </div>
                  )}
                  {product.fabricDetails.width && (
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Genişlik</p>
                      <p className="text-sm font-medium">{product.fabricDetails.width} cm</p>
                    </div>
                  )}
                  {product.fabricDetails.weight && (
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Ağırlık</p>
                      <p className="text-sm font-medium">{product.fabricDetails.weight}</p>
                    </div>
                  )}
                  {product.fabricDetails.washable !== undefined && (
                    <div className="p-3 bg-zinc-50 rounded-lg">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Yıkanabilir</p>
                      <p className="text-sm font-medium">{product.fabricDetails.washable ? "Evet ✓" : "Hayır"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <PerdeFooter />
    </div>
  );
}

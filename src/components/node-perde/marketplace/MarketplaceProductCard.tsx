"use client";

import { ShieldCheck, Sparkles, Eye, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MarketplaceProductCardProps {
  id: string;
  title: string;
  sellerName?: string;
  price: number;
  currency?: string;
  unit?: string;
  images?: string[];
  aiRenderedImages?: string[];
  category?: string;
  sellerVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  basePath?: string;
  onAddToCart?: (id: string) => void;
  onTryAtHome?: (id: string) => void;
}

export function MarketplaceProductCard({
  id,
  title,
  sellerName,
  price,
  currency = "₺",
  unit = "metre",
  images = [],
  aiRenderedImages = [],
  category,
  sellerVerified = false,
  rating = 0,
  reviewCount = 0,
  salesCount = 0,
  basePath = "",
  onAddToCart,
  onTryAtHome,
}: MarketplaceProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const mainImage = images[0] || aiRenderedImages[0];
  const hoverImage = aiRenderedImages[0] || images[1];

  const categoryLabels: Record<string, string> = {
    perde: "Perde",
    dosemelik: "Döşemelik",
    korniz: "Korniş & Ray",
    stor: "Stor & Zebra",
    pasmanteri: "Pasmanteri",
    "duvar-kagidi": "Duvar Kağıdı",
    "yatak-banyo": "Yatak & Banyo",
    aksesuar: "Aksesuar",
  };

  return (
    <div
      className="bg-white group cursor-pointer hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-zinc-100 rounded-xl overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link href={`${basePath}/products/${id}`}>
        <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
          {mainImage ? (
            <>
              <img
                src={isHovered && hoverImage ? hoverImage : mainImage}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* AI Badge */}
              {aiRenderedImages.length > 0 && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" /> AI TASARIM
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
              <Sparkles className="w-12 h-12 opacity-20" />
            </div>
          )}

          {/* Verified Badge */}
          {sellerVerified && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm text-emerald-600">
              <ShieldCheck className="w-3 h-3" /> Onaylı
            </div>
          )}

          {/* Category Label */}
          {category && (
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[9px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
              {categoryLabels[category] || category}
            </div>
          )}

          {/* Quick Action Overlay */}
          <div className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {onTryAtHome && (
              <button
                onClick={(e) => { e.preventDefault(); onTryAtHome(id); }}
                className="bg-white text-zinc-900 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-[#8B7355] hover:text-white transition-colors"
              >
                <Eye className="w-4 h-4" /> Evimde Dene
              </button>
            )}
            {onAddToCart && (
              <button
                onClick={(e) => { e.preventDefault(); onAddToCart(id); }}
                className="bg-[#8B7355] text-white p-2.5 rounded-lg shadow-xl hover:bg-zinc-900 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <Link href={`${basePath}/products/${id}`} className="flex-1">
            <h3 className="font-semibold text-base text-zinc-900 group-hover:text-[#8B7355] transition-colors line-clamp-1 leading-tight">
              {title}
            </h3>
          </Link>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1 -mt-0.5 ml-2"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-zinc-300 hover:text-red-400"}`}
            />
          </button>
        </div>

        {sellerName && (
          <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
            {sellerName}
            {sellerVerified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
          </p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs ${star <= Math.round(rating) ? "text-amber-400" : "text-zinc-200"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400">({reviewCount})</span>
            {salesCount > 0 && (
              <span className="text-[10px] text-zinc-400 ml-auto">{salesCount}+ satış</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-zinc-50 flex justify-between items-end">
          <div>
            <p className="font-bold text-lg text-zinc-900">
              {currency}
              {price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
              {unit === "metre" ? "/ metre" : unit === "m²" ? "/ m²" : unit === "set" ? "/ set" : "/ adet"}
            </p>
          </div>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(id)}
              className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-[#8B7355] transition-colors"
            >
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

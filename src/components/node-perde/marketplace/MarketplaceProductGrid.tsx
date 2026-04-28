"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MarketplaceProductCard } from "./MarketplaceProductCard";
import { Search, SlidersHorizontal, ChevronDown, X, Sparkles, ShoppingBag, Grid3x3, LayoutGrid, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface MarketplaceProductGridProps {
  basePath?: string;
  initialCategory?: string;
}

const CATEGORIES = [
  { value: "", label: "Tümü", icon: "🏠" },
  { value: "perde", label: "Perde", icon: "🪟" },
  { value: "dosemelik", label: "Döşemelik", icon: "🛋️" },
  { value: "korniz", label: "Korniş & Ray", icon: "📏" },
  { value: "stor", label: "Stor & Zebra", icon: "🪞" },
  { value: "pasmanteri", label: "Pasmanteri", icon: "🎀" },
  { value: "duvar-kagidi", label: "Duvar Kağıdı", icon: "🖼️" },
  { value: "yatak-banyo", label: "Yatak & Banyo", icon: "🛏️" },
  { value: "aksesuar", label: "Aksesuar", icon: "⚙️" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "popular", label: "En Çok Satan" },
  { value: "price_asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "rating", label: "En Yüksek Puan" },
];

export default function MarketplaceProductGrid({ basePath = "", initialCategory = "" }: MarketplaceProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const { addItem, openCart } = useCartStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      if (search) params.set("search", search);
      params.set("limit", "48");

      const res = await fetch(`/api/perde/marketplace/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Ürün yükleme hatası:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || product.aiRenderedImages?.[0],
      sellerId: product.sellerId,
    });

    toast.success(`"${product.title}" sepete eklendi!`, { icon: "🛒" });
    openCart();
  };

  const handleTryAtHome = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // AI Try-at-Home: Visualizer'a yönlendir
    const fabricImage = product.images?.[0] || product.aiRenderedImages?.[0];
    if (fabricImage) {
      window.open(`${basePath}/visualizer?tryProduct=${productId}`, "_blank");
    } else {
      toast.error("Bu ürün için görsel bulunamadı");
    }
  };

  const activeCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün, kumaş veya marka ara..."
            className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-xl text-sm focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 outline-none transition-all bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-zinc-400 hover:text-zinc-700" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-lg px-4 py-2.5 pr-8 text-xs font-medium text-zinc-700 cursor-pointer focus:border-[#8B7355] outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>

          {/* Grid toggle */}
          <div className="hidden sm:flex border border-zinc-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setGridCols(3)}
              className={`p-2 ${gridCols === 3 ? "bg-zinc-100" : "bg-white hover:bg-zinc-50"}`}
            >
              <Grid3x3 className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-2 ${gridCols === 4 ? "bg-zinc-100" : "bg-white hover:bg-zinc-50"}`}
            >
              <LayoutGrid className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 rounded-lg text-xs font-medium hover:bg-zinc-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtrele
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-zinc-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              category === cat.value
                ? "bg-[#8B7355] text-white shadow-lg shadow-[#8B7355]/20"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-zinc-500">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
            </span>
          ) : (
            <>
              <strong className="text-zinc-900">{products.length}</strong> ürün bulundu
              {activeCategory && activeCategory.value && (
                <span className="ml-1">— {activeCategory.label}</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
            <p className="text-zinc-400 text-sm font-medium">Ürünler yükleniyor...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ShoppingBag className="w-16 h-16 text-zinc-200 mb-6" />
          <h3 className="text-xl font-semibold text-zinc-800 mb-2">Henüz ürün yok</h3>
          <p className="text-zinc-400 text-sm max-w-md">
            {search
              ? `"${search}" araması için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.`
              : "Bu kategoride henüz ürün eklenmemiş. Çok yakında yeni ürünler eklenecek!"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-6 px-6 py-2.5 bg-[#8B7355] text-white text-sm rounded-lg font-medium hover:bg-[#725e45] transition-colors"
            >
              Aramayı Temizle
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            gridCols === 4
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {products.map((product) => (
            <MarketplaceProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              sellerName={product.sellerName}
              price={product.price}
              currency="₺"
              unit={product.unit}
              images={product.images}
              aiRenderedImages={product.aiRenderedImages}
              category={product.category}
              sellerVerified={product.sellerVerified}
              rating={product.rating}
              reviewCount={product.reviewCount}
              salesCount={product.salesCount}
              basePath={basePath}
              onAddToCart={handleAddToCart}
              onTryAtHome={handleTryAtHome}
            />
          ))}
        </div>
      )}
    </div>
  );
}

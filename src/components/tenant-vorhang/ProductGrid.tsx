"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Filter, ChevronDown, Check } from "lucide-react";

const CATEGORIES = ["Alle", "Vorhänge", "Stoffe", "Rollos", "Zubehör"];
const COLORS = ["Beige", "Grau", "Blau", "Weiß", "Schwarz", "Grün"];

// Mock Data
const MOCK_PRODUCTS = [
  { id: "1", title: "Premium Leinen Vorhang", seller: "Hometex Elite", price: 249.99, imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80", isVerified: true, category: "Vorhänge", color: "Beige" },
  { id: "2", title: "Blackout Samt", seller: "Kaya Tekstil", price: 189.50, imageUrl: "https://images.unsplash.com/photo-1543169720-6d306b9b3e1a?w=600&q=80", isVerified: true, category: "Vorhänge", color: "Blau" },
  { id: "3", title: "Tüll Transparent", seller: "Gencer Weavers", price: 120.00, imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80", isVerified: false, category: "Vorhänge", color: "Weiß" },
  { id: "4", title: "Zebra Rollo", seller: "SmartShade", price: 89.99, imageUrl: "https://images.unsplash.com/photo-1588636730303-39fba087a313?w=600&q=80", isVerified: true, category: "Rollos", color: "Grau" },
  { id: "5", title: "Outdoor Stoff (Meterware)", seller: "SunTextiles", price: 45.00, imageUrl: "https://images.unsplash.com/photo-1584839846270-22e8964e5c54?w=600&q=80", isVerified: true, category: "Stoffe", color: "Grün" },
  { id: "6", title: "Vorhangstange (Gold)", seller: "MetalCraft", price: 115.00, imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", isVerified: true, category: "Zubehör", color: "Gold" },
];

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    if (activeCategory !== "Alle" && p.category !== activeCategory) return false;
    if (activeColor && p.color !== activeColor) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-black border-b border-gray-200 pb-2">Kategorien</h3>
          <ul className="space-y-2">
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <button 
                  onClick={() => setActiveCategory(cat)}
                  className={`text-sm hover:text-[#D4AF37] transition-colors ${activeCategory === cat ? 'font-bold text-[#D4AF37]' : 'text-gray-600'}`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase mb-4 text-black border-b border-gray-200 pb-2">Farbe</h3>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setActiveColor(activeColor === color ? null : color)}
                className={`px-3 py-1 border text-xs transition-colors rounded-sm ${activeColor === color ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-500">{filteredProducts.length} Produkte gefunden</span>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
            Sortieren nach <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Keine Produkte für diese Filter gefunden.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

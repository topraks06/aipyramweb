"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Filter, ChevronDown, Check } from "lucide-react";

const CATEGORIES = ["Alle", "Vorhänge", "Stoffe", "Rollos", "Zubehör"];
const COLORS = ["Beige", "Grau", "Blau", "Weiß", "Schwarz", "Grün"];

// Mock data removed

export function ProductGrid({ products = [] }: { products?: any[] }) {
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const displayProducts = products;

  const filteredProducts = displayProducts.filter(p => {
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

        {products.length === 0 ? (
          <div className="text-center py-32 text-gray-500 border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium tracking-widest uppercase">Produkte werden vorbereitet...</p>
            <p className="text-xs text-gray-400 mt-2">Die KI generiert gerade die neuesten Kollektionen.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
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

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Loader2, Globe, Filter, Tag, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GlobalCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'hometex_products'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch hometex products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight flex items-center gap-3">
            <Globe className="text-[#8B7355] w-10 h-10" />
            Global B2B Catalog
          </h1>
          <p className="text-zinc-500 mt-4 max-w-xl text-lg font-light">
            Discover premium textiles, fabrics, and home decor from verified suppliers worldwide. AI-curated for your B2B sourcing needs.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-4">
          <button className="flex items-center gap-2 border border-zinc-300 px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-32 text-center text-zinc-500 flex flex-col items-center">
          <Layers className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-lg">Katalog şu an boş. Lütfen "Ingestion" modülü ile ürün ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/sites/hometex/catalog/${product.slug}`} className="group cursor-pointer">
              <Card className="bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-zinc-100">
                  <img 
                    src={product.image_url} 
                    alt={product.title_en} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {product.tags?.slice(0,2).map((tag: string, i: number) => (
                      <span key={i} className="bg-white/90 backdrop-blur-sm text-zinc-800 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <span className="text-[10px] text-[#8B7355] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {product.material}
                  </span>
                  <h3 className="text-lg font-serif text-zinc-900 mb-2 line-clamp-1">{product.title_en}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-grow font-light">
                    {product.description_en}
                  </p>
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-zinc-300" style={{backgroundColor: product.color_hex || '#ccc'}}></span>
                      <span className="text-xs text-zinc-600 font-medium">{product.color}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#8B7355] transition-colors group-hover:translate-x-1 duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

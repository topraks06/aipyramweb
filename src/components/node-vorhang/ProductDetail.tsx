"use client";

import { Camera, ShieldCheck, ShoppingCart, Info, Star } from "lucide-react";
import Link from "next/link";
import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { useCartStore } from "@/store/useCartStore";

export function ProductDetail({ id, product: propProduct, seller: propSeller }: { id: string, product?: any, seller?: any }) {
  const { addItem, openCart } = useCartStore();
  if (!propProduct) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-gray-500 uppercase tracking-widest text-sm">Produkt nicht gefunden</p>
      </div>
    );
  }

  const product = {
    id: propProduct.id || id,
    title: propProduct.name || propProduct.title || "Unknown Product",
    seller: propSeller?.name || propProduct.sellerName || "Unknown Seller",
    price: propProduct.price || 0,
    rating: propProduct.rating || 0,
    reviews: propProduct.reviewCount || 0,
    description: propProduct.description || "",
    images: propProduct.images || null,
    specs: propProduct.specs || []
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.images ? product.images[0] : undefined,
      sellerId: product.seller
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <VorhangNavbar />
      
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
               {product.images && product.images.length > 0 ? (
                 <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Produktbild</p>
                 </div>
               )}
               <span className="absolute top-4 right-4 bg-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 shadow-md text-black">
                  <ShieldCheck className="w-3 h-3 text-green-600" /> Trust Score: 98/100
               </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3,4].map((i, index) => (
                 <div key={i} className="aspect-square bg-gray-50 border border-gray-100 hover:border-black cursor-pointer transition-colors overflow-hidden">
                   {product.images && product.images[index] && (
                     <img src={product.images[index]} alt="" className="w-full h-full object-cover" />
                   )}
                 </div>
               ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-gray-500 hover:text-black transition-colors cursor-pointer">{product.seller}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                 <Star className="w-4 h-4 fill-current" />
                 <span className="text-black font-medium">{product.rating}</span>
                 <span className="text-gray-400">({product.reviews})</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif mb-4">{product.title}</h1>
            
            <div className="mb-8">
              <p className="text-3xl font-bold">€{product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Pro Laufmeter (zzgl. MwSt.)</p>
            </div>

            <div className="prose prose-sm text-gray-600 mb-8">
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               {product.specs.map(spec => (
                 <div key={spec.label} className="border-b border-gray-100 pb-2">
                    <p className="text-xs text-gray-400 uppercase mb-1">{spec.label}</p>
                    <p className="font-medium">{spec.value}</p>
                 </div>
               ))}
            </div>

            <div className="mt-auto space-y-4">
              <Link 
                href={`/try-at-home?fabric=${id}`}
                className="w-full bg-black text-white px-6 py-4 rounded-sm font-medium flex items-center justify-center gap-2 hover:bg-[#D4AF37] transition-all"
              >
                <Camera className="w-5 h-5" />
                In Ihrem Raum ansehen (KI-Render)
              </Link>
              
              <button 
                onClick={handleAddToCart}
                className="w-full border border-black text-black px-6 py-4 rounded-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                In den Warenkorb
              </button>
            </div>
            
            <div className="mt-6 bg-gray-50 p-4 rounded text-sm text-gray-500 flex items-start gap-3">
               <Info className="w-5 h-5 shrink-0 text-gray-400" />
               <p>Dieser Händler ist verifiziert. Zahlungen werden treuhänderisch verwaltet, bis die Ware geprüft wurde.</p>
            </div>
          </div>
        </div>
      </main>
      <VorhangFooter />
    </div>
  );
}

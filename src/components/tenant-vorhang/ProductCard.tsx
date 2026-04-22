import { ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  seller: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  isVerified?: boolean;
}

export function ProductCard({ 
  id, 
  title, 
  seller, 
  price, 
  currency = "€", 
  imageUrl, 
  isVerified = true 
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="block">
      <div className="bg-white p-4 border border-gray-100 shadow-sm group cursor-pointer hover:shadow-xl transition-all h-full flex flex-col">
        <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Sparkles className="w-8 h-8 opacity-20" />
            </div>
          )}
          
          {isVerified && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              Geprüft
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start flex-1">
          <div>
            <h3 className="font-medium text-lg text-black group-hover:text-[#D4AF37] transition-colors line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-2">{seller}</p>
          </div>
          <div className="text-right pl-2 shrink-0">
            <p className="font-bold text-black">{currency}{price.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400 uppercase">Pro Meter</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

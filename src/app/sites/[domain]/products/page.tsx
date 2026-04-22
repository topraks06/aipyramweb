import VorhangNavbar from "@/components/tenant-vorhang/VorhangNavbar";
import { ProductGrid } from "@/components/tenant-vorhang/ProductGrid";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <VorhangNavbar />
      
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-serif mb-2 text-black">Stoffkollektion</h1>
            <p className="text-gray-500">Finden Sie den perfekten Stoff für Ihr nächstes Projekt.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <input 
                 type="text" 
                 placeholder="Suchen..." 
                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#D4AF37]"
               />
               <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
             </div>
          </div>
        </div>

        <ProductGrid />
      </main>
    </div>
  );
}

import VorhangNavbar from "@/components/tenant-vorhang/VorhangNavbar";
import { ProductGrid } from "@/components/tenant-vorhang/ProductGrid";
import { Search } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import VorhangFooter from "@/components/tenant-vorhang/VorhangFooter";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products = [];
  try {
    const productsSnap = await adminDb.collection('vorhang_products').get();
    products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching vorhang products:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col">
      <VorhangNavbar />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-serif mb-4 text-black">Stoffkollektion</h1>
            <p className="text-gray-500 text-lg">Finden Sie den perfekten Stoff für Ihr nächstes Projekt.</p>
          </div>
        </div>

        <ProductGrid products={products} />
      </main>

      <VorhangFooter />
    </div>
  );
}

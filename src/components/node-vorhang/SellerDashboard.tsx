"use client";

import VorhangNavbar from "./VorhangNavbar";
import { LineChart, LayoutDashboard, Package, ShoppingBag, Settings, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SellerDashboard({ orders = [], seller }: { orders?: any[], seller?: any }) {
  const sellerName = seller?.name || "Weber Textil";
  const displayOrders = orders || [];

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <VorhangNavbar />
      
      <div className="pt-20 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden md:block">
           <div className="p-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Seller Hub</div>
              <nav className="space-y-2">
                 <Link href="#" className="flex items-center gap-3 text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-2.5 rounded font-medium">
                   <LayoutDashboard className="w-5 h-5" /> Übersicht
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded font-medium transition-colors">
                   <Package className="w-5 h-5" /> Produkte
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded font-medium transition-colors">
                   <ShoppingBag className="w-5 h-5" /> Bestellungen
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded font-medium transition-colors">
                   <LineChart className="w-5 h-5" /> Analysen
                 </Link>
                 <Link href="#" className="flex items-center gap-3 text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded font-medium transition-colors">
                   <Settings className="w-5 h-5" /> Einstellungen
                 </Link>
              </nav>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
           <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif">Willkommen, {sellerName}!</h1>
              <button className="bg-black text-white px-4 py-2 rounded-sm font-medium flex items-center gap-2 hover:bg-[#D4AF37] transition-colors">
                <Plus className="w-4 h-4" /> Neues Produkt
              </button>
           </div>

           {/* Quick Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[
                { label: "Umsatz (Monat)", value: "€42,500", trend: "+12.5%", isUp: true },
                { label: "KI-Renderings", value: "1,204", trend: "+45%", isUp: true },
                { label: "Conversion Rate", value: "8.4%", trend: "+1.2%", isUp: true }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                   <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                   <div className="flex items-end gap-4">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className={`text-sm flex items-center gap-1 mb-1 ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                         {stat.isUp && <TrendingUp className="w-3 h-3" />}
                         {stat.trend}
                      </p>
                   </div>
                </div>
              ))}
           </div>

           {/* Recent Activity */}
           <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                 <h2 className="font-medium text-lg">Aktuelle Bestellungen</h2>
              </div>
              <div className="divide-y divide-gray-50">
                 {displayOrders.map((order, i) => (
                    <div key={order.id || i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                             <Package className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-medium">Bestellung #VH-{order.id}</p>
                             <p className="text-sm text-gray-500">{order.item || 'Produkt'} • {(order.items?.length || 1)}x</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-medium">€{(order.amount || order.amountEur || 0).toFixed(2)}</p>
                          <p className="text-xs text-yellow-600 bg-yellow-50 inline-block px-2 py-0.5 rounded mt-1">{order.status || 'In Bearbeitung'}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

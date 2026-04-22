"use client";

import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// TODO: Replace with global state (e.g. Zustand) or context later.
export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Mock Cart Items
  const [items, setItems] = useState([
    {
      id: "prod-101",
      title: "Premium Leinen Vorhang",
      seller: "Hometex Elite",
      price: 249.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
    },
    {
      id: "prod-102",
      title: "Blackout Samt (Dunkelblau)",
      seller: "Kaya Tekstil",
      price: 189.50,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1543169720-6d306b9b3e1a?w=400&q=80",
    }
  ]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <span className="font-bold text-lg tracking-wider">WARENKORB</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
              <p>Ihr Warenkorb ist leer.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm leading-tight text-black">{item.title}</h4>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.seller}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Stk: {item.quantity}</span>
                    <span className="font-bold text-sm">€{item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50 flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Zwischensumme</span>
              <span className="font-bold text-lg">€{total.toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full bg-black text-white py-4 font-bold tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-yellow-600 transition-colors"
            >
              ZUR KASSE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

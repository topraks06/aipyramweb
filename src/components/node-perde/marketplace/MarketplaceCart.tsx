"use client";

import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export function MarketplaceCart({ basePath = "" }: { basePath?: string }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();

  const FREE_SHIPPING_THRESHOLD = 500;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] max-w-[100vw] bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8B7355]" />
            <span className="font-bold text-lg tracking-wider text-zinc-900">SEPET</span>
            <span className="text-xs text-zinc-400 ml-1">({items.length})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            {remainingForFreeShipping > 0 ? (
              <>
                <p className="text-xs text-amber-700 font-medium mb-2">
                  🚚 Ücretsiz kargoya <strong>₺{remainingForFreeShipping.toFixed(0)}</strong> kaldı!
                </p>
                <div className="w-full bg-amber-200/50 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">
                ✅ Ücretsiz kargo kazandınız!
              </p>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <ShoppingBag className="w-14 h-14 mb-4 opacity-30" />
              <p className="font-medium mb-2">Sepetiniz boş</p>
              <p className="text-xs text-zinc-400 text-center max-w-[220px]">
                Koleksiyonlardan beğendiğiniz ürünleri sepete ekleyin.
              </p>
              <Link
                href={`${basePath}/collections`}
                onClick={closeCart}
                className="mt-6 px-6 py-2.5 bg-[#8B7355] text-white text-xs font-bold rounded-lg hover:bg-[#725e45] transition-colors"
              >
                ALIŞVERİŞE BAŞLA
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm leading-tight text-zinc-900 line-clamp-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-300 hover:text-red-500 transition-colors ml-2 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-zinc-200 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-zinc-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold min-w-[28px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-zinc-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm text-zinc-900">
                      ₺{(item.price * item.quantity).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 p-6 bg-zinc-50/80 flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Ara Toplam</span>
                <span className="font-medium">
                  ₺{total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Kargo</span>
                <span className={`font-medium ${total >= FREE_SHIPPING_THRESHOLD ? "text-emerald-600" : ""}`}>
                  {total >= FREE_SHIPPING_THRESHOLD ? "Ücretsiz" : "₺49.90"}
                </span>
              </div>
              <div className="h-px bg-zinc-200 my-1" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Toplam</span>
                <span className="font-bold text-xl text-zinc-900">
                  ₺{(total + (total >= FREE_SHIPPING_THRESHOLD ? 0 : 49.9)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Link
              href={`${basePath}/checkout`}
              onClick={closeCart}
              className="w-full bg-[#8B7355] text-white py-4 rounded-xl font-bold tracking-wider text-xs flex justify-center items-center gap-2 hover:bg-[#725e45] transition-colors"
            >
              ÖDEMEYE GEÇ <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-zinc-500 hover:text-[#8B7355] transition-colors py-1"
            >
              Alışverişe Devam Et
            </button>
          </div>
        )}
      </div>
    </>
  );
}

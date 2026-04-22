import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle, Clock, Package, MessageCircle, PlayCircle, AlertCircle, Download, Phone, RefreshCw } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useTenantAuth } from '@/hooks/useTenantAuth';

interface OrderSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
}

export default function OrderSlideOver({ isOpen, onClose, order }: OrderSlideOverProps) {
  const { tenantId } = useTenantAuth('perde');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    if (!tenantId || !order.id) return;
    setIsUpdating(true);
    try {
      const config = require('@/lib/tenant-config').getTenant(tenantId);
      const docRef = doc(db, config.projectCollection, order.id);
      await updateDoc(docRef, { status: newStatus });
      onClose(); // close panel to see updated table
    } catch (err) {
      console.error(err);
      alert('Güncelleme başarısız');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `Merhaba, sizin için hazırladığımız teklif hazır.\nİncelemek için: ${order.mediaUrls?.[0] || 'Yakında hazır olacak'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCall = () => {
     window.open(`tel:${order.customerPhone || ''}`);
  };

  const handleDownload = () => {
     if (order.mediaUrls?.[0]) window.open(order.mediaUrls[0], '_blank');
  };

  const handleRefreshMock = () => {
     alert("Fiyatlar güncelleniyor (Yapay zeka asistanı yeniden hesaplıyor...)");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col border-l border-zinc-200"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-lg font-serif tracking-tight text-zinc-900">Sipariş Detayı</h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-900">{order.customerName || 'İsimsiz Müşteri'}</span>
                    <span className="text-xs text-zinc-400">#{order.id?.substring(0, 8) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="tabular-nums">
                      {order.createdAt?.seconds 
                        ? new Date(order.createdAt.seconds * 1000).toLocaleString('tr-TR') 
                        : 'Tarih Yok'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Sipariş Durumu</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">Teklif İletildi</p>
                        <p className="text-xs text-zinc-500">Müşteriye PDF veya WhatsApp gönderildi.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['s2', 's3', 's4'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {['s2', 's3', 's4'].includes(order.status) ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">Müşteri Onayı & Üretim</p>
                        <p className="text-xs text-zinc-500">{order.status === 's1' ? 'Müşteri onayı bekleniyor.' : 'Onaylandı, üretime alındı.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Resmi Teklif Belgesi (PDF)</h3>
                  {order.mediaUrls && order.mediaUrls.length > 0 ? (
                    <div className="border border-zinc-200 rounded-lg overflow-hidden">
                      <iframe 
                        src={`${order.mediaUrls[0]}#toolbar=0`} 
                        className="w-full h-64 bg-zinc-50"
                        title="Proforma Özeti"
                      />
                      <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
                        <span className="text-xs text-zinc-500 font-medium truncate flex-1">
                          {order.title || 'Proforma'}
                        </span>
                        <a 
                          href={order.mediaUrls[0]} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-4 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Aç
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-zinc-200 rounded-lg text-center bg-zinc-50/50">
                      <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500 font-medium">PDF henüz üretilmemiş</p>
                      <p className="text-xs text-zinc-400 mt-1">Chat üzerinden 'teklif çıkart' diyerek otonom ürettirebilirsiniz.</p>
                    </div>
                  )}
                </div>

                {order.items && order.items.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Sipariş Kalemleri</h3>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0 border-dashed">
                          <span className="text-sm text-zinc-700">{item.name} {item.qty && `(x${item.qty})`}</span>
                          {item.price && <span className="text-sm font-medium text-zinc-900">${item.price}</span>}
                        </div>
                      ))}
                      {order.amount && (
                         <div className="flex justify-between items-center pt-2 mt-2 font-semibold border-t border-zinc-200">
                            <span className="text-sm text-zinc-900">Toplam</span>
                            <span className="text-sm text-zinc-900">${order.amount}</span>
                         </div>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-3">
              {order.status === 's1' && (
                <div className="flex gap-2">
                   <button 
                     disabled={isUpdating}
                     onClick={() => handleUpdateStatus('s2')}
                     className="flex-1 py-3 bg-emerald-600 text-white flex items-center justify-center gap-2 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                   >
                     <PlayCircle className="w-5 h-5" />
                     Siparişi Üretime Al
                   </button>
                   <button 
                     onClick={handleRefreshMock}
                     className="px-4 py-3 bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center gap-2 rounded-md text-sm hover:bg-zinc-100"
                     title="Fiyat Güncelle + Tekrar Gönder"
                   >
                     <RefreshCw className="w-5 h-5" />
                   </button>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleWhatsApp}
                  className="py-2.5 bg-green-500 text-white flex items-center justify-center gap-2 rounded-md text-xs font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button 
                  onClick={handleCall}
                  className="py-2.5 bg-blue-500 text-white flex items-center justify-center gap-2 rounded-md text-xs font-semibold hover:bg-blue-600 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Müşteriyi Ara
                </button>
              </div>

              <div className="flex gap-3 pt-2 border-t border-zinc-200">
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-2.5 bg-zinc-900 text-white flex items-center justify-center gap-2 rounded-md text-sm font-semibold hover:bg-zinc-800 transition-colors"
                >
                  <Download className="w-4 h-4" /> PDF İndir
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center gap-2 rounded-md text-sm font-semibold hover:bg-zinc-50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

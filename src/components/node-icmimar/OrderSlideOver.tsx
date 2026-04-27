import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle, Clock, Package, MessageCircle, PlayCircle, AlertCircle, Download, Phone, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';

interface OrderSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
  isCreateMode?: boolean;
}

export default function OrderSlideOver({ isOpen, onClose, order, isCreateMode }: OrderSlideOverProps) {
  const { user, SovereignNodeId } = useSovereignAuth('icmimar');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Create mode form state
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    title: '',
    amount: ''
  });

  if (!isOpen) return null;
  if (!order && !isCreateMode) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SovereignNodeId || !user) return;
    setIsUpdating(true);
    try {
      const config = require('@/lib/sovereign-config').getNode(SovereignNodeId);
      await addDoc(collection(db, config.projectCollection), {
        ...newOrder,
        amount: Number(newOrder.amount),
        grandTotal: Number(newOrder.amount),
        status: 's1', // Teklif status
        source: 'manual',
        authorId: user.uid,
        SovereignNodeId,
        createdAt: Timestamp.now()
      });
      onClose();
      setNewOrder({ customerName: '', customerEmail: '', customerPhone: '', title: '', amount: '' });
    } catch (err) {
      console.error(err);
      alert('Kayıt başarısız');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!SovereignNodeId || !order?.id) return;
    setIsUpdating(true);
    try {
      const config = require('@/lib/sovereign-config').getNode(SovereignNodeId);
      const docRef = doc(db, config.projectCollection, order.id);
      await updateDoc(docRef, { status: newStatus });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Güncelleme başarısız');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsApp = () => {
    if(!order) return;
    const text = `Merhaba, sizin için hazırladığımız teklif hazır.\nİncelemek için: ${order.mediaUrls?.[0] || 'Yakında hazır olacak'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCall = () => {
     if(!order) return;
     window.open(`tel:${order.customerPhone || ''}`);
  };

  const handleDownload = () => {
     if (order?.mediaUrls?.[0]) window.open(order.mediaUrls[0], '_blank');
  };

  const handleRefreshPricing = async () => {
     window.dispatchEvent(new CustomEvent('open_icmimar_ai_assistant', { detail: { attention: true } }));
     window.dispatchEvent(new CustomEvent('agent_message', {
       detail: { message: `🔄 Fiyat güncelleme talebi alındı. Sipariş #${order?.id?.substring(0, 8) || ''} için canlı piyasa verilerine göre yeniden hesaplama yapılıyor...` }
     }));

     try {
       const res = await fetch('/api/icmimar/b2b-calc', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ action: 'refresh_pricing', orderId: order?.id, currentItems: order?.items })
       });
       const data = await res.json();
       if (data.newTotal) {
           window.dispatchEvent(new CustomEvent('agent_message', {
             detail: { message: `✅ Hesaplama tamamlandı. Yeni Tutar: ${data.newTotal} TL.` }
           }));
       }
     } catch (e) {
        console.error(e);
     }
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
              <h2 className="text-lg font-serif tracking-tight text-zinc-900">
                {isCreateMode ? 'Yeni Fiş / Sipariş' : 'Sipariş Detayı'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isCreateMode ? (
                <div className="p-6">
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Müşteri Adı</label>
                      <input required type="text" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full border border-zinc-200 p-2 text-sm rounded focus:outline-none focus:border-zinc-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Telefon</label>
                      <input type="text" value={newOrder.customerPhone} onChange={e => setNewOrder({...newOrder, customerPhone: e.target.value})} className="w-full border border-zinc-200 p-2 text-sm rounded focus:outline-none focus:border-zinc-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">İş/Proje Adı</label>
                      <input required type="text" value={newOrder.title} onChange={e => setNewOrder({...newOrder, title: e.target.value})} className="w-full border border-zinc-200 p-2 text-sm rounded focus:outline-none focus:border-zinc-400" placeholder="Örn: Salon Fon Icmimar" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Toplam Tutar (TL)</label>
                      <input required type="number" step="0.01" value={newOrder.amount} onChange={e => setNewOrder({...newOrder, amount: e.target.value})} className="w-full border border-zinc-200 p-2 text-sm rounded focus:outline-none focus:border-zinc-400" />
                    </div>
                    <button type="submit" disabled={isUpdating} className="w-full mt-6 bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest py-3 rounded hover:bg-zinc-800 transition-colors flex justify-center items-center">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Siparişi Kaydet'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-900">{order?.customerName || 'İsimsiz Müşteri'}</span>
                      <span className="text-xs text-zinc-400">#{order?.id?.substring(0, 8) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span className="tabular-nums">
                        {order?.createdAt?.seconds 
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
                          <p className="text-xs text-zinc-500">Sistemde oluşturuldu.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['s2', 's3', 's4'].includes(order?.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {['s2', 's3', 's4'].includes(order?.status) ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">Müşteri Onayı & Üretim</p>
                          <p className="text-xs text-zinc-500">{order?.status === 's1' ? 'Müşteri onayı bekleniyor.' : 'Onaylandı, üretime alındı.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Resmi Teklif Belgesi (PDF)</h3>
                    {order?.mediaUrls && order.mediaUrls.length > 0 ? (
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

                  {order?.items && order.items.length > 0 && (
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
              )}
            </div>

            {!isCreateMode && order && (
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-3">
                {order.status === 's1' && (
                  <div className="flex flex-col gap-2">
                     <div className="flex gap-2">
                       <button 
                         disabled={isUpdating}
                         onClick={() => handleUpdateStatus('s2')}
                         className="flex-1 py-3 bg-emerald-600 text-white flex items-center justify-center gap-2 rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                       >
                         <PlayCircle className="w-5 h-5" />
                         Siparişi Üretime Al (Manuel)
                       </button>
                       <button 
                         onClick={handleRefreshPricing}
                         className="px-4 py-3 bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center gap-2 rounded-md text-sm hover:bg-zinc-100"
                         title="Fiyat Güncelle"
                       >
                         <RefreshCw className="w-5 h-5" />
                       </button>
                     </div>
                     
                     <button 
                         onClick={async () => {
                           setIsUpdating(true);
                           try {
                              const res = await fetch('/api/stripe/checkout', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    type: 'marketplace', 
                                    payload: { 
                                      orderId: order.id, 
                                      customerEmail: order.customerEmail || '',
                                      lineItems: order.items?.map((item: any) => ({
                                        name: item.name || 'İcmimar.ai Sipariş',
                                        amountEur: item.price || order.amount || 0,
                                        quantity: item.qty || 1
                                      })) || [{ name: 'Sipariş Ödemesi', amountEur: order.amount || 0, quantity: 1 }],
                                      successUrl: `${window.location.origin}/b2b?payment=success`,
                                      cancelUrl: `${window.location.origin}/b2b?payment=cancelled`
                                    } 
                                  })
                              });
                              const data = await res.json();
                              if (data.url) {
                                  // Müşteriye linki kopyala veya WhatsApp'a at
                                  navigator.clipboard.writeText(data.url);
                                  alert('Ödeme linki kopyalandı! Müşteriye gönderebilirsiniz.');
                              } else {
                                  alert(data.error || 'Ödeme linki oluşturulamadı.');
                              }
                           } catch (err) {
                              alert('Hata oluştu');
                           } finally {
                              setIsUpdating(false);
                           }
                         }}
                         disabled={isUpdating || !order.amount}
                         className="w-full py-3 bg-blue-600 text-white flex items-center justify-center gap-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                       >
                         <CheckCircle className="w-5 h-5" />
                         Stripe Ödeme Linki Oluştur
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
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

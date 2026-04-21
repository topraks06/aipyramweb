import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Building, MapPin, Phone, Mail, 
  Calendar, ShoppingBag, Plus, Send, Package, Truck, Loader2, Home as HomeIcon, Image as ImageIcon, FileText, Printer, MessageSquare
} from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

interface OrderSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  aiSuggestedProducts?: string[];
}

interface Room {
  id: string;
  name: string;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  qty: number;
  dimensions: string;
  supplyMethod: string;
  price: number;
}

export function OrderSlideOver({ isOpen, onClose, aiSuggestedProducts = [] }: OrderSlideOverProps) {
  const { user, tenantId } = usePerdeAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // MULTI-ROOM STATE
  const [rooms, setRooms] = useState<Room[]>([
    {
       id: 'yatakodasi',
       name: 'Yatak OdasÄ±',
       products: [
         { id: 1, name: aiSuggestedProducts[0] || 'ZÃ¼mrÃ¼t YeÅŸili Kadife Fon Perde', qty: 2, dimensions: '150x270 cm', supplyMethod: 'toptanci', price: 4500 }
       ]
    },
    {
       id: 'salon',
       name: 'Salon',
       products: [
         { id: 2, name: aiSuggestedProducts[1] || 'KÄ±rÄ±k Beyaz Keten TÃ¼l', qty: 1, dimensions: '400x270 cm', supplyMethod: 'stok', price: 2100 }
       ]
    }
  ]);
  
  const [activeRoomId, setActiveRoomId] = useState<string>('yatakodasi');
  const [newRoomName, setNewRoomName] = useState('');

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const addRoom = () => {
    if (!newRoomName.trim()) return;
    const newId = newRoomName.toLowerCase().replace(/\s+/g, '');
    setRooms([...rooms, { id: newId, name: newRoomName, products: [] }]);
    setActiveRoomId(newId);
    setNewRoomName('');
  };

  const addProductToActiveRoom = () => {
    setRooms(rooms.map(room => {
      if (room.id === activeRoomId) {
        return {
          ...room,
          products: [...room.products, { id: Date.now(), name: 'TÄ±klayÄ±p Ã¼rÃ¼n adÄ±nÄ± girin...', qty: 1, dimensions: '200x250', supplyMethod: 'perdeai', price: 0 }]
        };
      }
      return room;
    }));
  };

  const calculateGrandTotal = () => {
      let total = 0;
      rooms.forEach(r => r.products.forEach(p => total += (p.price * p.qty)));
      return total;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Slide Over Panel - GENÄ°ÅLETÄ°LDÄ° */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-3xl bg-zinc-950 border-l border-white/10 z-50 flex flex-col font-sans text-white overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/50">
              <div>
                 <h2 className="font-serif text-2xl flex items-center gap-2">
                   <FileText className="w-5 h-5 text-accent" /> AkÄ±llÄ± Teklif & SipariÅŸ Formu
                 </h2>
                 <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                   ALOHA Otonom ModÃ¼lÃ¼ / Multi-Room
                 </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
              
              {/* 1. MÃ¼ÅŸteri Bilgileri */}
              <section>
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <User className="w-4 h-4 text-zinc-400" /> MÃ¼ÅŸteri Bilgileri
                   </h3>
                   <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
                      <button 
                        onClick={() => setCustomerType('bireysel')}
                        className={`text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-md transition-colors ${customerType === 'bireysel' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Bireysel
                      </button>
                      <button 
                        onClick={() => setCustomerType('kurumsal')}
                        className={`text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-md transition-colors ${customerType === 'kurumsal' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                      >
                        Kurumsal
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{customerType === 'kurumsal' ? 'Firma ÃœnvanÄ±' : 'Ad Soyad'}</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors" 
                      placeholder={customerType === 'kurumsal' ? 'Ã–rn: XYZ MimarlÄ±k A.Å.' : 'Ã–rn: Ahmet YÄ±lmaz'} 
                    />
                  </div>

                  <div className="col-span-2 mt-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Montaj / Fatura Adresi</label>
                    <div className="flex relative">
                      <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                      <textarea 
                        rows={2} 
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none" 
                        placeholder="AÃ§Ä±k adres giriniz..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. MULTI-ROOM QUOTE GENERATOR - TABS */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                     <HomeIcon className="w-4 h-4 text-accent" /> YapÄ± & Odalar
                   </h3>
                   <div className="flex bg-zinc-900 border border-white/10 rounded-lg p-1">
                      <input 
                         type="text" 
                         value={newRoomName}
                         onChange={(e) => setNewRoomName(e.target.value)}
                         placeholder="Ã–rn: Ã‡ocuk OdasÄ±"
                         className="bg-transparent border-none text-[10px] uppercase font-bold text-white px-3 w-32 focus:outline-none"
                      />
                      <button 
                        onClick={addRoom}
                        className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-white text-black rounded-md hover:bg-zinc-200"
                      >
                        <Plus className="w-3 h-3" /> Ekle
                      </button>
                   </div>
                 </div>

                 {/* TABS */}
                 <div className="flex space-x-2 overflow-x-auto pb-4 custom-scrollbar">
                    {rooms.map(room => (
                        <button
                          key={room.id}
                          onClick={() => setActiveRoomId(room.id)}
                          className={`flex-shrink-0 px-5 py-2.5 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeRoomId === room.id ? 'border-accent text-black bg-accent' : 'border-white/10 text-zinc-500 hover:text-white'}`}
                        >
                          {room.name}
                        </button>
                    ))}
                 </div>

                 {/* ACTIVE ROOM CONTENT */}
                 {activeRoom && (
                   <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mt-2 relative overflow-hidden">
                     {/* Watermark */}
                     <div className="absolute -right-4 -top-4 text-8xl opacity-[0.03] font-serif font-bold italic select-none pointer-events-none">
                       {activeRoom.name.substring(0,2)}
                     </div>

                     <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                               <ImageIcon className="w-5 h-5 text-zinc-600" />
                           </div>
                           <div>
                              <h4 className="font-serif text-lg text-white">{activeRoom.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">{activeRoom.products.length} ÃœrÃ¼n Kalemi</p>
                           </div>
                        </div>
                        <button onClick={addProductToActiveRoom} className="cursor-pointer text-xs flex items-center gap-1 font-bold tracking-widest uppercase text-accent hover:text-white transition-colors bg-accent/10 px-3 py-1.5 rounded-full">
                           <Plus className="w-3 h-3" /> ÃœrÃ¼n Ekle
                        </button>
                     </div>

                     <div className="space-y-4 relative z-10">
                       {activeRoom.products.map((p, i) => (
                         <div key={p.id} className="group flex flex-col md:flex-row md:items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors">
                            <div className="w-6 h-6 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-zinc-500 shrink-0">
                               {i + 1}
                            </div>
                            <div className="flex-1">
                               <input type="text" value={p.name} onChange={(e) => {
                                  const newRooms = [...rooms];
                                  newRooms.find(r => r.id === activeRoomId)!.products[i].name = e.target.value;
                                  setRooms(newRooms);
                               }} className="w-full bg-transparent border-none text-sm text-white font-medium focus:outline-none placeholder:text-zinc-600" />
                               
                               <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                  <input type="text" value={p.dimensions} onChange={(e) => {
                                      const newRooms = [...rooms];
                                      newRooms.find(r => r.id === activeRoomId)!.products[i].dimensions = e.target.value;
                                      setRooms(newRooms);
                                  }} className="bg-transparent border-none focus:outline-none w-24 border-b border-white/10" placeholder="Ã–lÃ§Ã¼" />
                                  <span>|</span>
                                  <select value={p.supplyMethod} onChange={(e) => {
                                      const newRooms = [...rooms];
                                      newRooms.find(r => r.id === activeRoomId)!.products[i].supplyMethod = e.target.value;
                                      setRooms(newRooms);
                                  }} className="bg-transparent border-none focus:outline-none text-accent cursor-pointer">
                                      <option value="stok">KENDÄ° DEPOMDAN</option>
                                      <option value="toptanci">TOPTANCIYA GEÃ‡</option>
                                      <option value="perdeai">SÄ°STEM AI</option>
                                  </select>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                               <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg px-2 py-1">
                                  <input type="number" value={p.qty} onChange={(e) => {
                                      const newRooms = [...rooms];
                                      newRooms.find(r => r.id === activeRoomId)!.products[i].qty = Number(e.target.value);
                                      setRooms(newRooms);
                                  }} className="w-10 bg-transparent text-center text-sm font-bold text-white focus:outline-none" />
                                  <span className="text-[10px] text-zinc-500 pl-1">AD</span>
                               </div>
                               
                               <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 w-28">
                                  <input type="number" value={p.price} onChange={(e) => {
                                      const newRooms = [...rooms];
                                      newRooms.find(r => r.id === activeRoomId)!.products[i].price = Number(e.target.value);
                                      setRooms(newRooms);
                                  }} className="w-full bg-transparent text-right text-sm font-bold text-accent focus:outline-none" />
                                  <span className="text-[10px] text-accent pl-1">â‚º</span>
                               </div>

                               <button onClick={() => {
                                   const newRooms = [...rooms];
                                   newRooms.find(r => r.id === activeRoomId)!.products.splice(i, 1);
                                   setRooms(newRooms);
                               }} className="text-zinc-600 hover:text-red-400 p-1 opacity-100 transition-opacity">
                                  <X className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       ))}

                       {activeRoom.products.length === 0 && (
                          <div className="text-center py-8 text-zinc-500 text-sm italic font-serif">
                             Bu oda boÅŸ.
                          </div>
                       )}
                     </div>
                   </div>
                 )}
              </section>
              
               {/* ALOHA SUMMARY TOTAL */}
               <section className="bg-gradient-to-br from-black to-zinc-900 border border-white/10 rounded-2xl p-6">
                 <div className="border-b border-white/10 pb-4 mb-4 flex justify-between items-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">Teklif ToplamÄ±</span>
                    <span className="text-3xl font-serif text-white">{calculateGrandTotal().toLocaleString('tr-TR')} â‚º</span>
                 </div>
                 
                 <div className="flex items-center gap-3 mt-4">
                     <button onClick={() => alert("Whatsapp entegrasyonu baÅŸarÄ±yla tetiklendi. Taslak oluÅŸturuldu.")} className="flex-1 bg-zinc-900 border border-white/10 py-3 rounded-xl flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <MessageSquare className="w-4 h-4" /> WhatsApp ile GÃ¶nder
                     </button>
                     <button onClick={() => alert("PDF dÃ¶kÃ¼mÃ¼ sunucuya iletildi. Ä°ndirme baÅŸlÄ±yor...")} className="flex-1 bg-zinc-900 border border-white/10 py-3 rounded-xl flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Printer className="w-4 h-4" /> PDF Ã‡Ä±ktÄ±sÄ± Al
                     </button>
                 </div>
               </section>

            </div>

            {/* Footer / Actions */}
            <div className="h-24 border-t border-white/10 bg-black flex items-center justify-between px-8">
              <button onClick={onClose} className="px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                KAPAT
              </button>
              <button 
                disabled={isSubmitting || !user}
                className="bg-white text-black font-bold uppercase tracking-[0.1em] text-[11px] px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={async () => {
                  if (!user) {
                     alert("KayÄ±t iÃ§in Tenant Yok. Demo Moda geÃ§iliyor.");
                     onClose();
                     return;
                  }
                  setIsSubmitting(true);
                  try {
                     const newOrder = {
                       tenantId: tenantId,
                       authorId: user.uid,
                       customerId: 'walk-in-customer',
                       customerName: customerName.trim() ? customerName : (customerType === 'bireysel' ? 'Bireysel MÃ¼ÅŸteri' : 'Kurumsal MÃ¼ÅŸteri'),
                       customerAddress: customerAddress,
                       projectType: rooms[0]?.name || 'Yeni Ä°ÅŸlem',
                       grandTotal: calculateGrandTotal(),
                       status: 's1',
                       notes: "AI Otonom Ã‡oklu Oda Teklifi.",
                       rooms: JSON.stringify(rooms),
                       createdAt: Timestamp.now()
                     };
                     
                     const docRef = await addDoc(collection(db, 'projects'), newOrder);
                     
                     // 🚀 ALOHA Sovereign Hub'ı Tetikle (Otonom Ajana Sinyal Gönder)
                     fetch('/api/agent/trigger', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                             event: 'ORDER_CREATED',
                             payload: { 
                                 orderId: docRef.id, 
                                 tenantId: tenantId, 
                                 data: newOrder,
                                 phone: "+905554443322" // Mock phone for now, until UI has it
                             }
                         })
                     }).catch(console.error);

                     window.dispatchEvent(new CustomEvent('agent_message', { detail: { 
                         message: "Müşteri teklifi başarıyla CRM'e kaydedildi. Ajanlar arka planda PDF Teklifini üretip müşteriye iletecektir." 
                     }}));
                     onClose();
                  } catch (e: any) {
                     alert("Hata: " + e.message);
                  } finally {
                     setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Ä°ÅLENÄ°YOR...</> : 'B2B YÃ–NETÄ°MÄ°NE KAYDET (CRM)'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

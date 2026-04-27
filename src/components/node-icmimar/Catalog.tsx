'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, UploadCloud, Search, Tag, Box, DollarSign, X } from 'lucide-react';
import { collection, addDoc, getDocs, Timestamp, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { getNode } from '@/lib/sovereign-config';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: any;
}

export default function Catalog() {
  const { user, loading, SovereignNodeId, isLicensed } = useSovereignAuth('icmimar');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Basic add dialog state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Fon', price: '', stock: '' });

  useEffect(() => {
    if (!user || !SovereignNodeId) return;
    
    setIsFetching(true);
    const config = getNode(SovereignNodeId);
    
    // onSnapshot ile gerçek zamanlı dinleme
    const q = query(
      collection(db, config.productCollection || 'products'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      setIsFetching(false);
    }, (error) => {
      console.error("Katalog yüklenirken hata:", error);
      setIsFetching(false);
    });
    
    return () => unsubscribe();
  }, [user, SovereignNodeId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !SovereignNodeId) return;
    
    const config = getNode(SovereignNodeId);
    try {
      setIsSubmitting(true);
      await addDoc(collection(db, config.productCollection || 'products'), {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        SovereignNodeId,
        authorId: user.uid,
        createdAt: Timestamp.now()
      });

      setNewProduct({ name: '', category: 'Fon', price: '', stock: '' });
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
      alert("Ürün eklenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if(!user || !SovereignNodeId) return;
    if(confirm('Katalogdan bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        const config = getNode(SovereignNodeId);
        await deleteDoc(doc(db, config.productCollection || 'products', productId));
      } catch(err) {
        console.error("Silme hatası", err);
        alert("Ürün silinirken bir hata oluştu.");
      }
    }
  };

  if (loading) return <div className="fixed inset-0 bg-black flex justify-center items-center"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>;
  if (!user) return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Oturum Açınız</h2>
        <a href="/sites/icmimar/login" className="bg-white text-black px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
          Sisteme Giriş Yap
        </a>
      </div>
    </div>
  );

  if (user && !isLicensed) return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-50">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4 uppercase tracking-widest font-bold">Lisansınız Aktif Değil</h2>
        <p className="text-zinc-400 mb-6 max-w-sm mx-auto">Sistemi kullanabilmek için aktif bir kurumsal lisansa ihtiyacınız var.</p>
        <a href="/sites/icmimar/pricing" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">
          Kurumsal Üyelik Paketleri
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500 min-h-screen bg-black">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8 gap-4 mt-16">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-sans text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white">
              KATALOG & STOK YÖNETİMİ
            </h1>
            <span className="bg-white text-black text-[10px] px-3 py-1 uppercase tracking-widest font-bold">
              İzole: {SovereignNodeId?.substring(0,6) || '---'}
            </span>
          </div>
          <p className="text-zinc-500 text-sm max-w-2xl uppercase tracking-wider">
            ŞİRKET VEYA MAĞAZANIZA AİT KUMAŞ, MEKANİZMA VE BİTMİŞ ÜRÜN STOKLARINI YÖNETİN. DİĞER MAĞAZALAR SİZİN BİLGİLERİNİZİ GÖREMEZ.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "outline" : "default"} className="gap-2 shrink-0 bg-white text-black hover:bg-zinc-200 uppercase text-[10px] tracking-widest font-bold">
          <UploadCloud className="w-4 h-4" /> {showAddForm ? 'KÜTÜPHANEYE DÖN' : 'YENİ ÜRÜN EKLE'}
        </Button>
      </div>

      {showAddForm ? (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-900 border-white/10">
           <CardHeader>
             <CardTitle className="text-white">YENİ ÜRÜN KARTI</CardTitle>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleAddProduct} className="space-y-6 max-w-2xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Ürün / Kumaş Adı</label>
                   <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-white focus:outline-none" placeholder="Örn: Blackout Keten Gri" />
                 </div>
                 <div>
                   <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Kategori</label>
                   <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-white focus:outline-none appearance-none">
                     <option value="Fon">Fon Kumaş</option>
                     <option value="Tül">Tül</option>
                     <option value="Stor">Stor / Zebra</option>
                     <option value="Aksesuar">Mekanizma / Aksesuar</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Birim Satış Fiyatı (TL)</label>
                   <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-white focus:outline-none" placeholder="0.00" />
                 </div>
                 <div>
                   <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Stok / Metraj Adedi</label>
                   <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-black border border-zinc-700 text-white p-3 font-mono text-sm focus:border-white focus:outline-none" placeholder="Metre veya Adet" />
                 </div>
               </div>
               
               <div className="pt-4 border-t border-white/10 flex justify-end">
                 <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="mr-4 text-white hover:text-black">İPTAL</Button>
                 <Button type="submit" disabled={isSubmitting} className="min-w-48 bg-white text-black hover:bg-zinc-200">
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'KAYDET'}
                 </Button>
               </div>
             </form>
           </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex border border-white/10 bg-zinc-900/50 p-2 items-center gap-3 rounded-lg">
             <Search className="w-5 h-5 text-zinc-500 ml-2" />
             <input type="text" placeholder="KATALOGDA ARA (İSİM, KATEGORİ VEYA SKU)" className="w-full bg-transparent border-none text-white focus:outline-none font-mono text-sm placeholder:text-zinc-600" />
          </div>

          {isFetching ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-zinc-600 animate-spin" /></div>
          ) : products.length === 0 ? (
             <div className="border border-white/10 p-16 flex flex-col items-center justify-center text-center bg-zinc-900/20 border-dashed rounded-2xl">
                <Box className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="font-bold uppercase tracking-wider text-white mb-2">KATALOG BOŞ</h3>
                <p className="text-sm text-zinc-500 max-w-md">Henüz bu işletmeye tanımlanmış bir ürün yok. Yeni bir ürün ekleyerek fiyatları ve malzeme stoklarınızı yönetmeye başlayın.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-white/10 bg-zinc-900/40 rounded-xl p-6 flex flex-col group hover:border-white/30 hover:bg-zinc-900/80 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${product.stock > 10 ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />

                  <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] font-bold tracking-widest uppercase bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">{product.category}</span>
                     
                     <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-zinc-600 hidden group-hover:block" />
                        <button 
                          onClick={(e) => { e.preventDefault(); handleDeleteProduct(product.id); }}
                          className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Ürünü Sil"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 uppercase line-clamp-2">{product.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest mb-6 uppercase">SKU: {product.id.substring(0,8)}</p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                     <div className="flex items-center gap-1 text-accent font-serif text-lg text-white">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        {Number(product.price).toLocaleString('tr-TR')}
                     </div>
                     <span className={`text-[10px] font-mono tracking-widest px-2 py-1 rounded bg-black border ${product.stock > 10 ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                        STOK: {product.stock}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

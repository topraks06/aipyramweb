'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Tag, Layers, CheckCircle, Package } from 'lucide-react';
// import { uploadToFirebase } from '@/lib/firebase-client';

export default function ProductIngestionClient() {
  const [productName, setProductName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToFirebaseMock = async (file: File): Promise<string> => {
      // Geçici mock yükleme
      return new Promise(resolve => {
         const reader = new FileReader();
         reader.onload = (e) => resolve(e.target?.result as string);
         reader.readAsDataURL(file);
      });
  };

  const handleIngest = async () => {
    if (!imageFile) {
      setError("Lütfen bir ürün görseli yükleyin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const uploadedUrl = await uploadToFirebaseMock(imageFile);

      // Ürün Ingestion API'sini çağır
      const res = await fetch('/api/v1/master/hometex/ingest-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          productName: productName || "İsimsiz Ürün"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ürün işlenirken bir hata oluştu');

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-serif text-zinc-900 tracking-tight flex items-center gap-3">
          <Package className="text-[#8B7355] w-8 h-8" />
          Hometex AI Catalog Ingestion
        </h1>
        <p className="text-zinc-500 mt-2">
          Kumaş veya ev tekstili ürününüzün fotoğrafını yükleyin. AI motorumuz materyali, dokuyu ve renkleri tanıyarak 8 dilde global satışa hazır SEO uyumlu bir katalog kaydı oluştursun.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-800">Ürün Yükleme</CardTitle>
            <CardDescription className="text-zinc-500">Net ışık altında çekilmiş, dokuyu gösteren bir fotoğraf seçin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Tedarikçi Kodu veya Ürün Adı</label>
              <Input 
                placeholder="Örn: Blackout Serisi 2026 - KOD: B-402" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-zinc-50 border-zinc-200 text-zinc-900"
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="relative border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-[260px] object-contain rounded-md shadow-md" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <UploadCloud className="w-8 h-8 text-zinc-400" />
                    </div>
                    <span className="text-sm text-zinc-500 font-medium max-w-[200px]">
                      Kumaş detayını gösteren bir görsel sürükleyin veya seçin
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleIngest} 
              disabled={loading}
              className="w-full bg-[#8B7355] hover:bg-[#7A6548] text-white font-bold tracking-widest uppercase text-xs h-14 rounded-lg"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> YAPAY ZEKA KUMAŞI İNCELİYOR...</>
              ) : (
                <><Layers className="mr-2 h-5 w-5" /> OTOMATİK KATALOG OLUŞTUR</>
              )}
            </Button>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Sonuç Alanı */}
        <div className="space-y-6">
          {result ? (
            <Card className="bg-white border-zinc-200 shadow-xl overflow-hidden">
              <div className="bg-[#8B7355] px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-serif text-lg font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Hometex Global Vitrin
                </h3>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white font-medium uppercase tracking-wider">Yayında</span>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-2xl font-serif text-zinc-900 mb-2">{result.product.title_en}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{result.product.description_en}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1">Materyal</span>
                    <span className="text-zinc-800 font-medium flex items-center gap-2"><Tag className="w-3 h-3 text-[#8B7355]" /> {result.product.material}</span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1">Renk</span>
                    <span className="text-zinc-800 font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-zinc-300" style={{backgroundColor: result.product.color_hex || '#ccc'}}></span>
                      {result.product.color}
                    </span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1">Desen</span>
                    <span className="text-zinc-800 font-medium flex items-center gap-2"><Layers className="w-3 h-3 text-[#8B7355]" /> {result.product.pattern}</span>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1">Dil Desteği</span>
                    <span className="text-zinc-800 font-medium text-xs">TR, EN, DE, RU, ZH, AR, ES, FR</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-100">
                  <a href={`/sites/hometex/catalog/${result.product.slug}`} target="_blank" rel="noreferrer" className="text-[#8B7355] text-sm font-semibold uppercase tracking-widest hover:underline flex items-center justify-center w-full">
                    Katalog Sayfasını Görüntüle &rarr;
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-zinc-100 bg-zinc-50 rounded-xl flex items-center justify-center p-8 text-center text-zinc-400">
              <div className="max-w-xs">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-20 text-zinc-500" />
                <p className="text-sm">Yüklenen kumaş/ürün görseli "Hometex AI Ingestion" algoritması ile analiz edilecek. SEO meta verileri, pazar dili çevirileri ve teknik özellikleri otomatik hesaplanacak.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

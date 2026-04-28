'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileText, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase-client';

export default function VisionJournalismClient() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('İstihbarat');
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

  const uploadToStorage = async (file: File): Promise<string> => {
      const fileRef = ref(storage, `vision_journalism/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
  };

  const handleGenerate = async () => {
    if (!topic && !imageFile) {
      setError("Lütfen bir konu veya analiz edilecek bir görsel girin.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageUrls: string[] = [];

      // 1. Resmi Firebase Storage'a yükle
      if (imageFile) {
        const uploadedUrl = await uploadToStorage(imageFile);
        imageUrls.push(uploadedUrl);
      }

      // 2. Vision Journalism API'sine gönder
      const res = await fetch('/api/v1/master/trtex/write-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic || "Saha Raporu",
          category,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Haber üretilirken bir hata oluştu');

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          <Sparkles className="text-blue-500 w-8 h-8" />
          Vision Journalism Studio
        </h1>
        <p className="text-zinc-400 mt-2">
          TRTEX B2B Haber Ağı için "Google Imagen 3 & Gemini 2.5 Flash Vision" destekli otonom içerik üretim motoru. 
          Saha veya fuar fotoğraflarını yükleyin, yapay zeka 8 dilde sektörel istihbarat haberine dönüştürsün.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">İçerik Parametreleri</CardTitle>
            <CardDescription className="text-zinc-500">Haberin temel bağlamını belirleyin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Ana Konu / Başlık Taslağı</label>
              <Input 
                placeholder="Örn: Hometex 2026 Blackout Trendleri..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="İstihbarat">İstihbarat</option>
                <option value="Fuar">Fuar & Etkinlik</option>
                <option value="Trend">Trend Analizi</option>
                <option value="Teknoloji">Üretim & Teknoloji</option>
              </select>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <label className="text-xs uppercase tracking-widest text-blue-400 font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Saha Görseli (Vision Modu)
              </label>
              <p className="text-xs text-zinc-500 mb-2">Gemini 2.5 Flash bu görseli okuyup haberin ana senaryosunu buradan çıkartacaktır.</p>
              
              <div className="relative border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-[160px] object-contain rounded-md" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-sm text-zinc-400 font-medium">Görsel yüklemek için tıklayın veya sürükleyin</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest uppercase text-xs h-12"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> OTONOM HABER ÜRETİLİYOR...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> HABERİ YAZ VE 8 DİLDE YAYINLA</>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-950/50 border border-red-900/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sonuç Alanı */}
        <div className="space-y-6">
          {result ? (
            <Card className="bg-emerald-950/20 border-emerald-900/50 text-white">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> İşlem Başarılı
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-300">
                <p>{result.message}</p>
                <div className="p-4 bg-black/40 rounded-lg space-y-2 border border-white/5">
                  <p><span className="text-zinc-500">Slug:</span> {result.slug}</p>
                  <p><span className="text-zinc-500">Süre:</span> {(result.duration_ms / 1000).toFixed(1)} saniye</p>
                  <p><span className="text-zinc-500">Durum:</span> Yayında (TRTEX İstihbarat Ağı)</p>
                  <a href={result.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-2 inline-block">Haberi Görüntüle &rarr;</a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border border-zinc-800 border-dashed rounded-xl flex items-center justify-center p-8 text-center text-zinc-600">
              <div className="max-w-xs">
                <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Yüklenen görsel analiz edilecek, Gemini üzerinden haber metni oluşturulacak ve tüm dillerde otomatik yayınlanacaktır.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

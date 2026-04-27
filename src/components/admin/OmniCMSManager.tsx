'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileEdit, CheckCircle2, XCircle, RefreshCw, UploadCloud, Globe, LayoutDashboard, Box, Type, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface CMSItem {
  id: string;
  targetNode: string;
  contentType: string;
  title: string;
  content: string;
  mediaUrl: string;
  isActive: boolean;
  createdAt: string;
}

export function OmniCMSManager() {
  const [items, setItems] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNode, setFilterNode] = useState('all');
  
  // Form State
  const [formVisible, setFormVisible] = useState(false);
  const [newNode, setNewNode] = useState('trtex');
  const [newType, setNewType] = useState('news');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const fetchCMS = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms?node=${filterNode}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('CMS verileri alınamadı.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCMS();
  }, [filterNode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return toast.error('Başlık zorunludur.');
    
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNode: newNode,
          contentType: newType,
          title: newTitle,
          content: newContent,
          mediaUrl: newMediaUrl,
          isActive: true
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('İçerik başarıyla yayınlandı.');
        setFormVisible(false);
        setNewTitle('');
        setNewContent('');
        setNewMediaUrl('');
        fetchCMS();
      } else {
        toast.error('Hata: ' + json.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Bağlantı hatası.');
    }
  };

  const toggleStatus = async (item: CMSItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive
        })
      });
      if (res.ok) fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/cms?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="border-zinc-800 bg-black/40 backdrop-blur-md text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Omni-CMS Motoru
          </CardTitle>
          <CardDescription>Tüm projelerin metin ve görsellerini tek merkezden yönetin.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm"
            value={filterNode}
            onChange={(e) => setFilterNode(e.target.value)}
          >
            <option value="all">Tüm Projeler</option>
            <option value="trtex">TRTex.com</option>
            <option value="perde">Perde.ai</option>
            <option value="icmimar">Icmimar.ai</option>
            <option value="hometex">Hometex.ai</option>
            <option value="vorhang">Vorhang.ai</option>
          </select>
          <Button onClick={() => setFormVisible(!formVisible)} variant="outline" size="sm">
            {formVisible ? 'İptal' : 'Yeni İçerik Ekle'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {formVisible && (
          <form onSubmit={handleSubmit} className="p-4 mb-6 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hedef Proje</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm"
                  value={newNode}
                  onChange={(e) => setNewNode(e.target.value)}
                >
                  <option value="trtex">TRTex.com</option>
                  <option value="perde">Perde.ai</option>
                  <option value="icmimar">Icmimar.ai</option>
                  <option value="hometex">Hometex.ai</option>
                  <option value="vorhang">Vorhang.ai</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">İçerik Tipi</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="news">Haber / Duyuru</option>
                  <option value="hero_text">Ana Sayfa Metni (Hero Text)</option>
                  <option value="hero_image">Ana Sayfa Görseli (Hero Image)</option>
                  <option value="slogan">Alt Slogan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Başlık / Tanımlayıcı</label>
              <Input 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                placeholder="Örn: 2026 İlkbahar Perde Trendleri veya Perde.ai Ana Slogan"
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            {(newType === 'news' || newType === 'hero_text' || newType === 'slogan') && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Metin İçeriği (Markdown Destekli)</label>
                <Textarea 
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  placeholder="İçeriğinizi buraya yazın..."
                  className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                />
              </div>
            )}

            {(newType === 'news' || newType === 'hero_image') && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Görsel URL (Media Link)</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={newMediaUrl} 
                    onChange={e => setNewMediaUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/..."
                    className="bg-zinc-950 border-zinc-800"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => toast.info('Dosya yükleme yakında eklenecek, şimdilik URL giriniz.')}>
                    <UploadCloud className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <FileEdit className="w-4 h-4 mr-2" />
                Yayınla / Kaydet
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Veriler yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border border-dashed border-zinc-800 rounded-lg">
              Bu kriterlere uygun içerik bulunamadı.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded bg-zinc-950 border ${item.isActive ? 'border-emerald-500/30' : 'border-zinc-700'}`}>
                    {item.contentType === 'hero_image' ? <ImageIcon className="w-4 h-4 text-muted-foreground" /> :
                     item.contentType === 'news' ? <FileEdit className="w-4 h-4 text-muted-foreground" /> :
                     <Type className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      {item.isActive ? 
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Yayında</Badge> : 
                        <Badge variant="outline" className="text-[10px] bg-zinc-800 text-zinc-500 border-zinc-700">Pasif</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2 uppercase tracking-wider">
                      <span className="font-bold text-primary">{item.targetNode}</span>
                      <span>•</span>
                      <span>{item.contentType}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => toggleStatus(item)}>
                    {item.isActive ? 'Yayından Kaldır' : 'Yayına Al'}
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteItem(item.id)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

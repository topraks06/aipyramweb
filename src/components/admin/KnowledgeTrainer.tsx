"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Upload, Save, Database, Trash2, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  active?: boolean;
}

export default function KnowledgeTrainer() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    setStatus(null);

    try {
      const url = '/api/admin/knowledge';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, topic, content } : { topic, content };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus(editingId ? "Bilgi başarıyla güncellendi." : "Bilgi başarıyla ALOHA hafızasına (Sovereign DB) yazıldı.");
        setTopic("");
        setContent("");
        setEditingId(null);
        fetchItems();
      } else {
        setStatus(`Hata: ${data.error || "Bilinmeyen Hata"}`);
      }
    } catch (error) {
      setStatus("Bağlantı koptu. Sovereign Ağına ulaşılamadı.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bilgiyi silmek istediğinize emin misiniz?")) return;
    
    try {
      const res = await fetch(`/api/admin/knowledge?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert("Silme hatası: " + data.error);
      }
    } catch (e) {
      alert("Bağlantı hatası");
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    setTopic(item.topic);
    setContent(item.content);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-900/20 bg-white/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <CardTitle>Brain Training (Ajan Eğitimi)</CardTitle>
          </div>
          <CardDescription>Ajanlara kalıcı kurallar, sektör bilgileri ve politikalar öğretin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1">BİLGİ BAŞLIĞI / ETİKET {editingId && <span className="text-amber-500 font-bold ml-2">(DÜZENLENİYOR)</span>}</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: TRTEX Fiyat Politikası 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1">İÇERİK / KURAL (MARKDOWN DESTEKLİ)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ajanların referans alacağı kuralları veya bilgileri girin..."
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition">
                  <Upload className="w-4 h-4" /> Belge Yükle (PDF/TXT)
                </button>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setTopic(""); setContent(""); }} className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition">
                    İptal Et
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                {status && <span className="text-xs text-green-500 font-mono font-bold">{status}</span>}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !topic || !content}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Kaydediliyor..." : (editingId ? "Güncelle" : "Hafızaya Yaz")}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HAFIZA LİSTESİ */}
      <Card className="border-slate-200">
        <CardHeader className="py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm">Aktif Sovereign Hafıza ({items.length})</CardTitle>
            </div>
            <button onClick={fetchItems} disabled={isLoading} className="text-slate-400 hover:text-slate-700">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-slate-500">Hafıza yükleniyor...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">Henüz kaydedilmiş bilgi yok.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map(item => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div>
                      <h4 className="font-mono text-sm font-semibold text-slate-800">{item.topic}</h4>
                      <p className="text-xs text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Düzenle">
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Sil">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  {expandedId === item.id && (
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-700 font-mono whitespace-pre-wrap">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

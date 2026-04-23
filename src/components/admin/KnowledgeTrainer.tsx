"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Upload, Save, Database } from "lucide-react";

export default function KnowledgeTrainer() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async () => {
    if (!topic || !content) return;
    setIsSaving(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("Bilgi başarıyla ALOHA hafızasına (Sovereign DB) yazıldı.");
        setTopic("");
        setContent("");
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

  return (
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
            <label className="block text-xs font-mono text-slate-500 mb-1">BİLGİ BAŞLIĞI / ETİKET</label>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-zinc-700 text-slate-700 rounded-lg text-sm transition">
                <Upload className="w-4 h-4" /> Belge Yükle (PDF/TXT)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-zinc-700 text-slate-700 rounded-lg text-sm transition" title="Mevcut Hafızayı Gör">
                <Database className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {status && <span className="text-xs text-green-400 font-mono">{status}</span>}
              <button
                onClick={handleSave}
                disabled={isSaving || !topic || !content}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-slate-900 rounded-lg text-sm font-medium transition"
              >
                {isSaving ? <Brain className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Senkronize Ediliyor..." : "Hafızaya Yaz"}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  PenLine, RefreshCw, Image as ImageIcon, Trash2, Eye,
  Send, Loader2, ExternalLink, Zap, Search, X, Check,
  AlertTriangle
} from "lucide-react";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════
interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  image_url: string | null;
  images: string[];
  image_generated: boolean;
  quality_score: number;
  impact_score: number;
  source: string;
  createdAt: string;
  slug: string;
  tags: string[];
}

interface Stats {
  total: number;
  withImages: number;
  withoutImages: number;
  categories: Record<string, number>;
  todayCount: number;
}

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════
export default function TrtexControlPanel() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ═══ FETCH ARTICLES ═══
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/master/trtex/articles');
      const data = await res.json();
      setArticles(data.articles || []);
      setStats(data.stats || null);
    } catch { showToast('Haberler yüklenemedi', 'err'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // ═══ TOAST ═══
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ═══ QUICK ACTIONS ═══
  const handleAction = async (action: string, endpoint: string, method = 'GET', body?: any) => {
    setActionLoading(action);
    try {
      const opts: RequestInit = { method };
      if (body) { opts.body = JSON.stringify(body); opts.headers = { 'Content-Type': 'application/json' }; }
      const res = await fetch(endpoint, opts);
      const data = await res.json();
      if (data.success || data.version) {
        showToast(data.message || `✅ ${action} tamamlandı`);
        fetchArticles();
      } else {
        showToast(data.error || `❌ ${action} başarısız`, 'err');
      }
    } catch (e: any) { showToast(e.message, 'err'); }
    setActionLoading(null);
  };

  // ═══ WRITE TOPIC (WITH VISION) ═══
  const handleWriteTopic = async () => {
    if (!topicInput.trim() && selectedFiles.length === 0) return;
    setTopicModalOpen(false);
    setActionLoading('Haber Yazılıor (Görsel Zeka)');

    let uploadedUrls: string[] = [];

    // 1. Resimler varsa önce Firebase Storage'a yükle
    if (selectedFiles.length > 0) {
      showToast(`${selectedFiles.length} resim yükleniyor...`);
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append('file', f));
      formData.append('project', 'trtex');
      
      try {
        const upRes = await fetch('/api/v1/media/upload', { method: 'POST', body: formData });
        const upData = await upRes.json();
        if (upData.success && upData.results) {
          uploadedUrls = upData.results.map((r: any) => r.url);
          showToast('Resimler yüklendi. Haber yazılıyor...');
        } else {
           showToast('Görsel yüklemesinde sorun oluştu', 'err');
           setActionLoading(null);
           return;
        }
      } catch (e: any) {
        showToast(e.message, 'err');
        setActionLoading(null);
        return;
      }
    }

    // 2. Haberi Yazdır (Resim linklerini Gemini Vision'a pasla)
    try {
      const opts: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput || "Saha Görselleri Analizi", imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined })
      };
      
      const res = await fetch('/api/v1/master/trtex/write-topic', opts);
      const data = await res.json();
      
      if (data.success) {
        showToast(data.message || '✅ Haber ve görseller yayında!');
        fetchArticles();
      } else {
        showToast(data.error || '❌ Üretim başarısız', 'err');
      }
    } catch (e: any) {
      showToast(e.message, 'err');
    }
    
    setTopicInput("");
    setSelectedFiles([]);
    setActionLoading(null);
  };

  // ═══ DELETE ARTICLE ═══
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" silinecek. Emin misiniz?`)) return;
    await handleAction('Siliniyor', `/api/v1/master/trtex/articles?id=${id}`, 'DELETE');
  };

  // ═══ EDIT ARTICLE ═══
  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditSummary(article.summary);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await handleAction('Güncelleniyor', '/api/v1/master/trtex/articles', 'PATCH', {
      id: editingId, title: editTitle, summary: editSummary
    });
    setEditingId(null);
  };

  // ═══ REGENERATE IMAGE ═══
  const handleRegenImage = async (id: string, title: string) => {
    await handleAction('Görsel Üretiliyor', '/api/v1/master/trtex/write-topic', 'POST', { topic: title, category: 'Güncelle' });
  };

  // ═══ MINI CHAT ═══
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/aloha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userId: 'admin', stream: false }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'aloha', text: data.text || data.error || 'Yanıt yok' }]);
      // Haber üretildiyse listeyi güncelle
      if (data.text?.includes('Haber Üretildi') || data.text?.includes('Döngü Tamamlandı')) {
        fetchArticles();
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'aloha', text: `❌ ${e.message}` }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ═══ FILTERED ARTICLES ═══
  const filtered = searchQuery
    ? articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : articles;

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <div className="space-y-5">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-2xl
          ${toast.type === 'ok' ? 'bg-emerald-600 text-slate-900' : 'bg-red-600 text-slate-900'}`}>
          {toast.msg}
        </div>
      )}

      {/* ════════════════ 1. QUICK ACTIONS ════════════════ */}
      <div className="bg-[#0f0f18] rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900/90">⚡ Hızlı Aksiyonlar</h2>
          <a href="/sites/trtex.com" target="_blank" className="text-[10px] text-blue-600 hover:text-blue-300 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> Siteyi Aç
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {[
            { id: 'write', label: '📝 Haber Yaz', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', text: '#60a5fa', onClick: () => setTopicModalOpen(true) },
            { id: 'cycle', label: '🔄 Döngü Başlat', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', text: '#4ade80', onClick: () => handleAction('Döngü', '/api/cron/aloha-cycle') },
            { id: 'scan', label: '📸 Görsel Tara', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', text: '#c084fc', onClick: () => handleAction('Görsel Tarama', '/api/v1/master/trtex/scan-images', 'POST') },
            { id: 'payload', label: '🔄 Payload Güncelle', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fbbf24', onClick: () => handleAction('Payload', '/api/system/force-terminal') },
            { id: 'refresh', label: '🔄 Listeyi Yenile', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)', text: '#9ca3af', onClick: fetchArticles },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={btn.onClick}
              disabled={actionLoading !== null}
              style={{
                background: btn.bg,
                borderColor: btn.border,
                color: btn.text,
                opacity: actionLoading === btn.label ? 0.5 : 1,
              }}
              className="px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all border hover:brightness-125"
            >
              {actionLoading === btn.label ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOPIC MODAL */}
      {topicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/60 backdrop-blur-sm" onClick={() => setTopicModalOpen(false)}>
          <div className="bg-[#12121a] border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3">📝 GÖRSEL GAZETECİLİK / Konu Yaz</h3>
            <p className="text-[11px] text-slate-900/40 mb-4">Konu girin VEYA gerçek fuar/atölye fotoğrafları yükleyin. Aloha fotoğrafları görüp okuyarak gerçek B2B haber yazsın.</p>
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWriteTopic()}
              placeholder="Örn: Frankfurt Fuarı stand analizimiz..."
              className="w-full px-4 py-3 bg-white/[0.05] border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-900/30 focus:border-blue-500/50 focus:outline-none mb-3"
              autoFocus
            />
            
            {/* FILE UPLOAD INPUT */}
            <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-blue-500/30 transition-colors">
               <input 
                 type="file" multiple accept="image/*" 
                 onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <ImageIcon className="h-5 w-5 text-slate-900/30 mx-auto mb-2" />
               {selectedFiles.length > 0 ? (
                 <div className="text-xs font-bold text-emerald-600">{selectedFiles.length} GÖRSEL SEÇİLDİ</div>
               ) : (
                 <div className="text-[11px] text-slate-900/40">Saha fotoğraflarını yükleyin (Opsiyonel)</div>
               )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={handleWriteTopic} disabled={!topicInput.trim() && selectedFiles.length === 0}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-slate-900 text-xs font-bold rounded-lg transition-colors">
                {actionLoading ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : <Send className="h-3 w-3 inline mr-1" />}
                {selectedFiles.length > 0 ? 'Göster ve Yazdır' : 'Haber Üret'}
              </button>
              <button onClick={() => { setTopicModalOpen(false); setSelectedFiles([]); setTopicInput(""); }} className="px-4 py-2.5 bg-white/[0.05] text-slate-900/60 text-xs rounded-lg hover:bg-slate-200">
                İptal
              </button>
            </div>
            {/* Hızlı konu önerileri */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                'Heimtextil Frankfurt 2026 katılımcı analizi',
                'Türkiye perde ihracatı AB pazarı',
                'Akıllı motorlu perde pazarı büyüme',
                'Pamuk fiyatları ve tedarik zinciri',
                'Sürdürülebilir ev tekstili trendleri',
              ].map(s => (
                <button key={s} onClick={() => setTopicInput(s)}
                  className="text-[10px] px-2 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-900/50 rounded border border-white/[0.06] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ 2. STATS + CHAT ════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* STATS */}
        <div className="bg-[#0f0f18] rounded-xl border border-white/[0.06] p-4">
          <h3 className="text-xs font-bold text-slate-900/70 uppercase tracking-wider mb-3">Sistem Durumu</h3>
          {stats ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-900/50">Toplam Haber</span>
                <span className="text-sm font-bold text-slate-900">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-900/50">Görselli</span>
                <span className="text-sm font-bold text-emerald-600">{stats.withImages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-900/50">Görselsiz</span>
                <span className={`text-sm font-bold ${stats.withoutImages > 0 ? 'text-amber-400' : 'text-emerald-600'}`}>{stats.withoutImages}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-900/50">Bugün Üretilen</span>
                <span className="text-sm font-bold text-blue-600">{stats.todayCount}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 mt-2">
                <span className="text-[10px] text-slate-900/30 uppercase tracking-wider">Kategoriler</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {Object.entries(stats.categories).map(([cat, count]) => (
                    <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-white/[0.04] rounded text-slate-900/50 border border-white/[0.06]">
                      {cat}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-900/30">Yükleniyor...</div>
          )}
        </div>

        {/* MINI ALOHA CHAT */}
        <div className="lg:col-span-2 bg-[#0f0f18] rounded-xl border border-white/[0.06] p-4 flex flex-col" style={{ maxHeight: '380px' }}>
          <h3 className="text-xs font-bold text-slate-900/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-blue-600" /> Aloha Chat — TRTEX Komutları
          </h3>
          <p className="text-[10px] text-slate-900/30 mb-2">
            Komutlar: <code className="text-blue-600/70">haber yaz: konu</code> · <code className="text-blue-600/70">döngü başlat</code> · <code className="text-blue-600/70">ticaret modu</code>
          </p>

          {/* Chat mesajları */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-[120px]" style={{ maxHeight: '220px' }}>
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[11px] text-slate-900/20">Aloha&apos;ya komut verin...</p>
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {['haber yaz: Hometex Istanbul 2026 fuar analizi', 'döngü başlat', 'ticaret modu'].map(cmd => (
                    <button key={cmd} onClick={() => setChatInput(cmd)}
                      className="text-[10px] px-2 py-1 bg-blue-600/10 text-blue-600/70 rounded border border-blue-500/20 hover:bg-blue-600/20">
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`text-[11px] leading-relaxed px-3 py-2 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-600/10 text-blue-300 ml-8 border border-blue-500/10'
                  : 'bg-white/[0.03] text-slate-900/70 mr-4 border border-white/[0.04]'
              }`}>
                <span className="text-[9px] font-bold text-slate-900/30 uppercase">{m.role === 'user' ? 'SEN' : 'ALOHA'}</span>
                <div className="mt-0.5 whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-900/40">
                <Loader2 className="h-3 w-3 animate-spin" /> Aloha düşünüyor...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              placeholder="haber yaz: konu... veya döngü başlat"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-slate-900 placeholder:text-slate-900/20 focus:border-blue-500/40 focus:outline-none"
              disabled={chatLoading}
            />
            <button onClick={handleChatSend} disabled={chatLoading || !chatInput.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-lg transition-colors">
              <Send className="h-3.5 w-3.5 text-slate-900" />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════ 3. HABER LİSTESİ ════════════════ */}
      <div className="bg-[#0f0f18] rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900/70 uppercase tracking-wider">📰 Haber Yönetimi ({filtered.length})</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-900/30" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="pl-7 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[11px] text-slate-900 w-48 focus:outline-none focus:border-white/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="h-3 w-3 text-slate-900/30" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-900/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-slate-900/30">Haber bulunamadı</div>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[9px] font-bold text-slate-900/30 uppercase tracking-wider border-b border-white/[0.06]">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Başlık</div>
              <div className="col-span-1">Kategori</div>
              <div className="col-span-1">IQ</div>
              <div className="col-span-1">Görsel</div>
              <div className="col-span-1">Tarih</div>
              <div className="col-span-2 text-right">Aksiyonlar</div>
            </div>

            {/* Rows */}
            {filtered.map((article, idx) => (
              <div key={article.id} className="group">
                {editingId === article.id ? (
                  /* EDIT MODE */
                  <div className="bg-blue-600/5 border border-blue-500/20 rounded-lg p-3 space-y-2">
                    <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-slate-200 rounded text-[12px] text-slate-900 focus:outline-none focus:border-blue-500/40" />
                    <textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} rows={2}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-slate-200 rounded text-[11px] text-slate-900/70 resize-none focus:outline-none focus:border-blue-500/40" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1.5 bg-emerald-600 text-slate-900 text-[10px] font-bold rounded hover:bg-emerald-500 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Kaydet
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white/[0.05] text-slate-900/50 text-[10px] rounded hover:bg-slate-200">İptal</button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors items-center border-b border-white/[0.03]">
                    <div className="col-span-1 text-[10px] text-slate-900/30 font-mono">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="col-span-5">
                      <div className="text-[12px] font-medium text-slate-900/80 truncate">{article.title}</div>
                      <div className="text-[10px] text-slate-900/30 truncate mt-0.5">{article.summary}</div>
                    </div>
                    <div className="col-span-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] rounded text-slate-900/50 border border-white/[0.06]">
                        {article.category}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[11px] font-bold ${article.quality_score >= 80 ? 'text-emerald-600' : article.quality_score >= 60 ? 'text-amber-400' : 'text-red-600'}`}>
                        {(article.quality_score / 10).toFixed(1)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      {article.image_generated || (article.images && article.images.length > 0) ? (
                        <span className="text-[10px] text-emerald-600">✅ {article.images?.length || 1}</span>
                      ) : (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Yok
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 text-[10px] text-slate-900/30">
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : '—'}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(article)} title="Düzenle"
                        className="p-1.5 rounded hover:bg-blue-600/20 text-slate-900/30 hover:text-blue-600 transition-colors">
                        <PenLine className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleRegenImage(article.id, article.title)} title="Görsel Üret"
                        className="p-1.5 rounded hover:bg-purple-600/20 text-slate-900/30 hover:text-purple-400 transition-colors">
                        <ImageIcon className="h-3 w-3" />
                      </button>
                      <a href={`/sites/trtex.com/news/${article.slug}?lang=tr`} target="_blank" title="Önizle"
                        className="p-1.5 rounded hover:bg-emerald-600/20 text-slate-900/30 hover:text-emerald-600 transition-colors">
                        <Eye className="h-3 w-3" />
                      </a>
                      <button onClick={() => handleDelete(article.id, article.title)} title="Sil"
                        className="p-1.5 rounded hover:bg-red-600/20 text-slate-900/30 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

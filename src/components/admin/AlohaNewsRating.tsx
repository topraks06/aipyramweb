"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp, AlertTriangle, Send, Search, Edit2, Check, X, ImageIcon, Trash2, Power, Eye, GitPullRequest } from "lucide-react";

const TAG_OPTIONS = [
  "Çok uzun",
  "Görsel kalitesiz",
  "Veri bayat",
  "Cümleler tekrarlıyor",
  "B2B Zayıf (Magazin gibi)",
  "Fırsat/Risk eksik"
];

// Mock Veri Tabanı
const INITIAL_DB = [
  {
    id: 1,
    title: "JAB 2026: Akıllı İpliklerin Lüks Konut Pazarındaki Hakimiyeti",
    summary: "JAB Anstoetz, yeni nesil yangın geciktirici akıllı iplik koleksiyonunu tanıttı. Mimari projeler için Avrupa pazarında %15'lik büyüme bekleniyor.",
    b2b_analysis: "Bu ne demek? Proje bazlı çalışan toptancı ve mimari stüdyolar için itfaiye/güvenlik standartlarındaki regülasyon baskısı ortadan kalkıyor. JAB'ın yeni akıllı iplik mimarisi ağırlık maliyetini %12 düşürdüğü için navlun avantajı sunuyor.",
    technical_report: "Yeni iplik liflerinin dokusu, akustik bariyer özelliği taşıyor. Okyanus atıklarından elde edilen geri dönüştürülmüş mikro polyester kullanımı, lüks algısını zedelemeden premium segmente hitap etmesini sağlamaktadır.",
    opportunity_risk: "AVANTAJ: Akustik lüks sözleşmeli projeler için fiyatlama gücü yüksek. RİSK: Uzakdoğu taklitlerine karşı patent koruması zayıf olduğu için sadece 1. sınıf otel ve villalarda konumlandırılmalıdır.",
    date: "Bugün 14:30",
    wordCount: 1450,
    status: "pending", // pending, published, rejected
    images: [
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000", type: "MAKRO" },
      { url: "https://images.unsplash.com/photo-1618219908412-a29a1bd145d6?auto=format&fit=crop&q=80&w=1000", type: "MEZO" },
      { url: "https://images.unsplash.com/photo-1606744887165-8ae6de05205b?auto=format&fit=crop&q=80&w=1000", type: "MİKRO" }
    ]
  },
  {
    id: 2,
    title: "Vanelli İnovasyon: Akıllı Termal Perde Teknolojileri",
    summary: "Vanelli, ısı kaybını engelleyen yeni termal Blackout serisini duyurdu.",
    b2b_analysis: "Enerji krizi Avrupa'da sürerken, bu kumaş doğrudan faturayı düşürüyor.",
    technical_report: "3 katmanlı gümüş iyon kaplama sayesinde termal izolasyon %30 arttı.",
    opportunity_risk: "AVANTAJ: Kamu ihaleleri. RİSK: Üretim maliyeti.",
    date: "Dün 09:15",
    wordCount: 920,
    status: "published",
    images: [] // Görselsiz
  }
];

export default function AlohaNewsRating() {
  // Sistem Modu
  const [isAutonomous, setIsAutonomous] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Veri Seti ve Düzenleme Durumları
  const [newsDb, setNewsDb] = useState(INITIAL_DB);
  const [activeNewsId, setActiveNewsId] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // CEO Rating Durumları
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeNews = newsDb.find(n => n.id === activeNewsId) || newsDb[0];

  // Arama motoru filtresi
  const filteredNews = newsDb.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase()));

  const startEditing = () => {
    setEditForm({ ...activeNews });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setNewsDb(prev => prev.map(n => n.id === activeNews.id ? editForm : n));
    setIsEditing(false);
  };

  const handlePublish = () => {
    setNewsDb(prev => prev.map(n => n.id === activeNews.id ? { ...n, status: "published" } : n));
  };

  const handleDelete = () => {
    setNewsDb(prev => prev.map(n => n.id === activeNews.id ? { ...n, status: "rejected" } : n));
  };
  
  const handleRemoveImage = (index: number) => {
    setEditForm((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* 1. ÜST KONTROL BAR */}
      <div className="bg-[#0f0f18] border border-white/[0.08] p-4 rounded-xl flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-white/90">AIPYRAM Master Intelligence Terminal</h2>
          <p className="text-[10px] text-white/40">Gelecekteki on binlerce veriyi yönetin ve kontrol edin.</p>
        </div>
        
        {/* Otonom / Manuel Şalter */}
        <div className="flex items-center gap-3 bg-[#08080d] p-1.5 rounded-lg border border-white/[0.04]">
          <button 
            onClick={() => setIsAutonomous(false)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${!isAutonomous ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'text-white/40 hover:text-white/80'}`}
          >
            MANUEL (CEO Onayı)
          </button>
          <button 
            onClick={() => setIsAutonomous(true)}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center gap-2 ${isAutonomous ? 'bg-red-600/20 text-red-500 border border-red-500/30' : 'text-white/40 hover:text-white/80'}`}
          >
            <Power className="w-3 h-3" />
            OTONOM YAYIN
          </button>
        </div>
      </div>

      <div className="flex gap-6 h-[800px]">
        {/* SOL: ARAMA & LİSTE (Haber Motoru) */}
        <div className="w-1/3 bg-[#0f0f18] border border-white/[0.08] rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/30" />
              <input 
                type="text" 
                placeholder="İstihbarat havuzunda ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#08080d] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredNews.map(news => (
              <button 
                key={news.id}
                onClick={() => { setActiveNewsId(news.id); setIsEditing(false); }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${activeNewsId === news.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-[#08080d] border-transparent hover:border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    news.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 
                    news.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {news.status === 'published' ? 'YAYINDA' : news.status === 'pending' ? 'BEKLİYOR' : 'REDDEDİLDİ'}
                  </span>
                  <span className="text-[10px] text-white/30">{news.date}</span>
                </div>
                <h4 className={`text-xs font-semibold leading-relaxed line-clamp-2 ${activeNewsId === news.id ? 'text-blue-100' : 'text-white/80'}`}>{news.title}</h4>
              </button>
            ))}
            {filteredNews.length === 0 && (
              <div className="p-6 text-center text-white/30 text-xs">Aradığınız kriterde haber bulunamadı.</div>
            )}
          </div>
        </div>

        {/* SAĞ: KANVAS (Düzenleme / Onaylama ve Puanlama) */}
        <div className="w-2/3 bg-[#0f0f18] border border-white/[0.08] rounded-xl flex flex-col overflow-y-auto">
          {filteredNews.length > 0 ? (
            <>
              {/* Başlık ve Düzenleme Barları */}
              <div className="p-6 border-b border-white/[0.04] bg-[#08080d]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-sm flex items-center gap-2">
                    <GitPullRequest className="w-3 h-3" /> TRTEX MASTER KANVAS YÖNETİMİ
                  </span>
                  
                  {!isEditing ? (
                    <button onClick={startEditing} className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 px-3 py-1.5 text-xs rounded-md transition-colors border border-white/10">
                      <Edit2 className="w-3.5 h-3.5" /> Metni & Görseli Düzenle
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1.5 text-xs rounded-md border border-red-500/30">
                        <X className="w-3.5 h-3.5" /> İptal
                      </button>
                      <button onClick={handleSaveEdit} className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 text-xs rounded-md border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" /> Değişiklikleri Kaydet
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <textarea 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-[#0a0a0f] text-xl font-bold text-white border border-blue-500/50 rounded-lg p-3 outline-none resize-none"
                    rows={2}
                  />
                ) : (
                  <h3 className="text-xl font-bold text-white/95 leading-snug">{activeNews.title}</h3>
                )}
              </div>

              {/* GÖRSEL ALANI */}
              <div className="p-6 border-b border-white/[0.04]">
                <h4 className="text-[10px] font-bold text-white/50 mb-3 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Görsel Varlıklar</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(isEditing ? editForm.images : activeNews.images || []).map((img: any, i: number) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-white/20 aspect-video bg-[#08080d] flex items-center justify-center">
                      <img src={img.url} alt={img.type} className="w-full h-full object-cover" />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                          <button onClick={() => handleRemoveImage(i)} className="bg-red-500 text-white p-2 text-xs rounded-full hover:scale-110 transition-transform shadow-lg"><Trash2 className="w-4 h-4" /></button>
                          <span className="text-[9px] font-bold text-white border-b">{img.type} SİL</span>
                        </div>
                      )}
                      {!isEditing && (
                        <div className="absolute bottom-2 left-2"><span className="text-[9px] font-bold text-white uppercase bg-black/80 px-1.5 py-0.5 rounded border border-white/10">{img.type}</span></div>
                      )}
                    </div>
                  ))}
                  {(isEditing ? editForm.images?.length || 0 : activeNews.images?.length || 0) === 0 && (
                     <div className="col-span-3 py-8 text-center border-2 border-dashed border-white/10 rounded-lg text-white/30 text-xs">Aktif görsel bulunmamaktadır.</div>
                  )}
                </div>
              </div>

              {/* METİN İÇERİĞİ ALANI */}
              <div className="p-6 space-y-4 border-b border-white/[0.04]">
                <div className="bg-[#08080d] p-4 rounded-lg border-l-4 border-blue-500/50">
                  <h4 className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest">Hızlı Özet</h4>
                  {isEditing ? (
                    <textarea value={editForm.summary} onChange={e => setEditForm({...editForm, summary: e.target.value})} className="w-full bg-[#0f0f18] text-sm text-white border border-white/10 rounded p-2 outline-none h-20" />
                  ) : (<p className="text-sm text-white/80 leading-relaxed">{activeNews.summary}</p>)}
                </div>

                <div className="bg-[#08080d] p-4 rounded-lg">
                  <h4 className="text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-widest">Bu Ne Demek? (B2B Analiz)</h4>
                  {isEditing ? (
                    <textarea value={editForm.b2b_analysis} onChange={e => setEditForm({...editForm, b2b_analysis: e.target.value})} className="w-full bg-[#0f0f18] text-xs text-white border border-white/10 rounded p-2 outline-none h-24" />
                  ) : (<p className="text-xs text-white/70 leading-relaxed">{activeNews.b2b_analysis}</p>)}
                </div>

                <div className="bg-[#08080d] p-4 rounded-lg">
                  <h4 className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-widest">Teknik Rapor</h4>
                  {isEditing ? (
                    <textarea value={editForm.technical_report} onChange={e => setEditForm({...editForm, technical_report: e.target.value})} className="w-full bg-[#0f0f18] text-xs text-white border border-white/10 rounded p-2 outline-none h-28" />
                  ) : (<p className="text-xs text-white/60 leading-relaxed">{activeNews.technical_report}</p>)}
                </div>

                <div className="bg-[#08080d] p-4 rounded-lg border-l-4 border-amber-500/50">
                  <h4 className="text-[10px] font-bold text-amber-400 mb-2 uppercase tracking-widest">Fırsat / Risk Haritası</h4>
                  {isEditing ? (
                    <textarea value={editForm.opportunity_risk} onChange={e => setEditForm({...editForm, opportunity_risk: e.target.value})} className="w-full bg-[#0f0f18] text-xs text-white border border-white/10 rounded p-2 outline-none h-20" />
                  ) : (<p className="text-xs text-white/70 font-medium leading-relaxed">{activeNews.opportunity_risk}</p>)}
                </div>
              </div>

              {/* CEO ONAY VE PUBLISH AKSİYONU */}
              <div className="p-6 bg-[#08080d] flex items-center justify-between border-b border-white/[0.04]">
                <div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Durum Kontrolü</span>
                  {activeNews.status === 'published' ? (
                     <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs"><Eye className="w-4 h-4"/> Sitede Yayında</div>
                  ) : activeNews.status === 'rejected' ? (
                     <div className="flex items-center gap-2 text-red-500 font-bold text-xs"><Trash2 className="w-4 h-4"/> Çöpe Atıldı</div>
                  ) : (
                     <div className="flex items-center gap-2 text-amber-400 font-bold text-xs"><AlertTriangle className="w-4 h-4"/> İnceleniyor</div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {activeNews.status !== 'rejected' && (
                    <button onClick={handleDelete} className="px-5 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-colors">YAYINDAN KALDIR / SİL</button>
                  )}
                  {activeNews.status !== 'published' && (
                    <button onClick={handlePublish} className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">TRTEX'TE YAYINLA</button>
                  )}
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────── */}
              {/* ALT KISIM: CEO KARAR & ZEKA PUANLAMASI (SİLİNMEYEN KIRBAÇ)*/}
              {/* ───────────────────────────────────────────────────────── */}
              <div className="p-6 bg-[#0a0a0f] mt-auto">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-semibold text-white/80">CEO Zeka Puanlaması (Rating)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[11px] text-white/40 mb-3 uppercase tracking-wider">İstihbarat Kalitesi (1-10 Arası)</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSelectedScore(num)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-xs transition-all ${
                            selectedScore === num 
                              ? num <= 4 ? "bg-red-500 text-white" : num <= 7 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                              : "bg-white/[0.03] text-white/40 hover:bg-white/[0.08]"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    {selectedScore !== null && (
                      <p className="text-xs mt-3 font-medium">
                        {selectedScore <= 4 && <span className="text-red-400 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Zayıf — Ajan bu stili tamamen terk etmeli.</span>}
                        {selectedScore > 4 && selectedScore <= 7 && <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Geliştirilmeli — Eksikleri düzeltmesi gerekiyor.</span>}
                        {selectedScore > 7 && <span className="text-emerald-400 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Mükemmel — Ajan bu şablonu kopyalayarak çoğaltacak.</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] text-white/40 mb-3 uppercase tracking-wider">Uyarı Etiketleri (Ajanı Eğit)</p>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setFeedbackTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                            feedbackTags.includes(tag)
                              ? "bg-red-500/20 border-red-500/50 text-red-300"
                              : "bg-transparent border-white/[0.1] text-white/40 hover:text-white/70 hover:border-white/[0.2]"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!selectedScore || isSubmitted}
                    onClick={() => {
                       setIsSubmitted(true);
                       setTimeout(() => { setIsSubmitted(false); setSelectedScore(null); setFeedbackTags([]); }, 3000);
                    }}
                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                      isSubmitted 
                        ? "bg-emerald-600 text-white cursor-default"
                        : selectedScore
                          ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                          : "bg-white/[0.05] text-white/20 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitted ? (
                      <>Puan İşlendi <Check className="w-4 h-4" /></>
                    ) : (
                      <>Puanı Ajana Gönder <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden">Boş State</div>
          )}
        </div>
      </div>
    </div>
  );
}

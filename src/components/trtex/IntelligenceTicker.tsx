'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * TRTEX B2B Intelligence Ticker
 * 
 * 4 feed stream'den beslenen canlı piyasa bandı:
 * 1. logistics_feed → navlun, konteyner
 * 2. commodity_feed → PTA, MEG, pamuk
 * 3. fx_energy_feed → USD/TRY, EUR/TRY, Brent
 * 4. news_event_feed → breaking + etkinlik geri sayımı
 * 
 * Sticky, pause-on-hover, click-to-detail, priority-sorted.
 */

// ═══════════════════════════════════════
// VERİ TİPLERİ
// ═══════════════════════════════════════

export type TickerFeedType = 'macro' | 'energy' | 'textile' | 'logistics' | 'news_event';
export type TickerDirection = 'up' | 'down' | 'stable';
export type TickerSeverity = 'normal' | 'attention' | 'crisis';

export interface TickerItem {
  id: string;
  type: TickerFeedType;
  label: string;
  value: number | string;
  unit?: string;           // $, ₺, %, gün
  change?: number;         // +1.2, -3.5
  direction: TickerDirection;
  severity: TickerSeverity;
  timestamp: number;
  // Önceliklendirme
  volatility?: number;     // 0-1 (ne kadar dalgalı)
  businessImpact?: number; // 0-1 (iş etkisi)
  // Haber/etkinlik
  isBreaking?: boolean;
  isCountdown?: boolean;
  countdownTarget?: string; // ISO date
  newsHeadline?: string;
}

interface IntelligenceTickerProps {
  items?: TickerItem[];
  apiEndpoint?: string;     // Canlı veri endpoint
  speed?: number;           // Piksel/saniye (varsayılan: 60)
  onItemClick?: (item: TickerItem) => void;
  showChatBridge?: boolean; // SmartChat popup aç
}

// ═══════════════════════════════════════
// ÖNCELİK MOTORU
// ═══════════════════════════════════════

function calculatePriority(item: TickerItem): number {
  const volatility = item.volatility || Math.min(Math.abs(item.change || 0) / 10, 1);
  const recency = Math.max(0, 1 - (Date.now() - item.timestamp) / (3600000 * 6)); // 6 saat
  const impact = item.businessImpact || 0.5;

  let score = volatility * 0.5 + recency * 0.3 + impact * 0.2;

  // Breaking news = en üst
  if (item.isBreaking) score += 2;
  // Crisis = yüksek öncelik
  if (item.severity === 'crisis') score += 1;
  // Büyük değişim spike
  if (Math.abs(item.change || 0) >= 5) score += 0.5;

  return score;
}

function sortByPriority(items: TickerItem[]): TickerItem[] {
  return [...items].sort((a, b) => calculatePriority(b) - calculatePriority(a));
}

// ═══════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════

export default function IntelligenceTicker({
  items: externalItems,
  apiEndpoint = '/api/aloha/ticker',
  speed = 60,
  onItemClick,
  showChatBridge = true,
}: IntelligenceTickerProps) {
  const [items, setItems] = useState<TickerItem[]>(externalItems || []);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Otonom 24/7 Canlı Senkronizasyon (Dumb Client + Hybrid Merge)
  useEffect(() => {
    // Sadece ID ve Value tabanlı değişimleri kırpmak için filtre fonksiyonu
    const syncItems = (newItems: TickerItem[]) => {
      setItems(prev => {
        // Gelen verilerle mevcudu id bazlı karıştır
        const mergedMap = new Map(prev.map(i => [i.id, i]));
        newItems.forEach(i => mergedMap.set(i.id, i));
        const merged = Array.from(mergedMap.values());
        const sorted = sortByPriority(merged);
        
        // Animasyonu kırmamak için sadece hayati verilerin (value/change/direction) değişip değişmediğine bak
        const slimPrev = prev.map(p => `${p.id}:${p.value}:${p.change}`);
        const slimNext = sorted.map(s => `${s.id}:${s.value}:${s.change}`);
        
        if (slimPrev.join('|') !== slimNext.join('|')) {
          return sorted;
        }
        return prev;
      });
    };

    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const langCode = (urlParams.get('lang') || 'TR').toUpperCase();
        
        const res = await fetch(apiEndpoint, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          let targetItems = Array.isArray(data.items) ? data.items : (data.items[langCode] || data.items['TR'] || []);
          if (targetItems && targetItems.length > 0) {
            syncItems(targetItems);
          }
        }
      } catch { } // Sessiz fallback
    };

    const initData = async () => {
      if (externalItems && externalItems.length > 0) {
        syncItems(externalItems);
      } else {
        await fetchData();
      }
    };
    initData();

    const interval = setInterval(fetchData, 60000); // 24/7 Canlı (60 saniye)
    return () => clearInterval(interval);
  }, [apiEndpoint]); // externalItems array'i her render'da değişebileceği için çıkarıldı

  // Item tıklama
  const handleClick = useCallback((item: TickerItem) => {
    setSelectedItem(item);
    if (onItemClick) onItemClick(item);
  }, [onItemClick]);

  // SmartChat query
  const handleChatAsk = async () => {
    if (!selectedItem || !chatQuery.trim()) return;
    setChatLoading(true);
    setChatResponse('');

    try {
      const res = await fetch('/api/aloha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[TICKER CONTEXT] ${selectedItem.label}: ${selectedItem.value} (${selectedItem.change || 0}% ${selectedItem.direction}) — ${chatQuery}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatResponse(data.response || data.text || 'Analiz tamamlandı.');
      }
    } catch {
      setChatResponse('Bağlantı hatası.');
    } finally {
      setChatLoading(false);
    }
  };

  // Hız hesaplama
  const duration = items.length > 0 ? (items.length * 220) / speed : 30;

  // KURAL: Mock/fallback YASAK — Aloha veri sağlamazsa ticker görünmez
  const displayItems = items;

  // Veri yoksa hiç render etme
  if (displayItems.length === 0) return null;

  return (
    <>
      {/* ═══ STICKY TICKER BAR — Swiss Corporate ═══ */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10001,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          overflow: 'hidden', cursor: 'default',
          fontFamily: "'Inter', 'Manrope', -apple-system, sans-serif",
          fontVariantNumeric: 'tabular-nums',
          height: '40px', display: 'flex', alignItems: 'center',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Live indicator */}
        <div style={{
          padding: '0 0.75rem', display: 'flex', alignItems: 'center', gap: '6px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          height: '100%', flexShrink: 0,
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 6px #22c55e',
            animation: 'tickerPulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.55rem', letterSpacing: '2px', color: '#475569', fontWeight: 700 }}>
            CANLI
          </span>
        </div>

        {/* Scrolling track with edge fade */}
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}>
          <div
            ref={trackRef}
            style={{
              display: 'flex', gap: '0',
              animation: `tickerScroll ${duration}s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
              transition: 'animation-play-state 0.5s ease-out',
              whiteSpace: 'nowrap',
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            {/* Double items for seamless loop */}
            {[...displayItems, ...displayItems].map((item, i) => (
              <TickerItemCell
                key={`${item.id}-${i}`}
                item={item}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ DETAIL POPUP ═══ */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed', top: '38px', right: '16px', zIndex: 10000,
            width: 'calc(100vw - 32px)', maxWidth: '340px', maxHeight: '480px',
            background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem',
            background: severityGradient(selectedItem.severity),
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: '#94a3b8' }}>
                {selectedItem.type.toUpperCase().replace('_', ' ')}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                {selectedItem.label}
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: '#94a3b8', cursor: 'pointer', borderRadius: '4px',
                padding: '4px 8px', fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          </div>

          {/* Değer */}
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem', fontWeight: 900,
              color: dirColor(selectedItem.direction),
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {typeof selectedItem.value === 'number'
                ? selectedItem.value.toLocaleString('en-US')
                : selectedItem.value}
              {selectedItem.unit && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>
                  {selectedItem.unit}
                </span>
              )}
            </div>
            {selectedItem.change !== undefined && (
              <div style={{
                fontSize: '0.85rem', fontWeight: 700, marginTop: '4px',
                color: dirColor(selectedItem.direction),
              }}>
                {selectedItem.change > 0 ? '↑' : selectedItem.change < 0 ? '↓' : '→'}
                {' '}{Math.abs(selectedItem.change).toFixed(1)}%
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '6px' }}>30d</span>
              </div>
            )}
          </div>

          {/* Breaking / Countdown */}
          {selectedItem.isBreaking && (
            <div style={{
              margin: '0 1rem 0.75rem', padding: '0.5rem 0.75rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '6px', fontSize: '0.75rem', color: '#fca5a5',
            }}>
              ⚡ BREAKING: {selectedItem.newsHeadline}
            </div>
          )}

          {selectedItem.isCountdown && selectedItem.countdownTarget && (
            <div style={{
              margin: '0 1rem 0.75rem', padding: '0.5rem 0.75rem',
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '6px', fontSize: '0.75rem', color: '#93c5fd',
            }}>
              ⏱ {selectedItem.newsHeadline || selectedItem.label}
              <CountdownTimer target={selectedItem.countdownTarget} />
            </div>
          )}

          {/* SmartChat Bridge — Proactive Insight Model */}
          {showChatBridge && (
            <div style={{
              padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(59,130,246,0.03)',
            }}>
              {/* Contextual Auto-Prompts — Soru sormak zorunda değil */}
              <div style={{ fontSize: '0.6rem', letterSpacing: '1px', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                🧠 HIZLI YAPAY ZEKA ANALİZİ
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                {getAutoPrompts(selectedItem.id).map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatQuery(btn.query);
                      setTimeout(() => handleChatAsk(), 100);
                    }}
                    style={{
                      padding: '4px 8px', fontSize: '0.6rem', fontWeight: 600,
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: '4px', color: '#93c5fd', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Manual query */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={chatQuery}
                  onChange={e => setChatQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChatAsk()}
                  placeholder="Kendi sorunuzu sisteme yazın..."
                  style={{
                    flex: 1, padding: '0.5rem 0.65rem',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px', color: '#e2e8f0', fontSize: '0.75rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleChatAsk}
                  disabled={chatLoading}
                  style={{
                    padding: '0.5rem 0.75rem', background: '#3b82f6',
                    border: 'none', borderRadius: '6px', color: '#fff',
                    fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                    opacity: chatLoading ? 0.5 : 1,
                  }}
                >
                  {chatLoading ? '...' : 'Sor'}
                </button>
              </div>
              {chatResponse && (
                <div style={{
                  marginTop: '0.5rem', padding: '0.5rem 0.65rem',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '6px',
                  fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5,
                  maxHeight: '120px', overflowY: 'auto',
                }}>
                  {chatResponse}
                </div>
              )}
              
              {/* Otonom Haber / Kaynak Linki (Habere Git) */}
              {(selectedItem.type === 'news_event' || typeof window !== 'undefined') && (
                 <a 
                   href={`./news/${selectedItem.id}?lang=tr`} 
                   style={{
                     display: 'block', marginTop: '1rem', padding: '0.6rem',
                     textAlign: 'center', background: 'rgba(255,255,255,0.05)',
                     borderRadius: '6px', color: '#fff', fontSize: '0.7rem',
                     fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                     transition: 'all 0.2s'
                   }}
                   onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                   onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                 >
                   📄 TİCARİ RAPORU AÇ →
                 </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ CSS ANIMATIONS ═══ */}
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tickerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes tickerFlash {
          0%, 100% { background: rgba(239,68,68,0.08); }
          50% { background: rgba(239,68,68,0.2); }
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════
// TICKER ITEM CELL (8-Dil Zekalı)
// ═══════════════════════════════════════

const TICKER_DICTIONARY: Record<string, { live: string, flash: string }> = {
  TR: { live: 'CANLI', flash: 'SON DAKİKA' },
  EN: { live: 'LIVE', flash: 'BREAKING' },
  DE: { live: 'AKTUELL', flash: 'EILMELDUNG' },
  FR: { live: 'DIRECT', flash: 'URGENT' },
  ES: { live: 'EN VIVO', flash: 'ÚLTIMA HORA' },
  RU: { live: 'В ЭФИРЕ', flash: 'СРОЧНО' },
  ZH: { live: '直播', flash: '突发新闻' },
  AR: { live: 'مباشر', flash: 'عاجل' },
};

function TickerItemCell({ item, onClick }: { item: TickerItem; onClick: () => void }) {
  const isBreaking = item.isBreaking || item.severity === 'crisis';
  
  // Dili path'ten veya url'den anla
  let lang = 'TR'; // Default TR
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const match = path.match(/^\/([a-z]{2})\b/i);
    if (match) lang = match[1].toUpperCase();
  }
  const t = TICKER_DICTIONARY[lang] || TICKER_DICTIONARY['TR'];

  // Değer çevirisi (Eğer arkadan LIVE/CANLI statik statü basılmışsa dille eşle)
  let displayValue = typeof item.value === 'number' ? item.value.toLocaleString('en-US') : item.value;
  if (displayValue === 'LIVE' || displayValue === 'CANLI') displayValue = t.live;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '0 16px', height: '38px', cursor: 'pointer',
        borderRight: '1px solid rgba(255,255,255,0.03)',
        transition: 'background 0.2s',
        animation: isBreaking ? 'tickerFlash 2s ease-in-out infinite' : 'none',
      }}
      onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Severity dot */}
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        background: item.severity === 'crisis' ? '#ef4444'
          : item.severity === 'attention' ? '#f59e0b' : '#22c55e',
      }} />

      {/* Label */}
      <span style={{
        fontSize: '13px', color: '#94a3b8', letterSpacing: '0.3px',
        fontWeight: 500,
        fontFamily: "'Inter', sans-serif",
      }}>
        {item.label}
      </span>

      {/* Value or Headline */}
      <span style={{
        fontSize: '14px', fontWeight: 600,
        color: item.severity === 'crisis' ? '#fca5a5' : '#E2E8F0',
        fontFamily: "'Inter', sans-serif",
        fontVariantNumeric: 'tabular-nums',
      }}>
        {item.newsHeadline ? (
           <span style={{ color: '#fff', fontWeight: 400 }}>{item.newsHeadline} <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '6px' }}>[{displayValue}]</span></span>
        ) : (
           displayValue
        )}
      </span>

      {/* Change arrow — outline style */}
      {item.change !== undefined && (
        <span style={{
          fontSize: '12px', fontWeight: 600,
          color: item.direction === 'up' ? '#10B981' : item.direction === 'down' ? '#EF4444' : '#F59E0B',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {item.direction === 'up' ? '△' : item.direction === 'down' ? '▽' : '–'}
          {Math.abs(item.change).toFixed(1)}%
        </span>
      )}

      {/* Breaking badge */}
      {item.isBreaking && (
        <span style={{
          fontSize: '9px', letterSpacing: '1px', fontWeight: 700,
          padding: '2px 6px', borderRadius: '3px',
          background: '#EF4444', color: '#fff',
        }}>
          {t.flash}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════

function CountdownTimer({ target }: { target: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setRemaining('NOW!'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      setRemaining(`${days}d ${hours}h`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span style={{
      marginLeft: '8px', fontWeight: 800, color: '#60a5fa',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {remaining}
    </span>
  );
}

// ═══════════════════════════════════════
// YARDIMCI
// ═══════════════════════════════════════

function dirColor(dir: TickerDirection): string {
  if (dir === 'up') return '#22c55e';
  if (dir === 'down') return '#ef4444';
  return '#f59e0b';
}

function severityGradient(severity: TickerSeverity): string {
  if (severity === 'crisis') return 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))';
  if (severity === 'attention') return 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))';
  return 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.03))';
}

// Mock/fallback verileri KALDIRILDI — Aloha otonom veri sağlar

// ═══════════════════════════════════════
// CONTEXTUAL AUTO-PROMPTS
// ═══════════════════════════════════════

interface AutoPrompt {
  label: string;
  query: string;
}

function getAutoPrompts(metricId: string): AutoPrompt[] {
  const prompts: Record<string, AutoPrompt[]> = {
    usdtry: [
      { label: '💰 Maliyet Etkisi', query: 'Bu USD/TRY değişimi ithal hammadde maliyetlerimi nasıl etkiler? Polyester ve pamuk bazlı ürünler için metre başına maliyet değişimini hesapla.' },
      { label: '📊 Fiyat Güncelle', query: 'Kur değişimiyle birlikte ihracat fiyat listemi nasıl güncellemeliyim? EUR ve USD bazlı müşterilerim için öneriler ver.' },
      { label: '🛡️ Hedging Stratejisi', query: 'Bu kur seviyesinde döviz riski azaltmak için ne yapmalıyım? Forward kontrat, doğal hedge veya fiyatlama stratejisi öner.' },
    ],
    eurtry: [
      { label: '🇪🇺 AB İhracat Etkisi', query: 'EUR/TRY bu seviyede Avrupa ihracatım için avantajlı mı dezavantajlı mı? Rekabet gücümü analiz et.' },
      { label: '💶 EUR Fiyatlandırma', query: 'Euro bazlı fiyatlandırma stratejimi nasıl güncellemeliyim?' },
    ],
    pta: [
      { label: '🧪 Polyester Maliyet', query: 'PTA bu fiyattayken polyester bazlı perde ve kumaş ürünlerimde metre başına maliyet nasıl değişir? Blackout, tül ve döşemelik için ayrı hesapla.' },
      { label: '🔄 Pamuk Alternatifi', query: 'PTA artışında polyester yerine pamuk bazlı ürünlere geçiş mantıklı mı? Maliyet karşılaştırması yap.' },
      { label: '📦 Stok Stratejisi', query: 'Bu PTA seviyesinde hammadde stoğu yapmalı mıyım yoksa beklemeli miyim? 3 aylık PTA trend tahmini ver.' },
    ],
    meg: [
      { label: '⚗️ MEG Maliyet Etkisi', query: 'MEG fiyat değişimi polyester iplik maliyetimi nasıl etkiler?' },
      { label: '🔄 Alternatif Hammadde', query: 'MEG yerine alternatif hammadde seçenekleri var mı?' },
    ],
    cotton: [
      { label: '🏭 Pamuk Stok Planı', query: 'Bu pamuk fiyatında stok yapma zamanı mı? Mevsimsel trend ve fiyat projeksiyonu ver.' },
      { label: '🌍 Tedarikçi Karşılaştır', query: 'Mısır, Özbekistan ve ABD pamuğu arasında fiyat-kalite karşılaştırması yap.' },
      { label: '📈 Sezon Trendi', query: 'Pamuk fiyatları önümüzdeki 3 ayda nasıl hareket eder? Ekim-hasat döngüsüne göre analiz et.' },
    ],
    shf: [
      { label: '🚢 Nakliye Hesapla', query: 'Bu navlun seviyesinde Çin-Türkiye konteyner maliyetim nedir? 20ft ve 40ft container için hesapla.' },
      { label: '🗺️ Alternatif Rota', query: 'Shanghai navlunu yüksekken alternatif lojistik rotaları var mı? Hindistan, Vietnam veya kara yolu seçeneklerini değerlendir.' },
      { label: '📦 Stok Riski', query: 'Navlun artışında stok yönetimi stratejim ne olmalı? Erken sipariş mi yoksa yerel tedarik mi?' },
    ],
    brent: [
      { label: '⛽ Enerji Maliyeti', query: 'Brent petrol fiyatı üretim enerji maliyetimi ve nakliye maliyetimi nasıl etkiler?' },
      { label: '🏭 Üretim Maliyet', query: 'Petrol fiyatındaki bu değişimin toplam üretim maliyetime etkisini hesapla.' },
    ],
  };
  return prompts[metricId] || [
    { label: '📊 Detaylı Analiz', query: 'Bu veriyi detaylı analiz et ve iş kararlarıma etkisini açıkla.' },
    { label: '💰 Maliyet Etkisi', query: 'Bu değişimin üretim ve ihracat maliyetlerime etkisini hesapla.' },
  ];
}


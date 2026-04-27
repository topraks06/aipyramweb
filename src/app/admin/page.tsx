'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { getNode, getAllSovereignNodeIds, SOVEREIGN_NODES, type SovereignNodeId } from '@/lib/sovereign-config';
import {
  Zap, Globe, Activity, Send, Loader2, Shield, Bot,
  BarChart3, Users, Inbox, Newspaper, Settings, ChevronRight,
  Terminal, Database, Bell, ExternalLink, LogOut, Cpu
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// ALOHA CHAT PANEL (Sağ taraf — sabit)
// ═══════════════════════════════════════════════════
function AlohaChat({ activeNode }: { activeNode: SovereignNodeId }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'aloha'; text: string; ts: number }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Chat geçmişi yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aloha_chat_history');
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  // Chat geçmişini kaydet (son 50 mesaj)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aloha_chat_history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, ts: Date.now() }]);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s — engine tool zinciri uzun sürebilir
      const res = await fetch('/api/aloha/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          userId: 'admin',
          stream: false,
          systemContext: { activeNode, source: 'sovereign_command_center' },
          history: messages.slice(-6),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'aloha', text: data.text || data.error || 'Yanıt yok', ts: Date.now() }]);
    } catch (err: any) {
      const errorMsg = err.name === 'AbortError' 
        ? '⏱️ Zaman aşımı — ALOHA yanıt veremedi (30s)' 
        : `❌ ${err.message}`;
      setMessages(prev => [...prev, { role: 'aloha', text: errorMsg, ts: Date.now() }]);
    }
    setLoading(false);
  }, [input, loading, messages, activeNode]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickCommands = [
    'sistem durumu',
    'döngü başlat',
    `${activeNode} satışları`,
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Bot className="w-4 h-4 text-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">ALOHA</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-green-500/70 font-mono">ONLINE</span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
            <p className="text-[11px] text-zinc-600 mb-4">Komut verin, ALOHA çalıştırsın.</p>
            <div className="flex flex-col gap-1.5">
              {quickCommands.map(cmd => (
                <button
                  key={cmd}
                  onClick={() => setInput(cmd)}
                  className="text-[10px] px-3 py-2 bg-white/[0.03] text-blue-400/70 rounded-lg border border-white/[0.06] hover:bg-white/[0.06] hover:text-blue-400 transition-all text-left"
                >
                  <span className="text-zinc-600 mr-1">$</span> {cmd}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-[12px] leading-relaxed px-3 py-2.5 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-500/10 text-blue-300 ml-4 border border-blue-500/10'
                : 'bg-white/[0.02] text-zinc-300 mr-2 border border-white/[0.04]'
            }`}
          >
            <span className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">
              {m.role === 'user' ? 'SEN' : 'ALOHA'}
            </span>
            <AlohaMessage text={m.text} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-500">
            <Loader2 className="w-3 h-3 animate-spin" /> Düşünüyor...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Komut ver..."
            className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-[12px] text-white placeholder:text-zinc-700 focus:border-blue-500/40 focus:outline-none font-mono"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Basit markdown render (bold, code, lists, links)
function AlohaMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // List items
        if (/^[\-\*] /.test(line)) {
          return <div key={i} className="flex gap-1.5"><span className="text-blue-500">•</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(line.replace(/^[\-\*] /, '')) }} /></div>;
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          return <div key={i} className="flex gap-1.5"><span className="text-blue-500 font-mono text-[10px]">{line.match(/^(\d+)/)?.[1]}.</span><span dangerouslySetInnerHTML={{ __html: inlineFormat(line.replace(/^\d+\.\s/, '')) }} /></div>;
        }
        // Headers
        if (/^###?\s/.test(line)) {
          return <div key={i} className="font-bold text-white text-[13px] mt-1">{line.replace(/^###?\s/, '')}</div>;
        }
        // Code blocks
        if (line.startsWith('```')) return null;
        // Empty
        if (!line.trim()) return <div key={i} className="h-1" />;
        // Normal
        return <div key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />;
      })}
    </div>
  );
}

function inlineFormat(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-white/10 rounded text-blue-300 text-[11px] font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="text-zinc-400">$1</em>');
}

// ═══════════════════════════════════════════════════
// NODE CARD — Sol sidebar
// ═══════════════════════════════════════════════════
const NODE_ICONS: Record<string, string> = {
  trtex: '📡', perde: '🎭', hometex: '🏠', vorhang: '🇩🇪', icmimar: '🏗️',
  shtori: '🇷🇺', parda: '🇮🇷', donoithat: '🇻🇳', perabot: '🇮🇩', heimtex: '🛡️',
};

// ═══════════════════════════════════════════════════
// PANEL VIEWS — Mevcut bileşenlerin plug-in noktaları
// ═══════════════════════════════════════════════════
type PanelView = 'overview' | 'agents' | 'commercial' | 'domains' | 'trtex' | 'inbox';

// Lazy imports — mevcut bileşenleri reuse et
import dynamic from 'next/dynamic';

const AgentInbox = dynamic(() => import('@/components/admin/AgentInbox'), { 
  loading: () => <PanelLoader label="Inbox" />,
  ssr: false 
});
const CommercialPanel = dynamic(() => import('@/components/admin/CommercialPanel'), { 
  loading: () => <PanelLoader label="Commercial" />,
  ssr: false 
});
const DomainManagement = dynamic(() => import('@/components/admin/DomainManagement'), { 
  loading: () => <PanelLoader label="Domains" />,
  ssr: false 
});
const TrtexControlPanel = dynamic(() => import('@/components/admin/TrtexControlPanel'), { 
  loading: () => <PanelLoader label="TRTEX" />,
  ssr: false 
});

function PanelLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mr-2" />
      <span className="text-[11px] text-zinc-600 font-mono">{label} yükleniyor...</span>
    </div>
  );
}

// Error Boundary — panel çökerse sistemi kilitlemesin
class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Shield className="w-8 h-8 text-red-500/50" />
          <p className="text-[12px] text-red-400 font-mono">{this.props.name} yüklenemedi</p>
          <p className="text-[10px] text-zinc-600 max-w-md text-center">{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="text-[10px] px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-zinc-400 hover:text-white"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════
// OVERVIEW PANEL — Node'un genel durumu
// ═══════════════════════════════════════════════════
function NodeOverview({ nodeId }: { nodeId: SovereignNodeId }) {
  const node = getNode(nodeId);
  const features = Object.entries(node.features).filter(([, v]) => v).map(([k]) => k);

  return (
    <div className="space-y-6 p-6">
      {/* Node Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-2xl">
          {NODE_ICONS[nodeId] || '🌐'}
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">{node.shortName}</h2>
          <p className="text-[11px] text-zinc-500 font-mono">{node.domain} · {node.locale.toUpperCase()}</p>
        </div>
        <a
          href={`/sites/${node.domain}`}
          target="_blank"
          className="ml-auto px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[10px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3" /> Siteyi Aç
        </a>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Durum</div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-green-500">ONLINE</span>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Tema</div>
          <div className="text-sm font-bold text-white capitalize">{node.theme}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Koleksiyon</div>
          <div className="text-sm font-bold text-white font-mono">{node.memberCollection}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Otonom</div>
          <div className={`text-sm font-bold ${node.features.autonomous ? 'text-green-500' : 'text-zinc-600'}`}>
            {node.features.autonomous ? '✅ AKTİF' : '⏸ PASİF'}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">Aktif Özellikler</h3>
        <div className="flex flex-wrap gap-2">
          {features.map(f => (
            <span key={f} className="text-[10px] px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-mono">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Nav Links */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">Public Links</h3>
          <div className="space-y-1.5">
            {node.publicNavLinks.map(link => (
              <a key={link.href} href={`/sites/${node.domain}${link.href}`} target="_blank"
                className="block text-[11px] text-zinc-400 hover:text-blue-400 transition-colors py-1">
                {link.name} <span className="text-zinc-700">→</span>
              </a>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">Private Links</h3>
          <div className="space-y-1.5">
            {node.privateNavLinks.map(link => (
              <a key={link.href} href={`/sites/${node.domain}${link.href}`} target="_blank"
                className="block text-[11px] text-zinc-400 hover:text-blue-400 transition-colors py-1">
                🔒 {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN COMMAND CENTER
// ═══════════════════════════════════════════════════
export default function SovereignCommandCenter() {
  const router = useRouter();
  const { user, loading, isAdmin, logout } = useAuth();
  const [activeNode, setActiveNode] = useState<SovereignNodeId>('perde');
  const [activePanel, setActivePanel] = useState<PanelView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/admin/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  // Top 5 active nodes
  const primaryNodes: SovereignNodeId[] = ['perde', 'trtex', 'hometex', 'vorhang', 'icmimar'];

  const menuItems: { id: PanelView; label: string; icon: React.ReactNode; nodeSpecific?: boolean }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'inbox', label: 'Agent Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'commercial', label: 'Ticaret', icon: <Database className="w-4 h-4" /> },
    { id: 'domains', label: 'Domainler', icon: <Globe className="w-4 h-4" /> },
    { id: 'trtex', label: 'TRTEX Kontrol', icon: <Newspaper className="w-4 h-4" />, nodeSpecific: true },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return (
    <div className="h-screen bg-[#050507] text-white flex overflow-hidden">
      {/* ═══ LEFT SIDEBAR — Node Switcher + Menu ═══ */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-white/[0.06] flex flex-col transition-all duration-300 shrink-0`}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-sm font-black tracking-[0.1em]">AIPYRAM</div>
              <div className="text-[8px] text-blue-400/70 uppercase tracking-[0.25em]">Sovereign OS</div>
            </div>
          )}
        </div>

        {/* Node Switcher */}
        <div className="px-2 py-3 border-b border-white/[0.06]">
          {!sidebarCollapsed && (
            <div className="text-[9px] text-zinc-600 uppercase tracking-[0.25em] font-bold px-2 mb-2">Projeler</div>
          )}
          <div className="space-y-0.5">
            {primaryNodes.map(id => {
              const node = getNode(id);
              const isActive = activeNode === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveNode(id); setActivePanel('overview'); }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className="text-base shrink-0">{NODE_ICONS[id]}</span>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate">{node.shortName}</div>
                        <div className="text-[9px] text-zinc-600 truncate">{node.domain}</div>
                      </div>
                      {node.features.autonomous && (
                        <Activity className="w-3 h-3 text-green-500 animate-pulse shrink-0" />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 px-2 py-3 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="text-[9px] text-zinc-600 uppercase tracking-[0.25em] font-bold px-2 mb-2">Paneller</div>
          )}
          <div className="space-y-0.5">
            {menuItems.map(item => {
              const isActive = activePanel === item.id;
              // TRTEX panelini sadece trtex seçiliyken göster
              if (item.nodeSpecific && item.id === 'trtex' && activeNode !== 'trtex') return null;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  }`}
                >
                  {item.icon}
                  {!sidebarCollapsed && (
                    <span className="text-[11px] font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User + Collapse */}
        <div className="px-3 py-3 border-t border-white/[0.06] space-y-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-1 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</span>
            </div>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex-1 px-2 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] rounded text-[10px] text-zinc-600 transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
            <button
              onClick={handleLogout}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-[10px] text-red-400 transition-colors"
              title="Çıkış"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CENTER — Dynamic Panel ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="h-12 border-b border-white/[0.06] flex items-center px-5 gap-3 shrink-0">
          <span className="text-base">{NODE_ICONS[activeNode]}</span>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            {getNode(activeNode).shortName}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-[11px] text-zinc-500">
            {menuItems.find(m => m.id === activePanel)?.label || 'Genel Bakış'}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[9px] font-mono text-zinc-700">
              {new Date().toLocaleDateString('tr-TR')}
            </span>
            <Cpu className="w-3.5 h-3.5 text-zinc-700" />
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activePanel === 'overview' && <NodeOverview nodeId={activeNode} />}
          {activePanel === 'inbox' && <PanelErrorBoundary name="Agent Inbox"><div className="p-6"><AgentInbox /></div></PanelErrorBoundary>}
          {activePanel === 'commercial' && <PanelErrorBoundary name="Ticaret"><div className="p-6"><CommercialPanel /></div></PanelErrorBoundary>}
          {activePanel === 'domains' && <PanelErrorBoundary name="Domainler"><div className="p-6"><DomainManagement /></div></PanelErrorBoundary>}
          {activePanel === 'trtex' && activeNode === 'trtex' && <PanelErrorBoundary name="TRTEX Kontrol"><div className="p-6"><TrtexControlPanel /></div></PanelErrorBoundary>}
        </div>
      </div>

      {/* ═══ RIGHT — ALOHA Chat (Sabit) ═══ */}
      <div className="w-80 border-l border-white/[0.06] flex flex-col shrink-0">
        <AlohaChat activeNode={activeNode} />
      </div>
    </div>
  );
}

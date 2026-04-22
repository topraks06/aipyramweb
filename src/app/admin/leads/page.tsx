'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';

const COLUMNS = ['NEW', 'CONTACTED', 'OFFER SENT', 'WON', 'LOST'];

export default function LeadIntelligencePanel() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.leads) {
          // Add default status and mock scores if not present for pipeline display
          const processedLeads = data.leads.map((l: any) => ({
            ...l,
            status: l.status || 'NEW',
            context_score: l.context_score || Math.floor(Math.random() * 40) + 50, // mock score 50-90
            matched_supplier: l.status === 'NEW' ? 'Nova Home Textiles' : null
          }));
          setLeads(processedLeads);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(l => l.status === status).sort((a, b) => b.context_score - a.context_score);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 font-sans p-6 selection:bg-red-500/30">
      <div className="w-full mx-auto" style={{ maxWidth: '1800px' }}>
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-500 mb-2">AIPyram B2B Deal Engine</div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Deal Pipeline</h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-zinc-500">
            <Link href="/admin" className="hover:text-white transition-colors border border-white/10 px-4 py-2 uppercase">← Admin Panel</Link>
            <div className="px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 uppercase">
              {leads.length} ACTİVE DEALS
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Syncing Master Node...
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory">
            {COLUMNS.map(col => (
              <div key={col} className="min-w-[350px] w-[350px] flex-shrink-0 snap-center">
                <div className="flex items-center justify-between border-b-2 border-white/10 mb-4 pb-2">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-zinc-400">{col}</h2>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 text-zinc-300">
                    {getLeadsByStatus(col).length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {getLeadsByStatus(col).map((lead, idx) => (
                    <div key={lead.id || idx} className="bg-[#0A0A0A] border border-white/10 p-5 flex flex-col hover:border-white/30 transition-colors group">
                      
                      {/* Top Bar: Source & Score */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[9px] font-mono uppercase tracking-widest px-2 py-1 bg-white/5 text-zinc-400">
                          {lead.context_type || lead.target_intent || 'GENERAL'}
                        </div>
                        <div className={`text-[10px] font-mono font-bold px-2 py-1 border ${getScoreColor(lead.context_score)}`}>
                          SCORE: {lead.context_score}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="text-lg font-bold mb-1 truncate text-white">{lead.company}</h3>
                      <div className="text-zinc-400 text-xs mb-3 truncate flex items-center gap-2">
                        {lead.email} 
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-2 mt-2 pt-3 border-t border-white/5">
                        <div className="flex justify-between text-[10px] uppercase font-mono">
                          <span className="text-zinc-600">Location</span>
                          <span className="text-zinc-300">{lead.country || 'Unknown'}</span>
                        </div>
                        {lead.context_title && (
                          <div className="text-[10px] uppercase font-mono mt-2">
                            <span className="text-zinc-600 block mb-1">Intent</span>
                            <span className="text-zinc-300 line-clamp-1">{lead.context_title}</span>
                          </div>
                        )}
                      </div>

                      {/* Auto-Match & Actions */}
                      {lead.status === 'NEW' && lead.matched_supplier && (
                        <div className="mt-4 pt-4 border-t border-dashed border-white/10">
                          <div className="text-[9px] font-mono uppercase text-green-500 mb-2">⚡ AUTO-MATCH FOUND</div>
                          <div className="text-xs text-white mb-3">Target: {lead.matched_supplier}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono uppercase py-2 transition-colors border border-white/10">
                              <Mail className="w-3 h-3" /> E-Mail Taslağı
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/40 text-green-500 text-[10px] font-mono uppercase py-2 transition-colors border border-green-500/30">
                              <MessageSquare className="w-3 h-3" /> WA Gönder
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Contacted Action */}
                      {lead.status !== 'NEW' && (
                        <button className="mt-4 w-full bg-white/5 text-zinc-400 font-mono uppercase tracking-wider text-[10px] py-2 hover:bg-white hover:text-black transition-colors border border-white/10">
                          Update Status
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {getLeadsByStatus(col).length === 0 && (
                    <div className="p-8 text-center border border-dashed border-white/5 bg-white/[0.01]">
                      <span className="text-[10px] font-mono uppercase text-zinc-700">Empty Pipeline</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

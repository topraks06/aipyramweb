'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare } from 'lucide-react';

const COLUMNS = ['NEW', 'CONTACTED', 'OFFER SENT', 'WON', 'LOST'];

export default function LeadIntelligencePanel() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.leads) {
          // Process leads to ensure they have default structure without hardcoded mocks
          const processedLeads = data.leads.map((l: any) => ({
            ...l,
            status: l.status || 'NEW',
            context_score: l.context_score || 0,
            matched_supplier: l.matched_supplier || null
          }));
          setLeads(processedLeads);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500 bg-red-500/10 border-red-500/30';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter(l => l.status === status).sort((a, b) => b.context_score - a.context_score);
  };

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'WON').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans p-4 rounded-xl border border-slate-200 shadow-inner">
      <div className="w-full mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-red-500 mb-1">AIPyram B2B Deal Engine</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Deal Pipeline</h1>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-slate-500">
            <div className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 uppercase rounded-md">
              CONVERSION: %{conversionRate}
            </div>
            <div className="px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 uppercase rounded-md">
              {leads.filter(l=>!['WON','LOST'].includes(l.status)).length} ACTİVE DEALS
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Syncing Master Node...
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory">
            {COLUMNS.map(col => (
              <div key={col} className="min-w-[350px] w-[350px] flex-shrink-0 snap-center">
                <div className="flex items-center justify-between border-b-2 border-slate-200 mb-4 pb-2">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-slate-600">{col}</h2>
                  <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 text-slate-700">
                    {getLeadsByStatus(col).length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {getLeadsByStatus(col).map((lead, idx) => (
                    <div key={lead.id || idx} className="bg-white border border-slate-200 p-5 flex flex-col hover:border-slate-300 transition-colors group">
                      
                      {/* Top Bar: Source & Score */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[9px] font-mono uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600">
                          {lead.context_type || lead.target_intent || 'GENERAL'}
                        </div>
                        <div className={`text-[10px] font-mono font-bold px-2 py-1 border ${getScoreColor(lead.context_score)}`}>
                          SCORE: {lead.context_score}
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="text-lg font-bold mb-1 truncate text-slate-900">{lead.company}</h3>
                      <div className="text-slate-600 text-xs mb-3 truncate flex items-center gap-2">
                        {lead.email} 
                      </div>
                      
                      {/* Details */}
                      <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-[10px] uppercase font-mono">
                          <span className="text-zinc-600">Location</span>
                          <span className="text-slate-700">{lead.country || 'Unknown'}</span>
                        </div>
                        {lead.context_title && (
                          <div className="text-[10px] uppercase font-mono mt-2">
                            <span className="text-zinc-600 block mb-1">Intent</span>
                            <span className="text-slate-700 line-clamp-1">{lead.context_title}</span>
                          </div>
                        )}
                      </div>

                      {/* Auto-Match & Actions */}
                      {lead.status === 'NEW' && lead.matched_supplier && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                          <div className="text-[9px] font-mono uppercase text-green-500 mb-2">⚡ AUTO-MATCH FOUND</div>
                          <div className="text-xs text-slate-900 mb-3">Target: {lead.matched_supplier}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-mono uppercase py-2 transition-colors border border-slate-200">
                              <Mail className="w-3 h-3" /> E-Mail Taslağı
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/40 text-green-500 text-[10px] font-mono uppercase py-2 transition-colors border border-green-500/30">
                              <MessageSquare className="w-3 h-3" /> WA Gönder
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Action Panel */}
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                        {updatingId === lead.id ? (
                          <div className="text-center text-[10px] uppercase font-mono text-slate-500 py-2">Updating...</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {COLUMNS.map(c => {
                              if (c === lead.status) return null;
                              return (
                                <button
                                  key={c}
                                  onClick={() => handleUpdateStatus(lead.id, c)}
                                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-[9px] font-mono uppercase py-1.5 border border-slate-200 text-slate-600 transition"
                                >
                                  → {c}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {getLeadsByStatus(col).length === 0 && (
                    <div className="p-8 text-center border border-dashed border-slate-100 bg-slate-50">
                      <span className="text-[10px] font-mono uppercase text-zinc-700">Empty Pipeline</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

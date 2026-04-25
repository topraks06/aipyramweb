'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Bell, AlertTriangle, CheckCircle, Info, Clock, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UAPMessage {
  id: string;
  transaction_id?: string;
  agent_id: string;
  project: string;
  task_type: string;
  status: 'PENDING_APPROVAL' | 'RESOLVED' | 'REJECTED';
  reason?: string;
  mode?: string;
  created_at?: any;
  metadata?: {
    confidence: number;
    impact: string;
    cost_estimate: number;
  };
  data?: any;
}

export default function AgentInbox() {
  const [messages, setMessages] = useState<UAPMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // aloha_inbox koleksiyonunu dinle (UAP protokolü)
    const q = query(
      collection(db, 'aloha_inbox'),
      orderBy('created_at', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: UAPMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as UAPMessage);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('[AgentInbox] fetch error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return <AlertTriangle className="text-amber-500 w-5 h-5" />;
      case 'REJECTED': return <AlertTriangle className="text-red-500 w-5 h-5" />;
      default: return <Info className="text-indigo-500 w-5 h-5" />;
    }
  };

  const recordLearning = async (msg: UAPMessage, action: 'APPROVED' | 'REJECTED' | 'IGNORED') => {
    try {
      const mode = msg.mode || 'normal';
      const patternId = `${msg.task_type || 'unknown'}_${msg.project || 'global'}_${mode}`.replace(/[^a-zA-Z0-9_]/g, '_');
      const lessonRef = doc(db, 'aloha_lessons_learned', patternId);
      
      const updateData: any = {
        pattern: {
          task: msg.task_type || 'unknown',
          project: msg.project || 'global',
          mode: mode
        },
        lastDecision: action,
        updatedAt: new Date(),
        weight: 1.0 // Reversal / Refresh Mechanism: Human action resets decay
      };
      
      if (action === 'APPROVED') updateData.approved = increment(1);
      if (action === 'REJECTED') updateData.rejected = increment(1);
      if (action === 'IGNORED') updateData.ignored = increment(1);
      
      // @ts-ignore
      await setDoc(lessonRef, updateData, { merge: true });
    } catch (e) {
      console.error('[AgentInbox] Learning record error:', e);
    }
  };

  const handleApprove = useCallback(async (msg: UAPMessage) => {
    try {
      const docRef = doc(db, 'aloha_inbox', msg.id);
      await updateDoc(docRef, { status: 'RESOLVED' });
      await recordLearning(msg, 'APPROVED');
    } catch (err) {
      console.error('[AgentInbox] Onay hatası:', err);
    }
  }, []);

  const handleReject = useCallback(async (msg: UAPMessage) => {
    try {
      const docRef = doc(db, 'aloha_inbox', msg.id);
      await updateDoc(docRef, { status: 'REJECTED' });
      await recordLearning(msg, 'REJECTED');
    } catch (err) {
      console.error('[AgentInbox] Reddetme hatası:', err);
    }
  }, []);

  const handleIgnore = useCallback(async (msg: UAPMessage) => {
    try {
      const docRef = doc(db, 'aloha_inbox', msg.id);
      await updateDoc(docRef, { status: 'IGNORED' });
      await recordLearning(msg, 'IGNORED');
    } catch (err) {
      console.error('[AgentInbox] Görmezden gelme hatası:', err);
    }
  }, []);

  const pendingCount = messages.filter(m => m.status === 'PENDING_APPROVAL').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Sovereign Inbox (CFO Guard)
          {pendingCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 animate-pulse">
              {pendingCount} ONAY BEKLİYOR
            </span>
          )}
        </h3>
      </div>
      
      <div className="p-0 max-h-[450px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500 animate-pulse">Sinyaller dinleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-sm text-slate-500 font-medium">CFO kalkanı temiz.</p>
            <p className="text-xs text-slate-400 mt-1">Sistem otonom kararlar alıyor, bütçe aşımı yok.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isPending = msg.status === 'PENDING_APPROVAL';
              const confPercent = msg.metadata?.confidence ? (msg.metadata.confidence * 100).toFixed(0) : '0';
              const costEst = msg.metadata?.cost_estimate ? msg.metadata.cost_estimate.toFixed(4) : '0.0000';
              
              let timeStr = '';
              if (msg.created_at) {
                const date = msg.created_at.toDate ? msg.created_at.toDate() : new Date(msg.created_at);
                timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              }

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-b border-slate-100 flex gap-4 transition-colors ${isPending ? 'bg-amber-50/30' : 'bg-slate-50 opacity-60'}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(msg.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                        [{msg.project?.toUpperCase() || 'CORE'}] {msg.agent_id}
                        {msg.mode === 'critical' && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold">CRITICAL MODE</span>}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{timeStr}</span>
                    </div>
                    
                    <p className="text-xs font-medium text-slate-700 mt-1">
                      Sebep: <span className="text-amber-700 font-bold">{msg.reason || 'Yüksek maliyet riski'}</span>
                    </p>
                    
                    {msg.data?.task && (
                       <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 italic border-l-2 border-slate-200 pl-2">
                         "{msg.data.task}"
                       </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 gap-1">
                         <Activity size={10} />
                         Güven: %{confPercent}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 gap-1">
                         Etki: {msg.metadata?.impact?.toUpperCase() || 'N/A'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 gap-1">
                         <DollarSign size={10} />
                         Maliyet: ${costEst}
                      </span>

                      <div className="flex-1"></div>

                      {isPending && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleIgnore(msg)}
                            className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1.5 rounded hover:bg-slate-300 transition-colors shadow-sm"
                            title="Görmezden Gel"
                          >
                            IGNORE
                          </button>
                          <button 
                            onClick={() => handleReject(msg)}
                            className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1.5 rounded hover:bg-red-200 transition-colors shadow-sm"
                            title="Reddet (İptal Et)"
                          >
                            REDDET
                          </button>
                          <button 
                            onClick={() => handleApprove(msg)}
                            className="text-[10px] font-bold bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            OTONOMİYE İZİN VER
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

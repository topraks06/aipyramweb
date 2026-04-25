'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgentMessage {
  id: string;
  agentId: string;
  type: 'info' | 'warning' | 'error' | 'approval';
  title: string;
  message: string;
  timestamp: number;
  status: 'unread' | 'read' | 'resolved';
}

export default function AgentInbox() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'agent_inbox'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: AgentMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as AgentMessage);
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('[AgentInbox] fetch error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-amber-500 w-5 h-5" />;
      case 'error': return <AlertTriangle className="text-red-500 w-5 h-5" />;
      case 'approval': return <Clock className="text-blue-500 w-5 h-5" />;
      default: return <Info className="text-indigo-500 w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Agent Inbox
          {messages.filter(m => m.status === 'unread').length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">
              {messages.filter(m => m.status === 'unread').length} YENİ
            </span>
          )}
        </h3>
      </div>
      
      <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500 animate-pulse">Sinyaller dinleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-sm text-slate-500 font-medium">Gelen kutusu temiz.</p>
            <p className="text-xs text-slate-400 mt-1">Ajanlar otonom çalışıyor, müdahale gerekmiyor.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border-b border-slate-100 flex gap-4 hover:bg-slate-50 transition-colors ${msg.status === 'unread' ? 'bg-indigo-50/30' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(msg.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {msg.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {msg.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {msg.agentId}
                    </span>
                    {msg.type === 'approval' && (
                      <button className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors">
                        ONAYLA
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

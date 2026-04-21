"use client";

import { useState } from 'react';
import { Check, X, ShieldAlert, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApprovalWidgetProps {
  title: string;
  description: string;
  requires2FA?: boolean;
  isMasterAuth?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalWidget({ title, description, requires2FA, isMasterAuth, onApprove, onReject }: ApprovalWidgetProps) {
  const [show2FA, setShow2FA] = useState(false);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInitialApprove = () => {
    if (isMasterAuth) {
      // Bypasses 2FA for the Master Session natively.
      onApprove();
    } else if (requires2FA) {
      setShow2FA(true);
    } else {
      onApprove();
    }
  };

  const handleVerify2FA = () => {
    if (code.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        onApprove();
      }, 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mt-3 w-full shadow-2xl relative overflow-hidden"
    >
      {requires2FA && !isMasterAuth && (
        <div className="absolute top-0 right-0 bg-red-500/10 text-red-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <ShieldAlert size={12} />
          YÜKSEK GÜVENLİK
        </div>
      )}
      
      {isMasterAuth && (
        <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Check size={12} />
          SESLİ/MASTER İMZA
        </div>
      )}

      <div className="flex items-start justify-between mb-2 mt-2">
        <h4 className="text-white font-medium text-[15px] flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${requires2FA ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></span>
          {title}
        </h4>
      </div>
      <p className="text-gray-400 text-[13px] mb-5 leading-relaxed">{description}</p>

      <AnimatePresence mode="wait">
        {!show2FA ? (
          <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
            <button onClick={handleInitialApprove} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-medium transition-transform active:scale-95 flex items-center justify-center gap-2 text-[13px]">
              {isMasterAuth ? <Check size={16} /> : (requires2FA ? <ShieldAlert size={16} /> : <Check size={16} />)}
              {isMasterAuth ? 'Master Onay' : (requires2FA ? 'Güvenli Onay' : 'Onayla')}
            </button>
            <button onClick={onReject} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-xl font-medium transition-transform active:scale-95 flex items-center justify-center gap-2 text-[13px]">
              <X size={16} />
              İptal
            </button>
          </motion.div>
        ) : (
          <motion.div key="2fa" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
              <Mail size={18} className="text-blue-400" />
              <span>Sistem yöneticisi e-postasına gönderilen 6 haneli kodu girin.</span>
            </div>
            <div className="flex gap-2">
              <input type="text" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 text-center text-lg tracking-widest text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all" />
              <button onClick={handleVerify2FA} disabled={code.length !== 6 || isVerifying} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center">
                {isVerifying ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Doğrula'}
              </button>
            </div>
            <button onClick={() => setShow2FA(false)} className="w-full text-center text-[12px] text-gray-500 hover:text-gray-300 mt-2">Vazgeç ve İptal Et</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

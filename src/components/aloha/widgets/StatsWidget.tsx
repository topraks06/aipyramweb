"use client";

import { motion } from 'motion/react';
import { Activity, Users, Globe } from 'lucide-react';

export function StatsWidget() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-3 mt-3 max-w-lg">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <Globe className="text-blue-400 mb-2" size={24} />
        <span className="text-2xl font-bold text-white">270</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Aktif Domain</span>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <Users className="text-emerald-400 mb-2" size={24} />
        <span className="text-2xl font-bold text-white">57</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Online Ajan</span>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <Activity className="text-purple-400 mb-2" size={24} />
        <span className="text-2xl font-bold text-white">99.9%</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Sistem Sağlığı</span>
      </div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { resolveNodeFromDomain } from '@/lib/sovereign-config';
import { Package, Users, Activity, TrendingUp, Search, RefreshCcw, Bell } from 'lucide-react';
import Link from 'next/link';

export default function DemoDashboardPage() {
    const pathname = usePathname() || '';
    const domain = pathname.split('/')[2];
    const node = resolveNodeFromDomain(domain);
    
    // FAKE DATA FOR SALES PRESENTATION
    const fakeOrders = [
        { id: 'ORD-98237A', date: '2026-04-22', customer: 'Global Textiles Ltd', status: 'completed', amount: 14500.00 },
        { id: 'ORD-98237B', date: '2026-04-21', customer: 'Müller Home', status: 'pending', amount: 3200.50 },
        { id: 'ORD-98237C', date: '2026-04-20', customer: 'Dubai Curtains LLC', status: 'paid', amount: 8900.00 },
        { id: 'ORD-98237D', date: '2026-04-19', customer: 'Interior Design Co.', status: 'completed', amount: 1200.00 },
        { id: 'ORD-98237E', date: '2026-04-18', customer: 'Hotel Bosphorus', status: 'pending', amount: 45000.00 },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#111] text-white font-sans selection:bg-[#D4AF37] selection:text-white">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#1A1A1A]">
                    <h1 className="font-serif text-xl font-bold uppercase tracking-widest text-white">{node.shortName}</h1>
                    <p className="text-[9px] text-green-500 font-mono tracking-widest mt-1 animate-pulse">DEMO MODE ACTIVE</p>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                    <button className="flex items-center gap-3 p-3 bg-[#1A1A1A] text-white rounded-sm hover:bg-[#222] transition-colors text-left">
                        <Activity className="w-4 h-4" /> Overview
                    </button>
                    <button className="flex items-center gap-3 p-3 hover:bg-[#1A1A1A] hover:text-white rounded-sm transition-colors text-left">
                        <Package className="w-4 h-4" /> Orders
                    </button>
                    <button className="flex items-center gap-3 p-3 hover:bg-[#1A1A1A] hover:text-white rounded-sm transition-colors text-left">
                        <Users className="w-4 h-4" /> Vendors
                    </button>
                </div>
                <div className="p-4 border-t border-[#1A1A1A]">
                    <Link 
                        href={`/sites/${domain}/`}
                        className="block w-full text-center py-2 bg-[#1A1A1A] hover:bg-[#222] transition-colors text-[10px] uppercase tracking-widest font-bold border border-[#333]"
                    >
                        RETURN TO SITE
                    </Link>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col bg-[#111] overflow-hidden relative">
                {/* DEMO WATERMARK */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
                    <span className="font-serif text-[15rem] font-bold rotate-[-15deg] whitespace-nowrap">DEMO</span>
                </div>

                {/* HEADER */}
                <header className="h-16 bg-[#111] border-b border-[#1A1A1A] flex items-center justify-between px-8 shrink-0 relative z-10">
                    <div className="flex items-center gap-4 text-zinc-400">
                        <Search className="w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search in Demo..." 
                            className="bg-transparent border-none text-sm focus:outline-none w-64 text-white placeholder-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] uppercase font-mono tracking-widest bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-sm">
                            PRESENTATION MODE
                        </span>
                        <Bell className="w-4 h-4 text-zinc-400" />
                    </div>
                </header>

                {/* CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-8 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Demo Command Center</h2>
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Simulated Escrow & Order Intelligence</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-[#1A1A1A] border border-[#222] px-6 py-4 flex flex-col gap-1 min-w-[160px]">
                                <span className="text-[10px] uppercase text-zinc-500 font-mono">Simulated Volume</span>
                                <span className="text-xl font-bold text-white flex items-center gap-2">
                                    €72,800.50
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </span>
                            </div>
                            <div className="bg-[#1A1A1A] border border-[#222] px-6 py-4 flex flex-col gap-1 min-w-[160px]">
                                <span className="text-[10px] uppercase text-zinc-500 font-mono">Active Orders</span>
                                <span className="text-xl font-bold text-[#D4AF37]">5</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1A1A1A] flex justify-between items-center">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Simulated Transactions</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#111] text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Order ID</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Date</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Customer</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Status</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fakeOrders.map((order, i) => (
                                        <tr key={i} className="border-b border-[#1A1A1A] hover:bg-[#151515] transition-colors group cursor-pointer text-sm">
                                            <td className="px-6 py-4 font-mono text-zinc-400 text-xs">
                                                {order.id}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300">
                                                {order.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium">{order.customer}</div>
                                                <div className="text-[10px] text-zinc-500 font-mono">AIPyram Vendor</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${
                                                    order.status === 'completed' || order.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white">
                                                €{order.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

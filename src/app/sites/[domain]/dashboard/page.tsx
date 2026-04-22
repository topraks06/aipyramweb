'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { resolveTenantFromDomain } from '@/lib/tenant-config';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Package, Users, Activity, TrendingUp, Search, RefreshCcw } from 'lucide-react';

export default function DashboardPage() {
    const pathname = usePathname() || '';
    const domain = pathname.split('/')[2];
    const tenant = resolveTenantFromDomain(domain);
    const { user, logout } = useTenantAuth(tenant.id);
    
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Using tenant's projectCollection for orders
            const q = query(collection(db, tenant.projectCollection), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            // Ignore index errors or missing collection errors for demo, just show empty
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [tenant.projectCollection]);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-64 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#1A1A1A]">
                    <h1 className="font-serif text-xl font-bold uppercase tracking-widest text-white">{tenant.shortName}</h1>
                    <p className="text-[9px] text-[#D4AF37] font-mono tracking-widest mt-1">MASTER NODE</p>
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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                            <p className="text-[9px] text-zinc-500 font-mono uppercase">Admin</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => logout()}
                        className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold"
                    >
                        SYSTEM LOGOUT
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col bg-[#111] overflow-hidden">
                {/* HEADER */}
                <header className="h-16 bg-[#111] border-b border-[#1A1A1A] flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4 text-zinc-400">
                        <Search className="w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search orders, vendors or products..." 
                            className="bg-transparent border-none text-sm focus:outline-none w-64 text-white placeholder-zinc-600"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchOrders} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Sync Data">
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Command Center</h2>
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Real-time Escrow & Order Intelligence</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-[#1A1A1A] border border-[#222] px-6 py-4 flex flex-col gap-1 min-w-[160px]">
                                <span className="text-[10px] uppercase text-zinc-500 font-mono">Total Volume</span>
                                <span className="text-xl font-bold text-white flex items-center gap-2">
                                    €{orders.reduce((sum, o) => sum + (o.amount || o.total || 0), 0).toFixed(2)}
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </span>
                            </div>
                            <div className="bg-[#1A1A1A] border border-[#222] px-6 py-4 flex flex-col gap-1 min-w-[160px]">
                                <span className="text-[10px] uppercase text-zinc-500 font-mono">Active Orders</span>
                                <span className="text-xl font-bold text-[#D4AF37]">{orders.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#1A1A1A] flex justify-between items-center">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Transactions</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#111] text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Order ID</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Date</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Customer / Vendor</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A]">Status</th>
                                        <th className="px-6 py-4 border-b border-[#1A1A1A] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-xs font-mono">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                                Loading blockchain registry...
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-xs font-mono uppercase tracking-widest">
                                                No orders found in {tenant.projectCollection}
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, i) => (
                                            <tr key={order.id || i} className="border-b border-[#1A1A1A] hover:bg-[#151515] transition-colors group cursor-pointer text-sm">
                                                <td className="px-6 py-4 font-mono text-zinc-400 text-xs">
                                                    #{order.id?.substring(0, 8) || `ORD-${i}8A`}
                                                </td>
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-white font-medium">{order.customerEmail || order.email || 'Unknown User'}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono">{order.sellerId || 'AIPyram Vendor'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${
                                                        order.status === 'completed' || order.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                                                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                                        'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-white">
                                                    €{(order.amount || order.total || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

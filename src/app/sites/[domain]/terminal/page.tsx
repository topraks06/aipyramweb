import { notFound } from 'next/navigation';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';

export default async function TerminalPage({ params }: { params: { domain: string } }) {
    // Only available for TRTex
    if (!params.domain.includes('trtex')) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-mono flex flex-col">
            {/* Top Ticker Bar */}
            <div className="w-full bg-black border-b border-[#333]">
                <IntelligenceTicker />
            </div>

            {/* TRTEX-style Terminal Header */}
            <header className="p-4 border-b border-[#333] flex justify-between items-end bg-[#0a0a0a]">
                <div>
                    <h1 className="text-2xl font-bold text-[#f5a623] tracking-wider uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        TRTEX SOVEREIGN TERMINAL
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Global Textile Intelligence & Trading Desk</p>
                </div>
                <div className="text-right text-xs">
                    <p className="text-green-500 font-bold">SYSTEM ONLINE</p>
                    <p>{new Date().toUTCString()}</p>
                </div>
            </header>

            {/* Main Terminal Grid */}
            <div className="flex-grow p-4 grid grid-cols-12 gap-4 h-full">
                {/* Left Column: Live Market Data (Commodities, Freight) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    <div className="border border-[#333] bg-[#0a0a0a] rounded-sm p-3">
                        <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-3">Live Indices (Simulated)</h2>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm">Cotlook A Index</p>
                                    <p className="text-xs text-gray-500">Global Cotton</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-500 font-bold">85.40</p>
                                    <p className="text-green-500 text-xs">+1.2% ▲</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm">SCFI Freight</p>
                                    <p className="text-xs text-gray-500">Shanghai Container</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-500 font-bold">3,240.50</p>
                                    <p className="text-red-500 text-xs">-4.5% ▼</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm">PTA / MEG</p>
                                    <p className="text-xs text-gray-500">Polyester Raw</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-500 font-bold">780.00</p>
                                    <p className="text-green-500 text-xs">+0.8% ▲</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-[#333] bg-[#0a0a0a] rounded-sm p-3 flex-grow">
                        <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-3">Target Markets (Forex)</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span>EUR/TRY</span><span className="text-green-500">35.42 ▲</span></div>
                            <div className="flex justify-between text-sm"><span>USD/TRY</span><span className="text-white">32.15 ▬</span></div>
                            <div className="flex justify-between text-sm"><span>RUB/TRY</span><span className="text-red-500">0.34 ▼</span></div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Breaking News & ALOHA Feed */}
                <div className="col-span-12 lg:col-span-6 border border-[#333] bg-[#0a0a0a] rounded-sm p-4 relative overflow-hidden">
                    <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-4">ALOHA Live News Feed</h2>
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10 pointer-events-none mt-16" />

                    <div className="space-y-6 overflow-y-auto h-full pb-20 pr-2">
                        {/* News Item 1 */}
                        <div className="border-l-2 border-red-500 pl-3">
                            <p className="text-xs text-red-500 font-bold mb-1">🚨 BREAKING | 2 MINS AGO</p>
                            <h3 className="text-white text-lg font-bold">Almanya'da Lüks Otel Zincirinden Büyük Kontrat İhalesi</h3>
                            <p className="text-gray-400 text-sm mt-1">Marriott Frankfurt projesi için 40.000 metre blackout ve yanmaz tül perde alımı yapılacak. Türk üreticiler için öncelik tanınıyor.</p>
                            <div className="flex gap-2 mt-2">
                                <span className="bg-[#222] text-xs px-2 py-1 rounded">#CONTRACT</span>
                                <span className="bg-[#222] text-xs px-2 py-1 rounded">#DACH</span>
                            </div>
                        </div>

                        {/* News Item 2 */}
                        <div className="border-l-2 border-[#f5a623] pl-3">
                            <p className="text-xs text-[#f5a623] font-bold mb-1">⚡ HOT LEAD | 14 MINS AGO</p>
                            <h3 className="text-white text-lg font-bold">Kızıldeniz Krizi: Mısır Üzerinden Alternatif Rotalar Açılıyor</h3>
                            <p className="text-gray-400 text-sm mt-1">Navlun fiyatlarındaki artış sebebiyle Avrupalı alıcılar Çin yerine Türkiye ve Mısır pazarına yönelmeye hız verdi.</p>
                        </div>

                         {/* News Item 3 */}
                         <div className="border-l-2 border-gray-500 pl-3">
                            <p className="text-xs text-gray-500 font-bold mb-1">MARKET UPDATE | 1 HR AGO</p>
                            <h3 className="text-white text-lg font-bold">Heimtextil 2026: Sürdürülebilirlik Pavyonu Genişliyor</h3>
                            <p className="text-gray-400 text-sm mt-1">Geri dönüştürülmüş ipliklerden üretilen perde koleksiyonları fuarın ana temasını oluşturacak.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Opportunity Radar */}
                <div className="col-span-12 lg:col-span-3 border border-[#333] bg-[#0a0a0a] rounded-sm p-3">
                    <h2 className="text-[#f5a623] text-sm uppercase font-bold border-b border-[#333] pb-2 mb-3">Opportunity Radar</h2>
                    
                    <div className="space-y-4">
                        <div className="bg-[#111] p-3 rounded border border-[#222] hover:border-[#f5a623] transition-colors cursor-pointer">
                            <div className="flex justify-between items-start">
                                <span className="text-2xl">🇩🇪</span>
                                <span className="bg-green-900 text-green-400 text-[10px] px-1 py-0.5 rounded font-bold uppercase">High Probability</span>
                            </div>
                            <h4 className="text-white text-sm font-bold mt-2">Almanya Toptan Perde</h4>
                            <p className="text-xs text-gray-400 mt-1">Stok seviyeleri %15 düştü, acil alım sinyali.</p>
                            <button className="w-full mt-3 bg-[#f5a623] text-black text-xs font-bold py-1 rounded">MATCH B2B</button>
                        </div>

                        <div className="bg-[#111] p-3 rounded border border-[#222] hover:border-[#f5a623] transition-colors cursor-pointer">
                            <div className="flex justify-between items-start">
                                <span className="text-2xl">🇷🇺</span>
                                <span className="bg-yellow-900 text-yellow-400 text-[10px] px-1 py-0.5 rounded font-bold uppercase">Medium</span>
                            </div>
                            <h4 className="text-white text-sm font-bold mt-2">Rusya Döşemelik Kumaş</h4>
                            <p className="text-xs text-gray-400 mt-1">Ambargo sonrası alternatif tedarikçi arayışı artışta.</p>
                            <button className="w-full mt-3 bg-[#333] text-white text-xs font-bold py-1 rounded hover:bg-[#444]">VIEW DATA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

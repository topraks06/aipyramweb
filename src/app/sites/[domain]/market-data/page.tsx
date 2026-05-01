import React from 'react';
import type { Metadata } from 'next';
import { generateHreflang } from '@/lib/utils';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  
  return {
    title: `${brandName} — Piyasa Verileri & Emtia Fiyatları`,
    description: `Gerçek zamanlı pamuk, iplik fiyatları ve global navlun endeksleri. B2B üretici ve toptancılar için tedarik zinciri istihbaratı.`,
    alternates: generateHreflang(exactDomain, '/market-data')
  };
}

export default async function MarketDataPage({ params, searchParams }: { params: Promise<{ domain: string }>, searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const lang = resolvedSearch?.lang || "tr";

  let marketData: any[] = [];
  try {
    const snap = await adminDb.collection(`${brandName.toLowerCase()}_market_data`).limit(10).get();
    marketData = snap.docs.map(doc => doc.data());
  } catch (e) {
    // console.warn('Market data fetch error', e);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] selection:bg-red-500/30 selection:text-red-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24">
        
        {/* HEADER */}
        <div className="border-b border-gray-200 pb-8 mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-widest uppercase mb-4 rounded">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            CANLI TERMİNAL
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 font-serif">
            Piyasa Verileri
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hammadde maliyetleri, navlun endeksleri ve tedarik zinciri sinyalleri. Otonom yapay zeka tarafından sağlanan veri entegrasyonu.
          </p>
        </div>

        {/* BENTO GRID */}
        {marketData.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
             <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.1rem' }}>Otonom motor çalışıyor. Veriler yakında burada olacak.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Gelecekte gerçek veriler buraya eklenecek */}
          </div>
        )}
      </div>
    </div>
  );
}

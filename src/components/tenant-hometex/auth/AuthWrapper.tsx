'use client';

import React from 'react';
import Link from 'next/link';

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  basePath: string;
}

export default function HometexAuthWrapper({ children, title, basePath }: AuthWrapperProps) {
  return (
    <div className="min-h-screen bg-[#0c1117] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href={`${basePath}/`} className="inline-block">
            <h1 className="text-3xl font-serif tracking-tight text-white">HOMETEX<span className="text-blue-500">.AI</span></h1>
          </Link>
          <div className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] mt-2 font-mono">B2B TRADE INTELLIGENCE</div>
        </div>
        
        <div className="border border-white/5 bg-white/[0.02] p-8">
          <h2 className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-8 text-center">{title}</h2>
          {children}
        </div>
        
        <div className="text-center mt-6">
          <span className="text-[9px] text-zinc-700 font-mono">AIPyram Sovereign Ecosystem</span>
        </div>
      </div>
    </div>
  );
}

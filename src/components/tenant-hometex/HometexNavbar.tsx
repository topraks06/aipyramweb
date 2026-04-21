'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenantAuth } from '@/hooks/useTenantAuth';

interface HometexNavbarProps {
  theme?: 'light' | 'dark';
}

export default function HometexNavbar({ theme = 'dark' }: HometexNavbarProps) {
  const pathname = usePathname() || '';
  const domainPath = pathname.startsWith('/sites/') ? `/${pathname.split('/')[1]}/${pathname.split('/')[2]}` : '';
  const { user, isLicensed, loading, logout } = useTenantAuth('hometex');

  const linkClass = 'text-zinc-400 hover:text-white text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors py-1';
  const activeLinkClass = 'text-white border-b border-white';

  const publicLinks = [
    { name: 'Sanal Fuar', href: '/expo' },
    { name: 'Dergi', href: '/magazine' },
    { name: 'Trendler', href: '/trends' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-5 flex justify-between items-center transition-colors border-b backdrop-blur-lg bg-zinc-950/80 border-white/10 text-white">
      <div className="flex items-center gap-4">
        <Link href={`${domainPath}/`} className="font-serif text-2xl tracking-tight font-medium hover:opacity-80 transition-opacity">
          HOMETEX<span className="text-blue-500">.AI</span>
        </Link>
        {isLicensed && (
          <span className="hidden md:inline-block bg-blue-500/10 text-blue-400 text-[9px] px-2 py-0.5 font-bold uppercase tracking-[0.2em] border border-blue-500/20">
            PRO
          </span>
        )}
      </div>

      <nav className="hidden md:flex gap-8 lg:gap-10">
        {publicLinks.map(item => {
          const itemPath = `${domainPath}${item.href}`;
          const isActive = pathname === itemPath;
          return (
            <Link key={item.href} href={itemPath} className={`${linkClass} ${isActive ? activeLinkClass : ''}`}>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href={`${domainPath}/expo`} className="px-6 py-2 border bg-white text-black text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-zinc-200 transition-all">
              {isLicensed ? 'B2B Panel' : 'Fuar Gezisi'}
            </Link>
            <button onClick={() => logout()} className={linkClass}>Çıkış</button>
          </div>
        ) : (
          <>
            {!loading && (
              <Link href={`${domainPath}/register`} className={`hidden sm:block ${linkClass}`}>Kayıt Ol</Link>
            )}
            <Link href={`${domainPath}/login`} className="px-6 py-2 border bg-white text-black text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-zinc-200 transition-all">
              Giriş
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

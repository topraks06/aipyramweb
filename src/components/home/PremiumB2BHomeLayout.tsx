'use client';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import LeadCaptureModal from '@/components/trtex/LeadCaptureModal';
import NewsletterCapture from '@/components/trtex/NewsletterCapture';
import SovereignLiveConcierge from '@/components/home/SovereignLiveConcierge';
import { getFallbackImage } from '@/lib/utils';

// Zero-Mock: Sahte tender verileri KALDIRILDI (Hakan Bey kuralı)
// Firestore'da veri yoksa bilgilendirme mesajı gösterilecek.

import HeroSection from '@/components/home/sections/HeroSection';
import NewsGridSection from '@/components/home/sections/NewsGridSection';
import TenderRadarSection from '@/components/home/sections/TenderRadarSection';
import FairCalendarSection from '@/components/home/sections/FairCalendarSection';
import WorldRadarSection from '@/components/home/sections/WorldRadarSection';
import AcademySection from '@/components/home/sections/AcademySection';
import ValuePropositionSection from '@/components/home/sections/ValuePropositionSection';
import EcosystemSection from '@/components/home/sections/EcosystemSection';
import CtaSection from '@/components/home/sections/CtaSection';

export default function PremiumB2BHomeLayout({ 
  payload, lang, exactDomain, basePath, brandName, L, 
  uzakDoguRadari, priorityEngine, fairsWithCountdown, ui 
}: any) {
  const { 
    heroArticle, gridArticles = [], tickerItems = [], haftaninFirsatlari = [],
    academyArticles = [], activeTenders: rawTenders = [], radarStream
  } = payload || {};
  
  const [leadModal, setLeadModal] = useState<{ open: boolean; context: any }>({ open: false, context: { type: 'GENERAL' as const } });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      if (auth) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user && user.email === 'hakantoprak71@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        });
        return () => unsubscribe();
      }
    } catch (e) {
      console.warn("Auth check error:", e);
    }
  }, []);

  const activeFairs = fairsWithCountdown || payload?.fairsWithCountdown || [];
  const liveTenders = Array.isArray(rawTenders) ? rawTenders : [];
  const safeLang = lang || 'tr';
  const targetLang = safeLang.toUpperCase();
  
  const pool = [...(Array.isArray(haftaninFirsatlari)?haftaninFirsatlari:[]), ...(Array.isArray(gridArticles)?gridArticles:[])];
  const uniquePool = Array.from(new Map(pool.filter(item => item && item.id).map(item => [item.id, item])).values());

  const utils = {
    getLink: (path: string, slug?: string) => {
      const bp = basePath || '';
      if (safeLang === 'tr') {
        const map: Record<string, string> = { news: 'haberler', tenders: 'ihaleler', academy: 'akademi', trade: 'ticaret', fairs: 'fuarlar', radar: 'trendler' };
        return `${bp}/${map[path] || path}${slug ? `/${slug}` : ''}`;
      }
      return `${bp}/${path}${slug ? `/${slug}` : ''}?lang=${safeLang}`;
    },
    getImg: (a: any) => a?.images?.[0] || a?.image_url || getFallbackImage(a?.id),
    getTitle: (a: any) => a?.translations?.[targetLang]?.title || a?.title || ''
  };

  const totalTenders = liveTenders.filter((t:any) => t.type === 'TENDER').length;
  const totalStock = liveTenders.filter((t:any) => t.type === 'HOT_STOCK').length;
  const totalCapacity = liveTenders.filter((t:any) => t.type === 'CAPACITY').length;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --sf: 'Playfair Display',Georgia,serif; --s: 'Inter',-apple-system,sans-serif; --m: 'JetBrains Mono',monospace; --re: #DC2626; --go: #16A34A; --wa: #EAB308; --accent: #CC0000; }
        .tc { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        .section-title { font-family: var(--sf); font-size: clamp(1.4rem, 2.5vw, 2rem); font-weight: 900; color: #111827; margin-bottom: 0.25rem; }
        .section-sub { font-family: var(--m); font-size: 0.7rem; color: #9CA3AF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; }
        .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; transition: all 0.2s; }
        .card:hover { border-color: #D1D5DB; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
        .link-arrow { font-family: var(--m); font-size: 0.8rem; font-weight: 700; color: var(--accent); text-decoration: none; }
        .link-arrow:hover { text-decoration: underline; }
        .stat-badge { font-family: var(--m); font-size: 0.75rem; font-weight: 800; padding: 0.4rem 0.8rem; color: #FFF; border-radius: 6px; }
      `}} />

      {tickerItems && tickerItems.length > 0 && <IntelligenceTicker items={tickerItems} />}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="home" />

      <HeroSection heroArticle={heroArticle} totalTenders={totalTenders} totalStock={totalStock} totalCapacity={totalCapacity} safeLang={safeLang} utils={utils} />
      <NewsGridSection uniquePool={uniquePool} tickerItems={tickerItems} utils={utils} />
      <TenderRadarSection liveTenders={liveTenders} isAdmin={isAdmin} basePath={basePath} safeLang={safeLang} utils={utils} />
      <FairCalendarSection activeFairs={activeFairs} utils={utils} />
      <WorldRadarSection radarStream={radarStream} uzakDoguRadari={uzakDoguRadari} utils={utils} />
      <AcademySection academyArticles={academyArticles} uniquePool={uniquePool} utils={utils} />
      <ValuePropositionSection />
      <EcosystemSection />
      <CtaSection basePath={basePath} safeLang={safeLang} />

      <section style={{ padding: '0 0 2rem' }}>
        <div className="tc">
          <NewsletterCapture lang={safeLang} />
        </div>
      </section>

      <LeadCaptureModal isOpen={leadModal.open} onClose={() => setLeadModal({ open: false, context: { type: 'GENERAL' } })} context={leadModal.context} brandName={brandName} />
      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <SovereignLiveConcierge />
    </div>
  );
}


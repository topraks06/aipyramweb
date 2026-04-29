'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { getSovereignUser, type SovereignUser } from '@/lib/auth/SovereignIdentity';
import { NODE_THEMES } from '@/components/shared/auth/SovereignAuthWrapper';
import { Shield, Star, Globe2, Palette, ShoppingBag, Crown } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN PASSPORT CARD — Dijital Üyelik Kartı
 *  
 *  🎁 SÜRPRİZ: Kullanıcının profilinde görünen premium pasaport kartı.
 *  Hangi node'lara erişimi var, kaç tasarım yaptı, tier seviyesi.
 * ═══════════════════════════════════════════════════════════════
 */

const TIER_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; glow: string; label: string }> = {
  Platinum: {
    icon: <Crown className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)',
    glow: 'rgba(83,52,131,0.4)',
    label: '💎 Platinum',
  },
  Gold: {
    icon: <Star className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b00 30%, #614800 60%, #8B6914 100%)',
    glow: 'rgba(139,105,20,0.3)',
    label: '🥇 Gold',
  },
  Silver: {
    icon: <Shield className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 30%, #4a4a6e 60%, #6a6a8e 100%)',
    glow: 'rgba(106,106,142,0.3)',
    label: '🥈 Silver',
  },
  Bronze: {
    icon: <Shield className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f14 30%, #6b3a1f 60%, #8B5E3C 100%)',
    glow: 'rgba(139,94,60,0.3)',
    label: '🥉 Bronze',
  },
  Free: {
    icon: <Globe2 className="w-5 h-5" />,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #1e293b 50%, #334155 100%)',
    glow: 'rgba(51,65,85,0.2)',
    label: 'Free',
  },
};

export default function SovereignPassportCard() {
  const { user } = useAuth();
  const [sovereignUser, setSovereignUser] = useState<SovereignUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { setIsLoading(false); return; }
    getSovereignUser(user.uid).then(su => {
      setSovereignUser(su);
      setIsLoading(false);
    });
  }, [user?.uid]);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-800 rounded-2xl h-56 w-full max-w-md" />
    );
  }

  if (!sovereignUser) return null;

  const tier = TIER_CONFIG[sovereignUser.tier] || TIER_CONFIG['Free'];
  const passport = sovereignUser.passport;

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div
        className="relative rounded-2xl p-6 text-white overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        style={{
          background: tier.gradient,
          boxShadow: `0 20px 60px ${tier.glow}, 0 0 0 1px rgba(255,255,255,0.08) inset`,
        }}
      >
        {/* Holographic overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />

        {/* Top Row — Logo + Tier */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span className="text-sm font-bold">AI</span>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Sovereign Passport</div>
              <div className="text-xs font-mono text-white/60">{passport.passportId}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm border border-white/10">
            {tier.icon}
            <span className="text-xs font-bold">{tier.label}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="relative z-10 mb-5">
          <div className="text-lg font-bold tracking-tight">{sovereignUser.name || 'Sovereign Member'}</div>
          <div className="text-xs text-white/50 font-mono">{sovereignUser.email}</div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 relative z-10 mb-5">
          <div className="flex-1 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Palette className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Tasarımlar</span>
            </div>
            <div className="text-xl font-bold">{passport.totalDesigns}</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Siparişler</span>
            </div>
            <div className="text-xl font-bold">{passport.totalOrders}</div>
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Kredi</span>
            </div>
            <div className="text-xl font-bold">{sovereignUser.unifiedCredits >= 99999 ? '∞' : sovereignUser.unifiedCredits}</div>
          </div>
        </div>

        {/* Active Nodes */}
        <div className="relative z-10">
          <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 font-medium">Aktif Projeler</div>
          <div className="flex flex-wrap gap-1.5">
            {sovereignUser.nodes.map(nodeId => {
              const t = NODE_THEMES[nodeId];
              if (!t) return null;
              return (
                <span
                  key={nodeId}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  {t.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Verified Badges */}
        <div className="absolute top-6 right-6 flex gap-1.5 z-10">
          {passport.verifiedBadges?.includes('email') && (
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center" title="E-posta doğrulanmış">
              <span className="text-[10px]">✉️</span>
            </div>
          )}
          {passport.verifiedBadges?.includes('google') && (
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center" title="Google hesabı bağlı">
              <span className="text-[10px]">G</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

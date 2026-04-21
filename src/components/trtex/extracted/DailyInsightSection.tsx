'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Globe, Zap, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator';
import { useTranslations, useLocale } from 'next-intl';

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', de: 'de-DE', zh: 'zh-CN', ru: 'ru-RU', fr: 'fr-FR', ar: 'ar-SA',
};

interface InsightData {
  date: string;
  headline: string;
  summary: string;
  questions: { q: string; a: string }[];
  firm_link: { label: string; href: string };
  trade_link: { label: string; href: string };
}

const FALLBACK_INSIGHT: InsightData = {
  date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }),
  headline: 'Hindistan AB-FTA 2027: Türk Tekstilcisinin Yapması Gereken 3 Hamle',
  summary: 'AB-Hindistan Serbest Ticaret Anlaşması 2027\'de yürürlüğe girerse, Türkiye\'nin gümrük avantajı azalacak.',
  questions: [
    { q: 'Bu ne demek?', a: 'Hindistan ev tekstili ($11.18 Mrd) AB\'ye gümrüksüz girerse, fiyat rekabeti sertleşir.' },
    { q: 'Kim kazanır?', a: 'Kısa vadede Hindistan (maliyet avantajı). Uzun vadede lojistik üstünlüğü olan Türkiye.' },
    { q: 'Ne yapmalı?', a: '1) Premium koleksiyona geç. 2) 3-5 gün teslimat avantajını vurgula. 3) OEKO-TEX/GRS sertifikalarını öne çıkar.' },
  ],
  firm_link: { label: 'Menderes — IQ™ Skoru Gör', href: '/companies/menderes-tekstil' },
  trade_link: { label: 'Perde.AI ile Tasarla', href: 'https://perde.ai' },
  risk_level: 'Yüksek',
  opportunity_level: 'Orta',
  affected_countries: ['TR', 'IN', 'BD'],
  action_hint: 'Premium segmente geçiş',
};

export function DailyInsightSection() {
  const [insight, setInsight] = useState<InsightData>(FALLBACK_INSIGHT);
  const [comment, setComment] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);
  const t = useTranslations('insight');
  const locale = useLocale();

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch(`/api/site-brain?section=daily_insight&locale=${locale}`);
        if (res.ok) {
          const { data, comment: c } = await res.json();
          if (data?.headline) setInsight(data);
          if (c) setComment(c);
          if (data?.updated_at) setUpdatedAt(data.updated_at);
          else setUpdatedAt(new Date().toISOString());
        }
      } catch { /* use fallback */ }
    };
    fetchInsight();
  }, []);

  return (
    <section className="py-16 border-t border-border bg-background">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 border border-secondary/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">{t('title')}</h2>
              <p className="text-[11px] font-mono text-foreground tracking-widest mt-0.5">
                {(updatedAt ? new Date(updatedAt) : new Date()).toLocaleDateString(LOCALE_MAP[locale] || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })} · {t('trtex_ai_analysis')}
              </p>
              <FreshnessIndicator updatedAt={updatedAt} />
            </div>
          </div>
          <Link href="/news" className="text-[11px] font-bold text-foreground hover:text-secondary transition-colors flex items-center gap-1">
            {t('all_analyses')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Main insight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-border"
        >
          {/* Headline */}
          <div className="p-6 lg:p-8 border-b border-border">
            <h3 className="text-xl lg:text-2xl font-extrabold text-foreground leading-tight mb-3">{insight.headline}</h3>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl">{insight.summary}</p>

            {/* Risk / Fırsat Etiketleri */}
            <div className="flex flex-wrap gap-3 mt-4">
              {(insight as any).risk_level && (
                <span className="text-[11px] font-black tracking-wider uppercase px-3 py-1 bg-red-50 text-red-700 border border-red-200">
                  ⚠️ {t('risk_level')}: {(insight as any).risk_level}
                </span>
              )}
              {(insight as any).opportunity_level && (
                <span className="text-[11px] font-black tracking-wider uppercase px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                  💰 {t('opportunity')}: {(insight as any).opportunity_level}
                </span>
              )}
              {(insight as any).affected_countries?.length > 0 && (
                <span className="text-[11px] font-mono tracking-wider px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                  🌍 {t('affected_countries')}: {(insight as any).affected_countries.join(', ')}
                </span>
              )}
              {(insight as any).action_hint && (
                <span className="text-[11px] font-black tracking-wider uppercase px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200">
                  ⚡ {t('action_hint')}: {(insight as any).action_hint}
                </span>
              )}
            </div>
          </div>

          {/* 3 Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {insight.questions.map((item, i) => (
              <div key={i} className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {i === 0 && <Brain className="w-3.5 h-3.5 text-purple-400" />}
                  {i === 1 && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                  {i === 2 && <Zap className="w-3.5 h-3.5 text-secondary" />}
                  <span className="text-[11px] font-black tracking-widest uppercase text-foreground">{item.q}</span>
                </div>
                <p className="text-[13px] text-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* CTAs → Content-to-Money */}
          <div className="flex flex-col sm:flex-row gap-px bg-muted border-t border-border">
            <Link href={insight.firm_link.href} className="group flex-1 flex items-center justify-between p-4 bg-white hover:bg-emerald-600/5 transition-colors">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-600/50" />
                <span className="text-[11px] font-bold text-foreground group-hover:text-foreground transition-colors">{insight.firm_link.label}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-foreground group-hover:text-emerald-600 transition-colors" />
            </Link>
            <a href={insight.trade_link.href} target="_blank" rel="noopener noreferrer" className="group flex-1 flex items-center justify-between p-4 bg-white hover:bg-cyan-500/5 transition-colors">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400/50" />
                <span className="text-[11px] font-bold text-foreground group-hover:text-foreground transition-colors">{insight.trade_link.label}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-foreground group-hover:text-cyan-400 transition-colors" />
            </a>
          </div>
        </motion.div>

        {/* 🧠 TRTEX Yorumu */}
        {comment && (
          <div className="border-t border-secondary/20 mt-6 pt-3">
            <p className="text-[11px] font-mono text-secondary flex items-center gap-1">
              <Brain className="w-3 h-3" /> {t('trtex_comment')}: {comment}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

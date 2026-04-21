'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Zap, Shield, Globe, AlertTriangle, DollarSign } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

interface Opportunity {
  title: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  source_article?: string;
  created_at?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  'PAZAR':         { icon: Globe,          color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  'TEDARİK':       { icon: Shield,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'TEKNOLOJİ':     { icon: Zap,            color: 'text-purple-400', bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  'FIRSAT':        { icon: DollarSign,     color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  'RİSK':          { icon: AlertTriangle,  color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-500/20' },
};

const PRIORITY_STYLES: Record<string, { label: string; color: string }> = {
  high:   { label: '●', color: 'text-red-400' },
  medium: { label: '●', color: 'text-amber-400' },
  low:    { label: '●', color: 'text-gray-400' },
};

export function OpportunitiesSection() {
  const t = useTranslations('opportunities');
  const locale = useLocale();
  const translate = useAutoTranslate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/site-brain?section=ai_opportunities')
      .then(r => r.json())
      .then(async result => {
        const items: Opportunity[] = result?.data || [];
        if (items.length === 0) return;

        // Translate if not Turkish
        if (locale !== 'tr') {
          try {
            const texts = items.flatMap(i => [i.title, i.action]);
            const translated = await translate(texts, 'Business opportunity titles and actions');
            const translatedItems = items.map((item, idx) => ({
              ...item,
              title: translated[idx * 2] || item.title,
              action: translated[idx * 2 + 1] || item.action,
            }));
            setOpportunities(translatedItems);
          } catch {
            setOpportunities(items);
          }
        } else {
          setOpportunities(items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <section className="py-12 border-t border-border/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-muted rounded" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (opportunities.length === 0) return null;

  return (
    <section className="py-12 border-t border-border/30 bg-foreground/[0.01]">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {t('title')}
              </h2>
              <p className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-600/60 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-sm hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {t('ai_generated')}
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border/20">
          {opportunities.map((opp, i) => {
            const cat = CATEGORY_CONFIG[opp.category] || CATEGORY_CONFIG['FIRSAT'];
            const priority = PRIORITY_STYLES[opp.priority] || PRIORITY_STYLES.medium;
            const Icon = cat.icon;

            return (
              <motion.div
                key={opp.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-background p-5 hover:bg-foreground/[0.02] transition-colors duration-300 group"
              >
                {/* Category + Priority */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 px-2 py-0.5 border ${cat.bg} ${cat.border} ${cat.color}`}>
                    <Icon className="w-3 h-3" />
                    {opp.category}
                  </span>
                  <span className={`text-[10px] font-bold ${priority.color}`}>
                    {priority.label} {opp.priority.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-foreground leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                  {opp.title}
                </h3>

                {/* Action */}
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                  {opp.action}
                </p>

                {/* Source */}
                {opp.source_article && (
                  <p className="text-[10px] font-mono text-muted-foreground/60 truncate border-t border-border/30 pt-2 mt-auto">
                    📰 {opp.source_article}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
          <p className="text-[11px] font-mono text-muted-foreground">
            {t('updated_by_editor')}
          </p>
          <Link href="/news" className="text-[11px] font-black tracking-widest text-muted-foreground hover:text-amber-600 uppercase transition-colors flex items-center gap-1">
            {t('all_analysis')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

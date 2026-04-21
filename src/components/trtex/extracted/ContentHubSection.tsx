'use client';

import { Link } from '@/i18n/navigation';
import { TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ContentHubSection() {
  const t = useTranslations('content_hub');

  const hubs = [
    {
      titleKey: 'trend_analyses' as const,
      descKey: 'trend_analyses_desc' as const,
      href: '/insights',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      badgeColor: 'bg-amber-500',
    },
    {
      titleKey: 'education_guides' as const,
      descKey: 'education_guides_desc' as const,
      href: '/guides',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      badgeColor: 'bg-emerald-500',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{t('title')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">TRTEX İstihbarat</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {hubs.map((hub) => (
            <Link
              key={hub.href}
              href={hub.href}
              className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              {/* Badge */}
              <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${hub.badgeColor}`}>
                {t('new_badge')}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${hub.bg} flex items-center justify-center mb-4`}>
                <hub.icon className={`w-5 h-5 bg-gradient-to-r ${hub.color} bg-clip-text`} style={{ color: hub.color.includes('amber') ? '#f59e0b' : hub.color.includes('emerald') ? '#10b981' : hub.color.includes('blue') ? '#3b82f6' : '#8b5cf6' }} />
              </div>

              {/* Content */}
              <h3 className="font-bold text-foreground mb-1.5 group-hover:text-amber-700 transition-colors">{t(hub.titleKey)}</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-4">{t(hub.descKey)}</p>

              {/* CTA */}
              <span className="flex items-center text-[12px] font-semibold text-gray-400 group-hover:text-amber-600 transition-colors gap-1">
                {t('explore')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

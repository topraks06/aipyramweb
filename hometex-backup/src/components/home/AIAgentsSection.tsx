
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, TrendingUp, Zap, Target, BarChart3, RefreshCw, CheckCircle2, Activity } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const AGENTS = [
  { id: 'master', icon: Bot, name: { tr: 'Master Agent', en: 'Master Agent', ar: 'العميل الرئيسي', ru: 'Мастер-агент' }, role: { tr: 'Orkestrasyon & Kontrol', en: 'Orchestration & Control', ar: 'التنسيق والتحكم', ru: 'Оркестрация и контроль' }, desc: { tr: 'Tüm ajanları yönetir. Sıralama, görünürlük ve güncelleme kararlarını verir.', en: 'Manages all agents. Makes ranking, visibility and update decisions.', ar: 'يدير جميع العملاء ويتخذ قرارات الترتيب والرؤية.', ru: 'Управляет всеми агентами. Принимает решения о ранжировании и видимости.' }, accentColor: '#1E3A5F', tasks: 1247, uptime: '99.9%' },
  { id: 'fair', icon: RefreshCw, name: { tr: 'Fair Agent', en: 'Fair Agent', ar: 'عميل المعرض', ru: 'Агент ярмарки' }, role: { tr: 'Marka & Koleksiyon Yönetimi', en: 'Brand & Collection Management', ar: 'إدارة العلامات التجارية', ru: 'Управление брендами и коллекциями' }, desc: { tr: 'Yeni koleksiyonlar ekler, eskilerini kaldırır, trendleri öne çıkarır.', en: 'Adds new collections, removes old ones, highlights trends.', ar: 'يضيف مجموعات جديدة ويزيل القديمة ويبرز الاتجاهات.', ru: 'Добавляет новые коллекции, удаляет старые, выделяет тренды.' }, accentColor: '#4A90D9', tasks: 892, uptime: '99.7%' },
  { id: 'trend', icon: TrendingUp, name: { tr: 'Trend Agent', en: 'Trend Agent', ar: 'عميل الاتجاهات', ru: 'Агент трендов' }, role: { tr: 'Trend Tespiti & Sıralama', en: 'Trend Detection & Ranking', ar: 'اكتشاف الاتجاهات والترتيب', ru: 'Обнаружение трендов и ранжирование' }, desc: { tr: '"Bu hafta trend" ve "yükselen stil" içeriklerini tespit eder ve öne çıkarır.', en: 'Detects "trending this week" and "rising style" content and highlights them.', ar: 'يكتشف محتوى "الأكثر رواجاً هذا الأسبوع" ويبرزه.', ru: 'Обнаруживает контент "в тренде на этой неделе" и выделяет его.' }, accentColor: '#4CAF7D', tasks: 2341, uptime: '99.8%' },
  { id: 'match', icon: Target, name: { tr: 'Match Agent', en: 'Match Agent', ar: 'عميل المطابقة', ru: 'Агент совпадений' }, role: { tr: 'Kişiselleştirilmiş Öneri', en: 'Personalized Recommendation', ar: 'التوصية الشخصية', ru: 'Персонализированные рекомендации' }, desc: { tr: '"Bunu beğendiysen bunu da gör" önerileri üretir. Kullanıcı davranışını analiz eder.', en: 'Generates "if you liked this, see this too" recommendations. Analyzes user behavior.', ar: 'يولد توصيات "إذا أعجبك هذا، شاهد هذا أيضاً".', ru: 'Генерирует рекомендации "если вам понравилось это, посмотрите и это".' }, accentColor: '#7B68EE', tasks: 5678, uptime: '99.5%' },
  { id: 'conversion', icon: Zap, name: { tr: 'Conversion Agent', en: 'Conversion Agent', ar: 'عميل التحويل', ru: 'Агент конверсии' }, role: { tr: 'Perde.ai Yönlendirme', en: 'Perde.ai Redirect', ar: 'إعادة التوجيه إلى Perde.ai', ru: 'Перенаправление на Perde.ai' }, desc: { tr: "Koleksiyonları perde.ai'ye bağlar. Tıklama oranını optimize eder.", en: 'Connects collections to perde.ai. Optimizes click-through rate.', ar: 'يربط المجموعات بـ perde.ai ويحسن معدل النقر.', ru: 'Связывает коллекции с perde.ai. Оптимизирует CTR.' }, accentColor: '#B8922A', tasks: 3421, uptime: '99.9%' },
  { id: 'analytics', icon: BarChart3, name: { tr: 'Analytics Agent', en: 'Analytics Agent', ar: 'عميل التحليلات', ru: 'Агент аналитики' }, role: { tr: 'Performans & Öğrenme', en: 'Performance & Learning', ar: 'الأداء والتعلم', ru: 'Производительность и обучение' }, desc: { tr: "Tıklamaları, geçirilen süreyi ve perde.ai dönüşümlerini izler. Sistemi iyileştirir.", en: 'Tracks clicks, dwell time and perde.ai conversions. Improves the system.', ar: 'يتتبع النقرات ووقت البقاء وتحويلات perde.ai.', ru: 'Отслеживает клики, время пребывания и конверсии perde.ai.' }, accentColor: '#E05A4E', tasks: 9823, uptime: '100%' },
];

export function AIAgentsSection() {
  const { language } = useLanguage();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const title = language === 'tr' ? 'AI Ajan Sistemi' : language === 'ar' ? 'نظام العملاء الذكي' : language === 'ru' ? 'Система ИИ-агентов' : 'AI Agent System';

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-px bg-[#B8922A]/50" />
            <span className="section-label flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Live System
            </span>
            <div className="w-8 h-px bg-[#B8922A]/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h2>
          <p className="text-slate-400 font-light text-sm">
            {language === 'tr' ? 'Platform 7/24 kendi kendini yönetir ve geliştirir' : 'Platform manages and improves itself 24/7'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              onClick={() => setActiveAgent(activeAgent === agent.id ? null : agent.id)}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-[#B8922A]/30 rounded-sm p-4 transition-all duration-300 hover:shadow-md hover:shadow-slate-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: agent.accentColor + '12', border: `1px solid ${agent.accentColor}25` }}>
                  <agent.icon className="w-4 h-4" style={{ color: agent.accentColor }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600 text-xs font-semibold tracking-wide">LIVE</span>
                </div>
              </div>

              <h3 className="text-[#1E3A5F] font-semibold text-sm mb-0.5">
                {agent.name[language as keyof typeof agent.name] || agent.name.en}
              </h3>
              <p className="text-xs font-medium mb-2" style={{ color: agent.accentColor }}>
                {agent.role[language as keyof typeof agent.role] || agent.role.en}
              </p>

              <AnimatePresence>
                {activeAgent === agent.id && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-slate-500 text-xs leading-relaxed mb-2 font-light"
                  >
                    {agent.desc[language as keyof typeof agent.desc] || agent.desc.en}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div className="text-center">
                  <div className="font-bold text-sm" style={{ color: agent.accentColor }}>{agent.tasks.toLocaleString()}</div>
                  <div className="text-slate-400 text-xs">{language === 'tr' ? 'görev' : 'tasks'}</div>
                </div>
                <div className="text-center">
                  <div className="text-emerald-600 font-bold text-sm">{agent.uptime}</div>
                  <div className="text-slate-400 text-xs">uptime</div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 text-xs">Active</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 max-w-3xl mx-auto">
          <div className="bg-[#FAFAF8] border border-slate-200 rounded-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#B8922A]/10 border border-[#B8922A]/20 rounded-sm flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-[#B8922A]" style={{ animation: 'spin 4s linear infinite' }} />
              </div>
              <div>
                <h4 className="text-[#1E3A5F] font-semibold text-sm">{language === 'tr' ? 'Sürekli Öğrenme Döngüsü' : 'Continuous Learning Loop'}</h4>
                <p className="text-slate-400 text-xs font-light">{language === 'tr' ? 'Sistem her etkileşimden öğrenir ve kendini geliştirir' : 'System learns from every interaction and self-improves'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                language === 'tr' ? '📊 Tıklama Analizi' : '📊 Click Analysis',
                language === 'tr' ? '⏱ Geçirilen Süre' : '⏱ Dwell Time',
                language === 'tr' ? '🎯 Perde.ai Dönüşüm' : '🎯 Perde.ai Conversion',
                language === 'tr' ? '🚀 İçerik Optimizasyonu' : '🚀 Content Optimization',
              ].map((item, i) => (
                <span key={i} className="text-xs border border-slate-200 text-slate-500 bg-white px-3 py-1 rounded-sm">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/agents">
            <button className="inline-flex items-center gap-2 btn-navy px-6 py-3 rounded-sm text-sm font-semibold">
              {language === 'tr' ? 'Tüm AI Ajanları Gör' : 'View All AI Agents'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

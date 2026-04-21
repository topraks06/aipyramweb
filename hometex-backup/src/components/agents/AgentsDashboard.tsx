
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Bot, Brain, TrendingUp, Target, Zap, BarChart3, RefreshCw,
  Globe2, Languages, Shield, Search, Users, Package,
  Activity, CheckCircle2, Clock, ChevronRight, Cloud,
  Cpu, Database, ArrowRight, Play,
} from 'lucide-react';

type LangKey = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'ru' | 'zh';

interface Agent {
  id: string;
  icon: React.ElementType;
  gcpService: string;
  name: Record<LangKey, string>;
  role: Record<LangKey, string>;
  desc: Record<LangKey, string>;
  accentColor: string;
  tasks: number;
  uptime: string;
  category: 'orchestration' | 'content' | 'matching' | 'analytics' | 'translation' | 'security';
  status: 'active' | 'processing' | 'idle';
  lastRun: string;
  successRate: number;
}

const AGENTS: Agent[] = [
  { id: 'master', icon: Brain, gcpService: 'Vertex AI Agent Builder', name: { tr: 'Master Orchestrator', en: 'Master Orchestrator', de: 'Master-Orchestrator', fr: 'Orchestrateur Principal', ar: 'المنسق الرئيسي', ru: 'Главный оркестратор', zh: '主编排器' }, role: { tr: 'Tüm Ajan Koordinasyonu', en: 'All Agent Coordination', de: 'Alle Agenten-Koordination', fr: 'Coordination de tous les agents', ar: 'تنسيق جميع الوكلاء', ru: 'Координация всех агентов', zh: '所有代理协调' }, desc: { tr: 'Tüm 13 ajanı yönetir. Görev önceliklendirme, kaynak tahsisi ve hata kurtarma işlemlerini gerçekleştirir.', en: 'Manages all 13 agents. Performs task prioritization, resource allocation and error recovery.', de: 'Verwaltet alle 13 Agenten.', fr: 'Gère les 13 agents.', ar: 'يدير جميع الـ 13 وكيلاً.', ru: 'Управляет всеми 13 агентами.', zh: '管理所有13个代理。' }, accentColor: '#1E3A5F', tasks: 14872, uptime: '99.99%', category: 'orchestration', status: 'active', lastRun: '2s ago', successRate: 99.9 },
  { id: 'fair', icon: RefreshCw, gcpService: 'Cloud Run + Vertex AI', name: { tr: 'Fair Content Agent', en: 'Fair Content Agent', de: 'Messe-Inhalts-Agent', fr: 'Agent de Contenu de Foire', ar: 'وكيل محتوى المعرض', ru: 'Агент контента ярмарки', zh: '展会内容代理' }, role: { tr: 'Fuar İçerik Yönetimi', en: 'Fair Content Management', de: 'Messe-Inhaltsverwaltung', fr: 'Gestion du contenu de la foire', ar: 'إدارة محتوى المعرض', ru: 'Управление контентом ярмарки', zh: '展会内容管理' }, desc: { tr: 'Yeni katılımcı profillerini ekler, eski içerikleri arşivler, fuar salonlarını düzenler.', en: 'Adds new participant profiles, archives old content, organizes fair halls.', de: 'Fügt neue Teilnehmerprofile hinzu.', fr: 'Ajoute de nouveaux profils de participants.', ar: 'يضيف ملفات تعريف المشاركين الجدد.', ru: 'Добавляет новые профили участников.', zh: '添加新参与者档案。' }, accentColor: '#2C4F7C', tasks: 8934, uptime: '99.7%', category: 'content', status: 'active', lastRun: '12s ago', successRate: 99.2 },
  { id: 'trend', icon: TrendingUp, gcpService: 'Vertex AI + BigQuery ML', name: { tr: 'Trend Detection Agent', en: 'Trend Detection Agent', de: 'Trend-Erkennungs-Agent', fr: 'Agent de Détection de Tendances', ar: 'وكيل اكتشاف الاتجاهات', ru: 'Агент обнаружения трендов', zh: '趋势检测代理' }, role: { tr: 'Trend Tespiti & Sıralama', en: 'Trend Detection & Ranking', de: 'Trend-Erkennung & Ranking', fr: 'Détection et classement des tendances', ar: 'اكتشاف الاتجاهات والترتيب', ru: 'Обнаружение трендов и ранжирование', zh: '趋势检测与排名' }, desc: { tr: 'BigQuery ML ile sosyal medya, arama verileri ve satış trendlerini analiz eder.', en: 'Analyzes social media, search data and sales trends with BigQuery ML.', de: 'Analysiert Social Media mit BigQuery ML.', fr: 'Analyse les médias sociaux avec BigQuery ML.', ar: 'يحلل وسائل التواصل الاجتماعي باستخدام BigQuery ML.', ru: 'Анализирует социальные сети с помощью BigQuery ML.', zh: '使用BigQuery ML分析社交媒体。' }, accentColor: '#4CAF7D', tasks: 23410, uptime: '99.8%', category: 'analytics', status: 'processing', lastRun: '3s ago', successRate: 98.7 },
  { id: 'match', icon: Target, gcpService: 'Vertex AI Matching Engine', name: { tr: 'Smart Match Agent', en: 'Smart Match Agent', de: 'Smart-Match-Agent', fr: 'Agent de Correspondance Intelligente', ar: 'وكيل المطابقة الذكية', ru: 'Агент умного совпадения', zh: '智能匹配代理' }, role: { tr: 'Alıcı-Tedarikçi Eşleştirme', en: 'Buyer-Supplier Matching', de: 'Käufer-Lieferanten-Matching', fr: 'Correspondance acheteur-fournisseur', ar: 'مطابقة المشتري والمورد', ru: 'Сопоставление покупателя и поставщика', zh: '买家-供应商匹配' }, desc: { tr: 'Vertex AI Matching Engine ile alıcı profillerini tedarikçi kataloglarıyla eşleştirir. %94 doğruluk.', en: 'Matches buyer profiles with supplier catalogs using Vertex AI Matching Engine. 94% accuracy.', de: 'Gleicht Käuferprofile mit Lieferantenkatalogen ab.', fr: 'Correspond les profils acheteurs aux catalogues fournisseurs.', ar: 'يطابق ملفات تعريف المشترين مع كتالوجات الموردين.', ru: 'Сопоставляет профили покупателей с каталогами поставщиков.', zh: '将买家档案与供应商目录匹配。' }, accentColor: '#7B68EE', tasks: 56780, uptime: '99.5%', category: 'matching', status: 'active', lastRun: '1s ago', successRate: 94.3 },
  { id: 'translate', icon: Languages, gcpService: 'Cloud Translation API v3', name: { tr: 'Translation Agent', en: 'Translation Agent', de: 'Übersetzungs-Agent', fr: 'Agent de Traduction', ar: 'وكيل الترجمة', ru: 'Агент перевода', zh: '翻译代理' }, role: { tr: '7 Dil Anlık Çeviri', en: '7-Language Real-time Translation', de: '7-Sprachen-Echtzeit-Übersetzung', fr: 'Traduction en temps réel en 7 langues', ar: 'ترجمة فورية بـ 7 لغات', ru: 'Перевод в реальном времени на 7 языках', zh: '7语言实时翻译' }, desc: { tr: 'Google Cloud Translation API v3 ile tüm platform içeriklerini 7 dile çevirir. %98 doğruluk.', en: 'Translates all platform content to 7 languages using Google Cloud Translation API v3. 98% accuracy.', de: 'Übersetzt alle Plattforminhalte in 7 Sprachen.', fr: 'Traduit tout le contenu en 7 langues.', ar: 'يترجم جميع المحتوى إلى 7 لغات.', ru: 'Переводит весь контент на 7 языков.', zh: '将所有内容翻译成7种语言。' }, accentColor: '#E8A030', tasks: 189234, uptime: '99.99%', category: 'translation', status: 'active', lastRun: '<1s ago', successRate: 98.1 },
  { id: 'analytics', icon: BarChart3, gcpService: 'BigQuery + Looker Studio', name: { tr: 'Analytics Agent', en: 'Analytics Agent', de: 'Analyse-Agent', fr: "Agent d'Analyse", ar: 'وكيل التحليلات', ru: 'Агент аналитики', zh: '分析代理' }, role: { tr: 'Platform Performans Analizi', en: 'Platform Performance Analysis', de: 'Plattform-Leistungsanalyse', fr: 'Analyse des performances de la plateforme', ar: 'تحليل أداء المنصة', ru: 'Анализ производительности платформы', zh: '平台性能分析' }, desc: { tr: 'BigQuery ile tıklama, dönüşüm ve kullanıcı davranışı verilerini analiz eder.', en: 'Analyzes click, conversion and user behavior data with BigQuery.', de: 'Analysiert Klick- und Konversionsdaten mit BigQuery.', fr: 'Analyse les données de clics avec BigQuery.', ar: 'يحلل بيانات النقر والتحويل باستخدام BigQuery.', ru: 'Анализирует данные кликов с помощью BigQuery.', zh: '使用BigQuery分析点击和转化数据。' }, accentColor: '#E05A4E', tasks: 98230, uptime: '100%', category: 'analytics', status: 'active', lastRun: '5s ago', successRate: 99.8 },
  { id: 'conversion', icon: Zap, gcpService: 'Cloud Run + Pub/Sub', name: { tr: 'Conversion Agent', en: 'Conversion Agent', de: 'Konversions-Agent', fr: 'Agent de Conversion', ar: 'وكيل التحويل', ru: 'Агент конверсии', zh: '转化代理' }, role: { tr: 'Perde.ai Yönlendirme Optimizasyonu', en: 'Perde.ai Redirect Optimization', de: 'Perde.ai-Weiterleitungsoptimierung', fr: 'Optimisation de redirection Perde.ai', ar: 'تحسين إعادة التوجيه إلى Perde.ai', ru: 'Оптимизация перенаправления Perde.ai', zh: 'Perde.ai重定向优化' }, desc: { tr: 'Koleksiyon sayfalarından perde.ai\'ye yönlendirme oranını optimize eder.', en: 'Optimizes redirect rate from collection pages to perde.ai.', de: 'Optimiert die Weiterleitungsrate zu perde.ai.', fr: 'Optimise le taux de redirection vers perde.ai.', ar: 'يحسن معدل إعادة التوجيه إلى perde.ai.', ru: 'Оптимизирует скорость перенаправления на perde.ai.', zh: '优化到perde.ai的重定向率。' }, accentColor: '#B8922A', tasks: 34210, uptime: '99.9%', category: 'content', status: 'active', lastRun: '8s ago', successRate: 97.4 },
  { id: 'search', icon: Search, gcpService: 'Vertex AI Search', name: { tr: 'Semantic Search Agent', en: 'Semantic Search Agent', de: 'Semantischer Such-Agent', fr: 'Agent de Recherche Sémantique', ar: 'وكيل البحث الدلالي', ru: 'Агент семантического поиска', zh: '语义搜索代理' }, role: { tr: 'Anlamsal Ürün Arama', en: 'Semantic Product Search', de: 'Semantische Produktsuche', fr: 'Recherche sémantique de produits', ar: 'البحث الدلالي عن المنتجات', ru: 'Семантический поиск продуктов', zh: '语义产品搜索' }, desc: { tr: 'Vertex AI Search ile doğal dil sorgularını anlayarak ürün araması yapar.', en: 'Performs product search by understanding natural language queries with Vertex AI Search.', de: 'Führt Produktsuche durch Verstehen natürlicher Sprachabfragen durch.', fr: 'Effectue une recherche de produits en comprenant les requêtes en langage naturel.', ar: 'يجري بحثاً عن المنتجات من خلال فهم استعلامات اللغة الطبيعية.', ru: 'Выполняет поиск продуктов, понимая запросы на естественном языке.', zh: '通过理解自然语言查询来执行产品搜索。' }, accentColor: '#2C4F7C', tasks: 67890, uptime: '99.6%', category: 'matching', status: 'active', lastRun: '2s ago', successRate: 96.8 },
  { id: 'supplier', icon: Users, gcpService: 'Vertex AI + Cloud SQL', name: { tr: 'Supplier Verification Agent', en: 'Supplier Verification Agent', de: 'Lieferanten-Verifizierungs-Agent', fr: 'Agent de Vérification des Fournisseurs', ar: 'وكيل التحقق من الموردين', ru: 'Агент верификации поставщиков', zh: '供应商验证代理' }, role: { tr: 'Tedarikçi Doğrulama & Puanlama', en: 'Supplier Verification & Scoring', de: 'Lieferantenverifizierung & Bewertung', fr: 'Vérification et notation des fournisseurs', ar: 'التحقق من الموردين وتسجيل النقاط', ru: 'Верификация и оценка поставщиков', zh: '供应商验证与评分' }, desc: { tr: 'Yeni tedarikçi başvurularını otomatik değerlendirir. Sertifika doğrulama ve AI tabanlı güvenilirlik skoru.', en: 'Automatically evaluates new supplier applications. Certificate verification and AI-based reliability score.', de: 'Bewertet automatisch neue Lieferantenbewerbungen.', fr: 'Évalue automatiquement les nouvelles candidatures de fournisseurs.', ar: 'يقيم تلقائياً طلبات الموردين الجدد.', ru: 'Автоматически оценивает новые заявки поставщиков.', zh: '自动评估新供应商申请。' }, accentColor: '#4CAF7D', tasks: 4521, uptime: '99.3%', category: 'security', status: 'idle', lastRun: '2m ago', successRate: 99.1 },
  { id: 'catalog', icon: Package, gcpService: 'Cloud Vision API + Cloud Run', name: { tr: 'Catalog Intelligence Agent', en: 'Catalog Intelligence Agent', de: 'Katalog-Intelligenz-Agent', fr: "Agent d'Intelligence de Catalogue", ar: 'وكيل ذكاء الكتالوج', ru: 'Агент интеллекта каталога', zh: '目录智能代理' }, role: { tr: 'Ürün Katalog Optimizasyonu', en: 'Product Catalog Optimization', de: 'Produktkatalog-Optimierung', fr: 'Optimisation du catalogue de produits', ar: 'تحسين كتالوج المنتجات', ru: 'Оптимизация каталога продуктов', zh: '产品目录优化' }, desc: { tr: 'Cloud Vision API ile ürün görsellerini analiz eder, otomatik etiketleme ve kategorizasyon yapar.', en: 'Analyzes product images with Cloud Vision API, performs automatic tagging and categorization.', de: 'Analysiert Produktbilder mit Cloud Vision API.', fr: 'Analyse les images de produits avec Cloud Vision API.', ar: 'يحلل صور المنتجات باستخدام Cloud Vision API.', ru: 'Анализирует изображения продуктов с помощью Cloud Vision API.', zh: '使用Cloud Vision API分析产品图像。' }, accentColor: '#7B68EE', tasks: 12340, uptime: '99.4%', category: 'content', status: 'processing', lastRun: '15s ago', successRate: 97.9 },
  { id: 'pricing', icon: BarChart3, gcpService: 'BigQuery ML + Vertex AI', name: { tr: 'Dynamic Pricing Agent', en: 'Dynamic Pricing Agent', de: 'Dynamischer Preis-Agent', fr: 'Agent de Tarification Dynamique', ar: 'وكيل التسعير الديناميكي', ru: 'Агент динамического ценообразования', zh: '动态定价代理' }, role: { tr: 'Piyasa Fiyat Analizi', en: 'Market Price Analysis', de: 'Marktpreisanalyse', fr: 'Analyse des prix du marché', ar: 'تحليل أسعار السوق', ru: 'Анализ рыночных цен', zh: '市场价格分析' }, desc: { tr: 'Global piyasa verilerini analiz ederek rekabetçi fiyat önerileri üretir.', en: 'Generates competitive price recommendations by analyzing global market data.', de: 'Generiert wettbewerbsfähige Preisempfehlungen.', fr: 'Génère des recommandations de prix compétitifs.', ar: 'يولد توصيات أسعار تنافسية.', ru: 'Генерирует конкурентоспособные ценовые рекомендации.', zh: '生成竞争性价格建议。' }, accentColor: '#E8A030', tasks: 7823, uptime: '99.2%', category: 'analytics', status: 'active', lastRun: '30s ago', successRate: 95.6 },
  { id: 'security', icon: Shield, gcpService: 'Cloud IAM + Security Command Center', name: { tr: 'Security & Compliance Agent', en: 'Security & Compliance Agent', de: 'Sicherheits- & Compliance-Agent', fr: 'Agent de Sécurité et Conformité', ar: 'وكيل الأمن والامتثال', ru: 'Агент безопасности и соответствия', zh: '安全与合规代理' }, role: { tr: 'Platform Güvenlik Yönetimi', en: 'Platform Security Management', de: 'Plattform-Sicherheitsverwaltung', fr: 'Gestion de la sécurité de la plateforme', ar: 'إدارة أمن المنصة', ru: 'Управление безопасностью платформы', zh: '平台安全管理' }, desc: { tr: 'Cloud IAM ve Security Command Center ile platform güvenliğini 7/24 izler. GDPR, ISO 27001 uyumluluğunu otomatik denetler.', en: 'Monitors platform security 24/7 with Cloud IAM and Security Command Center. Automatically audits GDPR, ISO 27001 compliance.', de: 'Überwacht die Plattformsicherheit rund um die Uhr.', fr: 'Surveille la sécurité de la plateforme 24h/24.', ar: 'يراقب أمن المنصة على مدار الساعة.', ru: 'Мониторит безопасность платформы 24/7.', zh: '全天候监控平台安全。' }, accentColor: '#E05A4E', tasks: 234567, uptime: '100%', category: 'security', status: 'active', lastRun: '<1s ago', successRate: 100 },
  { id: 'notification', icon: Globe2, gcpService: 'Cloud Pub/Sub + Firebase', name: { tr: 'Global Notification Agent', en: 'Global Notification Agent', de: 'Globaler Benachrichtigungs-Agent', fr: 'Agent de Notification Global', ar: 'وكيل الإشعارات العالمي', ru: 'Агент глобальных уведомлений', zh: '全球通知代理' }, role: { tr: 'Çok Kanallı Bildirim Yönetimi', en: 'Multi-channel Notification Management', de: 'Mehrkanalige Benachrichtigungsverwaltung', fr: 'Gestion des notifications multicanaux', ar: 'إدارة الإشعارات متعددة القنوات', ru: 'Управление многоканальными уведомлениями', zh: '多渠道通知管理' }, desc: { tr: 'Pub/Sub ve Firebase ile e-posta, push notification ve SMS kanallarında 7 dilde bildirim gönderir.', en: 'Sends notifications in 7 languages across email, push notification and SMS channels via Pub/Sub and Firebase.', de: 'Sendet Benachrichtigungen in 7 Sprachen.', fr: 'Envoie des notifications en 7 langues.', ar: 'يرسل إشعارات بـ 7 لغات.', ru: 'Отправляет уведомления на 7 языках.', zh: '以7种语言发送通知。' }, accentColor: '#2C4F7C', tasks: 45678, uptime: '99.8%', category: 'content', status: 'active', lastRun: '4s ago', successRate: 98.9 },
];

const CATEGORIES = [
  { key: 'all', label: { tr: 'Tümü', en: 'All', de: 'Alle', fr: 'Tous', ar: 'الكل', ru: 'Все', zh: '全部' } },
  { key: 'orchestration', label: { tr: 'Orkestrasyon', en: 'Orchestration', de: 'Orchestrierung', fr: 'Orchestration', ar: 'التنسيق', ru: 'Оркестрация', zh: '编排' } },
  { key: 'content', label: { tr: 'İçerik', en: 'Content', de: 'Inhalt', fr: 'Contenu', ar: 'المحتوى', ru: 'Контент', zh: '内容' } },
  { key: 'matching', label: { tr: 'Eşleştirme', en: 'Matching', de: 'Matching', fr: 'Correspondance', ar: 'المطابقة', ru: 'Сопоставление', zh: '匹配' } },
  { key: 'analytics', label: { tr: 'Analitik', en: 'Analytics', de: 'Analytik', fr: 'Analytique', ar: 'التحليلات', ru: 'Аналитика', zh: '分析' } },
  { key: 'translation', label: { tr: 'Çeviri', en: 'Translation', de: 'Übersetzung', fr: 'Traduction', ar: 'الترجمة', ru: 'Перевод', zh: '翻译' } },
  { key: 'security', label: { tr: 'Güvenlik', en: 'Security', de: 'Sicherheit', fr: 'Sécurité', ar: 'الأمن', ru: 'Безопасность', zh: '安全' } },
];

const STATUS_CONFIG = {
  active: { color: 'text-emerald-600', bg: 'bg-emerald-500', label: { tr: 'Aktif', en: 'Active', de: 'Aktiv', fr: 'Actif', ar: 'نشط', ru: 'Активен', zh: '活跃' } },
  processing: { color: 'text-[#B8922A]', bg: 'bg-[#B8922A]', label: { tr: 'İşliyor', en: 'Processing', de: 'Verarbeitung', fr: 'Traitement', ar: 'معالجة', ru: 'Обработка', zh: '处理中' } },
  idle: { color: 'text-slate-400', bg: 'bg-slate-400', label: { tr: 'Bekliyor', en: 'Idle', de: 'Leerlauf', fr: 'Inactif', ar: 'خامل', ru: 'Ожидание', zh: '空闲' } },
};

function AgentCard({ agent, lang, isSelected, onClick }: { agent: Agent; lang: LangKey; isSelected: boolean; onClick: () => void }) {
  const status = STATUS_CONFIG[agent.status];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onClick}
      className={`group cursor-pointer rounded-sm p-4 transition-all duration-300 border ${
        isSelected
          ? 'bg-white border-[#B8922A]/50 shadow-lg shadow-[#B8922A]/10'
          : 'bg-white border-slate-200 hover:border-[#1E3A5F]/30 hover:shadow-md hover:shadow-slate-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: agent.accentColor + '12', border: `1px solid ${agent.accentColor}25` }}>
          <agent.icon className="w-4 h-4" style={{ color: agent.accentColor }} />
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${status.bg} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-semibold tracking-wide ${status.color}`}>
            {status.label[lang]}
          </span>
        </div>
      </div>

      <h3 className="text-[#1E3A5F] font-semibold text-sm mb-0.5 leading-tight">
        {agent.name[lang]}
      </h3>
      <p className="text-xs font-medium mb-2" style={{ color: agent.accentColor }}>
        {agent.role[lang]}
      </p>

      <div className="text-[10px] text-slate-400 mb-3 font-mono border border-slate-100 bg-slate-50 px-2 py-1 rounded-sm">
        {agent.gcpService}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-center">
        <div>
          <div className="font-bold text-xs" style={{ color: agent.accentColor }}>
            {agent.tasks > 9999 ? `${(agent.tasks / 1000).toFixed(0)}K` : agent.tasks.toLocaleString()}
          </div>
          <div className="text-slate-400 text-[10px]">{lang === 'tr' ? 'görev' : lang === 'zh' ? '任务' : 'tasks'}</div>
        </div>
        <div>
          <div className="text-emerald-600 font-bold text-xs">{agent.uptime}</div>
          <div className="text-slate-400 text-[10px]">uptime</div>
        </div>
        <div>
          <div className="text-[#1E3A5F] font-bold text-xs">{agent.successRate}%</div>
          <div className="text-slate-400 text-[10px]">{lang === 'tr' ? 'başarı' : lang === 'zh' ? '成功率' : 'success'}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-slate-400 text-[10px]">
          <Clock className="w-2.5 h-2.5 inline mr-1" />{agent.lastRun}
        </span>
        <ChevronRight className={`w-3.5 h-3.5 transition-all ${isSelected ? 'text-[#B8922A] rotate-90' : 'text-slate-300 group-hover:text-slate-500'}`} />
      </div>
    </motion.div>
  );
}

export function AgentsDashboard() {
  const { language } = useLanguage();
  const lang = language as LangKey;
  const [category, setCategory] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const filtered = AGENTS.filter(a => category === 'all' || a.category === category);
  const selected = AGENTS.find(a => a.id === selectedAgent);

  const totalTasks = AGENTS.reduce((s, a) => s + a.tasks, 0);
  const activeCount = AGENTS.filter(a => a.status === 'active').length;

  const title: Record<LangKey, string> = {
    tr: 'AI Ajan Kontrol Merkezi', en: 'AI Agent Control Center',
    de: 'KI-Agenten-Kontrollzentrum', fr: 'Centre de Contrôle des Agents IA',
    ar: 'مركز التحكم في وكلاء الذكاء الاصطناعي', ru: 'Центр управления ИИ-агентами', zh: 'AI代理控制中心',
  };

  const subtitle: Record<LangKey, string> = {
    tr: 'Google Cloud Vertex AI altyapısında çalışan 13 otonom ajan',
    en: '13 autonomous agents running on Google Cloud Vertex AI infrastructure',
    de: '13 autonome Agenten auf Google Cloud Vertex AI-Infrastruktur',
    fr: "13 agents autonomes fonctionnant sur l'infrastructure Google Cloud Vertex AI",
    ar: '13 وكيلاً مستقلاً يعمل على بنية تحتية Google Cloud Vertex AI',
    ru: '13 автономных агентов на инфраструктуре Google Cloud Vertex AI',
    zh: '在Google Cloud Vertex AI基础设施上运行的13个自主代理',
  };

  return (
    <div className="py-16 bg-[#FAFAF8]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C] py-20 mb-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Google Cloud · Vertex AI
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title[lang]}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto font-light">{subtitle[lang]}</p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Bot, value: '13', label: { tr: 'Toplam Ajan', en: 'Total Agents', de: 'Agenten gesamt', fr: 'Agents totaux', ar: 'إجمالي الوكلاء', ru: 'Всего агентов', zh: '总代理数' }, color: '#1E3A5F' },
            { icon: CheckCircle2, value: String(activeCount), label: { tr: 'Aktif Ajan', en: 'Active Agents', de: 'Aktive Agenten', fr: 'Agents actifs', ar: 'الوكلاء النشطون', ru: 'Активных агентов', zh: '活跃代理' }, color: '#4CAF7D' },
            { icon: Activity, value: `${(totalTasks / 1000).toFixed(0)}K+`, label: { tr: 'Toplam Görev', en: 'Total Tasks', de: 'Aufgaben gesamt', fr: 'Tâches totales', ar: 'إجمالي المهام', ru: 'Всего задач', zh: '总任务数' }, color: '#2C4F7C' },
            { icon: Cloud, value: '8', label: { tr: 'GCP Servisi', en: 'GCP Services', de: 'GCP-Dienste', fr: 'Services GCP', ar: 'خدمات GCP', ru: 'Сервисов GCP', zh: 'GCP服务' }, color: '#7B68EE' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color + '12', border: `1px solid ${stat.color}25` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: stat.color, fontFamily: 'var(--font-playfair)' }}>{stat.value}</div>
                <div className="text-slate-500 text-xs">{stat.label[lang]}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all ${
                category === cat.key
                  ? 'bg-[#1E3A5F] text-white shadow-md'
                  : 'border border-slate-200 text-slate-500 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] bg-white'
              }`}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>

        {/* Agent grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                lang={lang}
                isSelected={selectedAgent === agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Selected agent detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 bg-white border border-[#B8922A]/25 rounded-sm p-6 shadow-md"
            >
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm flex items-center justify-center" style={{ backgroundColor: selected.accentColor + '12', border: `1px solid ${selected.accentColor}25` }}>
                    <selected.icon className="w-6 h-6" style={{ color: selected.accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {selected.name[lang]}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: selected.accentColor }}>{selected.role[lang]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm px-3 py-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#2C4F7C]" />
                  <span className="text-slate-500 text-xs font-mono">{selected.gcpService}</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-light mb-4">
                {selected.desc[lang]}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: lang === 'tr' ? 'Toplam Görev' : 'Total Tasks', value: selected.tasks.toLocaleString(), color: selected.accentColor },
                  { label: 'Uptime', value: selected.uptime, color: '#4CAF7D' },
                  { label: lang === 'tr' ? 'Başarı Oranı' : 'Success Rate', value: `${selected.successRate}%`, color: '#2C4F7C' },
                  { label: lang === 'tr' ? 'Son Çalışma' : 'Last Run', value: selected.lastRun, color: '#6B7A8D' },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-center">
                    <div className="font-bold text-sm mb-0.5" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-slate-400 text-xs">{m.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continuous learning loop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-white border border-slate-200 rounded-sm p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-5 h-5 text-[#B8922A]" style={{ animation: 'spin 4s linear infinite' }} />
            <h4 className="text-[#1E3A5F] font-semibold">
              {lang === 'tr' ? 'Sürekli Öğrenme Döngüsü' : lang === 'ar' ? 'حلقة التعلم المستمر' : lang === 'ru' ? 'Цикл непрерывного обучения' : lang === 'zh' ? '持续学习循环' : 'Continuous Learning Loop'}
            </h4>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', title: lang === 'tr' ? 'Veri Toplama' : 'Data Collection', desc: lang === 'tr' ? 'BigQuery ile tüm etkileşimler loglanır' : 'All interactions logged with BigQuery', icon: Database },
              { step: '02', title: lang === 'tr' ? 'Model Eğitimi' : 'Model Training', desc: lang === 'tr' ? 'Vertex AI ile haftalık model güncellemesi' : 'Weekly model updates with Vertex AI', icon: Cpu },
              { step: '03', title: lang === 'tr' ? 'A/B Test' : 'A/B Testing', desc: lang === 'tr' ? 'Cloud Run ile paralel test ortamları' : 'Parallel test environments with Cloud Run', icon: Play },
              { step: '04', title: lang === 'tr' ? 'Deployment' : 'Deployment', desc: lang === 'tr' ? 'Otomatik rollout ve monitoring' : 'Automatic rollout and monitoring', icon: ArrowRight },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#B8922A]/10 border border-[#B8922A]/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-[#B8922A]" />
                </div>
                <div>
                  <div className="text-[#B8922A]/60 text-[10px] font-bold tracking-widest mb-0.5">{step.step}</div>
                  <div className="text-[#1E3A5F] text-xs font-semibold mb-0.5">{step.title}</div>
                  <div className="text-slate-400 text-xs font-light">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

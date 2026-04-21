
'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, Database, Cpu, Globe2, Zap, Shield, BarChart3, Languages } from 'lucide-react';

const GCP_SERVICES = [
  { icon: Cpu, name: 'Vertex AI', desc: { tr: '13 AI ajan orkestrasyon motoru', en: '13 AI agent orchestration engine', de: '13 KI-Agenten-Orchestrierungsmotor', fr: "Moteur d'orchestration de 13 agents IA", ar: 'محرك تنسيق 13 وكيل ذكاء اصطناعي', ru: 'Движок оркестрации 13 ИИ-агентов', zh: '13个AI代理编排引擎' }, color: '#4A90D9', badge: 'Core AI' },
  { icon: Cloud, name: 'Cloud Run', desc: { tr: 'Sunucusuz mikro servis altyapısı', en: 'Serverless microservice infrastructure', de: 'Serverlose Microservice-Infrastruktur', fr: 'Infrastructure microservice sans serveur', ar: 'بنية تحتية للخدمات المصغرة بدون خادم', ru: 'Бессерверная микросервисная инфраструктура', zh: '无服务器微服务基础设施' }, color: '#4CAF7D', badge: 'Compute' },
  { icon: Database, name: 'BigQuery', desc: { tr: 'Petabyte ölçekli analitik veri ambarı', en: 'Petabyte-scale analytics data warehouse', de: 'Petabyte-skaliertes Analyse-Data-Warehouse', fr: "Entrepôt de données analytiques à l'échelle du pétaoctet", ar: 'مستودع بيانات تحليلية بحجم بيتابايت', ru: 'Аналитическое хранилище данных петабайтного масштаба', zh: 'PB级分析数据仓库' }, color: '#B8922A', badge: 'Analytics' },
  { icon: Languages, name: 'Translate API', desc: { tr: '7 dil anlık çeviri motoru', en: '7-language real-time translation engine', de: '7-Sprachen-Echtzeit-Übersetzungsmotor', fr: 'Moteur de traduction en temps réel en 7 langues', ar: 'محرك ترجمة فوري بـ 7 لغات', ru: 'Движок перевода в реальном времени на 7 языках', zh: '7语言实时翻译引擎' }, color: '#7B68EE', badge: 'NLP' },
  { icon: Globe2, name: 'Cloud CDN', desc: { tr: 'Global içerik dağıtım ağı', en: 'Global content delivery network', de: 'Globales Content-Delivery-Netzwerk', fr: 'Réseau mondial de diffusion de contenu', ar: 'شبكة توصيل المحتوى العالمية', ru: 'Глобальная сеть доставки контента', zh: '全球内容分发网络' }, color: '#E8A030', badge: 'Network' },
  { icon: Shield, name: 'Cloud IAM', desc: { tr: 'Kimlik ve erişim yönetimi', en: 'Identity and access management', de: 'Identitäts- und Zugangsverwaltung', fr: 'Gestion des identités et des accès', ar: 'إدارة الهوية والوصول', ru: 'Управление идентификацией и доступом', zh: '身份和访问管理' }, color: '#E05A4E', badge: 'Security' },
  { icon: Zap, name: 'Pub/Sub', desc: { tr: 'Gerçek zamanlı mesajlaşma servisi', en: 'Real-time messaging service', de: 'Echtzeit-Messaging-Dienst', fr: 'Service de messagerie en temps réel', ar: 'خدمة المراسلة في الوقت الفعلي', ru: 'Сервис обмена сообщениями в реальном времени', zh: '实时消息服务' }, color: '#4CAF7D', badge: 'Events' },
  { icon: BarChart3, name: 'Looker Studio', desc: { tr: 'Kurumsal BI ve raporlama paneli', en: 'Enterprise BI and reporting dashboard', de: 'Enterprise-BI- und Berichts-Dashboard', fr: "Tableau de bord BI et reporting d'entreprise", ar: 'لوحة تحكم BI وإعداد التقارير للمؤسسات', ru: 'Корпоративная BI и панель отчетности', zh: '企业BI和报告仪表板' }, color: '#B8922A', badge: 'BI' },
];

const STATS = [
  { value: '99.99%', label: { tr: 'Uptime SLA', en: 'Uptime SLA', de: 'Uptime SLA', fr: 'SLA de disponibilité', ar: 'اتفاقية مستوى الخدمة', ru: 'SLA доступности', zh: '正常运行时间SLA' } },
  { value: '<50ms', label: { tr: 'API Yanıt Süresi', en: 'API Response Time', de: 'API-Antwortzeit', fr: 'Temps de réponse API', ar: 'وقت استجابة API', ru: 'Время ответа API', zh: 'API响应时间' } },
  { value: '7', label: { tr: 'Dil Desteği', en: 'Languages', de: 'Sprachen', fr: 'Langues', ar: 'لغات', ru: 'Языков', zh: '语言支持' } },
  { value: '13', label: { tr: 'AI Ajan', en: 'AI Agents', de: 'KI-Agenten', fr: 'Agents IA', ar: 'وكيل ذكاء اصطناعي', ru: 'ИИ-агентов', zh: 'AI代理' } },
];

type LangKey = 'tr' | 'en' | 'de' | 'fr' | 'ar' | 'ru' | 'zh';

export function GoogleCloudSection() {
  const { language } = useLanguage();
  const lang = language as LangKey;

  const title: Record<LangKey, string> = { tr: 'Google Cloud Altyapısı', en: 'Google Cloud Infrastructure', de: 'Google Cloud-Infrastruktur', fr: 'Infrastructure Google Cloud', ar: 'بنية تحتية Google Cloud', ru: 'Инфраструктура Google Cloud', zh: 'Google Cloud基础设施' };
  const subtitle: Record<LangKey, string> = { tr: "Dünyanın en güvenilir bulut altyapısı üzerinde çalışan kurumsal platform", en: "Enterprise platform running on the world's most reliable cloud infrastructure", de: 'Unternehmensplattform auf der zuverlässigsten Cloud-Infrastruktur der Welt', fr: "Plateforme d'entreprise fonctionnant sur l'infrastructure cloud la plus fiable au monde", ar: 'منصة مؤسسية تعمل على أكثر بنية تحتية سحابية موثوقية في العالم', ru: 'Корпоративная платформа на самой надежной облачной инфраструктуре мира', zh: '运行在全球最可靠云基础设施上的企业平台' };

  return (
    <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF5A] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-[#D4AF5A]/50" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Cloud className="w-3 h-3" /> Google Cloud Platform
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title[lang]}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto font-light text-sm leading-relaxed">
            {subtitle[lang]}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm p-5 text-center"
            >
              <div className="text-2xl font-bold text-[#D4AF5A] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                {stat.value}
              </div>
              <div className="text-white/60 text-xs tracking-wide">
                {stat.label[lang]}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {GCP_SERVICES.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group bg-white/10 backdrop-blur-sm border border-white/15 hover:border-white/40 rounded-sm p-4 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-sm flex items-center justify-center bg-white/15 border border-white/20">
                  <service.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider bg-white/15 text-white/80 border border-white/20">
                  {service.badge}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{service.name}</h3>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                {service.desc[lang]}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-300 text-[10px] font-semibold tracking-wide">ACTIVE</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-sm p-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 border border-white/25 rounded-sm flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm mb-0.5">
                  {lang === 'tr' ? 'Google Cloud Partner' : lang === 'de' ? 'Google Cloud Partner' : lang === 'fr' ? 'Partenaire Google Cloud' : lang === 'ar' ? 'شريك Google Cloud' : lang === 'ru' ? 'Партнер Google Cloud' : lang === 'zh' ? 'Google Cloud合作伙伴' : 'Google Cloud Partner'}
                </h4>
                <p className="text-white/60 text-xs font-light">
                  {lang === 'tr' ? 'ISO 27001 · SOC 2 Type II · GDPR Uyumlu' : 'ISO 27001 · SOC 2 Type II · GDPR Compliant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              {[
                { v: '35+', l: lang === 'tr' ? 'Bölge' : lang === 'zh' ? '区域' : 'Regions' },
                { v: '200+', l: lang === 'tr' ? 'Ülke' : lang === 'zh' ? '国家' : 'Countries' },
                { v: '24/7', l: lang === 'tr' ? 'Destek' : lang === 'zh' ? '支持' : 'Support' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-lg font-bold text-[#D4AF5A]" style={{ fontFamily: 'var(--font-playfair)' }}>{s.v}</div>
                  <div className="text-white/60 text-xs">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

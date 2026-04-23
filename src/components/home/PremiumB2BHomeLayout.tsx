'use client';
import React, { useState } from 'react';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import OpportunityRadarWidget from '@/components/trtex/OpportunityRadarWidget';
import LeadCaptureModal from '@/components/trtex/LeadCaptureModal';

// ═══ REGION CLASSIFIER (Frontend keyword matching — Aloha data stays untouched) ═══
const REGION_KEYWORDS: Record<string, string[]> = {
  ASIA: ['çin', 'china', 'shanghai', 'vietnam', 'hindistan', 'india', 'bangladesh', 'pakistan', 'asya', 'asia', 'uzakdoğu', 'far east', 'tayland', 'endonezya', 'japan', 'korea'],
  EUROPE: ['almanya', 'germany', 'fransa', 'france', 'italya', 'italy', 'ispanya', 'spain', 'avrupa', 'europe', 'polonya', 'poland', 'belçika', 'hollanda', 'ingiltere', 'uk', 'heimtextil'],
  AMERICAS: ['abd', 'usa', 'amerika', 'america', 'kanada', 'canada', 'brezilya', 'brazil', 'meksika', 'mexico'],
  MENA: ['suudi', 'saudi', 'dubai', 'uae', 'bae', 'mısır', 'egypt', 'katar', 'qatar', 'körfez', 'gulf', 'ortadoğu', 'middle east', 'afrika', 'africa'],
};

// ═══ TRADING FLOOR FALLBACK DATA — Sadece payload yoksa kullanılır ═══
const FALLBACK_TENDERS = [
  { id: 'fb-t1', type: 'TENDER', location: '🇩🇪 Almanya / Otel Projesi', title: '5.000m Blackout Perde Tedariki', detail_key: 'Son Teklif:', detail_value: '30 Mayıs 2026', score: 88, action_text: '→ İHALEYİ İNCELE' },
  { id: 'fb-t2', type: 'TENDER', location: '🇦🇪 BAE / NEOM İnşaat', title: 'Otel Tipi Havlu Seti (x20.000)', detail_key: 'Sertifika:', detail_value: 'ISO 9001 + OEKO-TEX', score: 92, action_text: '→ TEKLİF VER' },
  { id: 'fb-t3', type: 'TENDER', location: '🇵🇱 Polonya / Hastane Projesi', title: 'FR Sertifikalı Boj Perde', detail_key: 'Miktar:', detail_value: '2.500m²', score: 78, action_text: '→ İHALEYİ İNCELE' },
  { id: 'fb-s1', type: 'HOT_STOCK', location: '🇹🇷 Bursa / İhracat Fazlası', title: '12.000m Şönil Kumaş', detail_key: 'Fiyat Avantajı:', detail_value: '-18% Piyasa Altı', score: 85, action_text: '→ FİRMADAN SATIN AL' },
  { id: 'fb-s2', type: 'HOT_STOCK', location: '🇨🇳 Şanghay / Spot Yükleme', title: '40 Ton 30/1 Penye İplik', detail_key: 'Durum:', detail_value: 'Liman Teslim (Spot)', score: 80, action_text: '→ SATIN AL' },
  { id: 'fb-s3', type: 'HOT_STOCK', location: '🇹🇷 Denizli / Stok Fazlası', title: '8.000 Adet Jakarlı Havlu', detail_key: 'Kalite:', detail_value: 'A-Grade, Export Paketli', score: 82, action_text: '→ FİRMADAN SATIN AL' },
  { id: 'fb-c1', type: 'CAPACITY', location: '🇹🇷 Denizli / Havlu Grubu', title: 'Aylık 30.000m Üretim Boş', detail_key: 'Hazır Makine:', detail_value: 'Armürlü Dokuma', score: 76, action_text: '→ ORTAKLIK KUR' },
  { id: 'fb-c2', type: 'CAPACITY', location: '🇪🇸 İspanya / Valencia', title: 'Aylık 10.000m Dijital Baskı', detail_key: 'Minimum Sipariş:', detail_value: '500m', score: 72, action_text: '→ FASON ÜRETİM' },
  { id: 'fb-c3', type: 'CAPACITY', location: '🇧🇩 Bangladeş / Dakka', title: 'Aylık 50.000 Adet T-Shirt', detail_key: 'Min. Sipariş:', detail_value: '5.000 adet', score: 70, action_text: '→ ORTAKLIK KUR' },
];

// ═══ DİL SEÇENEKLERİ ═══
const LANG_OPTIONS = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
];

// ═══ NAV ETİKETLERİ (8 DİL) ═══
const navLabels: Record<string, { news: string; tenders: string; trade: string; academy: string; register: string }> = {
  TR: { news: 'HABERLER', tenders: 'İHALELER', trade: 'TİCARET', academy: 'AKADEMİ', register: 'Ücretsiz Kayıt' },
  EN: { news: 'NEWS', tenders: 'TENDERS', trade: 'TRADE', academy: 'ACADEMY', register: 'Free Sign Up' },
  DE: { news: 'NACHRICHTEN', tenders: 'AUSSCHREIBUNGEN', trade: 'HANDEL', academy: 'AKADEMIE', register: 'Kostenlos Registrieren' },
  RU: { news: 'НОВОСТИ', tenders: 'ТЕНДЕРЫ', trade: 'ТОРГОВЛЯ', academy: 'АКАДЕМИЯ', register: 'Регистрация' },
  ZH: { news: '新闻', tenders: '招标', trade: '贸易', academy: '学院', register: '免费注册' },
  AR: { news: 'أخبار', tenders: 'مناقصات', trade: 'تجارة', academy: 'أكاديمية', register: 'تسجيل مجاني' },
  ES: { news: 'NOTICIAS', tenders: 'LICITACIONES', trade: 'COMERCIO', academy: 'ACADEMIA', register: 'Registro Gratis' },
  FR: { news: 'ACTUALITÉS', tenders: 'APPELS D\'OFFRES', trade: 'COMMERCE', academy: 'ACADÉMIE', register: 'Inscription Gratuite' },
};

// ═══ ANA SAYFA UI ETİKETLERİ (8 DİL OTONOM) ═══
const homeLabels: Record<string, {
  awaitingSignal: string; fxPower: string; supplyFreight: string;
  sectorNetwork: string; b2bPlatform: string; liveData: string;
  headline: string; allNews: string;
  tradingFloor: string; tradingActive: string; activeDeal: string; ceoBriefing: string;
  tenderFlow: string; hotStock: string; freeCapacity: string;
  seeAll: string; filter: string;
  oppEngine: string; actionCards: string; actionPlan: string; reviewIntel: string; getOffer: string;
  fairLayer: string; signalMap: string; activeSignals: string;
  academyLayer: string;
  scanningTender: string; scanningStock: string;
  emptyCapTitle: string; emptyCapDesc: string; emptyCapBtn: string;
  asiaIndex: string;
  targetAudience: string; priorityLabel: string; priorityHigh: string; priorityNormal: string;
  oppSignal: string; riskSignal: string; tradeSignal: string; neutralLabel: string; defaultAction: string;
  marketRegime: string; riskOn: string; riskOff: string; neutralRegime: string;
  regionAsia: string; regionEurope: string; regionAmericas: string; regionMena: string;
  fairPassed: string; fairToday: string; fairDays: string;
  activeMonitoring: string; signalsLabel: string;
  tenders: string; stockOpp: string; capacity: string;
  marketDirection: string; aiImpactScore: string;
  dirRisk: string; dirOpp: string; dirNeutral: string;
  imageGenerating: string; imageProcessing: string;
  ceoBriefLabel: string;
}> = {
  TR: {
    awaitingSignal: 'Piyasa Analizi Okunuyor...', fxPower: 'FX POWER (İNDEKS)', supplyFreight: 'TEDARİK & LOJİSTİK',
    sectorNetwork: 'SEKTÖREL VERİ AĞI', b2bPlatform: 'B2B EV TEKSTİLİ TİCARET PLATFORMU', liveData: 'CANLI VERİ AKIŞI',
    headline: 'GÜNÜN MANŞETİ', allNews: 'TÜM HABERLER →',
    tradingFloor: 'B2B TİCARET TERMİNALİ', tradingActive: 'TRTEX TİCARET AĞI DEVREDE', activeDeal: 'AKTİF FIRSAT', ceoBriefing: 'CEO BRİFİNG AL',
    tenderFlow: 'İHALE AKIŞI', hotStock: 'SICAK STOK', freeCapacity: 'BOŞ KAPASİTE',
    seeAll: 'TÜM İHALE VE FIRSATLARI GÖR →', filter: 'Filtreleme • Sıralama • Detaylı Analiz',
    oppEngine: 'FIRSAT MOTORU', actionCards: 'AKSİYON KARTLARI', actionPlan: 'Aksiyon Planı', reviewIntel: 'İstihbaratı İncele', getOffer: 'TEKLİF AL',
    fairLayer: 'ETKİNLİK KATMANI: SEKTÖR FUAR TAKVİMİ', signalMap: 'GLOBAL SİNYAL HARİTASI', activeSignals: 'AKTİF SİNYALLER',
    academyLayer: 'BİLGİ KATMANI: AKADEMİ',
    scanningTender: 'İhale verisi taranıyor... TRTEX tekrar arayacak.', scanningStock: 'Stok fırsatları taranıyor...',
    emptyCapTitle: 'Boş Kapasiteniz mi Var?', emptyCapDesc: 'Şu an yayınlanan açık üretim kapasitesi yok. Fabrikanızdaki boş dokuma veya konfeksiyon hatlarını, gizliliğinizi koruyarak 10.000 global B2B alıcısına anonim olarak saniyeler içinde duyurun.',
    emptyCapBtn: '→ ÜCRETSİZ KAPASİTE BİLDİR',
    asiaIndex: 'ASYA PİYASA İNDEKSİ',
    targetAudience: 'Hedef Kitle', priorityLabel: 'Öncelik', priorityHigh: 'YÜKSEK', priorityNormal: 'NORMAL',
    oppSignal: 'FIRSAT SİNYALİ', riskSignal: 'RİSK SİNYALİ', tradeSignal: 'TİCARİ SİNYAL', neutralLabel: 'NÖTR', defaultAction: 'Analiz raporunu detaylı inceleyin ve tedarikçi eşleştirmesini başlatın.',
    marketRegime: 'PİYASA REJİMİ', riskOn: 'RİSK ALGISI YÜKSEK', riskOff: 'RİSKTEN KAÇIŞ', neutralRegime: 'NÖTR',
    regionAsia: 'ASYA', regionEurope: 'AVRUPA', regionAmericas: 'AMERİKA', regionMena: 'ORTA DOĞU',
    fairPassed: 'GEÇTİ', fairToday: 'BUGÜN', fairDays: 'GÜN',
    activeMonitoring: 'AKTİF İZLEME', signalsLabel: 'SİNYAL',
    tenders: 'İhale', stockOpp: 'Stok Fırsatı', capacity: 'Boş Kapasite',
    marketDirection: 'PİYASA YÖNÜ', aiImpactScore: 'YAPAY ZEKA ETKİ SKORU',
    dirRisk: 'RİSKLİ', dirOpp: 'FIRSAT', dirNeutral: 'NÖTR',
    imageGenerating: 'GÖRSELLER OLUŞTURULUYOR', imageProcessing: 'TISF AĞINDA ARKA PLAN İŞLEMİ DEVAM EDİYOR...',
    ceoBriefLabel: 'TRTEX İSTİHBARAT ÇIKARIMI (Otonom Analiz)',
  },
  EN: {
    awaitingSignal: 'Awaiting Market Signal...', fxPower: 'FX POWER INDEX', supplyFreight: 'SUPPLY & FREIGHT',
    sectorNetwork: 'SECTOR DATA NETWORK', b2bPlatform: 'B2B HOME TEXTILE TRADE PLATFORM', liveData: 'LIVE DATA FEED',
    headline: 'TODAY\'S HEADLINE', allNews: 'ALL NEWS →',
    tradingFloor: 'B2B TRADING TERMINAL', tradingActive: 'TRTEX TRADING NETWORK ACTIVE', activeDeal: 'ACTIVE DEAL', ceoBriefing: 'GET CEO BRIEFING',
    tenderFlow: 'TENDER FLOW', hotStock: 'HOT STOCK', freeCapacity: 'AVAILABLE CAPACITY',
    seeAll: 'VIEW ALL TENDERS & OPPORTUNITIES →', filter: 'Filter • Sort • Detailed Analysis',
    oppEngine: 'OPPORTUNITY ENGINE', actionCards: 'ACTION CARDS', actionPlan: 'Action Plan', reviewIntel: 'Review Intelligence', getOffer: 'GET OFFER',
    fairLayer: 'EVENT LAYER: INDUSTRY FAIR CALENDAR', signalMap: 'GLOBAL SIGNAL MAP', activeSignals: 'ACTIVE SIGNALS',
    academyLayer: 'KNOWLEDGE LAYER: ACADEMY',
    scanningTender: 'Scanning tender data... TRTEX will search again.', scanningStock: 'Scanning stock opportunities...',
    emptyCapTitle: 'Have Available Capacity?', emptyCapDesc: 'No open production capacity currently published. Announce your idle weaving or confection lines anonymously to 10,000+ global B2B buyers in seconds.',
    emptyCapBtn: '→ REPORT FREE CAPACITY',
    asiaIndex: 'ASIA MARKET INDEX',
    targetAudience: 'Target Audience', priorityLabel: 'Priority', priorityHigh: 'HIGH', priorityNormal: 'NORMAL',
    oppSignal: 'OPPORTUNITY SIGNAL', riskSignal: 'RISK SIGNAL', tradeSignal: 'TRADE SIGNAL', neutralLabel: 'NEUTRAL', defaultAction: 'Review the analysis report in detail and initiate supplier matching.',
    marketRegime: 'MARKET REGIME', riskOn: 'RISK PERCEPTION HIGH', riskOff: 'RISK AVERSION', neutralRegime: 'NEUTRAL',
    regionAsia: 'ASIA', regionEurope: 'EUROPE', regionAmericas: 'AMERICAS', regionMena: 'MIDDLE EAST',
    fairPassed: 'PASSED', fairToday: 'TODAY', fairDays: 'DAYS',
    activeMonitoring: 'ACTIVE MONITORING', signalsLabel: 'SIGNAL',
    tenders: 'Tenders', stockOpp: 'Stock Deals', capacity: 'Capacity',
    marketDirection: 'MARKET DIRECTION', aiImpactScore: 'AI IMPACT SCORE',
    dirRisk: 'RISKY', dirOpp: 'OPPORTUNITY', dirNeutral: 'NEUTRAL',
    imageGenerating: 'GENERATING VISUALS', imageProcessing: 'TISF NETWORK BACKGROUND PROCESSING...',
    ceoBriefLabel: 'TRTEX INTELLIGENCE EXTRACT (Autonomous Analysis)',
  },
  DE: {
    awaitingSignal: 'Marktsignal wird gelesen...', fxPower: 'FX POWER INDEX', supplyFreight: 'LIEFERKETTE & FRACHT',
    sectorNetwork: 'BRANCHENDATENNETZ', b2bPlatform: 'B2B HEIMTEXTIL-HANDELSPLATTFORM', liveData: 'LIVE DATENFEED',
    headline: 'SCHLAGZEILE DES TAGES', allNews: 'ALLE NACHRICHTEN →',
    tradingFloor: 'B2B HANDELSTERMINAL', tradingActive: 'TRTEX HANDELSNETZ AKTIV', activeDeal: 'AKTIVES ANGEBOT', ceoBriefing: 'CEO-BRIEFING ERHALTEN',
    tenderFlow: 'AUSSCHREIBUNGEN', hotStock: 'HEISSES LAGER', freeCapacity: 'FREIE KAPAZITÄT',
    seeAll: 'ALLE AUSSCHREIBUNGEN ANZEIGEN →', filter: 'Filtern • Sortieren • Detailanalyse',
    oppEngine: 'CHANCEN-ENGINE', actionCards: 'AKTIONSKARTEN', actionPlan: 'Aktionsplan', reviewIntel: 'Intelligence prüfen', getOffer: 'ANGEBOT ERHALTEN',
    fairLayer: 'EVENT-EBENE: MESSEKALENDER', signalMap: 'GLOBALE SIGNALKARTE', activeSignals: 'AKTIVE SIGNALE',
    academyLayer: 'WISSENSEBENE: AKADEMIE',
    scanningTender: 'Ausschreibungsdaten werden gescannt...', scanningStock: 'Lagerangebote werden gescannt...',
    emptyCapTitle: 'Haben Sie freie Kapazitäten?', emptyCapDesc: 'Melden Sie Ihre freien Produktionskapazitäten anonym 10.000+ globalen B2B-Käufern.',
    emptyCapBtn: '→ FREIE KAPAZITÄT MELDEN',
    asiaIndex: 'ASIEN MARKTINDEX',
    targetAudience: 'Zielgruppe', priorityLabel: 'Priorität', priorityHigh: 'HOCH', priorityNormal: 'NORMAL',
    oppSignal: 'CHANCENSIGNAL', riskSignal: 'RISIKOSIGNAL', tradeSignal: 'HANDELSSIGNAL', neutralLabel: 'NEUTRAL', defaultAction: 'Prüfen Sie den Analysebericht im Detail und starten Sie das Lieferantenmatching.',
    marketRegime: 'MARKTREGIME', riskOn: 'RISIKOWAHRNEHMUNG HOCH', riskOff: 'RISIKOVERMEIDUNG', neutralRegime: 'NEUTRAL',
    regionAsia: 'ASIEN', regionEurope: 'EUROPA', regionAmericas: 'AMERIKA', regionMena: 'NAHER OSTEN',
    fairPassed: 'VORBEI', fairToday: 'HEUTE', fairDays: 'TAGE',
    activeMonitoring: 'AKTIVE ÜBERWACHUNG', signalsLabel: 'SIGNAL',
    tenders: 'Ausschreibungen', stockOpp: 'Lagerangebote', capacity: 'Kapazität',
    marketDirection: 'MARKTRICHTUNG', aiImpactScore: 'KI-WIRKUNGSWERT',
    dirRisk: 'RISKANT', dirOpp: 'CHANCE', dirNeutral: 'NEUTRAL',
    imageGenerating: 'BILDER WERDEN ERSTELLT', imageProcessing: 'TISF-NETZWERK HINTERGRUNDVERARBEITUNG...',
    ceoBriefLabel: 'TRTEX INTELLIGENCE-EXTRAKT (Autonome Analyse)',
  },
  RU: {
    awaitingSignal: 'Чтение рыночного сигнала...', fxPower: 'FX POWER ИНДЕКС', supplyFreight: 'ПОСТАВКИ И ФРАХТ',
    sectorNetwork: 'ОТРАСЛЕВАЯ СЕТЬ ДАННЫХ', b2bPlatform: 'B2B ПЛАТФОРМА ДОМАШНЕГО ТЕКСТИЛЯ', liveData: 'ПОТОК ДАННЫХ',
    headline: 'ЗАГОЛОВОК ДНЯ', allNews: 'ВСЕ НОВОСТИ →',
    tradingFloor: 'B2B ТОРГОВЫЙ ТЕРМИНАЛ', tradingActive: 'ТОРГОВАЯ СЕТЬ TRTEX АКТИВНА', activeDeal: 'АКТИВНАЯ СДЕЛКА', ceoBriefing: 'ПОЛУЧИТЬ БРИФИНГ',
    tenderFlow: 'ТЕНДЕРЫ', hotStock: 'ГОРЯЧИЙ СКЛАД', freeCapacity: 'СВОБОДНЫЕ МОЩНОСТИ',
    seeAll: 'СМОТРЕТЬ ВСЕ ТЕНДЕРЫ →', filter: 'Фильтр • Сортировка • Детальный анализ',
    oppEngine: 'ДВИГАТЕЛЬ ВОЗМОЖНОСТЕЙ', actionCards: 'КАРТОЧКИ ДЕЙСТВИЙ', actionPlan: 'План действий', reviewIntel: 'Изучить разведку', getOffer: 'ПОЛУЧИТЬ ПРЕДЛОЖЕНИЕ',
    fairLayer: 'СЛОЙ СОБЫТИЙ: КАЛЕНДАРЬ ВЫСТАВОК', signalMap: 'ГЛОБАЛЬНАЯ КАРТА СИГНАЛОВ', activeSignals: 'АКТИВНЫЕ СИГНАЛЫ',
    academyLayer: 'УРОВЕНЬ ЗНАНИЙ: АКАДЕМИЯ',
    scanningTender: 'Сканирование тендерных данных...', scanningStock: 'Сканирование складских предложений...',
    emptyCapTitle: 'Есть свободные мощности?', emptyCapDesc: 'Объявите о своих свободных мощностях анонимно 10 000+ B2B покупателям.',
    emptyCapBtn: '→ СООБЩИТЬ О МОЩНОСТИ',
    asiaIndex: 'ИНДЕКС РЫНКА АЗИИ',
    targetAudience: 'Целевая аудитория', priorityLabel: 'Приоритет', priorityHigh: 'ВЫСОКИЙ', priorityNormal: 'ОБЫЧНЫЙ',
    oppSignal: 'СИГНАЛ ВОЗМОЖНОСТИ', riskSignal: 'СИГНАЛ РИСКА', tradeSignal: 'ТОРГОВЫЙ СИГНАЛ', neutralLabel: 'НЕЙТРАЛЬНО', defaultAction: 'Изучите аналитический отчёт и начните подбор поставщиков.',
    marketRegime: 'РЫНОЧНЫЙ РЕЖИМ', riskOn: 'ВЫСОКОЕ ВОСПРИЯТИЕ РИСКА', riskOff: 'УКЛОНЕНИЕ ОТ РИСКА', neutralRegime: 'НЕЙТРАЛЬНЫЙ',
    regionAsia: 'АЗИЯ', regionEurope: 'ЕВРОПА', regionAmericas: 'АМЕРИКА', regionMena: 'БЛИЖНИЙ ВОСТОК',
    fairPassed: 'ПРОШЛО', fairToday: 'СЕГОДНЯ', fairDays: 'ДНЕЙ',
    activeMonitoring: 'АКТИВНЫЙ МОНИТОРИНГ', signalsLabel: 'СИГНАЛ',
    tenders: 'Тендеры', stockOpp: 'Складские предложения', capacity: 'Мощности',
    marketDirection: 'НАПРАВЛЕНИЕ РЫНКА', aiImpactScore: 'ОЦЕНКА ВЛИЯНИЯ ИИ',
    dirRisk: 'РИСКОВАННО', dirOpp: 'ВОЗМОЖНОСТЬ', dirNeutral: 'НЕЙТРАЛЬНО',
    imageGenerating: 'ИЗОБРАЖЕНИЯ СОЗДАЮТСЯ', imageProcessing: 'ОБРАБОТКА В СЕТИ TISF...',
    ceoBriefLabel: 'АНАЛИТИКА TRTEX (Автономный анализ)',
  },
  ZH: {
    awaitingSignal: '正在读取市场信号...', fxPower: 'FX 能量指数', supplyFreight: '供应链与运费',
    sectorNetwork: '行业数据网络', b2bPlatform: 'B2B家纺贸易平台', liveData: '实时数据',
    headline: '今日头条', allNews: '所有新闻 →',
    tradingFloor: 'B2B交易终端', tradingActive: 'TRTEX交易网络活跃', activeDeal: '活跃交易', ceoBriefing: '获取CEO简报',
    tenderFlow: '招标流', hotStock: '热门库存', freeCapacity: '空闲产能',
    seeAll: '查看所有招标和机会 →', filter: '筛选 • 排序 • 详细分析',
    oppEngine: '机会引擎', actionCards: '行动卡', actionPlan: '行动计划', reviewIntel: '查看情报', getOffer: '获取报价',
    fairLayer: '活动层：行业展会日历', signalMap: '全球信号地图', activeSignals: '活跃信号',
    academyLayer: '知识层：学院',
    scanningTender: '正在扫描招标数据...', scanningStock: '正在扫描库存机会...',
    emptyCapTitle: '有空闲产能？', emptyCapDesc: '向10,000+全球B2B买家匿名发布您的空闲产能。',
    emptyCapBtn: '→ 报告空闲产能',
    asiaIndex: '亚洲市场指数',
    targetAudience: '目标受众', priorityLabel: '优先级', priorityHigh: '高', priorityNormal: '普通',
    oppSignal: '机会信号', riskSignal: '风险信号', tradeSignal: '贸易信号', neutralLabel: '中性', defaultAction: '详细查看分析报告并启动供应商匹配。',
    marketRegime: '市场体制', riskOn: '高风险感知', riskOff: '风险规避', neutralRegime: '中性',
    regionAsia: '亚洲', regionEurope: '欧洲', regionAmericas: '美洲', regionMena: '中东',
    fairPassed: '已过', fairToday: '今天', fairDays: '天',
    activeMonitoring: '活跃监控', signalsLabel: '信号',
    tenders: '招标', stockOpp: '库存机会', capacity: '产能',
    marketDirection: '市场方向', aiImpactScore: 'AI影响评分',
    dirRisk: '风险', dirOpp: '机会', dirNeutral: '中性',
    imageGenerating: '生成图像中', imageProcessing: 'TISF网络后台处理中...',
    ceoBriefLabel: 'TRTEX情报摘要（自主分析）',
  },
  AR: {
    awaitingSignal: 'جاري قراءة إشارة السوق...', fxPower: 'مؤشر FX POWER', supplyFreight: 'التوريد والشحن',
    sectorNetwork: 'شبكة بيانات القطاع', b2bPlatform: 'منصة تجارة المنسوجات المنزلية B2B', liveData: 'تدفق البيانات المباشر',
    headline: 'عنوان اليوم', allNews: 'جميع الأخبار →',
    tradingFloor: 'محطة تداول B2B', tradingActive: 'شبكة تداول TRTEX نشطة', activeDeal: 'صفقة نشطة', ceoBriefing: 'احصل على إحاطة CEO',
    tenderFlow: 'تدفق المناقصات', hotStock: 'مخزون ساخن', freeCapacity: 'طاقة متاحة',
    seeAll: 'عرض جميع المناقصات والفرص →', filter: 'تصفية • ترتيب • تحليل مفصل',
    oppEngine: 'محرك الفرص', actionCards: 'بطاقات الإجراء', actionPlan: 'خطة العمل', reviewIntel: 'مراجعة الاستخبارات', getOffer: 'احصل على عرض',
    fairLayer: 'طبقة الأحداث: تقويم المعارض', signalMap: 'خريطة الإشارات العالمية', activeSignals: 'إشارات نشطة',
    academyLayer: 'طبقة المعرفة: الأكاديمية',
    scanningTender: 'جاري مسح بيانات المناقصات...', scanningStock: 'جاري مسح فرص المخزون...',
    emptyCapTitle: 'هل لديك طاقة متاحة؟', emptyCapDesc: 'أعلن عن طاقتك الإنتاجية المتاحة بشكل مجهول لأكثر من 10,000 مشتري B2B.',
    emptyCapBtn: '→ الإبلاغ عن الطاقة المتاحة',
    asiaIndex: 'مؤشر سوق آسيا',
    targetAudience: 'الجمهور المستهدف', priorityLabel: 'الأولوية', priorityHigh: 'عالية', priorityNormal: 'عادية',
    oppSignal: 'إشارة فرصة', riskSignal: 'إشارة خطر', tradeSignal: 'إشارة تجارية', neutralLabel: 'محايد', defaultAction: 'راجع تقرير التحليل بالتفصيل وابدأ مطابقة الموردين.',
    marketRegime: 'نظام السوق', riskOn: 'إدراك عالي للمخاطر', riskOff: 'تجنب المخاطر', neutralRegime: 'محايد',
    regionAsia: 'آسيا', regionEurope: 'أوروبا', regionAmericas: 'الأمريكتان', regionMena: 'الشرق الأوسط',
    fairPassed: 'انتهى', fairToday: 'اليوم', fairDays: 'يوم',
    activeMonitoring: 'مراقبة نشطة', signalsLabel: 'إشارة',
    tenders: 'مناقصات', stockOpp: 'فرص مخزون', capacity: 'طاقة',
    marketDirection: 'اتجاه السوق', aiImpactScore: 'نقاط تأثير الذكاء الاصطناعي',
    dirRisk: 'خطر', dirOpp: 'فرصة', dirNeutral: 'محايد',
    imageGenerating: 'جاري إنشاء الصور', imageProcessing: 'معالجة خلفية في شبكة TISF...',
    ceoBriefLabel: 'استخراج معلومات TRTEX (تحليل ذاتي)',
  },
  ES: {
    awaitingSignal: 'Leyendo señal del mercado...', fxPower: 'FX POWER INDEX', supplyFreight: 'SUMINISTRO Y FLETE',
    sectorNetwork: 'RED DE DATOS SECTORIAL', b2bPlatform: 'PLATAFORMA DE COMERCIO B2B TEXTIL HOGAR', liveData: 'DATOS EN VIVO',
    headline: 'TITULAR DEL DÍA', allNews: 'TODAS LAS NOTICIAS →',
    tradingFloor: 'TERMINAL DE COMERCIO B2B', tradingActive: 'RED DE COMERCIO TRTEX ACTIVA', activeDeal: 'OFERTA ACTIVA', ceoBriefing: 'OBTENER BRIEFING CEO',
    tenderFlow: 'FLUJO DE LICITACIONES', hotStock: 'STOCK CALIENTE', freeCapacity: 'CAPACIDAD DISPONIBLE',
    seeAll: 'VER TODAS LAS LICITACIONES →', filter: 'Filtrar • Ordenar • Análisis Detallado',
    oppEngine: 'MOTOR DE OPORTUNIDADES', actionCards: 'TARJETAS DE ACCIÓN', actionPlan: 'Plan de Acción', reviewIntel: 'Revisar Inteligencia', getOffer: 'OBTENER OFERTA',
    fairLayer: 'CAPA DE EVENTOS: CALENDARIO DE FERIAS', signalMap: 'MAPA DE SEÑALES GLOBALES', activeSignals: 'SEÑALES ACTIVAS',
    academyLayer: 'CAPA DE CONOCIMIENTO: ACADEMIA',
    scanningTender: 'Escaneando datos de licitaciones...', scanningStock: 'Escaneando ofertas de stock...',
    emptyCapTitle: '¿Tiene capacidad disponible?', emptyCapDesc: 'Anuncie su capacidad productiva de forma anónima a más de 10.000 compradores B2B.',
    emptyCapBtn: '→ REPORTAR CAPACIDAD LIBRE',
    asiaIndex: 'ÍNDICE DE MERCADO ASIÁTICO',
    targetAudience: 'Público Objetivo', priorityLabel: 'Prioridad', priorityHigh: 'ALTA', priorityNormal: 'NORMAL',
    oppSignal: 'SEÑAL DE OPORTUNIDAD', riskSignal: 'SEÑAL DE RIESGO', tradeSignal: 'SEÑAL COMERCIAL', neutralLabel: 'NEUTRAL', defaultAction: 'Revise el informe de análisis e inicie la búsqueda de proveedores.',
    marketRegime: 'RÉGIMEN DE MERCADO', riskOn: 'PERCEPCIÓN DE RIESGO ALTA', riskOff: 'AVERSIÓN AL RIESGO', neutralRegime: 'NEUTRAL',
    regionAsia: 'ASIA', regionEurope: 'EUROPA', regionAmericas: 'AMÉRICAS', regionMena: 'ORIENTE MEDIO',
    fairPassed: 'PASADO', fairToday: 'HOY', fairDays: 'DÍAS',
    activeMonitoring: 'MONITOREO ACTIVO', signalsLabel: 'SEÑAL',
    tenders: 'Licitaciones', stockOpp: 'Ofertas de Stock', capacity: 'Capacidad',
    marketDirection: 'DIRECCIÓN DEL MERCADO', aiImpactScore: 'PUNTUACIÓN DE IMPACTO IA',
    dirRisk: 'RIESGOSO', dirOpp: 'OPORTUNIDAD', dirNeutral: 'NEUTRAL',
    imageGenerating: 'GENERANDO IMÁGENES', imageProcessing: 'PROCESAMIENTO EN RED TISF...',
    ceoBriefLabel: 'EXTRACTO DE INTELIGENCIA TRTEX (Análisis Autónomo)',
  },
  FR: {
    awaitingSignal: 'Lecture du signal de marché...', fxPower: 'FX POWER INDEX', supplyFreight: 'APPROVISIONNEMENT & FRET',
    sectorNetwork: 'RÉSEAU DE DONNÉES SECTORIEL', b2bPlatform: 'PLATEFORME DE COMMERCE B2B TEXTILE MAISON', liveData: 'FLUX DE DONNÉES EN DIRECT',
    headline: 'TITRE DU JOUR', allNews: 'TOUTES LES ACTUALITÉS →',
    tradingFloor: 'TERMINAL DE COMMERCE B2B', tradingActive: 'RÉSEAU DE COMMERCE TRTEX ACTIF', activeDeal: 'OFFRE ACTIVE', ceoBriefing: 'OBTENIR BRIEFING CEO',
    tenderFlow: "FLUX D'APPELS D'OFFRES", hotStock: 'STOCK CHAUD', freeCapacity: 'CAPACITÉ DISPONIBLE',
    seeAll: "VOIR TOUS LES APPELS D'OFFRES →", filter: 'Filtrer • Trier • Analyse Détaillée',
    oppEngine: 'MOTEUR D\'OPPORTUNITÉS', actionCards: 'CARTES D\'ACTION', actionPlan: 'Plan d\'Action', reviewIntel: 'Examiner Intelligence', getOffer: 'OBTENIR UNE OFFRE',
    fairLayer: 'COUCHE ÉVÉNEMENTS : CALENDRIER DES SALONS', signalMap: 'CARTE DES SIGNAUX MONDIAUX', activeSignals: 'SIGNAUX ACTIFS',
    academyLayer: 'COUCHE CONNAISSANCE : ACADÉMIE',
    scanningTender: 'Scan des données d\'appels d\'offres...', scanningStock: 'Scan des offres de stock...',
    emptyCapTitle: 'Capacité disponible ?', emptyCapDesc: 'Annoncez vos capacités de production inutilisées de manière anonyme à plus de 10 000 acheteurs B2B.',
    emptyCapBtn: '→ SIGNALER CAPACITÉ LIBRE',
    asiaIndex: 'INDICE DU MARCHÉ ASIATIQUE',
    targetAudience: 'Public Cible', priorityLabel: 'Priorité', priorityHigh: 'HAUTE', priorityNormal: 'NORMALE',
    oppSignal: 'SIGNAL D\'OPPORTUNITÉ', riskSignal: 'SIGNAL DE RISQUE', tradeSignal: 'SIGNAL COMMERCIAL', neutralLabel: 'NEUTRE', defaultAction: 'Examinez le rapport d\'analyse et lancez le matching fournisseurs.',
    marketRegime: 'RÉGIME DE MARCHÉ', riskOn: 'PERCEPTION DU RISQUE ÉLEVÉE', riskOff: 'AVERSION AU RISQUE', neutralRegime: 'NEUTRE',
    regionAsia: 'ASIE', regionEurope: 'EUROPE', regionAmericas: 'AMÉRIQUES', regionMena: 'MOYEN-ORIENT',
    fairPassed: 'PASSÉ', fairToday: 'AUJOURD\'HUI', fairDays: 'JOURS',
    activeMonitoring: 'SURVEILLANCE ACTIVE', signalsLabel: 'SIGNAL',
    tenders: 'Appels d\'offres', stockOpp: 'Offres de stock', capacity: 'Capacité',
    marketDirection: 'DIRECTION DU MARCHÉ', aiImpactScore: 'SCORE D\'IMPACT IA',
    dirRisk: 'RISQUÉ', dirOpp: 'OPPORTUNITÉ', dirNeutral: 'NEUTRE',
    imageGenerating: 'GÉNÉRATION D\'IMAGES', imageProcessing: 'TRAITEMENT EN ARRIÈRE-PLAN TISF...',
    ceoBriefLabel: 'EXTRAIT D\'INTELLIGENCE TRTEX (Analyse Autonome)',
  },
};

// ═══ OTONOM KATEGORİ ÇEVİRİ HARİTASI (Firestore'dan gelen TR kategori → 8 Dil) ═══
const CATEGORY_MAP: Record<string, Record<string, string>> = {
  'İSTİHBARAT': { TR: 'İSTİHBARAT', EN: 'INTELLIGENCE', DE: 'INTELLIGENCE', FR: 'RENSEIGNEMENT', ES: 'INTELIGENCIA', RU: 'РАЗВЕДКА', ZH: '情报', AR: 'استخبارات' },
  'YENİ TEKNOLOJİ': { TR: 'YENİ TEKNOLOJİ', EN: 'NEW TECH', DE: 'NEUE TECHNOLOGIE', FR: 'NOUVELLE TECHNOLOGIE', ES: 'NUEVA TECNOLOGÍA', RU: 'НОВЫЕ ТЕХНОЛОГИИ', ZH: '新技术', AR: 'تكنولوجيا جديدة' },
  'MİMARİ & TREND': { TR: 'MİMARİ & TREND', EN: 'ARCHITECTURE & TREND', DE: 'ARCHITEKTUR & TREND', FR: 'ARCHITECTURE & TENDANCE', ES: 'ARQUITECTURA & TENDENCIA', RU: 'АРХИТЕКТУРА И ТРЕНД', ZH: '建筑与趋势', AR: 'عمارة واتجاهات' },
  'PERDE': { TR: 'PERDE', EN: 'CURTAIN', DE: 'VORHANG', FR: 'RIDEAU', ES: 'CORTINA', RU: 'ШТОРЫ', ZH: '窗帘', AR: 'ستائر' },
  'EV TEKSTİLİ': { TR: 'EV TEKSTİLİ', EN: 'HOME TEXTILE', DE: 'HEIMTEXTIL', FR: 'TEXTILE MAISON', ES: 'TEXTIL HOGAR', RU: 'ДОМАШНИЙ ТЕКСТИЛЬ', ZH: '家纺', AR: 'منسوجات منزلية' },
  'DÖŞEMELİK': { TR: 'DÖŞEMELİK', EN: 'UPHOLSTERY', DE: 'POLSTERSTOFF', FR: 'AMEUBLEMENT', ES: 'TAPICERÍA', RU: 'ОБИВКА', ZH: '装饰面料', AR: 'تنجيد' },
  'PAZAR': { TR: 'PAZAR', EN: 'MARKET', DE: 'MARKT', FR: 'MARCHÉ', ES: 'MERCADO', RU: 'РЫНОК', ZH: '市场', AR: 'سوق' },
  'MARKET': { TR: 'PAZAR', EN: 'MARKET', DE: 'MARKT', FR: 'MARCHÉ', ES: 'MERCADO', RU: 'РЫНОК', ZH: '市场', AR: 'سوق' },
  'FIRSAT': { TR: 'FIRSAT', EN: 'OPPORTUNITY', DE: 'CHANCE', FR: 'OPPORTUNITÉ', ES: 'OPORTUNIDAD', RU: 'ВОЗМОЖНОСТЬ', ZH: '机会', AR: 'فرصة' },
  'OPPORTUNITY': { TR: 'FIRSAT', EN: 'OPPORTUNITY', DE: 'CHANCE', FR: 'OPPORTUNITÉ', ES: 'OPORTUNIDAD', RU: 'ВОЗМОЖНОСТЬ', ZH: '机会', AR: 'فرصة' },
  'GÜNDEM': { TR: 'GÜNDEM', EN: 'AGENDA', DE: 'AGENDA', FR: 'AGENDA', ES: 'AGENDA', RU: 'ПОВЕСТКА', ZH: '议程', AR: 'جدول أعمال' },
  'HABER': { TR: 'HABER', EN: 'NEWS', DE: 'NACHRICHTEN', FR: 'ACTUALITÉS', ES: 'NOTICIAS', RU: 'НОВОСТИ', ZH: '新闻', AR: 'أخبار' },
  'NEWS': { TR: 'HABER', EN: 'NEWS', DE: 'NACHRICHTEN', FR: 'ACTUALITÉS', ES: 'NOTICIAS', RU: 'НОВОСТИ', ZH: '新闻', AR: 'أخبار' },
  'ANALİZ': { TR: 'ANALİZ', EN: 'ANALYSIS', DE: 'ANALYSE', FR: 'ANALYSE', ES: 'ANÁLISIS', RU: 'АНАЛИЗ', ZH: '分析', AR: 'تحليل' },
  'ANALYSIS': { TR: 'ANALİZ', EN: 'ANALYSIS', DE: 'ANALYSE', FR: 'ANALYSE', ES: 'ANÁLISIS', RU: 'АНАЛИЗ', ZH: '分析', AR: 'تحليل' },
  'BÖLGE': { TR: 'BÖLGE', EN: 'REGION', DE: 'REGION', FR: 'RÉGION', ES: 'REGIÓN', RU: 'РЕГИОН', ZH: '地区', AR: 'منطقة' },
  'REGION': { TR: 'BÖLGE', EN: 'REGION', DE: 'REGION', FR: 'RÉGION', ES: 'REGIÓN', RU: 'РЕГИОН', ZH: '地区', AR: 'منطقة' },
  'TREND': { TR: 'TREND', EN: 'TREND', DE: 'TREND', FR: 'TENDANCE', ES: 'TENDENCIA', RU: 'ТРЕНД', ZH: '趋势', AR: 'اتجاه' },
  'DEKORASYON': { TR: 'DEKORASYON', EN: 'DECORATION', DE: 'DEKORATION', FR: 'DÉCORATION', ES: 'DECORACIÓN', RU: 'ДЕКОР', ZH: '装饰', AR: 'ديكور' },
  'HAMMADDE': { TR: 'HAMMADDE', EN: 'RAW MATERIAL', DE: 'ROHSTOFF', FR: 'MATIÈRE PREMIÈRE', ES: 'MATERIA PRIMA', RU: 'СЫРЬЁ', ZH: '原材料', AR: 'مواد خام' },
  'İPLİK': { TR: 'İPLİK', EN: 'YARN', DE: 'GARN', FR: 'FIL', ES: 'HILO', RU: 'ПРЯЖА', ZH: '纱线', AR: 'خيوط' },
};

function classifyRegion(article: any): string {
  const text = `${article.title || ''} ${article.summary || ''} ${article.category || ''} ${article.commercial_note || ''}`.toLowerCase();
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return region;
  }
  return 'GLOBAL';
}

export default function PremiumB2BHomeLayout({ 
  payload, lang, exactDomain, basePath, brandName, L, 
  uzakDoguRadari, priorityEngine, fairsWithCountdown, ui 
}: any) {
  
  const { 
    heroArticle, gridArticles = [], todayInsight, radarStream,
    tickerItems = [], haftaninFirsatlari = [], academyArticles = [], menuConfig = [],
    hasPremiumReport, decision_engine, payloadConfidence, sysMetrics, 
    systemStatus, intelligenceScore
  } = payload || {};
  
  // ═══ LEAD CAPTURE MODAL STATE ═══
  const [leadModal, setLeadModal] = useState<{ open: boolean; context: any }>({
    open: false,
    context: { type: 'GENERAL' as const }
  });
  // ═══ DİL DROPDOWN STATE ═══
  const [langOpen, setLangOpen] = useState(false);

  // Prop olarak gelmezse payload içinden fallback yap:
  const activePriorityEngine = priorityEngine || payload?.priorityEngine || {};
  const activeFairs = fairsWithCountdown || payload?.fairsWithCountdown || [];
  const activeUzakDogu = uzakDoguRadari || payload?.uzakDoguRadari || {};
  
  // ═══ TRADING FLOOR: Canlı veri veya fallback ═══
  const rawTenders = payload?.activeTenders || [];
  const liveTenders = Array.isArray(rawTenders) && rawTenders.length > 0 ? rawTenders : FALLBACK_TENDERS;
  const tenderItems = liveTenders.filter((t: any) => t.type === 'TENDER');
  const stockItems = liveTenders.filter((t: any) => t.type === 'HOT_STOCK');
  const capacityItems = liveTenders.filter((t: any) => t.type === 'CAPACITY');

  const targetLang = lang.toUpperCase();

  const hero = heroArticle;
  const safeHaftaninFirsatlari = Array.isArray(haftaninFirsatlari) ? haftaninFirsatlari : [];
  const safeGridArticles = Array.isArray(gridArticles) ? gridArticles : [];
  const HL = homeLabels[targetLang] || homeLabels.EN || homeLabels.TR;
  const allArticles = [...safeHaftaninFirsatlari, ...safeGridArticles];
  const uniqueMap = new Map();
  allArticles.forEach(a => { if (a?.id && !uniqueMap.has(a.id) && a.id !== hero?.id) uniqueMap.set(a.id, a); });
  const pool = Array.from(uniqueMap.values());

  const z0Headlines = [
    { text: activePriorityEngine?.top_signal || HL.awaitingSignal, href: null },
    ...pool.slice(0, 4).map(a => ({
      text: a?.translations?.[targetLang]?.title || a?.title,
      href: `${basePath}/news/${a?.slug || a?.id}?lang=${lang}`
    }))
  ].filter(h => h.text);

  const [headlineIndex, setHeadlineIndex] = React.useState(0);
  React.useEffect(() => {
    if (z0Headlines.length <= 1) return;
    const int = setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % z0Headlines.length);
    }, 5000);
    return () => clearInterval(int);
  }, [z0Headlines.length]);

  // REGIONAL CLASSIFICATION (Zone 4)
  const regionArticles: Record<string, any[]> = { ASIA: [], EUROPE: [], AMERICAS: [], MENA: [], GLOBAL: [] };
  pool.forEach(a => {
    // TISF Sinyal Ağından gelen Mühürlü Veri
    if (a.trtex_payload_core?.geo?.trade_zone && regionArticles[a.trtex_payload_core.geo.trade_zone.toUpperCase()]) {
      regionArticles[a.trtex_payload_core.geo.trade_zone.toUpperCase()].push(a);
    } else {
      // Geriye Dönük Uyumluluk (Eski Haberler İçin Fallback)
      const r = classifyRegion(a);
      regionArticles[r]?.push(a);
    }
  });
  const regionKeys = ['ASIA', 'EUROPE', 'AMERICAS', 'MENA'];
  regionKeys.forEach((k, idx) => {
    if (regionArticles[k].length < 3) {
      const start = idx * 3;
      const fillCandidates = pool.slice(start, start + 3);
      regionArticles[k] = fillCandidates.length > 0 ? fillCandidates : pool.slice(0, 3);
    }
  });

  const getImg = (a: any) => {
    const direct = a?.images?.[0] || a?.image_url;
    if (direct && direct.startsWith('https://')) return direct;
    
    // PREMIUM ALOHA FALLBACKS (VIVID B2B)
    const fallbacks = [
      '/aloha_images/aloha_fallback_1.png',
      '/aloha_images/aloha_fallback_2.png',
      '/aloha_images/aloha_fallback_3.png'
    ];
    
    if (a?.id) {
       const sum = String(a.id).split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
       // Use fallbacks first, then original aloha images
       if (sum % 2 === 0) {
         return fallbacks[sum % 3];
       }
       const index = sum % 15; 
       return `/aloha_images/aloha_${index}.jpg`;
    }
    return null; 
  };
  const getTitle = (a: any) => a?.translations?.[targetLang]?.title || a?.title;
  const getCat = (a: any) => {
    const translated = a?.translations?.[targetLang]?.category;
    if (translated) return translated;
    const raw = a?.category || 'MARKET';
    const mapped = CATEGORY_MAP[raw.toUpperCase()];
    if (mapped && mapped[targetLang]) return mapped[targetLang];
    return raw;
  };
  const getSummary = (a: any) => a?.translations?.[targetLang]?.summary || a?.summary || '';
  const getLink = (a: any) => `${basePath}/news/${a?.slug || a?.id}?lang=${lang}`;
  const statusColor = systemStatus === 'LIVE' ? '#22C55E' : systemStatus === 'DEGRADED' ? '#F59E0B' : '#EF4444';

  const safeTickerItems = Array.isArray(tickerItems) ? tickerItems : [];
  
  // ZONE 1: DERIVED SIGNALS (MARKET INTELLIGENCE)
  const tkNewsOnly = safeTickerItems.filter((t:any) => t.isBreaking || t.type === 'news_event');
  
  const fxItems = safeTickerItems.filter((t:any) => t.id === 'usdtry' || t.id === 'eurtry');
  const matItems = safeTickerItems.filter((t:any) => t.id === 'brent' || t.id === 'cotton' || t.id === 'pta' || t.id === 'meg' || t.id === 'shf' || t.id === 'poy' || t.id === 'dye');
  
  const avgFxChange = fxItems.length ? fxItems.reduce((acc:number, c:any) => acc + (c.change || 0), 0) / fxItems.length : 0;
  const avgMatChange = matItems.length ? matItems.reduce((acc:number, c:any) => acc + (c.change || 0), 0) / matItems.length : 0;

  const regimeStyle = activePriorityEngine?.market_regime === 'RISK_ON' ? 'var(--go)' : activePriorityEngine?.market_regime === 'RISK_OFF' ? 'var(--re)' : '#3B82F6';

  const fxImpact = Math.abs(avgFxChange) > 1.0 ? 'HIGH' : Math.abs(avgFxChange) > 0.4 ? 'MEDIUM' : 'LOW';
  const matImpact = Math.abs(avgMatChange) > 1.5 ? 'HIGH' : Math.abs(avgMatChange) > 0.5 ? 'MEDIUM' : 'LOW';

  const syntheticFxTicker = {
    id: 'fx_power_synthetic',
    type: 'macro',
    label: HL.fxPower,
    value: Number(84.2 + avgFxChange).toFixed(1),
    unit: 'PTS',
    change: avgFxChange,
    direction: avgFxChange > 0 ? 'up' : avgFxChange < 0 ? 'down' : 'stable',
    severity: fxImpact === 'HIGH' ? 'crisis' : fxImpact === 'MEDIUM' ? 'attention' : 'normal',
    timestamp: Date.now()
  };

  const syntheticMatTicker = {
    id: 'mat_power_synthetic',
    type: 'macro',
    label: HL.supplyFreight,
    value: Number(78.6 + avgMatChange).toFixed(1),
    unit: 'PTS',
    change: avgMatChange,
    direction: avgMatChange > 0 ? 'up' : avgMatChange < 0 ? 'down' : 'stable',
    severity: matImpact === 'HIGH' ? 'crisis' : matImpact === 'MEDIUM' ? 'attention' : 'normal',
    timestamp: Date.now()
  };

  const finalTickerItems = [
    syntheticFxTicker, 
    ...fxItems, 
    syntheticMatTicker, 
    ...matItems, 
    ...tkNewsOnly.slice(0, 3) // Haberi sınırla ki veriler ezilmesin
  ];

  // OTONOM SİNİR AĞI BAĞLANTISI (TISF Zone Classifier Entegrasyonu)
  // Eski veri ve yeni TISF verisi (trtex_payload_core) birlikte harmanlanır.
  const tradeOpportunities = pool.filter(a => {
    if (a.trtex_payload_core?.zone === 'TRADE') return true; // TISF Kesin Sinyali
    const cScore = a.commercial_score || a.scoring?.commercial_score || 0;
    return cScore >= 75 || safeHaftaninFirsatlari.find((h:any)=>h.id===a.id);
  }).slice(0, 6);

  // BREAKING & INSIGHT Kategorisi (Zone 2)
  const newsGridRaw = pool.filter(a => {
    if (a.trtex_payload_core?.zone === 'BREAKING') return true; // TISF Kesin Sinyali
    if (a.trtex_payload_core?.zone === 'RADAR' || a.trtex_payload_core?.zone === 'LIVE_STREAM') return false;
    return !tradeOpportunities.includes(a);
  });
  
  const newsGridWithImages = newsGridRaw.filter(a => getImg(a));
  let newsGrid = (newsGridWithImages.length >= 6 ? newsGridWithImages : newsGridRaw).slice(0, 12);
  // 6 HABER GARANTİSİ: Yeterli haber yoksa pool'dan tamamla
  if (newsGrid.length < 6) {
    const existing = new Set(newsGrid.map((a:any) => a.id));
    const backfill = pool.filter((a:any) => !existing.has(a.id) && a.id !== hero?.id);
    newsGrid = [...newsGrid, ...backfill].slice(0, 6);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": brandName ? `${brandName}.com` : 'TRTEX',
        "url": `https://${exactDomain}`,
        "description": "Kurumsal Ticaret İstihbarat Terminali",
        "publisher": { "@id": `https://${exactDomain}/#organization` }
      },
      {
        "@type": "Organization",
        "@id": `https://${exactDomain}/#organization`,
        "name": brandName || 'TRTEX',
        "url": `https://${exactDomain}`,
        "logo": `https://${exactDomain}/logo.png`
      }
    ]
  };

  return (
    <div className="trtex-root">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root{--w:#fff;--c:#FAFAF8;--g:#F5F5F0;--b:#E8E8E3;--bs:#101112;--t:#1A1A1A;--ts:#666660;--a:#C41E1E;--s:'Inter',-apple-system,sans-serif;--sf:'Playfair Display',Georgia,serif;--m:'JetBrains Mono',monospace; --go:#22C55E; --re:#EF4444; --wa:#F59E0B;}
        @keyframes pulse-live { 0% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
        @keyframes radar-sweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .live-dot { display: inline-block; width: 8px; height: 8px; background: var(--go); border-radius: 50%; margin-right: 8px; animation: pulse-live 2s infinite; }
        
        .radar-box { position: relative; overflow: hidden; width: 100%; height: 100%; background: #080A0A; color: var(--go); display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--m); border: 1px solid #1A1F1F; }
        .radar-box::before { content: ""; position: absolute; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent 70%, rgba(34,197,94,0.3) 100%); animation: radar-sweep 4s linear infinite; border-radius: 50%; }
        .radar-box::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle, transparent 20%, #080A0A 90%); }
        .radar-content { position: relative; z-index: 10; text-align: center; }

        .trtex-root{min-height:100vh;background:var(--w);color:var(--t);font-family:var(--s);-webkit-font-smoothing:antialiased}
        .trtex-root a{text-decoration:none;color:inherit}.trtex-root *{box-sizing:border-box;margin:0;padding:0}
        .tc{max-width:1400px;margin:0 auto;padding:0 1.5rem}
        .ml{font-family:var(--m);font-size:.65rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ts)}
        .ma{color:var(--a)}
        
        /* NAV & HEADER */
        .nav{position:relative;z-index:100;background:var(--w);border-bottom:1px solid var(--b)}
        .nav-i{display:flex;justify-content:space-between;align-items:center;height:50px}
        .nav-b{font-family:var(--sf);font-size:1.4rem;font-weight:900;display:flex;align-items:center;gap:.5rem}
        .nav-l{display:flex;gap:1.5rem;align-items:center}
        
        /* ZONE 1: DUAL SIGNAL SYSTEM */
        .z1{background:var(--bs);color:var(--w);display:flex;flex-direction:column}
        .z1 .tk{border-bottom:1px solid #222}
        .z1 .tk div, .z1 .tk span{font-family:var(--m)!important;font-size:.6rem!important}
        
        .ds-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#333;border-bottom:1px solid #333}
        .ds-card{background:var(--bs);padding:3rem 2rem;display:flex;flex-direction:column;position:relative}
        .ds-head{font-family:var(--m);font-size:.8rem;font-weight:700;letter-spacing:.15em;color:#888;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center}
        .ds-val{font-family:var(--m);font-size:3.5rem;font-weight:900;line-height:1;margin-bottom:.5rem;color:var(--w);display:flex;align-items:flex-end;gap:.5rem}
        .ds-unit{font-size:1.2rem;color:#555;padding-bottom:.5rem}
        .ds-desc{font-size:.9rem;color:#aaa;line-height:1.6;max-width:85%}
        .ds-pill{font-size:.65rem;font-weight:800;padding:4px 8px;border-radius:2px;color:var(--w);background:#333;font-family:var(--m)}
        .ds-raw{margin-top:2.5rem;padding-top:1.5rem;border-top:1px dashed #222;display:flex;gap:1.5rem;font-family:var(--m);font-size:.7rem;color:#777}
        .ds-raw-item{display:flex;gap:.5rem}
        .ds-raw-val{color:#ccc}
        
        /* ZONE 2: BREAKING INTELLIGENCE */
        .z2{padding:2rem 0;background:var(--w);border-bottom:1px solid var(--b)}
        .z2h{margin-bottom:2rem;padding-bottom:.5rem;border-bottom:2px solid var(--t);display:flex;justify-content:space-between;align-items:flex-end}
        .z2t{font-family:var(--sf);font-weight:900;font-size:2rem;line-height:1}
        
        .hsg{display:grid;grid-template-columns:1.5fr 1fr;gap:3rem;margin-bottom:3rem}
        .hiw img{width:100%;max-width:100%;aspect-ratio:16/9;object-fit:cover}
        .htl{font-family:var(--sf);font-size:clamp(1.5rem,2.5vw,2.5rem);font-weight:900;line-height:1.1;margin:.5rem 0 1rem 0}
        .hsum{font-size:1rem;line-height:1.6;color:var(--ts)}
        .hceo{margin-top:2rem;padding:1.5rem;background:#F9F9F8;border-left:4px solid var(--t);box-shadow: 0 4px 15px rgba(0,0,0,0.03);position:relative;}
        .hceo::before{content:"[ C-LEVEL BRİFİNG ]";position:absolute;top:-12px;left:10px;background:#101112;color:#fff;font-family:var(--m);font-size:0.6rem;padding:2px 8px;letter-spacing:1px;font-weight:700;}
        .hceo ul{list-style:none;margin-top:.5rem;display:flex;flex-direction:column;gap:10px}
        .hceo li{font-size:.85rem;display:flex;gap:.5rem}
        .hceo li::before{content:"⚡";font-size:.8rem}
        
        .ngg{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem}
        .ngi{display:flex;flex-direction:column;gap:.6rem;border-top:1px solid var(--b);padding-top:1rem;transition:opacity .2s}
        .ngi:hover{opacity:.8}
        .ngt{font-weight:700;font-size:.95rem;line-height:1.3}

        /* ZONE 3: TRADE OPPORTUNITIES (Action Cards) */
        .z3{padding:2rem 0;background:var(--c);border-bottom:1px solid var(--b)}
        .opp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
        .opp-card{background:var(--w);border:1px solid var(--b);padding:1.5rem;display:flex;flex-direction:column;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);transition:transform .2s, box-shadow .2s;}
        .opp-card:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);border-color:var(--ts)}
        .opp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--b)}
        .opp-score{font-family:var(--m);font-size:1.4rem;font-weight:700;color:var(--a)}
        .opp-type{font-family:var(--m);font-size:.6rem;background:var(--bs);color:var(--w);padding:.2rem .5rem;}
        .opp-title{font-weight:800;font-size:1.1rem;line-height:1.2;margin-bottom:1rem}
        .opp-data{font-size:.8rem;color:var(--ts);margin-bottom:1.5rem;line-height:1.5}
        .opp-act{margin-top:auto;background:var(--g);padding:1rem;font-size:.8rem}
        .opp-act-title{font-weight:700;margin-bottom:.3rem;color:var(--bs)}
        .opp-btn{margin-top:1.5rem;width:100%;padding:.7rem;background:var(--bs);color:var(--w);text-align:center;font-weight:700;font-size:.8rem;text-transform:uppercase;cursor:pointer;border:none}

        /* TRADING FLOOR CSS (Alibaba + Bloomberg Melezi) */
        .tf-sec { background: linear-gradient(180deg, #111 0%, #0B0D0F 150px, #0B0D0F 100%); border-top: 1px solid #2A2A2A; border-bottom: 3px solid var(--t); padding: 4rem 0 2rem; }
        .tf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1a1a1a; }
        .tf-col { background: #0F1114; padding: 1.5rem; display: flex; flex-direction: column; min-height: 400px; }
        .tf-col .tf-item { background: #161920; border-color: #222; }
        .tf-col .tf-item:hover { background: #1C2029; border-color: #444; }
        .tf-col .tf-loc { color: #888; }
        .tf-col .tf-title { color: #E8E8E8; }
        .tf-col .tf-data-row { background: #0D0F12; color: #aaa; border-left-color: #555; }
        .tf-col .tf-score { background: #fff; color: #000; }
        .tf-see-all { display: block; text-align: center; padding: .7rem; margin-top: auto; font-family: var(--m); font-size: .7rem; font-weight: 700; color: #888; letter-spacing: .1em; text-transform: uppercase; border: 1px solid #222; background: transparent; cursor: pointer; transition: all .2s; }
        .tf-see-all:hover { background: #1a1a1a; color: #fff; border-color: #444; }
        .tf-header { display: flex; align-items: center; justify-content: space-between; font-family: var(--m); font-weight: 700; font-size: 1rem; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid #333; text-transform: uppercase; letter-spacing: 1px;}
        .tf-header.red { color: var(--re); border-bottom-color: var(--re); }
        .tf-header.green { color: var(--go); border-bottom-color: var(--go); }
        .tf-header.yellow { color: var(--wa); border-bottom-color: var(--wa); }
        .tf-header span:first-child { font-size: .85rem; }

        .tf-item { padding: 1.2rem; border: 1px solid var(--b); margin-bottom: 1rem; font-family: var(--s); display:flex; flex-direction:column; gap:0.6rem; position:relative; background:#FAFAF8; transition:all 0.2s;}
        .tf-item:hover { border-color: var(--t); background: #fff; transform:translateY(-2px); box-shadow:0 8px 15px rgba(0,0,0,0.05); }
        .tf-loc { font-family: var(--m); font-size: 0.8rem; color: var(--ts); display:flex; align-items:center; gap:0.5rem; }
        .tf-title { font-weight: 900; font-size: 1.25rem; line-height: 1.2; color: var(--t); }
        .tf-data-row { font-family: var(--m); font-size: 0.85rem; color: var(--t); display: flex; justify-content: space-between; background: var(--g); padding: 0.6rem; border-left:3px solid var(--ts);}
        .tf-score { position:absolute; top:1.2rem; right:1.2rem; background: var(--t); color: var(--w); font-family:var(--m); font-size:0.8rem; font-weight:700; padding:3px 8px; }
        .tf-btn { margin-top: .8rem; width: 100%; padding: 0.6rem; border: 1px solid #333; background: transparent; color: #ccc; font-family: var(--m); font-weight: 800; font-size: 0.7rem; cursor: pointer; text-transform: uppercase; transition: all 0.2s; letter-spacing:1px;}
        .tf-btn:hover { background: var(--t); color: var(--w); }
        .tf-btn.red:hover { background: var(--re); border-color:var(--re); }
        .tf-btn.green:hover { background: var(--go); border-color:var(--go); }
        .tf-btn.yellow:hover { background: var(--wa); border-color:var(--wa); }
        .opp-btn:hover{background:var(--a)}

        /* ZONE 4: GLOBAL RADAR MAP */
        .z4{padding:4rem 0 2rem;background:linear-gradient(180deg, inherit 0%, var(--bs) 100px, var(--bs) 100%);color:var(--w); border-top: 1px solid #2A2A2A;}
        .rm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#333;border:1px solid #333}
        .rm-cell{background:var(--bs);padding:1.5rem}
        .rm-head{font-family:var(--m);font-size:.7rem;font-weight:700;letter-spacing:.1em;border-bottom:1px solid #333;padding-bottom:1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
        .rm-signal{display:flex;gap:.5rem;margin-bottom:1rem;align-items:flex-start}
        .rm-dot{width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0}
        .rm-text{font-size:.8rem;line-height:1.4;color:#ccc}
        .rm-cat{font-family:var(--m);font-size:.55rem;color:#888;margin-bottom:.2rem;text-transform:uppercase}

        /* ZONE 0: MARKET REGIME BANNER */
        .z0-banner{background:var(--re);color:var(--w);padding:.5rem 1rem;font-family:var(--m);font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;display:flex;justify-content:center;align-items:center;gap:1rem;}
        .z0-banner.neutral{background:var(--ts)}
        .z0-banner.risk_on{background:var(--go)}

        /* LAYERS (OVERLAYS) */
        .layer-title{font-family:var(--m);font-weight:700;font-size:.7rem;letter-spacing:.1em;border-bottom:1px solid var(--b);padding-bottom:.5rem;margin-bottom:1rem;margin-top:3rem;text-transform:uppercase}
        
        @keyframes fadeCycle { 0% { opacity: 0; transform: translateY(3px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-3px); } }
        .z0-headline { animation: fadeCycle 5s infinite; display: inline-block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75vw; vertical-align: bottom; }
        .z0-banner { display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden; white-space: nowrap; }
        
        .layer-fairs{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:1rem}
        .layer-fairs-card{background:var(--w);border:1px solid var(--b);padding:1.5rem;display:flex;flex-direction:column}
        .layer-fairs-card-days{font-family:var(--m);font-size:1.8rem;font-weight:900;color:var(--re);margin-bottom:.5rem;line-height:1}
        
        .layer-academy{display:grid;grid-template-columns:repeat(2,1fr);gap:2rem;margin-top:1rem}
        .layer-academy-card{background:var(--c);border:1px solid var(--b);padding:2rem}
        .layer-academy-card h3{font-family:var(--sf);font-weight:900;font-size:1.4rem;margin:.5rem 0 1rem;line-height:1.2}

        /* EXTRA */
        .fr{padding:2rem 0;background:var(--c);border-top:1px solid var(--b)}
        .ft{padding:2rem 0;background:var(--w);text-align:center;border-top:1px solid var(--b)}
        
        @media(max-width:1024px){.hsg{grid-template-columns:1fr}.opp-grid{grid-template-columns:repeat(2,1fr)}.rm-grid,.layer-fairs{grid-template-columns:repeat(2,1fr)}.layer-academy{grid-template-columns:1fr;}.tf-grid{grid-template-columns:1fr!important}}
        @media(max-width:768px){.ngg,.opp-grid,.rm-grid,.ds-grid,.layer-fairs{grid-template-columns:1fr}.tf-grid{grid-template-columns:1fr!important}}
      `}} />

      {/* ZONE 1: LIVE MARKET STREAM (KOMPAKT SİNTETİK TİCKER) — REORDERED TO TOP */}
      <section className="z1">
        {finalTickerItems.length > 0 && <div className="tk"><IntelligenceTicker items={finalTickerItems}/></div>}
      </section>

      {/* NAV — ORTAK BAĞLANTI */}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />

      {/* ZONE 0: MARKET REGIME BANNER */}
      {activePriorityEngine?.market_regime && (
        <div className={`z0-banner ${String(activePriorityEngine.market_regime).toLowerCase()}`}>
          <span style={{background:'#000',color:'#fff',padding:'2px 6px',borderRadius:'2px',marginRight:'10px', flexShrink: 0}}>{HL.marketRegime}: {String(activePriorityEngine.market_regime).toUpperCase() === 'RISK_ON' ? HL.riskOn : String(activePriorityEngine.market_regime).toUpperCase() === 'RISK_OFF' ? HL.riskOff : HL.neutralRegime}</span>
          {z0Headlines[headlineIndex]?.href ? (
            <a href={z0Headlines[headlineIndex].href} key={headlineIndex} className="z0-headline" style={{color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px'}}>
              {z0Headlines[headlineIndex].text}
            </a>
          ) : (
            <span key={headlineIndex} className="z0-headline">{z0Headlines[headlineIndex]?.text}</span>
          )}
        </div>
      )}

      {/* ZONE 2: BREAKING INTELLIGENCE */}
      <section className="z2"><div className="tc">
        <div className="z2h" style={{ borderBottom: '3px solid var(--t)', paddingBottom: '1.2rem', marginBottom: '3rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div className="ml" style={{color:'var(--t)', marginBottom:'5px'}}><span className="live-dot"></span> {HL.sectorNetwork} • {new Date().toISOString().split('T')[0]}</div>
            <div className="z2t" style={{fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', letterSpacing:'-0.03em'}}>{HL.b2bPlatform}</div>
          </div>
          <div style={{display:'flex', alignItems:'center', background:'#FAFAF8', border:'1px solid var(--b)', padding:'0.5rem 1rem'}}>
            <div className="ml" style={{color:'var(--t)', display:'flex', alignItems:'center', gap:'6px'}}><span style={{color: 'green', fontSize: '1rem'}}>✅</span> {HL.liveData}</div>
          </div>
        </div>
        
        {hero && <div className="hsg">
          <a href={getLink(hero)} className="hiw" style={{position: 'relative'}}>
             {getImg(hero) ? (
                <img src={getImg(hero)} alt="" loading="lazy" /> 
             ) : (
                <div className="radar-box">
                  <div className="radar-content">
                    <span style={{fontSize:'3.5rem', marginBottom:'1.5rem', display:'block'}}>⚡</span>
                    <h3 style={{fontSize:'1.4rem', letterSpacing:'0.2em'}}>{HL.imageGenerating}</h3>
                    <p style={{fontSize:'0.75rem', color:'#4ADE80', marginTop:'1rem', letterSpacing:'0.1em'}}>{HL.imageProcessing}</p>
                  </div>
                </div>
             )}
             <div style={{position:'absolute', top:0, left:0, background:'var(--a)', color:'#fff', padding:'5px 12px', fontFamily:'var(--m)', fontSize:'0.75rem', fontWeight:800, letterSpacing:'1px', zIndex:20}}>📌 {HL.headline}</div>
          </a>
          <div>
            <div className="ml ma" style={{marginBottom:'.5rem'}}>{getCat(hero)}</div>
            <a href={getLink(hero)}><h1 className="htl">{getTitle(hero)}</h1></a>
            <p className="hsum">{getSummary(hero)}</p>
            {/* AI CEO Block + INSIGHT LAYER (Çift Uyumluluk) */}
            {(hero.ai_ceo_block || hero.insight) && <div className="hceo">
              <div className="ml" style={{color:'var(--ts)', marginBottom:'0.8rem'}}>{HL.ceoBriefLabel}</div>
              <ul>
                {hero.insight?.explanation 
                  ? <li>{hero.insight.explanation}</li>
                  : Array.isArray(hero.ai_ceo_block?.executive_summary) 
                    ? hero.ai_ceo_block.executive_summary.slice(0,3).map((li:string,i:number)=><li key={i}>{li}</li>)
                    : <li>{hero.ai_ceo_block?.executive_summary || HL.scanningTender}</li>}
              </ul>
              {hero.insight?.direction && <div style={{marginTop:'1.2rem',display:'flex',gap:'.8rem',alignItems:'center', borderTop:'1px dashed #E8E8E3', paddingTop:'1rem'}}>
                <span className="ds-pill" style={{background: hero.insight.direction === 'risk' ? 'var(--re)' : hero.insight.direction === 'opportunity' ? 'var(--go)' : '#3B82F6', padding:'6px 10px', fontSize:'0.75rem'}}>{HL.marketDirection}: {hero.insight.direction === 'risk' ? HL.dirRisk : hero.insight.direction === 'opportunity' ? HL.dirOpp : HL.dirNeutral}</span>
                <span style={{fontFamily:'var(--m)',fontSize:'.8rem',color:'var(--t)', fontWeight:700}}>{HL.aiImpactScore}: {hero.insight.market_impact_score}/100</span>
              </div>}
            </div>}

          </div>
        </div>}

        <div className="ngg">
          {newsGrid.map((a:any)=>(
            <a key={a.id} href={getLink(a)} className="ngi">
              {getImg(a) ? (
                 <img src={getImg(a)} alt="" loading="lazy" style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',marginBottom:'.5rem'}}/>
              ) : (
                 <div style={{width:'100%',aspectRatio:'16/9',marginBottom:'.5rem',background:'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                   <div style={{position:'absolute',inset:0,opacity:0.5,backgroundImage:'radial-gradient(#D1D5DB 1px, transparent 1px)',backgroundSize:'12px 12px'}}></div>
                   <div style={{position:'relative',zIndex:10,width:'40px',height:'4px',background:'#D1D5DB',borderRadius:'2px'}}></div>
                 </div>
              )}
              <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
                <div className="ml ma">{getCat(a)}</div>
                {a.insight?.direction && <span className="ds-pill" style={{background: a.insight.direction === 'risk' ? 'var(--re)' : a.insight.direction === 'opportunity' ? 'var(--go)' : '#3B82F6', fontSize:'.5rem', padding:'2px 5px'}}>{a.insight.direction === 'risk' ? HL.dirRisk : a.insight.direction === 'opportunity' ? HL.dirOpp : '—'}</span>}
              </div>
              <div className="ngt">{getTitle(a)}</div>
              {a.createdAt && <div style={{fontSize:'.75rem',color:'#999',marginBottom:'0.4rem'}}>{new Date(a.createdAt).toLocaleDateString(targetLang === 'EN' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
              <div style={{fontSize:'.85rem',color:'var(--ts)',lineHeight:1.4}}>{getSummary(a).substring(0,140)}{getSummary(a).length > 140 ? '...' : ''}</div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href={`${basePath}/news?lang=${lang}`} style={{ display: 'inline-block', padding: '1rem 3rem', background: '#111', color: '#FFF', fontWeight: 900, fontSize: '0.9rem', textDecoration: 'none', letterSpacing: '1px' }}>
            {targetLang === 'TR' ? 'TÜM HABERLER →' : HL.allNews}
          </a>
        </div>

        {/* LAYER: KNOWLEDGE & ACADEMY (Long Form Extension) */}
        {Array.isArray(academyArticles) && academyArticles.length > 0 && (
          <div style={{marginTop:'3rem'}}>
            <div className="layer-title">{HL.academyLayer}</div>
            <div className="layer-academy">
              {academyArticles.slice(0, 4).map((a:any, i:number)=>(
                <div className="layer-academy-card" key={i} style={{ padding: 0, overflow: 'hidden' }}>
                  {(a.image_url || (a.images && a.images[0])) && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderBottom: '1px solid var(--b)' }}>
                      <img src={a.image_url || a.images[0]} alt={getTitle(a)} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <div className="ml ma">{getCat(a)}</div>
                    <a href={getLink(a)}><h3 style={{ marginTop: '0.2rem', marginBottom: '0.8rem' }}>{getTitle(a)}</h3></a>
                    <p style={{fontSize:'.95rem',color:'var(--ts)',lineHeight:1.6}}>{getSummary(a).substring(0, 150)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div></section>

      {/* ZONE 1.5: THE TRADING FLOOR — CANLI VERİ (Bloomberg/Alibaba Hybrid) */}
      <section className="tf-sec">
        <div className="tc">
          <div className="z2h" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '1.5rem' }}>
            <div>
              <div className="ml" style={{color:'#888', marginBottom:'5px'}}><span className="live-dot" style={{background:'var(--wa)'}}></span> {HL.tradingActive}</div>
              <div className="z2t" style={{fontSize: 'clamp(1.3rem, 2vw, 2rem)', letterSpacing:'-0.03em', color:'#fff'}}>{HL.tradingFloor}</div>
            </div>
            <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
              {/* ═══ CANLI İHALE SAYACI ═══ */}
              <div style={{
                background: liveTenders.length > 0 ? 'var(--re)' : '#333', 
                padding:'.5rem 1.2rem', 
                fontFamily:'var(--m)', fontSize:'0.85rem', fontWeight:900, 
                color:'#fff', letterSpacing:'.05em',
                display:'flex', alignItems:'center', gap:'.5rem',
                animation: liveTenders.length > 0 ? 'pulse-live 2s infinite' : 'none'
              }}>
                <span style={{fontSize:'1.2rem', fontWeight:900}}>{liveTenders.length}</span> {HL.activeDeal}
              </div>
              <button 
                onClick={() => setLeadModal({ open: true, context: { type: 'BRIEFING', title: targetLang === 'TR' ? 'Haftalık CEO İstihbarat Brifing' : 'Weekly CEO Intelligence Briefing' } })}
                style={{background:'#3B82F6', border:'none', color:'#fff', padding:'.5rem 1rem', fontFamily:'var(--m)', fontSize:'.65rem', fontWeight:800, cursor:'pointer', letterSpacing:'.05em'}}
              >
                📊 {HL.ceoBriefing}
              </button>
            </div>
          </div>

          {/* ═══ PER-COLUMN COUNTS ═══ */}
          <div style={{display:'flex', gap:'2rem', marginBottom:'1rem', fontFamily:'var(--m)', fontSize:'.7rem', color:'#666'}}>
            <span>🔴 {tenderItems.length} {HL.tenders}</span>
            <span>🟢 {stockItems.length} {HL.stockOpp}</span>
            <span>🟡 {capacityItems.length} {HL.capacity}</span>
          </div>
          
          <div className="tf-grid">
            {/* COLUMN 1: İHALE AKIŞI — TÜM İHALELER */}
            <div className="tf-col">
              <div className="tf-header red">
                <span>🔴 {HL.tenderFlow} ({tenderItems.length})</span>
                <span>LIVE</span>
              </div>

              {tenderItems.slice(0, 4).map((t: any) => (
                <div className="tf-item" key={t.id}>
                  {t.score && <div className="tf-score">SKOR: {t.score}</div>}
                  <div className="tf-loc">{t.location}</div>
                  <div className="tf-title">{t.title}</div>
                  <div className="tf-data-row"><span>{t.detail_key || 'Detay:'}</span> <span>{t.detail_value || '—'}</span></div>
                  <button className="tf-btn red" onClick={() => setLeadModal({ open: true, context: { type: 'TENDER', title: t.title, location: t.location, score: t.score } })}>
                    {t.action_text || (targetLang === 'TR' ? '→ İHALEYİ İNCELE' : '→ VIEW TENDER')}
                  </button>
                </div>
              ))}

              {tenderItems.length === 0 && (
                <div style={{padding:'2rem', textAlign:'center', color:'#555', fontFamily:'var(--m)', fontSize:'.75rem'}}>
                  {HL.scanningTender}
                </div>
              )}
            </div>

            {/* COLUMN 2: SICAK STOK — TÜM STOKLAR */}
            <div className="tf-col">
              <div className="tf-header green">
                <span>🟢 {HL.hotStock} ({stockItems.length})</span>
                <span>LIVE</span>
              </div>

              {stockItems.slice(0, 4).map((t: any) => (
                <div className="tf-item" key={t.id}>
                  {t.score && <div className="tf-score">SKOR: {t.score}</div>}
                  <div className="tf-loc">{t.location}</div>
                  <div className="tf-title">{t.title}</div>
                  <div className="tf-data-row" style={{borderLeftColor:'var(--go)'}}><span>{t.detail_key || 'Durum:'}</span> <span style={{color:'var(--go)', fontWeight:800}}>{t.detail_value || '—'}</span></div>
                  <button className="tf-btn green" onClick={() => setLeadModal({ open: true, context: { type: 'HOT_STOCK', title: t.title, location: t.location, score: t.score } })}>
                    {t.action_text || (targetLang === 'TR' ? '→ SATIN AL' : '→ PURCHASE')}
                  </button>
                </div>
              ))}

              {stockItems.length === 0 && (
                <div style={{padding:'2rem', textAlign:'center', color:'#555', fontFamily:'var(--m)', fontSize:'.75rem'}}>
                  {HL.scanningStock}
                </div>
              )}
            </div>

            {/* COLUMN 3: BOŞ KAPASİTE — TÜM KAPASİTELER */}
            <div className="tf-col">
              <div className="tf-header yellow">
                <span>🟡 {HL.freeCapacity} ({capacityItems.length})</span>
                <span>LIVE</span>
              </div>

              {capacityItems.slice(0, 4).map((t: any) => (
                <div className="tf-item" key={t.id}>
                  {t.score && <div className="tf-score">SKOR: {t.score}</div>}
                  <div className="tf-loc">{t.location}</div>
                  <div className="tf-title">{t.title}</div>
                  <div className="tf-data-row" style={{borderLeftColor:'var(--wa)'}}><span>{t.detail_key || 'Kapasite:'}</span> <span>{t.detail_value || '—'}</span></div>
                  <button className="tf-btn yellow" onClick={() => setLeadModal({ open: true, context: { type: 'CAPACITY', title: t.title, location: t.location, score: t.score } })}>
                    {t.action_text || (targetLang === 'TR' ? '→ ORTAKLIK KUR' : '→ COLLABORATE')}
                  </button>
                </div>
              ))}

              {capacityItems.length === 0 && (
                <div className="tf-item" style={{ background: 'rgba(234, 179, 8, 0.05)', borderColor: 'var(--wa)', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 1.5rem', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem' }}>🏭</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.05rem', fontFamily: 'var(--sf)', letterSpacing: '0.5px' }}>{HL.emptyCapTitle}</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem', lineHeight: 1.6, fontFamily: 'var(--m)' }}>
                    {HL.emptyCapDesc}
                  </div>
                  <a href={`${basePath}/register?lang=${lang}`} className="tf-btn yellow" style={{ textDecoration: 'none', width: '100%', marginTop: '0.5rem', fontWeight: 900 }}>
                    {HL.emptyCapBtn}
                  </a>
                </div>
              )}
            </div>
            
          </div>

          {/* ═══ TÜM İHALELERİ GÖR — FULL WIDTH CTA ═══ */}
          <a href={`${basePath}/tenders`} style={{textDecoration:'none'}}>
            <div style={{
              marginTop:'1.5rem', padding:'1rem', textAlign:'center',
              border:'1px solid #333', background:'linear-gradient(135deg, #161920 0%, #0F1114 100%)',
              cursor:'pointer', transition:'all .2s',
              display:'flex', justifyContent:'center', alignItems:'center', gap:'1rem',
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#F59E0B'; (e.currentTarget as HTMLElement).style.background = '#1C2029'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #161920 0%, #0F1114 100%)'; }}
            >
              <span style={{fontFamily:'var(--m)', fontSize:'.8rem', fontWeight:900, color:'var(--wa)', letterSpacing:'.1em'}}>
                {HL.seeAll.replace('→', `${liveTenders.length} →`)}
              </span>
              <span style={{fontFamily:'var(--m)', fontSize:'.65rem', color:'#666'}}>
                {HL.filter}
              </span>
            </div>
          </a>

        </div>
      </section>

      {/* ═══ LEAD CAPTURE MODAL ═══ */}
      <LeadCaptureModal
        isOpen={leadModal.open}
        onClose={() => setLeadModal({ open: false, context: { type: 'GENERAL' } })}
        context={leadModal.context}
        brandName={brandName}
      />
      

      {/* ZONE 3: TRADE OPPORTUNITIES */}
      <section className="z3"><div className="tc">
        <div className="z2h">
          <div className="z2t">{HL.oppEngine}</div>
          <div className="ml">{HL.actionCards}</div>
        </div>
        
        <div className="opp-grid">
          {tradeOpportunities.map((a:any)=>(
            <div className="opp-card" key={a.id}>
              <div className="opp-head">
                <div className="opp-type">{a.commercial_type?.replace(/_/g,' ') || HL.tradeSignal}</div>
                <div className="opp-score">{a.commercial_score || a.scoring?.commercial_score || 85}</div>
              </div>
              <a href={getLink(a)} className="opp-title">{getTitle(a)}</a>
              <div className="opp-data">
                <div><strong>{HL.targetAudience}:</strong> {a.target_audience || a.opportunity_card?.buyer_type || HL.targetAudience}</div>
                <div><strong>{HL.priorityLabel}:</strong> {a.opportunity_card?.urgency || ((a.insight?.market_impact_score || 0) > 65 ? HL.priorityHigh : HL.priorityNormal)}</div>
                {a.insight?.direction && <div style={{marginTop:'.3rem'}}><span className="ds-pill" style={{background: a.insight.direction === 'risk' ? 'var(--re)' : a.insight.direction === 'opportunity' ? 'var(--go)' : '#3B82F6'}}>{a.insight.direction === 'risk' ? HL.riskSignal : a.insight.direction === 'opportunity' ? HL.oppSignal : HL.neutralLabel}</span></div>}
              </div>
              <div className="opp-act">
                <div className="opp-act-title">{HL.actionPlan}:</div>
                {a.action_layer?.manufacturer || a.action_layer?.retailer || a.opportunity_card?.action || HL.defaultAction}
              </div>
              <div style={{display:'flex', gap:'.5rem'}}>
                <a href={getLink(a)} style={{flex:1}}><button className="opp-btn" style={{width:'100%'}}>{HL.reviewIntel}</button></a>
                <button className="opp-btn" style={{flex:1, background:'var(--go)', borderColor:'var(--go)'}} onClick={() => setLeadModal({ open: true, context: { type: 'GENERAL', title: getTitle(a), location: a.target_audience || 'Global' } })}>
                  {HL.getOffer}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* LAYER: INDUSTRY EVENTS (Opportunity Extension) */}
        {Array.isArray(activeFairs) && activeFairs.length > 0 && (
          <div style={{marginTop:'3rem'}}>
            <div className="layer-title">{HL.fairLayer}</div>
            <div className="layer-fairs">
              {activeFairs.map((fair:any, i:number)=>(
                <div className="layer-fairs-card" key={i}>
                  <div className="layer-fairs-card-days">{fair.daysLeft < 0 ? HL.fairPassed : fair.daysLeft === 0 ? HL.fairToday : `${fair.daysLeft} ${HL.fairDays}`}</div>
                  <div style={{fontWeight:800, fontSize:'1.1rem', marginBottom:'.5rem'}}>{fair.name}</div>
                  <div style={{fontSize:'.8rem', color:'var(--ts)', fontFamily:'var(--m)'}}>{fair.location} | {fair.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div></section>

      {/* ZONE 4: GLOBAL RADAR MAP */}
      <section className="z4"><div className="tc">
        <div className="z2h" style={{borderColor:'#333'}}>
          <div className="z2t" style={{color:'#fff'}}>{HL.signalMap}</div>
          <div className="ml" style={{color:'#888'}}>{HL.activeSignals}</div>
        </div>

        {activeUzakDogu?.status && (
          <div style={{background:'#111', border:'1px solid #333', padding:'1rem', marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
              <span style={{fontSize:'1.5rem'}}>🏮</span>
              <div>
                <div style={{fontFamily:'var(--m)', fontSize:'.7rem', color:'#888'}}>{HL.asiaIndex}</div>
                <div style={{fontWeight:700, fontSize:'1.1rem'}}>{activeUzakDogu.message || 'Hammadde piyasası hareketli'}</div>
              </div>
            </div>
            <div style={{fontFamily:'var(--m)', fontSize:'.8rem', backgroundColor:'var(--re)', padding:'4px 8px', fontWeight:900}}>{activeUzakDogu.status}</div>
          </div>
        )}
        
        <div className="rm-grid">
          {regionKeys.map((region, idx) => {
            const items = regionArticles[region];
            const emojies = ['🌏','🇪🇺','🌎','🌍'];
            const regionNames: Record<string, string> = { ASIA: HL.regionAsia, EUROPE: HL.regionEurope, AMERICAS: HL.regionAmericas, MENA: HL.regionMena };
            return (
              <div className="rm-cell" key={region}>
                <div className="rm-head">{emojies[idx]} {regionNames[region] || region}</div>
                <div>
                  {items.slice(0,4).map((a:any, i:number) => {
                    const isRisk = a.title?.toLowerCase().includes('risk') || a.commercial_type === 'supply_gap';
                    const isOpp = a.commercial_score > 75;
                    const dotColor = isRisk ? 'var(--re)' : isOpp ? 'var(--go)' : 'var(--wa)';
                    return (
                      <a href={getLink(a)} className="rm-signal" key={i}>
                        <div className="rm-dot" style={{background:dotColor}} />
                        <div>
                          <div className="rm-cat">{getCat(a)}</div>
                          <div className="rm-text">{getTitle(a)}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div></section>

      {/* ORTAK KURUMSAL FOOTER EKLENDİ */}
      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />

    </div>
  );
}

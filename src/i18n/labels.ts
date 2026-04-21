/**
 * ═══════════════════════════════════════════════════════
 * TRTEX MERKEZİ DİL MOTORU (8-Dil Otonom Çeviri Sistemi)
 * ═══════════════════════════════════════════════════════
 * 
 * Tek kaynak, tek fonksiyon: t(key, lang)
 * 
 * Kullanım:
 *   import { t } from '@/i18n/labels';
 *   t('news', 'de')  → "NACHRICHTEN"
 *   t('allNews', 'fr') → "TOUTES LES ACTUALITÉS →"
 * 
 * KURAL: Yeni etiket eklenirken 8 dilin TAMAMI eklenecek.
 * Fallback sırası: istenen dil → EN → TR
 */

type LangCode = 'tr' | 'en' | 'de' | 'ru' | 'zh' | 'ar' | 'es' | 'fr';

const labels: Record<string, Record<LangCode, string>> = {

  // ═══ NAV ETİKETLERİ ═══
  news:       { tr: 'HABERLER',   en: 'NEWS',           de: 'NACHRICHTEN',      ru: 'НОВОСТИ',     zh: '新闻',   ar: 'أخبار',      es: 'NOTICIAS',       fr: 'ACTUALITÉS'         },
  tenders:    { tr: 'İHALELER',   en: 'TENDERS',        de: 'AUSSCHREIBUNGEN',  ru: 'ТЕНДЕРЫ',     zh: '招标',   ar: 'مناقصات',    es: 'LICITACIONES',   fr: "APPELS D'OFFRES"    },
  trade:      { tr: 'TİCARET',    en: 'TRADE',          de: 'HANDEL',           ru: 'ТОРГОВЛЯ',    zh: '贸易',   ar: 'تجارة',      es: 'COMERCIO',       fr: 'COMMERCE'           },
  academy:    { tr: 'AKADEMİ',    en: 'ACADEMY',        de: 'AKADEMIE',         ru: 'АКАДЕМИЯ',    zh: '学院',   ar: 'أكاديمية',   es: 'ACADEMIA',       fr: 'ACADÉMIE'           },

  // ═══ NAV ALT MENÜ ═══
  latestNews:  { tr: 'Son Haberler',         en: 'Latest News',            de: 'Aktuelle Nachrichten',    ru: 'Последние Новости',    zh: '最新新闻',     ar: 'آخر الأخبار',       es: 'Últimas Noticias',       fr: 'Dernières Nouvelles'    },
  worldRadar:  { tr: 'Dünya Radarı',         en: 'World Radar',            de: 'Welt-Radar',              ru: 'Мировой Радар',        zh: '世界雷达',     ar: 'رادار عالمي',        es: 'Radar Mundial',          fr: 'Radar Mondial'          },
  analysis:    { tr: 'Pazar Analizi',         en: 'Market Analysis',        de: 'Marktanalyse',            ru: 'Анализ Рынка',         zh: '市场分析',     ar: 'تحليل السوق',       es: 'Análisis de Mercado',    fr: 'Analyse de Marché'      },
  liveTenders: { tr: 'Canlı İhaleler',        en: 'Live Tenders',           de: 'Aktive Ausschreibungen',  ru: 'Активные Тендеры',     zh: '活跃招标',     ar: 'مناقصات نشطة',      es: 'Licitaciones Activas',   fr: 'Appels Actifs'          },
  stockDeals:  { tr: 'Stok Fırsatları',       en: 'Stock Deals',            de: 'Lagerangebote',           ru: 'Складские Предложения',zh: '库存优惠',     ar: 'عروض المخزون',      es: 'Ofertas de Stock',       fr: 'Offres de Stock'        },
  capacity:    { tr: 'Boş Kapasite',          en: 'Available Capacity',     de: 'Freie Kapazitäten',       ru: 'Свободные Мощности',   zh: '闲置产能',     ar: 'طاقة متاحة',        es: 'Capacidad Disponible',   fr: 'Capacité Disponible'    },
  opportunities:{ tr: 'Ticari Fırsatlar',     en: 'Trade Opportunities',    de: 'Handelschancen',          ru: 'Торговые Возможности', zh: '贸易机会',     ar: 'فرص تجارية',        es: 'Oportunidades',          fr: 'Opportunités'           },
  supplyGuide: { tr: 'Tedarik Rehberi',       en: 'Supplier Guide',         de: 'Lieferantenführer',       ru: 'Справочник Поставщиков',zh: '供应商指南',   ar: 'دليل الموردين',     es: 'Guía de Proveedores',    fr: 'Guide Fournisseurs'     },
  training:    { tr: 'Sektör Eğitimi',        en: 'Industry Training',      de: 'Branchenausbildung',      ru: 'Отраслевое Обучение',  zh: '行业培训',     ar: 'تدريب القطاع',      es: 'Formación Sectorial',    fr: 'Formation Sectorielle'  },
  fairCalendar:{ tr: 'Fuar Takvimi',          en: 'Fair Calendar',          de: 'Messekalender',           ru: 'Календарь Выставок',   zh: '展会日历',     ar: 'تقويم المعارض',     es: 'Calendario de Ferias',   fr: 'Calendrier des Salons'  },

  // ═══ HABER SAYFASI ═══
  latest:       { tr: '🔥 SON GELİŞMELER',     en: '🔥 LATEST UPDATES',       de: '🔥 AKTUELLE ENTWICKLUNGEN', ru: '🔥 ПОСЛЕДНИЕ ОБНОВЛЕНИЯ', zh: '🔥 最新动态',  ar: '🔥 آخر التطورات',    es: '🔥 ÚLTIMAS NOVEDADES',   fr: '🔥 DERNIÈRES NOUVELLES' },
  archivePage:  { tr: 'ARŞİV — SAYFA',          en: 'ARCHIVE — PAGE',          de: 'ARCHIV — SEITE',            ru: 'АРХИВ — СТРАНИЦА',        zh: '存档 — 页面',  ar: 'الأرشيف — صفحة',     es: 'ARCHIVO — PÁGINA',       fr: 'ARCHIVE — PAGE'         },
  backToHome:   { tr: '← ANA EKRANA DÖN',       en: '← BACK TO HOME',         de: '← ZURÜCK',                  ru: '← НА ГЛАВНУЮ',           zh: '← 返回首页',   ar: '← العودة',           es: '← VOLVER AL INICIO',    fr: '← RETOUR'               },
  noData:       { tr: 'Daha fazla veri bulunamadı.', en: 'No more data found.', de: 'Keine weiteren Daten gefunden.', ru: 'Больше данных не найдено.', zh: '没有更多数据。', ar: 'لم يتم العثور على مزيد من البيانات.', es: 'No se encontraron más datos.', fr: 'Aucune donnée supplémentaire trouvée.' },
  prev:         { tr: 'Önceki',                  en: 'Previous',                de: 'Vorherige',                 ru: 'Предыдущая',              zh: '上一页',       ar: 'السابق',             es: 'Anterior',               fr: 'Précédent'              },
  next:         { tr: 'Sonraki →',               en: 'Next →',                  de: 'Nächste →',                 ru: 'Следующая →',             zh: '下一页 →',     ar: 'التالي →',           es: 'Siguiente →',            fr: 'Suivant →'              },
  allNews:      { tr: 'TÜM HABERLER →',          en: 'ALL NEWS →',              de: 'ALLE NACHRICHTEN →',        ru: 'ВСЕ НОВОСТИ →',           zh: '所有新闻 →',   ar: 'جميع الأخبار →',    es: 'TODAS LAS NOTICIAS →',   fr: 'TOUTES LES ACTUALITÉS →'},

  // ═══ ANA SAYFA ZONE ETİKETLERİ ═══
  sectorNetwork: { tr: 'SEKTÖREL VERİ AĞI',               en: 'SECTOR DATA NETWORK',               de: 'BRANCHENDATENNETZ',                ru: 'ОТРАСЛЕВАЯ СЕТЬ ДАННЫХ',     zh: '行业数据网络',       ar: 'شبكة بيانات القطاع',           es: 'RED DE DATOS SECTORIAL',                 fr: 'RÉSEAU DE DONNÉES SECTORIEL'          },
  b2bPlatform:   { tr: 'B2B EV TEKSTİLİ TİCARET PLATFORMU',en: 'B2B HOME TEXTILE TRADE PLATFORM',  de: 'B2B HEIMTEXTIL-HANDELSPLATTFORM',  ru: 'B2B ПЛАТФОРМА ДОМАШНЕГО ТЕКСТИЛЯ',zh: 'B2B家纺贸易平台', ar: 'منصة تجارة المنسوجات المنزلية B2B',es: 'PLATAFORMA DE COMERCIO B2B TEXTIL HOGAR',fr: 'PLATEFORME DE COMMERCE B2B TEXTILE MAISON'},
  liveData:      { tr: 'CANLI VERİ AKIŞI',                 en: 'LIVE DATA FEED',                    de: 'LIVE DATENFEED',                   ru: 'ПОТОК ДАННЫХ',               zh: '实时数据',           ar: 'تدفق البيانات المباشر',        es: 'DATOS EN VIVO',                          fr: 'FLUX DE DONNÉES EN DIRECT'            },
  headline:      { tr: 'GÜNÜN MANŞETİ',                    en: "TODAY'S HEADLINE",                  de: 'SCHLAGZEILE DES TAGES',            ru: 'ЗАГОЛОВОК ДНЯ',              zh: '今日头条',           ar: 'عنوان اليوم',                  es: 'TITULAR DEL DÍA',                        fr: 'TITRE DU JOUR'                        },

  // ═══ TRADING FLOOR ═══
  tradingFloor:  { tr: 'B2B TİCARET TERMİNALİ',    en: 'B2B TRADING TERMINAL',     de: 'B2B HANDELSTERMINAL',      ru: 'B2B ТОРГОВЫЙ ТЕРМИНАЛ',   zh: 'B2B交易终端',    ar: 'محطة تداول B2B',        es: 'TERMINAL DE COMERCIO B2B',  fr: 'TERMINAL DE COMMERCE B2B'   },
  tradingActive: { tr: 'TRTEX TİCARET AĞI DEVREDE', en: 'TRTEX TRADING NETWORK ACTIVE',de: 'TRTEX HANDELSNETZ AKTIV',ru: 'ТОРГОВАЯ СЕТЬ TRTEX АКТИВНА',zh: 'TRTEX交易网络活跃',ar: 'شبكة تداول TRTEX نشطة', es: 'RED DE COMERCIO TRTEX ACTIVA',fr: 'RÉSEAU DE COMMERCE TRTEX ACTIF'},
  activeDeal:    { tr: 'AKTİF FIRSAT',              en: 'ACTIVE DEAL',              de: 'AKTIVES ANGEBOT',          ru: 'АКТИВНАЯ СДЕЛКА',        zh: '活跃交易',       ar: 'صفقة نشطة',            es: 'OFERTA ACTIVA',             fr: 'OFFRE ACTIVE'               },
  ceoBriefing:   { tr: 'CEO BRİFİNG AL',            en: 'GET CEO BRIEFING',         de: 'CEO-BRIEFING ERHALTEN',    ru: 'ПОЛУЧИТЬ БРИФИНГ',       zh: '获取CEO简报',    ar: 'احصل على إحاطة CEO',   es: 'OBTENER BRIEFING CEO',      fr: 'OBTENIR BRIEFING CEO'       },
  tenderFlow:    { tr: 'İHALE AKIŞI',               en: 'TENDER FLOW',              de: 'AUSSCHREIBUNGEN',          ru: 'ТЕНДЕРЫ',                zh: '招标流',         ar: 'تدفق المناقصات',       es: 'FLUJO DE LICITACIONES',     fr: "FLUX D'APPELS D'OFFRES"     },
  hotStock:      { tr: 'SICAK STOK',                en: 'HOT STOCK',                de: 'HEISSES LAGER',            ru: 'ГОРЯЧИЙ СКЛАД',          zh: '热门库存',       ar: 'مخزون ساخن',           es: 'STOCK CALIENTE',            fr: 'STOCK CHAUD'                },
  freeCapacity:  { tr: 'BOŞ KAPASİTE',              en: 'AVAILABLE CAPACITY',       de: 'FREIE KAPAZITÄT',          ru: 'СВОБОДНЫЕ МОЩНОСТИ',     zh: '空闲产能',       ar: 'طاقة متاحة',           es: 'CAPACIDAD DISPONIBLE',      fr: 'CAPACITÉ DISPONIBLE'        },

  // ═══ FIRSAT MOTORU ═══
  oppEngine:    { tr: 'FIRSAT MOTORU',       en: 'OPPORTUNITY ENGINE',    de: 'CHANCEN-ENGINE',        ru: 'ДВИГАТЕЛЬ ВОЗМОЖНОСТЕЙ',zh: '机会引擎',       ar: 'محرك الفرص',          es: 'MOTOR DE OPORTUNIDADES',    fr: "MOTEUR D'OPPORTUNITÉS"      },
  actionCards:  { tr: 'AKSİYON KARTLARI',    en: 'ACTION CARDS',          de: 'AKTIONSKARTEN',         ru: 'КАРТОЧКИ ДЕЙСТВИЙ',     zh: '行动卡',         ar: 'بطاقات الإجراء',      es: 'TARJETAS DE ACCIÓN',        fr: "CARTES D'ACTION"            },
  actionPlan:   { tr: 'Aksiyon Planı',        en: 'Action Plan',           de: 'Aktionsplan',           ru: 'План действий',         zh: '行动计划',       ar: 'خطة العمل',           es: 'Plan de Acción',            fr: "Plan d'Action"              },
  reviewIntel:  { tr: 'İstihbaratı İncele',   en: 'Review Intelligence',   de: 'Intelligence prüfen',   ru: 'Изучить разведку',      zh: '查看情报',       ar: 'مراجعة الاستخبارات',  es: 'Revisar Inteligencia',      fr: 'Examiner Intelligence'      },
  getOffer:     { tr: 'TEKLİF AL',            en: 'GET OFFER',             de: 'ANGEBOT ERHALTEN',      ru: 'ПОЛУЧИТЬ ПРЕДЛОЖЕНИЕ',  zh: '获取报价',       ar: 'احصل على عرض',        es: 'OBTENER OFERTA',            fr: 'OBTENIR UNE OFFRE'          },

  // ═══ RADAR & FUAR ═══
  signalMap:     { tr: 'GLOBAL SİNYAL HARİTASI',    en: 'GLOBAL SIGNAL MAP',       de: 'GLOBALE SIGNALKARTE',           ru: 'ГЛОБАЛЬНАЯ КАРТА СИГНАЛОВ',  zh: '全球信号地图',     ar: 'خريطة الإشارات العالمية',  es: 'MAPA DE SEÑALES GLOBALES',       fr: 'CARTE DES SIGNAUX MONDIAUX'       },
  activeSignals: { tr: 'AKTİF SİNYALLER',           en: 'ACTIVE SIGNALS',          de: 'AKTIVE SIGNALE',                ru: 'АКТИВНЫЕ СИГНАЛЫ',           zh: '活跃信号',         ar: 'إشارات نشطة',             es: 'SEÑALES ACTIVAS',                fr: 'SIGNAUX ACTIFS'                   },
  fairLayer:     { tr: 'ETKİNLİK KATMANI: SEKTÖR FUAR TAKVİMİ', en: 'EVENT LAYER: INDUSTRY FAIR CALENDAR', de: 'EVENT-EBENE: MESSEKALENDER', ru: 'СЛОЙ СОБЫТИЙ: КАЛЕНДАРЬ ВЫСТАВОК', zh: '活动层：行业展会日历', ar: 'طبقة الأحداث: تقويم المعارض', es: 'CAPA DE EVENTOS: CALENDARIO DE FERIAS', fr: 'COUCHE ÉVÉNEMENTS : CALENDRIER DES SALONS' },
  academyLayer:  { tr: 'BİLGİ KATMANI: AKADEMİ',    en: 'KNOWLEDGE LAYER: ACADEMY', de: 'WISSENSEBENE: AKADEMIE',        ru: 'УРОВЕНЬ ЗНАНИЙ: АКАДЕМИЯ',   zh: '知识层：学院',     ar: 'طبقة المعرفة: الأكاديمية', es: 'CAPA DE CONOCIMIENTO: ACADEMIA', fr: 'COUCHE CONNAISSANCE : ACADÉMIE'   },

  // ═══ FOOTER ═══
  platforms:    { tr: 'PLATFORMLAR',   en: 'PLATFORMS',    de: 'PLATTFORMEN',    ru: 'ПЛАТФОРМЫ',    zh: '平台',   ar: 'المنصات',     es: 'PLATAFORMAS',   fr: 'PLATEFORMES'    },
  resources:    { tr: 'KAYNAKLAR',     en: 'RESOURCES',    de: 'RESSOURCEN',     ru: 'РЕСУРСЫ',      zh: '资源',   ar: 'الموارد',     es: 'RECURSOS',      fr: 'RESSOURCES'     },
  legal:        { tr: 'YASAL',         en: 'LEGAL',        de: 'RECHTLICHES',    ru: 'ПРАВОВАЯ',     zh: '法律',   ar: 'قانوني',      es: 'LEGAL',         fr: 'JURIDIQUE'      },
  newsArchive:  { tr: 'Haber Arşivi',  en: 'News Archive', de: 'Nachrichtenarchiv',ru: 'Архив Новостей',zh: '新闻存档',ar: 'أرشيف الأخبار',es: 'Archivo de Noticias',fr: 'Archives des Actualités' },
  terminal:     { tr: 'Piyasa Terminali',en: 'Market Terminal',de: 'Marktterminal',ru: 'Рыночный Терминал',zh: '市场终端',ar: 'محطة السوق', es: 'Terminal de Mercado',fr: 'Terminal de Marché'      },
  privacy:      { tr: 'Gizlilik Politikası',en: 'Privacy Policy',de: 'Datenschutz',ru: 'Политика Конфиденциальности',zh: '隐私政策',ar: 'سياسة الخصوصية',es: 'Política de Privacidad',fr: 'Politique de Confidentialité' },
  terms:        { tr: 'Kullanım Koşulları',en: 'Terms of Use',de: 'Nutzungsbedingungen',ru: 'Условия Использования',zh: '使用条款',ar: 'شروط الاستخدام',es: 'Términos de Uso',fr: "Conditions d'Utilisation" },

  // ═══ GENEL ═══
  register:     { tr: 'Ücretsiz Kayıt',       en: 'Free Sign Up',            de: 'Kostenlos Registrieren',     ru: 'Регистрация',          zh: '免费注册',     ar: 'تسجيل مجاني',           es: 'Registro Gratis',            fr: 'Inscription Gratuite'       },
  language:     { tr: 'DİL',                   en: 'LANGUAGE',                de: 'SPRACHE',                    ru: 'ЯЗЫК',                 zh: '语言',         ar: 'اللغة',                  es: 'IDIOMA',                     fr: 'LANGUE'                     },

  // ═══ ALT SAYFA ETİKETLERİ ═══
  industryAcademy:     { tr: 'SEKTÖR AKADEMİSİ',         en: 'INDUSTRY ACADEMY',             de: 'BRANCHENAKADEMIE',               ru: 'ОТРАСЛЕВАЯ АКАДЕМИЯ',         zh: '行业学院',       ar: 'أكاديمية القطاع',         es: 'ACADEMIA SECTORIAL',            fr: 'ACADÉMIE SECTORIELLE'          },
  industryAcademyDesc: { tr: 'Global B2B pazar dinamikleri, eğitim materyalleri ve makro analiz raporları.', en: 'Global B2B market dynamics, training materials, and macro analysis reports.', de: 'Globale B2B-Marktdynamik, Schulungsmaterialien und Makroanalyseberichte.', ru: 'Глобальная динамика B2B-рынка, учебные материалы и макроаналитические отчёты.', zh: '全球B2B市场动态、培训材料和宏观分析报告。', ar: 'ديناميكيات سوق B2B العالمية ومواد التدريب وتقارير التحليل الكلي.', es: 'Dinámica del mercado B2B global, materiales de formación e informes de análisis macro.', fr: 'Dynamique du marché B2B mondial, matériaux de formation et rapports d\'analyse macro.' },
  noAcademyContent:    { tr: 'İncelenecek akademi içeriği bulunamadı.', en: 'No academy content found.', de: 'Keine Akademie-Inhalte gefunden.', ru: 'Академический контент не найден.', zh: '未找到学院内容。', ar: 'لم يتم العثور على محتوى أكاديمي.', es: 'No se encontró contenido académico.', fr: 'Aucun contenu académique trouvé.' },
  analysisTrend:       { tr: 'ANALİZ & TREND', en: 'ANALYSIS & TREND', de: 'ANALYSE & TREND', ru: 'АНАЛИЗ И ТРЕНД', zh: '分析与趋势', ar: 'تحليل واتجاه', es: 'ANÁLISIS Y TENDENCIA', fr: 'ANALYSE & TENDANCE' },

  liveTenders:         { tr: 'Canlı İhale & Ticaret Fırsatları', en: 'Live Tender & Trade Opportunities', de: 'Live-Ausschreibungen & Handelsmöglichkeiten', ru: 'Живые Тендеры и Торговые Возможности', zh: '实时招标与贸易机会', ar: 'مناقصات حية وفرص تجارية', es: 'Licitaciones en Vivo y Oportunidades Comerciales', fr: 'Appels d\'Offres en Direct & Opportunités Commerciales' },
  tendersDesc:         { tr: 'Küresel ev tekstili ihaleleri ve ticaret fırsatlarını otonom sistemimizle takip edin.', en: 'Follow global home textile tenders and trade opportunities with our autonomous system.', de: 'Verfolgen Sie globale Heimtextilausschreibungen und Geschäftsmöglichkeiten mit unserem System.', ru: 'Следите за глобальными тендерами и торговыми возможностями с нашей системой.', zh: '通过我们的系统跟踪全球家纺招标和贸易机会。', ar: 'تابع مناقصات المنسوجات المنزلية العالمية وفرص التجارة مع نظامنا.', es: 'Siga las licitaciones textiles y oportunidades comerciales globales usando nuestro sistema.', fr: 'Suivez les appels d\'offres textiles et les opportunités commerciales mondiales.' },
  globalFairs:         { tr: 'KÜRESEL FUAR TAKVİMİ',     en: 'GLOBAL FAIRS CALENDAR',        de: 'GLOBALER MESSEKALENDER',         ru: 'ГЛОБАЛЬНЫЙ КАЛЕНДАРЬ ВЫСТАВОК', zh: '全球展会日历',   ar: 'تقويم المعارض العالمية',   es: 'CALENDARIO GLOBAL DE FERIAS',   fr: 'CALENDRIER MONDIAL DES SALONS'  },
  globalFairsDesc:     { tr: 'AIPyram Otonom Tarama Motoru tarafından indekslenen B2B tekstil ve makine fuarları.', en: 'B2B textile and machinery fairs indexed by the AIPyram Autonomous Scanning Engine.', de: 'B2B-Textil- und Maschinenmessen, indexiert durch die AIPyram Autonomous Scanning Engine.', ru: 'B2B текстильные и машиностроительные выставки, индексированные AIPyram.', zh: 'AIPyram自主扫描引擎索引的B2B纺织和机械展览会。', ar: 'معارض B2B للنسيج والآلات مفهرسة بواسطة محرك المسح المستقل AIPyram.', es: 'Ferias B2B de textil y maquinaria indexadas por el motor AIPyram.', fr: 'Salons B2B textile et machinerie indexés par le moteur AIPyram.' },
  noFairContent:       { tr: 'İncelenecek fuar içeriği bulunamadı.', en: 'No fair content found.', de: 'Keine Messeinhalte gefunden.', ru: 'Содержание выставки не найдено.', zh: '未找到展会内容。', ar: 'لم يتم العثور على محتوى المعارض.', es: 'No se encontraron contenidos de ferias.', fr: 'Aucun contenu de salon trouvé.' },
  fairEvent:           { tr: 'FUAR / ETKİNLİK', en: 'FAIR / EVENT', de: 'MESSE / EVENT', ru: 'ВЫСТАВКА / СОБЫТИЕ', zh: '展会/活动', ar: 'معرض / حدث', es: 'FERIA / EVENTO', fr: 'SALON / ÉVÉNEMENT' },

  supplyDirectory:     { tr: 'TEDARİK REHBERİ',          en: 'SUPPLY DIRECTORY',              de: 'LIEFERANTENVERZEICHNIS',          ru: 'СПРАВОЧНИК ПОСТАВЩИКОВ',       zh: '供应商目录',     ar: 'دليل التوريد',            es: 'DIRECTORIO DE PROVEEDORES',     fr: 'RÉPERTOIRE DES FOURNISSEURS'    },
  supplyDesc:          { tr: 'Global üreticiler, iplik tedarikçileri ve kapasite raporları.', en: 'Global manufacturers, yarn suppliers, and capacity reports.', de: 'Globale Hersteller, Garnlieferanten und Kapazitätsberichte.', ru: 'Глобальные производители, поставщики пряжи и отчёты о мощностях.', zh: '全球制造商、纱线供应商和产能报告。', ar: 'المصنعون العالميون وموردو الخيوط وتقارير الطاقة الإنتاجية.', es: 'Fabricantes globales, proveedores de hilados e informes de capacidad.', fr: 'Fabricants mondiaux, fournisseurs de fils et rapports de capacité.' },
  supplierDbIndexing:  { tr: 'TEDARİKÇİ VERİTABANI İNDEKSLENİYOR', en: 'SUPPLIER DATABASE BEING INDEXED', de: 'LIEFERANTENDATENBANK WIRD INDEXIERT', ru: 'БАЗА ПОСТАВЩИКОВ ИНДЕКСИРУЕТСЯ', zh: '供应商数据库索引中', ar: 'جاري فهرسة قاعدة بيانات الموردين', es: 'BASE DE DATOS DE PROVEEDORES EN INDEXACIÓN', fr: 'BASE DE DONNÉES FOURNISSEURS EN COURS D\'INDEXATION' },
  supplierDbDesc:      { tr: 'Onaylanmış üretici ve tedarikçi profilleri küresel dizin sistemine işleniyor.', en: 'Verified manufacturer and supplier profiles are being integrated into the global directory system.', de: 'Verifizierte Hersteller- und Lieferantenprofile werden in das globale Verzeichnissystem integriert.', ru: 'Верифицированные профили производителей и поставщиков интегрируются в глобальную систему.', zh: '已验证的制造商和供应商资料正在整合到全球目录系统中。', ar: 'يتم دمج ملفات تعريف المصنعين والموردين المعتمدين في نظام الدليل العالمي.', es: 'Los perfiles verificados de fabricantes y proveedores se están integrando en el sistema de directorio global.', fr: 'Les profils vérifiés des fabricants et fournisseurs sont en cours d\'intégration.' },
  awaitingData:        { tr: 'GÜNCEL VERİLER BEKLENİYOR...', en: 'AWAITING CURRENT DATA...', de: 'AKTUELLE DATEN WERDEN ERWARTET...', ru: 'ОЖИДАНИЕ ДАННЫХ...', zh: '等待最新数据...', ar: 'في انتظار البيانات الحالية...', es: 'ESPERANDO DATOS ACTUALES...', fr: 'EN ATTENTE DE DONNÉES...' },

  tradeOpportunities:     { tr: 'ÖZEL TİCARET FIRSATLARI', en: 'EXCLUSIVE TRADE OPPORTUNITIES', de: 'EXKLUSIVE HANDELSCHANCEN', ru: 'ЭКСКЛЮЗИВНЫЕ ТОРГОВЫЕ ВОЗМОЖНОСТИ', zh: '独家贸易机会', ar: 'فرص تجارية حصرية', es: 'OPORTUNIDADES COMERCIALES EXCLUSIVAS', fr: 'OPPORTUNITÉS COMMERCIALES EXCLUSIVES' },
  tradeOpportunitiesDesc: { tr: 'Onaylı alıcılar ve satıcılar için TISF otonom eşleştirme motoru destekli yüksek niyetli ticaret havuzu.', en: 'High-intent commercial pool powered by the TISF autonomous matchmaking engine.', de: 'Hochintensiver Handelspool, unterstützt durch die autonome TISF-Matching-Engine.', ru: 'Пул коммерческих сделок с высоким намерением на базе TISF.', zh: 'TISF自主匹配引擎支持的高意向商业机会池。', ar: 'مجمع تجاري عالي النية مدعوم بمحرك المطابقة المستقل TISF.', es: 'Pool comercial de alta intención impulsado por el motor TISF.', fr: 'Pool commercial à haute intention alimenté par le moteur TISF.' },
  noTradeSignal:       { tr: 'Taranan ticaret sinyali bulunamadı.', en: 'No trade signal found.', de: 'Kein Handelssignal gefunden.', ru: 'Торговый сигнал не найден.', zh: '未找到贸易信号。', ar: 'لم يتم العثور على إشارة تجارية.', es: 'No se encontró señal comercial.', fr: 'Aucun signal commercial trouvé.' },
  reviewOpp:           { tr: 'Fırsatı İncele →', en: 'Review Opportunity →', de: 'Chance prüfen →', ru: 'Изучить возможность →', zh: '查看机会 →', ar: 'مراجعة الفرصة →', es: 'Revisar Oportunidad →', fr: 'Examiner l\'Opportunité →' },

  terminalLogin:       { tr: 'Terminal Girişi', en: 'Terminal Login', de: 'Terminal-Anmeldung', ru: 'Вход в Терминал', zh: '终端登录', ar: 'دخول المحطة', es: 'Acceso al Terminal', fr: 'Connexion Terminal' },
  loginDesc:           { tr: 'Kayıtlı e-posta adresiniz ile platforma giriş yapın.', en: 'Log in to the platform via your registered email.', de: 'Melden Sie sich mit Ihrer registrierten E-Mail an.', ru: 'Войдите на платформу через зарегистрированный email.', zh: '使用注册邮箱登录平台。', ar: 'قم بتسجيل الدخول عبر بريدك الإلكتروني المسجل.', es: 'Acceda a la plataforma con su correo registrado.', fr: 'Connectez-vous avec votre email enregistré.' },
  corporateEmail:      { tr: 'Kurumsal E-Posta', en: 'Corporate Email', de: 'Firmen-E-Mail', ru: 'Корпоративная Почта', zh: '企业邮箱', ar: 'البريد الإلكتروني للشركة', es: 'Correo Corporativo', fr: 'Email Professionnel' },
  password:            { tr: 'Şifre', en: 'Password', de: 'Passwort', ru: 'Пароль', zh: '密码', ar: 'كلمة المرور', es: 'Contraseña', fr: 'Mot de Passe' },
  forgotPassword:      { tr: 'Şifremi Unuttum', en: 'Forgot Password?', de: 'Passwort vergessen?', ru: 'Забыли пароль?', zh: '忘记密码？', ar: 'نسيت كلمة المرور؟', es: '¿Olvidó su contraseña?', fr: 'Mot de passe oublié ?' },
  accessTradeNet:      { tr: 'TİCARET AĞINA BAĞLAN', en: 'ACCESS TRADE NETWORK', de: 'HANDELSNETZ ZUGREIFEN', ru: 'ДОСТУП К ТОРГОВОЙ СЕТИ', zh: '访问贸易网络', ar: 'الوصول إلى شبكة التداول', es: 'ACCEDER A LA RED COMERCIAL', fr: 'ACCÉDER AU RÉSEAU COMMERCIAL' },
  noAccount:           { tr: 'Hesabınız yok mu?', en: "Don't have an account?", de: 'Noch kein Konto?', ru: 'Нет аккаунта?', zh: '没有账号？', ar: 'ليس لديك حساب؟', es: '¿No tiene cuenta?', fr: 'Pas de compte ?' },
  registerFree:        { tr: 'Ücretsiz Kayıt Olun', en: 'Register Free', de: 'Kostenlos registrieren', ru: 'Бесплатная регистрация', zh: '免费注册', ar: 'سجل مجاناً', es: 'Regístrese Gratis', fr: 'Inscription Gratuite' },
  hasAccount:          { tr: 'Zaten hesabınız var mı?', en: 'Already have an account?', de: 'Haben Sie bereits ein Konto?', ru: 'Уже есть аккаунт?', zh: '已有账号？', ar: 'هل لديك حساب؟', es: '¿Ya tiene cuenta?', fr: 'Déjà un compte ?' },
  login:               { tr: 'Giriş Yapın', en: 'Login', de: 'Anmelden', ru: 'Войти', zh: '登录', ar: 'تسجيل الدخول', es: 'Iniciar Sesión', fr: 'Se Connecter' },

  vipRegister:         { tr: 'VIP Ücretsiz Kayıt', en: 'VIP Free Registration', de: 'VIP Kostenlose Registrierung', ru: 'VIP Бесплатная Регистрация', zh: 'VIP免费注册', ar: 'تسجيل VIP مجاني', es: 'Registro VIP Gratuito', fr: 'Inscription VIP Gratuite' },
  vipRegisterDesc:     { tr: 'Global tekstil pazarı verilerine anında ulaşın.', en: 'Get instant access to global textile market data.', de: 'Sofortiger Zugang zu globalen Textilmarktdaten.', ru: 'Мгновенный доступ к данным мирового текстильного рынка.', zh: '即时获取全球纺织市场数据。', ar: 'احصل على وصول فوري لبيانات سوق النسيج العالمي.', es: 'Acceso instantáneo a datos del mercado textil global.', fr: 'Accès instantané aux données du marché textile mondial.' },
  fullName:            { tr: 'Ad Soyad', en: 'Full Name', de: 'Vollständiger Name', ru: 'ФИО', zh: '全名', ar: 'الاسم الكامل', es: 'Nombre Completo', fr: 'Nom Complet' },
  yourName:            { tr: 'İsminiz', en: 'Your name', de: 'Ihr Name', ru: 'Ваше имя', zh: '您的姓名', ar: 'اسمك', es: 'Su nombre', fr: 'Votre nom' },
  companyName:         { tr: 'Firma Adı', en: 'Company Name', de: 'Firmenname', ru: 'Название компании', zh: '公司名称', ar: 'اسم الشركة', es: 'Nombre de la Empresa', fr: "Nom de l'Entreprise" },
  companyTitle:        { tr: 'Firma unvanı', en: 'Company title', de: 'Firmentitel', ru: 'Название фирмы', zh: '公司名称', ar: 'عنوان الشركة', es: 'Título de la empresa', fr: "Titre de l'entreprise" },
  registerNow:         { tr: 'SİSTEME KAYIT OL', en: 'REGISTER NOW', de: 'JETZT REGISTRIEREN', ru: 'ЗАРЕГИСТРИРОВАТЬСЯ', zh: '立即注册', ar: 'سجل الآن', es: 'REGISTRARSE AHORA', fr: "S'INSCRIRE MAINTENANT" },

  privacyPolicy:       { tr: 'Gizlilik Politikası', en: 'Privacy Policy', de: 'Datenschutzrichtlinie', ru: 'Политика Конфиденциальности', zh: '隐私政策', ar: 'سياسة الخصوصية', es: 'Política de Privacidad', fr: 'Politique de Confidentialité' },
  privacyText:         { tr: 'TRTEX Intelligence Terminal olarak ziyaretçilerimizin gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz.', en: 'As TRTEX Intelligence Terminal, we attach great importance to the privacy of our visitors and the protection of their personal data.', de: 'Als TRTEX Intelligence Terminal legen wir großen Wert auf die Privatsphäre unserer Besucher.', ru: 'TRTEX Intelligence Terminal уделяет большое внимание конфиденциальности посетителей.', zh: '作为TRTEX情报终端，我们重视访客隐私和个人数据保护。', ar: 'نولي أهمية كبيرة لخصوصية زوارنا وحماية بياناتهم الشخصية.', es: 'Como TRTEX, damos gran importancia a la privacidad de nuestros visitantes.', fr: 'En tant que TRTEX, nous accordons une grande importance à la confidentialité de nos visiteurs.' },
  dataCollected:       { tr: '1. Toplanan Veriler', en: '1. Data Collected', de: '1. Erhobene Daten', ru: '1. Собираемые Данные', zh: '1. 收集的数据', ar: '1. البيانات المجمعة', es: '1. Datos Recopilados', fr: '1. Données Collectées' },
  dataCollectedText:   { tr: 'Sistemimiz sadece ticari istihbarat amaçlı kurumsal iletişim bilgileri izni kapsamında işler.', en: 'Our system only processes corporate contact profiles for commercial intelligence purposes under consent.', de: 'Unser System verarbeitet nur Firmenkontaktdaten für Commercial Intelligence.', ru: 'Наша система обрабатывает только корпоративные контактные данные.', zh: '我们的系统仅处理企业联系资料用于商业情报目的。', ar: 'يعالج نظامنا فقط ملفات الاتصال المؤسسي لأغراض الاستخبارات التجارية.', es: 'Nuestro sistema solo procesa perfiles de contacto corporativo.', fr: 'Notre système traite uniquement les profils de contact corporate.' },

  kvkkText:            { tr: '6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca, TRTEX platformu veri sorumlusu sıfatı ile...', en: 'In accordance with GDPR requirements, the TRTEX platform acts as a data controller...', de: 'Gemäß den DSGVO-Anforderungen fungiert TRTEX als Datenverantwortlicher...', ru: 'В соответствии с GDPR, платформа TRTEX выступает контролёром данных...', zh: '根据GDPR要求，TRTEX平台作为数据控制者...', ar: 'وفقاً لمتطلبات GDPR، تعمل منصة TRTEX كمتحكم في البيانات...', es: 'De acuerdo con los requisitos del RGPD, TRTEX actúa como responsable de datos...', fr: 'Conformément au RGPD, la plateforme TRTEX agit en tant que responsable du traitement...' },
  kvkkMatchmaking:     { tr: 'Otonom olarak çekilen kurumsal bilgileriniz sadece B2B ticaret ağında matchmaking işlemleri için analiz edilir.', en: 'Your autonomously gathered corporate data is analyzed only for B2B trade matchmaking.', de: 'Ihre autonom erfassten Firmendaten werden nur für B2B-Matchmaking analysiert.', ru: 'Автономно собранные корпоративные данные анализируются только для B2B-мэтчинга.', zh: '自主收集的企业数据仅用于B2B贸易匹配分析。', ar: 'يتم تحليل بياناتك المؤسسية المجمعة ذاتياً فقط لعمليات المطابقة التجارية B2B.', es: 'Sus datos corporativos recopilados autónomamente se analizan solo para matchmaking B2B.', fr: 'Vos données corporate collectées de manière autonome sont analysées uniquement pour le matchmaking B2B.' },

  termsOfUse:          { tr: 'Kullanım Koşulları', en: 'Terms of Use', de: 'Nutzungsbedingungen', ru: 'Условия Использования', zh: '使用条款', ar: 'شروط الاستخدام', es: 'Términos de Uso', fr: "Conditions d'Utilisation" },
  termsText:           { tr: 'TRTEX platformunu kullanarak Alpha/Beta sürümünde yer alan TRTEX Makine Öğrenmesi çıktılarının kesin yatırım tavsiyesi olmadığını kabul edersiniz.', en: 'By using the TRTEX platform, you agree that the TRTEX Machine Learning outputs in Alpha/Beta are not definitive investment and trade advice.', de: 'Durch die Nutzung der TRTEX-Plattform stimmen Sie zu, dass die ML-Outputs keine verbindliche Anlageberatung darstellen.', ru: 'Используя платформу TRTEX, вы соглашаетесь, что результаты ML не являются инвестиционными рекомендациями.', zh: '使用TRTEX平台即表示您同意Alpha/Beta版ML输出不构成投资建议。', ar: 'باستخدام منصة TRTEX، فإنك توافق على أن مخرجات التعلم الآلي في النسخة التجريبية ليست نصيحة استثمارية.', es: 'Al usar TRTEX, acepta que las salidas de ML en Alpha/Beta no son asesoramiento de inversión.', fr: 'En utilisant TRTEX, vous acceptez que les sorties ML en Alpha/Beta ne sont pas des conseils d\'investissement.' },
  disclaimer:          { tr: 'Sorumluluk Reddi', en: 'Disclaimer', de: 'Haftungsausschluss', ru: 'Отказ от ответственности', zh: '免责声明', ar: 'إخلاء المسؤولية', es: 'Descargo de Responsabilidad', fr: 'Avertissement' },
  disclaimerText:      { tr: 'TISF Network AI tarafından derlenen fiyat indeksleri doğadan otonom olarak toplanmaktadır.', en: 'Price indexes compiled by TISF Network AI are autonomously aggregated from nature.', de: 'Preisindizes, die von TISF Network AI zusammengestellt werden, werden autonom aggregiert.', ru: 'Ценовые индексы TISF Network AI собираются автономно.', zh: 'TISF网络AI编制的价格指数是自主汇总的。', ar: 'مؤشرات الأسعار التي جمعتها TISF Network AI يتم تجميعها بشكل مستقل.', es: 'Los índices de precios compilados por TISF Network AI se agregan de forma autónoma.', fr: 'Les indices de prix compilés par TISF Network AI sont agrégés de manière autonome.' },

  // ═══ ANA SAYFA L SÖZLÜĞÜ ═══
  impact:       { tr: 'ETKİ',          en: 'IMPACT',        de: 'WIRKUNG',        ru: 'ВЛИЯНИЕ',       zh: '影响',    ar: 'تأثير',        es: 'IMPACTO',       fr: 'IMPACT'          },
  density:      { tr: 'YOĞUNLUK',      en: 'DENSITY',       de: 'DICHTE',         ru: 'ПЛОТНОСТЬ',     zh: '密度',    ar: 'كثافة',        es: 'DENSIDAD',      fr: 'DENSITÉ'         },
  diversity:    { tr: 'ÇEŞİTLİLİK',    en: 'DIVERSITY',     de: 'VIELFALT',       ru: 'РАЗНООБРАЗИЕ',  zh: '多样性',  ar: 'تنوع',         es: 'DIVERSIDAD',    fr: 'DIVERSITÉ'       },
  freshness:    { tr: 'GÜNCELLİK',     en: 'FRESHNESS',     de: 'AKTUALITÄT',     ru: 'СВЕЖЕСТЬ',      zh: '时效性',  ar: 'حداثة',        es: 'FRESCURA',      fr: 'FRAÎCHEUR'       },
  globalRisk:   { tr: 'KÜRESEL RİSK',  en: 'GLOBAL RISK',   de: 'GLOBALES RISIKO',ru: 'ГЛОБАЛЬНЫЙ РИСК',zh: '全球风险',ar: 'مخاطر عالمية', es: 'RIESGO GLOBAL', fr: 'RISQUE MONDIAL'  },
  marketSignal: { tr: 'PAZAR SİNYALİ', en: 'MARKET SIGNAL', de: 'MARKTSIGNAL',    ru: 'РЫНОЧНЫЙ СИГНАЛ',zh: '市场信号',ar: 'إشارة السوق',  es: 'SEÑAL DE MERCADO',fr: 'SIGNAL DU MARCHÉ'},
  opportunity:  { tr: 'FIRSAT',         en: 'OPPORTUNITY',   de: 'CHANCE',         ru: 'ВОЗМОЖНОСТЬ',   zh: '机会',    ar: 'فرصة',         es: 'OPORTUNIDAD',   fr: 'OPPORTUNITÉ'     },
  textileAcademy:{ tr: 'TEKSTİL AKADEMİ',en: 'TEXTILE ACADEMY',de: 'TEXTILAKADEMIE',ru: 'ТЕКСТИЛЬНАЯ АКАДЕМИЯ',zh: '纺织学院',ar: 'أكاديمية النسيج',es: 'ACADEMIA TEXTIL',fr: 'ACADÉMIE TEXTILE'},
  expertHub:    { tr: 'Endüstri Bilgi Merkezi',en: 'The Expert Hub',de: 'Experten-Hub', ru: 'Экспертный Центр',zh: '专家中心',ar: 'مركز الخبراء',es: 'Centro Experto', fr: 'Centre Expert'  },
  premiumBadge: { tr: 'ÖNCELİKLİ RAPOR',en: 'Premium Report',de: 'Premium-Bericht',ru: 'Премиум Отчёт', zh: '优先报告',ar: 'تقرير مميز',   es: 'Informe Premium',fr: 'Rapport Premium'},
  reviewReport: { tr: 'Raporu İncele',  en: 'Review Report', de: 'Bericht prüfen', ru: 'Просмотреть отчёт',zh: '查看报告',ar: 'مراجعة التقرير',es: 'Revisar Informe',fr: 'Consulter le Rapport'},
  graphLabel:   { tr: 'Küresel Analiz Grafiği',en: 'Global Analysis Chart',de: 'Globales Analysediagramm',ru: 'Глобальный Аналитический График',zh: '全球分析图表',ar: 'مخطط التحليل العالمي',es: 'Gráfico de Análisis Global',fr: 'Graphique d\'Analyse Globale'},
  sovLimit:     { tr: 'Sovereign %10 Limiti',en: 'Sovereign 10% Limit',de: 'Sovereign 10% Limit',ru: 'Лимит Sovereign 10%',zh: 'Sovereign 10%限额',ar: 'حد Sovereign 10%',es: 'Límite Sovereign 10%',fr: 'Limite Sovereign 10%'},
  academyHomeDesc:{ tr: 'AIPyram Endüstriyel Referans Kaynağı. Pazar analizleri haricinde doğrudan "nasıl daha verimli üretilir" odaklı, otonom bilimsel endüstri rehberi.', en: 'AIPyram Industrial Reference Source. Autonomous scientific industry guide focused on production efficiency.', de: 'AIPyram Industrielle Referenzquelle. Autonomer wissenschaftlicher Industrieführer.', ru: 'Промышленный справочник AIPyram. Автономный научный отраслевой гид.', zh: 'AIPyram工业参考源。专注生产效率的自主科学行业指南。', ar: 'مصدر مرجعي صناعي AIPyram. دليل صناعي علمي مستقل.', es: 'Fuente de Referencia Industrial AIPyram. Guía científica autónoma de la industria.', fr: 'Source de Référence Industrielle AIPyram. Guide scientifique autonome de l\'industrie.' },
  notFound:     { tr: 'Bu haber bulunamadı.', en: 'Article not found.', de: 'Artikel nicht gefunden.', ru: 'Статья не найдена.', zh: '文章未找到。', ar: 'المقال غير موجود.', es: 'Artículo no encontrado.', fr: 'Article introuvable.' },
  backToArchive:{ tr: 'ARŞİVİNE DÖN', en: 'BACK TO ARCHIVE', de: 'ZURÜCK ZUM ARCHIV', ru: 'ВЕРНУТЬСЯ В АРХИВ', zh: '返回存档', ar: 'العودة إلى الأرشيف', es: 'VOLVER AL ARCHIVO', fr: "RETOUR AUX ARCHIVES" },
  syncing:      { tr: 'SİSTEM GÜNCELLENİYOR...', en: 'SYSTEM UPDATING...', de: 'SYSTEM WIRD AKTUALISIERT...', ru: 'ОБНОВЛЕНИЕ СИСТЕМЫ...', zh: '系统更新中...', ar: 'جاري تحديث النظام...', es: 'ACTUALIZANDO SISTEMA...', fr: 'MISE À JOUR DU SYSTÈME...' },
};

/**
 * LOCALE_MAP — Date formatting için 8 dil locale haritası
 */
export const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU',
  zh: 'zh-CN', ar: 'ar-SA', es: 'es-ES', fr: 'fr-FR',
};

/**
 * t(key, lang) — Merkezi çeviri motoru
 * Fallback: istenen dil → EN → TR → key kendisi
 */
export function t(key: string, lang: string): string {
  const normalizedLang = lang.toLowerCase() as LangCode;
  const entry = labels[key];
  if (!entry) return key;
  return entry[normalizedLang] || entry.en || entry.tr || key;
}

/**
 * tBatch(keys, lang) — Birden fazla key'i aynı anda çevir
 */
export function tBatch(keys: string[], lang: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = t(key, lang);
  }
  return result;
}

export default labels;

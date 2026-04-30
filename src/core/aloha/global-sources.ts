/**
 * TRTEX KÜRESEL İSTİHBARAT KAYNAKLARI (Sovereign Directive)
 * Bu dosya, ajanların "nereden istihbarat çekeceğine" dair sarsılmaz bir anayasadır.
 */

export const GLOBAL_SOURCES = {
    // ════════ İHALE VE KAMU TEDARİK KAYNAKLARI (Sıcak Para) ════════
    PROCUREMENT_TENDERS: [
        { id: 'UNGM', name: 'United Nations Global Marketplace', focus: 'Mülteci çadırları, hastane tekstili, UNICEF yatak/battaniye ihaleleri.' },
        { id: 'TED', name: 'Tenders Electronic Daily (EU)', focus: 'Avrupa Birliği kamu alımları. Hastane, askeriye, kamu binaları perde ve kumaş tedariği.' },
        { id: 'WORLD_BANK', name: 'World Bank Tenders', focus: 'Gelişmekte olan ülkelerdeki hastane/otel inşaat projelerinin tekstil fonları.' },
        { id: 'SAM_GOV', name: 'US Federal Procurement (SAM.gov)', focus: 'ABD ordusu ve kamu kurumları için standart tekstil alımları.' },
        { id: 'EKAP_TR', name: 'Kamu İhale Kurumu (EKAP)', focus: 'Türkiye içi Sağlık Bakanlığı, KYK yurtları perde ve yatak tekstili ihaleleri.' }
    ],
    // ════════ EKONOMİK VE SEKTÖREL VERİLER (Hammadde & Navlun) ════════
    COMMODITY_AND_LOGISTICS: [
        { id: 'ITMF', name: 'Uluslararası Tekstil Üreticileri Federasyonu', focus: 'Global iplik/kumaş üretim kapasiteleri, makine sipariş verileri.' },
        { id: 'ICAC', name: 'Uluslararası Pamuk Danışma Komitesi', focus: 'Global pamuk fiyatları, rekolte beklentileri ve iplik maliyet sinyalleri.' },
        { id: 'DREWRY', name: 'Drewry World Container Index', focus: 'Çin-Avrupa hattı konteyner navlun fiyatları (Tedarik zinciri kayma sinyalleri).' },
        { id: 'WGSN', name: 'WGSN Trend Analytics', focus: 'Lüks perakende trendleri, gelecek yılın popüler döşemelik renkleri.' }
    ],
    // ════════ GLOBAL OTEL VE MEGA PROJELER (Özel Sektör) ════════
    PRIVATE_CONTRACTS: [
        { id: 'MARRIOTT', name: 'Marriott International Procurement', focus: 'Yeni açılacak otellerin FF&E (Mobilya, Mefruşat, Ekipman) alım duyuruları.' },
        { id: 'HILTON', name: 'Hilton Supply Management', focus: 'EMEA bölgesi otel renovasyonları perde ve çarşaf talepleri.' },
        { id: 'NEOM', name: 'NEOM / Red Sea Global', focus: 'Suudi Arabistan mega projeleri lüks otel ve konut tekstil talepleri.' }
    ],
    // ════════ 7 KITA STRATEJİK ODAKLAR ════════
    SEVEN_CONTINENTS: [
        { type: 'EU_MARKET', focus: 'European Union luxury curtain demand, sustainable fabrics, and nearshoring to Turkey.' },
        { type: 'ASIA_PACIFIC', focus: 'Asia-Pacific cheap mass production shifts, logistics bottlenecks.' },
        { type: 'AMERICAS', focus: 'Americas hotel contracting, tariff updates on Chinese textiles.' },
        { type: 'MENA_AFRICA', focus: 'Middle East luxury villa shading, massive hospitality tenders in Saudi Arabia.' },
        { type: 'TR_HOTSPOT', focus: 'Turkish manufacturing superiority, direct factory-to-wholesale contract opportunities.' }
    ],
    // ════════ FUARLAR VE İŞ BİRLİKLERİ & TEKNOLOJİ TRENDLERİ ════════
    MAGAZINES_AND_FAIRS: [
        { name: 'HEIMTEXTIL_2026_TRENDS', focus: 'Heimtextil Frankfurt 2026 Trendleri: "Glitch" (Dijital Kusur), sentetik ve doğal dokuların harmanlanması, akıllı perde teknolojileri.' },
        { name: 'STYLE3D_AI_DRAPING', focus: 'Style3D ve benzeri yapay zeka desen/döküm (draping) simülasyonları. Gerçek zamanlı fizik motorlarıyla perde kumaşı testleri.' },
        { name: 'FAIR_RADAR_ITALY', focus: 'Proposte: High-end Italian fabric trends, elite upholstery networking.' },
        { name: 'FAIR_RADAR_TURKEY', focus: 'Hometex Istanbul: The world\'s leading showcase for B2B wholesale orders.' }
    ]
};

/**
 * Deterministik kaynak kombinasyonu — saate göre döner.
 * Her döngüde farklı bir pazara/bölgeye odaklanır.
 */
export function getStrategicFocusCombo(): string {
    const hour = new Date().getHours();
    
    // Cycle through sources based on time to ensure diverse coverage
    const procurement = GLOBAL_SOURCES.PROCUREMENT_TENDERS[hour % GLOBAL_SOURCES.PROCUREMENT_TENDERS.length];
    const commodity = GLOBAL_SOURCES.COMMODITY_AND_LOGISTICS[(hour + 1) % GLOBAL_SOURCES.COMMODITY_AND_LOGISTICS.length];
    const continent = GLOBAL_SOURCES.SEVEN_CONTINENTS[(hour + 2) % GLOBAL_SOURCES.SEVEN_CONTINENTS.length];
    const privateContract = GLOBAL_SOURCES.PRIVATE_CONTRACTS[(hour + 3) % GLOBAL_SOURCES.PRIVATE_CONTRACTS.length];
    
    return `Investigate global B2B opportunities focusing on ${continent.type} (${continent.focus}). Specifically scan for High-Value Tenders from ${procurement.name} (${procurement.focus}) and Private Hospitality Contracts from ${privateContract.name} (${privateContract.focus}). Include relevant economic/logistics context from ${commodity.name} (${commodity.focus}) to explain WHY this is a good opportunity for wholesalers and manufacturers now.`;
}

// ════════ DEVASA 7 KITA HABER HAVUZU (GLOBAL_NEWS_THEMES) ════════
// Toptancı ve Perakendecilere "Gerçek B2B Fırsatları" sunan 35+ stratejik konu
export const GLOBAL_NEWS_THEMES = [
    // Kuzey Amerika (North America)
    "Kuzey Amerika'da (ABD/Kanada) akıllı ev sistemleriyle entegre motorlu perde mekanizmalarındaki pazar büyümesi ve bayilik fırsatları.",
    "Las Vegas Market ve High Point fuarlarında öne çıkan premium döşemelik kumaş trendleri, toptan alım kapasiteleri.",
    "ABD otel zinciri yenilemelerinde (Marriott, Hilton) FR (Yanmaz) blackout kumaş taleplerindeki artış ve ithalat fırsatları.",
    "Kanada'da soğuk iklim izolasyonu sağlayan termal perde sistemlerinde toptancı kâr marjları ve yeni teknolojiler.",
    "Miami ve Kaliforniya gibi lüks sahil bölgelerinde UV korumalı dış mekan (outdoor) kumaşları ve screen perde projeleri.",

    // Güney Amerika (South America)
    "Brezilya ve Arjantin pazarında pamuk rekoltesi, iplik maliyetlerinin döşemelik kumaş toptancılarına etkisi.",
    "Güney Amerika'nın büyüyen orta sınıfı için ekonomik ama şık hazır perde koleksiyonları, ihracat potansiyelleri.",
    "Kolombiya ve Şili tekstil fuarlarında öne çıkan doğal keten görünümlü sentetik kumaşların toptan satış başarısı.",
    "Meksika üzerinden ABD pazarına nearshoring (yakın tedarik) stratejileri ve ev tekstili üretim hatlarındaki gelişmeler.",

    // Avrupa (Europe)
    "Avrupa Yeşil Mutabakatı (Green Deal) sonrası Almanya ve Fransa'da geri dönüştürülmüş OEKO-TEX sertifikalı kumaş zorunlulukları.",
    "İskandinav minimalizmi: İsveç ve Norveç pazarında ahşap rustikler, doğal dokular ve nötr renkli perde talebi.",
    "İtalya (Como/Proposte) lüks döşemelik ve jakarlı kumaş trendleri: Yüksek segment toptancılar için yeni tasarımlar.",
    "İngiltere (UK) konut projelerinde ses yalıtımlı (akustik) perdeler ve yangın geciktirici otel kumaşı regülasyonları.",
    "Doğu Avrupa (Polonya, Romanya) pazarında lojistik merkezlerin ev tekstili toptancıları için yarattığı hız avantajı.",
    "Hollanda ve Belçika'da akıllı ev otomasyonları (Somfy vb.) ile entegre perde rayları ve motor toptan satış stratejileri.",

    // Asya-Pasifik (Asia-Pacific)
    "Çin-Avrupa navlun maliyetlerindeki (Drewry Endeksi) dalgalanmaların ev tekstili toptancı siparişlerine stratejik etkisi.",
    "Japonya'nın deprem ve afet güvenlik standartlarına uygun hafif raylı sistemler ve dayanıklı korniş tasarımları.",
    "Vietnam ve Hindistan'daki üretim kapasitesi kaymaları, toptancılar için alternatif ev tekstili tedarik rotaları.",
    "Güney Kore ve Singapur'daki ultra lüks akıllı apartman projelerinde IoT entegreli motorlu jaluzi ve perde talepleri.",
    "Avustralya ve Yeni Zelanda pazarında yüksek UV dirençli dış mekan screen perdeler ve pergola kumaşlarının toptan pazarı.",

    // Ortadoğu ve Kuzey Afrika (MENA)
    "Suudi Arabistan NEOM ve Red Sea Global mega projelerinde devasa lüks otel tekstili ve perde montajı ihaleleri.",
    "Dubai ve Katar'da ultra lüks konutlar için altın/bronz varak detaylı perde aksesuarları ve pasmanteri (saçak) trendleri.",
    "Kuzey Afrika'da (Fas, Mısır) gelişen dokuma fabrikaları ve Avrupa'ya ev tekstili ihracatındaki avantajlı gümrük anlaşmaları.",
    "Birleşik Arap Emirlikleri'nde (BAE) 5 yıldızlı oteller için 100% Blackout (Işık geçirmez) akustik perde sistemleri toptan talebi.",
    "Ortadoğu'da akıllı ev (Smart Home) penetrasyonu ile artan motorlu korniş ve sessiz ray sistemi pazarındaki distribütör fırsatları.",

    // Sahra Altı Afrika (Sub-Saharan Africa)
    "Güney Afrika pazarında iç mimari projeleri için canlı renkli ve tribal desenli modern döşemelik kumaş arayışları.",
    "Kenya ve Nijerya'da hızla artan lüks otel/rezidans yatırımlarının yarattığı perde mekanizması ve toptan kumaş talebi.",
    "Afrika'daki yeni ticaret serbest bölgelerinin ev tekstili toptancıları ve ihracatçılar için sunduğu lojistik avantajlar.",

    // Global & Teknoloji (AI & Tech)
    "Style3D ve yapay zeka destekli fizik motorlarının perde döküm (draping) simülasyonlarında toptancılara sunduğu dijital showroom imkanları.",
    "Heimtextil ve Hometex gibi majör fuarlarda öne çıkan B2B dijital sipariş platformları ve tedarik zinciri optimizasyonları.",
    "Sovereign AI ve yapay zekanın ev tekstili pazar araştırmalarında kullanımı: Toptancılar doğru pazarı nasıl buluyor?"
];

/**
 * Belirtilen sayıda rastgele (ama döngüsel/pseudo-random) haber brief'i döndürür.
 * 7 Kıta'dan devasa çeşitliliği sağlamak için saat ve günü seed olarak kullanır.
 */
export function getDynamicNewsBriefs(count: number): string[] {
    const today = new Date();
    const seed = today.getDate() + today.getHours();
    
    // Diziyi seed ile shuffle et (karıştır)
    let shuffled = [...GLOBAL_NEWS_THEMES];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (seed + i * 31) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // İstenen sayıda brief seç
    return shuffled.slice(0, count);
}


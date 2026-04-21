/**
 * TRTEX KÜRESEL İSTİHBARAT KAYNAKLARI (Sovereign Directive)
 * Bu dosya, ajanların "nereden istihbarat çekeceğine" dair sarsılmaz bir anayasadır.
 */

export const GLOBAL_SOURCES = {
    RETAIL_AND_WHOLESALE: [
        { id: 'TRENDS', name: 'Global Interior Trends', focus: 'Retailer education, color palettes, modern curtain and upholstery fashion trends' },
        { id: 'COLLECTIONS', name: 'Upcoming Textile Collections', focus: 'New product reviews, fabric textures, patterns for wholesalers and interior designers' },
        { id: 'SMART_TECH', name: 'Smart Home Textiles', focus: 'Technology in curtains (motorized, smart fabrics), sustainability for retailers' },
        { id: 'B2B_SALES', name: 'B2B Wholesale Connections', focus: 'Direct sales connections, new distribution channels, boutique brand expansions' }
    ],
    SEVEN_CONTINENTS: [
        { type: 'EU_MARKET', focus: 'European Union luxury curtain demand, upcoming trade fairs in Germany/Italy, and buyer trends.' },
        { type: 'ASIA_PACIFIC', focus: 'Asia-Pacific growing consumer markets, wholesale imports, and Intertextile Shanghai previews.' },
        { type: 'AMERICAS', focus: 'Americas hotel contracting, upcoming USA home textile exhibitions, and wholesaler volume insights.' },
        { type: 'MENA_AFRICA', focus: 'Middle East & Africa luxury villa shading, massive hospitality tenders, and regional B2B summits.' },
        { type: 'TR_HOTSPOT', focus: 'Hometex Istanbul preparations, Turkish manufacturing superiority, and direct factory-to-wholesale opportunities.' }
    ],
    MAGAZINES_AND_FAIRS: [
        { name: 'Architectural Digest / Vogue Living', focus: 'Ultra-luxury interior design trends, dominant colors, and elite retail preferences.' },
        { name: 'FAIR_RADAR_GERMANY', focus: 'Heimtextil Frankfurt: Exhibitor strategies, upcoming sustainable collections, and B2B meeting predictions.' },
        { name: 'FAIR_RADAR_ITALY', focus: 'Proposte / Salone del Mobile: High-end Italian fabric trends, elite upholstery collections, networking opportunities.' },
        { name: 'FAIR_RADAR_TURKEY', focus: 'Hometex Istanbul: The world\'s leading showcase for curtain and upholstery manufacturers, essential for wholesalers.' }
    ]
};

/**
 * Rastgele bir kaynak kombinasyonu oluşturur ki `signalCollector`
 * her döngüde farklı bir pazara/bölgeye odaklansın.
 */
export function getStrategicFocusCombo(): string {
    const retail = GLOBAL_SOURCES.RETAIL_AND_WHOLESALE[Math.floor(Math.random() * GLOBAL_SOURCES.RETAIL_AND_WHOLESALE.length)];
    const continent = GLOBAL_SOURCES.SEVEN_CONTINENTS[Math.floor(Math.random() * GLOBAL_SOURCES.SEVEN_CONTINENTS.length)];
    const fairRadar = GLOBAL_SOURCES.MAGAZINES_AND_FAIRS[Math.floor(Math.random() * GLOBAL_SOURCES.MAGAZINES_AND_FAIRS.length)];
    
    return `Investigate global B2B opportunities focusing on ${continent.focus}. Highlight insights related to ${retail.name} (${retail.focus}) to attract retail and wholesale buyers. ALWAYS mention relevant UPCOMING FAIRS, leveraging the insights from ${fairRadar.name} (${fairRadar.focus}). Ensure the output prepares visitors for upcoming B2B networking events.`;
}


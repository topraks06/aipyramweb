/**
 * ═══════════════════════════════════════════════════════
 * ALOHA DIRECTIVE PROTOCOL (SOVEREIGN LAYER)
 * ═══════════════════════════════════════════════════════
 * 
 * Bu protokol "Double Authority Problem" riskini kökünden çözer.
 * 
 * MÜHÜRLÜ HİYERARŞİ:
 * 1. 🧠 ALOHA (CEO)        -> SADECE STRATEJİ BELİRLER (Veri üretmez)
 * 2. 🧩 TRTEX GM (Orch)    -> SADECE ORKESTRASYON VE DOĞRULAMA (Strateji değiştirmez)
 * 3. ⚙️ WORKERS (Exec)     -> SADECE GÖREVİ İCRA EDER (Karar vermez, yorumlamaz)
 */

export type ProjectDomain = 'TRTEX' | 'HOMETEX' | 'PERDE';

export type FocusDirection = 'MARKET_CRISIS' | 'SUPPLY_CHAIN' | 'FAIR_TREND' | 'COST_ANALYSIS' | 'REGIONAL_SHIFT';

/** 
 * ALOHA'nın (CEO) TRTEX GM'e verdiği kati emir. 
 * GM asla bunu yorumlayamaz, birebir uygular.
 */
export interface AlohaDirective {
    id: string;
    project: ProjectDomain;
    focus: FocusDirection;
    targetMarkets: string[];     // Örn: ['Almanya', 'Büyük Britanya']
    forbiddenTopics: string[];   // Örn: ['Hazır giyim', 'ayakkabı']
    requiredSignalCount: number; // Örn: 5
    timestamp: string;
    strictMode: boolean;         // true ise worker'ların hayal kurması yasaktır.
}

/**
 * TRTEX GM'in işçiye (Worker'a) geçeceği "Mühürlenmiş Görev Tanımı".
 */
export interface WorkerTask {
    directiveId: string;
    taskType: 'SCRAPE_SIGNALS' | 'GENERATE_EDITORIAL' | 'PRODUCE_IMAGES';
    focus: FocusDirection;
    targetMarkets: string[];
    strictMode: boolean;
}

/**
 * İşçi, görevi tamamlayınca kendi kafasına göre format atamaz, 
 * bu "Result" şemasını doldurup GM'e teslim etmek zorundadır.
 */
export interface WorkerExecutionResult {
    taskType: string;
    success: boolean;
    data: any;        // TISF veya Image URL array vb.
    errors?: string[];
}

export const lockWorkerStrategyModification = (workerInputFocus: FocusDirection, workerActualExecutionFocus: FocusDirection) => {
    if (workerInputFocus !== workerActualExecutionFocus) {
        throw new Error(`[DIRECTIVE_VIOLATION] Worker ajan stratejiyi değiştirmeye çalıştı! İzin verilen: ${workerInputFocus}, Yapılan: ${workerActualExecutionFocus}`);
    }
};

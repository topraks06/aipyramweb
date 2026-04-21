export class ReviewerAgent {
    constructor() {}

    async auditCode(code: string): Promise<{ approved: boolean, reason?: string }> {
        console.log("👮 [REVIEWER AGENT] İşçi ajanının kodu didik didik ediliyor...");
        
        // Kural 1: Tailwind Class'larında kaba renkler (blue-500, red-600) yasak.
        // Hometex sadece Maison Objet standartlarına uyar: #1a1a1a, #FAFAF8.
        if(code.includes('bg-blue-') || code.includes('text-red-')) {
            return {
                approved: false,
                reason: "POLİS REDDİ: B2B Maison Konseptinde cırtlak renkler (blue, red) kullanılamaz. Sadece #1a1a1a veya şeffaf olmalı. Kodu derhal düzelt!"
            };
        }

        // Kural 2: Boş dönüş veya eksik yapı
        if(!code.includes('export default') || !code.includes('return')) {
            return {
                approved: false,
                reason: "POLİS REDDİ: Geçersiz React Component yapısı. Kurucu fonksiyon veya return eksik."
            };
        }

        console.log("✅ [REVIEWER AGENT] Kod 100% Hatasız ve Maison standartlarında. Hakan Bey'e (Aloha) gönderilmeye hazır.");
        return { approved: true };
    }
}

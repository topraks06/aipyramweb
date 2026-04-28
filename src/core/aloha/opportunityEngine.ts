import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { MarketSignalEvent, getUnprocessedSignals } from './signalEngine';

/**
 * ALOHA OPPORTUNITY ENGINE — Fırsat Üretim Motoru (Para Makinesi)
 * 
 * Signal Engine'den gelen sinyalleri → somut, uygulanabilir fırsatlara çevirir.
 * 
 * Sinyal: "Polonya ev tekstili ithalatı %18 arttı"
 * Fırsat: "Polonya için landing page oluştur + Türkçe/Lehçe SEO + lead toplama"
 * 
 * Çıktı: aloha_opportunities koleksiyonuna yazılır → Decision Engine tarafından çalıştırılır
 * 
 * TÜM PROJELERİ kapsar.
 */



// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface Opportunity {
  id?: string;
  signalId: string;          // Kaynak sinyal ID
  project: string;
  opportunity: string;       // Kısa açıklama
  action: OpportunityAction; // Ne yapılmalı
  expectedLeads: number;     // Beklenen lead sayısı
  expectedRevenue?: number;  // Tahmini gelir ($)
  confidence: number;        // 0-1
  priority: 'critical' | 'high' | 'normal' | 'low';
  effort: 'minimal' | 'moderate' | 'significant'; // Uygulama çabası
  tools: Array<{ name: string; args: Record<string, any> }>; // Uygulanacak tool'lar
  status: 'detected' | 'evaluating' | 'approved' | 'executing' | 'completed' | 'rejected';
  reasoning: string;         // Neden bu fırsat
  createdAt: string;
  executedAt?: string;
  result?: OpportunityResult;
}

export type OpportunityAction =
  | 'create_landing_page'     // Hedef pazar için landing page
  | 'create_content'          // İçerik üret (haber, analiz)
  | 'update_seo'              // SEO iyileştir (ülke/dil bazlı)
  | 'lead_campaign'           // Lead toplama kampanyası
  | 'email_outreach'          // E-posta kampanyası
  | 'competitive_content'     // Rakibe karşı içerik
  | 'price_update'            // Fiyat güncelleme
  | 'market_report'           // Pazar raporu oluştur
  | 'fair_preparation'        // Fuar hazırlığı
  | 'partnership_outreach';   // İş ortaklığı

export interface OpportunityResult {
  measuredAt: string;
  views: number;
  leads: number;
  conversion: number;
  revenueGenerated: number;
  lesson: string;
}

// ═══════════════════════════════════════
// SINYAL → FIRSAT ÇEVRİMİ
// ═══════════════════════════════════════

/**
 * ANA FIRSAT ÜRETME FONKSİYONU
 * autoRunner Adım 0.8'de çağrılır
 * 
 * 1. İşlenmemiş sinyalleri oku
 * 2. Gemini ile fırsat analizi yaptır
 * 3. Her fırsat için somut tool planı oluştur
 * 4. aloha_opportunities'e yaz
 */
export async function detectOpportunities(project: string = 'all'): Promise<{
  opportunities: Opportunity[];
  processedSignals: number;
}> {
  // 1. İşlenmemiş sinyalleri çek
  const signals = await getUnprocessedSignals(project === 'all' ? undefined : project, 15);

  if (signals.length === 0) {
    console.log('[💎 OPPORTUNITY] İşlenecek sinyal yok');
    return { opportunities: [], processedSignals: 0 };
  }

  const opportunities: Opportunity[] = [];
  const processedIds: string[] = [];

  // 2. Gemini ile toplu fırsat analizi
  try {
    const signalSummary = signals.map(s => ({
      id: s.id,
      type: s.type,
      project: s.project,
      country: s.country,
      signal: s.signal,
      confidence: s.confidence,
      severity: s.severity,
      data: s.data,
    }));

    const analysisPrompt = `Sen aipyram B2B fırsat analistsin. SERT KURALLAR:

KURAL 1: Sinyalde SOMUT VERİ (sayı, yüzde, tarih, fiyat) VARSA → FIRSAT ZORLA ÜRET
  Örnek sinyal: "Polonya ev tekstili ithalatı %18 arttı"
  → FIRSAT: "Polonya hedefli landing page + SEO kampanyası"

KURAL 2: Sinyalde somut veri YOKSA → ÜRETME, skip et
  Örnek sinyal: "Tekstil sektörü olumlu"
  → SKIP (çöp fırsat üretme)

KURAL 3: Her fırsatın EN AZ 1 çalıştırılabilir tool'u olmalı
  Toolsuz fırsat = çöp fırsat

KURAL 4: "content oluştur" SADECE hedefe yönelik olmalı
  ❌ YANLIŞ: "tekstil hakkında yazı yaz"
  ✅ DOĞRU: "Polonya B2B alıcılarına yönelik Lehçe landing page oluştur"

PROJELER:
- TRTEX: B2B tekstil istihbarat platformu (perde, havlu, nevresim)
- HOMETEX: Sanal fuar platformu
- PERDE.AI: AI perde tasarım aracı
- DIDIMEMLAK: Didim emlak platformu

SINYALLER:
${JSON.stringify(signalSummary, null, 2)}

Kullanılabilir tool'lar:
- universal_create_page: Herhangi bir projeye sayfa oluştur
- compose_article: Haber/analiz yaz
- universal_apply_patch: Sayfa güncelle
- google_index: URL indexle
- send_email: E-posta gönder
- schedule_task: İlerideki görev planla

JSON döndür:
[{
  "signalId": "sinyal ID",
  "project": "trtex|hometex|perde|didimemlak",
  "opportunity": "kısa açıklama (max 150 karakter)",
  "action": "create_landing_page|create_content|update_seo|lead_campaign|email_outreach|competitive_content|price_update|market_report|fair_preparation|partnership_outreach",
  "expectedLeads": sayı,
  "confidence": 0.0-1.0,
  "priority": "critical|high|normal|low",
  "effort": "minimal|moderate|significant",
  "reasoning": "neden bu fırsat",
  "tools": [{"name": "tool_adı", "args": {}}]
}]

SADECE gerçekçi, uygulanabilir fırsatlar üret. Somut veri yoksa boş array [] döndür. Max 5 fırsat.`;

    const parsed = await alohaAI.generateJSON<any[]>(
      analysisPrompt,
      { complexity: 'routine', temperature: 0.4 },
      'opportunity_engine'
    );

    const oppArray = Array.isArray(parsed) ? parsed : ((parsed as any)?.opportunities || []);

    for (const raw of oppArray.slice(0, 5)) {
      // 🚨 ANAYASA: Somut veri (sayı/yüzde) yoksa fırsat üretme!
      const signalData = signals.find(s => s.id === raw.signalId);
      const signalText = signalData?.signal || signalData?.data?.content || "";
      const hasNumbers = /\d/.test(signalText);
      const hasPercent = /%|yüzde|milyon|milyar|dolar|euro|€|\$/i.test(signalText);
      
      if (!signalText || signalText.trim() === "" || (!hasNumbers && !hasPercent)) {
        console.log(`[💎 OPPORTUNITY] SKIP (Somut veri yok): ${raw.opportunity}`);
        if (raw.signalId) processedIds.push(raw.signalId);
        continue;
      }

      const opp: Opportunity = {
        signalId: raw.signalId || signals[0]?.id || 'unknown',
        project: raw.project || 'trtex',
        opportunity: raw.opportunity || 'bilinmeyen fırsat',
        action: raw.action || 'create_content',
        expectedLeads: raw.expectedLeads || 0,
        confidence: Math.min(1, Math.max(0, raw.confidence || 0.5)),
        priority: raw.priority || 'normal',
        effort: raw.effort || 'moderate',
        tools: raw.tools || [],
        status: 'detected',
        reasoning: raw.reasoning || '',
        createdAt: new Date().toISOString(),
      };

      opportunities.push(opp);
      if (raw.signalId) processedIds.push(raw.signalId);
    }
  } catch (e: any) {
    console.error(`[OPPORTUNITY] Analiz hatası: ${e.message}`);
  }

  // 3. Firestore'a yaz
  if (adminDb && opportunities.length > 0) {
    try {
      const batch = adminDb.batch();

      // Fırsatları yaz
      for (const opp of opportunities) {
        const ref = adminDb.collection('aloha_opportunities').doc();
        opp.id = ref.id;
        batch.set(ref, opp);
      }

      // Sinyalleri "processed" olarak işaretle
      for (const signal of signals) {
        if (signal.id) {
          const ref = adminDb.collection('aloha_signals').doc(signal.id);
          batch.update(ref, { processed: true });
        }
      }

      await batch.commit();
      console.log(`[💎 OPPORTUNITY] ${opportunities.length} fırsat yazıldı, ${signals.length} sinyal işlendi`);
    } catch (e: any) {
      console.warn(`[OPPORTUNITY] Firestore yazma hatası: ${e.message}`);
    }
  }

  return { opportunities, processedSignals: signals.length };
}

// ═══════════════════════════════════════
// FIRSAT RAPORU
// ═══════════════════════════════════════

export function formatOpportunityReport(opportunities: Opportunity[]): string {
  if (opportunities.length === 0) return '💎 Yeni fırsat bulunamadı.';

  const priorityIcon: Record<string, string> = { critical: '🔴', high: '🟠', normal: '🟡', low: '🔵' };

  let report = `═══ FIRSAT RAPORU ═══\n`;
  report += `💎 Toplam: ${opportunities.length} fırsat\n`;
  report += `📈 Tahmini Lead: ${opportunities.reduce((sum, o) => sum + o.expectedLeads, 0)}\n\n`;

  for (const o of opportunities) {
    const icon = priorityIcon[o.priority] || '⚪';
    report += `${icon} ${o.opportunity}\n`;
    report += `   🏢 Proje: ${o.project} | Aksiyon: ${o.action}\n`;
    report += `   📈 Beklenen lead: ${o.expectedLeads} | Güven: ${(o.confidence * 100).toFixed(0)}%\n`;
    report += `   🔧 ${o.tools.length} tool | Çaba: ${o.effort}\n`;
    report += `   💡 ${o.reasoning.substring(0, 200)}\n\n`;
  }

  return report;
}

// ═══════════════════════════════════════
// BEKLEYENLERİ GETİR
// ═══════════════════════════════════════

export async function getPendingOpportunities(project?: string, limit: number = 10): Promise<Opportunity[]> {
  if (!adminDb) return [];

  try {
    const snap = await adminDb.collection('aloha_opportunities')
      .where('status', '==', 'detected')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const opps = snap.docs.map(d => ({ id: d.id, ...d.data() as Opportunity }));

    if (project) {
      const normalized = project.toLowerCase().replace('.com', '').replace('.ai', '');
      return opps.filter(o => o.project === normalized);
    }
    return opps;
  } catch (e: any) {
    console.warn(`[OPPORTUNITY] Bekleyen okuma hatası: ${e.message}`);
    return [];
  }
}

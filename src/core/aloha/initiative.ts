/**
 * ALOHA INITIATIVE ENGINE — Proaktif Karar Verme
 * 
 * Aloha'yı "beklenen" moddan "başlatan" moda geçirir.
 * Health score düşük → otomatik aksiyon planla
 * Uzun süredir içerik yok → üret
 * Tekrar eden hata → farklı strateji dene
 * 
 * BU DOSYA Aloha'yı "reactive" dan "proactive" a dönüştürür.
 */

import { adminDb, checkFirestoreHealth } from '@/lib/firebase-admin';
import { alohaMemory } from './memory';
import { alohaAI } from './aiClient';

// ═══════════════════════════════════════════════════
// INITIATIVE KURALLAR
// ═══════════════════════════════════════════════════

interface InitiativeDecision {
  shouldAct: boolean;
  actions: InitiativeAction[];
  reasoning: string;
}

interface InitiativeAction {
  type: 'content_generate' | 'image_fix' | 'full_audit' | 'seo_check' | 'health_alert' | 'strategy_change' | 'major_rebuild' | 'revenue_outreach' | 'audit_repair' | 'code_fix';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tool: string;
  args: Record<string, any>;
  reason: string;
}

interface HealthScore {
  total: number; // 0-100
  content: number;
  freshness: number;
  images: number;
  errors: number;
}

/**
 * Proje sağlık skorunu hesapla (0-100)
 */
export function calculateHealthScore(healthJSON: any): HealthScore {
  let content = 100;
  let freshness = 100;
  let images = 100;
  let errors = 100;

  // İçerik skoru
  const docCount = healthJSON.docCount || 0;
  if (docCount === 0) content = 0;
  else if (docCount < 5) content = 20;
  else if (docCount < 20) content = 60;
  else if (docCount < 50) content = 80;
  else content = 100;

  // Tazelik skoru
  const staleHours = healthJSON.staleHours || 0;
  if (staleHours > 168) freshness = 10; // 1 hafta+
  else if (staleHours > 72) freshness = 30; // 3 gün+
  else if (staleHours > 24) freshness = 60; // 1 gün+
  else if (staleHours > 8) freshness = 80;
  else freshness = 100;

  // Görsel skoru
  const imageless = healthJSON.imagelessCount || 0;
  if (docCount > 0) {
    const ratio = imageless / docCount;
    if (ratio > 0.5) images = 20;
    else if (ratio > 0.2) images = 50;
    else if (ratio > 0) images = 80;
    else images = 100;
  }

  // Hata skoru
  const errorCount = (healthJSON.errors || []).length;
  if (errorCount > 3) errors = 20;
  else if (errorCount > 1) errors = 50;
  else if (errorCount > 0) errors = 80;
  else errors = 100;

  const total = Math.round(content * 0.3 + freshness * 0.3 + images * 0.2 + errors * 0.2);
  return { total, content, freshness, images, errors };
}

/**
 * INITIATIVE ENGINE — Proaktif karar ver
 * healthJSON + lessons + memory → ne yapmalı?
 */
export async function evaluateInitiative(
  projectName: string,
  healthJSON: any,
): Promise<InitiativeDecision> {
  const score = calculateHealthScore(healthJSON);
  const actions: InitiativeAction[] = [];
  const reasons: string[] = [];

  // ── KURAL 0: Firestore Sağlık Kontrolü (EN ÖNCELİKLİ)
  try {
    const fsHealth = await checkFirestoreHealth();
    if (fsHealth !== 'OK') {
      console.error(`[INITIATIVE] 🔴🔴🔴 FIRESTORE ${fsHealth}! Tüm DB işlemleri çalışmıyor!`);
      actions.push({
        type: 'health_alert',
        priority: 'critical',
        tool: 'verify_project_health',
        args: { projectName, firestoreStatus: fsHealth },
        reason: `FIRESTORE ${fsHealth} — Acil müdahale gerekli!`,
      });
      reasons.push(`Firestore durumu: ${fsHealth}`);
    }
  } catch { /* sessiz */ }

  // ── KURAL 1: Skor < 70 → Tam audit tetikle
  if (score.total < 70) {
    actions.push({
      type: 'full_audit',
      priority: 'critical',
      tool: 'verify_project_health',
      args: { projectName },
      reason: `Sağlık skoru kritik: ${score.total}/100`,
    });
    reasons.push(`Proje sağlık skoru ${score.total}/100 — kritik seviye`);
  }

  // ── KURAL 2: Tazelik düşük → İçerik üret
  if (score.freshness < 60) {
    actions.push({
      type: 'content_generate',
      priority: 'high',
      tool: 'trigger_project_content',
      args: { projectName, contentType: 'news' },
      reason: `Son içerik ${healthJSON.staleHours || '?'} saat önce`,
    });
    reasons.push(`İçerik bayat (${healthJSON.staleHours}+ saat)`);
  }

  // ── KURAL 3: Görselsiz haber var → Düzelt
  if (score.images < 80 && (healthJSON.imagelessCount || 0) > 0) {
    actions.push({
      type: 'image_fix',
      priority: 'high',
      tool: 'scan_missing_images',
      args: { projectName, limit: Math.min(healthJSON.imagelessCount, 10), dryRun: false },
      reason: `${healthJSON.imagelessCount} haber görselsiz`,
    });
    reasons.push(`${healthJSON.imagelessCount} görselsiz haber`);
  }

  // ── KURAL 4: Tekrar eden hata → Strateji değiştir
  try {
    const recentErrors = await alohaMemory.getLessonsForProject(projectName, 5);
    const errorPatterns: Record<string, number> = {};
    for (const lesson of recentErrors) {
      if (lesson.type === 'bug_fix') {
        const key = (lesson.content || '').substring(0, 50);
        errorPatterns[key] = (errorPatterns[key] || 0) + 1;
      }
    }
    
    // Aynı hata 3+ kez → DUR ve farklı strateji
    for (const [pattern, count] of Object.entries(errorPatterns)) {
      if (count >= 3) {
        actions.push({
          type: 'strategy_change',
          priority: 'critical',
          tool: 'create_execution_plan',
          args: { 
            task_description: `[TEKRAR EDEN HATA] "${pattern}" hatası ${count} kez tekrarlandı. Mevcut strateji çalışmıyor. FARKLI bir yaklaşım planla.`,
            context: `Proje: ${projectName}, Hata sayısı: ${count}`,
          },
          reason: `"${pattern}" ${count}x tekrarlandı — strateji değişikliği gerekli`,
        });
        reasons.push(`Tekrar eden hata tespit edildi (${count}x)`);
        break; // İlk tekrar eden hatayı bul, planla
      }
    }
  } catch { /* lessons yüklenemezse devam */ }

  // ── KURAL 5: 0 haber → Acil içerik
  if ((healthJSON.docCount || 0) === 0) {
    actions.push({
      type: 'content_generate',
      priority: 'critical',
      tool: 'trigger_project_content',
      args: { projectName, contentType: 'news' },
      reason: 'Projede hiç içerik yok!'
    });
    reasons.push('Projede 0 içerik — acil üretim');
  }

  // ── KURAL 6: BIG REWRITE TRIGGER — Skor < 50 → Büyük yenileme
  if (score.total < 50) {
    actions.push({
      type: 'major_rebuild',
      priority: 'critical',
      tool: 'run_full_repair',
      args: {
        project: projectName.toLowerCase().replace('.com','').replace('.ai',''),
      },
      reason: `Skor ${score.total}/100 — tam onarım zinciri tetiklendi`,
    });
    reasons.push(`KRİTİK: Skor ${score.total}/100 — run_full_repair tetiklendi`);
  }

  // ── KURAL 7: REVENUE AWARENESS — İçerik var ama lead yok
  if (score.content >= 60 && score.freshness < 40) {
    actions.push({
      type: 'content_generate',
      priority: 'high',
      tool: 'compose_article',
      args: { 
        topic: `${projectName} sektöründe yeni iş fırsatları ve B2B bağlantı kurma stratejileri`,
        project: projectName,
        category: 'İstihbarat',
        word_count: 800,
      },
      reason: 'İçerik var ama tazelik düşük — gelir odaklı içerik üret',
    });
    reasons.push('Revenue awareness: gelir odaklı içerik gerekli');
  }

  // ── KURAL 8: TRTEX 48-SAAT TAZELİK — Ana sayfa bayatlama engeli
  const hoursOld = healthJSON.oldestNewsHours || healthJSON.avgNewsAgeHours || 0;
  const recentCount = healthJSON.last24hCount || 0;
  if (projectName.toLowerCase().includes('trtex') && recentCount < 3) {
    // Son 24 saatte 3'ten az haber → acil üret
    const topicsPool = [
      'Türk tekstil sektörü ihracat performansı',
      'Ev tekstili hammadde fiyat analizi',
      'Sürdürülebilir tekstil üretimi trendleri',
      'B2B tekstil fuarları ve networking',
      'Uzak Doğu tedarik zinciri gelişmeleri',
      'Türk ev tekstili marka yönetimi',
    ];
    const randomTopic = topicsPool[new Date().getHours() % topicsPool.length];
    
    actions.push({
      type: 'content_generate',
      priority: 'high',
      tool: 'compose_article',
      args: {
        topic: randomTopic,
        project: 'trtex',
        category: 'İstihbarat',
        word_count: 700,
      },
      reason: `Ana sayfa bayat: son 24 saatte sadece ${recentCount} haber. Günde 6 haber hedefi var.`,
    });
    reasons.push(`TRTEX 48h kuralı: son 24 saatte ${recentCount} haber — günlük hedef 6`);
  }

  // ── KURAL 9: OTONOM DENETİM DÖNGÜSÜ — Her 6 saatte audit + repair
  // deep_site_audit + auto_repair döngüsü tüm projeler için
  if (score.total < 70 || (healthJSON.stockImageCount || 0) > 0 || (healthJSON.emptyBodyCount || 0) > 0) {
    actions.push({
      type: 'audit_repair',
      priority: 'high',
      tool: 'deep_site_audit',
      args: { project: projectName.toLowerCase().replace('.com','').replace('.ai','') },
      reason: `Kalite skoru düşük (${score.total}/100) veya içerik sorunları var — otonom denetim başlat`,
    });
    reasons.push(`Otonom audit tetiklendi: skor ${score.total}/100`);
  }

  // ── KURAL 10: HUNTER MODE V2 — 6 HABERLİK GÜNLÜK REÇETE
  // Kural: Günde 6 haber. 1 tanesi kesinlikle Top 50 listesinden. Diğer 5'i ana akımda olmayan özel B2B analizleri, tasarım ve iç mekan.
  if (projectName.toLowerCase().includes('trtex') && recentCount < 6) {
    const CURRENT_YEAR = new Date().getFullYear();
    const TODAY = new Date().toISOString().split('T')[0];
    
    const masterWatchlist = [
      "JAB Anstoetz", "Zimmer + Rohde", "Pierre Frey", "Rubelli", "Dedar", "Casamance", "Sahco", "Romo Group", 
      "Designers Guild", "Kvadrat", "Vanelli", "Küçükçalık", "Burkay Tekstil", "Elvin Tekstil", "Persan", 
      "Zorlu Tekstil", "Özdilek", "Harput", "Rekor Dokuma", "Korteks", "Menderes Tekstil", "Somfy", "Coulisse", "Hunter Douglas"
    ];

    let targetBrief = '';

    // EĞER GÜNÜN İLK HABERİYSE (Top 50 Firma Radarı)
    if (recentCount === 0 || recentCount === 3) {
       const watchTarget = masterWatchlist[new Date().getMinutes() % masterWatchlist.length];
       targetBrief = `${TODAY}: [ELİT FİRMA RADARI] Dünyaca ünlü B2B sektör devi '${watchTarget}' firmasının son dönemdeki sektörel hamlesi, koleksiyon dili, vizyonu veya üretim kapasitesi üzerine kurumsal inceleme.`;
    } 
    // DİĞER HABERLER (Ana akımda olmayan niş, tasarım, fuar, teknoloji)
    else {
      const nicheTopics = [
        "Küresel dergilerde henüz patlamamış, gözden kaçan tekstil fuarı fırsatları ve bölgesel B2B yatırım şansları",
        "Yeni nesil lüks iç mekan tasarımlarının perde ve kumaş ihtiyaçlarını nasıl değiştirdiği üzerine B2B analiz",
        "Mekanizmalı perdecilikte ve tekstil üretiminde akıllı makineler, otomasyon, henüz bilinmeyen vizyoner ürünler",
        "Tasarım dünyasında yeni çıkan butik ürünler, luxury interior design trendleri ve bunun Türk üreticilere sunduğu niş fırsatlar",
        "Bölgesel bazda (Doğu Avrupa, Kuzey Afrika) yeni tekstil üretim yatırım fırsatları ve bilinmeyen şirket haberleri",
        `Dünya elit dergilerinde (Vogue Living, AD) öne çıkmaya başlayan yeni kumaş doku tasarımları ve ticari değeri (${CURRENT_YEAR})`
      ];
      const randomNiche = nicheTopics[(new Date().getHours() + new Date().getMinutes()) % nicheTopics.length];
      targetBrief = `${TODAY}: [ÖZEL İSTİHBARAT] ${randomNiche}. Ana akım küresel basında çok yer almamış, değerli ve niş bir bilgi üret. Sadece ticari etki veya yeni ürün/tasarım odaklı olsun.`;
    }

    const existingAction = actions.find(a => a.tool === 'compose_article');
    if (existingAction) {
      existingAction.args.topic = targetBrief;
    }
  }

  return {
    shouldAct: actions.length > 0,
    actions: actions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    reasoning: reasons.length > 0 
      ? `[🧠 INITIATIVE] ${projectName}: ${reasons.join('; ')}` 
      : `[🧠 INITIATIVE] ${projectName}: Sağlıklı (${score.total}/100), müdahale gerekmiyor.`,
  };
}

/**
 * Uzun vadeli görev oluştur — yarın hatırlansın
 */
export async function createLongTermTask(task: {
  project: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  steps?: string[];
}): Promise<string | null> {
  try {
    if (!adminDb) return null;
    
    const ref = await adminDb.collection('aloha_long_tasks').add({
      ...task,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attempts: 0,
      last_attempt: null,
      completion_percentage: 0,
    });
    
    console.log(`[🧠 INITIATIVE] Uzun vadeli görev oluşturuldu: ${task.title} (${ref.id})`);
    return ref.id;
  } catch (e) {
    console.error('[INITIATIVE] Task oluşturma hatası:', e);
    return null;
  }
}

/**
 * Bekleyen uzun vadeli görevleri yükle
 */
export async function getPendingLongTasks(projectName?: string, limit: number = 5): Promise<any[]> {
  try {
    if (!adminDb) return [];
    
    let query = adminDb.collection('aloha_long_tasks')
      .where('status', 'in', ['pending', 'in_progress'])
      .orderBy('created_at', 'desc')
      .limit(limit);
    
    // Project filter opsiyonel
    const snap = await query.get();
    const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Proje filtresi JS taraflı (Firestore compound query sınırı)
    if (projectName) {
      return tasks.filter((t: any) => t.project === projectName);
    }
    return tasks;
  } catch (e) {
    return [];
  }
}

/**
 * Uzun vadeli görevi güncelle
 */
export async function updateLongTask(taskId: string, updates: Partial<{
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  completion_percentage: number;
  last_attempt: string;
  attempts: number;
  result: string;
}>): Promise<void> {
  try {
    if (!adminDb) return;
    await adminDb.collection('aloha_long_tasks').doc(taskId).update({
      ...updates,
      updated_at: new Date().toISOString(),
    });
  } catch { /* sessiz */ }
}

/**
 * ═══ HAFTALIK GOOGLE ALTYAPI TEKNOLOJİ TARAYICI ═══
 * 
 * Aloha her hafta TÜM Google altyapı güncellemelerini tarar:
 * Gemini, Vertex AI, Firebase, Cloud Run, Imagen, Angular, Flutter, vb.
 * aipyram ekosistemine faydalı olanları tespit eder ve hafızasına alır.
 * 
 * ⚠️ ONAY MEKANİZMASI: Hiçbir güncelleme otomatik uygulanmaz!
 * Bulgular Firestore'a 'pending_approval' olarak yazılır.
 * Hakan onayladıktan sonra Aloha uygulama planı çıkarır.
 * 
 * AKIŞ:
 *   1. Tüm Google altyapı haberlerini tara (web_search)
 *   2. aipyram projelerine potansiyel etkiyi AI ile değerlendir
 *   3. Sonuçları aloha_tech_proposals'a 'pending_approval' olarak yaz
 *   4. Hakan'a özet sun → onay al → uygula
 */
export async function weeklyGoogleTechScan(): Promise<{
  scanned: number;
  relevant: number;
  critical: number;
  findings: TechFinding[];
}> {
  const findings: TechFinding[] = [];
  
  console.log('\n[🔬 TECH SCAN] ═══ Haftalık Google Altyapı Taraması Başladı ═══\n');
  
  // ═══ TÜM GOOGLE ALTYAPISI ═══
  const searchTopics = [
    // --- AI & MODEL ---
    'Gemini API new features changelog latest 2026',
    'Gemini 2.5 Pro Flash model updates April 2026',
    'Google AI Studio new tools features 2026',
    // --- VERTEX AI & AGENTS ---
    'Vertex AI Agent Builder ADK updates 2026',
    'Vertex AI Agent Engine new features',
    'Google A2A Agent2Agent protocol updates',
    'Vertex AI model garden new models 2026',
    // --- FIREBASE ---
    'Firebase updates new features April 2026',
    'Firebase Genkit new release changelog',
    'Firebase Firestore performance new features 2026',
    'Firebase Authentication updates 2026',
    'Firebase App Hosting updates Cloud',
    // --- GOOGLE CLOUD ---
    'Google Cloud Run new features improvements 2026',
    'Google Cloud Functions updates 2026',
    'Google Cloud Storage new features',
    // --- GÖRSEL & MEDİA ---
    'Google Imagen API updates new features 2026',
    'Google Veo video generation API updates',
    // --- GENEL PLATFORM ---
    'Google Workspace AI features Gemini integration',
    'Google Search API grounding updates 2026',
    'Google Maps Platform AI features 2026',
    // --- ANTIGRAVITY & DEV TOOLS ---
    'Google IDX cloud IDE updates 2026',
    'Angular new features updates 2026',
    'Google Lighthouse web performance updates',
  ];

  for (const topic of searchTopics) {
    try {
      // Web search ile güncellemeleri tara (Google Search Grounding)
      const searchResult = await executeToolCallSafe({
        name: 'web_search',
        args: { query: topic }
      });

      if (searchResult && searchResult.length > 100) {
        findings.push({
          topic,
          rawResult: searchResult.substring(0, 2000),
          scannedAt: new Date().toISOString(),
          evaluated: false,
          impact: 'unknown',
        });
      }
    } catch { /* tek tarama hatası → devam */ }
  }

  // 2. AI ile etki analizi yap
  if (findings.length > 0) {
    try {
      // removed ai instantiation
      
      const combinedFindings = findings.map(f => `[${f.topic}]: ${f.rawResult.substring(0, 500)}`).join('\n\n');
      
      const analysis = await alohaAI.generateJSON(
        `Sen aipyram ekosistemi için bir teknoloji danışmanısın.
aipyram: Next.js + Firebase + Gemini API + Cloud Run üzerinde çalışan 280+ domainlik B2B platform.
Aktif projeler: TRTEX (tekstil haberleri), HOMETEX (sanal fuar), PERDE.AI (AI perde tasarımı).
Mevcut araçlar: Gemini 2.5 Flash (içerik üretimi), Imagen 3 (görsel), Firebase Firestore (DB), Cloud Run (deploy).

Aşağıdaki Google Cloud güncellemelerini analiz et:

${combinedFindings}

Her güncelleme için:
1. aipyram'a etkisi var mı? (high/medium/low/none)
2. Hangi projeyi etkiler?
3. Somut uygulama önerisi (varsa)

JSON döndür:
{"evaluations": [{"topic": "...", "impact": "high|medium|low|none", "affected_projects": ["trtex","hometex","perde"], "recommendation": "...", "implementation_effort": "hours|days|weeks"}]}`,
        { complexity: 'routine' },
        'initiative.weeklyGoogleTechScan'
      );

      if (analysis) {
        
        for (const eval_ of (analysis.evaluations || [])) {
          const finding = findings.find(f => f.topic === eval_.topic);
          if (finding) {
            finding.evaluated = true;
            finding.impact = eval_.impact;
            finding.affectedProjects = eval_.affected_projects;
            finding.recommendation = eval_.recommendation;
            finding.effort = eval_.implementation_effort;
          }
        }
      }
    } catch (e: any) {
      console.warn(`[TECH SCAN] AI analiz hatası: ${e.message}`);
    }
  }

  // 3. ═══ ONAY MEKANİZMASI — Her bulgu ayrı teklif olarak yazılır ═══
  const relevant = findings.filter(f => f.impact === 'high' || f.impact === 'medium');
  const critical = findings.filter(f => f.impact === 'high');

  // Her faydalı bulguyu ayrı bir "teklif" olarak Firestore'a yaz
  // ⚠️ OTOMATİK UYGULAMA YOK — Hakan'ın onayı gerekli!
  try {
    if (adminDb) {
      // Tarama özet kaydı
      await adminDb.collection('aloha_tech_intel').add({
        scannedAt: new Date().toISOString(),
        totalTopics: searchTopics.length,
        findingsCount: findings.length,
        relevantCount: relevant.length,
        criticalCount: critical.length,
      });

      // Her ilgili bulgu → ayrı onay teklifi
      for (const f of relevant) {
        await adminDb.collection('aloha_tech_proposals').add({
          status: 'pending_approval', // ⚠️ Hakan onaylayana kadar uygulanmaz!
          topic: f.topic,
          impact: f.impact,
          recommendation: f.recommendation || '',
          affectedProjects: f.affectedProjects || [],
          implementationEffort: f.effort || 'unknown',
          rawSummary: f.rawResult.substring(0, 1000),
          createdAt: new Date().toISOString(),
          approvedAt: null,
          approvedBy: null,
          implementedAt: null,
          implementationResult: null,
        });
      }
      
      if (relevant.length > 0) {
        console.log(`[🔬 TECH SCAN] 📋 ${relevant.length} teklif 'aloha_tech_proposals' koleksiyonuna yazıldı (ONAY BEKLİYOR)`);
      }
    }
  } catch { /* Firestore yazma hatası → sessiz */ }

  // 4. Kritik bulgular için memory'ye yaz + bildirim
  if (critical.length > 0) {
    try {
      await alohaMemory.addMemory('assistant', 'TECH_SCAN_CRITICAL', JSON.stringify({
        date: new Date().toISOString(),
        message: `⚠️ ${critical.length} KRİTİK Google güncellemesi tespit edildi — ONAY BEKLİYOR`,
        critical: critical.map(f => ({
          topic: f.topic,
          recommendation: f.recommendation,
          projects: f.affectedProjects,
        })),
      }));
    } catch { /* sessiz */ }
  }

  console.log(`[🔬 TECH SCAN] ═══════════════════════════════════════`);
  console.log(`[🔬 TECH SCAN] Taranan: ${searchTopics.length} konu`);
  console.log(`[🔬 TECH SCAN] Bulgu: ${findings.length}`);
  console.log(`[🔬 TECH SCAN] İlgili: ${relevant.length}`);
  console.log(`[🔬 TECH SCAN] Kritik: ${critical.length}`);
  if (critical.length > 0) {
    critical.forEach(f => {
      console.log(`  🔴 ${f.topic}: ${f.recommendation?.substring(0, 100) || 'değerlendiriliyor'}`);
    });
  }
  console.log(`[🔬 TECH SCAN] ═══════════════════════════════════════\n`);

  return { scanned: searchTopics.length, relevant: relevant.length, critical: critical.length, findings };
}

interface TechFinding {
  topic: string;
  rawResult: string;
  scannedAt: string;
  evaluated: boolean;
  impact: 'high' | 'medium' | 'low' | 'none' | 'unknown';
  affectedProjects?: string[];
  recommendation?: string;
  effort?: string;
}

// Güvenli tool çağrısı — hata fırlatmaz
async function executeToolCallSafe(call: { name: string; args: any }): Promise<string> {
  try {
    const { executeToolCall } = await import('./engine');
    return await executeToolCall(call);
  } catch {
    return '';
  }
}

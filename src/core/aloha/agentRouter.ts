/**
 * ALOHA AGENT ROUTER — Multi-Agent Orkestrasyon
 * 
 * Aloha = Manager / Ajanlar = Uzman Uygulayıcılar
 * 
 * Görev tipine göre doğru ajan(lar)ı seçer ve 
 * her biri için özelleştirilmiş system prompt enjekte eder.
 */

// ═══════════════════════════════════════════════════
// AJAN TANIMLARI
// ═══════════════════════════════════════════════════

export interface AgentRole {
  id: string;
  name: string;
  speciality: string;
  systemPromptSuffix: string; // Ana prompt'a eklenir
}

const AGENTS: Record<string, AgentRole> = {
  content_agent: {
    id: 'content_agent',
    name: 'Content Agent',
    speciality: 'İçerik üretimi, haber yazımı, makale oluşturma',
    systemPromptSuffix: `
Sen şu anda İÇERİK UZMAN AJANI rolündesin.
- B2B profesyonel dilde yaz (sektörel terminoloji kullan)
- Minimum 200 kelime, yapılandırılmış paragraflar
- Her haberde: başlık, özet, 3+ paragraf, sonuç
- SEO uyumlu başlık (50-60 karakter)
- Kaynak belirt, halüsinasyon yapma
- 8 dilde çeviri hazırla (TR-first)`,
  },

  image_agent: {
    id: 'image_agent',
    name: 'Image Agent',
    speciality: 'AI görsel üretimi, görsel kalite kontrolü',
    systemPromptSuffix: `
Sen şu anda GÖRSEL UZMAN AJANI rolündesin.
- Imagen 3 ile 2K kalitesinde görsel üret
- "Modern Sanayi Hayranlığı" estetiği: endüstriyel, profesyonel, sıcak tonlar
- Negatif prompt: cartoon, anime, low quality, watermark, text
- Her haber için minimum 1 hero image
- Görsel-haber uyumu: başlıkla ilgili, bağlam doğru`,
  },

  seo_agent: {
    id: 'seo_agent',
    name: 'SEO Agent',
    speciality: 'Arama motoru optimizasyonu, meta veri',
    systemPromptSuffix: `
Sen şu anda SEO UZMAN AJANI rolündesin.
- Title tag: 50-60 karakter, ana anahtar kelime başta
- Meta description: 150-160 karakter, CTA içermeli
- H1 tekil, H2-H3 hiyerarşisi doğru
- Slug: kısa, temiz, Türkçe karakter yok
- Internal linking öner
- Schema.org NewsArticle markup kontrol et`,
  },

  trendsetter: {
    id: 'trendsetter',
    name: 'Trendsetter Agent',
    speciality: 'Piyasa trend analizi, fiyat takibi',
    systemPromptSuffix: `
Sen şu anda TREND ANALİZ AJANI rolündesin.
- Pamuk, iplik, polyester, viskon fiyatlarını izle
- Heimtextil, DOMOTEX, Texworld fuar takvimini takip et
- Sürdürülebilirlik trendleri: recycled polyester, organic cotton
- Renk trendleri: Pantone yıllık rapor
- Coğrafi trendler: DACH pazarı, MENA büyümesi`,
  },

  auditor: {
    id: 'auditor',
    name: 'Auditor Agent',
    speciality: 'Kod kalitesi, güvenlik denetimi, veri tutarlılığı',
    systemPromptSuffix: `
Sen şu anda DENETİM AJANI rolündesin.
- Firestore veri tutarlılığını kontrol et
- Kırık URL ve görselleri tespit et
- API response time anormalliklerini raporla
- Duplicate içerik tespiti
- Trust Score hesapla (tedarikçi için)`,
  },

  apollon: {
    id: 'apollon',
    name: 'Apollon',
    speciality: 'Kurumsal hafıza, geçmiş karar analizi, eleştiri',
    systemPromptSuffix: `
Sen şu anda APOLLON — HAFIZA BEKÇİSİ rolündesin.
- Geçmiş kararları analiz et, ASLA aynı hatayı tekrarlama
- Dalkavukluk yapma, net ve acımasız eleştir
- "Bu daha önce denendi ve başarısız oldu" de
- Memory/Lesson veritabanını tara
- Mantık hatalarını anında işaretle`,
  },

  matchmaker: {
    id: 'matchmaker',
    name: 'Matchmaker Agent',
    speciality: 'B2B alıcı-tedarikçi eşleştirme',
    systemPromptSuffix: `
Sen şu anda B2B EŞLEŞTİRME AJANI rolündesin.
- RFQ analizi: ürün, miktar, sertifika, teslim süresi
- Ağırlıklı puanlama: ürün uyumu %40, kapasite %25, lojistik %20, fiyat %15
- Trust Score 50 altı = KIRMIZI BAYRAK
- Komisyon: %1-5 arası
- 3 alternatif tedarikçi sun`,
  },

  domain_master: {
    id: 'domain_master',
    name: 'Domain Master',
    speciality: '280+ domain federasyonu yönetimi',
    systemPromptSuffix: `
Sen şu anda DOMAIN MASTER AJANI rolündesin.
- Aktif vs pasif domain analizi yap
- Cross-domain sinerji fırsatlarını tespit et
- Yeni domain aktivasyonu planla
- Her domain için ajan sürüsü yapısı öner
- Bütçe sınırı: $500/ay`,
  },
};

// ═══════════════════════════════════════════════════
// GÖREV → AJAN EŞLEŞTİRME
// ═══════════════════════════════════════════════════

type TaskType = 'content' | 'image' | 'seo' | 'trend' | 'verify' | 'memory' | 'b2b' | 'system' | 'general';

interface RouteResult {
  agents: AgentRole[];
  executionOrder: string[];
  combinedPromptSuffix: string;
}

const TASK_AGENT_MAP: Record<TaskType, string[]> = {
  content: ['content_agent', 'seo_agent'],
  image: ['image_agent'],
  seo: ['seo_agent'],
  trend: ['trendsetter'],
  verify: ['auditor'],
  memory: ['apollon'],
  b2b: ['matchmaker'],
  system: ['domain_master', 'auditor'],
  general: [], // Aloha kendisi halleder
};

/**
 * Tool adından görev tipini çıkar
 */
export function detectTaskType(toolName: string, args?: any): TaskType {
  const contentTools = ['compose_article', 'trigger_trtex_master_feed', 'trigger_project_content'];
  const imageTools = ['scan_missing_images', 'update_article_image'];
  const verifyTools = ['verify_project_health', 'analyze_project', 'audit_all_projects', 'check_website'];
  const b2bTools = ['matchmaker_query']; // Gelecekte eklenecek
  const trendTools = ['web_search']; // trend amaçlı arama
  const systemTools = ['deploy_target_project', 'create_new_project'];

  if (contentTools.includes(toolName)) return 'content';
  if (imageTools.includes(toolName)) return 'image';
  if (verifyTools.includes(toolName)) return 'verify';
  if (b2bTools.includes(toolName)) return 'b2b';
  if (systemTools.includes(toolName)) return 'system';
  
  // web_search trend mi yoksa content mi? Args'tan anla
  if (toolName === 'web_search' && args?.query) {
    const q = (args.query as string).toLowerCase();
    if (q.includes('trend') || q.includes('fiyat') || q.includes('price') || q.includes('cotton')) return 'trend';
  }

  return 'general';
}

/**
 * Ana router: Görev tipine göre ajan(lar) seç
 */
export function routeToAgents(taskType: TaskType): RouteResult {
  const agentIds = TASK_AGENT_MAP[taskType] || [];
  const agents = agentIds.map(id => AGENTS[id]).filter(Boolean);

  const combinedPromptSuffix = agents.length > 0
    ? '\n\n## 🤖 AKTİF AJAN ROLLERİ:\n' + agents.map(a => 
        `### ${a.name} (${a.speciality})\n${a.systemPromptSuffix}`
      ).join('\n')
    : '';

  return {
    agents,
    executionOrder: agentIds,
    combinedPromptSuffix,
  };
}

/**
 * Tool çağrısı öncesi ajan context'ini al
 * Engine.ts tarafından executeToolCall içinde çağrılır
 */
export function getAgentContextForTool(toolName: string, args?: any): string {
  const taskType = detectTaskType(toolName, args);
  if (taskType === 'general') return ''; // Ek prompt gerekmiyor
  
  const route = routeToAgents(taskType);
  return route.combinedPromptSuffix;
}

export { AGENTS, TASK_AGENT_MAP };
export type { TaskType, AgentRole as AgentDefinition };

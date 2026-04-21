/**
 * ALOHA TOOL GÜVENLİK KATMANI
 * 
 * Her tool 3 seviyeye ayrılır:
 * - SAFE: Her zaman çalışabilir (analiz, okuma)
 * - RISKY: Onay gerektirir (içerik üretme, yazma)
 * - DESTRUCTIVE: Sadece admin terminal'den açık komutla (delete, deploy)
 * 
 * SAFE ZONES: Aloha sadece belirli dizinlere/koleksiyonlara yazabilir.
 * 
 * ████████████████████████████████████████████████████████████████
 * █  MUTLAK SİLME YASAĞI (TÜM PROJELER İÇİN GEÇERLİ)         █
 * █  - Hiçbir haber, içerik, görsel, dosya SİLİNMEZ             █
 * █  - Eski içerikler ANA SAYFADAN kaldırılır → ARŞİV sayfasına █
 * █    taşınır. SEO link değeri korunur.                         █
 * █  - Arşiv sayfası yoksa OTOMATİK oluşturulur.                █
 * █  - Bu kural TÜM projeler için geçerlidir (TRTEX, Perde,     █
 * █    Hometex, Didimemlak, vs.)                                 █
 * █  - İhlal = KRİTİK HATA.                                     █
 * ████████████████████████████████████████████████████████████████
 */

export type ToolRisk = 'safe' | 'risky' | 'destructive';

export interface ToolPermission {
  risk: ToolRisk;
  description: string;
  requiresApproval: boolean;
  autoExecuteAboveConfidence?: number; // Bu güvenin üstünde otomatik çalış
}

// ═══════════════════════════════════════════════════
// TOOL İZİN HARİTASI
// ═══════════════════════════════════════════════════
export const TOOL_PERMISSIONS: Record<string, ToolPermission> = {
  // 🟢 SAFE — Okuma, analiz, sorgulama
  'analyze_project':           { risk: 'safe',   description: 'Proje analizi', requiresApproval: false },
  'audit_all_projects':        { risk: 'safe',   description: 'Tüm projeleri denetle', requiresApproval: false },
  'global_b2b_strategy_scan':  { risk: 'safe',   description: 'Global strateji tarama', requiresApproval: false },
  'read_project_file':         { risk: 'safe',   description: 'Dosya oku',     requiresApproval: false },
  'read_project_file_range':   { risk: 'safe',   description: 'Dosya satır aralığı oku', requiresApproval: false },
  'search_in_project':         { risk: 'safe',   description: 'Projede metin ara (grep)', requiresApproval: false },
  'list_directory':            { risk: 'safe',   description: 'Dizin listele', requiresApproval: false },
  'verify_project_health':     { risk: 'safe',   description: 'Sağlık kontrolü', requiresApproval: false },
  'query_firestore_database':  { risk: 'safe',   description: 'Firebase sorgu', requiresApproval: false },
  'read_json_database':        { risk: 'safe',   description: 'JSON dosyası oku', requiresApproval: false },
  'check_website':             { risk: 'safe',   description: 'Website health + SEO check', requiresApproval: false },
  'web_search':                { risk: 'safe',   description: 'Web search', requiresApproval: false },
  'fetch_url':                 { risk: 'safe',   description: 'URL içeriği oku', requiresApproval: false },
  'list_plans':                { risk: 'safe',   description: 'Planları listele', requiresApproval: false },

  // 🟡 RISKY — İçerik üretme, yazma (Safe Zone sınırlı)
  'create_execution_plan':     { risk: 'risky',  description: 'Execution plan oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.8 },
  'approve_plan':              { risk: 'risky',  description: 'Planı onayla ve yürüt', requiresApproval: true },
  'trigger_trtex_master_feed': { risk: 'risky',  description: 'TRTEX haber üret', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'trigger_project_content':   { risk: 'risky',  description: 'Proje içerik üret', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'patch_project_file':        { risk: 'risky',  description: 'Cerrahi dosya düzenle', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'write_project_file':        { risk: 'risky',  description: 'Dosya üzerine yaz (tehlikeli)', requiresApproval: true },
  'update_json_database':      { risk: 'risky',  description: 'JSON dosyası güncelle', requiresApproval: true },
  'write_firestore_document':  { risk: 'risky',  description: 'Firebase yaz', requiresApproval: true },
  'run_project_script':        { risk: 'risky',  description: 'Script çalıştır', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'create_aloha_task':         { risk: 'risky',  description: 'ALOHA IDE görev oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'create_new_project':        { risk: 'risky',  description: 'Yeni proje oluştur', requiresApproval: true },
  'scan_missing_images':       { risk: 'risky',  description: 'Görselsiz haberleri tara ve üret', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'update_article_image':      { risk: 'risky',  description: 'Haber görseli güncelle', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'compose_article':           { risk: 'risky',  description: 'Makale oluştur ve yayınla', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'deep_site_audit':           { risk: 'safe',   description: 'Kapsamlı site denetimi (audit + skor)', requiresApproval: false },
  'auto_repair_project':       { risk: 'risky',  description: 'Otonom site onarımı (audit sonrası)', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'research_industry':         { risk: 'safe',   description: 'Güvenli kaynaklardan sektörel araştırma', requiresApproval: false },
  'run_full_repair':           { risk: 'risky',  description: 'Tam site onarım zinciri (audit→repair→content→images→re-audit)', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'run_health_check':          { risk: 'safe',   description: 'Hızlı sağlık kontrol zinciri', requiresApproval: false },
  'run_content_generation':    { risk: 'risky',  description: 'İçerik üretim zinciri (research→produce→images)', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'run_ecosystem_repair':      { risk: 'risky',  description: 'TÜM projeler için sıralı tam onarım', requiresApproval: false, autoExecuteAboveConfidence: 0.95 },
  'send_email':                { risk: 'risky',  description: 'Gmail ile e-posta gönder', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },

  // 🟢 SAFE — Sadece okuma
  'cloud_status':              { risk: 'safe', description: 'Cloud Run servis durumu kontrol', requiresApproval: false },
  'seo_analytics':             { risk: 'safe', description: 'Google Search Console SEO verisi', requiresApproval: false },
  'git_read_file':             { risk: 'safe', description: 'GitHub repo dosya oku', requiresApproval: false },
  'git_search_code':           { risk: 'safe', description: 'GitHub repo kod arama', requiresApproval: false },
  'git_list_dir':              { risk: 'safe', description: 'GitHub repo dizin listele', requiresApproval: false },
  'git_commits':               { risk: 'safe', description: 'Son commit geçmişi', requiresApproval: false },
  'geo_analyze':               { risk: 'safe', description: 'AI arama motoru uyumluluk analizi', requiresApproval: false },
  'analyze_competitor':        { risk: 'safe', description: 'Rakip site analizi', requiresApproval: false },
  'multi_search':              { risk: 'safe', description: 'Çoklu arama motoru sorgusu', requiresApproval: false },

  // 🟡 RISKY — Değiştirici / dış iletişim
  'git_write_file':            { risk: 'risky', description: 'GitHub repo dosya yaz/güncelle', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'git_create_branch':         { risk: 'risky', description: 'GitHub branch oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'git_create_pr':             { risk: 'risky', description: 'GitHub PR oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'google_index':              { risk: 'risky', description: 'Google URL indexleme', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'agent_message':             { risk: 'risky', description: 'Ajanlar arasi mesaj gönder', requiresApproval: false, autoExecuteAboveConfidence: 0.8 },
  'agent_send_and_wait':       { risk: 'risky', description: 'Ajana görev gönder ve cevap bekle', requiresApproval: false, autoExecuteAboveConfidence: 0.8 },

  // 🟢/🟡 TRTEX SİTE YÖNETİCİ ARAÇLARI
  'trtex_site_audit':          { risk: 'safe',  description: 'TRTEX yapısal denetim', requiresApproval: false },
  'trtex_create_page':         { risk: 'risky', description: 'TRTEX yeni sayfa oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_update_page':         { risk: 'risky', description: 'TRTEX sayfa güncelle', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_generate_component':  { risk: 'risky', description: 'TRTEX bileşen üret', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_manage_menu':         { risk: 'risky', description: 'TRTEX navigasyon yönet', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_bootstrap_site':      { risk: 'risky', description: 'TRTEX sıfırdan başlat', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'trtex_get_site_state':      { risk: 'safe',  description: 'TRTEX mevcut durum oku', requiresApproval: false },
  'trtex_apply_patch':         { risk: 'risky', description: 'TRTEX atomic patch uygula', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_enrich_article':      { risk: 'safe',  description: 'TRTEX haber SEO zenginlestir', requiresApproval: false },
  'trtex_batch_enrich':        { risk: 'risky', description: 'TRTEX toplu SEO zenginlestirme', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_lead_stats':          { risk: 'safe',  description: 'TRTEX lead istatistikleri', requiresApproval: false },
  'trtex_search_leads':        { risk: 'safe',  description: 'TRTEX lead arama/filtreleme', requiresApproval: false },
  'trtex_find_matches':        { risk: 'safe',  description: 'TRTEX lead eslestirme bul', requiresApproval: false },
  'trtex_simulate_cost':       { risk: 'safe',  description: 'Urun bazli maliyet simulasyonu', requiresApproval: false },
  'trtex_predict_market':      { risk: 'safe',  description: 'Piyasa trend tahmini', requiresApproval: false },
  'trtex_resolve_conflicts':   { risk: 'safe',  description: 'Coklu sinyal net etki hesapla', requiresApproval: false },
  'trtex_refresh_ticker':      { risk: 'safe',  description: 'Ticker verilerini guncelle', requiresApproval: false },
  'trtex_evaluate_rules':      { risk: 'safe',  description: 'Piyasa kurallarini calistir', requiresApproval: false },


  // 🟢/🟡 UNIVERSAL SITE BUILDER & KARAR MOTORU
  'universal_create_page':     { risk: 'risky', description: 'Universal sayfa oluştur', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'universal_site_audit':      { risk: 'safe',  description: 'Universal site denetimi', requiresApproval: false },
  'universal_get_site_state':  { risk: 'safe',  description: 'Universal site durumu oku', requiresApproval: false },
  'universal_apply_patch':     { risk: 'risky', description: 'Universal sayfa patch uygula', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'strategic_decision':        { risk: 'risky', description: 'Stratejik karar motoru', requiresApproval: false, autoExecuteAboveConfidence: 0.8 },
  'decision_status':           { risk: 'safe',  description: 'Decision engine durumu', requiresApproval: false },
  'learning_cycle':            { risk: 'safe',  description: 'Öğrenme döngüsü', requiresApproval: false },
  'safe_mode_reset':           { risk: 'risky', description: 'Safe mode sıfırla', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'schedule_task':             { risk: 'risky', description: 'Zamanlı görev planla', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'list_tasks':                { risk: 'safe',  description: 'Zamanlanmış görevleri listele', requiresApproval: false },
  'scan_google_tech':          { risk: 'safe',  description: 'Google tech taraması', requiresApproval: false },

  // 🟡 HOMEPAGE BRAIN & TRADE PIPELINE
  'update_homepage_brain':     { risk: 'risky', description: 'Ana sayfa brain güncelle', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'mega_pipeline':             { risk: 'risky', description: 'Mega pipeline (fix→publish→opportunity→landing)', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'run_trade_pipeline':        { risk: 'risky', description: 'Ticaret pipeline çalıştır', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },
  'trade_report':              { risk: 'safe',  description: 'Ticaret raporu oku', requiresApproval: false },
  'trtex_publish_article':     { risk: 'risky', description: 'TRTEX haberi yayınla + index', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'trtex_create_lead':         { risk: 'risky', description: 'TRTEX lead yakalama', requiresApproval: false, autoExecuteAboveConfidence: 0.85 },
  'upgrade_all_articles':      { risk: 'risky', description: 'Tüm haberleri dergi kalitesine yükselt', requiresApproval: false, autoExecuteAboveConfidence: 0.9 },

  // 🔴 DESTRUCTIVE — Sadece admin açık komutla
  'deploy_target_project':     { risk: 'destructive', description: 'Deploy', requiresApproval: true },
  'cloud_deploy':              { risk: 'destructive', description: 'Cloud Run self-deploy', requiresApproval: true },
};

// ═══════════════════════════════════════════════════
// SAFE ZONES — Aloha'nın yazabileceği dizinler
// ═══════════════════════════════════════════════════
const SAFE_WRITE_DIRS = [
  '/content',
  '/news',
  '/data',
  '/public/images',
  '/public/assets',
  '/src/app/news',
  '/src/content',
  '/src/components',
  '/src/app/',
  '/scripts',
  '/_aloha_reports',
  '/.aloha_memory',
  // Uydu projeler — Aloha tüm projelerde dosya düzenleme yetkisine sahip
  '/projeler zip/',
  '/desktop/aipyramweb/',
];

// Aloha Memory dosyası her zaman yazılabilir
const ALWAYS_WRITABLE = [
  '.aloha_memory.md',
  '.aloha_notes.md',
];

const FORBIDDEN_WRITE_DIRS = [
  '/src/core',
  '/src/lib',
  '/src/app/api',
  '/.env',
  '/node_modules',
  '/next.config',
  '/package.json',
  '/tsconfig',
  '/firebase.json',
];

// Firebase'de yazılabilir koleksiyonlar
const SAFE_COLLECTIONS = [
  'trtex_news', 'trtex_content', 'trtex_articles',
  'hometex_news', 'hometex_content', 'hometex_fairs',
  'perde_news', 'perde_content',
  'didimemlak_listings', 'fethiye_listings', 'satilik_content',
  'kalkan_listings', 'immobiliens_listings', 'ultrarent_listings',
  'aipyram_blog', 'mobilya_content', 'didimde_content',
  'aloha_proposals', 'aloha_metrics', 'aloha_memory',
  'aloha_tasks', 'aloha_cycles', 'aloha_lessons', 'aloha_plans',
  'aloha_long_tasks', 'aloha_operations', 'agent_messages', 'aloha_audit_reports',
  'aloha_chain_logs', 'aloha_repair_logs',
  'project_profiles', 'system_state',
  'trtex_pages', 'trtex_components', 'trtex_site_config',
  'trtex_intelligence', 'aloha_tech_intel',
  'aloha_guardrails',
  'trtex_image_hashes',
  'trtex_leads',
  'trtex_matches',
  'trtex_action_cards',
  'trtex_companies',
  'trtex_auto_actions',
  'trtex_task_memory',
  'trtex_executive_history',
  'trtex_pending_approvals',
  // Universal Site Manager koleksiyonları
  'hometex_pages', 'hometex_site_config', 'hometex_components',
  'perde_pages', 'perde_site_config', 'perde_components',
  'didimemlak_pages', 'didimemlak_site_config',
  'aipyram_pages', 'aipyram_site_config', 'aipyram_components',
  // Agent Bus & Decision Engine koleksiyonları
  'aloha_agent_bus', 'aloha_decisions', 'aloha_alerts',
  'aloha_scheduled_tasks', 'aloha_tech_proposals',
  // Signal & Opportunity Engine koleksiyonları
  'aloha_signals', 'aloha_opportunities',
  // Trade Pipeline koleksiyonları
  'trtex_opportunities', 'trtex_landing_pages',
  // Image Queue (Graceful Degradation) + Pipeline Runs
  'trtex_image_queue', 'aloha_pipeline_runs',
  // Terminal Payload Builder (TEK BEYİN TEK ÇIKTI)
  'trtex_terminal',
  // Archive koleksiyonları
  'trtex_archive', 'hometex_archive', 'perde_archive',
];

// ═══════════════════════════════════════════════════
// GÜVENLİK FONKSİYONLARI
// ═══════════════════════════════════════════════════

export function getToolPermission(toolName: string): ToolPermission {
  return TOOL_PERMISSIONS[toolName] || {
    risk: 'destructive',
    description: 'Bilinmeyen araç',
    requiresApproval: true,
  };
}

export function isToolAllowed(toolName: string): boolean {
  // Bilinen tool listesinde yoksa → YASAKLI
  return toolName in TOOL_PERMISSIONS;
}

export function isFileWriteSafe(filePath: string): { safe: boolean; reason: string } {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  const basename = normalized.split('/').pop() || '';

  // Always-writable dosyalar (hafıza notları vb.)
  for (const writable of ALWAYS_WRITABLE) {
    if (basename === writable.toLowerCase()) {
      return { safe: true, reason: `Her zaman yazılabilir: ${writable}` };
    }
  }

  // Yasaklı dizin kontrolü
  for (const forbidden of FORBIDDEN_WRITE_DIRS) {
    if (normalized.includes(forbidden.toLowerCase())) {
      return { safe: false, reason: `YASAKLI DİZİN: ${forbidden} — core sistem dosyalarına dokunulamaz.` };
    }
  }

  // Güvenli dizin kontrolü
  for (const safe of SAFE_WRITE_DIRS) {
    if (normalized.includes(safe.toLowerCase())) {
      return { safe: true, reason: `Güvenli bölge: ${safe}` };
    }
  }

  // Hiçbir kurala uymuyorsa → güvensiz
  return { safe: false, reason: `Bu dizin Safe Zone dışında. Yazma izni yok.` };
}

export function isCollectionWriteSafe(collectionName: string): boolean {
  return SAFE_COLLECTIONS.some(c => collectionName.toLowerCase().includes(c.toLowerCase()));
}

/**
 * Confidence'a göre otomatik çalıştırma kararı
 */
export function shouldAutoExecute(toolName: string, confidence: number): 'auto' | 'dry-run' | 'propose' {
  const perm = getToolPermission(toolName);
  
  if (perm.risk === 'destructive') return 'propose'; // Asla otomatik değil
  
  if (confidence >= (perm.autoExecuteAboveConfidence || 0.95)) return 'auto';
  if (confidence >= 0.7) return 'dry-run';
  return 'propose';
}

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { dlq } from './dlq';

/**
 * UNIVERSAL SITE MANAGER — Aloha'nın TÜM PROJELER İÇİN Site Yapıcı Modülü
 * 
 * TRTEX, Hometex, Perde, Didimemlak ve tüm ekosistem projeleri için
 * sayfa oluşturma, güncelleme, denetim ve yönetim kapasitesi.
 * 
 * Koleksiyon Mapping:
 * - trtex → trtex_pages, trtex_site_config, trtex_components
 * - hometex → hometex_pages, hometex_site_config, hometex_components
 * - perde → perde_pages, perde_site_config, perde_components
 * - didimemlak → didimemlak_pages, didimemlak_site_config
 * - ... (dinamik genişleme)
 */

const ai = alohaAI.getClient();

// ═══════════════════════════════════════
// PROJE → KOLEKSİYON MAPPING
// ═══════════════════════════════════════

interface ProjectSiteConfig {
  pagesCollection: string;
  configCollection: string;
  componentsCollection: string;
  newsCollection: string;
  siteName: string;
  domain: string;
  seoSuffix: string;
}

const PROJECT_SITE_MAP: Record<string, ProjectSiteConfig> = {
  trtex: {
    pagesCollection: 'trtex_pages',
    configCollection: 'trtex_site_config',
    componentsCollection: 'trtex_components',
    newsCollection: 'trtex_news',
    siteName: 'TRTEX B2B',
    domain: 'trtex.com',
    seoSuffix: 'TRTEX B2B Tekstil İstihbaratı',
  },
  hometex: {
    pagesCollection: 'hometex_pages',
    configCollection: 'hometex_site_config',
    componentsCollection: 'hometex_components',
    newsCollection: 'hometex_news',
    siteName: 'Hometex AI',
    domain: 'hometex.ai',
    seoSuffix: 'Hometex AI Sanal Fuar',
  },
  perde: {
    pagesCollection: 'perde_pages',
    configCollection: 'perde_site_config',
    componentsCollection: 'perde_components',
    newsCollection: 'perde_news',
    siteName: 'Perde.AI',
    domain: 'perde.ai',
    seoSuffix: 'Perde.AI Akıllı Perde Tasarım',
  },
  didimemlak: {
    pagesCollection: 'didimemlak_pages',
    configCollection: 'didimemlak_site_config',
    componentsCollection: 'didimemlak_components',
    newsCollection: 'didimemlak_listings',
    siteName: 'Didim Emlak AI',
    domain: 'didimemlak.ai',
    seoSuffix: 'Didim Emlak AI',
  },
  aipyram: {
    pagesCollection: 'aipyram_pages',
    configCollection: 'aipyram_site_config',
    componentsCollection: 'aipyram_components',
    newsCollection: 'aipyram_blog',
    siteName: 'AIPyram',
    domain: 'aipyram.com',
    seoSuffix: 'AIPyram Sovereign AI',
  },
};

function getProjectConfig(project: string): ProjectSiteConfig {
  const normalized = project.toLowerCase().replace('.com', '').replace('.ai', '').replace('.net', '');
  return PROJECT_SITE_MAP[normalized] || {
    pagesCollection: `${normalized}_pages`,
    configCollection: `${normalized}_site_config`,
    componentsCollection: `${normalized}_components`,
    newsCollection: `${normalized}_content`,
    siteName: normalized.toUpperCase(),
    domain: `${normalized}.com`,
    seoSuffix: normalized.toUpperCase(),
  };
}

// ═══════════════════════════════════════
// GUARDRAILS
// ═══════════════════════════════════════

const DAILY_LIMITS = {
  max_page_create: 5,     // tüm projeler toplamı
  max_component_generate: 3,
  max_menu_change: 5,
};

const CRITICAL_PAGES = ['/', 'news', 'index', 'home'];
const PROTECTED_FIELDS = ['slug', 'createdAt'];

async function checkDailyLimit(action: string): Promise<{allowed: boolean; reason?: string}> {
  if (!adminDb) return { allowed: true };
  const today = new Date().toISOString().split('T')[0];
  const key = `universal_${action}_${today}`;
  try {
    const doc = await adminDb.collection('aloha_guardrails').doc(key).get();
    const count = doc.exists ? (doc.data()?.count || 0) : 0;
    const limit = action.includes('page') ? DAILY_LIMITS.max_page_create
                : action.includes('component') ? DAILY_LIMITS.max_component_generate
                : DAILY_LIMITS.max_menu_change;
    if (count >= limit) {
      return { allowed: false, reason: `Günlük ${action} limiti doldu (${count}/${limit}).` };
    }
    await adminDb.collection('aloha_guardrails').doc(key).set(
      { count: count + 1, lastAction: new Date().toISOString() },
      { merge: true }
    );
    return { allowed: true };
  } catch (e) {
    await dlq.recordSilent(e, 'universalSiteManager.guardrail', 'system');
    return { allowed: true };
  }
}

// ═══════════════════════════════════════
// UNIVERSAL SAYFA OLUŞTUR
// ═══════════════════════════════════════

export async function universalCreatePage(params: {
  project: string;
  slug: string;
  title_tr: string;
  title_en?: string;
  template: string;
  content_tr?: string;
  content_en?: string;
  _skipGuardrail?: boolean;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  if (!params._skipGuardrail) {
    const limitCheck = await checkDailyLimit('page_create');
    if (!limitCheck.allowed) return `[GUARDRAIL] ${limitCheck.reason}`;
  }

  const config = getProjectConfig(params.project);
  const { slug, title_tr, title_en, template, content_tr, content_en } = params;

  // Duplicate check
  const existing = await adminDb.collection(config.pagesCollection)
    .where('slug', '==', slug).limit(1).get();
  if (!existing.empty) {
    return `[HATA] '${slug}' sayfası ${params.project}'te zaten mevcut.`;
  }

  // SEO otomatik üretimi
  let seoMeta = {
    meta_title_tr: `${title_tr} | ${config.seoSuffix}`,
    meta_title_en: `${title_en || title_tr} | ${config.siteName}`,
    meta_description_tr: '',
    meta_description_en: '',
  };

  try {
    const seoRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${config.siteName} platformu için "${title_tr}" başlıklı ${template} şablonunda sayfa.
JSON döndür: {"meta_description_tr":"max 160 karakter TR","meta_description_en":"max 160 char EN"}`,
      config: { responseMimeType: 'application/json', temperature: 0.2 }
    });
    if (seoRes.text) {
      const parsed = JSON.parse(seoRes.text);
      seoMeta.meta_description_tr = parsed.meta_description_tr || '';
      seoMeta.meta_description_en = parsed.meta_description_en || '';
    }
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.seoMeta', params.project); }

  const newPage = {
    slug,
    title_tr,
    title_en: title_en || title_tr,
    template,
    seo: seoMeta,
    content_tr: content_tr || '',
    content_en: content_en || '',
    status: 'live',
    order: 999,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
    project: params.project,
  };

  const docRef = await adminDb.collection(config.pagesCollection).add(newPage);
  console.log(`[UNIVERSAL SITE] ✅ ${params.project} → /${slug} oluşturuldu (ID: ${docRef.id})`);

  return `✅ ${params.project.toUpperCase()} sayfası oluşturuldu: /${slug}\nŞablon: ${template}\nSEO: ${seoMeta.meta_description_tr.substring(0, 80)}...\nID: ${docRef.id}`;
}

// ═══════════════════════════════════════
// UNIVERSAL SAYFA GÜNCELLE (PATCH)
// ═══════════════════════════════════════

export async function universalApplyPatch(params: {
  project: string;
  slug: string;
  changes: string;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const config = getProjectConfig(params.project);
  const { slug } = params;

  let changes: Record<string, any>;
  try {
    changes = JSON.parse(params.changes);
  } catch {
    return '[HATA] changes parametresi geçerli JSON değil';
  }

  if (CRITICAL_PAGES.includes(slug)) {
    const dangerousKeys = Object.keys(changes).filter(k =>
      ['template', 'status', 'slug'].includes(k)
    );
    if (dangerousKeys.length > 0) {
      return `[HATA] /${slug} kritik sayfa. template/status/slug değiştirilemez.`;
    }
  }

  const protectedHit = Object.keys(changes).filter(k => PROTECTED_FIELDS.includes(k));
  if (protectedHit.length > 0) {
    return `[HATA] Korumalı alanlar değiştirilemez: ${protectedHit.join(', ')}`;
  }

  const snap = await adminDb.collection(config.pagesCollection)
    .where('slug', '==', slug).limit(1).get();
  if (snap.empty) {
    return `[HATA] '${slug}' sayfası ${params.project}'te bulunamadı.`;
  }

  await snap.docs[0].ref.update({
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
  });

  const changedFields = Object.keys(changes).join(', ');
  console.log(`[UNIVERSAL SITE] ✅ ${params.project} → /${slug} patch: [${changedFields}]`);
  return `✅ ${params.project.toUpperCase()} /${slug} güncellendi: ${changedFields}`;
}

// ═══════════════════════════════════════
// UNIVERSAL DURUM OKU
// ═══════════════════════════════════════

export async function universalGetSiteState(params: { project: string }): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const config = getProjectConfig(params.project);
  const state = {
    config: null as any,
    pages: [] as any[],
    components: [] as any[],
    news_count: 0,
    last_news_date: null as string | null,
  };

  // Config
  try {
    const configDoc = await adminDb.collection(config.configCollection).doc('main').get();
    state.config = configDoc.exists ? configDoc.data() : null;
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.config', params.project); }

  // Pages
  try {
    const pagesSnap = await adminDb.collection(config.pagesCollection).get();
    state.pages = pagesSnap.docs.map(d => ({
      id: d.id,
      slug: d.data().slug,
      title_tr: d.data().title_tr,
      template: d.data().template,
      status: d.data().status,
      updatedAt: d.data().updatedAt,
    }));
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.pages', params.project); }

  // Components
  try {
    const compSnap = await adminDb.collection(config.componentsCollection).get();
    state.components = compSnap.docs.map(d => ({
      name: d.id,
      purpose: d.data().purpose,
      status: d.data().status,
    }));
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.components', params.project); }

  // News count
  try {
    const newsSnap = await adminDb.collection(config.newsCollection)
      .orderBy('createdAt', 'desc').limit(1).get();
    if (!newsSnap.empty) {
      state.last_news_date = newsSnap.docs[0].data().createdAt || newsSnap.docs[0].data().publishedAt;
    }
    const all = await adminDb.collection(config.newsCollection).count().get();
    state.news_count = all.data().count;
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.news', params.project); }

  // Format
  let report = `═══ ${params.project.toUpperCase()} MEVCUT DURUM ═══\n`;
  report += `🌐 Domain: ${config.domain}\n`;
  report += `📋 Config: ${state.config ? '✅ Mevcut' : '❌ YOK'}\n`;
  report += `📄 Sayfalar (${state.pages.length}):${state.pages.length === 0 ? ' YOK' : ''}\n`;
  for (const p of state.pages) {
    report += `  • /${p.slug} [${p.template}] ${p.status} — ${p.title_tr}\n`;
  }
  report += `🧩 Bileşenler: ${state.components.length}\n`;
  report += `📰 İçerikler: ${state.news_count} toplam`;
  if (state.last_news_date) {
    const hoursAgo = Math.round((Date.now() - new Date(state.last_news_date).getTime()) / (1000 * 60 * 60));
    report += ` | Son: ${hoursAgo} saat önce`;
  }
  report += '\n';

  if (state.config?.navigation?.main?.length) {
    report += `🧭 Menü: ${state.config.navigation.main.map((m: any) => m.label_tr).join(' → ')}\n`;
  }

  return report;
}

// ═══════════════════════════════════════
// UNIVERSAL SİTE DENETİMİ
// ═══════════════════════════════════════

export async function universalSiteAudit(params: { project: string }): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const config = getProjectConfig(params.project);
  const issues: Array<{ severity: string; detail: string }> = [];
  let score = 100;
  let totalPages = 0;
  let livePages = 0;

  // 1. Sayfaları tara
  try {
    const pagesSnap = await adminDb.collection(config.pagesCollection).get();
    totalPages = pagesSnap.size;
    for (const doc of pagesSnap.docs) {
      const p = doc.data();
      if (p.status === 'live') livePages++;
      if (!p.seo?.meta_description_tr || p.seo.meta_description_tr.length < 50) {
        issues.push({ severity: '🟡', detail: `SEO meta description eksik: /${p.slug}` });
        score -= 5;
      }
      if (p.template === 'static' && (!p.content_tr || p.content_tr.length < 100)) {
        issues.push({ severity: '🟡', detail: `İçerik boş: /${p.slug}` });
        score -= 10;
      }
    }
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.audit.pages', params.project); }

  // 2. Zorunlu sayfalar
  const requiredPages = ['news', 'about', 'contact'];
  for (const req of requiredPages) {
    const snap = await adminDb.collection(config.pagesCollection)
      .where('slug', '==', req).limit(1).get();
    if (snap.empty) {
      issues.push({ severity: '🔴', detail: `Zorunlu sayfa eksik: /${req}` });
      score -= 15;
    }
  }

  // 3. İçerik tazeliği
  try {
    const newsSnap = await adminDb.collection(config.newsCollection)
      .orderBy('createdAt', 'desc').limit(1).get();
    if (newsSnap.empty) {
      issues.push({ severity: '🔴', detail: `${config.newsCollection} koleksiyonu BOŞ` });
      score -= 20;
    } else {
      const lastDate = new Date(newsSnap.docs[0].data().createdAt || newsSnap.docs[0].data().publishedAt).getTime();
      const hoursAgo = (Date.now() - lastDate) / (1000 * 60 * 60);
      if (hoursAgo > 48) {
        issues.push({ severity: '🟡', detail: `Son içerik ${Math.round(hoursAgo)} saat eski` });
        score -= 10;
      }
    }
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.audit.freshness', params.project); }

  // 4. Config kontrolü
  try {
    const configDoc = await adminDb.collection(config.configCollection).doc('main').get();
    if (!configDoc.exists) {
      issues.push({ severity: '🔴', detail: 'Site config henüz oluşturulmamış' });
      score -= 10;
    }
  } catch (e) { await dlq.recordSilent(e, 'universalSiteManager.audit.config', params.project); }

  score = Math.max(0, score);
  const criticals = issues.filter(i => i.severity === '🔴').length;
  const warnings = issues.filter(i => i.severity === '🟡').length;

  let report = `═══ ${params.project.toUpperCase()} SİTE DENETİM RAPORU ═══\n`;
  report += `📊 Skor: ${score}/100\n`;
  report += `📄 Sayfalar: ${totalPages} (${livePages} canlı)\n`;
  report += `🔴 Kritik: ${criticals} | 🟡 Uyarı: ${warnings}\n\n`;

  if (issues.length > 0) {
    report += `── SORUNLAR ──\n`;
    for (const issue of issues) {
      report += `${issue.severity} ${issue.detail}\n`;
    }
  } else {
    report += `✅ Sorun bulunamadı — site sağlıklı!\n`;
  }

  return report;
}

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { dlq } from './dlq';

/**
 * TRTEX SITE MANAGER — Aloha'nın TRTEX Site Yapıcı Modülü
 * 
 * Aloha bu modülle TRTEX'i sıfırdan inşa edebilir:
 * - Sayfa oluştur/güncelle/sil
 * - Site yapısal denetim yap
 * - Navigasyon yönet
 * - SEO metadata güncelle
 * - Bileşen üret ve doğrula
 * 
 * Tüm veri Firebase Firestore'da saklanır.
 * Koleksiyonlar: trtex_site_config, trtex_pages, trtex_components
 */

const ai = alohaAI.getClient();

// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface TRTEXPage {
  slug: string;
  title_tr: string;
  title_en: string;
  template: 'news_list' | 'news_detail' | 'static' | 'category' | 'landing' | 'contact' | 'about';
  components: string[];
  seo: {
    meta_title_tr: string;
    meta_title_en: string;
    meta_description_tr: string;
    meta_description_en: string;
    og_image?: string;
    canonical?: string;
  };
  content_tr?: string;
  content_en?: string;
  status: 'live' | 'draft' | 'disabled';
  order: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: 'aloha' | 'manual';
}

export interface TRTEXNavItem {
  label_tr: string;
  label_en: string;
  href: string;
  order: number;
  icon?: string;
  children?: TRTEXNavItem[];
}

export interface TRTEXSiteConfig {
  siteName: string;
  domain: string;
  defaultLocale: string;
  supportedLocales: string[];
  navigation: {
    main: TRTEXNavItem[];
    footer: TRTEXNavItem[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    darkMode: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
    twitterHandle: string;
    sitemap: boolean;
  };
  features: {
    relatedNews: boolean;
    breadcrumbs: boolean;
    newsletter: boolean;
    chatWidget: boolean;
    intelligenceDashboard: boolean;
  };
  updatedAt: string;
  updatedBy: 'aloha' | 'manual';
}

export interface SiteAuditResult {
  totalPages: number;
  livePages: number;
  draftPages: number;
  issues: SiteAuditIssue[];
  score: number;
  recommendations: string[];
}

interface SiteAuditIssue {
  type: 'missing_page' | 'broken_seo' | 'empty_content' | 'stale_content' | 'missing_nav' | 'no_og_image';
  severity: 'critical' | 'warning' | 'info';
  page?: string;
  detail: string;
}

// ═══════════════════════════════════════
// 🔒 GUARDRAILS — Otonom Kontrol Limitleri
// ═══════════════════════════════════════

const DAILY_LIMITS = {
  max_page_create: 3,
  max_component_generate: 2,
  max_menu_change: 3,
};

// Aloha'nın üretebileceği bileşenler (whitelist)
const ALLOWED_COMPONENTS = [
  'RelatedNews', 'Breadcrumb', 'MarketCard', 'SectorCard',
  'NewsGrid', 'CategoryFilter', 'ShareButtons', 'StickyMiniBar',
  'ContactForm', 'AboutHero', 'HeroOpportunityBanner',
];

// Kritik sayfalar — Aloha READONLY (sadece content güncelleyebilir, silinemez/template değiştirilemez)
const CRITICAL_PAGES = ['/', 'news', 'index'];

// Güvenli alan kontrolleri — sadece bu listede olmayan alanlar güncellenemez
const PROTECTED_FIELDS = ['slug', 'createdAt']; // Slug ve oluşturma tarihi değiştirilemez

async function checkDailyLimit(action: 'page_create' | 'component_generate' | 'menu_change'): Promise<{allowed: boolean; reason?: string}> {
  if (!adminDb) return { allowed: true };
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `aloha_guardrail_${action}_${today}`;
  
  try {
    const doc = await adminDb.collection('aloha_guardrails').doc(key).get();
    const count = doc.exists ? (doc.data()?.count || 0) : 0;
    const limit = action === 'page_create' ? DAILY_LIMITS.max_page_create 
                : action === 'component_generate' ? DAILY_LIMITS.max_component_generate
                : DAILY_LIMITS.max_menu_change;
    
    if (count >= limit) {
      return { allowed: false, reason: `Günlük ${action} limiti doldu (${count}/${limit}). Yarın tekrar dene.` };
    }
    
    // Sayacı artır
    await adminDb.collection('aloha_guardrails').doc(key).set(
      { count: count + 1, lastAction: new Date().toISOString() },
      { merge: true }
    );
    return { allowed: true };
  } catch (e) {
    await dlq.recordSilent(e, 'trtexSiteManager.guardrail', 'trtex');
    return { allowed: true }; // Guardrail DB'ye ulasılamazsa devam et
  }
}

// ═══════════════════════════════════════
// STATE OKUMA — Aloha önce bunu okur, sonra karar verir
// ═══════════════════════════════════════

/**
 * TRTEX site'ın tam durumunu oku — Aloha her işlem öncesi bunu çağırmalı
 */
export async function trtexGetSiteState(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const state: {
    config: any;
    pages: any[];
    components: any[];
    news_count: number;
    last_news_date: string | null;
  } = {
    config: null,
    pages: [],
    components: [],
    news_count: 0,
    last_news_date: null,
  };

  // 1. Site Config
  try {
    const configDoc = await adminDb.collection('trtex_site_config').doc('main').get();
    state.config = configDoc.exists ? configDoc.data() : null;
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.config', 'trtex'); }

  // 2. Tüm sayfalar
  try {
    const pagesSnap = await adminDb.collection('trtex_pages').get();
    state.pages = pagesSnap.docs.map(d => ({
      id: d.id,
      slug: d.data().slug,
      title_tr: d.data().title_tr,
      template: d.data().template,
      status: d.data().status,
      components: d.data().components,
      updatedAt: d.data().updatedAt,
    }));
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.pages', 'trtex'); }

  // 3. Bileşenler
  try {
    const compSnap = await adminDb.collection('trtex_components').get();
    state.components = compSnap.docs.map(d => ({
      name: d.id,
      purpose: d.data().purpose,
      status: d.data().status,
      updatedAt: d.data().createdAt,
    }));
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.components', 'trtex'); }

  // 4. Haber istatistikleri
  try {
    const newsSnap = await adminDb.collection('trtex_news')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (!newsSnap.empty) {
      state.last_news_date = newsSnap.docs[0].data().createdAt || newsSnap.docs[0].data().publishedAt;
    }
    
    // Toplam haber sayısı (countdan çek — büyük koleksiyonlar için)
    const allNews = await adminDb.collection('trtex_news').count().get();
    state.news_count = allNews.data().count;
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.news', 'trtex'); }

  // Formatla
  let report = `═══ TRTEX MEVCUT DURUM ═══\n`;
  report += `📋 Config: ${state.config ? '✅ Mevcut' : '❌ YOK — bootstrap gerekli'}\n`;
  report += `📄 Sayfalar (${state.pages.length}):${state.pages.length === 0 ? ' YOK' : ''}\n`;
  for (const p of state.pages) {
    report += `  • /${p.slug} [${p.template}] ${p.status} — ${p.title_tr}\n`;
  }
  report += `🧩 Bileşenler (${state.components.length}):${state.components.length === 0 ? ' YOK' : ''}\n`;
  for (const c of state.components) {
    report += `  • ${c.name} (${c.status})\n`;
  }
  report += `📰 Haberler: ${state.news_count} toplam`;
  if (state.last_news_date) {
    const hoursAgo = Math.round((Date.now() - new Date(state.last_news_date).getTime()) / (1000 * 60 * 60));
    report += ` | Son: ${hoursAgo} saat önce`;
  }
  report += '\n';

  // Navigation bilgisi
  if (state.config?.navigation?.main?.length) {
    report += `🧭 Menü: ${state.config.navigation.main.map((m: any) => m.label_tr).join(' → ')}\n`;
  }

  return report;
}

// ═══════════════════════════════════════
// PATCH — Atomic Toplu Güncelleme
// ═══════════════════════════════════════

/**
 * TRTEX sayfasına atomic JSON patch uygula — birden fazla alanı tek seferde günceller
 */
export async function trtexApplyPatch(params: {
  slug: string;
  changes: string; // JSON string: { "title_tr": "...", "seo.meta_description_tr": "..." }
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const { slug } = params;
  
  let changes: Record<string, any>;
  try {
    changes = JSON.parse(params.changes);
  } catch {
    return '[HATA] changes parametresi geçerli JSON değil';
  }

  // Kritik sayfa koruması
  if (CRITICAL_PAGES.includes(slug)) {
    // Kritik sayfalarda sadece content ve SEO güncellenebilir
    const dangerousKeys = Object.keys(changes).filter(k => 
      ['template', 'status', 'slug'].includes(k)
    );
    if (dangerousKeys.length > 0) {
      return `[HATA] /${slug} kritik sayfadır. template/status/slug değiştirilemez. Sadece content ve SEO güncellenebilir.`;
    }
  }

  // Korumalı alan kontrolü
  const protectedHit = Object.keys(changes).filter(k => PROTECTED_FIELDS.includes(k));
  if (protectedHit.length > 0) {
    return `[HATA] Korumalı alanlar değiştirilemez: ${protectedHit.join(', ')}`;
  }

  const snap = await adminDb.collection('trtex_pages').where('slug', '==', slug).limit(1).get();
  if (snap.empty) {
    return `[HATA] '${slug}' sayfası bulunamadı.`;
  }

  const docRef = snap.docs[0].ref;
  const patchData: Record<string, any> = {
    ...changes,
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
  };

  await docRef.update(patchData);

  const changedFields = Object.keys(changes).join(', ');
  console.log(`[TRTEX SITE] ✅ Patch uygulandı: /${slug} → [${changedFields}]`);
  return `✅ /${slug} güncellendi (atomic patch): ${changedFields}`;
}

// ═══════════════════════════════════════
// SAYFA YÖNETİMİ
// ═══════════════════════════════════════

/**
 * Yeni TRTEX sayfası oluştur
 */
export async function trtexCreatePage(params: {
  slug: string;
  title_tr: string;
  title_en?: string;
  template: TRTEXPage['template'];
  content_tr?: string;
  content_en?: string;
  components?: string[];
  _skipGuardrail?: boolean; // Bootstrap'tan çağrılınca limit kontrolü atla
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  // 🔒 Günlük limit kontrolü
  if (!params._skipGuardrail) {
    const limitCheck = await checkDailyLimit('page_create');
    if (!limitCheck.allowed) return `[GUARDRAIL] ${limitCheck.reason}`;
  }

  const { slug, title_tr, title_en, template, content_tr, content_en, components } = params;

  // Duplicate check
  const existing = await adminDb.collection('trtex_pages').where('slug', '==', slug).limit(1).get();
  if (!existing.empty) {
    return `[HATA] '${slug}' slug'ına sahip sayfa zaten mevcut. Güncellemek için trtex_update_page kullan.`;
  }

  // SEO otomatik üretimi
  let seoMeta = {
    meta_title_tr: `${title_tr} | TRTEX B2B Tekstil İstihbaratı`,
    meta_title_en: `${title_en || title_tr} | TRTEX B2B Textile Intelligence`,
    meta_description_tr: '',
    meta_description_en: '',
  };

  try {
    const seoRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `TRTEX B2B tekstil istihbarat platformu için "${title_tr}" başlıklı sayfa.
Şablon: ${template}. 
JSON döndür: {"meta_description_tr":"max 160 karakter TR","meta_description_en":"max 160 char EN"}`,
      config: { responseMimeType: 'application/json', temperature: 0.2 }
    });
    if (seoRes.text) {
      const parsed = JSON.parse(seoRes.text);
      seoMeta.meta_description_tr = parsed.meta_description_tr || '';
      seoMeta.meta_description_en = parsed.meta_description_en || '';
    }
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.seoMeta', 'trtex'); }

  const newPage: TRTEXPage = {
    slug,
    title_tr,
    title_en: title_en || title_tr,
    template,
    components: components || getDefaultComponents(template),
    seo: seoMeta,
    content_tr: content_tr || '',
    content_en: content_en || '',
    status: 'live',
    order: 999,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
  };

  const docRef = await adminDb.collection('trtex_pages').add(newPage);
  console.log(`[TRTEX SITE] ✅ Yeni sayfa oluşturuldu: /${slug} (ID: ${docRef.id})`);

  return `✅ TRTEX sayfası oluşturuldu: /${slug}\nŞablon: ${template}\nBileşenler: ${newPage.components.join(', ')}\nSEO: ${seoMeta.meta_description_tr.substring(0, 80)}...\nID: ${docRef.id}`;
}

/**
 * Mevcut TRTEX sayfasını güncelle
 */
export async function trtexUpdatePage(params: {
  slug: string;
  field: string;
  value: string;
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const { slug, field, value } = params;

  const snap = await adminDb.collection('trtex_pages').where('slug', '==', slug).limit(1).get();
  if (snap.empty) {
    return `[HATA] '${slug}' sayfası bulunamadı.`;
  }

  const docRef = snap.docs[0].ref;
  const updateData: Record<string, any> = {
    [field]: value,
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
  };

  // Nested fields (seo.meta_title_tr gibi) destekle
  await docRef.update(updateData);

  console.log(`[TRTEX SITE] ✅ Sayfa güncellendi: /${slug} → ${field}`);
  return `✅ /${slug} sayfasının '${field}' alanı güncellendi.`;
}

// ═══════════════════════════════════════
// SİTE DENETİMİ
// ═══════════════════════════════════════

/**
 * TRTEX site yapısal denetimi
 */
export async function trtexSiteAudit(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const result: SiteAuditResult = {
    totalPages: 0,
    livePages: 0,
    draftPages: 0,
    issues: [],
    score: 100,
    recommendations: [],
  };

  // 1. Sayfaları tara
  const pagesSnap = await adminDb.collection('trtex_pages').get();
  const pages = pagesSnap.docs.map(d => ({ id: d.id, ...d.data() as TRTEXPage }));
  result.totalPages = pages.length;
  result.livePages = pages.filter(p => p.status === 'live').length;
  result.draftPages = pages.filter(p => p.status === 'draft').length;

  // 2. Zorunlu sayfaları kontrol et
  const requiredPages = ['/', '/news', '/about', '/contact', '/markets'];
  const existingSlugs = pages.map(p => `/${p.slug}`);

  for (const required of requiredPages) {
    const slug = required === '/' ? '/' : required;
    if (!existingSlugs.includes(slug) && !existingSlugs.includes(slug.replace('/', ''))) {
      result.issues.push({
        type: 'missing_page',
        severity: 'critical',
        page: required,
        detail: `Zorunlu sayfa eksik: ${required}`,
      });
      result.score -= 15;
    }
  }

  // 3. Her sayfanın SEO'sunu kontrol et
  for (const page of pages) {
    if (!page.seo?.meta_description_tr || page.seo.meta_description_tr.length < 50) {
      result.issues.push({
        type: 'broken_seo',
        severity: 'warning',
        page: `/${page.slug}`,
        detail: `Meta description eksik veya kısa: /${page.slug}`,
      });
      result.score -= 5;
    }

    if (!page.seo?.og_image) {
      result.issues.push({
        type: 'no_og_image',
        severity: 'info',
        page: `/${page.slug}`,
        detail: `OG Image eksik: /${page.slug}`,
      });
      result.score -= 2;
    }

    if (page.template === 'static' && (!page.content_tr || page.content_tr.length < 100)) {
      result.issues.push({
        type: 'empty_content',
        severity: 'warning',
        page: `/${page.slug}`,
        detail: `Statik sayfa içeriği boş veya çok kısa: /${page.slug}`,
      });
      result.score -= 10;
    }
  }

  // 4. Haber koleksiyonunu kontrol et
  try {
    const newsSnap = await adminDb.collection('trtex_news')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (newsSnap.empty) {
      result.issues.push({
        type: 'empty_content',
        severity: 'critical',
        detail: 'trtex_news koleksiyonu BOŞ — acil haber üretilmeli',
      });
      result.score -= 20;
    } else {
      const lastNews = newsSnap.docs[0].data();
      const lastDate = new Date(lastNews.createdAt || lastNews.publishedAt).getTime();
      const hoursAgo = (Date.now() - lastDate) / (1000 * 60 * 60);
      if (hoursAgo > 24) {
        result.issues.push({
          type: 'stale_content',
          severity: 'warning',
          detail: `Son haber ${Math.round(hoursAgo)} saat önce yayınlanmış — taze içerik gerekli`,
        });
        result.score -= 10;
      }
    }
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.audit.freshness', 'trtex'); }

  // 5. Navigasyon kontrolü
  try {
    const configDoc = await adminDb.collection('trtex_site_config').doc('main').get();
    if (!configDoc.exists) {
      result.issues.push({
        type: 'missing_nav',
        severity: 'critical',
        detail: 'Site config dokümanı (trtex_site_config/main) henüz oluşturulmamış',
      });
      result.score -= 10;
      result.recommendations.push('trtex_manage_menu ile navigasyon oluştur');
    }
  } catch (e) { await dlq.recordSilent(e, 'trtexSiteManager.audit.config', 'trtex'); }

  // 6. Öneriler
  if (result.totalPages < 5) {
    result.recommendations.push('En az 5 temel sayfa oluştur: /, /news, /markets, /about, /contact');
  }
  if (result.issues.filter(i => i.type === 'broken_seo').length > 0) {
    result.recommendations.push('Eksik SEO meta description\'ları tamamla');
  }

  result.score = Math.max(0, result.score);

  // Formatla
  const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
  const warningCount = result.issues.filter(i => i.severity === 'warning').length;

  let report = `═══ TRTEX SİTE DENETİM RAPORU ═══\n`;
  report += `📊 Skor: ${result.score}/100\n`;
  report += `📄 Toplam Sayfa: ${result.totalPages} (${result.livePages} canlı, ${result.draftPages} taslak)\n`;
  report += `🔴 Kritik: ${criticalCount} | 🟡 Uyarı: ${warningCount}\n\n`;

  if (result.issues.length > 0) {
    report += `── SORUNLAR ──\n`;
    for (const issue of result.issues) {
      const icon = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
      report += `${icon} ${issue.detail}\n`;
    }
    report += '\n';
  }

  if (result.recommendations.length > 0) {
    report += `── ÖNERİLER ──\n`;
    for (const rec of result.recommendations) {
      report += `💡 ${rec}\n`;
    }
  }

  return report;
}

// ═══════════════════════════════════════
// NAVİGASYON YÖNETİMİ
// ═══════════════════════════════════════

/**
 * TRTEX navigasyon menüsünü güncelle
 */
export async function trtexManageMenu(params: {
  menu_type: 'main' | 'footer';
  items: string; // JSON string
}): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const { menu_type, items } = params;

  let parsedItems: TRTEXNavItem[];
  try {
    parsedItems = JSON.parse(items);
  } catch {
    return '[HATA] items parametresi geçerli JSON değil';
  }

  const configRef = adminDb.collection('trtex_site_config').doc('main');
  const configDoc = await configRef.get();

  const updateField = `navigation.${menu_type}`;
  if (configDoc.exists) {
    await configRef.update({
      [updateField]: parsedItems,
      updatedAt: new Date().toISOString(),
      updatedBy: 'aloha',
    });
  } else {
    // İlk defa oluştur — varsayılan config ile
    const defaultConfig: TRTEXSiteConfig = getDefaultSiteConfig();
    defaultConfig.navigation[menu_type] = parsedItems;
    await configRef.set(defaultConfig);
  }

  console.log(`[TRTEX SITE] ✅ ${menu_type} menü güncellendi (${parsedItems.length} öğe)`);
  return `✅ TRTEX ${menu_type} menüsü güncellendi: ${parsedItems.length} öğe kaydedildi.`;
}

// ═══════════════════════════════════════
// BİLEŞEN ÜRETİMİ
// ═══════════════════════════════════════

/**
 * TRTEX için React bileşeni üret
 */
export async function trtexGenerateComponent(params: {
  name: string;
  purpose: string;
  data_source?: string;
}): Promise<string> {
  // 🔒 Günlük limit kontrolü
  const limitCheck = await checkDailyLimit('component_generate');
  if (!limitCheck.allowed) return `[GUARDRAIL] ${limitCheck.reason}`;

  // 🔒 Whitelist kontrolü
  if (!ALLOWED_COMPONENTS.includes(params.name)) {
    return `[GUARDRAIL] '${params.name}' bileşeni whitelist'te yok. İzin verilen: ${ALLOWED_COMPONENTS.join(', ')}`;
  }

  const { name, purpose, data_source } = params;

  const componentPrompt = `Sen TRTEX B2B tekstil istihbarat platformunun React geliştiricisisin.
Aşağıdaki bileşeni oluştur:

BİLEŞEN: ${name}
AMAÇ: ${purpose}
VERİ KAYNAĞI: ${data_source || 'Firebase Firestore (trtex_intelligence)'}

TEKNOLOJİ: React 18 + TypeScript + TailwindCSS 4 + Radix UI + Lucide Icons
STİL: Brutalist B2B Intelligence Terminal — High-Density, 1px grid, serif/sans bileşimi
YASAK: Blog stili, gereksiz whitespace, placeholder görsel

KURALLAR:
1. 'use client' direktifi ile başla
2. Responsive olmalı (mobile-first)
3. Framer Motion ile micro-animation ekle
4. force-dynamic — client cache YASAK
5. TR ve EN dil desteği (next-intl veya basit ternary)
6. Hata durumlarını handle et (loading, empty, error states)

SADECE KOD DÖNDÜR — açıklama veya markdown YAZMA.`;

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: componentPrompt,
    });

    let code = res.text || '';
    code = code.replace(/```(?:tsx|ts|javascript|js)?/g, '').replace(/```/g, '').trim();

    if (!code || code.length < 50) {
      return '[HATA] Bileşen üretilemedi — Gemini boş çıktı verdi';
    }

    // Firestore'a kaydet
    if (adminDb) {
      await adminDb.collection('trtex_components').doc(name).set({
        name,
        purpose,
        data_source: data_source || 'trtex_intelligence',
        code,
        status: 'generated',
        createdAt: new Date().toISOString(),
        updatedBy: 'aloha',
      });
    }

    console.log(`[TRTEX SITE] ✅ Bileşen üretildi: ${name} (${code.length} karakter)`);
    return `✅ TRTEX bileşeni üretildi: ${name}\nAmaç: ${purpose}\nBoyut: ${code.length} karakter\nDurum: Firestore'a kaydedildi (trtex_components/${name})\n\nKod önizleme (ilk 300 karakter):\n${code.substring(0, 300)}...`;
  } catch (err: any) {
    return `[HATA] Bileşen üretilemedi: ${err.message}`;
  }
}

// ═══════════════════════════════════════
// SİTE BAŞLATMA (Sıfırdan Kurulum)
// ═══════════════════════════════════════

/**
 * TRTEX sitesini sıfırdan başlat — tüm temel yapıyı oluştur
 */
export async function trtexBootstrapSite(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase Admin bağlantısı yok';

  const results: string[] = [];

  // 🔒 BOOTSTRAP LOCK — Kazara sıfırlama engeli
  const configRef = adminDb.collection('trtex_site_config').doc('main');
  const configDoc = await configRef.get();
  if (configDoc.exists && configDoc.data()?.bootstrap_lock === true) {
    return '[GUARDRAIL] Bootstrap zaten tamamlanmış ve KİLİTLİ. Site sıfırlanamaz. Manuel kilit açma gerekli.';
  }

  // 1. Site Config oluştur
  if (!configDoc.exists) {
    const config = getDefaultSiteConfig();
    (config as any).bootstrap_lock = true; // Kilitle!
    await configRef.set(config);
    results.push('✅ Site config oluşturuldu + 🔒 kilitlendi');
  } else {
    // Var ama kilitli değil — kilitle
    await configRef.update({ bootstrap_lock: true });
    results.push('⏭️ Site config zaten mevcut — 🔒 kilitlendi');
  }

  // 2. Temel sayfaları oluştur
  // Hakan Bey spec: SADE başla — sadece zorunlu sayfalar
  const corePages: Array<Omit<Parameters<typeof trtexCreatePage>[0], 'slug'> & { slug: string }> = [
    { slug: 'news', title_tr: 'B2B Tekstil Haberleri', title_en: 'B2B Textile News', template: 'news_list' },
    { slug: 'markets', title_tr: 'Pazar İstihbaratı', title_en: 'Market Intelligence', template: 'category' },
    { slug: 'about', title_tr: 'Hakkımızda', title_en: 'About Us', template: 'about' },
    { slug: 'contact', title_tr: 'İletişim', title_en: 'Contact', template: 'contact' },
  ];

  for (const page of corePages) {
    const res = await trtexCreatePage({ ...page, _skipGuardrail: true });
    results.push(res.includes('HATA') || res.includes('GUARDRAIL') ? `⏭️ /${page.slug} (zaten mevcut)` : `✅ /${page.slug}`);
  }

  // 3. Varsayılan navigasyon — sade ve net
  const mainNav: TRTEXNavItem[] = [
    { label_tr: 'Ana Sayfa', label_en: 'Home', href: '/', order: 1 },
    { label_tr: 'Haberler', label_en: 'News', href: '/news', order: 2 },
    { label_tr: 'Pazarlar', label_en: 'Markets', href: '/markets', order: 3 },
    { label_tr: 'Hakkımızda', label_en: 'About', href: '/about', order: 4 },
    { label_tr: 'İletişim', label_en: 'Contact', href: '/contact', order: 5 },
  ];
  await trtexManageMenu({ menu_type: 'main', items: JSON.stringify(mainNav) });
  results.push('✅ Ana navigasyon oluşturuldu');

  return `═══ TRTEX SİTE BOOTSTRAP TAMAMLANDI ═══\n${results.join('\n')}\n\nSite sıfırdan kuruldu. trtex_site_audit ile kontrol et.`;
}

// ═══════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════

function getDefaultComponents(template: TRTEXPage['template']): string[] {
  const componentMap: Record<string, string[]> = {
    news_list: ['StickyMiniBar', 'NewsGrid', 'CategoryFilter', 'Pagination', 'RelatedTopics'],
    news_detail: ['StickyMiniBar', 'ArticleHeader', 'ArticleBody', 'RelatedNews', 'Breadcrumb', 'ShareButtons'],
    category: ['StickyMiniBar', 'CategoryHero', 'SectorCards', 'MarketPulse'],
    static: ['StickyMiniBar', 'PageHeader', 'ContentBlock'],
    landing: ['HeroOpportunityBanner', 'SupplyChainMonitor', 'DailyInsight', 'NewsGrid', 'SectorCards'],
    contact: ['StickyMiniBar', 'ContactForm', 'CompanyInfo', 'Map'],
    about: ['StickyMiniBar', 'AboutHero', 'TeamGrid', 'Timeline', 'Stats'],
  };
  return componentMap[template] || ['StickyMiniBar', 'ContentBlock'];
}

function getDefaultSiteConfig(): TRTEXSiteConfig {
  return {
    siteName: 'TRTEX B2B',
    domain: 'trtex.com',
    defaultLocale: 'tr',
    supportedLocales: ['tr', 'en', 'de', 'ar', 'zh', 'es', 'fr', 'ru'],
    navigation: {
      main: [],
      footer: [],
    },
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#064e3b',
      accentColor: '#f59e0b',
      fontFamily: 'Inter, system-ui, sans-serif',
      darkMode: true,
    },
    seo: {
      defaultTitle: 'TRTEX — B2B Tekstil Ticaret İstihbaratı',
      defaultDescription: 'Türk tekstil sektörünün B2B ticaret istihbarat platformu. Canlı pazar verileri, ihracat fırsatları ve sektörel analizler.',
      ogImage: 'https://trtex.com/og-image.png',
      twitterHandle: '@trtex',
      sitemap: true,
    },
    features: {
      relatedNews: true,
      breadcrumbs: true,
      newsletter: false,
      chatWidget: false,
      intelligenceDashboard: true,
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'aloha',
  };
}

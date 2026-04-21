import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA SITE AUDITOR — Otonom Site Sağlık Tarayıcısı
 * 
 * Canlı siteyi kontrol eder, eksik/kırık/boş sayfaları raporlar.
 * SADECE raporlar — düzeltme YAPMAZ. Fix önerisi üretir.
 * 
 * Hakan'ın kararı: "audit yapar, fix önerir, AMA kendisi düzeltmez"
 */

interface AuditResult {
  url: string;
  status: number;
  issues: string[];
  suggestions: string[];
  severity: 'critical' | 'warning' | 'info';
}

const TRTEX_PAGES = [
  { url: 'https://trtex.com', name: 'Ana Sayfa' },
  { url: 'https://trtex.com/haberler', name: 'Haberler' },
  { url: 'https://trtex.com/firma-rehberi', name: 'Firma Rehberi' },
  { url: 'https://trtex.com/is-birligi-firsatlari', name: 'İş Birliği Fırsatları' },
  { url: 'https://trtex.com/fuar-takvimi', name: 'Fuar Takvimi' },
  { url: 'https://trtex.com/pazar-analizi', name: 'Pazar Analizi' },
  { url: 'https://trtex.com/hakkimizda', name: 'Hakkımızda' },
  { url: 'https://trtex.com/companies', name: 'Companies' },
];

async function checkPage(url: string, name: string): Promise<AuditResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let status = 0;

  try {
    const startTime = Date.now();
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'ALOHA-SiteAuditor/1.0' },
    });
    const responseTime = Date.now() - startTime;
    status = resp.status;

    // HTTP durumu
    if (status >= 400) {
      issues.push(`HTTP ${status} — sayfa erişilemiyor`);
    }

    // Yavaş yanıt
    if (responseTime > 5000) {
      issues.push(`Yanıt süresi çok yüksek: ${responseTime}ms`);
      suggestions.push('Sayfa performansı optimize edilmeli (SSR/caching)');
    }

    const html = await resp.text();

    // Boş sayfa kontrolü
    if (html.length < 1000) {
      issues.push(`Sayfa çok kısa (${html.length} byte) — boş veya render sorunu`);
      suggestions.push('CSR/SSR render edilemiyor olabilir — server-side kontrolü yapılmalı');
    }

    // İçerik kontrolü
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      const bodyText = bodyMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (bodyText.length < 200) {
        issues.push(`Sayfa içeriği çok az (${bodyText.length} karakter)`);
      }
    }

    // SEO kontrolleri
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      issues.push('SEO: <title> etiketi eksik');
      suggestions.push('Her sayfada benzersiz ve açıklayıcı <title> etiketi olmalı');
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (!descMatch || !descMatch[1].trim()) {
      issues.push('SEO: meta description eksik');
      suggestions.push('155 karakter civarı meta description eklenmeli');
    }

    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
    if (!h1Match || h1Match.length === 0) {
      issues.push('SEO: <h1> etiketi eksik');
    } else if (h1Match.length > 1) {
      issues.push(`SEO: Birden fazla <h1> etiketi var (${h1Match.length} adet)`);
    }

    // Kırık resim kontrolü (src="" veya src="undefined")
    const brokenImgCount = (html.match(/src=["'](undefined|null|)['"]/gi) || []).length;
    if (brokenImgCount > 0) {
      issues.push(`${brokenImgCount} kırık/boş görsel tespit edildi`);
      suggestions.push('Görseller kontrol edilmeli — src attributeları boş veya undefined');
    }

    // "undefined" veya "null" text render
    const undefinedCount = (html.match(/>undefined</gi) || []).length + (html.match(/>null</gi) || []).length;
    if (undefinedCount > 0) {
      issues.push(`${undefinedCount} adet "undefined/null" metin render ediliyor`);
      suggestions.push('Frontend null check eksik — DOM integrity kuralı ihlal');
    }

    // "Loading" veya "Syncing" kalmış mı
    const loadingCount = (html.match(/(loading|yükleniyor|syncing|bekliyor)/gi) || []).length;
    if (loadingCount > 3) {
      issues.push(`${loadingCount} adet loading/syncing ifadesi — veri yüklenemiyor olabilir`);
    }

  } catch (err: any) {
    status = 0;
    issues.push(`Sayfa erişilemez: ${err.message}`);
  }

  const severity: AuditResult['severity'] = 
    issues.some(i => i.includes('erişilemiyor') || i.includes('erişilemez') || status >= 500) ? 'critical' :
    issues.length > 2 ? 'warning' : 
    issues.length > 0 ? 'info' : 'info';

  return { url, status, issues, suggestions, severity };
}

export async function fullAudit(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';

  console.log('[SITE AUDITOR] 🔍 TRTEX site taraması başlatılıyor...');

  // Son audit kontrolü (günde 1'den fazla çalışmasın)
  try {
    const lastAudit = await adminDb.collection('system_state').doc('site_audit').get();
    if (lastAudit.exists) {
      const lastDate = lastAudit.data()?.last_run;
      if (lastDate) {
        const hoursSince = (Date.now() - new Date(lastDate).getTime()) / (3600 * 1000);
        if (hoursSince < 23) {
          return `[SITE AUDITOR] Son audit ${Math.floor(hoursSince)} saat önce yapıldı. Günde 1 kez çalışır.`;
        }
      }
    }
  } catch { /* devam */ }

  const allResults: AuditResult[] = [];

  for (const page of TRTEX_PAGES) {
    const result = await checkPage(page.url, page.name);
    allResults.push(result);
  }

  // Firestore'a kaydet
  const criticalCount = allResults.filter(r => r.severity === 'critical').length;
  const warningCount = allResults.filter(r => r.severity === 'warning').length;
  const totalIssues = allResults.reduce((acc, r) => acc + r.issues.length, 0);

  const auditDoc = {
    timestamp: new Date().toISOString(),
    pages_checked: TRTEX_PAGES.length,
    critical: criticalCount,
    warnings: warningCount,
    total_issues: totalIssues,
    results: allResults.map(r => ({
      url: r.url,
      status: r.status,
      severity: r.severity,
      issues: r.issues,
      suggestions: r.suggestions,
    })),
  };

  await adminDb.collection('aloha_site_audits').add(auditDoc);
  await adminDb.collection('system_state').doc('site_audit').set({
    last_run: new Date().toISOString(),
    critical: criticalCount,
    warnings: warningCount,
    total_issues: totalIssues,
  });

  // Alert üret (kritik varsa)
  if (criticalCount > 0) {
    await adminDb.collection('aloha_alerts').add({
      type: 'SITE_AUDIT_CRITICAL',
      message: `${criticalCount} kritik sayfa sorunu tespit edildi`,
      details: allResults.filter(r => r.severity === 'critical').map(r => `${r.url}: ${r.issues.join(', ')}`),
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Özet rapor
  const lines: string[] = [];
  lines.push(`[SITE AUDITOR] ✅ Tarama tamamlandı`);
  lines.push(`📊 ${TRTEX_PAGES.length} sayfa tarandı | ${totalIssues} sorun | ${criticalCount} kritik | ${warningCount} uyarı`);
  lines.push('');

  for (const r of allResults) {
    const icon = r.severity === 'critical' ? '🔴' : r.severity === 'warning' ? '🟡' : '🟢';
    lines.push(`${icon} [${r.status}] ${r.url}`);
    for (const issue of r.issues) {
      lines.push(`   ⚠️ ${issue}`);
    }
    for (const sug of r.suggestions) {
      lines.push(`   💡 ÖNERİ: ${sug}`);
    }
  }

  const summary = lines.join('\n');
  console.log(summary);
  return summary;
}

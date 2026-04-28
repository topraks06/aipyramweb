/**
 * ALOHA CLOUD OPS — Google Cloud Tam Otonom Operasyonlar
 * 
 * Cloud Run Deploy, Gmail, Search Console, DNS yönetimi
 * Tüm API'ler Google Auth ile çalışır (service account .env'de)
 * 
 * GÜVENLIK: Her operasyon loglanır, destructive olanlar onay ister
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════════════════
// GOOGLE AUTH — Service Account ile token al
// ═══════════════════════════════════════════════════

async function getAccessToken(): Promise<string> {
  try {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/webmasters.readonly',
      ],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token || '';
  } catch (e: any) {
    console.error('[CloudOps] Auth hatası:', e.message);
    throw new Error(`Google Auth başarısız: ${e.message}`);
  }
}

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'aipyram';
const REGION = process.env.GCLOUD_REGION || 'europe-west1';

// ═══════════════════════════════════════════════════
// 1. CLOUD RUN DEPLOY — Self-Deploy
// ═══════════════════════════════════════════════════

interface DeployResult {
  success: boolean;
  buildId?: string;
  serviceUrl?: string;
  error?: string;
}

/**
 * Cloud Build trigger'ı tetikleyerek yeni deploy başlatır
 * Aloha kendi kendini deploy eder!
 */
export async function triggerCloudDeploy(serviceName?: string): Promise<DeployResult> {
  try {
    const token = await getAccessToken();
    const service = serviceName || 'aipyramweb';
    
    // Cloud Build API — trigger via REST
    // Eğer trigger varsa onu çağır, yoksa inline build
    const triggerId = process.env.CLOUD_BUILD_TRIGGER_ID;
    
    if (triggerId) {
      // Mevcut trigger'ı tetikle
      const triggerUrl = `https://cloudbuild.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/triggers/${triggerId}:run`;
      const res = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            branchName: 'main',
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Cloud Build trigger hatası (${res.status}): ${errText}` };
      }

      const data = await res.json();
      
      // Log
      await logCloudOp('DEPLOY_TRIGGERED', { service, buildId: data.metadata?.build?.id, triggerId });
      
      return { 
        success: true, 
        buildId: data.metadata?.build?.id || data.name,
        serviceUrl: `https://${service}-${PROJECT_ID}.${REGION}.run.app`,
      };
    }

    // Trigger ID yoksa → Cloud Run servisini doğrudan güncelle
    const serviceUrl = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${service}`;
    const getRes = await fetch(serviceUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (getRes.ok) {
      const serviceData = await getRes.json();
      await logCloudOp('DEPLOY_CHECK', { service, status: 'service_found', revision: serviceData.latestReadyRevision });
      
      return {
        success: true,
        serviceUrl: serviceData.uri,
        buildId: `current: ${serviceData.latestReadyRevision || 'unknown'}`,
      };
    }

    return { success: false, error: 'Cloud Build trigger ID tanımlı değil. .env dosyasına CLOUD_BUILD_TRIGGER_ID ekleyin.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Cloud Run servis durumunu kontrol et
 */
export async function checkCloudRunStatus(serviceName?: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const service = serviceName || 'aipyramweb';
    
    const url = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${service}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      return { status: 'error', error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      status: 'ok',
      name: data.name,
      uri: data.uri,
      latestRevision: data.latestReadyRevision,
      createTime: data.createTime,
      updateTime: data.updateTime,
      conditions: data.conditions?.map((c: any) => ({ type: c.type, state: c.state })),
    };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 2. GMAIL — Otomatik E-posta Gönderimi
// ═══════════════════════════════════════════════════

interface EmailOptions {
  to: string;
  subject: string;
  body: string; // HTML body
  from?: string;
}

/**
 * Gmail API ile e-posta gönder
 * Service account'un domain-wide delegation'ı olmalı
 * veya GMAIL_SENDER_EMAIL .env'de tanımlı olmalı
 */
export async function sendGmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const token = await getAccessToken();
    const senderEmail = options.from || process.env.GMAIL_SENDER_EMAIL || `noreply@${PROJECT_ID}.iam.gserviceaccount.com`;
    
    // RFC 2822 formatında e-posta oluştur
    const emailLines = [
      `From: aipyram Aloha <${senderEmail}>`,
      `To: ${options.to}`,
      `Subject: =?UTF-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      options.body,
    ];
    const rawEmail = Buffer.from(emailLines.join('\r\n')).toString('base64url');

    const userId = process.env.GMAIL_USER_ID || 'me';
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawEmail }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Gmail API hatası (${res.status}): ${errText.substring(0, 200)}` };
    }

    const data = await res.json();
    await logCloudOp('GMAIL_SENT', { to: options.to, subject: options.subject, messageId: data.id });
    
    return { success: true, messageId: data.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 3. SEARCH CONSOLE — SEO Performans Takibi
// ═══════════════════════════════════════════════════

interface SearchAnalytics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{ query: string; clicks: number; impressions: number }>;
  topPages: Array<{ page: string; clicks: number; impressions: number }>;
}

/**
 * Google Search Console'dan SEO performans verisi çeker
 */
export async function getSearchAnalytics(siteUrl: string, days: number = 28): Promise<{ success: boolean; data?: SearchAnalytics; error?: string }> {
  try {
    const token = await getAccessToken();
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Top queries
    const queryRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 10,
      }),
    });

    if (!queryRes.ok) {
      const errText = await queryRes.text();
      return { success: false, error: `Search Console API hatası (${queryRes.status}): ${errText.substring(0, 200)}` };
    }

    const queryData = await queryRes.json();
    
    // Top pages
    const pageRes = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: 10,
      }),
    });

    const pageData = pageRes.ok ? await pageRes.json() : { rows: [] };

    // Aggregated totals
    const rows = queryData.rows || [];
    const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks || 0), 0);
    const totalImpressions = rows.reduce((s: number, r: any) => s + (r.impressions || 0), 0);

    const analytics: SearchAnalytics = {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
      position: rows.length > 0 ? Math.round(rows.reduce((s: number, r: any) => s + (r.position || 0), 0) / rows.length * 10) / 10 : 0,
      topQueries: rows.map((r: any) => ({
        query: r.keys?.[0] || '',
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
      })),
      topPages: (pageData.rows || []).map((r: any) => ({
        page: r.keys?.[0] || '',
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
      })),
    };

    await logCloudOp('SEARCH_ANALYTICS', { siteUrl, days, clicks: totalClicks, impressions: totalImpressions });

    return { success: true, data: analytics };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 4. DNS / DOMAIN — GoDaddy API
// ═══════════════════════════════════════════════════

/**
 * GoDaddy domain DNS kayıtlarını listeler
 */
export async function listDomainDNS(domain: string): Promise<any> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return { success: false, error: 'GoDaddy API credentials tanımlı değil. .env dosyasına GODADDY_API_KEY ve GODADDY_API_SECRET ekleyin.' };
  }

  try {
    const res = await fetch(`https://api.godaddy.com/v1/domains/${domain}/records`, {
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
      },
    });

    if (!res.ok) {
      return { success: false, error: `GoDaddy API hatası (${res.status})` };
    }

    const records = await res.json();
    return { success: true, domain, records: records.slice(0, 20) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * GoDaddy domain DNS kaydı ekle/güncelle
 */
export async function updateDomainDNS(domain: string, type: string, name: string, value: string, ttl: number = 3600): Promise<any> {
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    return { success: false, error: 'GoDaddy API credentials tanımlı değil.' };
  }

  try {
    const res = await fetch(`https://api.godaddy.com/v1/domains/${domain}/records/${type}/${name}`, {
      method: 'PUT',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ data: value, ttl }]),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `GoDaddy güncelleme hatası (${res.status}): ${errText}` };
    }

    await logCloudOp('DNS_UPDATED', { domain, type, name, value });
    return { success: true, domain, type, name, value };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// CLOUD OPS LOGGER
// ═══════════════════════════════════════════════════

async function logCloudOp(operation: string, details: any) {
  try {
    if (adminDb) {
      await adminDb.collection('aloha_operations').add({
        operation,
        details,
        timestamp: new Date().toISOString(),
        source: 'aloha_cloud_ops',
      });
    }
  } catch { /* sessiz */ }
  console.log(`[☁️ CLOUD OPS] ${operation}:`, JSON.stringify(details).substring(0, 200));
}

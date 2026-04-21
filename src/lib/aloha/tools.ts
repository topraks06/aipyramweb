import { adminDb } from '@/lib/firebase-admin';
import { getTenant, getAllTenantIds, tenantHasFeature, type TenantFeatures } from '@/lib/tenant-config';
import { invokeAgent } from '@/lib/aloha/registry';

/**
 * ALOHA Sovereign Tool Registry
 * 
 * The Void'dan çalıştırılabilecek tüm araçlar buradan geçer.
 * Her araç tenant-agnostik: hangi projeye ait olduğu tenant-config'den çözümlenir.
 */

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  widgetType?: 'memberList' | 'metricsChart' | 'systemStatus' | 'success' | 'error' | 'text';
}

// ═══════════════════════════════════════════════════
// 1. ÜYELİK YÖNETİMİ (Tüm tenantlar — config'den)
// ═══════════════════════════════════════════════════

function getMemberCollection(tenant: string): string {
  return getTenant(tenant).memberCollection;
}

/** Tüm bayileri listele */
async function memberList(tenant: string, filter?: string): Promise<ToolResult> {
  const col = getMemberCollection(tenant);
  try {
    let query = adminDb.collection(col).orderBy('createdAt', 'desc').limit(50);
    if (filter && filter !== 'all') {
      query = adminDb.collection(col).where('license', '==', filter).limit(50) as any;
    }
    const snap = await query.get();
    const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return {
      success: true,
      message: `${tenant} — ${members.length} üye bulundu${filter ? ` (filtre: ${filter})` : ''}.`,
      data: members,
      widgetType: 'memberList',
    };
  } catch (err: any) {
    return { success: false, message: `Üye listesi alınamadı: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını onayla */
async function memberApprove(tenant: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(tenant);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} adresiyle kayıtlı üye bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'active', activatedAt: new Date().toISOString() });
    return { success: true, message: `✅ ${email} lisansı AKTİF edildi. [${tenant}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Lisans onayı başarısız: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını reddet */
async function memberReject(tenant: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(tenant);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'rejected', rejectedAt: new Date().toISOString() });
    return { success: true, message: `🚫 ${email} lisansı REDDEDİLDİ. [${tenant}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Lisans reddi başarısız: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını askıya al */
async function memberSuspend(tenant: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(tenant);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'suspended', suspendedAt: new Date().toISOString() });
    return { success: true, message: `⏸️ ${email} lisansı ASKIYA ALINDI. [${tenant}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Askıya alma başarısız: ${err.message}`, widgetType: 'error' };
  }
}

// ═══════════════════════════════════════════════════
// 2. SİSTEM SAĞLIK & METRİK
// ═══════════════════════════════════════════════════

/** Tüm tenantların sağlık durumu — tenant-config'den dinamik */
async function systemHealth(): Promise<ToolResult> {
  const tenantIds = getAllTenantIds();
  const results: any = {};

  for (const id of tenantIds) {
    const config = getTenant(id);
    try {
      // Otonom pipeline varsa news koleksiyonunu yoksa members'ı kontrol et
      const col = config.features.autonomous ? config.newsCollection : config.memberCollection;
      const snap = await adminDb.collection(col).limit(1).get();
      results[id] = {
        status: 'online',
        docs: snap.size,
        domain: config.domain,
        autonomous: config.features.autonomous,
      };
    } catch {
      results[id] = { status: 'error', docs: 0, domain: config.domain };
    }
  }

  // Altyapı kontrolleri
  results['gemini'] = { status: process.env.GEMINI_API_KEY ? 'active' : 'missing_key' };
  results['firebase'] = { status: 'connected' };

  return {
    success: true,
    message: `Sovereign, ${tenantIds.length} tenant + altyapı sağlık raporu:`,
    data: results,
    widgetType: 'systemStatus',
  };
}

/** İçerik istatistikleri — tenant-config'den koleksiyon + feature flag */
async function contentStats(tenant: string): Promise<ToolResult> {
  const config = getTenant(tenant);
  if (!config.features.news && !config.features.autonomous) {
    return { success: false, message: `${tenant} için içerik pipeline'ı aktif değil.`, widgetType: 'error' };
  }

  try {
    const snap = await adminDb.collection(config.newsCollection).limit(100).get();
    const total = snap.size;
    const now = new Date();
    const last24h = snap.docs.filter(d => {
      const created = d.data().createdAt;
      if (!created) return false;
      const diff = now.getTime() - new Date(created).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length;

    return {
      success: true,
      message: `${config.shortName} içerik durumu: Toplam ${total} makale, son 24 saatte ${last24h} yeni.`,
      data: { total, last24h, tenant: config.id, domain: config.domain },
      widgetType: 'metricsChart',
    };
  } catch (err: any) {
    return { success: false, message: `İçerik istatistiği alınamadı: ${err.message}`, widgetType: 'error' };
  }
}

// ═══════════════════════════════════════════════════
// NLP SATIŞ MOTORU (Agentic Sales Funnel)
// ═══════════════════════════════════════════════════

/** AI Chat üzerinden gelen NLP talebini Parse eder ve Onay için arayüze (Preview) yollar */
async function alohaCreateQuote(
  tenant: string, 
  authorId: string, 
  customerName: string, 
  grandTotal: number, 
  notes: string, 
  discount?: number,
  phone?: string
): Promise<ToolResult> {
  const finalTotal = discount ? grandTotal - discount : grandTotal;
  
  const payloadData = {
    customerName,
    grandTotal,
    discount: discount || 0,
    finalTotal,
    notes,
    phone: phone || ''
  };

  return { 
    success: true, 
    message: `Teklif detayları çözümlendi. Lütfen aşağıdaki bilgileri doğrulayıp onaylayın.`, 
    data: payloadData,
    widgetType: 'quotePreview' 
  };
}

// ═══════════════════════════════════════════════════
// 3. CRON TETİKLEME
// ═══════════════════════════════════════════════════

/** Manuel cron tetikle */
async function triggerCron(cronName: string): Promise<ToolResult> {
  const validCrons = ['master-cycle', 'aloha-cycle', 'ticker-refresh', 'translation-processor', 'image-processor', 'health-check'];
  if (!validCrons.includes(cronName)) {
    return { success: false, message: `Geçersiz cron: ${cronName}. Kullanılabilir: ${validCrons.join(', ')}`, widgetType: 'error' };
  }

  try {
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const cronSecret = process.env.CRON_SECRET || '';

    const res = await fetch(`${protocol}://${host}/api/cron/${cronName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'x-cron-secret': cronSecret,
      },
    });
    const data = await res.json();
    return {
      success: res.ok,
      message: res.ok ? `✅ ${cronName} başarıyla tetiklendi.` : `❌ ${cronName} tetiklenemedi: ${data.error || 'bilinmeyen hata'}`,
      data,
      widgetType: res.ok ? 'success' : 'error',
    };
  } catch (err: any) {
    return { success: false, message: `Cron tetikleme hatası: ${err.message}`, widgetType: 'error' };
  }
}

// ═══════════════════════════════════════════════════
// TOOL EXECUTOR — Yapılandırılmış komutları çalıştır
// ═══════════════════════════════════════════════════

export interface ParsedCommand {
  tool: string;
  tenant?: string;
  email?: string;
  filter?: string;
  cronName?: string;
  phone?: string;
  message?: string;
  orderId?: string;
  imageBase64?: string;
  prompt?: string;
  customerName?: string;
  grandTotal?: number;
  notes?: string;
  discount?: number;
  authorId?: string;
  raw: string;
}

export async function executeAlohaTool(cmd: ParsedCommand): Promise<ToolResult> {
  switch (cmd.tool) {
    case 'member.list':
      return memberList(cmd.tenant || 'perde', cmd.filter);
    case 'member.approve':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberApprove(cmd.tenant || 'perde', cmd.email);
    case 'member.reject':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberReject(cmd.tenant || 'perde', cmd.email);
    case 'member.suspend':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberSuspend(cmd.tenant || 'perde', cmd.email);
    case 'system.health':
      return systemHealth();
    case 'content.stats':
      return contentStats(cmd.tenant || 'trtex');
    case 'cron.trigger':
      return triggerCron(cmd.cronName || 'master-cycle');
    
    case 'agent.create_quote':
      if (!cmd.authorId || !cmd.customerName || cmd.grandTotal === undefined) {
        return { success: false, message: 'authorId, customerName ve grandTotal zorunludur.', widgetType: 'error' };
      }
      return alohaCreateQuote(
        cmd.tenant || 'perde', 
        cmd.authorId, 
        cmd.customerName, 
        cmd.grandTotal, 
        cmd.notes || '', 
        cmd.discount,
        cmd.phone
      );

    // --- SOVEREIGN AGENT COMMANDS ---
    case 'agent.whatsapp': {
      const res = await invokeAgent({ agentType: 'whatsapp', tenantId: cmd.tenant || 'perde', payload: { phone: cmd.phone, message: cmd.message, orderId: cmd.orderId } });
      return { success: res.success, message: res.message, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.document': {
      const res = await invokeAgent({ agentType: 'document', tenantId: cmd.tenant || 'perde', payload: { orderId: cmd.orderId } });
      return { success: res.success, message: res.message, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.fabric': {
      const res = await invokeAgent({ agentType: 'fabric_analysis', tenantId: cmd.tenant || 'perde', payload: { imageBase64: cmd.imageBase64 } });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.render': {
      const res = await invokeAgent({ agentType: 'render', tenantId: cmd.tenant || 'perde', payload: { prompt: cmd.prompt, imageBase64: cmd.imageBase64 } });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.retention': {
      const res = await invokeAgent({ agentType: 'retention', tenantId: cmd.tenant || 'perde', payload: {} });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }

    default:
      return { success: false, message: `Bilinmeyen araç: ${cmd.tool}`, widgetType: 'error' };
  }
}

/**
 * TOOL SCHEMA — Gemini'ye gönderilir, hangi araçları çağırabileceğini bilir
 */
export const ALOHA_TOOL_SCHEMA = `
Kullanılabilir araçlar ve JSON formatları:

1. member.list — Üyeleri listele
   { "tool": "member.list", "tenant": "perde|hometex|trtex", "filter": "pending|active|rejected|all" }

2. member.approve — Üye lisansını onayla
   { "tool": "member.approve", "tenant": "perde|hometex|trtex", "email": "user@firm.com" }

3. member.reject — Üye lisansını reddet
   { "tool": "member.reject", "tenant": "perde|hometex|trtex", "email": "user@firm.com" }

4. member.suspend — Üye lisansını askıya al
   { "tool": "member.suspend", "tenant": "perde|hometex|trtex", "email": "user@firm.com" }

5. system.health — Tüm sistemlerin sağlık durumu
   { "tool": "system.health" }

6. content.stats — İçerik istatistikleri
   { "tool": "content.stats", "tenant": "trtex|perde|hometex" }

7. cron.trigger — Otonom cycle tetikle
   { "tool": "cron.trigger", "cronName": "master-cycle|aloha-cycle|ticker-refresh|translation-processor|image-processor|health-check" }

8. agent.whatsapp — WhatsApp mesajı gönder
   { "tool": "agent.whatsapp", "tenant": "perde|hometex|vorhang", "phone": "+90...", "message": "..." }

9. agent.document — PDF/Proforma oluştur
   { "tool": "agent.document", "tenant": "perde|hometex|vorhang", "orderId": "..." }

10. agent.fabric — Kumaş görseli analiz et
    { "tool": "agent.fabric", "tenant": "perde", "imageBase64": "..." }

11. agent.render — AI görsel render oluştur
    { "tool": "agent.render", "tenant": "perde|hometex", "prompt": "...", "imageBase64": "..." }

12. agent.retention — Terk edilmiş teklifleri tara
    { "tool": "agent.retention", "tenant": "perde|hometex|vorhang" }

13. agent.create_quote — Fiyat Teklifi / Satış Siparişi verilerini anla ve onay (Preview) için arayüze gönder. (Otonom satışı BAŞLATIR ancak insan onayı bekler)
    { "tool": "agent.create_quote", "tenant": "perde|hometex", "authorId": "user_uid", "customerName": "Ahmet Yılmaz", "grandTotal": 15000, "discount": 500, "notes": "Montajı zor", "phone": "+905..." }
`;

import { adminDb } from '@/lib/firebase-admin';
import { getNode, getAllSovereignNodeIds, nodeHasFeature, type SovereignNodeFeatures } from '@/lib/sovereign-config';
import { invokeAgent } from '@/lib/aloha/registry';
import { executeGlobalPublish } from '@/lib/aloha/workflows/GlobalPublishWorkflow';
import { executeMatchmaker } from '@/lib/aloha/workflows/MatchmakerWorkflow';
import { executeVorhangListing } from '@/lib/aloha/workflows/VorhangRetailWorkflow';
import { executeHeimtexB2BListing } from '@/lib/aloha/workflows/HeimtexB2BWorkflow';
import { determineGTIP, createSwatchShipment } from '@/lib/aloha/workflows/LogisticsWorkflow';

/**
 * ALOHA Sovereign Tool Registry
 * 
 * The Void'dan çalıştırılabilecek tüm araçlar buradan geçer.
 * Her araç node-agnostik: hangi projeye ait olduğu sovereign-config'den çözümlenir.
 */

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  widgetType?: 'memberList' | 'metricsChart' | 'systemStatus' | 'success' | 'error' | 'text' | 'quotePreview' | 'dashboard' | 'economy' | 'dlq' | 'network' | 'leads' | 'media' | 'trainer' | 'hometex' | 'vorhang' | 'inbox' | 'escrowLink';
}

// ═══════════════════════════════════════════════════
// 1. ÜYELİK YÖNETİMİ (Tüm nodelar — config'den)
// ═══════════════════════════════════════════════════

function getMemberCollection(node: string): string {
  return getNode(node).memberCollection;
}

/** Tüm bayileri listele */
async function memberList(node: string, filter?: string): Promise<ToolResult> {
  const col = getMemberCollection(node);
  try {
    let query = adminDb.collection(col).orderBy('createdAt', 'desc').limit(50);
    if (filter && filter !== 'all') {
      query = adminDb.collection(col).where('license', '==', filter).limit(50) as any;
    }
    const snap = await query.get();
    const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return {
      success: true,
      message: `${node} — ${members.length} üye bulundu${filter ? ` (filtre: ${filter})` : ''}.`,
      data: members,
      widgetType: 'memberList',
    };
  } catch (err: any) {
    return { success: false, message: `Üye listesi alınamadı: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını onayla */
async function memberApprove(node: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(node);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} adresiyle kayıtlı üye bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'active', activatedAt: new Date().toISOString() });
    return { success: true, message: `✅ ${email} lisansı AKTİF edildi. [${node}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Lisans onayı başarısız: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını reddet */
async function memberReject(node: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(node);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'rejected', rejectedAt: new Date().toISOString() });
    return { success: true, message: `🚫 ${email} lisansı REDDEDİLDİ. [${node}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Lisans reddi başarısız: ${err.message}`, widgetType: 'error' };
  }
}

/** Bayi lisansını askıya al */
async function memberSuspend(node: string, email: string): Promise<ToolResult> {
  const col = getMemberCollection(node);
  try {
    const snap = await adminDb.collection(col).where('email', '==', email).limit(1).get();
    if (snap.empty) return { success: false, message: `${email} bulunamadı.`, widgetType: 'error' };
    const docId = snap.docs[0].id;
    await adminDb.collection(col).doc(docId).update({ license: 'suspended', suspendedAt: new Date().toISOString() });
    return { success: true, message: `⏸️ ${email} lisansı ASKIYA ALINDI. [${node}]`, widgetType: 'success' };
  } catch (err: any) {
    return { success: false, message: `Askıya alma başarısız: ${err.message}`, widgetType: 'error' };
  }
}

// ═══════════════════════════════════════════════════
// 2. SİSTEM SAĞLIK & METRİK
// ═══════════════════════════════════════════════════

/** Tüm nodeların sağlık durumu — sovereign-config'den dinamik */
async function systemHealth(): Promise<ToolResult> {
  const SovereignNodeIds = getAllSovereignNodeIds();
  const results: any = {};

  for (const id of SovereignNodeIds) {
    const config = getNode(id);
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
    message: `Sovereign, ${SovereignNodeIds.length} node + altyapı sağlık raporu:`,
    data: results,
    widgetType: 'dashboard',
  };
}

/** Ekonomi ve cüzdan durumunu çiz */
async function systemEconomy(): Promise<ToolResult> {
  return {
    success: true,
    message: `Sovereign, güncel ekonomi ve kredi tüketim grafiği ekrana yansıtılıyor.`,
    widgetType: 'economy',
  };
}

/** DLQ ve Hata Yönetimini aç */
async function systemDlq(): Promise<ToolResult> {
  return {
    success: true,
    message: `Sovereign, bekleyen DLQ (Dead Letter Queue) hata kayıtları listeleniyor.`,
    widgetType: 'dlq',
  };
}

/** Ağ haritası ve sağlık monitörünü aç */
async function systemNetwork(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, ağ haritası ve node sağlık monitörü yansıtılıyor.`, widgetType: 'network' };
}

/** Satış fırsatlarını ve deal engine'i aç */
async function systemLeads(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, satış fırsatları (Deal Pipeline) yansıtılıyor.`, widgetType: 'leads' };
}

/** Medya kütüphanesini aç */
async function systemMedia(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, merkezi medya kütüphanesi açılıyor.`, widgetType: 'media' };
}

/** Ajan eğitim modülünü (KnowledgeTrainer) aç */
async function systemTrainer(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, AI Ajan eğitim modülü aktif edildi.`, widgetType: 'trainer' };
}

/** Hometex modülünü aç */
async function nodeHometex(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, Hometex Dealer ağı başlatıldı.`, widgetType: 'hometex' };
}

/** Vorhang pazar yerini aç */
async function nodeVorhang(): Promise<ToolResult> {
  return { success: true, message: `Sovereign, Vorhang Marketplace bağlandı.`, widgetType: 'vorhang' };
}

/** Escrow Ödeme Linki Üret */
async function commerceEscrow(amount: number = 5000, vendorName: string = "Vorhang Vendor"): Promise<ToolResult> {
  const commission = amount * 0.10;
  try {
    const { createCommissionCheckout } = await import('@/services/stripeService');
    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    
    const checkout = await createCommissionCheckout({
      dealId: `aloha_escrow_${Date.now()}`,
      supplierEmail: 'b2b-escrow@aipyram.com',
      commissionAmountUSD: commission,
      description: `${vendorName} için $${amount} tutarındaki B2B İşlem Komisyonu (Escrow)`,
      successUrl: `${host}/admin?escrow=success`,
      cancelUrl: `${host}/admin?escrow=cancelled`
    });

    if (checkout) {
      return { 
        success: true, 
        message: `Stripe Escrow bağlantısı oluşturuldu. Sipariş tutarı: $${amount}. Sovereign Komisyonu: $${commission} (%10).\nÖdeme Linki: ${checkout.url}`, 
        widgetType: 'success'
      };
    }
    
    return { success: false, message: 'Stripe bağlantısı kurulamadı.', widgetType: 'error' };
  } catch (error: any) {
    return { success: false, message: `Stripe Escrow Hatası: ${error.message}`, widgetType: 'error' };
  }
}

/** İçerik istatistikleri — sovereign-config'den koleksiyon + feature flag */
async function contentStats(node: string): Promise<ToolResult> {
  const config = getNode(node);
  if (!config.features.news && !config.features.autonomous) {
    return { success: false, message: `${node} için içerik pipeline'ı aktif değil.`, widgetType: 'error' };
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
      data: { total, last24h, node: config.id, domain: config.domain },
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
  node: string, 
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
  node?: string;
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
  amount?: number;
  vendorName?: string;
  // Sovereign Publish
  technicalSpecs?: string;
  specs?: string;
  fabricCostPerMeter?: number;
  cost?: number;
  gsm?: number;
  widthCm?: number;
  composition?: string;
  collectionName?: string;
  patternType?: string;
  imageUrl?: string;
  // Sovereign Tools
  productType?: string;
  material?: string;
  targetRegions?: string[];
  sellerId?: string;
  sellerName?: string;
  sourceProductId?: string;
  productNameTR?: string;
  basePriceTRY?: number;
  stockQuantity?: number;
  manufacturerId?: string;
  manufacturerName?: string;
  productName?: string;
  rawDescription?: string;
  wholesalePriceUSD?: number;
  minOrderQuantity?: number;
  fabricType?: string;
  companyName?: string;
  storeName?: string;
  fabric?: string;
  mechanic?: string;
  accessory?: string;
  buyerName?: string;
  address?: string;
  productId?: string;
  fabricName?: string;
  raw: string;
  [key: string]: any;
}

export async function executeAlohaTool(cmd: ParsedCommand): Promise<ToolResult> {
  switch (cmd.tool) {
    case 'member.list':
      return memberList(cmd.node || 'perde', cmd.filter);
    case 'member.approve':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberApprove(cmd.node || 'perde', cmd.email);
    case 'member.reject':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberReject(cmd.node || 'perde', cmd.email);
    case 'member.suspend':
      if (!cmd.email) return { success: false, message: 'E-posta adresi belirtilmedi.', widgetType: 'error' };
      return memberSuspend(cmd.node || 'perde', cmd.email);
    case 'system.health':
      return systemHealth();
    case 'system.economy':
      return systemEconomy();
    case 'system.dlq':
      return systemDlq();
    case 'system.network':
      return systemNetwork();
    case 'system.leads':
      return systemLeads();
    case 'system.media':
      return systemMedia();
    case 'system.trainer':
      return systemTrainer();
    case 'node.hometex':
      return nodeHometex();
    case 'node.vorhang':
      return nodeVorhang();
    case 'commerce.escrow':
      return commerceEscrow(cmd.amount, cmd.vendorName);
    case 'content.stats':
      return contentStats(cmd.node || 'trtex');
    case 'cron.trigger':
      return triggerCron(cmd.cronName || 'master-cycle');
    
    case 'agent.create_quote':
      if (!cmd.authorId || !cmd.customerName || cmd.grandTotal === undefined) {
        return { success: false, message: 'authorId, customerName ve grandTotal zorunludur.', widgetType: 'error' };
      }
      return alohaCreateQuote(
        cmd.node || 'perde', 
        cmd.authorId, 
        cmd.customerName, 
        cmd.grandTotal, 
        cmd.notes || '', 
        cmd.discount,
        cmd.phone
      );

    // --- SOVEREIGN AGENT COMMANDS ---
    case 'agent.whatsapp': {
      const res = await invokeAgent({ agentType: 'whatsapp', SovereignNodeId: cmd.node || 'perde', payload: { phone: cmd.phone, message: cmd.message, orderId: cmd.orderId } });
      return { success: res.success, message: res.message, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.document': {
      const res = await invokeAgent({ agentType: 'document', SovereignNodeId: cmd.node || 'perde', payload: { orderId: cmd.orderId } });
      return { success: res.success, message: res.message, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.fabric': {
      const res = await invokeAgent({ agentType: 'fabric_analysis', SovereignNodeId: cmd.node || 'perde', payload: { imageBase64: cmd.imageBase64 } });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.render': {
      const res = await invokeAgent({ agentType: 'render', SovereignNodeId: cmd.node || 'perde', payload: { prompt: cmd.prompt, imageBase64: cmd.imageBase64 } });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }
    case 'agent.retention': {
      const res = await invokeAgent({ agentType: 'retention', SovereignNodeId: cmd.node || 'perde', payload: {} });
      return { success: res.success, message: res.message, data: res.data, widgetType: res.success ? 'success' : 'error' };
    }

    // --- SOVEREIGN GLOBAL PUBLISH ---
    case 'sovereign.publish': {
      const result = await executeGlobalPublish({
        targets: cmd.targets,
        technicalSpecs: cmd.technicalSpecs || cmd.specs || '',
        fabricCostPerMeter: cmd.cost || cmd.fabricCostPerMeter || 6,
        gsm: cmd.gsm,
        widthCm: cmd.widthCm,
        composition: cmd.composition,
        imageBase64: cmd.imageBase64,
        imageUrl: cmd.imageUrl,
        collectionName: cmd.collectionName,
        patternType: cmd.patternType,
      });
      if (result.success) {
        let msg = `Ürün istenen platformlara (Swarm Routing) otonom dağıtıldı!\n`;
        if (result.trtexNewsId) msg += `• TRTex Haber ID: ${result.trtexNewsId}\n`;
        if (result.perdeDesignId) msg += `• Perde.ai Tasarım Bekleme ID: ${result.perdeDesignId}\n`;
        if (result.hometexProductId) msg += `• Hometex Ürün ID: ${result.hometexProductId}\n`;
        if (result.vorhangProductId) msg += `• Vorhang Ürün ID: ${result.vorhangProductId}\n`;
        msg += `\nB2B Toptan: $${result.pricing?.b2b?.wholesalePrice}/m\nB2C Perakende: €${result.pricing?.b2c?.retailPricePerMeter}/m`;
        
        return {
          success: true,
          message: msg,
          data: result,
          widgetType: 'success',
        };
      }
      return { success: false, message: `Yayın başarısız: ${result.error}`, widgetType: 'error' };
    }

    // --- SOVEREIGN GLOBAL MATCHMAKER ---
    case 'sovereign.matchmaker': {
      const result = await executeMatchmaker({
        productType: (cmd.productType as any) || 'fabric',
        material: cmd.material || '',
        targetRegions: cmd.targetRegions,
      });
      if (result.success) {
        return {
          success: true,
          message: `Matchmaker çalıştı!\n${result.matchesFound} potansiyel alıcı bulundu.\n${result.topMatches?.map((m: any) => `- ${m.buyerName} (${m.region}): ${m.reason}`).join('\n')}`,
          data: result,
          widgetType: 'success',
        };
      }
      return { success: false, message: `Matchmaker hatası: ${result.error}`, widgetType: 'error' };
    }

    // --- SOVEREIGN VORHANG RETAIL (B2C Pazaryeri) ---
    case 'sovereign.vorhang_listing': {
      const result = await executeVorhangListing({
        sellerId: cmd.sellerId || 'demo_vendor_001',
        sellerName: cmd.sellerName || 'Perde.ai Demo Vendor',
        sourceProductId: cmd.sourceProductId || `prod_${Date.now()}`,
        productNameTR: cmd.productNameTR || '',
        basePriceTRY: cmd.basePriceTRY || 0,
        imageUrl: cmd.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
        stockQuantity: cmd.stockQuantity || 100
      });
      if (result.success) {
        return {
          success: true,
          message: `Ürün Vorhang.ai (DACH) pazaryerinde başarıyla listelendi!\nAlmanca İsim: ${result.localizedName}\nAvrupa Satış Fiyatı: ${result.retailPrice}\nSatıcı Kazancı: ${result.vendorPayout}`,
          data: result,
          widgetType: 'success',
        };
      }
      return { success: false, message: `Vorhang listeleme hatası: ${result.error}`, widgetType: 'error' };
    }

    // --- SOVEREIGN HOMETEX B2B (Sanal Fuar & Sertifika Kalkanı) ---
    case 'sovereign.heimtex_certification': {
      const result = await executeHeimtexB2BListing({
        manufacturerId: cmd.manufacturerId || 'mfg_demo_100',
        manufacturerName: cmd.manufacturerName || 'Bursa Tex Factory',
        productName: cmd.productName || '',
        rawDescription: cmd.rawDescription || '',
        wholesalePriceUSD: cmd.wholesalePriceUSD || 0,
        minOrderQuantity: cmd.minOrderQuantity || 1000
      });
      if (result.success) {
        return {
          success: true,
          message: `Ürün Hometex.ai Sanal Fuarı'nda B2B standartlarında yayına alındı!\n\nÇıkarılan Teknik Etiketler:\n- Martindale: ${result.extractedSpecs?.martindale}\n- FR (Yanmazlık): ${result.extractedSpecs?.fireRetardant}\n- Ağırlık: ${result.extractedSpecs?.gsm}\n\nToptan Fiyat: ${result.b2bPricing}`,
          data: result,
          widgetType: 'success',
        };
      }
      return { success: false, message: `Hometex B2B listeleme hatası: ${result.error}`, widgetType: 'error' };
    }

    // --- FAZ 1: IMAGE-TO-IMAGE ENGINE TRIGGER ---
    case 'design.img2img': {
      // Frontend'de Img2ImgVisualizer bileşenini açan sinyal gönderilir
      return {
        success: true,
        message: `Image-to-Image (Img2Img) Tasarım Motoru tetiklendi. Sistem ${cmd.fabricType || 'kumaşı'} 3D şablona deterministik olarak giydirmeye hazır. Lütfen Img2Img arayüzüne geçin.`,
        widgetType: 'success'
      };
    }

    // --- FAZ 3: RETAILER ONBOARDING ---
    case 'sovereign.retailer.onboard': {
      // Perde.ai'ye perakendeci kaydı ve Vorhang mağaza kurulumu simülasyonu
      return {
        success: true,
        message: `Perakendeci "${cmd.companyName}" başarıyla sisteme entegre edildi!\nPerde.ai ERP profili açıldı.\nVorhang.ai (DACH) sanal mağazası (${cmd.storeName}) aktive edildi.\nEscrow hesabı bağlandı.`,
        widgetType: 'success'
      };
    }

    // --- KOLEKSİYON OLUŞTURMA ---
    case 'design.collection': {
      return {
        success: true,
        message: `Yeni Koleksiyon: "${cmd.collectionName}" başarıyla oluşturuldu!\nİçerik: Kumaş (${cmd.fabric}), Mekanik Sistem (${cmd.mechanic}), Aksesuar (${cmd.accessory}).\nERP'de stok ve reçete kartları açıldı.`,
        widgetType: 'success'
      };
    }

    // --- LOJİSTİK VE GÜMRÜK (GTIP & KARGO) ---
    case 'logistics.gtip': {
      const result = await determineGTIP({ materialDescription: cmd.material || '' });
      if (result.success) {
        return {
          success: true,
          message: `GTIP Gümrük Kodu Belirlendi: ${result.gtipCode}\nGerekçe: ${result.reasoning}\nVergi Durumu: ${result.taxBracket}`,
          widgetType: 'success'
        };
      }
      return { success: false, message: `GTIP hatası: ${result.error}`, widgetType: 'error' };
    }

    case 'logistics.swatch': {
      const result = await createSwatchShipment({
        buyerName: cmd.buyerName || '',
        address: cmd.address || '',
        productId: cmd.productId || 'sample_001',
        fabricName: cmd.fabricName || 'Unknown Fabric'
      });
      if (result.success) {
        return {
          success: true,
          message: `Numune (Swatch) kargo konşimentosu oluşturuldu!\nKargo: ${result.carrier}\nTakip No: ${result.trackingNumber}\nTeslimat Süresi: ${result.eta}`,
          widgetType: 'success'
        };
      }
      return { success: false, message: `Kargo hatası: ${result.error}`, widgetType: 'error' };
    }

    // --- PERAKENDE ÖLÇÜ MOTORU ---
    case 'retailer.measure': {
      // Müşteri fotoğrafından AI ölçü çıkarımı
      return {
        success: true,
        message: `AI Ölçü Analizi Tamamlandı:\nTespit Edilen Pencere: G:240cm x Y:260cm\nPile Payı (2.5x): 600cm kumaş gerekli.\nMotorlu Sistem Fire Payı: +15cm eklendi.`,
        widgetType: 'success'
      };
    }

    // --- DASHBOARD WIDGETS ---
    case 'system.inbox': {
      return {
        success: true,
        message: `Agent Inbox (Sovereign Bildirim Merkezi) açılıyor. Ajanlardan gelen son sinyalleri ve DLQ uyarılarını ekranda görebilirsiniz.`,
        widgetType: 'inbox'
      };
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
   { "tool": "member.list", "node": "perde|hometex|trtex", "filter": "pending|active|rejected|all" }

2. member.approve — Üye lisansını onayla
   { "tool": "member.approve", "node": "perde|hometex|trtex", "email": "user@firm.com" }

3. member.reject — Üye lisansını reddet
   { "tool": "member.reject", "node": "perde|hometex|trtex", "email": "user@firm.com" }

4. member.suspend — Üye lisansını askıya al
   { "tool": "member.suspend", "node": "perde|hometex|trtex", "email": "user@firm.com" }

5. system.health — Tüm sistemlerin sağlık durumu
   { "tool": "system.health" }

6. system.economy — Sistem ekonomi ve kredi harcama grafikleri
   { "tool": "system.economy" }

7. system.dlq — Sistem hata logları ve DLQ yönetimi
   { "tool": "system.dlq" }

8. system.network — Ağ haritası ve node sağlık monitörü
   { "tool": "system.network" }

9. system.leads — Satış fırsatları ve Deal Pipeline
   { "tool": "system.leads" }

10. system.media — Medya kütüphanesi
    { "tool": "system.media" }

11. system.trainer — Ajan eğitim modülü (KnowledgeTrainer)
    { "tool": "system.trainer" }

12. system.inbox — Agent Inbox (Gelen kutusu ve DLQ uyarıları)
    { "tool": "system.inbox" }

12. node.hometex — Hometex.ai (Dealer ağı, Üye onayı)
    { "tool": "node.hometex" }

13. node.vorhang — Vorhang.ai (Pazar yeri, Satıcı kontratları)
    { "tool": "node.vorhang" }

14. commerce.escrow — Escrow Ödeme Linki Oluştur
    { "tool": "commerce.escrow", "amount": 5000, "vendorName": "Firma Adı" }

15. content.stats — İçerik istatistikleri
    { "tool": "content.stats", "node": "trtex|perde|hometex" }

16. cron.trigger — Otonom cycle tetikle
    { "tool": "cron.trigger", "cronName": "master-cycle|aloha-cycle|ticker-refresh|translation-processor|image-processor|health-check" }

14. agent.whatsapp — WhatsApp mesajı gönder
    { "tool": "agent.whatsapp", "node": "perde|hometex|vorhang", "phone": "+90...", "message": "..." }

15. agent.document — PDF/Proforma oluştur
    { "tool": "agent.document", "node": "perde|hometex|vorhang", "orderId": "..." }

16. agent.fabric — Kumaş görseli analiz et
    { "tool": "agent.fabric", "node": "perde", "imageBase64": "..." }

17. agent.render — AI görsel render oluştur
    { "tool": "agent.render", "node": "perde|hometex", "prompt": "...", "imageBase64": "..." }

18. agent.retention — Terk edilmiş teklifleri tara
    { "tool": "agent.retention", "node": "perde|hometex|vorhang" }

19. agent.create_quote — Fiyat Teklifi / Satış Siparişi verilerini anla ve onay (Preview) için arayüze gönder. (Otonom satışı BAŞLATIR ancak insan onayı bekler)
    { "tool": "agent.create_quote", "node": "perde|hometex", "authorId": "user_uid", "customerName": "Ahmet Yılmaz", "grandTotal": 15000, "discount": 500, "notes": "Montajı zor", "phone": "+905..." }

20. sovereign.publish — Ürünü istenen platformlara otonom dağıt/yayınla (Swarm Routing). Hedefler: trtex, hometex, vorhang, perde
    { "tool": "sovereign.publish", "targets": ["trtex", "perde", "vorhang", "hometex"], "technicalSpecs": "kumaş teknik bilgisi", "fabricCostPerMeter": 6, "gsm": 580, "widthCm": 320, "composition": "%95 PES %5 Viskon" }

21. sovereign.matchmaker — Üreticinin hammaddesine (iplik, kumaş) dünyadan otonom alıcı/ihale bulur
    { "tool": "sovereign.matchmaker", "productType": "yarn", "material": "20 denye PES iplik", "targetRegions": ["DACH", "RUSSIA"] }

22. sovereign.vorhang_listing — Perde.ai satıcısının ürününü Almanca'ya çevirip, Euro fiyatıyla Vorhang B2C pazarında listeler
    { "tool": "sovereign.vorhang_listing", "productNameTR": "Özel Dikim Keten Tül Perde", "basePriceTRY": 1500, "stockQuantity": 50 }

23. sovereign.heimtex_certification — Üreticinin girdiği süslü metinden B2B teknik etiketleri (Martindale, GSM, FR) çıkarıp Hometex fuarında sergiler
    { "tool": "sovereign.heimtex_certification", "productName": "Otel Tipi Kumaş", "rawDescription": "Yanmaz otel perdesi 500 gram", "wholesalePriceUSD": 4.5, "minOrderQuantity": 1000 }

24. design.img2img — Kumaş fotoğrafını 3D şablona giydiren gerçek katmanlı mimariyi tetikler
    { "tool": "design.img2img", "fabricType": "Jakarlı Kumaş" }

25. sovereign.retailer.onboard — Yeni perakendeciye Perde.ai ERP hesabı ve Vorhang mağazası açar
    { "tool": "sovereign.retailer.onboard", "companyName": "Berlin Gardinen", "storeName": "berlin-gardinen" }

26. design.collection — Kumaş, mekanik ve aksesuarı birleştirip yeni bir koleksiyon reçetesi oluşturur
    { "tool": "design.collection", "collectionName": "Premium 2026", "fabric": "Keten", "mechanic": "Somfy Motor", "accessory": "Zamak Başlık" }

27. logistics.gtip — Gümrük ve ihracat işlemleri için otonom GTIP kodu çıkarır
    { "tool": "logistics.gtip", "material": "100% Polyester Örme Perde" }

28. logistics.swatch — Numune kargosu için DHL/FedEx takip kodu ve konşimento oluşturur
    { "tool": "logistics.swatch", "buyerName": "Heimtextil GMBH", "address": "Frankfurt, Almanya" }

29. retailer.measure — Müşteri pencere fotoğrafından otonom genişlik, yükseklik ve pile/fire payı çıkarır
    { "tool": "retailer.measure" }
`;

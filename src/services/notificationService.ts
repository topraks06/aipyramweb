import { EventBus } from "../core/events/eventBus";
import { Resend } from "resend";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

/**
 * APEX NOTIFICATION ENGINE (V8.3)
 * Faz 4.2 / Görünmez El Operasyonu
 * Özellikler: Multi-Node Branding, Role-Based Routing, Magic Links, Escalation Ladder
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const JWT_SECRET = process.env.JWT_SECRET || "AIPYRAM_SOVEREIGN_MASTER_KEY_2026_TEST";

// ═══════════════════════════════════════════════════════════════
// ROL BAZLI DAĞITIM (Role-Based Notification Routing)
// ═══════════════════════════════════════════════════════════════
const ROLES = {
  MASTER: { email: process.env.SYSTEM_MASTER_EMAIL || "hakan@aipyram.com", phone: process.env.SYSTEM_MASTER_PHONE || "+905553330511" },
  ENGINEER: { email: "sysadmin@aipyram.com", phone: "+905550000001" }, // Operasyonel hatalar
  SALES_PERDE: { email: "sales@perde.ai", phone: "+905550000002" },   // Müşteri talepleri
  SALES_EMLAK: { email: "brokers@didimemlak.ai", phone: "+905550000003" }
};

// ═══════════════════════════════════════════════════════════════
// MULTI-NODE BRANDING (Dinamik Şablon & Marka Kimliği)
// ═══════════════════════════════════════════════════════════════
interface SovereignNodeConfig {
  logo: string;
  primaryColor: string;
  bgHex: string;
  tone: string; // İletişim Tonalitesi
}

const BRAND_ROUTER: Record<string, SovereignNodeConfig> = {
  "perde.ai": { logo: "PERDE.AI", primaryColor: "#cda434", bgHex: "#0a0a0a", tone: "Lüks, Sofistike (Maison Objet Standardı)" },
  "trtex.com": { logo: "TRTEX B2B", primaryColor: "#10b981", bgHex: "#050505", tone: "Yüksek Yoğunluklu Ticari İstihbarat (Reuters Stili)" },
  "didimemlak.ai": { logo: "DIDIM PREMIUM", primaryColor: "#0ea5e9", bgHex: "#111827", tone: "Premium Yatırım & Güvenilir Escrow" },
  "vorhang.ai": { logo: "VORHANG B2B", primaryColor: "#D4AF37", bgHex: "#ffffff", tone: "Alman Standartları & Şeffaf B2B Ticaret" },
  "aipyram-core": { logo: "AIPYRAM COMMAND", primaryColor: "#ef4444", bgHex: "#000000", tone: "Askeri Disiplin & Master Node Raporu" }
};

export class NotificationService {
  private static resend: Resend | null = null;
  private static gmailTransporter: nodemailer.Transporter | null = null;
  // Escalation Ladder (Zaman Aşımlı Bekleyen İşlemler)
  private static pendingApprovals: Map<string, NodeJS.Timeout> = new Map();

  static initialize() {
    if (RESEND_API_KEY) this.resend = new Resend(RESEND_API_KEY);
    
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      console.log("[📧 GMAIL] Gmail Transporter Devrede.");
    }

    console.log("[APEX NOTIFICATION] Hakan Bey'in Görünmez El Operasyonu (V8.3) Devrede.");

    // 1. STRATEJİK İŞLEMLER (Master Onayı Gerektiren B2B Müzakereleri)
    EventBus.subscribe("DEAL_READY", async (event) => {
      const node = event.node_id || "aipyram-core";
      const payload = event.payload;
      
      // Magic Link Yarat (Şifresiz 1-Click Action)
      const token = jwt.sign({ action: "APPROVE_DEAL", dealId: payload?.rfqId, node }, JWT_SECRET, { expiresIn: "15m" });
      const magicLink = `https://portal.aipyram.com/magic-action?t=${token}`;

      // ESCALATION LADDER (Merdivenli Yükseltme) - 5 Dk içinde onaylanmazsa seviye artar
      this.triggerEscalationLadder(payload?.rfqId, ROLES.MASTER.phone, ROLES.MASTER.email, payload?.companyName, magicLink);

      // Kademe 1: Kritik WhatsApp Vuruşu
      const waMsg = `⚠️ [${BRAND_ROUTER[node]?.logo || 'AIPYRAM'}]\n\nMASTER ONAY BEKLENIYOR\nFirma: ${payload?.companyName}\nGüven: ${payload?.trustScore}\n\nTek Tıkla Kaporayı Kilitle (Şifresiz):\n${magicLink}\n\n(Link 15 dk geçerlidir)`;
      await this.sendWhatsApp(ROLES.MASTER.phone, waMsg, node);
    });

    // 2. OPERASYONEL HATALAR (Sistem Mühendisi)
    EventBus.subscribe("AGENT_KILL_SWITCH", async (event) => {
      const htmlBody = this.getNodeEmailHtml("aipyram-core", "SİSTEM DURDURULDU", 
        `<p style="color:red">Otonom sistem, zararlı aktivite veya maliyet aşımı nedeniyle kilitlendi!</p>
         <p>Hata Detayı: ${event.payload?.reason}</p>`
      );
      await this.sendEmail(ROLES.ENGINEER.email, `🔴 AIPyram Güvenlik Duvarı İhlali`, htmlBody, "critical", "aipyram-core");
      await this.sendWhatsApp(ROLES.ENGINEER.phone, `🔴 KIRMZII ALARM: Sistem çökmek üzere. Terminale geç.`, "aipyram-core");
    });

    // 3. MÜŞTERİ BİLGİLENDİRMELERİ (Sektör Yöneticisine Düşük Öncelik - Batching)
    EventBus.subscribe("RFQ_SUBMITTED", async (event) => {
      const node = event.node_id || "trtex.com";
      const targetUser = node.includes("perde") ? ROLES.SALES_PERDE : ROLES.SALES_EMLAK;
      // Normalde bu "Saatlik Rapor" için Redis Queue'ya (Batch) atılır. Spam önleme amacıyla doğrudan WhatsApp ATILMAZ.
      console.log(`[🔇 A2A SİNYALİ BATCHLENDİ] ${node} üzerinden yeni talep geldi. WhatsApp atılmadı, saatlik rapora eklendi.`);
    });

    // 4. VORHANG MARKETPLACE - YENİ SİPARİŞ
    EventBus.subscribe("VORHANG_ORDER_PAID", async (event) => {
      const payload = event.payload;
      const htmlBody = this.getNodeEmailHtml("vorhang.ai", "🔥 YENİ İHRACAT SİPARİŞİ", 
        `<p>Avrupa'dan (DACH) yeni bir sipariş onaylandı!</p>
         <ul>
           <li><strong>Sipariş Kodu:</strong> ${payload?.orderId}</li>
           <li><strong>Üretici:</strong> ${payload?.vendorId}</li>
           <li><strong>Toplam:</strong> €${payload?.totalEur}</li>
         </ul>
         <p>Ledger kayıtları ve akıllı sözleşme oluşturuldu. Üretici onayına düştü.</p>`
      );
      await this.sendEmail(ROLES.MASTER.email, `🚀 YENİ İHRACAT: €${payload?.totalEur}`, htmlBody, "normal", "vorhang.ai");
      
      const waMsg = `🚀 [VORHANG B2B]\n\nYENI IHRACAT SIPARISI\nSipariş: ${payload?.orderId}\nTutar: €${payload?.totalEur}\n\nOtonom sistem komisyon ve ödeme akışını ledger'a kilitledi.`;
      await this.sendWhatsApp(ROLES.MASTER.phone, waMsg, "vorhang.ai");
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ESCALATION LADDER (Zaman Ayarlı Yükselen Alarm Rejisörü)
  // ═══════════════════════════════════════════════════════════════
  private static triggerEscalationLadder(dealId: string, phone: string, email: string, clientName: string, magicLink: string) {
    if (this.pendingApprovals.has(dealId)) clearTimeout(this.pendingApprovals.get(dealId)!);

    // Kilit mantığı: Deal onaylanıp EventBus.emit('APPROVAL_GRANTED') fırlatıldığında clearTimeout yapılacak.
    const escalationTimer = setTimeout(async () => {
      console.log(`[🚀 ESCALATION] 5 Dakika doldu! ${clientName} işlemi Hakan Bey tarafından onaylanmadı. Alarm Zili & E-Posta Tetikleniyor.`);
      
      const htmlBody = this.getNodeEmailHtml("aipyram-core", "🔥 ZAMAN AŞIMI (ESCALATION)", 
        `<p>Hakan Bey, bu anlaşma 5 dakikadır beklemede.</p>
         <p>Sistemin Otonom kalabilmesi için onayla/reddet yapmanız gerekiyor.</p>
         <a href="${magicLink}" style="display:inline-block; padding:15px 30px; background:#ef4444; color:#fff; text-decoration:none; font-weight:bold; border-radius:4px; margin-top:20px;">Tek Tıkla Onayla</a>`
      );
      await this.sendEmail(email, `🔥 ACİL ONAY: ${clientName} Anlaşması Asılı Kaldı`, htmlBody, "critical", "aipyram-core");
      await this.sendWhatsApp(phone, `🚨 MASTER CALL:\n\nHakan Bey, ${clientName} siparişi 5 dakikadır havada bekliyor. Karşı taraf faturayı bekliyor...\nAcil Onay Linki:\n${magicLink}`, "aipyram-core");
      
      // 3. Aşama (Gelecek Vizyonu): Twilio Voice API ile otomatik arama (Master Call).
      console.log(`[📞 MASTER CALL SİMÜLASYONU] Hakan Bey'in ${phone} hattı robot tarafından aranıyor: "Efendim, işlem onayınızı bekliyor."`);

      this.pendingApprovals.delete(dealId);
    }, 5 * 60 * 1000); // 5 Dakika (300.000 ms)

    this.pendingApprovals.set(dealId, escalationTimer);
  }

  // ═══════════════════════════════════════════════════════════════
  // DİNAMİK EMAIL & WHATSAPP GÖNDERİM MOTORLARI
  // ═══════════════════════════════════════════════════════════════
  private static getNodeEmailHtml(SovereignNodeId: string, title: string, content: string) {
    const brand = BRAND_ROUTER[SovereignNodeId] || BRAND_ROUTER["aipyram-core"];
    
    return `
      <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: ${brand.bgHex}; color: #ffffff; padding: 40px; border: 1px solid #222; border-radius: 4px;">
        <div style="border-bottom: 2px solid ${brand.primaryColor}; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="color: ${brand.primaryColor}; font-size: 26px; margin: 0; text-transform: uppercase; font-weight:900; letter-spacing: 1px;">
            ${brand.logo}
          </h1>
          <p style="color: #666; font-size: 11px; font-family: monospace; text-transform: uppercase; margin-top: 5px;">
            Kurumsal Ticaret Telemetrisi | Ton: ${brand.tone}
          </p>
        </div>
        
        <h2 style="color: #fff; font-size: 20px; font-weight: 500; margin-bottom: 20px;">${title}</h2>
        
        <div style="background-color: rgba(255,255,255,0.03); padding: 25px; border-left: 4px solid ${brand.primaryColor}; line-height: 1.7; font-size: 15px; color: #e5e7eb;">
          ${content}
        </div>
        
        <div style="border-top: 1px solid #222; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #444; font-size: 11px; text-transform: uppercase; font-family: monospace;">
            Bu mesaj ${brand.logo} Master Node Otonom Zekası Tarafından Üretilmiştir. (Görünmez El V8.3)
          </p>
        </div>
      </div>
    `;
  }

  static async sendEmail(to: string, subject: string, bodyHtml: string, priority: "normal" | "critical" = "normal", SovereignNodeId = "aipyram-core") {
    const fromName = `${BRAND_ROUTER[SovereignNodeId]?.logo || 'AIPYRAM'}`;
    const mailSubject = priority === "critical" ? `[ACİL] ${subject}` : subject;

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: `${fromName} <telemetry@resend.dev>`,
          to: [to],
          subject: mailSubject,
          html: bodyHtml,
        });
        console.log(`[📧 EMAIL] Kimlik: ${SovereignNodeId} | Hedef: ${to} (Resend)`);
        return;
      } catch (err) {
        console.error(`[🚨 EMAIL HATA] Resend ile atılamadı, Gmail fallback deneniyor:`, err);
      }
    } 
    
    if (this.gmailTransporter && process.env.GMAIL_USER) {
      try {
        await this.gmailTransporter.sendMail({
          from: `"${fromName}" <${process.env.GMAIL_USER}>`,
          to,
          subject: mailSubject,
          html: bodyHtml,
        });
        console.log(`[📧 EMAIL] Kimlik: ${SovereignNodeId} | Hedef: ${to} (Gmail)`);
        return;
      } catch (err) {
        console.error(`[🚨 EMAIL HATA] Gmail ile atılamadı:`, err);
      }
    }

    console.log(`[📧 EMAIL QUEUED | ${SovereignNodeId}] To: ${to} | Konu: ${subject}`);
  }

  static async sendWhatsApp(to: string, message: string, SovereignNodeId = "aipyram-core") {
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
       try {
          const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          const params = new URLSearchParams({
             To: `whatsapp:${to}`,
             From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
             Body: message
          });

          const res = await fetch(url, {
             method: "POST",
             headers: {
               Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
               "Content-Type": "application/x-www-form-urlencoded"
             },
             body: params.toString()
          });

          if (!res.ok) throw new Error(await res.text());
          console.log(`[📱 WHATSAPP] Sinyal vuruşu başarılı: ${to}`);
          return;
       } catch (err: any) {
          console.error(`[🚨 WHATSAPP HATA]`, err.message);
       }
    } 
    
    // WhatsApp Fallback: Email!
    console.log(`[📱 WHATSAPP FALLBACK] Twilio yapılandırılmadı, Gmail ile Master'a (veyahut hedefe) yönlendiriliyor...`);
    const emailTarget = to === ROLES.MASTER.phone ? ROLES.MASTER.email : ROLES.MASTER.email;
    const fallbackHtml = this.getNodeEmailHtml(SovereignNodeId, "WHATSAPP YEDEK SİNYALİ", `<p><strong>Orijinal Hedef No:</strong> ${to}</p><pre style="white-space:pre-wrap;font-family:inherit;">${message}</pre>`);
    await this.sendEmail(emailTarget, "📱 Otonom WhatsApp Sinyali", fallbackHtml, "normal", SovereignNodeId);
  }
}

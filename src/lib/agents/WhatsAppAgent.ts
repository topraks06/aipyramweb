import { adminDb } from '@/lib/firebase-admin';
import { getNode } from '@/lib/sovereign-config';

export interface WhatsAppResult {
  success: boolean;
  waLink: string;
  message?: string;
}

/**
 * WhatsApp Agent — Node-agnostik mesajlaşma servisi.
 * wa.me deep URL üretir ve isteğe bağlı olarak Firestore'a loglar.
 */
export async function sendMessage(SovereignNodeId: string, phone: string, message: string, orderId?: string): Promise<WhatsAppResult> {
  console.log(`[WhatsAppAgent] Sinyal Alındı: ${SovereignNodeId} -> ${phone}`);
  console.log(`[WhatsAppAgent] Mesaj: ${message}`);
  
  const cleanPhone = phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  if (orderId) {
    try {
      const config = getNode(SovereignNodeId);
      await adminDb.collection(config.projectCollection).doc(orderId).update({
        status: 'wa_sent',
        lastWhatsAppMessageAt: new Date().toISOString(),
        lastWhatsAppLink: waLink
      });
    } catch (e) {
      console.error(`[WhatsAppAgent] ${SovereignNodeId} projesi güncellenemedi: ${orderId}`, e);
    }
  }

  return { success: true, waLink, message: `WhatsApp mesaj linki oluşturuldu` };
}

/**
 * Sipariş verisinden zengin bir WhatsApp mesajı oluşturur.
 */
export function enrichOrderMessage(orderData: any, SovereignNodeId: string): string {
  const config = getNode(SovereignNodeId);
  const lines = [
    `🏢 ${config.shortName} — B2B Teklif`,
    ``,
    `Müşteri: ${orderData?.customerName || 'Değerli Müşterimiz'}`,
    orderData?.items?.length ? `Ürünler: ${orderData.items.map((i: any) => i.name).join(', ')}` : '',
    orderData?.grandTotal ? `Toplam: ${orderData.grandTotal} USD` : '',
    orderData?.discount ? `İndirim: ${orderData.discount} USD` : '',
    ``,
    `📄 Detaylı teklif belgesine erişmek için panelinizdeki PDF butonunu kullanabilirsiniz.`,
    ``,
    `Powered by aipyram — ${config.domain}`
  ].filter(Boolean);

  return lines.join('\n');
}

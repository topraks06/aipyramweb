import { adminDb } from '@/lib/firebase-admin';
import { getTenant } from '@/lib/tenant-config';

export async function sendMessage(tenantId: string, phone: string, message: string, orderId?: string): Promise<{success: boolean}> {
  console.log(`[WhatsAppAgent] Sinyal Alındı: ${tenantId} -> ${phone}`);
  console.log(`[WhatsAppAgent] Mesaj: ${message}`);
  
  // Burada Twilio veya Meta WhatsApp Business API entegrasyonu olur.
  // Şimdilik mock bekleme süresi:
  await new Promise(res => setTimeout(res, 600));

  const cleanPhone = phone.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  if (orderId) {
    try {
      const config = getTenant(tenantId);
      await adminDb.collection(config.projectCollection).doc(orderId).update({
        status: 'wa_sent',
        lastWhatsAppMessageAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(`[WhatsAppAgent] ${tenantId} projesi güncellenemedi: ${orderId}`, e);
    }
  }

  return { success: true, message: `WhatsApp mesaj linki oluşturuldu: ${waLink}` };
}

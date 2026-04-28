// src/lib/emailService.ts

import { adminDb } from './firebase-admin';

export type EmailPayload = {
  to: string[];
  subject: string;
  body: string;
  metadata?: any;
};

/**
 * Gönderilen e-postaları konsola loglar ve /trtex_outbox/ koleksiyonuna yazar.
 * (Gerçek bir projede SendGrid veya Resend entegrasyonu buraya koyulur).
 */
export async function sendEmail(payload: EmailPayload) {
  try {
    // 1. Konsola MOCK logla (Terminalde görmek için)
    console.log('\n=============================================');
    console.log(`[EMAIL QUEUED]`);
    console.log(`To: ${payload.to.join(', ')}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Body Snippet: ${payload.body.substring(0, 100)}...`);
    console.log('=============================================\n');

    // 2. Firebase Outbox kaydı (Eğer Firestore / adminDb hazırsa)
    if (adminDb) {
      await adminDb.collection('trtex_outbox').add({
        ...payload,
        status: 'queued',
        sentAt: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error('[EmailService Error]', error);
    return false;
  }
}

/**
 * TRTEX LEAD API — B2B Talep Toplama
 * POST /api/lead
 * Firestore'a kaydeder, ileride mail notification eklenebilir.
 */
import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { findSuppliersForLead } from '@/lib/suppliers';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, email, lang, source, page, timestamp } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    // 1. LEAD SCORING ALGORİTMASI
    let score = 0;
    const qLower = query.toLowerCase();

    // High intent keywords
    if (qLower.includes('towel') || qLower.includes('fabric') || qLower.includes('wholesale') || qLower.includes('quote')) {
      score += 20;
    }
    // Has email?
    if (email) {
      score += 30;
    }
    // Deep page source?
    if (page && page.includes('/news/')) {
      score += 10;
    }
    if (page === '/request-quote') {
      score += 50; // Doğrudan quote formuysa anında pass
    }

    // 2. ROUTING LOGIC (Score > 40 ise e-posta at)
    let matchedSupplierIds: string[] = [];
    if (score > 40 && email) {
      const suppliers = findSuppliersForLead(query, 5);
      matchedSupplierIds = suppliers.map(s => s.id);
      
      const supplierEmails = suppliers.map(s => s.email);
      if (supplierEmails.length > 0) {
        await sendEmail({
          to: supplierEmails,
          subject: `B2B Request: New Textile Lead (${lang.toUpperCase()})`,
          body: `
            Yeni bir alım talebi mevcuttur. Lütfen değerlendiriniz:
            
            Talep Detayı: ${query}
            Alıcı İletişim: ${email}
            Kaynak: ${page}
            Tahmini İlgi Skoru: ${score}
          `,
        });
      }
    }

    // 3. FIRESTORE KAYIT
    const leadData = {
      query: query.trim().substring(0, 1500),
      email: email || null,
      lang: lang || 'tr',
      source: source || 'unknown',
      page: page || '/',
      status: score > 40 ? 'routed' : 'new',
      score: score,
      matchedSuppliers: matchedSupplierIds,
      createdAt: timestamp || new Date().toISOString(),
      processedAt: score > 40 ? new Date().toISOString() : null,
    };

    await adminDb.collection('trtex_leads').add(leadData);

    return NextResponse.json({ success: true, message: 'Lead captured' });
  } catch (error) {
    console.error('[LEAD API] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

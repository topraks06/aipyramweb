import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.company) {
      return NextResponse.json({ error: 'Email and company are required' }, { status: 400 });
    }

    const leadData = {
      email: body.email,
      company: body.company,
      phone: body.phone || '',
      message: body.message || '',
      context_type: body.context_type || 'GENERAL',
      context_title: body.context_title || '',
      context_location: body.context_location || '',
      context_score: body.context_score || 0,
      source: body.source || 'trtex_terminal',
      status: 'NEW',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (adminDb) {
      await adminDb.collection('trtex_leads').add(leadData);
    }

    return NextResponse.json({ success: true, message: 'Lead captured successfully' });
  } catch (error: any) {
    console.error('[LEADS API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ leads: [] });
    }

    const leadsSnapshot = await adminDb.collection('trtex_leads')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
      
    const leads = leadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('[LEADS GET API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin is not initialized' }, { status: 500 });
    }

    await adminDb.collection('trtex_leads').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Lead status updated successfully' });
  } catch (error: any) {
    console.error('[LEADS PUT API] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

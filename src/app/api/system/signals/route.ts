import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) return NextResponse.json({ success: false }, { status: 500 });
    
    // Fetch last 50 signals
    const signalsSnap = await adminDb.collection('ecosystem_signals')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
      
    const signals = signalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: signals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, SovereignNodeId, payload, priority = 'normal' } = body;
    
    if (!type || !SovereignNodeId) {
      return NextResponse.json({ success: false, error: 'Missing type or SovereignNodeId' }, { status: 400 });
    }
    
    if (!adminDb) return NextResponse.json({ success: false }, { status: 500 });

    const signalData = {
      type,
      SovereignNodeId,
      payload,
      priority,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    const docRef = await adminDb.collection('ecosystem_signals').add(signalData);
    
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    try {
        if (!adminDb) {
             return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const docRef = adminDb.collection('aloha_visitor_profiles').doc(sessionId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return NextResponse.json(docSnap.data());
        } else {
            return NextResponse.json({});
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!adminDb) {
             return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        const body = await request.json();
        const { sessionId, profileData } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
        }

        const docRef = adminDb.collection('aloha_visitor_profiles').doc(sessionId);
        await docRef.set(profileData, { merge: true });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

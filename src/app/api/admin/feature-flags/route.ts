import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

// Helper to check admin
async function checkAdmin(req: NextRequest) {
  const sessionCookie = req.cookies.get('session');
  if (!sessionCookie?.value) return false;
  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    // Assuming anyone who gets here with a valid token from aipyram domain can be admin or we check email
    if (decodedToken.email?.includes('admin') || decodedToken.email === 'hakantoprak71@gmail.com') {
      return true;
    }
    // Alternatively, fetch user role from sovereign_users
    if (adminDb) {
      const userDoc = await adminDb.collection('sovereign_users').doc(decodedToken.uid).get();
      if (userDoc.exists && userDoc.data()?.role === 'admin') {
        return true;
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

  try {
    const snapshot = await adminDb.collection('feature_flags').get();
    const flags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: flags });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

  try {
    const body = await req.json();
    const { id, name, status, trafficPercentage } = body;
    
    if (!id || !name || !status) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    await adminDb.collection('feature_flags').doc(id).set({
      name,
      status,
      trafficPercentage: trafficPercentage || 0,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Feature flag created' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

  try {
    const body = await req.json();
    const { id, status, trafficPercentage } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (status) updateData.status = status;
    if (trafficPercentage !== undefined) updateData.trafficPercentage = trafficPercentage;

    await adminDb.collection('feature_flags').doc(id).update(updateData);

    return NextResponse.json({ success: true, message: 'Feature flag updated' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminDb) return NextResponse.json({ success: false, error: 'DB not connected' }, { status: 500 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    await adminDb.collection('feature_flags').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Feature flag deleted' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

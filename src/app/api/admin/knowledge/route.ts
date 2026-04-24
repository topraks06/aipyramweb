import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { topic, content, source = "manual_admin", metadata = {} } = body;

    if (!topic || !content) {
      return NextResponse.json({ success: false, error: "Topic and content are required." }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Firebase Admin is not initialized." }, { status: 500 });
    }

    const docRef = adminDb.collection('aloha_knowledge').doc();
    
    await docRef.set({
      topic,
      content,
      source,
      metadata,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    });

    return NextResponse.json({ 
      success: true, 
      message: "Knowledge saved to Sovereign DB.",
      id: docRef.id
    });
    
  } catch (error: any) {
    console.error("[Aloha Knowledge API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Firebase Admin is not initialized." }, { status: 500 });
    }

    // Default to getting the latest 50 active knowledge items
    const snapshot = await adminDb.collection('aloha_knowledge')
                                  .where('active', '==', true)
                                  .orderBy('createdAt', 'desc')
                                  .limit(50)
                                  .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Aloha Knowledge API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { id, topic, content, metadata } = body;

    if (!id || !topic || !content) {
      return NextResponse.json({ success: false, error: "ID, topic, and content are required." }, { status: 400 });
    }

    if (!adminDb) return NextResponse.json({ success: false, error: "Firebase Admin is not initialized." }, { status: 500 });

    const docRef = adminDb.collection('aloha_knowledge').doc(id);
    await docRef.update({
      topic,
      content,
      ...(metadata ? { metadata } : {}),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Knowledge updated." });
  } catch (error: any) {
    console.error("[Aloha Knowledge API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required." }, { status: 400 });
    }

    if (!adminDb) return NextResponse.json({ success: false, error: "Firebase Admin is not initialized." }, { status: 500 });

    const docRef = adminDb.collection('aloha_knowledge').doc(id);
    await docRef.update({
      active: false,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Knowledge deactivated." });
  } catch (error: any) {
    console.error("[Aloha Knowledge API] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

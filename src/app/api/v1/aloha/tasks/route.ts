import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/aloha/tasks — Görevleri listele
 * POST /api/v1/aloha/tasks — Yeni görev oluştur
 * PATCH /api/v1/aloha/tasks — Görev durumunu güncelle (onayla/reddet)
 */

const COLLECTION = 'aloha_tasks';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'pending';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    const query = status === 'all'
      ? adminDb.collection(COLLECTION).orderBy('created_at', 'desc').limit(limit)
      : adminDb.collection(COLLECTION).where('status', '==', status).orderBy('created_at', 'desc').limit(limit);

    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, total: tasks.length, tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasyon
    if (!body.title || !body.project) {
      return NextResponse.json({ error: 'title ve project zorunlu' }, { status: 400 });
    }

    // Max 5 dosya kontrolü
    if (body.changes && body.changes.length > 5) {
      return NextResponse.json({ 
        error: `Max 5 dosya/görev — ${body.changes.length} dosya istendi`,
        code: 'MAX_FILES_EXCEEDED',
      }, { status: 422 });
    }

    // Priority validasyonu (1-5)
    const priority = Math.min(5, Math.max(1, parseInt(body.priority) || 3));

    const task = {
      type: body.type || 'code_change',
      source: body.source || 'cloud',
      status: body.requires_approval !== false ? 'pending' : 'approved',
      title: body.title,
      description: body.description || '',
      project: body.project,
      changes: body.changes || [],
      risk: body.risk || 'low',
      requires_approval: body.requires_approval !== false,
      priority,
      mode: body.mode || 'execute',  // 'execute' | 'dry_run'
      approved_by: null,
      approved_at: null,
      backup_tag: null,
      result: null,
      created_at: FieldValue.serverTimestamp(),
      started_at: null,
      completed_at: null,
    };

    const ref = await adminDb.collection(COLLECTION).add(task);

    return NextResponse.json({ 
      success: true, 
      task_id: ref.id,
      status: task.status,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, action } = body;

    if (!task_id || !action) {
      return NextResponse.json({ error: 'task_id ve action zorunlu' }, { status: 400 });
    }

    const docRef = adminDb.collection(COLLECTION).doc(task_id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        await docRef.update({
          status: 'approved',
          approved_by: body.approved_by || 'admin',
          approved_at: FieldValue.serverTimestamp(),
        });
        break;
      case 'reject':
        await docRef.update({
          status: 'rejected',
          completed_at: FieldValue.serverTimestamp(),
        });
        break;
      default:
        return NextResponse.json({ error: `Bilinmeyen action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, task_id, action });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

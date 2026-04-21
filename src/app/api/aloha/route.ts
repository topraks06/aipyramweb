import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/aloha?limit=15
 * ALOHA görev listesi, plan durumu ve son aktiviteleri döndürür.
 * Admin UI tarafından kullanılır (AlohaControl, FounderDashboard).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const results: any = {
      tasks: [],
      plans: [],
      lessons: [],
      stats: { totalTasks: 0, pendingPlans: 0, totalLessons: 0 },
    };

    // 1. Son görevler (aloha_tasks)
    try {
      const tasksSnap = await adminDb
        .collection("aloha_tasks")
        .orderBy("created_at", "desc")
        .limit(limit)
        .get();
      results.tasks = tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      results.stats.totalTasks = tasksSnap.size;
    } catch {
      // Koleksiyon boş olabilir
    }

    // 2. Aktif planlar (aloha_plans)
    try {
      const plansSnap = await adminDb
        .collection("aloha_plans")
        .orderBy("created_at", "desc")
        .limit(limit)
        .get();
      results.plans = plansSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          goal: data.plan?.goal || "Bilinmeyen",
          status: data.status,
          total_steps: data.total_steps || 0,
          current_step: data.current_step || 0,
          confidence: data.plan?.confidence || 0,
          created_at: data.created_at,
        };
      });
      results.stats.pendingPlans = results.plans.filter(
        (p: any) => p.status === "pending_approval"
      ).length;
    } catch {
      // Koleksiyon boş olabilir
    }

    // 3. Son dersler (aloha_lessons)
    try {
      const lessonsSnap = await adminDb
        .collection("aloha_lessons")
        .orderBy("created_at", "desc")
        .limit(5)
        .get();
      results.lessons = lessonsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      results.stats.totalLessons = lessonsSnap.size;
    } catch {
      // Koleksiyon boş olabilir
    }

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("[ALOHA API] GET error:", err);
    return NextResponse.json(
      { error: err.message, tasks: [], plans: [], lessons: [] },
      { status: 500 }
    );
  }
}

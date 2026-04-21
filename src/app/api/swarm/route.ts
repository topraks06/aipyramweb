import { NextResponse } from "next/server";
import { runSwarm } from "@/core/aloha/orchestrator";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const result = await runSwarm({
      task: body.task,
      context: body.context || {}
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

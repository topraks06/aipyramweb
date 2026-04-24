import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/chat-memory";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        
        const session = await getSession(sessionId);
        return NextResponse.json({ messages: session ? session.messages : [] });
    } catch (err) {
        console.error("Chat history fetch error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

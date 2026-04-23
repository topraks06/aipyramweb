import { NextRequest, NextResponse } from "next/server";
import { invokeAgent } from "@/lib/aloha/registry";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, phone, message, SovereignNodeId = 'perde' } = body;

        const result = await invokeAgent({
            agentType: 'whatsapp',
            SovereignNodeId,
            payload: { phone, message, orderId }
        });

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
         console.error("WhatsApp API error:", error);
         return NextResponse.json({ error: "Sunucu hatası - WhatsApp mesajı gönderilemedi" }, { status: 500 });
    }
}

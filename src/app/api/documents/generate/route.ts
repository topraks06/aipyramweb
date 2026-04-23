import { NextRequest, NextResponse } from "next/server";
import { invokeAgent } from "@/lib/aloha/registry";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, data, SovereignNodeId = 'perde' } = body;

        const result = await invokeAgent({
            agentType: 'document',
            SovereignNodeId,
            payload: { orderId, data }
        });

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            documentUrl: result.data?.pdfUrl,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
         console.error("Document API error:", error);
         return NextResponse.json({ error: "Sunucu hatası - Belge oluşturulamadı" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { swarmBus, SwarmEvents } from "@/lib/agents/EventBus";
import { initializeSwarm } from "@/lib/agents/SwarmCoordinator";
import { adminDb } from "@/lib/firebase-admin";

// Ensure swarm is initialized so rules are active
let isSwarmInitialized = false;

export async function POST(req: NextRequest) {
    if (!isSwarmInitialized) {
        initializeSwarm();
        isSwarmInitialized = true;
    }

    try {
        const body = await req.json();
        const { event, payload } = body;

        if (!event || !payload) {
            return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
        }

        console.log(`[API Trigger] ${event} sinyali alindı. ALOHA EventBus'a aktarılıyor.`);

        // Fire the event asynchronously so API returns quick
        Promise.resolve().then(() => {
             swarmBus.emit(event, payload);
        }).catch(e => console.error("EventBus Emit Hatası", e));

        return NextResponse.json({ success: true, message: `Sinyal fırlatıldı: ${event}` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';

// GET - Fetch data from any table (for admin panel)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const table = searchParams.get("table");

        if (!table) {
            return NextResponse.json({ success: false, error: "Table parameter required" }, { status: 400 });
        }

        // Production: Google Native Memory (Sovereign Node)
        let data: any[] = [];
        
        switch(table) {
            case "domain_management":
                data = [{ id: 1, domain: "trtex.com", status: "Active", health: 100 }, { id: 2, domain: "icmimar.ai", status: "Active", health: 100 }];
                break;
            case "aloha_system_state":
                const stateSnapshot = await adminDb.collection("aloha_system_state").get();
                data = stateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                break;
            case "sovereign_audit_log":
                const auditSnapshot = await adminDb.collection("sovereign_audit_log").orderBy("timestamp", "desc").limit(100).get();
                data = auditSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                break;
            case "aloha_costs":
                const costsSnapshot = await adminDb.collection("aloha_costs").orderBy("timestamp", "desc").limit(50).get();
                data = costsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                break;
            default:
                const snap = await adminDb.collection(table).limit(50).get();
                data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const table = body.table;
        const data = body.data;

        if (!table || !data) {
            return NextResponse.json({ success: false, error: "Table and data required" }, { status: 400 });
        }

        // Kill Switch update logic
        if (table === "aloha_system_state" && data.id === "global") {
            await adminDb.collection("aloha_system_state").doc("global").set({
                ...data,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            return NextResponse.json({ success: true, data });
        }

        const docRef = await adminDb.collection(table).add(data);
        return NextResponse.json({ success: true, data: { id: docRef.id, ...data } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const table = body.table;
        const id = body.id;
        const data = body.data;

        if (!table || !id || !data) {
            return NextResponse.json({ success: false, error: "Table, id, and data required" }, { status: 400 });
        }

        // Kill Switch update logic
        if (table === "aloha_system_state" && id === "global") {
            await adminDb.collection("aloha_system_state").doc("global").set({
                ...data,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            return NextResponse.json({ success: true, data: { id, ...data } });
        }

        await adminDb.collection(table).doc(id).update(data);
        
        return NextResponse.json({ success: true, data: { id, ...data } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const table = body.table;
        const id = body.id;

        if (!table || !id) {
            return NextResponse.json({ success: false, error: "Table and id required" }, { status: 400 });
        }

        await adminDb.collection(table).doc(id).delete();
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

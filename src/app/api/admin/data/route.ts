import { NextRequest, NextResponse } from "next/server";
import { getFromGoogleNativeMemory } from "@/core/aloha/publishers/google-native-memory";

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
                data = [{ id: 1, domain: "trtex.com", status: "Active", health: 100 }];
                break;
            case "ai_agents":
                data = [{ id: 1, name: "aipyram Master Node", role: "Commander", status: "Online" }];
                break;
            case "automation_rules":
                data = [{ id: 1, trigger: "webhook", action: "revalidate", status: "Active" }];
                break;
            default:
                data = getFromGoogleNativeMemory(table);
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

        const { saveToGoogleNativeMemory } = await import('@/core/aloha/publishers/google-native-memory');
        const result = saveToGoogleNativeMemory(table, data);
        
        return NextResponse.json({ success: true, data: result });
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

        const { updateInGoogleNativeMemory } = await import('@/core/aloha/publishers/google-native-memory');
        const result = updateInGoogleNativeMemory(table, id, data);
        
        if (!result) {
            return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: result });
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

        const { deleteFromGoogleNativeMemory } = await import('@/core/aloha/publishers/google-native-memory');
        const success = deleteFromGoogleNativeMemory(table, id);
        
        if (!success) {
            return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

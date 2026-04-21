import { NextRequest, NextResponse } from "next/server";
import { findByTags, findByCategory, addImage } from "@/lib/image-library";

// GET /api/library?tags=modern,salon&category=curtain_modern&limit=10
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tagsParam = searchParams.get("tags");
        const category = searchParams.get("category");
        const limitStr = searchParams.get("limit");
        const limit = limitStr ? parseInt(limitStr, 10) : 10;

        let results = [];

        if (tagsParam) {
            const tags = tagsParam.split(",").map(t => t.trim());
            results = await findByTags(tags, limit);
        } else if (category) {
            results = await findByCategory(category, limit);
        } else {
            return NextResponse.json({ error: "Lütfen arama kriteri belirtin (tags veya category)" }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: results.length, data: results });
    } catch (err) {
        console.error("Library API error:", err);
        return NextResponse.json({ success: false, error: "Sunucu hatası" }, { status: 500 });
    }
}

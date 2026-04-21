import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MEMORY_DIR = path.resolve(process.cwd(), 'data/sovereign');

export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
        const type = searchParams.get('type') || 'news';
        
        // Sadece izin verilen tipler
        const validTypes = ['news', 'watchlist', 'quarantine'];
        const targetCollection = validTypes.includes(type) ? type : 'news';

        const filePath = path.join(MEMORY_DIR, `${targetCollection}.json`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({
                success: true,
                metadata: { source: 'aipyram_master_node', version: '1.1', collection: targetCollection },
                data: []
            });
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        let parsedData = [];
        try {
            parsedData = JSON.parse(rawData);
            if (!Array.isArray(parsedData)) parsedData = [parsedData];
        } catch (e) {
            console.error("Triple Output JSON Parse Error", e);
        }

        // Limit data
        const slicedData = parsedData.slice(0, limit);

        return NextResponse.json({
            success: true,
            metadata: {
                source: 'aipyram_master_node',
                version: '1.1',
                collection: targetCollection,
                total_loaded: parsedData.length,
                returned: slicedData.length
            },
            data: slicedData
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

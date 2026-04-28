import { NextResponse } from 'next/server';
import { getFromGoogleNativeMemory } from '@/core/aloha/publishers/google-native-memory';

/**
 * TRTEX (veya herhangi bir Dumb Client) artık doğrudan bu Merkezi Sinyal Rotasına gelir.
 * GET parametresi olarak `?collection=news` veya `?collection=signals` atması yeterlidir.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection') || 'news';
    
    try {
        // Doğrudan kendi beynimizden (Sovereign Memory) çekiyoruz
        const data = getFromGoogleNativeMemory(collection);
        
        // Zero-Cache mantığı ile Müşteriye Gönderim (Push değil, Pull)
        return NextResponse.json(
            { 
                success: true, 
                sovereign_node: "aipyram",
                collection,
                count: data.length, 
                data 
            }, 
            { 
                status: 200,
                headers: { 
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' 
                } 
            }
        );
    } catch(e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

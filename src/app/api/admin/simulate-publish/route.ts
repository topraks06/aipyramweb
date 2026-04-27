import { NextResponse } from 'next/server';
import { executeGlobalPublish } from '@/lib/aloha/workflows/GlobalPublishWorkflow';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Güvenlik: ALOHA Otonom Döngüsü
    const result = await executeGlobalPublish(payload);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Infinite Loop Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

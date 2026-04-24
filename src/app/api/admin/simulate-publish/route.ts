import { NextResponse } from 'next/server';
import { GlobalPublishWorkflow } from '@/lib/aloha/workflows/GlobalPublishWorkflow';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Güvenlik: ALOHA Otonom Döngüsü
    const result = await GlobalPublishWorkflow.executeInfiniteLoop(payload);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Infinite Loop Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

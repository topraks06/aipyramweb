import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // In a real application, you would save this to Firestore or send an email.
    // For now, we simulate a successful submission.
    console.log("Contact Request Received:", data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.' 
    });
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin.' }, 
      { status: 500 }
    );
  }
}

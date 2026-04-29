import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN SSO — SESSION BRIDGE
 *  
 *  Google SSO mantığı: Firebase ID Token → HttpOnly Session Cookie
 *  Tek cookie, 7 node, tüm API route'larda geçerli.
 *  
 *  POST: Login sonrası → session cookie oluştur (14 gün)
 *  DELETE: Logout → session cookie sil
 * ═══════════════════════════════════════════════════════════════
 */

// 14 gün (milisaniye)
const SESSION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'ID Token gereklidir.' }, { status: 400 });
    }

    // Firebase Admin SDK ile session cookie oluştur
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    });

    // Kullanıcı bilgilerini doğrula
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    console.log(`[SESSION BRIDGE] 🔐 Session oluşturuldu: ${decodedToken.email} (${decodedToken.uid})`);

    const response = NextResponse.json({
      success: true,
      message: 'Sovereign SSO oturumu başarıyla oluşturuldu.',
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    // HttpOnly, Secure cookie — tüm path'lerde geçerli
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000, // saniye cinsinden
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[SESSION BRIDGE] ❌ Session oluşturma hatası:', error.message);
    
    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json({ error: 'Geçersiz token.' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Oturum oluşturulamadı.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    console.log('[SESSION BRIDGE] 🔓 Session silindi');
    
    const response = NextResponse.json({
      success: true,
      message: 'Oturum kapatıldı.',
    });

    // Cookie'yi sil
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[SESSION BRIDGE] ❌ Logout hatası:', error.message);
    return NextResponse.json({ error: 'Çıkış yapılamadı.' }, { status: 500 });
  }
}

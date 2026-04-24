import { cookies } from 'next/headers';
import { admin } from '@/lib/firebase-admin';

export async function verifyAdminAccess() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return false;
    }
    
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    // If you have custom claims for admin, check here. 
    // e.g. if (!decodedClaims.admin) return false;
    
    return !!decodedClaims;
  } catch (error) {
    console.error("Admin verification failed:", error);
    return false;
  }
}

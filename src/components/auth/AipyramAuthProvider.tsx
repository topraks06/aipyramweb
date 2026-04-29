'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase-client';
import { syncSovereignIdentity } from '@/lib/auth/SovereignIdentity';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

/**
 * 🔐 SESSION BRIDGE — Firebase token → HttpOnly cookie
 * Login sonrası otomatik çağrılır. Tüm API route'lar bu cookie'yi kullanır.
 */
async function syncSessionCookie(user: User | null) {
  if (!user) return;
  try {
    const idToken = await user.getIdToken(true);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    console.log('[SSO] 🔐 Session cookie oluşturuldu');
  } catch (err) {
    console.warn('[SSO] Session cookie oluşturulamadı:', err);
  }
}

async function clearSessionCookie() {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
    console.log('[SSO] 🔓 Session cookie silindi');
  } catch (err) {
    console.warn('[SSO] Session cookie silinemedi:', err);
  }
}

export function AipyramAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Master Admin Array - loaded from environment variables
  const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hakantoprak71@gmail.com').split(',').filter(Boolean);
  
  useEffect(() => {
    // Check if there is an active local bypass
    if (typeof window !== 'undefined' && sessionStorage.getItem('dev_bypass_admin') === 'true') {
      setUser({ email: 'hakantoprak71@gmail.com', uid: 'admin-local-bypass' } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Don't overwrite if dev bypass is active
      if (typeof window !== 'undefined' && sessionStorage.getItem('dev_bypass_admin') === 'true') {
        return;
      }
      setUser(currentUser);
      setLoading(false);

      // 🔐 SESSION BRIDGE — Her auth değişikliğinde cookie'yi senkronize et
      if (currentUser) {
        await syncSessionCookie(currentUser);
        // 🛂 Sovereign Passport Kaydı/Güncellemesi
        const activeDomain = typeof window !== 'undefined' ? window.location.hostname : 'aipyram';
        try {
          await syncSovereignIdentity(currentUser, activeDomain);
          console.log('[SSO] 👑 Sovereign Identity senkronize edildi.');
        } catch (e) {
          console.error('[SSO] Sovereign Identity hatası:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        console.log("[DEV BYPASS] Localhost üzerinden Google Agresif Yetkili Girişi yapıldı.");
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dev_bypass_admin', 'true');
        }
        setUser({ email: 'hakantoprak71@gmail.com', uid: 'admin-local-bypass' } as User);
        setLoading(false);
        return;
      }
      const result = await signInWithPopup(auth, googleProvider);
      // 🔐 Session cookie'yi hemen oluştur
      await syncSessionCookie(result.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (e: string, p: string) => {
    try {
      const cleanEmail = e.trim().toLowerCase();
      const cleanPass = p.trim();
      
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev && cleanPass === 'oyaalya123') {
        console.log("[DEV BYPASS] Localhost üzerinden Agresif Yetkili Girişi yapıldı.");
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dev_bypass_admin', 'true');
        }
        setUser({ email: 'hakantoprak71@gmail.com', uid: 'admin-local-bypass' } as User);
        setLoading(false);
        return;
      }
      
      const result = await signInWithEmailAndPassword(auth, e, p);
      // 🔐 Session cookie'yi hemen oluştur
      await syncSessionCookie(result.user);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (e: string, p: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, e.trim().toLowerCase(), p);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        await syncSessionCookie(result.user);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('dev_bypass_admin');
      }
      // 🔐 Session cookie'yi sil
      await clearSessionCookie();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


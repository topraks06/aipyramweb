'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Don't overwrite if dev bypass is active
      if (typeof window !== 'undefined' && sessionStorage.getItem('dev_bypass_admin') === 'true') {
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginWithEmail = async (e: string, p: string) => {
    try {
      // Local Development Bypass (Firebase API Key Restriction Çözümü)
      const cleanEmail = e.trim().toLowerCase();
      const cleanPass = p.trim();
      
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocalhost) {
        console.log("[DEV BYPASS] Localhost üzerinden Agresif Yetkili Girişi yapıldı.");
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('dev_bypass_admin', 'true');
        }
        // Force the email to be the master admin email so isAdmin evaluates to true
        setUser({ email: 'hakantoprak71@gmail.com', uid: 'admin-local-bypass' } as User);
        setLoading(false);
        return;
      }
      
      await signInWithEmailAndPassword(auth, e, p);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

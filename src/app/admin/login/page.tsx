
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Shield, ArrowLeft } from "lucide-react";

// Sovereign Admin Credentials (from environment variables)
const SOVEREIGN_ADMINS = [
  { 
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "", 
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "" 
  },
  { 
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL_2 || "", 
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_2 || "" 
  },
];

const SOVEREIGN_GOOGLE_EMAIL = process.env.NEXT_PUBLIC_SOVEREIGN_GOOGLE_EMAIL || "";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const grantAccess = () => {
    document.cookie = "aipyram_auth=sovereign_pass; path=/; max-age=604800; SameSite=Lax";
    toast.success("Welcome back, Commander. Sovereign Node Active.");
    router.push("/admin");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const match = SOVEREIGN_ADMINS.find(
        (admin) => admin.email === email.toLowerCase().trim() && admin.password === password
      );

      if (match) {
        grantAccess();
      } else {
        toast.error("Authentication failed: Invalid credentials.");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Dynamic import to avoid bundling firebase on initial load
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      };

      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email?.toLowerCase();

      if (userEmail === SOVEREIGN_GOOGLE_EMAIL) {
        grantAccess();
      } else {
        toast.error(`Access denied for ${userEmail}. Only the Sovereign Admin can enter.`);
        await auth.signOut();
      }
    } catch (error: any) {
      console.error("[Google Auth Error]", error);
      // Fallback: If Firebase Auth isn't configured, grant access via cookie shortcut
      if (error.code === "auth/configuration-not-found" || error.code === "auth/internal-error") {
        toast.info("Firebase Auth not configured. Using sovereign bypass...");
        grantAccess();
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.info("Google sign-in cancelled.");
      } else {
        toast.error("Google sign-in failed. Please use email/password.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 swiss-cross-pattern opacity-[0.02]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aipyram GmbH · Neural Protocol v2.1
          </p>
        </div>

        {/* Login Card */}
        <div className="corporate-card rounded-lg p-8 space-y-6">
          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-medium"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="hakantoprak71@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs text-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 h-3 w-3" />
            Back to website
          </Button>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Dietikon, Switzerland
          </p>
        </div>
      </div>
    </div>
  );
}


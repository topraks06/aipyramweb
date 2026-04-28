"use client";

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import CurtaindesignNavbar from './CurtaindesignNavbar';
import CurtaindesignFooter from './CurtaindesignFooter';

export default function CurtaindesignAuth({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-serif">
      <CurtaindesignNavbar />
      
      <main className="flex-grow flex items-center justify-center p-6 mt-20 mb-20">
        <div className="w-full max-w-md bg-white p-8 md:p-12 shadow-2xl border-t-4 border-amber-500 rounded-b-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-slate-500 font-sans text-sm">
              {mode === 'login' 
                ? 'Sign in to access your B2B dashboard and AI design tools.' 
                : 'Join Curtaindesign.ai to revolutionize your textile sourcing.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded mb-6 font-sans text-sm border border-red-200 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 font-sans">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded focus:ring-amber-500 focus:border-amber-500 bg-slate-50" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded focus:ring-amber-500 focus:border-amber-500 bg-slate-50" 
                  placeholder="you@company.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded focus:ring-amber-500 focus:border-amber-500 bg-slate-50" 
                  placeholder="••••••••" 
                />
              </div>
              {mode === 'login' && (
                <div className="flex justify-end mt-2">
                  <Link href="/forgot-password" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white py-3 px-4 border border-transparent rounded text-sm font-bold uppercase tracking-widest hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-70"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center font-sans text-sm text-slate-600">
            {mode === 'login' ? (
              <p>Don't have an account? <Link href="/register" className="font-bold text-amber-600 hover:text-amber-500">Sign up</Link></p>
            ) : (
              <p>Already have an account? <Link href="/login" className="font-bold text-amber-600 hover:text-amber-500">Log in</Link></p>
            )}
          </div>
        </div>
      </main>

      <CurtaindesignFooter />
    </div>
  );
}

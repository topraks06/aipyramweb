/**
 * @aipyram/firebase — Shared Firebase Re-export
 * 
 * Fiziksel taşıma yok — sadece re-export.
 * Fuar sonrası gerçek taşıma yapılacak.
 */

// Server-side (Admin SDK — RLS bypass)
export { adminDb } from '@/lib/firebase-admin';

// Client-side (Firebase SDK — RLS uyumlu)
export { db, auth } from '@/lib/firebase-client';

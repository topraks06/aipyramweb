import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Init durum takibi
let firebaseInitStatus: 'ok' | 'noop' | 'failed' = 'failed';

// Init Firebase Admin if not already
if (!admin.apps.length) {
    try {
        let initialized = false;

        // 1. Env Değişkeni (Cloud ortamı)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
            try {
                const decodedToken = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
                const serviceAccount = JSON.parse(decodedToken);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("[FIREBASE_ADMIN] ✅ Initialized via FIREBASE_SERVICE_ACCOUNT_KEY_BASE64.");
                initialized = true;
            } catch (err: any) {
                console.error(`[FIREBASE_ADMIN] 🔴 BASE64 PARSE HATASI: ${err.message}`);
            }
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("[FIREBASE_ADMIN] ✅ Initialized via FIREBASE_SERVICE_ACCOUNT_KEY.");
                initialized = true;
            } catch (err: any) {
                console.error(`[FIREBASE_ADMIN] 🔴 FIREBASE_SERVICE_ACCOUNT_KEY PARSE HATASI: ${err.message}`);
                console.error("[FIREBASE_ADMIN] 🔴 JSON formatını kontrol et! Tek satır, çift tırnak olmalı.");
            }
        }

        // 2. Local Fallback (dev ortamı)
        if (!initialized) {
            const possiblePaths = [
                path.join(process.cwd(), 'firebase-sa-key.json'),
                path.join(__dirname, '../../firebase-sa-key.json'),
                path.join(process.cwd(), '../../firebase-sa-key.json')
            ];
            
            for (const keyPath of possiblePaths) {
                if (fs.existsSync(keyPath)) {
                    try {
                        const fileContent = fs.readFileSync(keyPath, 'utf8');
                        const serviceAccount = JSON.parse(fileContent);
                        admin.initializeApp({
                            credential: admin.credential.cert(serviceAccount)
                        });
                        console.log(`[FIREBASE_ADMIN] ✅ Initialized via local key: ${keyPath}`);
                        initialized = true;
                        break;
                    } catch (err: any) {
                        console.error(`[FIREBASE_ADMIN] 🔴 Parse error in local key ${keyPath}: ${err.message}`);
                    }
                }
            }
        }

        // 3. Application Default (Son çare — Cloud Run'da çalışır)
        if (!initialized) {
            try {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault()
                });
                console.log("[FIREBASE_ADMIN] ✅ Initialized via applicationDefault.");
                initialized = true;
            } catch {
                console.error("[FIREBASE_ADMIN] 🔴🔴🔴 HİÇBİR KİMLİK BULUNAMADI! Firestore ÇALIŞMAYACAK!");
                console.error("[FIREBASE_ADMIN] Kontrol et: FIREBASE_SERVICE_ACCOUNT_KEY env var veya firebase-sa-key.json");
            }
        }
    } catch (e) {
        console.error("[FIREBASE_ADMIN] 🔴 Firebase admin init CRASH:", e);
    }
}

// Firestore instance al
let adminDb: admin.firestore.Firestore;
try {
    adminDb = admin.firestore();
    firebaseInitStatus = 'ok';
    console.log("[FIREBASE_ADMIN] ✅ Firestore bağlantısı aktif.");
} catch {
    // No Firebase app → no-op proxy (SİSTEM DEGRADED MODDA)
    console.error("[FIREBASE_ADMIN] 🔴🔴🔴 FIRESTORE BAŞLATILAMADI! NOOP PROXY AKTİF — SİSTEM DEGRADED!");
    firebaseInitStatus = 'noop';

    class NoopQuery {
        limit() { return this; }
        where() { return this; }
        orderBy() { return this; }
        select() { return this; }
        startAfter() { return this; }
        endBefore() { return this; }
        offset() { return this; }
        count() { return { get: async () => ({ data: () => ({ count: 0 }) }) }; }
        async get() { return { empty: true, size: 0, docs: [], forEach: () => {} }; }
    }

    class NoopCollection extends NoopQuery {
        doc(id?: string) {
            return {
                set: async () => {},
                update: async () => {},
                get: async () => ({ exists: false, data: () => ({}) }),
                delete: async () => {}
            };
        }
        async add(d: any) { return { id: `noop_${Date.now()}` }; }
    }

    // Proxy the instance explicitly binding methods to object keys to prevent IPC prototype stripping
    const noopColInstanceRaw = new NoopCollection();
    const noopColInstance = {
        limit: () => noopColInstanceRaw.limit(),
        where: () => noopColInstanceRaw.where(),
        orderBy: () => noopColInstanceRaw.orderBy(),
        select: () => noopColInstanceRaw.select(),
        startAfter: () => noopColInstanceRaw.startAfter(),
        endBefore: () => noopColInstanceRaw.endBefore(),
        offset: () => noopColInstanceRaw.offset(),
        count: () => noopColInstanceRaw.count(),
        get: () => noopColInstanceRaw.get(),
        doc: (id?: string) => noopColInstanceRaw.doc(id),
        add: (d: any) => noopColInstanceRaw.add(d)
    } as any;

    adminDb = { 
        collection: (_name?: string) => noopColInstance, 
        collectionGroup: (_name?: string) => noopColInstance,
        runTransaction: async (fn: any) => { await fn({ get: async () => ({ exists: false }), set: () => {}, update: () => {}, delete: () => {} }); },
        batch: () => ({ commit: async () => {}, set: () => {}, update: () => {}, delete: () => {} }),
    } as any;
}

/** Firestore sağlık kontrolü — initiative ve health endpoint'leri kullanır */
export async function checkFirestoreHealth(): Promise<'OK' | 'NOOP' | 'DOWN'> {
  if (firebaseInitStatus === 'noop') return 'NOOP';
  try {
    await adminDb.collection('_health_check').limit(1).get();
    return 'OK';
  } catch {
    return 'DOWN';
  }
}

export { adminDb, admin, firebaseInitStatus };

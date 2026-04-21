/**
 * ALOHA ENV GUARD — Çevre Değişkeni Doğrulama Sistemi
 * 
 * Bu modül, Aloha'nın otonom çalışması için gereken TÜM env
 * değişkenlerini başlangıçta kontrol eder.
 * 
 * Yoksa → UYARI LOG + degraded modda devam
 * Varsa → ✅ konfirmasyon
 * 
 * autoRunner ve engine.ts başlangıcında çağrılır.
 * Bir daha "key eksik" sorunu ASLA yaşanmaz.
 */

export interface EnvCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  available: string[];
  missing: string[];
  warnings: string[];
  report: string;
}

interface EnvVar {
  name: string;
  required: boolean;          // true = sistem çalışmaz
  category: string;
  description: string;
  validate?: (val: string) => boolean;  // Özel doğrulama
}

// ═══════════════════════════════════════
// TÜM BİLİNEN ENV DEĞİŞKENLERİ
// ═══════════════════════════════════════

const ALL_ENV_VARS: EnvVar[] = [
  // 🔴 KRİTİK — Bunlar olmadan sistem ÇALIŞMAz
  {
    name: 'GEMINI_API_KEY',
    required: true,
    category: 'AI Core',
    description: 'Gemini 2.5 Flash — Aloha beyin, içerik üretim, karar motoru',
    validate: (v) => v.startsWith('AIza') && v.length > 30,
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    category: 'Firebase',
    description: 'Firebase client API key',
    validate: (v) => v.startsWith('AIza'),
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    category: 'Firebase',
    description: 'Firebase project ID',
    validate: (v) => v.length > 3 && !v.includes(' '),
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    category: 'Firebase',
    description: 'Firebase auth domain',
    validate: (v) => v.includes('.firebaseapp.com'),
  },

  // 🟡 ÖNEMLİ — Otonom mod kısmen çalışmaz
  {
    name: 'FIREBASE_SERVICE_ACCOUNT_KEY',
    required: false, // Cloud Run'da applicationDefault() kullanır
    category: 'Firebase Admin',
    description: 'Service account JSON (lokal için zorunlu, Cloud Run otomatik)',
    validate: (v) => {
      try { const parsed = JSON.parse(v); return !!parsed.project_id; } 
      catch { return false; }
    },
  },
  {
    name: 'GOOGLE_CLOUD_PROJECT',
    required: false,
    category: 'Cloud',
    description: 'GCP project ID',
  },
  {
    name: 'CRON_SECRET',
    required: false,
    category: 'Security',
    description: 'Cloud Scheduler auth secret',
    validate: (v) => v.length >= 10,
  },
  {
    name: 'ALOHA_BRIDGE_KEY',
    required: false,
    category: 'Security',
    description: 'Chat API güvenlik anahtarı',
  },

  // 🟡 İLETİŞİM
  {
    name: 'GMAIL_USER',
    required: false,
    category: 'Communication',
    description: 'Gmail hesabı (e-posta bildirimleri)',
    validate: (v) => v.includes('@'),
  },
  {
    name: 'GMAIL_APP_PASSWORD',
    required: false,
    category: 'Communication',
    description: 'Gmail App Password',
    validate: (v) => v.length >= 12,
  },

  // 🟢 OPSİYONEL — Yoksa fallback kullanılır
  {
    name: 'VERTEX_PROJECT_ID',
    required: false,
    category: 'Vertex AI',
    description: 'Vertex AI project ID (Imagen, ML)',
  },
  {
    name: 'VERTEX_LOCATION',
    required: false,
    category: 'Vertex AI',
    description: 'Vertex AI bölge (europe-west1)',
  },
  {
    name: 'VERTEX_API_KEY',
    required: false,
    category: 'Vertex AI',
    description: 'Vertex AI direkt erişim key',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    category: 'Payments',
    description: 'Stripe secret key (ödeme sistemi)',
    validate: (v) => v.startsWith('sk_'),
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    required: false,
    category: 'Payments',
    description: 'Stripe publishable key',
    validate: (v) => v.startsWith('pk_'),
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    category: 'Payments',
    description: 'Stripe webhook secret',
    validate: (v) => v.startsWith('whsec_'),
  },
  {
    name: 'GODADDY_API_KEY',
    required: false,
    category: 'Domains',
    description: 'GoDaddy API (domain yönetimi)',
  },
  {
    name: 'GODADDY_API_SECRET',
    required: false,
    category: 'Domains',
    description: 'GoDaddy API Secret',
  },
  {
    name: 'ALOHA_SECRET_KEY',
    required: false,
    category: 'Security',
    description: 'Aloha super agent bypass key',
  },
  {
    name: 'GITHUB_TOKEN',
    required: false,
    category: 'DevOps',
    description: 'GitHub API token (Ghost Strike deploy)',
  },
];

// ═══════════════════════════════════════
// ANA DOĞRULAMA FONKSİYONU
// ═══════════════════════════════════════

let _cachedResult: EnvCheckResult | null = null;

/**
 * Tüm env değişkenlerini kontrol et
 * İlk çağrıda cache'ler — tekrar çağrıldığında cache döner
 */
export function validateEnvironment(forceRefresh = false): EnvCheckResult {
  if (_cachedResult && !forceRefresh) return _cachedResult;

  const available: string[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];
  let criticalMissing = false;

  for (const envVar of ALL_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '' || value === 'dummy') {
      if (envVar.required) {
        criticalMissing = true;
        missing.push(`🔴 ${envVar.name} — ${envVar.description} [KRİTİK]`);
      } else {
        missing.push(`🟡 ${envVar.name} — ${envVar.description} [opsiyonel]`);
      }
      continue;
    }

    // Validasyon
    if (envVar.validate && !envVar.validate(value)) {
      warnings.push(`⚠️ ${envVar.name} — format geçersiz (${envVar.description})`);
    }

    available.push(envVar.name);
  }

  // Cloud Run ortam tespiti
  const isCloudRun = !!(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  if (isCloudRun) {
    // Cloud Run'da FIREBASE_SERVICE_ACCOUNT_KEY opsiyonel — applicationDefault() var
    const fsaIdx = missing.findIndex(m => m.includes('FIREBASE_SERVICE_ACCOUNT_KEY'));
    if (fsaIdx >= 0) {
      missing[fsaIdx] = `🟢 FIREBASE_SERVICE_ACCOUNT_KEY — Cloud Run'da otomatik (applicationDefault)`;
    }
  }

  // GEMINI_API_KEY ve Firebase API KEY aynı mı?
  const geminiKey = process.env.GEMINI_API_KEY;
  const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (geminiKey && firebaseKey && geminiKey === firebaseKey) {
    // Bu Vertex AI + Firebase entegrasyonunda NORMAL
    // Ama ayrı Gemini API key tercihi varsa uyar
    // Şu an sorun değil — Google Console'da Vertex AI etkinse çalışır
  }

  const status: EnvCheckResult['status'] = criticalMissing ? 'critical' : warnings.length > 0 ? 'degraded' : 'healthy';

  // Rapor oluştur
  let report = `═══ ALOHA ENV GUARD ═══\n`;
  report += `🏠 Ortam: ${isCloudRun ? 'Cloud Run' : 'Lokal'}\n`;
  report += `📊 Durum: ${status === 'healthy' ? '✅ SAĞLIKLI' : status === 'degraded' ? '⚠️ DEGRADED' : '🔴 KRİTİK'}\n`;
  report += `✅ Aktif: ${available.length}/${ALL_ENV_VARS.length}\n\n`;

  if (missing.length > 0) {
    report += `EKSİK:\n${missing.join('\n')}\n\n`;
  }
  if (warnings.length > 0) {
    report += `UYARILAR:\n${warnings.join('\n')}\n\n`;
  }

  // Kategori bazlı özet
  const categories = new Map<string, { total: number; active: number }>();
  for (const envVar of ALL_ENV_VARS) {
    const cat = categories.get(envVar.category) || { total: 0, active: 0 };
    cat.total++;
    if (available.includes(envVar.name)) cat.active++;
    categories.set(envVar.category, cat);
  }

  report += `KATEGORİ ÖZETİ:\n`;
  for (const [cat, stats] of categories) {
    const icon = stats.active === stats.total ? '✅' : stats.active > 0 ? '🟡' : '❌';
    report += `${icon} ${cat}: ${stats.active}/${stats.total}\n`;
  }

  _cachedResult = { status, available, missing, warnings, report };

  // Console log (ilk başlatmada)
  if (status === 'critical') {
    console.error(`[🔴 ENV GUARD] KRİTİK — ${missing.filter(m => m.includes('KRİTİK')).length} zorunlu key eksik!`);
  } else if (status === 'degraded') {
    console.warn(`[⚠️ ENV GUARD] Bazı opsiyonel keyler eksik — degraded mod`);
  } else {
    console.log(`[✅ ENV GUARD] Tüm keyler aktif (${available.length}/${ALL_ENV_VARS.length})`);
  }

  return _cachedResult;
}

/**
 * Belirli bir key'in var olup olmadığını kontrol et
 */
export function hasEnvKey(keyName: string): boolean {
  const val = process.env[keyName];
  return !!val && val.trim() !== '' && val !== 'dummy';
}

/**
 * Aloha tool'u olarak çağrılabilir özet
 */
export function getEnvReport(): string {
  return validateEnvironment().report;
}

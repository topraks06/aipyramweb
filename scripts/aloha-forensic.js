/**
 * ALOHA FORENSIC TRUTH MACHINE v1.0
 * ──────────────────────────────────
 * Tahmin yok. Sadece gerçek veri zincirini gösterir.
 * 
 * Zincir: SignalCollector → Firestore Write → API Read → UI Render
 * Her halkanın GERÇEK durumunu kontrol eder.
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  });
}

const db = admin.firestore();

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

function ago(isoOrTimestamp) {
  if (!isoOrTimestamp) return 'YOK';
  const ms = Date.now() - new Date(isoOrTimestamp).getTime();
  if (ms < 0) return 'GELECEK?';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function verdict(ok, label) {
  return ok ? `${GREEN}✅ ${label}${RESET}` : `${RED}❌ ${label}${RESET}`;
}

async function runForensics() {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  ALOHA FORENSIC TRUTH MACHINE v1.0${RESET}`);
  console.log(`${BOLD}${CYAN}  Tarih: ${new Date().toLocaleString('tr-TR')}${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}\n`);

  const report = {
    chain1_signalCollector: null,
    chain2_firestoreWrite: null,
    chain3_apiRead: null,
    chain4_uiData: null,
    breakPoint: null,
  };

  // ═══════════════════════════════════════
  // HALKA 1: CRON / AutoRunner Son Çalışma
  // ═══════════════════════════════════════
  console.log(`${BOLD}${YELLOW}▼ HALKA 1: CRON / AUTORUNNER DURUMU${RESET}`);
  console.log(`${DIM}  Soru: Aloha gerçekten çalışıyor mu?${RESET}\n`);

  try {
    // feed_lock kontrolü
    const lockDoc = await db.collection('system_state').doc('feed_lock_trtex').get();
    if (lockDoc.exists) {
      const lock = lockDoc.data();
      console.log(`  Son cron çalışması : ${BOLD}${ago(lock.last_run)}${RESET} (${lock.last_run || 'N/A'})`);
      console.log(`  Durum              : ${lock.status || 'bilinmiyor'}`);
      console.log(`  Süre               : ${lock.duration_ms ? lock.duration_ms + 'ms' : 'N/A'}`);
      console.log(`  Hata sayısı        : ${lock.error_count || 0}`);
      report.chain1_signalCollector = lock.last_run ? ago(lock.last_run) : 'HİÇ ÇALIŞMADI';
      
      const lockAge = Date.now() - new Date(lock.last_run).getTime();
      console.log(`  ${verdict(lockAge < 24 * 3600 * 1000, lockAge < 24 * 3600 * 1000 ? 'Son 24 saatte çalışmış' : 'SON 24 SAATTE ÇALIŞMADI!')}`);
    } else {
      console.log(`  ${RED}❌ feed_lock_trtex DOCUMENT YOK — Cron HİÇ tetiklenmemiş olabilir!${RESET}`);
      report.chain1_signalCollector = 'DOCUMENT YOK';
    }
  } catch (e) {
    console.log(`  ${RED}❌ HATA: ${e.message}${RESET}`);
  }

  // aloha_cycles son kayıt
  try {
    const cyclesSnap = await db.collection('aloha_cycles')
      .orderBy('timestamp', 'desc')
      .limit(3)
      .get();
    
    if (!cyclesSnap.empty) {
      console.log(`\n  Son 3 Aloha Döngüsü:`);
      cyclesSnap.forEach((doc, i) => {
        const c = doc.data();
        const ts = c.timestamp || c.startTime;
        console.log(`    ${i+1}. ${ago(ts)} | Proje: ${c.project || '?'} | Aksiyonlar: ${(c.actionsPerformed || []).length} | Hatalar: ${(c.errors || []).length}`);
        if (c.actionsPerformed?.length > 0) {
          console.log(`       → ${c.actionsPerformed.slice(0, 5).join(', ')}`);
        }
        if (c.errors?.length > 0) {
          console.log(`       ${RED}→ HATA: ${c.errors[0].substring(0, 120)}${RESET}`);
        }
      });
    } else {
      console.log(`\n  ${RED}❌ aloha_cycles koleksiyonu BOŞ — Otonom döngü HİÇ çalışmamış!${RESET}`);
    }
  } catch (e) {
    console.log(`  ${YELLOW}⚠ aloha_cycles okunamadı: ${e.message}${RESET}`);
  }

  // aloha_metrics son kayıt
  try {
    const metricsSnap = await db.collection('aloha_metrics')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();
    
    if (!metricsSnap.empty) {
      console.log(`\n  Son 5 Metrik Kaydı:`);
      let successCount = 0;
      metricsSnap.forEach((doc) => {
        const m = doc.data();
        const status = m.success ? `${GREEN}OK${RESET}` : `${RED}FAIL${RESET}`;
        console.log(`    ${ago(m.created_at)} | ${status} | Proje: ${m.project} | ${m.actions || 0} aksiyon | ${m.duration_ms || '?'}ms`);
        if (m.top_error) console.log(`      ${RED}→ ${m.top_error.substring(0, 100)}${RESET}`);
        if (m.success) successCount++;
      });
      console.log(`\n  Başarı oranı (son 5): ${successCount}/5 = %${(successCount/5*100).toFixed(0)}`);
    }
  } catch (e) {
    console.log(`  ${YELLOW}⚠ aloha_metrics okunamadı: ${e.message}${RESET}`);
  }

  // ═══════════════════════════════════════
  // HALKA 2: FIRESTORE WRITE — Gerçekten veri yazılıyor mu?
  // ═══════════════════════════════════════
  console.log(`\n${BOLD}${YELLOW}▼ HALKA 2: FIRESTORE WRITE — Haber Üretimi${RESET}`);
  console.log(`${DIM}  Soru: Aloha Firestore'a gerçekten haber yazıyor mu?${RESET}\n`);

  try {
    // Son 10 haberi çek
    let newsSnap;
    try {
      newsSnap = await db.collection('trtex_news')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    } catch {
      newsSnap = await db.collection('trtex_news')
        .orderBy('created_at', 'desc')
        .limit(10)
        .get();
    }

    if (newsSnap.empty) {
      console.log(`  ${RED}❌ trtex_news koleksiyonu TAMAMEN BOŞ!${RESET}`);
      report.chain2_firestoreWrite = 'BOŞ';
    } else {
      console.log(`  Toplam kayıt: En az ${newsSnap.size} (limitli sorgu)\n`);
      
      let hasImage = 0, hasContent = 0, hasTranslation = 0;
      let newestDate = null;
      let oldestDate = null;
      
      newsSnap.forEach((doc) => {
        const d = doc.data();
        const date = d.createdAt || d.created_at || d.publishedAt;
        const title = d.translations?.TR?.title || d.title || d.slug || '(başlık yok)';
        const imgCount = (d.images || []).length + (d.image_url ? 1 : 0);
        const contentLen = (d.content || d.body || '').length;
        const langCount = d.translations ? Object.keys(d.translations).length : 0;

        if (!newestDate || new Date(date) > new Date(newestDate)) newestDate = date;
        if (!oldestDate || new Date(date) < new Date(oldestDate)) oldestDate = date;
        if (imgCount > 0) hasImage++;
        if (contentLen > 100) hasContent++;
        if (langCount > 0) hasTranslation++;

        const imgStatus = imgCount > 0 ? `${GREEN}${imgCount} görsel${RESET}` : `${RED}GÖRSELSİZ${RESET}`;
        const contentStatus = contentLen > 100 ? `${GREEN}${contentLen} char${RESET}` : `${RED}İÇERİK YOK/KISA${RESET}`;
        
        console.log(`  ${DIM}${ago(date)}${RESET} | ${imgStatus} | ${contentStatus} | ${langCount} dil | ${title.substring(0, 55)}`);
      });

      console.log(`\n  En yeni haber  : ${BOLD}${ago(newestDate)}${RESET} (${newestDate})`);
      console.log(`  En eski (10'dan): ${ago(oldestDate)}`);
      console.log(`  Görselli       : ${hasImage}/${newsSnap.size}`);
      console.log(`  İçerikli       : ${hasContent}/${newsSnap.size}`);
      console.log(`  Çeviri sahibi  : ${hasTranslation}/${newsSnap.size}`);
      
      const newestAge = Date.now() - new Date(newestDate).getTime();
      const isRecent = newestAge < 24 * 3600 * 1000;
      console.log(`  ${verdict(isRecent, isRecent ? 'SON 24 SAATTE HABER ÜRETİLMİŞ' : 'SON 24 SAATTE HABER YOK — ÜRETİM DURMUŞ!')}`);
      report.chain2_firestoreWrite = isRecent ? `Güncel (${ago(newestDate)})` : `BAYAT (${ago(newestDate)})`;
    }
  } catch (e) {
    console.log(`  ${RED}❌ HATA: ${e.message}${RESET}`);
    report.chain2_firestoreWrite = `HATA: ${e.message}`;
  }

  // Bugün kaç haber?
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    let todaySnap;
    try {
      todaySnap = await db.collection('trtex_news').where('createdAt', '>=', todayStart.toISOString()).get();
    } catch {
      todaySnap = await db.collection('trtex_news').where('created_at', '>=', todayStart.toISOString()).get();
    }
    console.log(`  Bugün üretilen haber: ${BOLD}${todaySnap.size}${RESET} (hedef: 5/gün)`);
  } catch (e) {
    console.log(`  ${YELLOW}⚠ Bugünkü haber sayısı alınamadı: ${e.message}${RESET}`);
  }

  // ═══════════════════════════════════════
  // HALKA 3: INTELLIGENCE DASHBOARD — API verisi dolumu?
  // ═══════════════════════════════════════
  console.log(`\n${BOLD}${YELLOW}▼ HALKA 3: INTELLIGENCE DATA — Dashboard/Ticker/Brain${RESET}`);
  console.log(`${DIM}  Soru: API'nin döneceği istihbarat verisi Firestore'da var mı?${RESET}\n`);

  // live_dashboard
  try {
    const dashDoc = await db.collection('trtex_intelligence').doc('live_dashboard').get();
    if (dashDoc.exists) {
      const d = dashDoc.data();
      console.log(`  live_dashboard  : ${GREEN}VAR${RESET}`);
      console.log(`    hero_opportunity: ${d.hero_opportunity ? GREEN + 'DOLU' + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    market          : ${d.market ? GREEN + JSON.stringify(Object.keys(d.market)) + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    trade_opps      : ${d.trade_opportunities?.length || 0} adet`);
    } else {
      console.log(`  live_dashboard  : ${RED}YOK — Dashboard verisi hiç yazılmamış!${RESET}`);
    }
  } catch (e) {
    console.log(`  ${RED}❌ live_dashboard HATA: ${e.message}${RESET}`);
  }

  // homepage_brain
  try {
    const brainDoc = await db.collection('trtex_intelligence').doc('homepage_brain').get();
    if (brainDoc.exists) {
      const b = brainDoc.data();
      console.log(`  homepage_brain  : ${GREEN}VAR${RESET}`);
      console.log(`    updatedAt       : ${ago(b.updatedAt)} (${b.updatedAt || 'N/A'})`);
      console.log(`    dailyInsight    : ${b.dailyInsight ? GREEN + 'DOLU' + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    opportunities   : ${b.opportunities?.length || 0} adet`);
      console.log(`    sectorPulse     : ${b.sectorPulse ? GREEN + 'DOLU' + RESET : RED + 'BOŞ' + RESET}`);
      const brainAge = Date.now() - new Date(b.updatedAt).getTime();
      console.log(`    ${verdict(brainAge < 12 * 3600 * 1000, brainAge < 12 * 3600 * 1000 ? 'Brain GÜNCEL' : 'Brain BAYAT (>12 saat)')}`);
    } else {
      console.log(`  homepage_brain  : ${RED}YOK — Ana sayfa beyni hiç oluşturulmamış!${RESET}`);
    }
  } catch (e) {
    console.log(`  ${RED}❌ homepage_brain HATA: ${e.message}${RESET}`);
  }

  // ticker_live
  try {
    const tickerDoc = await db.collection('trtex_intelligence').doc('ticker_live').get();
    if (tickerDoc.exists) {
      const t = tickerDoc.data();
      console.log(`  ticker_live     : ${GREEN}VAR${RESET}`);
      console.log(`    forex           : ${t.forex ? GREEN + JSON.stringify(Object.keys(t.forex)) + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    commodities     : ${t.commodities ? GREEN + JSON.stringify(Object.keys(t.commodities)) + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    logistics       : ${t.logistics ? GREEN + JSON.stringify(Object.keys(t.logistics)) + RESET : RED + 'BOŞ' + RESET}`);
      console.log(`    updatedAt       : ${ago(t.updatedAt)} (${t.updatedAt || 'N/A'})`);
    } else {
      console.log(`  ticker_live     : ${RED}YOK — Ticker canlı verisi hiç yazılmamış!${RESET}`);
    }
  } catch (e) {
    console.log(`  ${RED}❌ ticker_live HATA: ${e.message}${RESET}`);
  }

  // daily_insight
  try {
    const insightDoc = await db.collection('trtex_intelligence').doc('daily_insight').get();
    if (insightDoc.exists) {
      const ins = insightDoc.data();
      console.log(`  daily_insight   : ${GREEN}VAR${RESET}`);
      console.log(`    headline        : ${(ins.headline || '').substring(0, 60)}`);
      console.log(`    updatedAt       : ${ago(ins.updatedAt || ins.date)}`);
    } else {
      console.log(`  daily_insight   : ${RED}YOK${RESET}`);
    }
  } catch (e) {
    console.log(`  ${YELLOW}⚠ daily_insight: ${e.message}${RESET}`);
  }

  // trtex_signals (site-brain fallback kaynak)
  try {
    const sigDoc = await db.collection('trtex_signals').doc('live_feed').get();
    if (sigDoc.exists) {
      const s = sigDoc.data();
      console.log(`  trtex_signals   : ${GREEN}VAR${RESET}`);
      console.log(`    last_updated    : ${ago(s.last_updated)} (${s.last_updated ? new Date(s.last_updated).toISOString() : 'N/A'})`);
      console.log(`    USD/TRY         : ${s.USD_TRY || 'N/A'}`);
      console.log(`    Cotton          : ${s.COTTON_INDEX || 'N/A'}`);
      console.log(`    Freight         : ${s.FREIGHT_INDEX || 'N/A'}`);
    } else {
      console.log(`  trtex_signals   : ${RED}YOK${RESET}`);
    }
  } catch (e) {
    console.log(`  ${YELLOW}⚠ trtex_signals: ${e.message}${RESET}`);
  }

  // ═══════════════════════════════════════
  // HALKA 4: IMAGE PIPELINE
  // ═══════════════════════════════════════
  console.log(`\n${BOLD}${YELLOW}▼ HALKA 4: IMAGE PIPELINE${RESET}`);
  console.log(`${DIM}  Soru: Görseller üretiliyor mu? Kuyruk tıkalı mı?${RESET}\n`);

  try {
    const queueSnap = await db.collection('trtex_image_queue').get();
    let pending = 0, processing = 0, done = 0, failed = 0;
    queueSnap.forEach(doc => {
      const s = doc.data().status;
      if (s === 'pending') pending++;
      else if (s === 'processing') processing++;
      else if (s === 'done' || s === 'completed') done++;
      else if (s?.includes('fail')) failed++;
    });
    console.log(`  Kuyruk Toplam   : ${queueSnap.size}`);
    console.log(`  Bekleyen        : ${pending > 0 ? YELLOW + pending + RESET : GREEN + '0' + RESET}`);
    console.log(`  İşleniyor       : ${processing > 0 ? CYAN + processing + RESET : '0'}`);
    console.log(`  Tamamlanan      : ${GREEN}${done}${RESET}`);
    console.log(`  Başarısız       : ${failed > 0 ? RED + failed + RESET : GREEN + '0' + RESET}`);
    console.log(`  ${verdict(pending < 10 && failed === 0, pending < 10 && failed === 0 ? 'Kuyruk sağlıklı' : 'KUYRUK TIKALI veya HATALI!')}`);
  } catch (e) {
    console.log(`  ${YELLOW}⚠ Image queue okunamadı: ${e.message}${RESET}`);
  }

  // Son 10 haberde görsel durumu
  try {
    let imgCheckSnap;
    try {
      imgCheckSnap = await db.collection('trtex_news').orderBy('createdAt', 'desc').limit(20).get();
    } catch {
      imgCheckSnap = await db.collection('trtex_news').orderBy('created_at', 'desc').limit(20).get();
    }
    let withImg = 0, withoutImg = 0, placeholderImg = 0;
    imgCheckSnap.forEach(doc => {
      const d = doc.data();
      const imgs = d.images || [];
      const mainImg = d.image_url || d.imageUrl || '';
      if (imgs.length > 0 || mainImg) {
        if (mainImg.includes('placeholder') || mainImg.includes('unsplash') || mainImg.includes('picsum')) {
          placeholderImg++;
        } else {
          withImg++;
        }
      } else {
        withoutImg++;
      }
    });
    console.log(`\n  Son 20 haberde görsel durumu:`);
    console.log(`    Gerçek AI görsel : ${GREEN}${withImg}${RESET}`);
    console.log(`    Placeholder      : ${placeholderImg > 0 ? YELLOW + placeholderImg + RESET : '0'}`);
    console.log(`    Görselsiz        : ${withoutImg > 0 ? RED + withoutImg + RESET : GREEN + '0' + RESET}`);
  } catch (e) {
    console.log(`  ${YELLOW}⚠ Görsel analizi yapılamadı: ${e.message}${RESET}`);
  }

  // ═══════════════════════════════════════
  // HALKA 5: CRON SCHEDULER DURUMU
  // ═══════════════════════════════════════
  console.log(`\n${BOLD}${YELLOW}▼ HALKA 5: CRON SCHEDULER / CLOUD SCHEDULER${RESET}`);
  console.log(`${DIM}  Soru: Cron gerçekten tetikleniyor mu?${RESET}\n`);

  try {
    const cronLogs = await db.collection('cron_execution_log')
      .orderBy('executed_at', 'desc')
      .limit(5)
      .get();
    
    if (!cronLogs.empty) {
      console.log(`  Son 5 cron çalışması:`);
      cronLogs.forEach(doc => {
        const c = doc.data();
        console.log(`    ${ago(c.executed_at)} | ${c.endpoint || c.job || '?'} | ${c.status || '?'} | ${c.duration_ms || '?'}ms`);
      });
    } else {
      console.log(`  ${RED}❌ cron_execution_log BOŞ — Cron loglanmıyor veya hiç çalışmamış!${RESET}`);
    }
  } catch (e) {
    // Koleksiyon yoksa daha genel arama
    console.log(`  ${YELLOW}⚠ cron_execution_log koleksiyonu yok: ${e.message}${RESET}`);
  }

  // system_state genel kontrol
  try {
    const statesSnap = await db.collection('system_state').get();
    if (!statesSnap.empty) {
      console.log(`\n  system_state koleksiyonu (${statesSnap.size} kayıt):`);
      statesSnap.forEach(doc => {
        const d = doc.data();
        const ts = d.last_run || d.timestamp || d.updated_at;
        console.log(`    ${doc.id}: ${ts ? ago(ts) : 'tarih yok'} ${d.status ? '| ' + d.status : ''}`);
      });
    }
  } catch (e) {
    console.log(`  ${YELLOW}⚠ system_state okunamadı${RESET}`);
  }

  // ═══════════════════════════════════════
  // SONUÇ: ZİNCİR KIRILMA NOKTASI
  // ═══════════════════════════════════════
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  SONUÇ: ZİNCİR ANALİZİ${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}\n`);
  
  console.log(`  HALKA 1 (Cron/AutoRunner)   : ${report.chain1_signalCollector}`);
  console.log(`  HALKA 2 (Firestore Write)   : ${report.chain2_firestoreWrite}`);
  console.log(`  HALKA 3 (Dashboard/Ticker)  : Yukarıdaki detaylara bak`);
  console.log(`  HALKA 4 (Image Pipeline)    : Yukarıdaki detaylara bak`);
  
  console.log(`\n${BOLD}  Pipeline: SignalCollector → Firestore → API → UI${RESET}`);
  console.log(`${DIM}  Kırık halka = tüm sistem "ölü" görünür.${RESET}\n`);
}

runForensics()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(`\n${RED}KRİTİK HATA: ${err.message}${RESET}`);
    console.error(err.stack);
    process.exit(1);
  });

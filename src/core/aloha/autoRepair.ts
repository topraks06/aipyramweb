/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  ALOHA AUTO REPAIR — Otonom Site Onarım Motoru            ║
 * ║  deepAudit raporunu alır → batch onarım uygular           ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';
import { processMultipleImages, getImageCount } from './imageAgent';
import { slugify } from '@/core/utils/slugify';
import type { RepairAction, AuditReport } from './deepAudit';

const MANDATORY_KW: Record<string, string[]> = {
  trtex: ['perde', 'ev tekstili', 'dekorasyon'],
  hometex: ['home textile', 'curtain', 'decoration'],
  perde: ['perde', 'tül', 'tasarım'],
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export interface RepairResult {
  total: number;
  fixed: number;
  skipped: number;
  errors: number;
  details: { articleId: string; action: string; status: 'fixed' | 'skipped' | 'error'; detail: string }[];
}

export async function autoRepair(
  project: string,
  repairPlan: RepairAction[],
  dryRun: boolean = true,
  maxActions: number = 5
): Promise<RepairResult> {
  const result: RepairResult = { total: repairPlan.length, fixed: 0, skipped: 0, errors: 0, details: [] };
  const collection = `${project}_news`;
  const mandatory = MANDATORY_KW[project] || ['ev tekstili', 'dekorasyon'];
  
  console.log(`\n[REPAIR] 🔧 ${project.toUpperCase()} Auto Repair ${dryRun ? '(KURU ÇALIŞTIRMA)' : '(GERÇEK ONARIM)'}`);
  console.log(`[REPAIR] 📋 ${repairPlan.length} aksiyon planlandı, max ${maxActions} işlenecek\n`);

  const actions = repairPlan.slice(0, maxActions);

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    console.log(`[REPAIR] [${i + 1}/${actions.length}] ${action.action} → "${action.title.substring(0, 50)}..." (P${action.priority})`);

    if (dryRun) {
      result.details.push({ articleId: action.articleId, action: action.action, status: 'skipped', detail: 'Kuru çalıştırma — gerçek işlem yapılmadı' });
      result.skipped++;
      continue;
    }

    try {
      switch (action.action) {
        case 'add_keywords': {
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          const existing = data.seo?.keywords || data.seo_keywords || [];
          const titleWords = (action.title || '').split(/\s+/)
            .filter(w => w.length > 3)
            .slice(0, 5)
            .map(w => w.toLowerCase().replace(/[^a-züçşğöıa-z]/g, ''));
          
          const newKw = [...new Set([
            ...mandatory,
            ...existing.map((k: string) => k.toLowerCase()),
            ...titleWords,
            'türk tekstil', 'ev tekstili ihracat'
          ])].filter(k => k.length > 2).slice(0, 15);
          
          await docRef.update({ 'seo.keywords': newKw, seo_keywords: newKw });
          result.fixed++;
          result.details.push({ articleId: action.articleId, action: 'add_keywords', status: 'fixed', detail: `${newKw.length} keyword yazıldı` });
          break;
        }

        case 'fill_content': {
          const gemini = alohaAI.getClient();
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          const title = data.translations?.TR?.title || data.title || action.title;
          const summary = data.translations?.TR?.summary || data.summary || '';
          
          const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Sen profesyonel bir ev tekstili sektör gazetecisisin.

BAŞLIK: ${title}
ÖZET: ${summary}

KURALLAR:
- Minimum 1000 karakter
- HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote>
- Her <h2> ve <h3> başlıktan sonra boşluk: <br/> ekle
- Görseller satır aralarına konulacak — onlar için paragraflar arasında <br/><br/> boşluk bırak
- E-E-A-T: veri, kaynak, uzman görüşü
- Profesyonel B2B tonu

JSON döndür:
{
  "content": "HTML içerik (min 1000 chr)",
  "ai_commentary": "📊 AI analiz (2-3 cümle)",
  "business_opportunities": ["fırsat1", "fırsat2", "fırsat3"],
  "seo_keywords": ["perde", "ev tekstili", "dekorasyon", + 7 konu bazlı keyword]
}`,
            config: { responseMimeType: 'application/json', temperature: 0.7 }
          });
          
          if (!response.text) throw new Error('AI yanıt vermedi');
          const article = JSON.parse(response.text);
          
          const keywords = [...new Set([...mandatory, ...(article.seo_keywords || [])])].slice(0, 15);
          
          await docRef.update({
            content: article.content,
            'translations.TR.content': article.content,
            ai_commentary: article.ai_commentary || '',
            business_opportunities: article.business_opportunities || [],
            'seo.keywords': keywords,
            seo_keywords: keywords,
            qualityScore: 85,
          });
          
          result.fixed++;
          result.details.push({ articleId: action.articleId, action: 'fill_content', status: 'fixed', detail: `${article.content.length} chr yazıldı` });
          await sleep(2000);
          break;
        }

        case 'replace_image': {
          // Aloha API üzerinden görsel güncelle
          try {
            const res = await fetch('http://localhost:3000/api/aloha/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: `update_article_image aracini kullan. slug: "${action.articleId}", project: "${project}". Haber basligi: "${action.title}". Konuya uygun dekorasyon goerseli uret.`
              }),
              signal: AbortSignal.timeout(120000)
            });
            if (res.ok) {
              result.fixed++;
              result.details.push({ articleId: action.articleId, action: 'replace_image', status: 'fixed', detail: 'AI görsel üretildi' });
            }
          } catch (e: any) {
            result.errors++;
            result.details.push({ articleId: action.articleId, action: 'replace_image', status: 'error', detail: e.message });
          }
          await sleep(5000);
          break;
        }

        case 'targeted_terminal_fix': {
          try {
             const { alohaMemory } = await import('../aloha/memory');
             // 1. Öğrenen Hafızaya Kaydet
             const memInfo = { content: `TRTEX FAIL: ${action.reason}`, project: 'trtex', context: 'deepAudit' };
             const memResult = await alohaMemory.analyzeAndStore(memInfo);
             
             // 🔥 TIME PRESSURE & ESCALATION (DEADLINE CHECK)
             // Check if an existing deadline in memory was broken
             const existingFails = await alohaMemory.getRecentMemory(5);
             const brokenDeadline = existingFails.some(m => 
                 m.action.includes('DEADLINE_SET') && 
                 (Date.now() - m.timestamp) > 10 * 60 * 1000 // 10 minutes passed
             );
             
             // 2. Acil Durum / Hard Lock Kontrolü
             const recentStrikes = existingFails.filter(m => m.action === 'TRTEX_STRIKE').length;
             const isRepeated = memResult.reason.includes('tekrar');
             
             // Count total failures.
             const failCount = recentStrikes + (isRepeated ? 1 : 0) + (brokenDeadline ? 1 : 0);
             
             console.log(`\n======================================================`);
             console.log(`[ALOHA MASTER] 🚨 TRTEX TERMINAL DEGRADED`);
             console.log(`[ALOHA] FAIL REPORT:`);
             console.log(` - ${action.reason.split(' | ').join('\n - ')}`);
             console.log(`[ALOHA] ACTION: -> ${action.targetCommand || 'Rebuild Terminal'}`);
             console.log(`[ALOHA] ESCALATION LEVEL: Fail Count ${failCount}/3`);
             console.log(`[ALOHA] DEADLINE: 10 Dakika. Re-triggering Sovereign Agent via Shadow Copy...`);
             console.log(`======================================================\n`);
             
             if (failCount >= 3) {
                 // Hard Lock (Terminali DEGRADED mode'a sokup safe-mode bırakıyoruz, otonom çöpleri kilitliyoruz)
                 await adminDb.collection("trtex_terminal").doc("current").update({ status: 'DEGRADED_LOCKED_SAFE_MODE' });
                 console.log("[ALOHA MASTER] ⚠️ MAX FAIL (3/3) TESPİT EDİLDİ - SAFE MODE AKTİF, SİSTEM KİLİTLENDİ!");
                 result.errors++;
                 result.details.push({ articleId: action.articleId, action: 'targeted_terminal_fix', status: 'error', detail: 'SAFE MODE LOCKED (Deadline Missed / Repeated Fail)' });
             } else {
                 if (failCount > 0) {
                     console.log("[ALOHA MASTER] 🔄 RETRY SOFT FIX Tetiklendi. Şansınız azalıyor...");
                     await alohaMemory.addMemory('assistant', 'TRTEX_STRIKE', `Fix Başarısız. Strike: ${failCount}`);
                 } else {
                     await alohaMemory.addMemory('assistant', 'DEADLINE_SET', `10dk süre verildi. Neden: ${action.reason}`);
                 }
                 
                 const { TrtexLeadAgent } = await import('./trtex/trtex-lead-agent');
                 const agent = new TrtexLeadAgent();
                 await agent.runCycle({ targetedCommand: action.targetCommand });
                 result.fixed++;
                 result.details.push({ articleId: action.articleId, action: 'targeted_terminal_fix', status: 'fixed', detail: 'Targeted Fix executed securely.' });
             }
          } catch(e: any) {
             result.errors++;
             result.details.push({ articleId: action.articleId, action: 'targeted_terminal_fix', status: 'error', detail: e.message });
          }
          await sleep(5000);
          break;
        }

        case 'add_images': {
          // Ek görsel ekle (mevcut görsele ek olarak)
          try {
            const docRef = adminDb.collection(collection).doc(action.articleId);
            const doc = await docRef.get();
            if (!doc.exists) { result.skipped++; continue; }
            
            const data = doc.data()!;
            const existingMedia = data.media?.images || [];
            const title = data.translations?.TR?.title || data.title || action.title;
            const content = data.translations?.TR?.content || data.content || '';
            const category = data.category || 'İstihbarat';
            
            const needed = Math.max(2, getImageCount(content)) - existingMedia.length;
            if (needed <= 0) { result.skipped++; continue; }
            
            const newImages = await processMultipleImages(category, title, content, needed);
            const updatedMedia = [
              ...existingMedia,
              ...newImages.map((url: string, i: number) => ({
                url,
                caption: `${title} — Görsel ${existingMedia.length + i + 1}`,
                alt_text: `${category} ${title} ev tekstili perde dekorasyon görsel ${existingMedia.length + i + 1}`,
                order: existingMedia.length + i,
              }))
            ];
            
            await docRef.update({ 'media.images': updatedMedia });
            result.fixed++;
            result.details.push({ articleId: action.articleId, action: 'add_images', status: 'fixed', detail: `${needed} ek görsel eklendi` });
          } catch (e: any) {
            result.errors++;
            result.details.push({ articleId: action.articleId, action: 'add_images', status: 'error', detail: e.message });
          }
          await sleep(3000);
          break;
        }

        case 'fix_formatting': {
          const key = true; // aiClient merkezi yonetim
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          let content = data.translations?.TR?.content || data.content || '';
          const title = data.translations?.TR?.title || data.title || action.title;
          
          if (content.length > 200) {
            // AI ILE AUTHORITY SITE YAPISINA DONUSTUR
            try {
              const gemini = alohaAI.getClient();
              const restructureRes = await gemini.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Aşağıdaki haber içeriğini AUTHORITY SITE standardına yükselt.
Mevcut içeriğin ANLAMINI KORU ama yapısını iyileştir.

BAŞLIK: ${title}

MEVCUT İÇERİK:
${content.substring(0, 3000)}

ZORUNLU YAPISAL İYİLEŞTİRMELER:
1. EN AZ 3 adet <h2> alt başlık ekle (konuya uygun, keyword içeren)
2. EN AZ 2 adet <h3> alt-alt başlık ekle
3. EN AZ 1 adet <table> ekle (sektör verisi, karşılaştırma tablosu)
4. EN AZ 1 adet <blockquote> ekle (uzman görüşü veya analiz notu)
5. EN AZ 1 adet <ul> veya <ol> liste ekle
6. Paragrafları max 3-4 cümle yap
7. Mevcut içeriğin anlamını ve verilerini KORU — sadece yapıyı düzelt

JSON döndür:
{"content": "HTML formatında yeniden yapılandırılmış içerik"}`,
                config: { responseMimeType: 'application/json', temperature: 0.5 }
              });
              
              if (restructureRes.text) {
                const parsed = JSON.parse(restructureRes.text);
                if (parsed.content && parsed.content.length > content.length * 0.7) {
                  content = parsed.content;
                }
              }
            } catch (e: any) {
              console.warn(`[REPAIR] AI restructure hatası: ${e.message} — basit düzeltme uygulanıyor`);
              // Fallback: basit h2 ekleme
              if (!content.includes('<h2') && content.length > 300) {
                const parts = content.split('</p>');
                if (parts.length >= 3) {
                  parts.splice(1, 0, '<h2>Sektörel Analiz</h2>');
                  if (parts.length >= 5) parts.splice(3, 0, '<h2>Pazar Etkisi ve Değerlendirme</h2>');
                  if (parts.length >= 7) parts.splice(5, 0, '<h3>Stratejik Öneriler</h3>');
                  content = parts.join('</p>');
                }
              }
            }
          } else if (!content.includes('<h2') && content.length > 300) {
            // Icerik kisa — basit duzeltme
            const parts = content.split('</p>');
            if (parts.length >= 3) {
              parts.splice(1, 0, '<h2>Sektörel Analiz</h2>');
              if (parts.length >= 5) parts.splice(3, 0, '<h2>Pazar Etkisi ve Değerlendirme</h2>');
              content = parts.join('</p>');
            }
          }
          
          // Görsel önce/sonra boşluk
          content = content.replace(/(<img alt="AIPyram Görsel"[^>]*>)/g, '<br/><br/>$1<br/><br/>');
          content = content.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>');
          
          await docRef.update({
            content,
            'translations.TR.content': content,
          });
          result.fixed++;
          result.details.push({ articleId: action.articleId, action: 'fix_formatting', status: 'fixed', detail: `HTML authority yapısına dönüştürüldü` });
          await sleep(2000);
          break;
        }

        case 'add_ai_commentary': {
          const gemini = alohaAI.getClient();
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          const title = data.translations?.TR?.title || data.title || '';
          
          const res = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `"${title}" hakkında kısa bir AI analiz yorumu yaz (2-3 cümle, 📊 ile başla). Ayrıca 3 somut iş fırsatı listele. JSON döndür: {"ai_commentary": "...", "business_opportunities": ["...", "...", "..."]}`,
            config: { responseMimeType: 'application/json', temperature: 0.7 }
          });
          
          if (res.text) {
            const parsed = JSON.parse(res.text);
            await docRef.update({
              ai_commentary: parsed.ai_commentary || '',
              business_opportunities: parsed.business_opportunities || [],
            });
            result.fixed++;
            result.details.push({ articleId: action.articleId, action: 'add_ai_commentary', status: 'fixed', detail: 'AI yorum eklendi' });
          }
          await sleep(1500);
          break;
        }

        case 'fix_alt_text': {
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          const title = data.translations?.TR?.title || data.title || '';
          const category = data.category || 'ev tekstili';
          const media = data.media?.images || [];
          
          const updated = media.map((m: any, i: number) => ({
            ...m,
            alt_text: m.alt_text && m.alt_text.length > 10 
              ? m.alt_text 
              : `${title} - ${category} perde ev tekstili dekorasyon görsel ${i + 1}`,
            caption: m.caption && m.caption.length > 5
              ? m.caption
              : `${title} — ${i + 1}`,
          }));
          
          await docRef.update({ 'media.images': updated });
          result.fixed++;
          result.details.push({ articleId: action.articleId, action: 'fix_alt_text', status: 'fixed', detail: `${updated.length} görsel alt text düzeltildi` });
          break;
        }

        case 'fix_slug': {
          const docRef = adminDb.collection(collection).doc(action.articleId);
          const doc = await docRef.get();
          if (!doc.exists) { result.skipped++; continue; }
          
          const data = doc.data()!;
          const title = data.translations?.TR?.title || data.title || action.title || '';
          const properSlug = slugify(title);
          
          if (properSlug) {
            await docRef.update({ slug: properSlug });
            result.fixed++;
            result.details.push({ articleId: action.articleId, action: 'fix_slug', status: 'fixed', detail: `Slug düzeltildi: "${data.slug || 'BOŞ'}" → "${properSlug}"` });
            console.log(`[REPAIR] 🔗 Slug fix: "${data.slug}" → "${properSlug}"`);
          } else {
            result.skipped++;
          }
          break;
        }

        default:
          result.skipped++;
          result.details.push({ articleId: action.articleId, action: action.action, status: 'skipped', detail: 'Bilinmeyen aksiyon' });
      }
    } catch (e: any) {
      result.errors++;
      result.details.push({ articleId: action.articleId, action: action.action, status: 'error', detail: e.message });
      console.error(`[REPAIR] ❌ ${action.action} hatası: ${e.message}`);
    }
  }

  console.log(`\n[REPAIR] ═══════════════════════════════════════`);
  console.log(`[REPAIR] ✅ Düzeltilen: ${result.fixed}`);
  console.log(`[REPAIR] ⏭️ Atlanan: ${result.skipped}`);
  console.log(`[REPAIR] ❌ Hata: ${result.errors}`);
  console.log(`[REPAIR] ═══════════════════════════════════════\n`);

  return result;
}

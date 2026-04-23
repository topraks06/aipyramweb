import { Schema, Type } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';
import { adminDb } from '@/lib/firebase-admin';
import { processMultipleImages } from '../imageAgent';

// Veriler bizzat Merkezi Kasa'da (Sovereign Node - Firebase Native) tutuluyor.
const MEMORY_DIR = path.resolve(process.cwd(), 'data/sovereign');

if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

/**
 * Haber başlığından otomatik kategori tespiti.
 * Frontend'in related articles query'si bu kategorilere göre çalışıyor.
 */
function detectCategory(title: string): string {
    const t = (title || '').toLowerCase();
    if (t.includes('iplik') || t.includes('elyaf') || t.includes('hammadde') || t.includes('pamuk')) return 'HAMMADDE (İPLİK)';
    if (t.includes('perde') || t.includes('fon perde') || t.includes('tül')) return 'PERDE';
    if (t.includes('döşeme') || t.includes('koltuk') || t.includes('mobilya')) return 'DÖŞEMELİK';
    if (t.includes('havlu') || t.includes('bornoz') || t.includes('nevresim') || t.includes('yatak')) return 'EV TEKSTİLİ';
    if (t.includes('lojistik') || t.includes('navlun') || t.includes('liman') || t.includes('gümrük') || t.includes('kargo')) return 'GÜMRÜK & LOJİSTİK';
    if (t.includes('ihale') || t.includes('ihracat') || t.includes('ticaret') || t.includes('anlaşma') || t.includes('sözleşme')) return 'İHALE FIRSATI';
    if (t.includes('dijital') || t.includes('teknoloji') || t.includes('ar-ge') || t.includes('inovasyon') || t.includes('akıllı')) return 'YENİ TEKNOLOJİ';
    if (t.includes('tasarım') || t.includes('mimari') || t.includes('dekorasyon') || t.includes('trend') || t.includes('renk')) return 'MİMARİ & TREND';
    if (t.includes('fiyat') || t.includes('maliyet') || t.includes('piyasa') || t.includes('borsa')) return 'İSTİHBARAT';
    return 'İSTİHBARAT';
}

export async function saveToGoogleNativeMemory(collection: string, payload: any) {
    const filePath = path.join(MEMORY_DIR, `${collection}.json`);
    
    let currentData: any[] = [];
    if (fs.existsSync(filePath)) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            currentData = JSON.parse(raw);
            if (!Array.isArray(currentData)) currentData = [currentData];
        } catch(e) {
            currentData = []; // Veri bozuksa sıfırla
        }
    }
    
    // Güvenli Otonom Düğüm Oluşumu
    const memoryNode = {
        _id: crypto.randomUUID(),
        _timestamp: new Date().toISOString(),
        ...payload
    };
    
    // En yeni veri her zaman en üstte
    currentData.unshift(memoryNode);
    
    // Yığılma engeli: Son 50 işlemi tut, önbelleği hafif tut
    if (currentData.length > 50) currentData = currentData.slice(0, 50);
    
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
    console.log(`🧠 [Sovereign Brain] Merkezi zekaya veri mühürlendi / Koleksiyon: ${collection}.json`);

    // ═══ FIRESTORE KÖPRÜSÜ (V1.1 — Swarm → Pipeline Bağlantısı) ═══
    // Swarm çıktısını terminalPayloadBuilder'ın okuyacağı trtex_news'e de yaz.
    // Böylece 4 kanallı zeka (insight, action_layer, visual_intent) otomatik UI'ye akar.
    if (adminDb) {
        const firestoreWrite = async () => {
            try {
                const tr = memoryNode.intelligence?.translations?.TR;
                if (!tr?.title) return; // Başlıksız haber yazma

                const slug = (tr.title || '')
                    .toLowerCase()
                    .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .substring(0, 80) + '-' + Date.now().toString(36);

                let mappedStatus = 'published';
                if (collection === 'watchlist') mappedStatus = 'draft';
                if (collection === 'quarantine') mappedStatus = 'quarantine';
                if (collection === 'duplicate') mappedStatus = 'duplicate';

                const firestoreDoc: any = {
                    title: tr.title,
                    summary: tr.summary || '',
                    content: tr.content || '',
                    category: detectCategory(tr.title),
                    slug,
                    status: mappedStatus,
                    needs_image: !memoryNode.image_url,
                    image_url: memoryNode.image_url || '',
                    is_watchlist: collection === 'watchlist',
                    images: memoryNode.image_url ? [memoryNode.image_url] : [],
                    quality_score: memoryNode.insight?.market_impact_score || 70,
                    createdAt: memoryNode._timestamp,
                    publishedAt: memoryNode._timestamp,
                    source: 'ALOHA_SWARM_V1.1',
                    // 8 DİL ÇEVİRİLERİ (Tam Otonom)
                    translations: memoryNode.intelligence?.translations || {},
                    
                    // INTENT LAYER (Veri Kategori Süzgeci: DISCOVER, ANALYZE, ACT)
                    intent: memoryNode.insight?.intent || 'DISCOVER',
                    
                    // ENTITY GRAPH (LLM Schema.org Verileri)
                    entity_data: memoryNode.entity_data || { organizations: [], places: [], products: [] },
                    
                    // YENİ 4 KANAL (Triple Output — V1.1 Native)
                    insight: memoryNode.insight || null,
                    action_layer: memoryNode.action_layer || null,
                    visual_intent: memoryNode.visual_intent || null,
                    watch_layer: memoryNode.watch_layer || null,
                    seo_matrix: memoryNode.seo_matrix || null,

                    // ═══════════════════════════════════════════════════
                    //  LEGACY UYUMLULUK — Frontend'in okuduğu alanlar
                    //  V1.1 çıktıları → Eski UI property'lerine dönüşüm
                    // ═══════════════════════════════════════════════════
                    
                    // 1. EXECUTIVE SUMMARY — CEO özeti
                    executive_summary: memoryNode.insight?.explanation || '',
                    ai_ceo_block: memoryNode.insight ? {
                        executive_summary: [memoryNode.insight.explanation || '']
                    } : null,
                    
                    // 2. AI IMPACT SCORE — Etki skoru
                    ai_impact_score: memoryNode.insight?.market_impact_score || 0,
                    commercial_score: memoryNode.insight?.market_impact_score || 70,
                    commercial_type: memoryNode.insight?.direction === 'opportunity' ? 'trade_opportunity' : 'market_signal',
                    
                    // 3. TRADE BRIEF — B2B karar paneli
                    trade_brief: memoryNode.action_layer ? {
                        situation: memoryNode.insight?.explanation || '',
                        so_what: memoryNode.watch_layer?.reason || '',
                        now_what: memoryNode.action_layer.manufacturer || '',
                        who_wins: [
                            memoryNode.action_layer.manufacturer ? 'Üreticiler: ' + memoryNode.action_layer.manufacturer.substring(0, 80) : '',
                            memoryNode.action_layer.investor ? 'Yatırımcılar: ' + memoryNode.action_layer.investor.substring(0, 80) : '',
                        ].filter(Boolean),
                        who_loses: memoryNode.insight?.direction === 'risk' 
                            ? ['Fiyat baskısına hazırlıksız firmalar', 'Tedarik zinciri çeşitlendirmesi yapmayan üreticiler']
                            : [],
                    } : null,
                    
                    // 4. ACTION ITEMS — Ne yapmalı listesi
                    action_items: [
                        memoryNode.action_layer?.manufacturer,
                        memoryNode.action_layer?.retailer,
                        memoryNode.action_layer?.architect,
                        memoryNode.action_layer?.investor,
                    ].filter(Boolean),
                    
                    // 5. OPPORTUNITY CARD — Fırsat kartı
                    opportunity_card: memoryNode.action_layer ? {
                        action: memoryNode.action_layer.manufacturer || memoryNode.action_layer.retailer || '',
                        buyer_type: 'Üretici & İhracatçı',
                        urgency: (memoryNode.insight?.market_impact_score || 0) > 65 ? 'YÜKSEK' : 'NORMAL'
                    } : null,
                    
                    // 6. TAGS — SEO anahtar kelimeleri (Otonom 8 Dil Desteği)
                    tags: [
                        ...(memoryNode.seo_matrix?.core_keys || []),
                        ...(memoryNode.seo_matrix?.local_keys?.TR || []),
                        ...(memoryNode.seo_matrix?.local_keys?.EN || []),
                        ...(memoryNode.seo_matrix?.local_keys?.DE || [])
                    ].filter(Boolean).slice(0, 15),
                    
                    // 7. COMMERCIAL NOTE — AI Bloomberg Analiz
                    commercial_note: memoryNode.ai_commentary || memoryNode.insight?.explanation || '',
                    
                    // 8. BUSINESS OPPORTUNITIES — B2B Fırsat Listesi
                    business_opportunities: memoryNode.business_opportunities || [],
                    
                    // 9. COMMERCIAL CTA — Kurumsal B2B Lead Engine Katmanı (Haberi paraya çeviren kanca)
                    commercial_cta: memoryNode.commercial_cta || null,
                    
                    // 10. IMAGE PROMPTS — 3'lü görsel prompt sistemi
                    image_prompts: memoryNode.image_prompts || [],
                };

                await adminDb.collection('trtex_news').doc(memoryNode._id).set(firestoreDoc);
                console.log(`🔥 [FIRESTORE BRIDGE] Swarm haberi trtex_news'e yazıldı: ${tr.title.substring(0, 50)}...`);

                // ═══ MASTER PHOTOGRAPHER — ZORUNLU 3 GÖRSEL ÜRETİMİ ═══
                // Anayasa: "Her haberde KESİN 3 görsel. Asla boş bırakma."
                // Başarısız olursa trtex_image_queue'ya yaz → master-cycle retry eder
                if (mappedStatus === 'published') {
                    try {
                        console.log(`📸 [IMAGE_PIPELINE] ${tr.title.substring(0, 40)}... için 3 görsel üretiliyor...`);
                        const imageUrls = await processMultipleImages(
                            firestoreDoc.category,
                            tr.title,
                            (tr.content || '').substring(0, 500),
                            3
                        );
                        
                        const validUrls = imageUrls.filter((u: string) => u && u.startsWith('http'));
                        if (validUrls.length > 0) {
                            const imageUpdate: Record<string, any> = {
                                images: validUrls,
                                image_url: validUrls[0] || '',
                                needs_image: false,
                                image_generated: true,
                                image_generated_at: new Date().toISOString(),
                                image_status: 'ready',
                            };
                            // 2. ve 3. görseli ayrı alanlara da yaz (Legacy uyumluluk)
                            if (validUrls[1]) imageUpdate.mid_image_url = validUrls[1];
                            if (validUrls[2]) imageUpdate.detail_image_url = validUrls[2];
                            
                            await adminDb.collection('trtex_news').doc(memoryNode._id).update(imageUpdate);
                            console.log(`📸 [IMAGE_PIPELINE] ✅ ${validUrls.length} görsel üretildi ve Firestore'a yazıldı.`);
                        } else {
                            // ═══ ASLA RESİMSİZ BIRAKMA — Eski haberden ödünç al ═══
                            console.warn(`📸 [IMAGE_PIPELINE] ⚠️ Görsel üretilemedi — aynı kategoriden ödünç aranıyor...`);
                            
                            let borrowedUrl = '';
                            try {
                                // Aynı kategorideki eski haberlerden mid/detail görsel ödünç al
                                const categorySnap = await adminDb.collection('trtex_news')
                                    .where('category', '==', firestoreDoc.category)
                                    .where('image_url', '!=', '')
                                    .limit(10)
                                    .get();
                                
                                for (const doc of categorySnap.docs) {
                                    const d = doc.data();
                                    // Önce mid_image veya detail_image al (ana görsel değil — çakışma önlenir)
                                    const candidate = d.mid_image_url || d.detail_image_url || d.images?.[1] || d.images?.[2];
                                    if (candidate && candidate.startsWith('https://storage.googleapis.com/')) {
                                        borrowedUrl = candidate;
                                        console.log(`📸 [IMAGE_PIPELINE] 🔄 Ödünç görsel bulundu: ${candidate.slice(-50)}`);
                                        break;
                                    }
                                }
                                
                                // Kategori eşleşmesi bulunamazsa, herhangi bir haberden al
                                if (!borrowedUrl) {
                                    const anySnap = await adminDb.collection('trtex_news')
                                        .where('image_url', '!=', '')
                                        .limit(5)
                                        .get();
                                    for (const doc of anySnap.docs) {
                                        const d = doc.data();
                                        const candidate = d.mid_image_url || d.detail_image_url || d.images?.[1] || d.image_url;
                                        if (candidate && candidate.startsWith('https://storage.googleapis.com/')) {
                                            borrowedUrl = candidate;
                                            break;
                                        }
                                    }
                                }
                            } catch { /* ödünç arama hatası — devam */ }
                            
                            if (borrowedUrl) {
                                // Ödünç görsel bulduk — haberi resimli yayınla
                                await adminDb.collection('trtex_news').doc(memoryNode._id).update({
                                    image_url: borrowedUrl,
                                    images: [borrowedUrl],
                                    needs_image: true, // retry'da gerçek görsel üretilsin
                                    image_status: 'borrowed',
                                    _image_borrowed: true,
                                    _image_borrowed_from: borrowedUrl,
                                });
                                console.log(`📸 [IMAGE_PIPELINE] ✅ Ödünç görsel atandı — haber resimsiz kalmadı.`);
                            } else {
                                // Hiçbir görsel bulunamadı — needs_image olarak işaretle
                                await adminDb.collection('trtex_news').doc(memoryNode._id).update({
                                    needs_image: true,
                                    image_url: '',
                                    images: [],
                                    image_status: 'pending_retry',
                                });
                            }
                            
                            // Retry queue'ya ekle — kota düzelince gerçek görsel üretilsin
                            try {
                                await adminDb.collection('trtex_image_queue').add({
                                    articleId: memoryNode._id,
                                    project: 'trtex',
                                    title: tr.title,
                                    category: firestoreDoc.category,
                                    status: 'pending',
                                    retryCount: 0,
                                    createdAt: new Date().toISOString(),
                                    reason: borrowedUrl ? 'borrowed_needs_original' : 'inline_generation_failed',
                                });
                            } catch { /* sessiz */ }
                        }
                    } catch (imgErr: any) {
                        console.error(`📸 [IMAGE_PIPELINE] ❌ Görsel üretim hatası: ${imgErr.message?.substring(0, 80)}`);
                        
                        // Hata durumunda da retry queue'ya ekle
                        try {
                            await adminDb.collection('trtex_image_queue').add({
                                articleId: memoryNode._id,
                                project: 'trtex',
                                title: tr.title,
                                category: firestoreDoc.category,
                                status: 'pending',
                                retryCount: 0,
                                createdAt: new Date().toISOString(),
                                reason: `error: ${imgErr.message?.substring(0, 100)}`,
                            });
                        } catch { /* sessiz */ }
                        
                        // Haberi needs_image olarak işaretle
                        try {
                            await adminDb.collection('trtex_news').doc(memoryNode._id).update({
                                needs_image: true,
                                image_status: 'error',
                            });
                        } catch { /* sessiz */ }
                    }
                }
            } catch (e: any) {
                console.warn(`⚠️ [FIRESTORE BRIDGE] Yazım hatası (non-blocking):`, e.message);
            }
        };
        // AWAIT — Firestore'a yazılmadan haber "kayıt edildi" sayılmaz
        try {
            await firestoreWrite();
        } catch (fwErr: any) {
            console.error(`🔴 [FIRESTORE BRIDGE] Kritik yazım hatası — haber Firestore'da YOK:`, fwErr.message);
        }
    }
    
    // ⚡ V5 Sıfır Gecikme (Zero-Latency) Webhook Tetikleyicisi (Ateşle ve Unut)
    const webhookUrl = process.env.NODE_ENV === 'production' 
        ? 'https://trtex.com/api/webhook/aipyram' 
        : 'http://localhost:3000/api/webhook/aipyram';
        
    console.log(`📡 [AIPYRAM PING] Dumb Client (TRTEX) uyarılıyor -> ${webhookUrl}`);
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: collection,
            action: 'invalidate_aipyram_brain',
            secret: process.env.TRTEX_WEBHOOK_SECRET || 'TRTEX_WEBHOOK_SECRET'
        })
    }).then(() => {
        console.log(`✅ [AIPYRAM PING] TRTEX 'aipyram_brain' Cache'i Sıfır Gecikmeyle Yıkıldı!`);
    }).catch(e => {
        console.warn(`⚠️ [AIPYRAM PING] Webhook Hatası (TRTEX uyuyor olabilir):`, e.message);
    });
    
    return memoryNode;
}

export function getFromGoogleNativeMemory(collection: string) {
    const filePath = path.join(MEMORY_DIR, `${collection}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return []; // Henüz hafızada yoksa boş döner
}

export function updateInGoogleNativeMemory(collection: string, id: string, payload: any) {
    const filePath = path.join(MEMORY_DIR, `${collection}.json`);
    if (!fs.existsSync(filePath)) return null;
    
    let currentData: any[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(currentData)) currentData = [currentData];
    
    const index = currentData.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    
    currentData[index] = { ...currentData[index], ...payload, _updatedAt: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
    return currentData[index];
}

export function deleteFromGoogleNativeMemory(collection: string, id: string) {
    const filePath = path.join(MEMORY_DIR, `${collection}.json`);
    if (!fs.existsSync(filePath)) return false;
    
    let currentData: any[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(currentData)) return false;
    
    const initialLength = currentData.length;
    currentData = currentData.filter(item => item.id !== id && item._id !== id);
    if (currentData.length === initialLength) return false;
    
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
    return true;
}

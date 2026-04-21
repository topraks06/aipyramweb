import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from 'slugify';
import { transliterate } from 'transliteration';

// Baş Orkestratör Frankfurt'tan çalışır (v1 Kararlı Sürümü kilitlendi)
const project = 'perde-ai';
const location = 'europe-west3';
const vertexAI = new VertexAI({ project, location });
const vertexModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// API Version v1 kilitlendi
const studioModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });

const TARGET_LANGS = ['EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH'];

// SEO Mührü (Arapça & Kiril dahil Kırılmaz Slug)
function generateSlug(title: string) {
    if (!title) return "untitled";
    // Latinize before slugify to protect Chinese characters (Pinyin)
    const latinized = transliterate(title);
    return slugify(latinized, {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: true,
        locale: 'tr' 
    }).substring(0, 70);
}

export async function runTranslationGuard() {
    console.log('[🚀 BÜYÜK TAARRUZ] 68 Bakir Haber Çevirisi Başlıyor (12 Saniye Kural devrede)...\n');
    
    const newsRef = adminDb.collection('trtex_news');
    const snapshot = await newsRef.get();
    
    let processCount = 0;

    for (const doc of snapshot.docs) {
        const article = { id: doc.id, ...doc.data() } as any;
        let updatedTranslations = { ...(article.translations || {}) };
        let needsUpdate = false;
        
        // Çevrilmiş mi Kontrolü: 6 dilin hepsi tam mı?
        let isArticleComplete = true;
        for (const lang of TARGET_LANGS) {
            if (!updatedTranslations[lang]?.title || !updatedTranslations[lang]?.slug) {
                isArticleComplete = false;
            }
        }
        
        if (isArticleComplete) continue; // Zaten bitmiş pilot testleri atla.

        console.log(`\n⏳ [Operasyon] Haber: ${article.id} | ${article.title?.substring(0, 40)}...`);

        let lastAiSource = "Otonom";

        for (const lang of TARGET_LANGS) {
            const tr = updatedTranslations[lang];
            const isMissing = !tr || !tr.title;
            const isMissingSlug = tr && (!tr.slug || tr.is_rtl === undefined);
            const isRTL = lang === 'AR';

            if (isMissing || isMissingSlug) {
                needsUpdate = true;
                
                // Zaten metin varsa, sadece slug ve RTL'yi mühürle (AI yorulmasın)
                if (!isMissing && isMissingSlug) {
                    updatedTranslations[lang].slug = generateSlug(tr.title);
                    updatedTranslations[lang].is_rtl = isRTL;
                    continue;
                }

                let extraInstructions = "";
                if (lang === 'ZH') {
                    extraInstructions = `Specifically use professional Mandarin B2B trade terminology (e.g., equivalents of "Dış Ticaret/Foreign Trade", "Tedarik Zinciri/Supply Chain", "Tekstil İhracatı/Textile Export"). Ensure Pinyin compatibility.`;
                }

                const prompt = `You are a highly premium B2B textile trade editor. Translate the following Turkish news into [${lang}] language.
Use professional, industry-specific high-end textile terminology. Provide extremely concise translations.
${extraInstructions}

Must return raw JSON exactly matching this structure:
{"title": "localized title", "summary": "localized summary"}

Turkish Source:
Title: ${article.title}
Summary: ${article.summary}`;

                let responseText = "";
                lastAiSource = "VertexAI";
                
                try {
                    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
                    const streamingResp = await vertexModel.generateContent(req);
                    responseText = streamingResp.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
                } catch(e: any) {
                    // Vertex Limits, fallback to AI Studio
                    lastAiSource = "AI Studio";
                    try {
                        const response = await studioModel.generateContent(prompt);
                        responseText = response.response.text();
                    } catch (err: any) {
                        console.error(`❌ [${lang}] İki AI Ağı da Çöktü: ${err.message}`);
                    }
                }

                if (responseText) {
                    try {
                        let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                        // Bazen AI başında veya sonunda metin bırakabiliyor, o yüzden '{' ile başlayıp '}' ile biten kısmı alalım
                        const start = cleanText.indexOf('{');
                        const end = cleanText.lastIndexOf('}');
                        if (start >= 0 && end >= 0) {
                            cleanText = cleanText.substring(start, end + 1);
                        }

                        const result = JSON.parse(cleanText);
                        
                        // Option A: MANUAL MAPPING (Undefined Kalkanı)
                        result.slug = generateSlug(result.title); 
                        result.is_rtl = isRTL; 
                        
                        updatedTranslations[lang] = result;
                    } catch(e) {
                         console.error(`❌ [${lang}] AI yanıtı JSON olarak dönüştürülemedi.`);
                    }
                }

                // 12 Saniye "Nefes" Kuralı (Maliye Bakanı Limitsiz Olsa Bile Stabilite)
                await new Promise(resolve => setTimeout(resolve, 12000));
            }
        }
        
        if (needsUpdate) {
            await newsRef.doc(article.id).update({ translations: updatedTranslations });
            console.log(`✅ Haber ${article.id}: 7 Dil Tamamlandı, Linkler Sağlam (${lastAiSource})`);
            processCount++;
        }
    }
    
    console.log('\n======================================================');
    console.log(`🎉 ŞOV BAŞLADI: Başarıyla Tamamlanan Haber Sayısı: ${processCount}`);
    console.log('======================================================');
    process.exit(0);
}

runTranslationGuard();

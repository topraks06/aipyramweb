import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { executeTask } from '@/core/aloha/aiClient';
import { FinanceMinister } from '@/core/aloha/financeMinister';
import { MatchmakerEngine } from '@/core/aloha/matchmakerEngine';

/**
 * POST /api/v1/master/trtex/ugc-news
 * TRTEX Sovereign "Dark Pool" Ingestion Engine.
 * Takes raw UGC, performs Anti-Spam checks, extracts Structured Data, 
 * creates a B2B Listing, and optionally generates a News Article.
 */
export async function POST(req: Request) {
  try {
    const { type, rawText, companyName, country, visibility, email, taxId, website, mobilePhone, annualCapacity, employeeCount, exportImportInfo } = await req.json();

    if (!type || !rawText) {
      return NextResponse.json({ error: 'Eksik parametreler (type, rawText)' }, { status: 400 });
    }

    const safeVisibility = visibility || 'PUBLIC'; // PUBLIC, VIP_ONLY, MATCHED_ONLY

    // 1. Budget Guard
    const quotas = await FinanceMinister.getDailyQuotas();
    if (quotas.mode === 'LOCKED') {
      return NextResponse.json({ error: 'Sistem limitleri nedeniyle geçici olarak durduruldu.' }, { status: 403 });
    }

    // 2. Aloha AI Dual-Extraction & Transformation Prompt
    const prompt = `
      Sen TRTEX Sovereign Terminali'nin "Dark Pool İstihbarat Analisti" ve Baş Editörüsün.
      Görevin: Gelen ham B2B verisini (UGC) önce anti-spam süzgecinden geçirmek, sonra yapısal veriye dönüştürmek ve en son profesyonel bir haber bülteni yazmak.

      Bir B2B firması sisteme şu ham ilanı bıraktı:
      - Firma/Gönderen: ${companyName || 'Sovereign Network Üyesi'}
      - Lokasyon: ${country || 'Global'}
      - İlan Türü: ${type} (TENDER = Alım Talebi, HOT_STOCK = Sıcak Stok, CAPACITY = Fason Kapasite)
      - Gizlilik Seviyesi: ${safeVisibility} (MATCHED_ONLY ise haber yazılmaz, sadece yapısal veri çıkarılır)
      - Ham Metin: "${rawText}"

      KURALLAR:
      1. ANTI-SPAM: Metin anlamsızsa, küfür içeriyorsa veya saçma sapan miktarlar (örn: 1 Milyar Ton kumaş) içeriyorsa "is_spam": true döndür.
      2. YAPISAL VERİ: Metnin içinden ürün tipi, miktar/tonaj, tahmini pazar segmenti (ucuz/piyasa/premium) gibi verileri çıkar.
      3. HABER ÜRETİMİ: Eğer is_spam false ise ve gizlilik seviyesi MATCHED_ONLY değilse; FOMO yaratacak, kurumsal dilde, HTML formatında (<h2>, <p>) bir "Piyasa Sinyali" haberi yaz. Başlık clickbait değil veri odaklı olsun.

      Lütfen sonucu AŞAĞIDAKİ KESİN JSON formatında ver:
      {
        "is_spam": false,
        "spam_reason": "",
        "structured_data": {
          "product_category": "Örn: İplik, Kumaş, Tül",
          "material_details": "Örn: %100 Pamuk, Penye 30/1",
          "volume_amount": "5000 veya 'Belirtilmedi'",
          "volume_unit": "kg, metre, ton",
          "market_tier": "premium, standard, budget",
          "estimated_price_band": "Tahmini fiyat aralığı veya 'Piyasa Ortalaması'"
        },
        "news_article": {
          "title": "Habere atılacak prestijli başlık",
          "summary": "2-3 cümlelik vurucu özet",
          "content": "Haberin detaylı HTML formatında metni",
          "category": "PİYASA SİNYALİ",
          "insight_explanation": "Kahin Yorumu: Piyasaya genel etkisi"
        }
      }
    `;

    // Use executeTask for centralized budget + authority control
    const taskResult = await executeTask({
      nodeId: 'trtex',
      action: 'ugc_data_extraction',
      payload: { prompt },
      userEmail: email || 'system@trtex.com',
      caller: 'ugc_news_api',
    });
    const aiResponse = taskResult.success ? taskResult.data?.text : null;
    if (!aiResponse) throw new Error('AI Motoru veri ayrıştırmasını gerçekleştiremedi.');

    let parsed;
    try {
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      throw new Error('AI Yanıtı JSON olarak ayrıştırılamadı.');
    }

    if (parsed.is_spam) {
      return NextResponse.json({ error: 'Güvenlik Protokolü: İlan reddedildi. Sebep: ' + parsed.spam_reason }, { status: 406 });
    }

    // --- SOVEREIGN TRUST ENGINE (Otonom Güven Skoru) ---
    // Başlangıç Puanı: 10 (E-posta ile giriş zaten zorunlu olduğu için taban puan)
    let trustScore = 10;
    
    // 1. Temel Kurumsal Kimlik (+20 Puan)
    if (companyName && companyName.length > 3) trustScore += 15; 
    if (country && country.length > 2) trustScore += 5;
    
    // 2. Kritik İletişim ve Doğrulama (+40 Puan)
    if (taxId && taxId.length > 5) trustScore += 15; // Vergi/Ticaret Sicil No
    if (mobilePhone && mobilePhone.length > 8) trustScore += 15; // Mobil/WhatsApp (Çok Değerli Data)
    if (website && website.includes('.')) trustScore += 10; // Dijital Varlık
    
    // 3. İleri Düzey Operasyonel Büyüklük (+30 Puan)
    if (annualCapacity && annualCapacity.length > 2) trustScore += 10; // Yıllık Kapasite
    if (employeeCount && employeeCount.length > 0) trustScore += 10; // Çalışan Sayısı / Firma Yaşı
    if (exportImportInfo && exportImportInfo.length > 2) trustScore += 10; // İhracat/Referans

    // Maksimum skoru 100 ile sınırla
    trustScore = Math.min(trustScore, 100);
    
    // Sovereign God Mode Bypass
    const isSovereignGod = email === 'hakantoprak71@gmail.com';
    if (isSovereignGod) trustScore = 100;

    const isTrusted = trustScore >= 50;
    const listingStatus = isTrusted ? 'ACTIVE' : 'PENDING';

    const batch = adminDb.batch();

    // 1. DUAL DB WRITE: trtex_b2b_listings (The Dark Pool Structured Data)
    const listingRef = adminDb.collection('trtex_b2b_listings').doc();
    const listingId = listingRef.id;
    
    batch.set(listingRef, {
      type: type,
      visibility: safeVisibility,
      rawText: rawText,
      companyRef: companyName || 'VIP Network Member',
      country: country || 'Global',
      profilingData: {
        taxId: taxId || null,
        website: website || null,
        mobilePhone: mobilePhone || null,
        annualCapacity: annualCapacity || null,
        employeeCount: employeeCount || null,
        exportImportInfo: exportImportInfo || null
      },
      structuredData: parsed.structured_data || {},
      status: listingStatus,
      trustScore: trustScore,
      createdAt: new Date().toISOString()
    });

    // 2. DUAL DB WRITE: trtex_news (The Public/VIP News Feed) - Only if Trusted & NOT Matched Only
    let newsSlug = null;
    let newsTitle = null;

    if (isTrusted && safeVisibility !== 'MATCHED_ONLY' && parsed.news_article) {
      const newsRef = adminDb.collection('trtex_news').doc();
      newsSlug = `${type.toLowerCase()}-${newsRef.id}`;
      newsTitle = parsed.news_article.title;

      batch.set(newsRef, {
        title: parsed.news_article.title,
        summary: parsed.news_article.summary,
        content: parsed.news_article.content,
        category: parsed.news_article.category,
        slug: newsSlug,
        status: 'published',
        source: 'TRTEX Sovereign B2B Network',
        type: type,
        visibility: safeVisibility, // 'PUBLIC' or 'VIP_ONLY'
        companyRef: companyName || 'VIP Network Member',
        linkedListingId: listingId,
        insight: {
          explanation: parsed.news_article.insight_explanation,
          market_impact_score: Math.min(95, trustScore + (type === 'TENDER' ? 10 : 5)),
          direction: type === 'TENDER' ? 'opportunity' : 'signal'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isUGC: true
      });
    }

    await batch.commit();
    await FinanceMinister.recordActualSpend(0.04, `UGC Dark Pool AI Extraction (${type})`);

    // --- MATCHMAKER ENGINE TRIGGER ---
    // Eşleşme motorunu asenkron tetikle ki API yanıtını geciktirmesin
    MatchmakerEngine.executeMatchmaking({
      id: listingId,
      type: type,
      visibility: safeVisibility,
      structuredData: parsed.structured_data || {},
      country: country || 'Global',
      companyRef: companyName
    }).catch(err => console.error('[MATCHMAKER ASYNC ERROR]', err));

    return NextResponse.json({ 
      success: true, 
      listingId: listingId,
      slug: newsSlug, 
      title: newsTitle,
      visibility: safeVisibility,
      structuredData: parsed.structured_data,
      trustScore: trustScore,
      status: listingStatus
    });

  } catch (error: any) {
    console.error('[UGC DARK POOL GENERATOR] Kritik Hata:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

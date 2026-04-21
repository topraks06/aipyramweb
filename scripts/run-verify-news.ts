import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';

async function verifyNews() {
    console.log('[🔍 DENETİM MASASI] Haberler, Resimler ve Çeviriler Kontrol Ediliyor...\n');
    const newsRef = adminDb.collection('trtex_news');
    const snapshot = await newsRef.get();
    
    let total = snapshot.docs.length;
    let withImages = 0;
    let validImages = 0;
    let withTranslations = 0;
    let missingTranslations = 0;

    let sampleProof = [];

    for (let i = 0; i < total; i++) {
        const doc = snapshot.docs[i];
        const data = doc.data() as any;
        
        const hasImage = !!data.image_url;
        if (hasImage) withImages++;
        
        // Cümlede storage veya firebasestorage geçiyorsa valid kabul edebiliriz (veya null değilse)
        if (hasImage && data.image_url.includes('http')) validImages++;

        const tr = data.translations || {};
        const langs = ['EN', 'DE', 'FR', 'ES', 'AR', 'RU'];
        let trCount = 0;
        let missing = [];
        
        for (const l of langs) {
            if (tr[l] && tr[l].title && tr[l].slug) {
                trCount++;
            } else {
                missing.push(l);
            }
        }
        
        if (trCount > 0) withTranslations++;
        if (missing.length > 0) missingTranslations++;

        // İlk 3 haber için detaylı ıspat topla
        if (i < 3) {
            sampleProof.push({
                id: doc.id,
                title: data.title?.substring(0, 50) + '...',
                image: data.image_url ? '✅ Var -> ' + data.image_url.substring(0, 40) + '...' : '❌ YOK',
                translations: `✅ ${trCount}/6 dilde hazır`,
                missing_langs: missing.length > 0 ? missing.join(', ') : 'Hiçbiri (Tamam)',
                ar_slug: tr['AR']?.slug || '❌ YOK'
            });
        }
    }

    console.log('\n======================================================');
    console.log('📊 GENEL İSTATİSTİK (TOTAL HABER: ' + total + ')');
    console.log('======================================================');
    console.log(`🖼️ Görseli Olan Haber Sayısı:  ${withImages} / ${total}`);
    console.log(`🌍 Çevirisi (Kısmen) Olan Haber Sayısı: ${withTranslations} / ${total}`);
    console.log(`⚠️ Çeviri Eksikliği (Tam 6 dilde olmayan): ${missingTranslations} / ${total}`);

    console.log('\n======================================================');
    console.log('📜 KANIT MASASI (İLK 3 HABERİN DETAYLI OTOPSİSİ)');
    console.log('======================================================');
    sampleProof.forEach((p, idx) => {
        console.log(`\n📰 HABER ${idx + 1} (${p.id})`);
        console.log(`   Başlık: ${p.title}`);
        console.log(`   Görsel: ${p.image}`);
        console.log(`   Çeviri Durumu: ${p.translations} (Eksikler: ${p.missing_langs})`);
        console.log(`   AR (Arapça) SEO Linki (Kanıt): ${p.ar_slug}`);
    });
    
    console.log('\n✅ İnceleme tamamlandı.');
    process.exit(0);
}

verifyNews();

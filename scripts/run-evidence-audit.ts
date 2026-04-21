import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';

async function runEvidenceAudit() {
    console.log('\n======================================================');
    console.log('🏛️ KANIT MASASI: MÜFETTİŞ RAPORU (HAM VERİ)');
    console.log('======================================================\n');
    
    const newsRef = adminDb.collection('trtex_news');
    
    // 2. Çince (ZH) ve 4. Arapça (AR) İspatı
    const snapshot = await newsRef.orderBy('publishedAt', 'desc').limit(20).get();
    let foundZH = false;
    let foundAR = false;

    console.log('[KANIT 2 & 4] Çeviri, Pinyin Slug ve RTL (Sağdan Sola) Durumu:');
    
    const docsToCheck = snapshot.docs;

    for (const doc of docsToCheck) {
        const data = doc.data();
        if (data.translations?.ZH && !foundZH) {
            console.log(`\n📌 [ZH ÇİNCE] Doküman ID: ${doc.id}`);
            console.log(JSON.stringify(data.translations.ZH, null, 2));
            foundZH = true;
        }
        if (data.translations?.AR && !foundAR) {
            console.log(`\n📌 [AR ARAPÇA] Doküman ID: ${doc.id}`);
            console.log(JSON.stringify({
                slug: data.translations.AR.slug,
                is_rtl: data.translations.AR.is_rtl,
                title: data.translations.AR.title
            }, null, 2));
            foundAR = true;
        }
    }
    
    if (!foundZH) console.log('❌ Çince (ZH) kayıt henüz Firestore a düşmedi. (Guard arka planda işliyor)');
    if (!foundAR) console.log('❌ Arapça (AR) kayıt henüz Firestore a düşmedi. (Guard arka planda işliyor)');

    // 3. Görseller Tek Tipleşmeden Kurtuldu mu? (3 Rastgele Yeni Görsel)
    console.log('\n[KANIT 3] 3 Farklı Yeni (Uniq) Görsel Bağlantısı:');
    const imgSnapshot = await newsRef.get();
    let images = imgSnapshot.docs
        .map(d => d.data().image_url)
        .filter(url => url && url.includes('_uniq_')); // Yalnızca 15s Maliye Bakanı kuralıyla üretilen yeni resimler
    
    if (images.length >= 3) {
        console.log(`1. Görsel: ${images[0]}`);
        console.log(`2. Görsel: ${images[1]}`);
        console.log(`3. Görsel: ${images[images.length - 1]}`); // Listenin sonundan bir tane al
    } else if (images.length > 0) {
        console.log(`Şu ana kadar ${images.length} özgün görsel Firestore'a işlendi:`);
        images.forEach((img, idx) => console.log(`${idx+1}. Görsel: ${img}`));
    } else {
        console.log('❌ Henüz _uniq_ damgalı yeni nesil görsel Firestore a yansımadı. (Imagen arka planda işliyor)');
    }

    console.log('\n======================================================');
    process.exit(0);
}

runEvidenceAudit();

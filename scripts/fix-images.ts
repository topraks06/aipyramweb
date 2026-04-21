import { adminDb } from '../src/lib/firebase-admin';
import { processImageForContent } from '../src/core/swarm/imageAgent';

async function fixCollection(collectionName: string) {
  console.log(`\n[🚀 taranıyor] Koleksiyon: ${collectionName}`);
  
  try {
    const snapshot = await adminDb.collection(collectionName).get();
    console.log(`[🔍 BİLGİ] Toplam ${snapshot.size} haber bulundu.`);

    let fixedCount = 0;
    const batchList = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentUrl = data.image_url || data.imageUrl || data.image; // bazen farklı isimlerde tutuluyor olabilir
      const title = data.translations?.TR?.title || data.title || data.haber_baslik || "Ev Tekstili Trendleri";
      const category = data.category || "Haber";
      
      const isBroken = !currentUrl || 
        currentUrl.includes('example.com') ||
        currentUrl.includes('<mock>') ||
        currentUrl.includes('supabase') ||
        currentUrl === 'undefined' ||
        currentUrl === 'null' ||
        currentUrl === '';

      if (isBroken) {
        console.log(`[🔧 DÜZELTİLİYOR] ${title.substring(0,40)}... -> Mevcut: ${currentUrl || 'YOK'}`);
        const p = processImageForContent('news', category, title).then(async (newUrl) => {
          await doc.ref.update({
            image_url: newUrl,
            imageUrl: newUrl // emin olmak için 
          }, { merge: true }); // Varolan yapıyı bozmadan ekle
          fixedCount++;
          console.log(`   ✅ Yeni URL atandı: ${newUrl.substring(0,50)}...`);
        });
        batchList.push(p);
      }
    }

    if (batchList.length > 0) {
      console.log(`[⏳ BEKLE] ${batchList.length} adet Firebase güncellemesi yapılıyor...`);
      await Promise.all(batchList);
      console.log(`[🎉 BİTTİ] ${fixedCount} haber onarıldı.`);
    } else {
      console.log(`[✨ MÜKEMMEL] Hiçbir kırık link bulunamadı.`);
    }

  } catch (error) {
    console.error("[🚨 HATA]", error);
  }
}

async function main() {
   await fixCollection('trtex_news');
   await fixCollection('news'); // Eski legacy haberler
   process.exit(0);
}

main();

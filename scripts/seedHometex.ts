const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = require('../firebase-sa-key.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

const HOMETEX_EXHIBITORS = [
  { name: 'SOVEREIGN MILLS', desc: 'Sürdürülebilir lüks üretimde İngiliz dokuma teknikleri. Yeni 2026 İlkbahar Koleksiyonu fuar alanında.', coverImageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80', category: 'Premium' },
  { name: 'AURORA TEXTILES', desc: 'Gelişmiş akıllı perde sistemleri ve motorlu mekanizmalar.', coverImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80', category: 'Gold' },
  { name: 'NOVA HOME', desc: 'Organik pamuk içerikli otel tekstili çözümleri.', coverImageUrl: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80', category: 'Silver' },
  { name: 'TECHNO SHADE', desc: 'Yapay Zeka Tasarım Araçlarının Evrimi ile akıllı perde deneyimleri.', category: 'Teknoloji', coverImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2800' },
  { name: 'LUMINA FABRICS', desc: 'Işığı mükemmel filtreleyen tül perde inovasyonları.', coverImageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80', category: 'Premium' },
  { name: 'ECO WEAVE', desc: 'Geri dönüştürülmüş okyanus plastiklerinden elde edilen ipliklerle dokunan perdeler.', coverImageUrl: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?q=80', category: 'Sürdürülebilir' }
];

const HOMETEX_HALLS = [
  { name: "Döşemelik & Mobilya", count: "142 Katılımcı", desc: "İtalyan kadifesinden, yüksek sürtünme dayanımlı kontrat kumaşlara kadar en geniş koleksiyon.", image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-8", aspect: "aspect-[16/9]" },
  { name: "Perdelik & Tül", count: "89 Katılımcı", desc: "Işık geçirgenliğini sanata dönüştüren inovatif dokumalar.", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-4", aspect: "aspect-[3/4]" },
  { name: "Yatak & Banyo", count: "115 Katılımcı", desc: "Otel standartlarında organik pamuk, sürdürülebilir bambu karışımları.", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-4", aspect: "aspect-[3/4]" },
  { name: "Akıllı Perde Sistemleri", count: "92 Katılımcı", desc: "Motorize sistemler, UV korumalı, sürdürülebilir ve akustik yalıtımlı teknik tekstiller.", image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-8", aspect: "aspect-[16/9]" },
  { name: "Teknik Tekstil", count: "64 Katılımcı", desc: "Yanmaz, leke tutmaz ve antibakteriyel özellikli medikal ve endüstriyel kumaşlar.", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-6", aspect: "aspect-[16/9]" },
  { name: "Duvar Kaplamaları", count: "78 Katılımcı", desc: "Tekstil tabanlı duvar kağıtları ve akustik duvar panelleri.", image: "https://images.unsplash.com/photo-1590490360182-c33d955735ed?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-6", aspect: "aspect-[16/9]" },
  { name: "Zemin & Halı", count: "105 Katılımcı", desc: "El dokuması ve makine halıları, sürdürülebilir zemin çözümleri.", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-4", aspect: "aspect-[4/3]" },
  { name: "Tasarım Stüdyoları", count: "42 Katılımcı", desc: "Bağımsız tasarımcılar ve kumaş desen stüdyoları inovasyon alanı.", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2800&auto=format&fit=crop", span: "col-span-12 lg:col-span-8", aspect: "aspect-[21/9]" }
];

const HOMETEX_MAGAZINE_ARTICLES = [
  { title: 'Avrupa Pazarında Sürdürülebilirlik Kriterleri 2026', publishedAt: new Date('2026-04-15').toISOString(), category: 'Pazar Raporu', coverImage: 'https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?q=80', excerpt: 'Avrupa Yeşil Mutabakatı kapsamında ev tekstili ihracatçıları için yeni karbon ayak izi zorunlulukları.', content: 'Detaylı analiz...' },
  { title: 'Akıllı Perde Pazarında Asya Rekabeti', publishedAt: new Date('2026-04-12').toISOString(), category: 'Analiz', coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80', excerpt: 'Motorlu perde ve jaluzi pazarında uzak doğu menşeili ürünlerin Avrupa\'daki pazar payı değişimi.', content: 'Detaylı analiz...' },
  { title: 'Otel Tekstilinde Lüks Algısı Değişiyor', publishedAt: new Date('2026-04-08').toISOString(), category: 'Trend', coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80', excerpt: '5 yıldızlı otellerin yeni satın alma eğilimlerinde pamuk yerine bambu ve tencel karışımlarına yöneliş.', content: 'Detaylı analiz...' },
  { title: 'Almanya Ev Tekstili İthalat Verileri Q1', publishedAt: new Date('2026-04-05').toISOString(), category: 'Veri', coverImage: 'https://images.unsplash.com/photo-1605280263929-1c42c624165b?q=80', excerpt: 'Almanya pazarındaki daralma ve Türkiye\'nin pazar payını koruma stratejileri.', content: 'Detaylı analiz...' },
];

async function seed() {
  console.log("Seeding Hometex data...");
  
  const batch = db.batch();

  // Exhibitors
  HOMETEX_EXHIBITORS.forEach((item) => {
    const docRef = db.collection('hometex_exhibitors').doc();
    batch.set(docRef, { ...item, createdAt: new Date().toISOString() });
  });

  // Halls
  HOMETEX_HALLS.forEach((item) => {
    const docRef = db.collection('hometex_halls').doc();
    batch.set(docRef, { ...item, createdAt: new Date().toISOString() });
  });

  // Magazine
  HOMETEX_MAGAZINE_ARTICLES.forEach((item) => {
    const docRef = db.collection('hometex_articles').doc();
    batch.set(docRef, { ...item, isFeatured: item.category === 'Pazar Raporu', createdAt: new Date().toISOString() });
  });

  await batch.commit();
  console.log("Hometex data seeded successfully!");
}

seed().catch(console.error);

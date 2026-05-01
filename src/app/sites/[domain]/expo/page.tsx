import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Expo from '@/components/node-hometex/Expo';
import { adminDb } from '@/lib/firebase-admin';

const FALLBACK_HALLS = [
  { name: 'Perdelik Kumaşlar', desc: 'Tül, fon ve dekoratif perde kumaşları. Türkiye\'nin lider üreticileri.', count: '120+ Firma', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800', aspect: 'aspect-[4/5]', span: 'col-span-12 lg:col-span-7' },
  { name: 'Döşemelik & Mobilya', desc: 'Koltuk, sandalye ve yatak başlığı kumaşları. Yüksek aşınma dayanımı.', count: '85+ Firma', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800', aspect: 'aspect-[3/4]', span: 'col-span-12 lg:col-span-5' },
  { name: 'Yatak & Banyo Tekstili', desc: 'Nevresim, havlu, bornoz ve otel tekstili üreticileri.', count: '60+ Firma', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800', aspect: 'aspect-[3/4]', span: 'col-span-12 lg:col-span-5' },
  { name: 'Akıllı Tekstil & Mekanizma', desc: 'Motorlu perde rayları, stor sistemleri, akıllı ev entegrasyonları.', count: '40+ Firma', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800', aspect: 'aspect-[4/5]', span: 'col-span-12 lg:col-span-7' },
];

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  let exhibitors: any[] = [];
  let halls: any[] = [];
  try {
    const exhibitorsSnap = await adminDb.collection('hometex_exhibitors').get();
    const hallsSnap = await adminDb.collection('hometex_halls').get();
    exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    halls = hallsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  // Fallback: Firestore boşsa statik holler göster
  if (halls.length === 0) halls = FALLBACK_HALLS;

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Expo exhibitors={exhibitors} halls={halls} />
      </main>
    </div>
  );
}


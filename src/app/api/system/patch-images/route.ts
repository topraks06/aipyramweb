import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/system/patch-images
 * Görselsiz warm-up haberlerine Unsplash görselleri ekler
 */

const IMAGE_MAP: Record<string, string> = {
  'cin-perde-kumasi-ihracati-2026-yeni-gumruk-duzenlemeleri-ve-fiyat-etkileri': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop',
  'vietnam-ev-tekstili-uretimi-hizla-buyuyor-turk-ureticiler-icin-firsat-mi-te': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=450&fit=crop',
  'hindistan-pamuk-hasadi-raporu-kuresel-fiyatlara-etkisi': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&h=450&fit=crop',
  'sanghay-navlun-endeksi-nisan-2026-tekstil-lojistik-maliyetleri': 'https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=800&h=450&fit=crop',
  'ab-yesil-mutabakati-perde-ve-dosemelik-kumas-ureticileri-icin-yeni-sertifika': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=450&fit=crop',
  'almanya-ev-tekstili-talebi-2026-tuketici-egilimleri-ve-ithalat-verileri': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=450&fit=crop',
  'italya-perde-tasarim-trendleri-milano-fuari-oncesi-sezon-raporu': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=450&fit=crop',
  'avrupa-geri-donusturulmus-polyester-talebi-surdurulebilir-perde-kumaslarinda': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=450&fit=crop',
  'abd-ev-tekstili-ithalati-turk-markalarinin-2026-pazar-payi-analizi': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
  'meksika-ve-guney-amerika-perde-pazari-500-milyon-dolarlik-firsat': 'https://images.unsplash.com/photo-1582407947092-549972350253?w=800&h=450&fit=crop',
  'kanada-smart-home-pazari-motorlu-perde-sistemlerinde-talep-patlamasi': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=450&fit=crop',
  'suudi-arabistan-neom-projesi-dev-otel-yatirimlarinda-perde-ve-dosemelik-tale': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=450&fit=crop',
  'bae-luks-otel-zincirlerinde-turk-perde-kumasi-tercihi-artiyor': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=450&fit=crop',
  'afrika-ev-tekstili-pazari-2026-kenya-ve-nijerya-odakli-buyume-firsatlari': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=450&fit=crop',
  'turkiye-perde-ihracatinda-rekor-ilk-ceyrek-2026-verileri': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=450&fit=crop',
  'bursa-tekstil-osb-yeni-yatirim-tesvikleri-ve-kapasite-artisi': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop',
  'denizli-havlu-ve-bornoz-sektoru-avrupa-pazarinda-rekabet-avantaji': 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&h=450&fit=crop',
  'turk-lirasi-ve-tekstil-ihracati-kur-avantaji-mi-risk-mi': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
  'otel-ve-hastane-tekstili-kontrat-perde-pazarinda-2026-egilimleri': 'https://images.unsplash.com/photo-1590490360182-c33d955e4c47?w=800&h=450&fit=crop',
  'yapay-zeka-destekli-kumas-kalite-kontrol-sistemleri-maliyet-tasarrufu-analiz': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
};

export async function POST() {
  if (!adminDb) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  let patched = 0;
  const batch = adminDb.batch();

  for (const [docId, imageUrl] of Object.entries(IMAGE_MAP)) {
    const ref = adminDb.collection('trtex_news').doc(docId);
    batch.update(ref, { image_url: imageUrl });
    patched++;
  }

  // Also patch any warmup article that might have a slightly different slug
  const warmupSnap = await adminDb.collection('trtex_news').where('source', '==', 'TRTEX-WARMUP').get();
  for (const doc of warmupSnap.docs) {
    const data = doc.data();
    if (!data.image_url) {
      // Find closest match from IMAGE_MAP
      const matchKey = Object.keys(IMAGE_MAP).find(k => doc.id.startsWith(k.substring(0, 20)));
      if (matchKey) {
        batch.update(doc.ref, { image_url: IMAGE_MAP[matchKey] });
        patched++;
      }
    }
  }

  await batch.commit();

  // Rebuild terminal payload
  const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
  await buildTerminalPayload();

  return NextResponse.json({ success: true, patched, message: `${patched} habere görsel eklendi, terminal güncellendi.` });
}

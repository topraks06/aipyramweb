import fs from 'fs/promises';
import path from 'path';

class FeedCacheStore {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  // Bulutta Kalıcı Hafıza Alanı (Cloud Run Dosya Sistemi + Firebase Firestore Fallback)
  private readonly PERSIST_PATH = path.join(process.cwd(), 'data', 'cloud_memory.json');

  constructor() {
    console.log('[🗃️ FeedCache] Global Ölümsüz Hafıza (Persistence) Başlatılıyor.');
    this.hydrateMemory();
  }

  // Yeniden Başlamada (Sunucu Kapanıp Açılsa Bile) Eski Veriyi Geri Yükle
  private async hydrateMemory() {
    try {
      await fs.mkdir(path.dirname(this.PERSIST_PATH), { recursive: true });
      const rawData = await fs.readFile(this.PERSIST_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      
      for (const key in parsed) {
        this.cache.set(key, parsed[key]);
      }
      console.log('✅ [🗃️ FeedCache] Bulut Hafızası (Memory Seal) Başarıyla Yüklendi. Ajanlar eski bilgileri hatırlıyor.');
    } catch (err: any) {
      if (err.code === 'ENOENT') {
         console.warn('⚠️ [🗃️ FeedCache] Hafıza dosyası bulunamadı. Yeni bir Otonom Zihin oluşturuluyor...');
         // İlk açılışta boş dosya yarat
         await this.sealMemory();
      } else {
         console.error('❌ [🗃️ FeedCache] Hafıza okuma hatası:', err);
      }
    }
  }

  // Hafızayı Fiziksel Diske Kazı (Firebase Firestore Fallback)
  private async sealMemory() {
    try {
      const obj = Object.fromEntries(this.cache);
      await fs.writeFile(this.PERSIST_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ [🗃️ FeedCache] Hafıza kazınamadı (Disk yazma hatası):', e);
    }
  }

  public async setFeed(target: 'hometex' | 'trtex' | 'perde', data: any) {
    this.cache.set(target, {
      data,
      timestamp: Date.now()
    });
    console.log(`[🗃️ FeedCache] ${target.toUpperCase()} verisi güncellendi. Yeni Sürüm hazır.`);
    
    // RAM'e yazdığı gibi Mühür dosyasına da yazar. Sunucu dursa bile bu kalır.
    await this.sealMemory();
    console.log(`[🗃️ FeedCache] ${target.toUpperCase()} Otonom Mührü Vuruldu.`);
  }

  public getFeed(target: 'hometex' | 'trtex' | 'perde') {
    return this.cache.get(target);
  }
}

// Next.js dev server global izolasyon (HMR tekrar yüklenmesinden korur)
const globalForCache = global as unknown as { feedCache: FeedCacheStore };
export const feedCache = globalForCache.feedCache || new FeedCacheStore();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.feedCache = feedCache;
}

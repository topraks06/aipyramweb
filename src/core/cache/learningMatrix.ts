import fs from 'fs/promises';
import path from 'path';
export interface Lesson {
  timestamp: number;
  lesson: string;
}

class LearningMatrixStore {
  // Ajan ID'sine göre dizilmiş Hatalar (Lessons Learned) Veritabanı
  private memoryMatrix: Map<string, Lesson[]> = new Map();
  // Bulutta Kalıcı Öz-Eleştiri Mührü (Cloud Run + Firebase Firestore Fallback)
  private readonly MATRiX_PATH = path.join(process.cwd(), 'data', 'learning_matrix.json');

  constructor() {
    console.log('[🧠 OTONOM HAFIZA] Karma Kovan Bağı (Firebase + Local) Başlatılıyor...');
    this.hydrateLearningMatrix();
  }

  // Yeniden Başlamada Hata Sicilini Yükle (JSON Fallback)
  private async hydrateLearningMatrix() {
    // Sadece Lokal JSON Mimarisi (Sovereign Node)
    try {
      await fs.mkdir(path.dirname(this.MATRiX_PATH), { recursive: true });
      const rawData = await fs.readFile(this.MATRiX_PATH, 'utf-8');
      const parsed = JSON.parse(rawData);
      
      for (const agentId in parsed) {
        this.memoryMatrix.set(agentId, parsed[agentId]);
      }
      console.log('✅ [🧠 OTONOM HAFIZA] Lokal JSON Matrisi Yüklendi. Kovan Çevrimdışı Çalışıyor.');
    } catch (err: any) {
      if (err.code === 'ENOENT') {
         console.warn('⚠️ [🧠 OTONOM HAFIZA] Geçmiş hata kaydı bulunamadı. Yepyeni bir tertemiz, hatasız sürü yaratılıyor...');
         await this.sealMatrix();
      }
    }
  }

  // Hata Kayıtlarını Disk'e Mühürle (Sadece Yedekleme)
  private async sealMatrix() {
    try {
      const obj = Object.fromEntries(this.memoryMatrix);
      await fs.writeFile(this.MATRiX_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ [🧠 OTONOM HAFIZA] Yedekleme başarısız (Disk sorunu):', e);
    }
  }

  // Ajan Hata (Reject) Yediğinde İnfaz/Sicil Kaydını Matrise İşle
  public async recordMistake(agentId: string, critiqueLesson: string) {
    const existingLessons = this.memoryMatrix.get(agentId) || [];
    
    // Hafızayı çok kirletmemek için son 10 hatayı aklımızda tutalım
    if (existingLessons.length >= 10) {
      existingLessons.shift(); 
    }

    const newLesson = {
      timestamp: Date.now(),
      lesson: critiqueLesson
    };
    existingLessons.push(newLesson);
    this.memoryMatrix.set(agentId, existingLessons);

    console.log(`[🧠 YAPAY ÖĞRENME ⚡] "${agentId}" ajanının zihnine ACI BİR DERS kazındı. Hata: ${critiqueLesson.substring(0, 50)}...`);
    
    // offline Local SSD kaydı gerçekleştirilir.
    await this.sealMatrix();
  }

  // Bir Ajan İşlem Yapmadan Önce Bu Fonksiyon Çağrılıp Zihnine "Geçmiş Hatalar" Enjekte Edilecek
  public getLessonsLearned(agentId: string): string {
    const lessons = this.memoryMatrix.get(agentId);
    if (!lessons || lessons.length === 0) {
      return "HENÜZ BİLDİRİLEN BİR SİCİL/HATAN YOK. TEMİZ BİR ŞEKİLDE LÜKS ÜRET.";
    }

    const formattedLessons = lessons.map((l, index) => `${index + 1}. DERS: ${l.lesson}`).join('\n');
    return `
    🚨 [ZORUNLU OTONOM ÖZ-ELEŞTİRİ / GEÇMİŞ HATALARIN]:
    Sen geçmişte aşağıdaki acımasız eleştirileri yedin (REJECT). Bu eleştirileri ezberle ki BİR DAHA ASLA AYNI HATAYI YAPMAYASIN:
    ${formattedLessons}
    
    Eğer bu derslere uymazsan tekrar %95 QC Kalitesinden red yiyeceksin! Lüks, acımasız ve premium ol.
    `;
  }
}

// Next.js Dev Server (Dev İzolasyonu)
const globalForMatrix = global as unknown as { learningMatrix: LearningMatrixStore };
export const learningMatrix = globalForMatrix.learningMatrix || new LearningMatrixStore();

if (process.env.NODE_ENV !== 'production') {
  globalForMatrix.learningMatrix = learningMatrix;
}

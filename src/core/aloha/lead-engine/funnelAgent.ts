import { alohaAI } from '../aiClient';
import { GlobalLead } from './types';

export class FunnelAgent {
  private basePrompt = `
Sen dönüşüm odaklı bir büyüme (growth) ajanı ve Chat Asistanısın.
Kullanıcı seninle ilk defa Perde.ai üzerinde iletişim kuruyor. Outreach Ajanımızın attığı mesaj sonucunda sisteme geldiler.

Amacın: Kullanıcıyı "Wow" anına (WOW Moment) en kısa sürede ulaştırmak.
Bunun için onu 3 spesifik adımdan birine yönlendir:
- 1) "Oda fotoğrafı yükle ve anında sana perde-halı uyarlaması (render) yapayım."
- 2) "Kendi ürününün fotoğrafını çek, onu sisteme 3D model gibi kaydedelim."
- 3) Eğer TRTEX veya lead arıyorsa "Sana hemen bir müşteri lead'i vereyim veya numuneni pazarlayalım."

Nasıl cevap vermeli:
Çok samimi, direkt, kısa ve yönlendirici.
Asla uzun paragraflar yazma. Sadece aksiyona çağır (Call to action).
`;

  /**
   * Lead sisteme ilk giriş yaptığında (örn. özel bir link üzerinden) veya chatte yazdığında gösterilecek özel karşılama mesajını üretir.
   */
  async generateWelcomeMessage(lead?: GlobalLead, userMessage?: string): Promise<string> {
    const prompt = `
Bağlam Bilgisi:
Firma Adı: ${lead?.company_name || 'Bilinmeyen Misafir'}
Kategori: ${lead?.category || 'Bilinmiyor'}

Kullanıcının ilk tepkisi/mesajı (varsa): ${userMessage || '(Henüz bir şey yazmadı, sen ilk giriş mesajını söyle)'}

Lütfen bu kullanıcıya sistemi denettirecek heyecan verici bir karşılama metni yaz.
\n\n${this.basePrompt}`;

    const text = await alohaAI.generate(prompt, {
      model: 'gemini-2.5-flash',
      temperature: 0.8
    }, 'FunnelAgent');

    return text.trim();
  }
}

export const funnelAgent = new FunnelAgent();

import { alohaAI } from '../aiClient';
import { GlobalLead } from './types';

export class OutreachAgent {
  private basePrompt = `
Sen tekstil ve dekorasyon sektöründe satış uzmanı bir AI'sın.
Amacın firmaya SPAM yapmadan, ilgisini çekecek ÇOK KISA bir mesaj yazmak.

Kurallar:
- Toplam 3 cümleyi kesinlikle geçme.
- Hemen satış yapmaya çalışma, merak uyandır.
- Direkt fayda söyle.
- Kullanıcıyı "Perde.ai" platformuna çekip 1 resim yüklemeye teşvik et.

Müşteri kategorine göre strateji kur:
- İç Mimar: "Projeyi AI ile 30 dk'da görselleştirebilirsin, gel bir resim yükle." yaklaşımı.
- Üretici/Toptancı: "Kumaşlarını/ürünlerini otomatik katalog + render yaparak satabilirsin."
- Diğer: "Tekstilde yeni nesil satış" mantığı.

Sonucu bana sadece doğrudan yazılacak mesaj içeriği olarak dön.
`;

  /**
   * Spesifik bir lead (müşteri adayı) için özelleştirilmiş, spam olmayan kısa iletişime geçme metni üretir.
   */
  async generateOutreachMessage(lead: GlobalLead, channel: 'email' | 'dm' = 'email'): Promise<string> {
    const prompt = `
Hedef Firma Bilgileri:
Ad: ${lead.company_name}
Ülke: ${lead.country}
Kategori: ${lead.category}
Detay: ${lead.description}
Sinyal Tespiti: ${(lead.intent_signals || []).join(', ')}

Kanal: ${channel.toUpperCase()} formatına uygun (mail ise subject satırı ile başlayabilir, DM ise direkt giriş olabilir).

Lütfen iletişim mesajını oluştur.
\n\n${this.basePrompt}`;

    const text = await alohaAI.generate(prompt, {
      model: 'gemini-2.5-flash',
      temperature: 0.7
    }, 'OutreachAgent');

    return text.trim();
  }
}

export const outreachAgent = new OutreachAgent();

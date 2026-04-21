---
description: AIPyram Localization Policy - 8 Dilde TR-Öncelikli Başlangıç Kuralı
---

# AIPyram Localizasyon ve Dil Politikası (Mühürlenmiş Kurallar)

B2B Küresel Liderlik platformu AIPyram'da asgari dil ve arayüz kuralı aşağıdaki gibidir. Bu belge, yapay zeka ajanlarının platform geliştirirken kararlarında referans alacakları kesin yönergedir.

## 1. 8 Dil Zorunluluğu (8 Language Rule)
AIPyram altyapısı aşağıdaki **tam 8 dile** destek vermek zorundadır:
- **TR** (Türkçe) — *Varsayılan / Default*
- **EN** (İngilizce)
- **DE** (Almanca)
- **ES** (İspanyolca)
- **FR** (Fransızca)
- **ZH** (Çince)
- **AR** (Arapça)
- **RU** (Rusça)

> [!CAUTION]
> Ajanlar hiçbir senaryoda bu 8 dili azaltamaz veya "TR/EN yeterlidir" diyerek yapıyı bozamaz. Config dosyalarında (`routing.ts`), çeviri klasörlerinde (`messages/`) bu diller her zaman senkronize edilmelidir.

## 2. TR-First Kuralı (Açılış ve Alt Menüler)
Sistemin donanımsal dili ve mimarisi **TÜRKÇE**'dir.
- **Tarayıcı Pathnames Kuralı:** Sistem URL'leri maskelenerek İngilizce (`/about`) dosyalarına gitse dahi, TR seçili olduğunda linkler kesinlikle Türkçe gösterilmelidir (`/hakkimizda`, `/projeler`, `/yatirimci` vb.).
- Eğer arayüz dili TR seçildiyse, **her şey** (menüler, linkler, açıklamalar, badge'ler, uyarı mesajları) saf Türkçe olmak zorundadır. "Featured", "Domains", "Developing" gibi hiçbir statik İngilizce kelime sızmamalıdır.

## 3. İçerik Tutarlılığı ve Sadelik
- Çeviri verilerinde uzun ve tekrarlı "Otonom stratejik yapay zeka ekosistemi" kelimeleri yerine **"Yapay Zeka Platformu", "Akıllı Ekosistem"** gibi B2B standartlarında yalın ve keskin kelimeler tercih edilmelidir.
- Arayüz renklerinde Vercel/Apple standartlarında *Aydınlık (Light)* Kurumsal tema kullanılmalıdır (`text-foreground`, `bg-background`).

## Nasıl Uygulanır?
Yeni sayfa veya yönlendirme eklerken:
1. `src/i18n/routing.ts` içerisindeki `pathnames` alanına Türkçe karşılığı ile ekleyin.
2. Link verirken standart html `<a>` tag'i yerine mutlaka `import { Link } from "@/i18n/routing";` ile Next-intl `Link` bileşenini kullanın. Mühürlenmiştir.

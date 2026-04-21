---
description: Aipyram projesi dil politikası ve çeviri kuralları
---

# Aipyram Dil Politikası

## Temel Kurallar

1. **Ana dil Türkçe'dir.** Tüm sayfalar varsayılan olarak Türkçe (TR) yazılır.
2. **Public sayfalar 3 dilde olacaktır:** Türkçe (TR, ana dil), Almanca (DE), İngilizce (EN). i18n altyapısı ile çoklu dil desteği sağlanacak.
3. **Admin paneli YALNIZCA Türkçe olacaktır.** Admin panel bileşenleri, tab isimleri, form etiketleri, bildirimler ve tüm admin arayüzü sadece Türkçe'dir. Admin paneline İngilizce veya Almanca çeviri **YAPILMAZ**.

## Uygulama Detayları

### Public Sayfalar (/, /sectors, /projects, /sponsor, /about, /contact, /impressum, /privacy, /terms)
- **3 dil desteği:** TR (varsayılan), DE, EN
- Varsayılan dil: **Türkçe (TR)**
- i18n altyapısı ile dil değiştirici (language switcher) Header'da yer alacak

### Admin Paneli (/admin/*)
- **Tek dil: Türkçe (TR)**
- Tab isimleri, buton yazıları, form etiketleri, toast mesajları, tablo başlıkları hep Türkçe
- Çoklu dil desteği admin paneline **UYGULANMAZ**

### Legal Sayfalar (/impressum, /privacy, /terms)
- 3 dilde sunulacak (TR, DE, EN)
- Impressum sayfası İsviçre hukuku gereği Almanca versiyonu özellikle önemli

### Header & Footer
- Navigasyon linkleri: aktif dile göre değişir (TR/DE/EN)
- Footer yasal bilgiler: aktif dile göre değişir
- Şirket adı (Aipyram GmbH) ve teknik terimler olduğu gibi kalır

## Dikkat Edilecekler
- Public sayfalarda hardcoded metin kullanılmamalı, tüm metinler i18n key'leri ile yönetilmeli
- Admin panelinde hardcoded Türkçe metin kullanılabilir (i18n gereksiz)
- Teknik terimler (AI, GmbH, GDPR, DSG, Neural Protocol vb.) çevrilmez, olduğu gibi bırakılır
- Tarih formatı: aktif locale'e göre değişir (`tr-TR`, `de-DE`, `en-US`)

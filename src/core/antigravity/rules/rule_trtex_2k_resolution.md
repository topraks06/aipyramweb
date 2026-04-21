---
name: rule_trtex_2k_resolution
description: TRTEX görsel üretimlerinde maksimum 2K çözünürlük kuralı
---

# TRTEX Görsel Çözünürlük Kuralları (KESİN KURAL)

Bu belge, tüm AIPyram otonom ajanları (Aloha ve alt sistemleri) için kesin bir emirdir. Asla esnetilemez.

1. **Çözünürlük Sınırı:** Otonom sistem (Imagen, DALL-E veya herhangi bir üretici), TRTEX için görsel üretirken veya eşleştirirken her zaman görselleri **maksimum 2K (2048x1080 veya dengi 16:9 2K piksel)** olarak sınırlayacaktır.
2. **Gereksiz Yük Yasağı:** 4K, 8K gibi aşırı büyük, maliyetli ve sayfa yüklenme hızını (LCP) olumsuz etkileyecek devasa imaj boyutlarında üretim yapılmayacaktır.
3. **Performans Önceliği:** B2B mimarisinin temel kuralı "Brutalist & Hızlı" olmaktır. 2K çözünürlük, hem profesyonel yüksek kalite illüzyonunu korur hem de GCS (Google Cloud Storage) maliyetlerini optmize eder.

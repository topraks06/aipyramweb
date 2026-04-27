# SKILL: Generative AI Photography (Görsel Üretim)

**Description:** Pollinations.AI API kullanarak "ultra gerçekçi tekstil, fuar ve üretim" fotoğrafları üretme beceresi.
**Assigned Agent Role:** Worker Agent (Visual Design Specialist)

## Directives

1. **Zero Repetition (Eşsizlik Kuralı):** 
    - Görsel çağırmak için bir `seed` (tohum) değeri KESİNLİKLE kullanılmalıdır.
    - Tohum, basit bir uzunluk hesabı ("string.length") gibi aynı veri dönen yöntemlerle oluşturulamaz. 
    - Haberin `slug` veya başlığı ile katman anahtarının (`layer.key`) birleşimi **32-bit Hash Algoritmasına** sokulmalı ve üretilen numara `seed=` parametresine gönderilmelidir. Her haber *Yeminli Formatta* KESİNLİKLE birbirinden farklı resimler içermelidir.
2. **Quality Parameters:** 
    - Bütün promptlar (komutlar) İngilizce olmak ZORUNDADIR.
    - `width=1600&height=900` ve `nologo=true` API sorgusunda zorunludur.
    - Görseller metin (yazı/text) içermemeli, "ultra realistic photography, 8k resolution, highly detailed" ön ekleriyle güçlendirilmelidir.
3. **Verification Policy:**
    - Eğer `gallery_images` dizisi eksik dönerse, Reviewer Agent resmi REDDETMEKLE ve "RETRY" (Yeniden dene) komutu ile işlemi Worker'a yıpratmakla yükümlüdür.

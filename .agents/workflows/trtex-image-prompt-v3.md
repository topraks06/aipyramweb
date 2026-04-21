# TRTEX MASTER PROMPT v3 — LUXURY BRIGHT IMAGE GENERATION

Bu dosya, TRTEX haber görselleri için kullanılan görsel üretim kurallarının **kutsal anayasasıdır**.
imageAgent.ts bu kurallara birebir uymalıdır. Değişiklik yapılmadan önce bu dosya referans alınmalıdır.

---

## TEMEL İLKELER

1. **Ürün tek başına değil** → yaşayan mekan içinde
2. **Perde + koltuk + yatak** → kombin satış mantığı
3. **Işık** → opsiyon değil, zorunlu fizik kuralı
4. **Kamera ayarı** → AI'ye "dergi çekimi" yaptırıyor
5. **"I want to buy this"** → direkt satış psikolojisi

---

## SAHNE SEÇİM MANTIĞI (ÜRÜNE GÖRE)

| Ürün | Sahne |
|------|-------|
| Perde / tül / blackout / drapery | Ultra-bright luxury living room or villa salon with large windows |
| Motorlu perde / ray sistemi / mekanizma | Modern smart home interior or high-end penthouse with wide glass facade |
| Döşemelik / koltuk kumaşı | Designer living room with premium sofa focus |
| Nevresim / yastık / otel tekstili | Luxury hotel suite bedroom (bright, fresh, white dominant) |
| Havlu / banyo tekstili | Luxury hotel bathroom or spa (bright marble, clean, airy) |
| Kumaş teknolojisi / iplik / üretim | Ultra-clean textile laboratory or premium production facility with natural light |
| Fuar / sergi / sektör etkinliği | Maison&Objet style luxury exhibition booth, bright and spacious |
| Dış mekan tekstili / güneşten koruma | Luxury seaside terrace, villa garden, or poolside area with sunlight |
| Bebek / çocuk odası | Ultra-bright luxury nursery with soft pastel curtains, natural wood crib, warm sunlight |
| Dekorasyon / renk trendi / koleksiyon | Scandinavian-inspired luxury living room with colorful textile accents |
| İhracat / pazar / ticaret | Bright luxury textile showroom with premium curtain displays |

---

## SAHNE ROTASYONU

- 40% → Luxury living room / villa salon (curtain-focused)
- 20% → Bedroom / hotel bed setup (bedding-focused)
- 15% → Luxury hotel suite (project & contract feel)
- 10% → International trade fair stand (Maison&Objet style)
- 15% → Outdoor luxury (villa terrace / seaside / garden)

⚠️ Arka arkaya aynı sahne TEKRARLANMAZ.

---

## İNSAN KULLANIMI (SMART RULE)

Sadece %20-25 oranında, doğal ve gerçekçi:
- Elegant woman adjusting curtain
- Family sitting in bright living room
- Mother with baby in soft daylight
- Couple in hotel room

KURALLAR:
- Ultra realistic, NOT AI-looking
- No posing, candid moments
- No direct eye contact
- Natural movement (like film scene)

---

## IŞIK (MUTLAK KURAL)

Flooded with strong natural daylight.
Large floor-to-ceiling windows.
Soft diffused sunlight filling the entire space evenly.

YASAK:
- shadows
- dark areas
- contrast lighting
- moody tones

Sahne hissi: **"sun-filled luxury showroom at noon"**

---

## KAMERA

- Camera: Phase One / Hasselblad
- Lens: 35mm or 50mm
- Aperture: f/4 – f/8
- ISO: 100
- Natural warm white balance
- Ultra sharp, high dynamic range

---

## NEGATIVE PROMPT (MUTLAK YASAK)

dark, moody, low light, shadowy, dramatic lighting, studio black background, night scene, harsh contrast, artificial spotlight, messy, crowded, cheap, amateur, text, watermark, logo, typography, people looking at camera, AI-looking fake faces, plastic skin

---

## TEKNİK NOT

- Imagen API'nin prompt limiti 480 **TOKEN** (≈ 1800 karakter), 480 karakter DEĞİL.
- Prompt `substring(0, 1800)` ile kesilmeli.

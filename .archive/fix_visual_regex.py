import re

filepath = "src/components/tenant-perde/RoomVisualizer.tsx"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# Fix specific broken phrases
replacements = [
    (r"GǬnaydn", "Günaydın"),
    (r"yi GǬnler", "İyi Günler"),
    (r"yi AkYamlar", "İyi Akşamlar"),
    (r"HoY Geldiniz", "Hoş Geldiniz"),
    (r"iin Ǭretim tipini sein", "için üretim tipini seçin"),
    (r"Kullanlacak orǬnler", "Kullanılacak Ürünler"),
    (r" MMAR", "İÇ MİMAR"),
    (r"oRETYOR", "ÜRETİYOR"),
    (r"Daha Fazla orǬn Ekle", "Daha Fazla Ürün Ekle"),
    (r"Tasarmda Kullanlacak orǬnlerinizi Buraya SǬrǬkleyin", "Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin"),
    (r"veya tklayp sein", "veya tıklayıp seçin"),
    (r"TASARIMI BA\?LAT", "TASARIMI BAŞLAT"),
    (r"EklediYiniz ǬrǬnler AI StǬdyo hafzasna \(saY alt panele\) senkronize edilecektir.", "Eklediğiniz ürünler AI Stüdyo hafızasına (sağ alt panele) senkronize edilecektir."),
    (r"Farkl Tasarm Alternatifi", "Farklı Tasarım Alternatifi"),
    (r"Seiminizi 4K zǬnǬrlǬYe \(Upscale\) yǬkseltecektir.", "Seçiminizi 4K Çözünürlüğe (Upscale) yükseltecektir."),
    (r"SEŎLEN TASLAK 4K -ZoNoRLoKTE YENDEN \?LENYOR", "SEÇİLEN TASLAK 4K ÇÖZÜNÜRLÜKTE YENİDEN İŞLENİYOR")
]

for bad, good in replacements:
    text = re.sub(bad, good, text)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("RoomVisualizer specific fixes applied.")

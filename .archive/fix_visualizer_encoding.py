import os
import re

filepath = "src/components/tenant-perde/RoomVisualizer.tsx"

replacements = {
    "Daha Fazla orǬn Ekle": "Daha Fazla Ürün Ekle",
    "Tasarmda Kullanlacak orǬnlerinizi Buraya SǬrǬkleyin": "Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin",
    "TASARIMI BA?LAT": "TASARIMI BAŞLAT",
    "EklediYiniz ǬrǬnler AI StǬdyo": "Eklediğiniz ürünler AI Stüdyo",
    "hafzasna (saY alt panele)": "hafızasına (sağ alt panele)",
    "Farkl Tasarm": "Farklı Tasarım",
    "Seiminizi 4K zǬnǬrlǬYe (Upscale) yǬkseltecektir.": "Seçiminizi 4K Çözünürlüğe (Upscale) yükseltecektir.",
    "SEŎLEN TASLAK 4K -ZoNoRLoKTE YENDEN ?LENYOR (UPSCALE)...": "SEÇİLEN TASLAK 4K ÇÖZÜNÜRLÜKTE YENİDEN İŞLENİYOR (UPSCALE)...",
    "zǬnǬrlǬYe": "Çözünürlüğe",
    "veya tklayp sein": "veya tıklayıp seçin",
    "Ho Geldiniz": "Hoş Geldiniz",
    "Gnaydn": "Günaydın",
    "yi Gnler": "İyi Günler",
    "yi Akamlar": "İyi Akşamlar",
    "ZoNoRLoKTE": "ÇÖZÜNÜRLÜKTE",
    "?LENYOR": "İŞLENİYOR"
}

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

for bad, good in replacements.items():
    content = content.replace(bad, good)

# Fix some more general ones if they still exist
content = content.replace("rn", "ürün")
content = content.replace("orǬn", "ürün")
content = content.replace("Tasarm", "Tasarım")
content = content.replace("sein", "seçin")
content = content.replace("tklay", "tıklay")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("RoomVisualizer encoding fixed.")

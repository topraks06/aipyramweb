import sys

file_path = "src/components/tenant-perde/RoomVisualizer.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Make sure imports are there
if "PERDE_DICT" not in text:
    text = text.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { PERDE_DICT } from './perde-dictionary';\nimport { useSearchParams } from 'next/navigation';")

if "const searchParams" not in text:
    target = "const [historyIndex, setHistoryIndex] = useState(-1);"
    insertion = """  const searchParams = useSearchParams();
  const lang = (searchParams.get('lang') || 'TR').toUpperCase() as keyof typeof PERDE_DICT;
  const T = PERDE_DICT[lang]?.visualizer || PERDE_DICT['TR'].visualizer;"""
    text = text.replace(target, target + "\n" + insertion)

# Replace common texts
text = text.replace("'Geri'", "T.undo || 'Geri'")
text = text.replace("'İleri'", "T.redo || 'İleri'")
text = text.replace("'Hoş Geldiniz!'", "T.welcome || 'Hoş Geldiniz!'")
text = text.replace(">Tasarım Konfigürasyonu<", ">{T.configTitle || 'Tasarım Konfigürasyonu'}<")
text = text.replace("Kredi maliyetini optimize etmek için üretim tipini seçin.", "{T.configDesc || 'Kredi maliyetini optimize etmek için üretim tipini seçin.'}")
text = text.replace(">Resim Tasarla<", ">{T.generateVariations || 'Resim Tasarla'}<")
text = text.replace(">Kullanılacak Ürünler<", ">{T.productsToUse || 'Kullanılacak Ürünler'}<")
text = text.replace("Daha Fazla Ürün Ekle", "{T.addMoreProducts || 'Daha Fazla Ürün Ekle'}")
text = text.replace("Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin", "{T.dragProductsHere || 'Tasarımda Kullanılacak Ürünlerinizi Buraya Sürükleyin'}")
text = text.replace("veya tıklayıp seçin", "{T.orClickToSelect || 'veya tıklayıp seçin'}")
text = text.replace("TASARIMI BAŞLAT", "{T.startRender || 'TASARIMI BAŞLAT'}")
text = text.replace("Eklediğiniz ürünler AI Stüdyo hafızasına (sağ alt panele) senkronize edilecektir.", "{T.syncNote || 'Eklediğiniz ürünler AI Stüdyo hafızasına (sağ alt panele) senkronize edilecektir.'}")
text = text.replace(">Farklı Tasarım Alternatifi<", ">{T.diffVariations || 'Farklı Tasarım Alternatifi'}<")
text = text.replace("Seçiminizi 4K Çözünürlüğe (Upscale) yükseltecektir.", "{T.upscaleNote || 'Seçiminizi 4K Çözünürlüğe (Upscale) yükseltecektir.'}")
text = text.replace("SEÇİLEN TASLAK 4K ÇÖZÜNÜRLÜKTE YENİDEN İŞLENİYOR (UPSCALE)...", "T.upscaling || 'SEÇİLEN TASLAK 4K ÇÖZÜNÜRLÜKTE YENİDEN İŞLENİYOR (UPSCALE)...'")
text = text.replace("İÇ MİMAR (YZ) DETAYLI 4K TASARIMI HAZIRLIYOR...", "T.rendering || 'İÇ MİMAR (YZ) DETAYLI 4K TASARIMI HAZIRLIYOR...'")
text = text.replace("FARKLI KONSEPT (HIZLI TASLAK) ÜRETİYOR...", "- ' + (T.generatingConcepts || 'FARKLI KONSEPT (HIZLI TASLAK) ÜRETİYOR...')")
text = text.replace("RENDER ALINIYOR", "{T.processing || 'RENDER ALINIYOR'}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("RoomVisualizer dict implementation done.")

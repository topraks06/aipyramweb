import sys

file_path = "src/components/tenant-perde/PerdeLandingPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("https://images.unsplash.com/photo-1618220179428-22790b46a013?q=80&w=1000", "/assets/perde.ai/perde.ai (8).jpg")
text = text.replace("https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000", "/assets/perde.ai/perde.ai (9).jpg")
text = text.replace("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000", "/assets/perde.ai/perde.ai (20).jpg")
text = text.replace("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000", "/assets/perde.ai/perde.ai (1).jpg")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Images restored.")

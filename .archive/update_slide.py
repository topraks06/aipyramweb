import sys

file_path = "src/components/tenant-perde/PerdeLandingPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("title: T.howItWorks.s3_title,", "title: T.gallery.c3_title,")
text = text.replace("subtitle: T.howItWorks.s3_desc", "subtitle: T.gallery.c3_desc")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("4th slide updated to Hata Payi Sifir")

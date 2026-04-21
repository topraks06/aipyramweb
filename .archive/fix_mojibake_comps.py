import os
import codecs

def fix_mojibake(file_path):
    if not os.path.exists(file_path):
        return
    with codecs.open(file_path, 'r', 'utf-8', errors='ignore') as f:
        content = f.read()
    
    replacements = {
        "Ã¼": "ü",
        "Ä°": "İ",
        "Ã§": "ç",
        "ÅŸ": "ş",
        "Ä±": "ı",
        "Ã¶": "ö",
        "ÄŸ": "ğ",
        "Åž": "Ş",
        "Ã‡": "Ç"
    }

    for bad, good in replacements.items():
        content = content.replace(bad, good)

    with codecs.open(file_path, 'w', 'utf-8') as f:
        f.write(content)

fix_mojibake("src/components/tenant-perde/EcosystemBridge.tsx")
fix_mojibake("src/components/tenant-perde/UseCasesSection.tsx")
print("Mojibake fixed in EcosystemBridge and UseCasesSection")

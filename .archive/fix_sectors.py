import os
import re

directories = ['src/components', 'messages']

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Translations in TR/EN etc usually appear as "12 Sektörel", "12 sektör", "12 sektörde"
    content = re.sub(r'12(\s+)(sektör|sektörel|sector|dikey)', r'15\1\2', content, flags=re.IGNORECASE)
    
    # 252+, 270+ -> 271+
    # Wait, the user said "251+ domain ismini rakamını 271+ yapmalısın"
    content = re.sub(r'25[0123]\+', '271+', content)
    content = re.sub(r'270\+', '271+', content)
    
    # Sometimes it's written as "252 domain" without the +
    content = re.sub(r'25[0123](\s+)(domain)', r'271\1\2', content, flags=re.IGNORECASE)
    content = re.sub(r'270(\s+)(domain)', r'271\1\2', content, flags=re.IGNORECASE)
    content = re.sub(r'domains:\s*270', 'domains: 271', content)
    
    if 'DigitalAssets.tsx' in file_path:
        content = content.replace('12 ana sektör', '15 ana sektör')
        content = content.replace('270+ DİJİTAL VARLIK', '271+ DİJİTAL VARLIK')
        content = content.replace('270+ ASSETS', '271+ ASSETS')
        content = content.replace('252+ ASSETS', '271+ ASSETS')

    if 'SoftwarePower.tsx' in file_path:
        # { icon: Database, title: t("cap4_title"), description: t("cap4_desc"), stat: "15", statLabel: t("cap4_label") },
        # Wait, if stat is "15", it's already 15? It used to be "12". Let's force it:
        content = content.replace('stat: "12"', 'stat: "15"')

    if 'HeroSection.tsx' in file_path:
        content = content.replace('value: 12, suffix: "", label: "SEKTÖR"', 'value: 15, suffix: "", label: "SEKTÖR"')
        content = content.replace('value: 270, suffix: "+", label: "DİJİTAL VARLIK"', 'value: 271, suffix: "+", label: "DİJİTAL VARLIK"')
        content = content.replace('value: 252, suffix: "+", label: "DİJİTAL VARLIK"', 'value: 271, suffix: "+", label: "DİJİTAL VARLIK"')
        
    if 'SectorCompetencies.tsx' in file_path:
        content = content.replace('12 sektör', '15 sektör')

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {file_path}')

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.json')):
                process_file(os.path.join(root, file))

print('Done processing.')

import os
import re

def clean_coming_soon(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf8') as f:
                    content = f.read()
                
                # Replace title="Çok Yakında"
                new_content = re.sub(r'\s*title="(?:Çok |Pek )?Yakında"', '', content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf8') as f:
                        f.write(new_content)
                    print(f"Cleaned {path}")

clean_coming_soon('src/components/node-perde')
clean_coming_soon('src/components/node-icmimar')

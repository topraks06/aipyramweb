import os
import re

def fix_concierge():
    p = 'src/components/ConciergeWidget.tsx'
    with open(p, 'r', encoding='utf8') as f: c = f.read()
    c = re.sub(r'node="aipyram"', 'node={"aipyram" as any}', c)
    with open(p, 'w', encoding='utf8') as f: f.write(c)
    print("Fixed ConciergeWidget")

def fix_verify(p):
    with open(p, 'r', encoding='utf8') as f: c = f.read()
    c = re.sub(r'rightPanelImage="[^"]*"', '', c)
    c = re.sub(r'rightPanelAuthor="[^"]*"', '', c)
    with open(p, 'w', encoding='utf8') as f: f.write(c)
    print(f"Fixed {p}")

fix_concierge()
fix_verify('src/components/node-icmimar/auth/VerifyEmail.tsx')
fix_verify('src/components/node-perde/auth/VerifyEmail.tsx')

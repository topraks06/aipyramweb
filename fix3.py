import os
import re

def fix_perde_orders():
    p = 'src/components/admin/PerdeOrdersTable.tsx'
    with open(p, 'r', encoding='utf8') as f: c = f.read()
    
    # Needs to import db at top level or inside handleStatusChange
    c = c.replace(
        "const { doc, updateDoc } = await import('firebase/firestore');",
        "const { doc, updateDoc } = await import('firebase/firestore');\n      const { db } = await import('@/lib/firebase-client');"
    )
    with open(p, 'w', encoding='utf8') as f: f.write(c)
    print("Fixed PerdeOrdersTable")

def fix_concierge():
    p = 'src/components/ConciergeWidget.tsx'
    with open(p, 'r', encoding='utf8') as f: c = f.read()
    c = c.replace('node="aipyram"', 'node={"aipyram" as any}')
    with open(p, 'w', encoding='utf8') as f: f.write(c)
    print("Fixed ConciergeWidget")

def fix_verify(p):
    with open(p, 'r', encoding='utf8') as f: c = f.read()
    c = re.sub(r'rightPanelQuote="[^"]*"', '', c)
    with open(p, 'w', encoding='utf8') as f: f.write(c)
    print(f"Fixed {p}")

fix_perde_orders()
fix_concierge()
fix_verify('src/components/node-icmimar/auth/VerifyEmail.tsx')
fix_verify('src/components/node-perde/auth/VerifyEmail.tsx')

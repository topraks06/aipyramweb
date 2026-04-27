import os

def fix_file(path, replacer):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = replacer(content)
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {path}")

def fix_founder(c):
    return c.replace("platform.id", "(platform as any).id")
fix_file("src/components/admin/FounderDashboard.tsx", fix_founder)

def fix_perde_orders(c):
    return c.replace("db.collection", "adminDb.collection")
fix_file("src/components/admin/PerdeOrdersTable.tsx", fix_perde_orders)

def fix_concierge(c):
    return c.replace("node=\"aipyram\"", "node={\"aipyram\" as any}")
fix_file("src/components/ConciergeWidget.tsx", fix_concierge)

def fix_verify_icmimar(c):
    return c.replace("rightPanelQuote=\"\"", " ")
fix_file("src/components/node-icmimar/auth/VerifyEmail.tsx", fix_verify_icmimar)

def fix_verify_perde(c):
    return c.replace("rightPanelQuote=\"\"", " ")
fix_file("src/components/node-perde/auth/VerifyEmail.tsx", fix_verify_perde)

def fix_commercial(c):
    return c.replace("<External ", "<ExternalLink ")
fix_file("src/components/admin/CommercialPanel.tsx", fix_commercial)

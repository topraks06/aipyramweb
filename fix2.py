import os

def replace_in_file(filepath, old_str, new_str):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        print(f"String not found in {filepath}")

# 1. FounderDashboard
replace_in_file(
    "src/components/admin/FounderDashboard.tsx", 
    "platforms.find(p=>p.id", 
    "platforms.find(p=>(p as any).id"
)

# 2. PerdeOrdersTable
replace_in_file(
    "src/components/admin/PerdeOrdersTable.tsx",
    "db.collection",
    "adminDb.collection"
)

# 3. ConciergeWidget
replace_in_file(
    "src/components/ConciergeWidget.tsx",
    "node=\"aipyram\"",
    "node={\"aipyram\" as any}"
)

# 4. VerifyEmail (icmimar)
replace_in_file(
    "src/components/node-icmimar/auth/VerifyEmail.tsx",
    "rightPanelQuote=\"\" rightPanelImage=\"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000\"",
    "rightPanelImage=\"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000\""
)

# 5. VerifyEmail (perde)
replace_in_file(
    "src/components/node-perde/auth/VerifyEmail.tsx",
    "rightPanelQuote=\"\" rightPanelImage=\"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000\"",
    "rightPanelImage=\"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000\""
)

# 6. CommercialPanel
replace_in_file(
    "src/components/admin/CommercialPanel.tsx",
    "<ExternalLink ",
    "<ExternalLink "
) # I fixed this earlier manually! Wait, the error is Cannot find name 'ExternalLink'. Did you mean 'External'?
# That means it IS using ExternalLink, but it's NOT imported properly.
# Oh! My previous string replacement in CommercialPanel.tsx replaced "type LucideIcon" with "ExternalLink, type LucideIcon"!

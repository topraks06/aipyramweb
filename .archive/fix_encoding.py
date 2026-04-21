import os

def fix_mojibake_line(line):
    """Try to fix double-encoded UTF-8 on a per-line basis."""
    try:
        # Try cp1252 (Windows-1252) which is a superset of Latin-1
        fixed = line.encode('cp1252').decode('utf-8')
        return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass
    try:
        fixed = line.encode('latin-1').decode('utf-8')
        return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass
    return line  # Return original if can't fix

def fix_file(filepath):
    """Fix double-encoded UTF-8 in a file, line by line."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_count = 0
    new_lines = []
    for i, line in enumerate(lines):
        fixed = fix_mojibake_line(line)
        if fixed != line:
            fixed_count += 1
            print(f"  Line {i+1}: FIXED")
            # Show before/after for first few
            if fixed_count <= 3:
                print(f"    BEFORE: {line.strip()[:80]}")
                print(f"    AFTER:  {fixed.strip()[:80]}")
        new_lines.append(fixed)
    
    if fixed_count > 0:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.writelines(new_lines)
        print(f"  Total: {fixed_count} lines fixed in {filepath}")
    else:
        print(f"  No fixable mojibake found in {filepath}")
    return fixed_count

files_to_fix = [
    'src/components/tenant-perde/PerdeAIAssistant.tsx',
    'src/components/tenant-perde/MyProjects.tsx',
    'src/components/tenant-perde/RoomVisualizer.tsx',
    'src/components/tenant-perde/PerdeNavbar.tsx',
    'src/components/tenant-perde/PerdeFooter.tsx',
]

print("=== Fixing mojibake (line-by-line) ===")
total = 0
for f in files_to_fix:
    if os.path.exists(f):
        print(f"\nProcessing: {f}")
        total += fix_file(f)
    else:
        print(f"  File not found: {f}")
print(f"\n=== Done: {total} total lines fixed ===")

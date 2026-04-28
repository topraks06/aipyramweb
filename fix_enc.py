import sys

with open('src/components/node-icmimar/RoomVisualizer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'ÅŸ': 'ş',
    'Ä°': 'İ',
    'Ä±': 'ı',
    'Ã§': 'ç',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'Ã–': 'Ö',
    'Ã‡': 'Ç',
    'Ãœ': 'Ü',
    'ÄŸ': 'ğ',
    'â€“': '-',
    'â€”': '-',
    'Ã¢': 'â',
    'â€™': "'",
    'ğŸ”„': '🔄'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/components/node-icmimar/RoomVisualizer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

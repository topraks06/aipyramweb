import codecs

path = 'src/components/tenant-perde/MyProjects.tsx'
with codecs.open(path, 'r', 'utf-8', errors='ignore') as f:
    content = f.read()

bad = "Åžu geÃ§miÅŸ projemi tekrar dÃ¼zenlemek istiyorum:"
good = "Şu geçmiş projemi tekrar düzenlemek istiyorum:"
content = content.replace(bad, good)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Encoding fixed in MyProjects")

import sys

file_path = "src/components/tenant-perde/PerdeLandingPage.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

old_slides = """  const HERO_SLIDES = [
    {
      image: "/assets/perde.ai/perde.ai (1).jpg",
      title: T.hero.title,
      subtitle: T.hero.subtitle
    },
    {
      image: "https://images.unsplash.com/photo-1609115049363-228ae44e4513?q=80&w=2000",
      title: T.gallery.c1_title,
      subtitle: T.gallery.c1_desc
    },
    {
      image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000",
      title: T.howItWorks.s3_title,
      subtitle: T.howItWorks.s3_desc
    }
  ];"""

new_slides = """  const HERO_SLIDES = [
    {
      image: "/assets/perde.ai/perde.ai (10).jpg",
      title: T.hero.title,
      subtitle: T.hero.subtitle
    },
    {
      image: "/assets/perde.ai/perde.ai (13).jpg",
      title: T.gallery.c1_title,
      subtitle: T.gallery.c1_desc
    },
    {
      image: "/assets/perde.ai/perde.ai 204.jpg",
      title: T.gallery.c2_title,
      subtitle: T.gallery.c2_desc
    },
    {
      image: "/assets/perde.ai/perde.ai (18).jpg",
      title: T.howItWorks.s3_title,
      subtitle: T.howItWorks.s3_desc
    }
  ];"""

if old_slides in text:
    text = text.replace(old_slides, new_slides)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Replaced HEROSLIDES correctly")
else:
    print("Could not find old HEROSLIDES block")

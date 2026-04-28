export default function HeimtexFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-500 py-12 text-center border-t border-zinc-900 text-sm">
      <p className="uppercase tracking-widest mb-4 font-serif text-zinc-300">Heimtex.ai</p>
      <p>&copy; {new Date().getFullYear()} AIPyram Ecosystem. All rights reserved.</p>
    </footer>
  );
}

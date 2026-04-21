
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <div className="w-20 h-20 bg-[#1E3A5F]/8 border border-[#1E3A5F]/20 rounded-sm flex items-center justify-center mx-auto mb-8">
          <span className="font-bold text-3xl text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>H</span>
        </div>

        <div className="text-8xl font-black text-[#1E3A5F] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
          404
        </div>

        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
          Sayfa Bulunamadı
        </h2>
        <p className="text-slate-400 mb-2 text-sm">Page Not Found</p>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.<br />
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { href: '/', label: 'Ana Sayfa' },
            { href: '/fair', label: 'Sanal Fuar' },
            { href: '/collections', label: 'Koleksiyonlar' },
            { href: '/suppliers', label: 'Tedarikçiler' },
            { href: '/showrooms', label: 'Standlar' },
            { href: '/categories', label: 'Kategoriler' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-slate-200 hover:border-[#B8922A]/40 hover:bg-[#B8922A]/5 text-slate-500 hover:text-[#1E3A5F] rounded-sm px-4 py-3 text-sm font-medium transition-all text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 btn-navy px-10 py-3 rounded-sm font-bold text-white transition-all"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

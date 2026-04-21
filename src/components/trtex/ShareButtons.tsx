/**
 * TRTEX PAYLAŞIM BUTONLARI — WhatsApp + LinkedIn + Twitter
 * Haber detay sayfası altına eklenir.
 */
'use client';

const shareLabels: Record<string, string> = {
  tr: 'PAYLAŞ', en: 'SHARE', de: 'TEILEN', ru: 'ПОДЕЛИТЬСЯ',
  zh: '分享', ar: 'مشاركة', es: 'COMPARTIR', fr: 'PARTAGER',
};

interface ShareButtonsProps {
  title: string;
  url: string;
  lang?: string;
}

export default function ShareButtons({ title, url, lang = 'tr' }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      name: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      bg: '#25D366',
    },
    {
      name: 'LinkedIn',
      icon: '🔗',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: '#0A66C2',
    },
    {
      name: 'X',
      icon: '𝕏',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: '#000',
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      margin: '2rem 0', padding: '1.25rem 0',
      borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
    }}>
      <span style={{
        fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px',
        color: '#999', textTransform: 'uppercase',
      }}>
        {shareLabels[lang] || 'SHARE'}
      </span>
      {channels.map(ch => (
        <a
          key={ch.name}
          href={ch.href}
          target="_blank"
          rel="noopener noreferrer"
          title={ch.name}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '4px',
            background: ch.bg, color: '#fff', textDecoration: 'none',
            fontSize: '1rem', transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {ch.icon}
        </a>
      ))}
    </div>
  );
}

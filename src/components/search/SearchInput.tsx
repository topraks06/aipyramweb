'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/i18n/labels';

export default function SearchInput({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q');
    if (query && typeof query === 'string' && query.trim() !== '') {
      // TRTEX uses query strings for lang: ?lang=tr&q=query
      router.push(`/news?lang=${lang}&q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/news?lang=${lang}`);
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
      <input
        name="q"
        type="text"
        defaultValue={searchParams.get('q') || ''}
        placeholder={t('searchPlaceholder', lang) || "Ara..."}
        style={{
          width: '100%',
          background: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '50px',
          padding: '0.5rem 1rem',
          paddingRight: '2.5rem',
          fontSize: '0.85rem',
          color: '#111',
          outline: 'none',
          fontFamily: 'inherit'
        }}
      />
      <button 
        type="submit" 
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.6
        }}
      >
        🔍
      </button>
    </form>
  );
}

import Link from 'next/link';

export default function Breadcrumbs({ items, lang }: { items: { label: string, href?: string }[], lang: string }) {
  return (
    <nav style={{ display: 'flex', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '1.5rem', whiteSpace: 'nowrap', overflowX: 'auto' }}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          {item.href ? (
            <Link 
              href={item.href} 
              style={{ textDecoration: 'none', color: '#6B7280', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#111'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#111', fontWeight: 800 }}>{item.label}</span>
          )}
          {index < items.length - 1 && <span style={{ margin: '0 0.5rem', color: '#D1D5DB' }}>/</span>}
        </div>
      ))}
    </nav>
  );
}

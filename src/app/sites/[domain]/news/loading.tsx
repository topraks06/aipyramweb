import React from 'react';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar Placeholder */}
      <div style={{ height: '80px', width: '100%', background: '#111' }}></div>
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '4px solid #E5E7EB', paddingBottom: '0.5rem' }}>
          <div>
            <div style={{ height: '40px', width: '250px', background: '#E5E7EB', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '16px', width: '150px', background: '#F3F4F6', borderRadius: '4px' }}></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

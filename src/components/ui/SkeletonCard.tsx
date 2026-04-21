export default function SkeletonCard() {
  return (
    <div style={{
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '1.5rem',
      background: '#FFF',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minHeight: '300px'
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer-bg {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
          background-size: 1000px 100%;
        }
      `}</style>
      <div className="shimmer-bg" style={{ height: '160px', width: '100%', borderRadius: '4px' }}></div>
      <div className="shimmer-bg" style={{ height: '24px', width: '80%', borderRadius: '4px' }}></div>
      <div className="shimmer-bg" style={{ height: '16px', width: '60%', borderRadius: '4px' }}></div>
      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
        <div className="shimmer-bg" style={{ height: '20px', width: '40px', borderRadius: '4px' }}></div>
        <div className="shimmer-bg" style={{ height: '20px', width: '60px', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

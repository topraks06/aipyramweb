'use client';

import React, { useState, useCallback, useEffect } from 'react';

/**
 * TRTEX Article Image — Tıklanabilir görsel + Lightbox
 * 
 * Kullanım:
 *   <ArticleImage src={url} alt="..." caption="..." seoName="perde-turkiye-2026" />
 * 
 * Tıklanınca tam ekran açılır, ESC veya dış tıklama ile kapanır.
 */

interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
  seoName?: string;
  variant?: 'hero' | 'inline';  // hero = full-width, inline = gövde içi
}

export function ArticleImage({ src, alt, caption, seoName, variant = 'inline' }: ArticleImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!src || !src.startsWith('http')) return null;

  const isHero = variant === 'hero';

  return (
    <>
      {/* Görsel */}
      <figure
        style={{
          margin: isHero ? '0 0 2.5rem 0' : '2.5rem 0',
          cursor: 'zoom-in',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          background: '#F9FAFB',
        }}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Görseli büyüt: ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading={isHero ? 'eager' : 'lazy'}
          style={{
            width: '100%',
            height: isHero ? 'auto' : 'auto',
            maxHeight: isHero ? '560px' : '420px',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        {/* Zoom icon overlay */}
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
          padding: '6px 10px', color: '#fff', fontSize: '0.7rem',
          letterSpacing: '1px', fontWeight: 600,
          pointerEvents: 'none', backdropFilter: 'blur(4px)',
        }}>
          🔍 BÜYÜT
        </div>
      </figure>

      {/* Caption + SEO filename */}
      {(caption || seoName) && (
        <figcaption style={{
          marginTop: '-2rem', marginBottom: '2rem',
          padding: '0.5rem 0',
          fontSize: '0.75rem', color: '#6B7280',
          fontStyle: 'italic', lineHeight: 1.5,
          borderBottom: '1px solid #F3F4F6',
        }}>
          {caption && <span>{caption}</span>}
          {seoName && (
            <span style={{
              display: 'block', fontSize: '0.65rem',
              color: '#9CA3AF', fontFamily: 'monospace',
              marginTop: '2px',
            }}>
              📷 {seoName}
            </span>
          )}
        </figcaption>
      )}

      {/* Lightbox Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            aria-label="Kapat"
          >
            ✕
          </button>

          {/* Full-size image */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '4px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'scaleIn 0.3s ease-out',
              cursor: 'default',
            }}
          />

          {/* Caption in lightbox */}
          {caption && (
            <div style={{
              position: 'absolute', bottom: '24px',
              color: '#ccc', fontSize: '0.85rem',
              textAlign: 'center', maxWidth: '80vw',
              background: 'rgba(0,0,0,0.6)',
              padding: '8px 20px', borderRadius: '6px',
              backdropFilter: 'blur(8px)',
            }}>
              {caption}
            </div>
          )}

          {/* Animations */}
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}
    </>
  );
}

/**
 * Haber içeriğini bölümlere ayırarak arasına görsel yerleştiren yardımcı.
 * 
 * İçeriği <h2> etiketlerinden böler ve arasına görselleri serpiştirir.
 */
export function splitContentForImages(htmlContent: string, imageCount: number): string[] {
  if (!htmlContent || imageCount <= 0) return [htmlContent];
  
  // İçeriği H2'lerden böl
  const parts = htmlContent.split(/(?=<h2)/i);
  
  if (parts.length <= 2) {
    // H2 az ise ortadan böl
    const midPoint = Math.floor(htmlContent.length / 2);
    // En yakın </p> tag'ını bul
    const closestP = htmlContent.indexOf('</p>', midPoint);
    if (closestP > -1 && closestP < midPoint + 500) {
      return [
        htmlContent.substring(0, closestP + 4),
        htmlContent.substring(closestP + 4),
      ];
    }
    return [htmlContent];
  }

  // H2'lerden eşit bölümlere ayır
  const chunkSize = Math.ceil(parts.length / (imageCount + 1));
  const sections: string[] = [];
  for (let i = 0; i < parts.length; i += chunkSize) {
    sections.push(parts.slice(i, i + chunkSize).join(''));
  }
  return sections;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getNodeUrl(node: "perde" | "trtex" | "hometex" | "vorhang" | "icmimar") {
  const isLocal = typeof window !== "undefined" 
    ? window.location.hostname.includes("localhost")
    : process.env.NODE_ENV === "development";

  if (isLocal) return `http://${node}.localhost:3000`;
  if (node === "trtex") return "https://trtex.com";
  return `https://${node}.ai`;
}

export function generateHreflang(exactDomain: string, path: string) {
  const baseUrl = `https://${exactDomain}${path}`;
  return {
    canonical: baseUrl,
    languages: {
      'tr': baseUrl,
      'en': `${baseUrl}?lang=en`,
      'de': `${baseUrl}?lang=de`,
      'ru': `${baseUrl}?lang=ru`,
      'zh': `${baseUrl}?lang=zh`,
      'ar': `${baseUrl}?lang=ar`,
      'es': `${baseUrl}?lang=es`,
      'fr': `${baseUrl}?lang=fr`,
      'x-default': baseUrl
    }
  };
}

export const TRTEX_FALLBACK_IMAGES = [
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/mena-luks-konut-projeleri-premium-perde--trend-color-2026-1.jpg',
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-otel-projele-curtain-blackout-2026-1.jpg',
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-konaklamada--curtain-blackout-2026-1.jpg',
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/mena-luks-konut-projeleri-premium-perde--trend-color-2026-2.jpg',
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-otel-projele-curtain-blackout-2026-2.jpg',
  'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-konaklamada--curtain-blackout-2026-2.jpg'
];

export function getFallbackImage(id: string) {
  if (!id) return TRTEX_FALLBACK_IMAGES[0];
  const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TRTEX_FALLBACK_IMAGES[sum % TRTEX_FALLBACK_IMAGES.length];
}

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

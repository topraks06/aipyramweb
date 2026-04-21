"use client";

// Aipyram — GlobalClientEffects
// Eski Perde.ai service worker'ını temizler ve Aipyram SW'sini yükler

import { useEffect } from "react";

export default function GlobalClientEffects() {
  useEffect(() => {
    // Eski service worker'ları temizle ve yeni Aipyram SW'sini kaydet
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      // Temiz Aipyram SW'sini kaydet (tüm cache'leri temizler)
      navigator.serviceWorker.register("/sw.js").catch(() => { });
    }
  }, []);

  return null;
}

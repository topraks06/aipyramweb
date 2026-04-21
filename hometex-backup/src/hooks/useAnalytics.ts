
import { useCallback } from 'react';

interface TrackEventParams {
  action_type: string;
  page_type: string;
  page_id?: number;
  page_slug?: string;
  action_data?: Record<string, any>;
  language_used?: string;
}

export function useAnalytics() {
  const track = useCallback(async (params: TrackEventParams) => {
    try {
      const visitorId = typeof window !== 'undefined'
        ? (localStorage.getItem('hometex_vid') || (() => {
            const id = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            localStorage.setItem('hometex_vid', id);
            return id;
          })())
        : null;

      await fetch('/next_api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          visitor_id: visitorId,
          domain_key: 'hometex',
          referrer_url: typeof window !== 'undefined' ? document.referrer : null,
          device_type: typeof window !== 'undefined'
            ? (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop')
            : null,
        }),
      });
    } catch {
      // Silent fail — analytics should never break UX
    }
  }, []);

  return { track };
}

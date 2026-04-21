"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useZoerIframe(): { disableZoerCopilot: boolean } {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [disableZoerCopilot, setDisableZoerCopilot] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      setDisableZoerCopilot(window.name === "zoer-page-preview-iframe");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav: any = (window as any).navigation;
    if (nav && typeof nav.canGoBack === "boolean") {
      setCanGoBack(!!nav.canGoBack);
      setCanGoForward(!!nav.canGoForward);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data;
      if (!data || typeof data !== "object") return;

      const messageType = (data as { type?: string }).type;
      if (messageType === "back") {
        router.back();
      } else if (messageType === "forward") {
        router.forward();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = window.location.href;
    (window.parent as any)?.postMessage?.(
      { type: "navigationState", url, canGoBack, canGoForward },
      "*"
    );
  }, [pathname, searchParams, canGoBack, canGoForward]);

  return { disableZoerCopilot };
}

export default useZoerIframe;

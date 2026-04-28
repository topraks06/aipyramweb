"use client";
import { useEffect } from "react";

export default function HeimtexClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Analytics or client-side init for Heimtex
    document.title = "Heimtex.ai | The Future of Textile Design";
  }, []);

  return <div className="heimtex-node-root">{children}</div>;
}

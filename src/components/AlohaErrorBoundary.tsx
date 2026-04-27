'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AlohaErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Aloha OS UI Hatası Yakalandı:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 border border-red-200 rounded-lg max-w-lg mx-auto my-4 text-center">
          <span className="text-4xl mb-4">🤖</span>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Sistem Hatası (Aloha Fallback)</h2>
          <p className="text-zinc-500 text-sm mb-4">
            {this.props.fallbackMessage || "Bu bileşen geçici olarak devre dışı bırakıldı. Otonom sistem hatayı kaydetti ve onarıyor."}
          </p>
          <button
            className="px-4 py-2 bg-zinc-900 text-white rounded text-xs tracking-wider uppercase hover:bg-zinc-800"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Bileşeni Yeniden Yükle
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

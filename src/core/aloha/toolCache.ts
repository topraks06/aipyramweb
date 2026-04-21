export class ToolCache {
  private cache: Map<string, { result: string; timestamp: number }>;
  private defaultTTL: number = 5 * 60 * 1000; // 5 dakika

  constructor() {
    this.cache = new Map();
  }

  // Özel parametrelerle cache anahtarı oluştur (isim + argümanlar pürüzsüzleştirilir)
  private createKey(toolName: string, args: Record<string, any>): string {
    return `${toolName}_${JSON.stringify(args, Object.keys(args).sort())}`;
  }

  public get(toolName: string, args: Record<string, any>, ttl?: number): string | null {
    const key = this.createKey(toolName, args);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const maxAge = ttl || this.defaultTTL;
    if (Date.now() - entry.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  public set(toolName: string, args: Record<string, any>, result: string): void {
    const key = this.createKey(toolName, args);
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  public clear(): void {
    this.cache.clear();
  }
}

// Global instance 
export const alohaToolCache = new ToolCache();

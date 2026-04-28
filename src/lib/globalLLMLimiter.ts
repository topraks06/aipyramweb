// ==========================================
// aipyram OS - GOOGLE GEN AI LIMITER (THROTTLE)
// ==========================================
// Ajanlar saniyede yüzlerce istek atarsa API limitlerine takılırız.
// Bu sınıf sistem çapında eşzamanlı LLM çağrılarını kuyruklar.

class AsyncSemaphore {
  private count: number;
  private queue: Array<() => void>;

  constructor(concurrency: number) {
    this.count = concurrency;
    this.queue = [];
  }

  async acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.count++;
    }
  }
}

// Global olarak maksimum X adet LLM (Gemini) API çağrısına aynı anda izin verilir.
export const globalLLMLimiter = new AsyncSemaphore(5);

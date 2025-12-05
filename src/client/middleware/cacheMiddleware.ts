
// ============================================================================
// CACHE MIDDLEWARE
// Path: src/client/middleware/cacheMiddleware.ts
// ============================================================================

interface CacheItem<T> {
  data: T;
  expiry: number;
}

export class CacheMiddleware {
  private static instance: CacheMiddleware;
  private cache = new Map<string, CacheItem<any>>();

  private constructor() {}

  static getInstance(): CacheMiddleware {
    if (!this.instance) {
      this.instance = new CacheMiddleware();
    }
    return this.instance;
  }

  async execute<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = 30000): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    if (cached && cached.expiry > now) {
      // Return cached data
      return cached.data;
    }

    // Cache miss or expired
    try {
      const data = await fetcher();
      this.cache.set(key, { data, expiry: now + ttlMs });
      return data;
    } catch (error) {
      throw error;
    }
  }

  invalidate(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

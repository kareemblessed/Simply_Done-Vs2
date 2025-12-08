
// ============================================================================
// CACHE MIDDLEWARE
// Path: src/client/middleware/cacheMiddleware.ts
// ============================================================================

import { CacheEntry } from '../../shared/types/task.types';

// Simple in-memory client cache
class CacheMiddleware {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 30000; // 30 seconds for client cache

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    };
    this.cache.set(key, entry);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Helper to invalidate lists when an item changes
  invalidateAll(): void {
    this.cache.clear();
  }
}

export const cacheMiddleware = new CacheMiddleware();

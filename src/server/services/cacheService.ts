
// ============================================================================
// CACHE SERVICE
// Path: src/server/services/cacheService.ts
// ============================================================================

import { db } from '../db/jsonDatabase';
import { CacheEntry } from '../../shared/types/task.types';

export const cacheService = {
  
  get<T>(key: string): T | null {
    const all = db.readCache();
    const entry = all.find(e => e.key === key);
    
    if (!entry) return null;
    
    // Check Expiry
    if (entry.expiresAt < Date.now()) {
      this.delete(key);
      return null;
    }
    
    return entry.value as T;
  },

  set(key: string, value: any, ttlMs: number = 60000): void {
    const all = db.readCache().filter(e => e.key !== key); // Remove existing
    const newEntry: CacheEntry = {
      key,
      value,
      expiresAt: Date.now() + ttlMs
    };
    all.push(newEntry);
    db.writeCache(all);
  },

  delete(key: string): void {
    const all = db.readCache().filter(e => e.key !== key);
    db.writeCache(all);
  },

  invalidate(keyPattern: string): void {
    const all = db.readCache().filter(e => !e.key.includes(keyPattern));
    db.writeCache(all);
  },

  flush(): void {
    db.writeCache([]);
  },

  // Helper to memoize function calls
  async memoize<T>(key: string, fn: () => Promise<T> | T, ttlMs: number = 60000): Promise<T> {
    const cached = this.get(key) as T | null;
    if (cached) return cached;
    
    const result = await fn();
    this.set(key, result, ttlMs);
    return result;
  }
};

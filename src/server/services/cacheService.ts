
// ============================================================================
// CACHE SERVICE
// Path: src/server/services/cacheService.ts
// ============================================================================

import { CacheEntry, CacheConfig } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig = {
    ttl: 60 * 1000, // 1 minute default TTL
    maxSize: 100,
    enabled: true
  };

  constructor() {
    this.cache = new Map();
    this.loadFromDB();
  }

  private loadFromDB() {
    const entries = db.readCache();
    const now = Date.now();
    entries.forEach(entry => {
      if (entry.expiresAt > now) {
        this.cache.set(entry.key, entry);
      }
    });
  }

  private persist() {
    const entries = Array.from(this.cache.values());
    db.writeCache(entries);
  }

  getConfig(): CacheConfig {
    return this.config;
  }

  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.persist();
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, customTTL?: number): void {
    if (!this.config.enabled) return;

    // Eviction if full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const ttl = customTTL ?? this.config.ttl;
    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    };

    this.cache.set(key, entry);
    this.persist();
  }

  invalidate(key: string): void {
    if (this.cache.delete(key)) {
      this.persist();
    }
  }

  invalidatePattern(pattern: string): void {
    let changed = false;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  flush(): void {
    this.cache.clear();
    this.persist();
  }
}

export const cacheService = new CacheService();

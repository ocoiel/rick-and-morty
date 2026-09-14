import type { CacheStore } from '../../application/ports/index.js';

interface CacheEntry {
  readonly value: unknown;
  readonly expiresAt: number;
}

export interface InMemoryCacheStoreOptions {
  readonly maxEntries?: number;
  readonly now?: () => number;
}

export class InMemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(options: InMemoryCacheStoreOptions = {}) {
    this.maxEntries = options.maxEntries ?? 128;
    this.now = options.now ?? Date.now;
  }

  get<T>(key: string): Promise<T | undefined> {
    const entry = this.entries.get(key);

    if (!entry) return Promise.resolve(undefined);

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return Promise.resolve(undefined);
    }

    this.entries.delete(key);
    this.entries.set(key, entry);

    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) this.entries.delete(oldestKey);
    }

    this.entries.set(key, { value, expiresAt: this.now() + ttlMs });

    return Promise.resolve();
  }

  get size(): number {
    return this.entries.size;
  }
}

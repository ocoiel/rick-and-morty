import type { CacheStore } from '../../application/ports/index.ts';

export class NoOpCacheStore implements CacheStore {
  get<T>(_key: string): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  set<T>(_key: string, _value: T, _ttlMs: number): Promise<void> {
    return Promise.resolve();
  }
}

import type { CacheStore } from '../../application/ports/index.js';

export class NoOpCacheStore implements CacheStore {
  get<T>(): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  set(): Promise<void> {
    return Promise.resolve();
  }
}

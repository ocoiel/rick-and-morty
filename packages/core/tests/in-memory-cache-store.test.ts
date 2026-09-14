import { describe, expect, it } from 'vitest';
import { InMemoryCacheStore } from '../src/index.ts';

describe('InMemoryCacheStore', () => {
  it('devolve undefined para chave ausente', async () => {
    const cache = new InMemoryCacheStore();

    await expect(cache.get('ausente')).resolves.toBeUndefined();
  });

  it('armazena e recupera valores', async () => {
    const cache = new InMemoryCacheStore();

    await cache.set('chave', { valor: 42 }, 1000);

    await expect(cache.get('chave')).resolves.toEqual({ valor: 42 });
  });

  it('expira entradas após o TTL', async () => {
    let now = 0;
    const cache = new InMemoryCacheStore({ now: () => now });

    await cache.set('chave', 'valor', 1000);
    now = 999;
    await expect(cache.get('chave')).resolves.toBe('valor');

    now = 1000;
    await expect(cache.get('chave')).resolves.toBeUndefined();
  });

  it('remove a entrada expirada da memória', async () => {
    let now = 0;
    const cache = new InMemoryCacheStore({ now: () => now });

    await cache.set('chave', 'valor', 100);
    now = 200;
    await cache.get('chave');

    expect(cache.size).toBe(0);
  });

  it('descarta a entrada menos recentemente usada ao atingir o limite', async () => {
    const cache = new InMemoryCacheStore({ maxEntries: 2 });

    await cache.set('a', 1, 10_000);
    await cache.set('b', 2, 10_000);
    await cache.get('a');
    await cache.set('c', 3, 10_000);

    expect(cache.size).toBe(2);
    await expect(cache.get('b')).resolves.toBeUndefined();
    await expect(cache.get('a')).resolves.toBe(1);
    await expect(cache.get('c')).resolves.toBe(3);
  });

  it('sobrescrever chave existente não provoca despejo', async () => {
    const cache = new InMemoryCacheStore({ maxEntries: 2 });

    await cache.set('a', 1, 10_000);
    await cache.set('b', 2, 10_000);
    await cache.set('a', 99, 10_000);

    expect(cache.size).toBe(2);
    await expect(cache.get('a')).resolves.toBe(99);
    await expect(cache.get('b')).resolves.toBe(2);
  });
});

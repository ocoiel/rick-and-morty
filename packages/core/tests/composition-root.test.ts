import { describe, expect, it, vi } from 'vitest';
import {
  createContainer,
  GetEpisodeCastUseCase,
  InMemoryCacheStore,
  NoOpCacheStore,
  RickAndMortyHttpGateway,
} from '../src/index.ts';
import { InMemoryEpisodeGateway, makeCharacter, makeEpisodeRecord } from '../src/testing/index.ts';

function buildFakeGateway() {
  return new InMemoryEpisodeGateway({
    episodes: [makeEpisodeRecord({ number: 1, characterIds: [1] })],
    characters: [makeCharacter({ id: 1, name: 'Rick Sanchez' })],
  });
}

describe('createContainer', () => {
  it('monta o gateway HTTP e o cache em memória por padrão', () => {
    const container = createContainer();

    expect(container.episodeGateway).toBeInstanceOf(RickAndMortyHttpGateway);
    expect(container.cacheStore).toBeInstanceOf(InMemoryCacheStore);
    expect(container.getEpisodeCast).toBeInstanceOf(GetEpisodeCastUseCase);
  });

  it('substitui o cache por no-op quando desabilitado', () => {
    const container = createContainer({ cacheEnabled: false });

    expect(container.cacheStore).toBeInstanceOf(NoOpCacheStore);
  });

  it('aceita implementações injetadas das portas', () => {
    const episodeGateway = buildFakeGateway();
    const cacheStore = new InMemoryCacheStore();

    const container = createContainer({ episodeGateway, cacheStore });

    expect(container.episodeGateway).toBe(episodeGateway);
    expect(container.cacheStore).toBe(cacheStore);
  });

  it('entrega um caso de uso funcional ponta a ponta com dublês', async () => {
    const container = createContainer({ episodeGateway: buildFakeGateway() });

    const result = await container.getEpisodeCast.execute({ episode: 1 });

    expect(result.characters.map((character) => character.name)).toEqual(['Rick Sanchez']);
  });

  it('expõe a listagem de episódios para geração estática', async () => {
    const container = createContainer({ episodeGateway: buildFakeGateway() });

    await expect(container.listEpisodeNumbers.execute()).resolves.toEqual([1]);
  });

  it('repassa a configuração de rede para o gateway HTTP', async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ info: { count: 2, pages: 1 } }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );

    const container = createContainer({
      apiBaseUrl: 'https://custom.test/api',
      timeoutMs: 250,
      retries: 0,
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await container.listEpisodeNumbers.execute();

    expect(fetchFn).toHaveBeenCalledWith('https://custom.test/api/episode', expect.anything());
  });

  it('cache no-op nunca retém valores', async () => {
    const cache = new NoOpCacheStore();

    await cache.set('chave', 'valor', 1000);

    await expect(cache.get('chave')).resolves.toBeUndefined();
  });
});

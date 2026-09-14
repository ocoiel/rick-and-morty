import { beforeEach, describe, expect, it } from 'vitest';
import {
  EpisodeNotFoundError,
  GetEpisodeCastUseCase,
  InMemoryCacheStore,
  InvalidEpisodeNumberError,
  NoOpCacheStore,
} from '../src/index.ts';
import { InMemoryEpisodeGateway, makeCharacter, makeEpisodeRecord } from '../src/testing/index.ts';

const characters = [
  makeCharacter({ id: 1, name: 'Rick Sanchez' }),
  makeCharacter({ id: 2, name: 'Morty Smith' }),
  makeCharacter({ id: 35, name: 'Beth Smith' }),
];

function buildGateway() {
  return new InMemoryEpisodeGateway({
    episodes: [
      makeEpisodeRecord({ number: 1, characterIds: [1, 2, 35] }),
      makeEpisodeRecord({ number: 2, name: 'Lawnmower Dog', characterIds: [] }),
    ],
    characters,
  });
}

describe('GetEpisodeCastUseCase', () => {
  let gateway: InMemoryEpisodeGateway;
  let cache: InMemoryCacheStore;
  let useCase: GetEpisodeCastUseCase;

  beforeEach(() => {
    gateway = buildGateway();
    cache = new InMemoryCacheStore();
    useCase = new GetEpisodeCastUseCase(gateway, cache);
  });

  it('devolve o elenco ordenado alfabeticamente', async () => {
    const result = await useCase.execute({ episode: 1 });

    expect(result.characters.map((character) => character.name)).toEqual([
      'Beth Smith',
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });

  it('devolve os metadados do episódio', async () => {
    const result = await useCase.execute({ episode: 1 });

    expect(result.episode).toEqual({
      number: 1,
      name: 'Pilot',
      code: 'S01E01',
      airDate: 'December 2, 2013',
    });
    expect(result.meta).toEqual({ total: 3, source: 'origin' });
  });

  it('busca todo o elenco em uma única chamada em lote', async () => {
    await useCase.execute({ episode: 1 });

    expect(gateway.calls.findCharactersByIds).toBe(1);
  });

  it('não consulta personagens quando o episódio não tem elenco', async () => {
    const result = await useCase.execute({ episode: 2 });

    expect(gateway.calls.findCharactersByIds).toBe(0);
    expect(result.characters).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('serve a segunda chamada a partir do cache, sem tocar na origem', async () => {
    await useCase.execute({ episode: 1 });
    const cached = await useCase.execute({ episode: 1 });

    expect(gateway.calls.findEpisode).toBe(1);
    expect(cached.meta.source).toBe('cache');
    expect(cached.characters.map((character) => character.name)).toEqual([
      'Beth Smith',
      'Morty Smith',
      'Rick Sanchez',
    ]);
  });

  it('mantém caches independentes por episódio', async () => {
    await useCase.execute({ episode: 1 });
    await useCase.execute({ episode: 2 });

    expect(gateway.calls.findEpisode).toBe(2);
  });

  it('normaliza a chave de cache entre string e número', async () => {
    await useCase.execute({ episode: 1 });
    const result = await useCase.execute({ episode: '1' });

    expect(result.meta.source).toBe('cache');
    expect(gateway.calls.findEpisode).toBe(1);
  });

  it('volta à origem quando o cache está desabilitado', async () => {
    const withoutCache = new GetEpisodeCastUseCase(gateway, new NoOpCacheStore());

    await withoutCache.execute({ episode: 1 });
    await withoutCache.execute({ episode: 1 });

    expect(gateway.calls.findEpisode).toBe(2);
  });

  it('rejeita número de episódio inválido antes de chamar a origem', async () => {
    await expect(useCase.execute({ episode: 'abc' })).rejects.toThrow(InvalidEpisodeNumberError);
    expect(gateway.calls.findEpisode).toBe(0);
  });

  it('propaga episódio inexistente', async () => {
    await expect(useCase.execute({ episode: 999 })).rejects.toThrow(EpisodeNotFoundError);
  });

  it('não cacheia falhas', async () => {
    await expect(useCase.execute({ episode: 999 })).rejects.toThrow(EpisodeNotFoundError);
    await expect(useCase.execute({ episode: 999 })).rejects.toThrow(EpisodeNotFoundError);

    expect(gateway.calls.findEpisode).toBe(2);
  });
});

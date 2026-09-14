import { beforeEach, describe, expect, it } from 'vitest';
import {
  GetCharacterAppearancesUseCase,
  InMemoryCacheStore,
  InvalidEpisodeNumberError,
} from '../src/index.ts';
import { InMemoryEpisodeGateway, makeCharacter, makeEpisodeRecord } from '../src/testing/index.ts';

describe('GetCharacterAppearancesUseCase', () => {
  let gateway: InMemoryEpisodeGateway;
  let useCase: GetCharacterAppearancesUseCase;

  beforeEach(() => {
    gateway = new InMemoryEpisodeGateway({
      episodes: [
        makeEpisodeRecord({ number: 1, code: 'S01E01', characterIds: [1, 2] }),
        makeEpisodeRecord({ number: 2, code: 'S01E02', characterIds: [1] }),
        makeEpisodeRecord({ number: 3, code: 'S01E03', characterIds: [2] }),
      ],
      characters: [makeCharacter({ id: 1 }), makeCharacter({ id: 2 })],
    });
    useCase = new GetCharacterAppearancesUseCase(gateway, new InMemoryCacheStore());
  });

  it('lista os episódios em que o personagem aparece', async () => {
    const result = await useCase.execute({ characterId: 1 });

    expect(result.characterId).toBe(1);
    expect(result.episodes.map((episode) => episode.code)).toEqual(['S01E01', 'S01E02']);
  });

  it('devolve lista vazia para personagem sem aparições', async () => {
    const result = await useCase.execute({ characterId: 99 });

    expect(result.episodes).toEqual([]);
  });

  it('aceita id vindo como texto de parâmetro de rota', async () => {
    const result = await useCase.execute({ characterId: '2' });

    expect(result.episodes.map((episode) => episode.code)).toEqual(['S01E01', 'S01E03']);
  });

  it('serve a segunda consulta a partir do cache', async () => {
    await useCase.execute({ characterId: 1 });
    await useCase.execute({ characterId: 1 });

    expect(gateway.calls.findCharacterAppearances).toBe(1);
  });

  it.each(['abc', '0', '-5', '', null, undefined, 1.5])('rejeita id inválido %s', async (id) => {
    await expect(useCase.execute({ characterId: id })).rejects.toThrow(InvalidEpisodeNumberError);
  });
});

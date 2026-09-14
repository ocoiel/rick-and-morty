import { describe, expect, it } from 'vitest';
import { EpisodeNotFoundError, EpisodeNumber, SnapshotGateway } from '../src/index.js';
import type { CatalogSnapshot } from '../src/index.js';
import { makeCharacter, makeEpisodeRecord } from '../src/testing/index.js';

const snapshot: CatalogSnapshot = {
  generatedAt: '2026-09-14T00:00:00.000Z',
  episodes: [
    makeEpisodeRecord({ number: 1, code: 'S01E01', characterIds: [1, 2] }),
    makeEpisodeRecord({ number: 2, name: 'Lawnmower Dog', code: 'S01E02', characterIds: [1] }),
  ],
  characters: [
    makeCharacter({ id: 1, name: 'Rick Sanchez' }),
    makeCharacter({ id: 2, name: 'Morty Smith' }),
  ],
};

const gateway = new SnapshotGateway(snapshot);

describe('SnapshotGateway', () => {
  it('resolve um episódio do catálogo', async () => {
    const episode = await gateway.findEpisode(EpisodeNumber.create(1));

    expect(episode.code).toBe('S01E01');
  });

  it('rejeita episódio ausente do catálogo com erro de domínio', async () => {
    await expect(gateway.findEpisode(EpisodeNumber.create(99))).rejects.toThrow(
      EpisodeNotFoundError,
    );
  });

  it('resolve personagens por identificador', async () => {
    const characters = await gateway.findCharactersByIds([2, 1]);

    expect(characters.map((character) => character.name)).toEqual(['Morty Smith', 'Rick Sanchez']);
  });

  it('ignora identificadores ausentes em vez de falhar', async () => {
    await expect(gateway.findCharactersByIds([1, 9999])).resolves.toHaveLength(1);
  });

  it('deriva as aparições do personagem a partir dos episódios', async () => {
    await expect(gateway.findCharacterAppearances(1)).resolves.toEqual([
      { number: 1, code: 'S01E01', name: 'Pilot' },
      { number: 2, code: 'S01E02', name: 'Lawnmower Dog' },
    ]);
  });

  it('devolve aparições vazias para personagem desconhecido', async () => {
    await expect(gateway.findCharacterAppearances(9999)).resolves.toEqual([]);
  });

  it('lista os números de episódio em ordem', async () => {
    await expect(gateway.listEpisodeNumbers()).resolves.toEqual([1, 2]);
  });

  it('reconhece um catálogo vazio, para permitir recuo à origem', () => {
    const vazio = new SnapshotGateway({ generatedAt: '', episodes: [], characters: [] });

    expect(vazio.isEmpty).toBe(true);
    expect(gateway.isEmpty).toBe(false);
  });
});

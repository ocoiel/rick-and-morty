import type { Character, EpisodeNumber } from '../domain/index.ts';
import { EpisodeNotFoundError } from '../domain/index.ts';
import type {
  CharacterGateway,
  EpisodeAppearance,
  EpisodeGateway,
  EpisodeRecord,
} from '../application/ports/index.ts';

export interface InMemoryEpisodeGatewaySeed {
  readonly episodes: readonly EpisodeRecord[];
  readonly characters: readonly Character[];
}

export class InMemoryEpisodeGateway implements EpisodeGateway, CharacterGateway {
  readonly calls = {
    findEpisode: 0,
    findCharactersByIds: 0,
    listEpisodeNumbers: 0,
    findCharacterAppearances: 0,
  };

  private readonly episodes: Map<number, EpisodeRecord>;
  private readonly characters: Map<number, Character>;

  constructor(seed: InMemoryEpisodeGatewaySeed) {
    this.episodes = new Map(seed.episodes.map((episode) => [episode.number, episode]));
    this.characters = new Map(seed.characters.map((character) => [character.id, character]));
  }

  findEpisode(episodeNumber: EpisodeNumber): Promise<EpisodeRecord> {
    this.calls.findEpisode += 1;

    const episode = this.episodes.get(episodeNumber.value);
    if (!episode) {
      return Promise.reject(new EpisodeNotFoundError(episodeNumber.value));
    }

    return Promise.resolve(episode);
  }

  findCharactersByIds(ids: readonly number[]): Promise<readonly Character[]> {
    this.calls.findCharactersByIds += 1;

    const found = ids
      .map((id) => this.characters.get(id))
      .filter((character): character is Character => character !== undefined);

    return Promise.resolve(found);
  }

  findCharacterAppearances(characterId: number): Promise<readonly EpisodeAppearance[]> {
    this.calls.findCharacterAppearances += 1;

    const appearances = [...this.episodes.values()]
      .filter((episode) => episode.characterIds.includes(characterId))
      .map((episode) => ({ number: episode.number, code: episode.code, name: episode.name }));

    return Promise.resolve(appearances);
  }

  listEpisodeNumbers(): Promise<readonly number[]> {
    this.calls.listEpisodeNumbers += 1;
    return Promise.resolve([...this.episodes.keys()].toSorted((a, b) => a - b));
  }
}
